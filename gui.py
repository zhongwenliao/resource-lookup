#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""钻潜交易体系·本地可视化界面（零第三方依赖，纯标准库）

用 http.server 在本机起服务，内嵌单页应用，与 zuanqian.py 共用同一套规则引擎，
并整合项目全部功能：
  - 信号扫描：输入代码/名称，查看最近3个交易日止盈止损位，一键导出CSV
  - 回测分析：K线买卖点图（箱体/EMA/止损止盈线）、权益曲线、交易明细、统计卡片
  - 行情监控：自选股实时行情与持仓盈亏（stock.py），可自动刷新、查看个股详情，
    15:00 后一键把当日收盘记录追加到 src/*.md（幂等，已有当日记录自动跳过）
  - 全市场选股：东财列表+腾讯日K多线程扫描（screener.py），突破信号/预备箱体
    两种模式，后台线程执行、进度条实时反馈，结果可导出CSV、一键转回测
  - 超短线：情绪周期择时（涨停池/炸板率/昨日涨停表现）+ 隔日候选
    （A 首板排板 / B 尾盘强势）+ 次日卖出预案（duanxian.py）

用法:
  python gui.py                # 启动后自动打开浏览器（默认 http://127.0.0.1:8666）
  python gui.py --port 9000    # 指定端口
仅供学习研究，不构成投资建议。
"""
import argparse
import io
import json
import re
import threading
import webbrowser
from typing import Any
from concurrent.futures import ThreadPoolExecutor, as_completed
from contextlib import redirect_stdout
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

import dapan
import daily
import duanxian
from screener import (MIN_BARS, base_filter, eval_one, fetch_universe,
                      fetch_universe_tencent, sizing)
from stock import (fetch_quotes, fmt_time, load_holdings, resolve_symbol,
                   sync_daily_entries)
from zuanqian import (check_signal, compute_indicators, ema_series, enable_ansi,
                      fetch_kline, find_box, load_config,
                      resolve_targets, run_backtest, scan_symbol, summarize,
                      watchlist)
import value

# 与 zuanqian.py / screener.py 默认参数保持一致（界面可覆盖部分）
DEFAULTS = dict(days=600, capital=1_000_000, risk=1.0, commission=0.0003,
                stamp=0.0005, ema_trend=60, weekly_ema=8, box_min=6, box_max=25,
                box_atr=3.0, body_atr=1.0, vol_mult=1.5, atr_max=7.0,
                chase_atr=1.0, tp1=2.0, tp2=3.0, stop_buffer=0.2,
                min_stop_atr=1.0, max_stop_pct=12.0, max_hold=60, cooldown=5,
                watch_dist=3.0,
                # screener.py 选股参数
                watch=False, lookback=1, klines=180, workers=12, top=40,
                min_amount=2000.0, min_cap=0.0, min_price=2.0, max_price=0.0,
                min_chg=0.0, include_bj=False)


def make_params(**over):
    vals = dict(DEFAULTS)
    vals.update(over)
    return argparse.Namespace(**vals)


def _num(q, key, default, lo, hi):
    v = (q.get(key) or [None])[0]
    try:
        x = float(v)
    except (TypeError, ValueError):
        return default
    if x != x:  # NaN
        return default
    return min(max(x, lo), hi)


def params_from_q(q):
    return make_params(
        days=int(_num(q, "days", 600, 120, 800)),
        capital=_num(q, "capital", 1_000_000, 10_000, 1e10),
        risk=_num(q, "risk", 1.0, 0.05, 20),
        tp1=_num(q, "tp1", 2.0, 0.5, 10),
        tp2=_num(q, "tp2", 3.0, 0.5, 20),
        max_stop_pct=_num(q, "max_stop_pct", 12.0, 1, 50),
    )


def split_tokens(raw):
    """把用户输入按中英文逗号/分号/顿号/空格拆成标的列表。"""
    for ch in ("，", "；", ";", "、", " "):
        raw = raw.replace(ch, ",")
    return [t.strip() for t in raw.split(",") if t.strip()]


def parse_codes(q):
    return resolve_targets(split_tokens((q.get("codes") or [""])[0]),
                           load_config())[:20]


# ---------------------------------------------------------------- API 实现

def api_scan(q):
    p = params_from_q(q)
    rows = []
    for name, sym in parse_codes(q):
        if not sym:
            rows.append({"名称": name, "代码": "-", "状态": "未找到",
                         "说明": "无法识别，可在 stocks.json 补充映射"})
            continue
        rows.append(scan_symbol(name, sym, p))
    return {"rows": rows}


def build_backtest(name, symbol, bars, p, warm):
    ind = compute_indicators(bars, p)
    trades, eq, skipped = run_backtest(symbol, bars, ind, p)
    st = summarize(trades, eq, bars, warm, p, skipped)
    if st["pf"] == float("inf"):
        st["pf"] = None
    idx = {b["date"]: i for i, b in enumerate(bars)}
    for t in trades:
        t["entry_i"] = idx.get(t["entry_date"], -1)
        t["exit_i"] = idx.get(t["exit_date"], -1)
    n = len(bars)
    box_seq, signals = [], []
    bought = {t["entry_i"] - 1 for t in trades}
    for j in range(warm, n):
        atr = ind["atr"][j]
        box = find_box(bars, atr, j, p) if atr else None
        box_seq.append([round(box[0], 4), round(box[1], 4)] if box else None)
        sig, _ = check_signal(bars, ind, j, p)
        if sig and j not in bought:
            signals.append({"i": j, "date": bars[j]["date"],
                            "box_high": round(sig["box_high"], 2),
                            "box_low": round(sig["box_low"], 2), "L": sig["L"]})
    rnd = lambda arr: [None if v is None else round(v, 4) for v in arr]
    return {
        "name": name, "symbol": symbol, "stats": st, "warm": warm,
        "bars": bars,
        "ema_exit": rnd(ind["ema_exit"]),
        "ema_trend": rnd(ema_series([b["close"] for b in bars], p.ema_trend)),
        "vol_ma": rnd(ind["vol_ma"]),
        "box_seq": box_seq, "signals": signals,
        "equity": [round(v, 2) for v in eq],
        "trades": trades,
    }


def api_backtest(q):
    p = params_from_q(q)
    warm = max(p.ema_trend + 10, 70)
    results = []
    for name, sym in parse_codes(q):
        if not sym:
            results.append({"name": name, "error": "无法识别的代码或名称"})
            continue
        try:
            bars = fetch_kline(sym, p.days)
        except OSError as e:
            results.append({"name": name, "symbol": sym, "error": str(e)})
            continue
        if len(bars) < warm + 30:
            results.append({"name": name, "symbol": sym,
                            "error": f"数据不足（仅{len(bars)}根K线）"})
            continue
        results.append(build_backtest(name, sym, bars, p, warm))
    return {"results": results}


def api_search(q):
    s = ((q.get("q") or [""])[0]).strip().lower()
    if not s:
        return {"items": []}
    out = []
    for name, code in load_config().items():
        if s in name.lower() or s in code:
            out.append({"name": name, "code": code})
        if len(out) >= 12:
            break
    return {"items": out}


def api_watchlist():
    return {"items": [{"name": n, "symbol": s} for n, s in watchlist(load_config())]}


# ------------------------------------------------- 行情监控（整合 stock.py）

ANSI_RE = re.compile(r"\033\[[0-9;]*m")
SYNC_LOCK = threading.Lock()  # redirect_stdout 非线程安全，同步操作串行化


def api_holdings():
    """自选股实时行情与持仓盈亏（src/*.md 文件名 + 首行成本价口径）。"""
    config = load_config()
    holdings = load_holdings(config)
    quotes = fetch_quotes([h["symbol"] for h in holdings if h["symbol"]])
    items = []
    for h in holdings:
        q = quotes.get(h["symbol"])
        if not h["symbol"]:
            items.append({"名称": h["name"], "代码": "-", "状态": "未匹配代码，可在 stocks.json 补充"})
            continue
        if not q:
            items.append({"名称": h["name"], "代码": h["symbol"], "状态": "暂无行情数据"})
            continue
        pnl = (q["price"] / h["cost"] - 1) * 100 if h["cost"] else None
        items.append({
            "名称": q["name"], "代码": q["symbol"], "状态": "",
            "现价": q["price"], "成本": h["cost"],
            "盈亏%": round(pnl, 2) if pnl is not None else "",
            "涨跌%": q["pct"], "换手%": q["turnover"],
            "成交额(万)": q["amount"], "行情时间": fmt_time(q["time"]),
        })
    return {"items": items}


def api_quotes(q):
    """指定标的的实时行情详情（名称经 stocks.json，未收录时腾讯搜索兜底）。"""
    tokens = split_tokens((q.get("codes") or [""])[0])[:20]
    config = load_config()
    symbols, unresolved = [], []
    for t in tokens:
        sym = resolve_symbol(t, config)
        if sym:
            symbols.append(sym)
        else:
            unresolved.append(t)
    symbols = list(dict.fromkeys(symbols))
    quotes = fetch_quotes(symbols)
    items = []
    for s in symbols:
        d = quotes.get(s)
        if not d:
            items.append({"名称": s, "代码": s, "状态": "未获取到行情（代码可能无效或已退市）"})
            continue
        items.append({
            "名称": d["name"], "代码": d["symbol"], "状态": "",
            "现价": d["price"], "涨跌": d["change"], "涨跌%": d["pct"],
            "今开": d["open"], "昨收": d["prev_close"],
            "最高": d["high"], "最低": d["low"],
            "成交量(手)": d["volume"], "成交额(万)": d["amount"],
            "换手%": d["turnover"], "振幅%": d["amplitude"],
            "市盈率TTM": d["pe"], "市净率": d["pb"],
            "流通市值(亿)": d["float_mv"], "总市值(亿)": d["total_mv"],
            "涨停价": d["limit_up"], "跌停价": d["limit_down"],
            "行情时间": fmt_time(d["time"]),
        })
    for t in unresolved:
        items.append({"名称": t, "代码": "-", "状态": "未找到，可在 stocks.json 补充映射"})
    return {"items": items}


def api_sync():
    """把当日收盘记录追加到 src/*.md（stock.py 既有逻辑，幂等：已有当日记录自动跳过）。"""
    buf = io.StringIO()
    with SYNC_LOCK, redirect_stdout(buf):
        try:
            sync_daily_entries(load_config())
        except Exception as e:  # 单只失败在函数内部已跳过，这里兜底整体异常
            buf.write(f"同步失败: {type(e).__name__}: {e}")
    out = ANSI_RE.sub("", buf.getvalue()).strip()
    return {"output": out or "没有需要同步的内容"}


def api_dapan():
    """五大指数最新状态（dapan.collect_rows，复盘先看大盘）。"""
    rows, asof = dapan.collect_rows()
    return {"asof": asof, "rows": rows}


def api_dapan_sync():
    """把指数收盘记录补齐/追加到 src/大盘/*.md（dapan.py 逻辑，幂等）。"""
    buf = io.StringIO()
    with SYNC_LOCK, redirect_stdout(buf):
        try:
            dapan.sync_all()
        except Exception as e:  # 单只失败在函数内部已跳过，这里兜底整体异常
            buf.write(f"同步失败: {type(e).__name__}: {e}")
    out = ANSI_RE.sub("", buf.getvalue()).strip()
    return {"output": out or "没有需要同步的内容"}


def api_value(q):
    """价值投资分析（value.py：估值硬模型 + 安全边际）。"""
    token = (q.get("symbol") or [""])[0].strip()
    if not token:
        raise ValueError("缺少标的参数 symbol（6 位代码或名称）")
    res = value.analyze(token)
    return {"report": res["report"], "name": res["name"], "price": res["price"]}


def api_daily():
    """每日分析报告（daily.py：大盘+持仓+候选股+执行价位+条件单，写入 reports/）。"""
    text, csv_path = daily.build_report()
    return {"report": text, "csv": csv_path.name if csv_path else ""}


# ------------------------------------------------- 全市场选股（整合 screener.py）

SCREENER_STATE: dict[str, Any] = {"running": False, "phase": "", "done": 0,
                                  "total": 0, "scope": "", "mode": "",
                                  "result": None, "error": None}


def _signal_row(item, d, p):
    """突破信号 -> 中文字段行（与 screener.save_csv 列口径一致）。"""
    shares, pct = sizing(d["close"], d["dist"], p)
    return {
        "代码": item["code"], "名称": item["name"], "行业": item["industry"],
        "信号日": d["date"], "收盘": round(d["close"], 2),
        "涨幅%": round(d["chg"], 2), "ATR%": round(d["atr_pct"], 2),
        "量比": round(d["vol_ratio"], 2),
        "箱体低": round(d["box_low"], 2), "箱体高": round(d["box_high"], 2),
        "箱体K线数": d["L"], "止损": round(d["stop"], 2),
        "止盈1": round(d["tp1"], 2), "止盈2": round(d["tp2"], 2),
        "建议股数": shares if shares >= 100 else "",
        "仓位%": round(pct, 1) if shares >= 100 else "",
    }


def _watch_row(item, d):
    """预备箱体 -> 中文字段行。"""
    return {
        "代码": item["code"], "名称": item["name"], "行业": item["industry"],
        "日期": d["date"], "收盘": round(d["close"], 2),
        "触发价": round(d["trigger"], 2), "距触发%": round(d["dist_pct"], 1),
        "ATR%": round(d["atr_pct"], 2),
        "箱体低": round(d["box_low"], 2), "箱体高": round(d["box_high"], 2),
        "箱体K线数": d["L"],
    }


def _screener_worker(p):
    """后台线程：拉列表 -> 预筛 -> 多线程逐只检查 -> 排序截取（screener.main 流程）。"""
    st = SCREENER_STATE
    try:
        st["phase"] = "准备标的列表"
        if p.targets:
            config = load_config()
            items = []
            for name, sym in resolve_targets(p.targets, config):
                if not sym:
                    continue
                items.append({"code": sym[2:], "name": name, "symbol": sym,
                              "industry": "-", "price": None, "chg": None,
                              "amount": None, "float_mv": None})
            scope = f"指定标的 {len(items)} 只"
        else:
            st["phase"] = "拉取全市场列表（东财）"
            universe = None
            try:
                universe = fetch_universe(p.include_bj)
                if not universe:
                    raise OSError("东财返回空列表")
            except (OSError, ValueError):
                universe = None
            if universe is None:
                st["phase"] = "东财不可用，切换腾讯备用列表"
                universe = fetch_universe_tencent()
            items = [u for u in universe if base_filter(u, p)]
            scope = f"全市场 {len(universe)} 只 → 预筛 {len(items)} 只"
        if not items:
            st["scope"] = scope
            st["error"] = "没有符合条件的标的（可放宽预筛条件，或检查网络）"
            return
        st.update(total=len(items), scope=scope, phase="逐只检查日K信号")
        counters = {"fail": 0, "short": 0, "wide": 0}
        signals, watches = [], []
        klines = max(MIN_BARS + 60, min(p.klines, 800))
        workers = max(1, min(p.workers, 64))
        with ThreadPoolExecutor(max_workers=workers) as ex:
            futs = [ex.submit(eval_one, it, p, klines) for it in items]
            for fut in as_completed(futs):
                kind, item, payload = fut.result()
                if kind == "signal":
                    signals.append((item, payload))
                elif kind == "watch":
                    watches.append((item, payload))
                elif kind in counters:
                    counters[kind] += 1
                st["done"] += 1
        if p.watch:
            watches.sort(key=lambda x: x[1]["dist_pct"])
            hits = watches[: max(0, p.top)]
            rows = [_watch_row(it, d) for it, d in hits]
            mode = "预备箱体"
        else:
            signals.sort(key=lambda x: (-x[1]["vol_ratio"], -x[1]["chg"]))
            hits = signals[: max(0, p.top)]
            rows = [_signal_row(it, d, p) for it, d in hits]
            mode = "突破信号"
        extra = []
        if counters["short"]:
            extra.append(f"数据不足 {counters['short']}")
        if counters["fail"]:
            extra.append(f"失败 {counters['fail']}")
        if counters["wide"]:
            extra.append(f"止损过宽剔除 {counters['wide']}")
        st["result"] = {
            "rows": rows, "mode": mode, "scope": scope,
            "total_hits": len(watches) if p.watch else len(signals),
            "note": "；".join(extra),
            "hint": "盘中运行时最后一根K线为实时快照，收盘前信号可能变化，建议收盘后运行",
        }
    except Exception as e:  # 任何异常都落到状态里，由前端展示
        st["error"] = f"{type(e).__name__}: {e}"
    finally:
        st["running"] = False
        st["phase"] = "完成"


def api_screener_start(q):
    """启动一次选股扫描（后台线程，立即返回）。顶部输入框有内容时只查指定标的。"""
    st = SCREENER_STATE
    if st["running"]:
        return {"started": False, "msg": "已有扫描在进行中，请稍候"}
    p = make_params(
        watch=(q.get("watch") or ["0"])[0] in ("1", "true", "on"),
        lookback=int(_num(q, "lookback", 1, 1, 10)),
        klines=int(_num(q, "klines", 180, 180, 800)),
        workers=int(_num(q, "workers", 12, 1, 64)),
        top=int(_num(q, "top", 40, 1, 200)),
        min_amount=_num(q, "min_amount", 2000.0, 0, 1e9),
        min_cap=_num(q, "min_cap", 0.0, 0, 1e6),
        min_price=_num(q, "min_price", 2.0, 0, 1e6),
        max_price=_num(q, "max_price", 0.0, 0, 1e6),
        min_chg=_num(q, "min_chg", 0.0, -20, 20),
        include_bj=(q.get("include_bj") or ["0"])[0] in ("1", "true", "on"),
        capital=_num(q, "capital", 1_000_000, 10_000, 1e10),
        risk=_num(q, "risk", 1.0, 0.05, 20),
        # 止盈止损与信号扫描共用顶部参数栏
        tp1=_num(q, "tp1", 2.0, 0.5, 10),
        tp2=_num(q, "tp2", 3.0, 0.5, 20),
        max_stop_pct=_num(q, "max_stop_pct", 12.0, 1, 50),
    )
    p.targets = split_tokens((q.get("codes") or [""])[0])[:50]
    st.update(running=True, phase="启动", done=0, total=0, scope="", mode="",
              result=None, error=None)
    threading.Thread(target=_screener_worker, args=(p,), daemon=True).start()
    return {"started": True}


def api_screener_progress():
    """轮询扫描进度；完成后附带结果（保留到下次启动前）。"""
    st = SCREENER_STATE
    out = {"running": st["running"], "phase": st["phase"], "done": st["done"],
           "total": st["total"], "scope": st["scope"], "mode": st["mode"],
           "error": st["error"]}
    if not st["running"] and st["result"] is not None:
        out["result"] = st["result"]
    return out


# ---------------------------------------------------------------- 隔日超短线

DX_STATE: dict[str, Any] = {"running": False, "phase": "", "done": 0, "total": 0,
                            "result": None, "error": None}


def _dx_worker(date):
    """后台线程：情绪周期 + 隔日候选（duanxian.scan，约 15~45 秒视网络）。"""
    st = DX_STATE
    try:
        st["result"] = duanxian.scan(
            date=date or None, mode="all", top=30, workers=12,
            progress=lambda ph, d, t: st.update(phase=ph, done=d, total=t))
    except Exception as e:  # 兜底，避免线程静默死亡
        st["error"] = f"{type(e).__name__}: {e}"
    finally:
        st["running"] = False
        st["phase"] = "完成"


def api_duanxian_start(q):
    """启动超短线扫描（date 可选，YYYYMMDD，近 8 个交易日内复盘）。"""
    if DX_STATE["running"]:
        return {"started": False, "error": "已有扫描在进行，请稍候"}
    date = ((q.get("date") or [""])[0] or "").strip().replace("-", "")
    if date and not (len(date) == 8 and date.isdigit()):
        return {"started": False, "error": "日期格式应为 YYYYMMDD"}
    DX_STATE.update(running=True, phase="启动", done=0, total=0,
                    result=None, error=None)
    threading.Thread(target=_dx_worker, args=(date,), daemon=True).start()
    return {"started": True}


def api_duanxian_progress():
    """轮询超短线扫描进度；完成后附带结果。"""
    st = DX_STATE
    out = {"running": st["running"], "phase": st["phase"], "done": st["done"],
           "total": st["total"], "error": st["error"]}
    if not st["running"] and st["result"] is not None:
        out["result"] = st["result"]
    return out


# ---------------------------------------------------------------- HTTP 服务

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):  # 静默访问日志
        pass

    def _send(self, code, body, ctype):
        data = body if isinstance(body, bytes) else body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def _json(self, obj, code=200):
        try:
            body = json.dumps(obj, ensure_ascii=False, allow_nan=False)
        except (TypeError, ValueError) as e:
            body = json.dumps({"error": f"序列化失败: {e}"})
            code = 500
        self._send(code, body, "application/json; charset=utf-8")

    def do_GET(self):
        u = urlparse(self.path)
        q = parse_qs(u.query)
        try:
            if u.path in ("/", "/index.html"):
                self._send(200, PAGE_HTML, "text/html; charset=utf-8")
            elif u.path == "/api/scan":
                self._json(api_scan(q))
            elif u.path == "/api/backtest":
                self._json(api_backtest(q))
            elif u.path == "/api/search":
                self._json(api_search(q))
            elif u.path == "/api/watchlist":
                self._json(api_watchlist())
            elif u.path == "/api/holdings":
                self._json(api_holdings())
            elif u.path == "/api/quotes":
                self._json(api_quotes(q))
            elif u.path == "/api/sync":
                self._json(api_sync())
            elif u.path == "/api/dapan":
                self._json(api_dapan())
            elif u.path == "/api/dapan/sync":
                self._json(api_dapan_sync())
            elif u.path == "/api/value":
                self._json(api_value(q))
            elif u.path == "/api/daily":
                self._json(api_daily())
            elif u.path == "/api/screener":
                self._json(api_screener_start(q))
            elif u.path == "/api/screener/progress":
                self._json(api_screener_progress())
            elif u.path == "/api/duanxian":
                self._json(api_duanxian_start(q))
            elif u.path == "/api/duanxian/progress":
                self._json(api_duanxian_progress())
            else:
                self._json({"error": "not found"}, 404)
        except (BrokenPipeError, ConnectionResetError):
            pass
        except Exception as e:  # 任何异常都以 JSON 返回，前端可提示
            try:
                self._json({"error": f"{type(e).__name__}: {e}"}, 500)
            except OSError:
                pass


# ---------------------------------------------------------------- 内嵌页面
# JS 分三段注入：__JS1__（工具/扫描/回测渲染）、__JS2__（K线图/权益曲线/初始化）、
# __JS3__（行情监控/收盘同步/全市场选股）

PAGE_HTML = r"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>钻潜 · 可视化</title>
<style>
:root{
  --bg:#0b0f14; --panel:#11161d; --panel2:#151c25; --border:#1f2733;
  --text:#d7dde6; --dim:#8b98a9; --accent:#e8b339; --up:#f0524f; --dn:#2ebd85;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);
  font:14px/1.5 "Segoe UI","Microsoft YaHei",system-ui,sans-serif;
  font-variant-numeric:tabular-nums}
header{display:flex;align-items:center;gap:10px;flex-wrap:wrap;
  padding:12px 18px;border-bottom:1px solid var(--border);background:var(--panel)}
.brand{font-size:18px;font-weight:700;letter-spacing:1px;margin-right:6px}
.brand span{color:var(--accent);font-weight:400}
#codes{width:340px;max-width:44vw;background:var(--panel2);border:1px solid var(--border);
  color:var(--text);border-radius:8px;padding:8px 12px;outline:none}
#codes:focus{border-color:var(--accent)}
button{cursor:pointer;border:1px solid var(--border);background:var(--panel2);
  color:var(--text);border-radius:8px;padding:8px 14px;font-size:13px;transition:.15s}
button:hover:not(:disabled){border-color:var(--accent);color:var(--accent)}
button.primary{background:var(--accent);border-color:var(--accent);color:#151515;font-weight:600}
button.primary:hover:not(:disabled){filter:brightness(1.1);color:#151515}
button:disabled{opacity:.5;cursor:wait}
button.small{padding:4px 10px;font-size:12px}
.params{display:flex;gap:14px;flex-wrap:wrap;padding:8px 18px;
  border-bottom:1px solid var(--border);background:var(--panel);color:var(--dim);font-size:12px}
.params label{display:flex;align-items:center;gap:5px}
.params input{width:76px;background:var(--panel2);border:1px solid var(--border);
  color:var(--text);border-radius:6px;padding:3px 7px;outline:none;font-size:12px}
main{padding:14px 18px 40px;max-width:1280px;margin:0 auto}
.tabs{display:flex;gap:6px;margin-bottom:12px}
.tab{background:transparent;border:1px solid var(--border);color:var(--dim)}
.tab.active{background:var(--panel2);color:var(--accent);border-color:var(--accent)}
.pane-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.pane-head .meta{color:var(--dim);font-size:12px}
.empty{padding:60px 20px;text-align:center;color:var(--dim);
  border:1px dashed var(--border);border-radius:12px}
.card{background:var(--panel);border:1px solid var(--border);border-radius:12px;
  padding:14px;margin-bottom:14px;overflow:hidden}
.card h3{margin:0 0 10px;font-size:13px;color:var(--dim);font-weight:600}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}
.stat{background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:12px 14px}
.stat .k{color:var(--dim);font-size:12px}
.stat .v{font-size:20px;font-weight:700;margin-top:2px}
.stat .v.big{font-size:26px}
.up{color:var(--up)} .dn{color:var(--dn)}
.chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.chip{border:1px solid var(--border);border-radius:20px;padding:5px 14px;
  background:var(--panel);cursor:pointer;font-size:13px;color:var(--dim)}
.chip.active{border-color:var(--accent);color:var(--accent)}
.chip.err{border-color:#7a2e2e;color:#c66}
.table-wrap{overflow-x:auto}
.dx-head{display:flex;align-items:baseline;gap:18px;flex-wrap:wrap;margin-bottom:10px}
.dx-cycle{font-size:26px;font-weight:700;color:var(--accent)}
.dx-reasons{margin:8px 0 0;padding-left:18px;color:var(--dim);font-size:13px;line-height:1.9}
table{width:100%;border-collapse:collapse;font-size:13px}
th{color:var(--dim);font-weight:600;text-align:left;padding:7px 10px;
  border-bottom:1px solid var(--border);white-space:nowrap}
td{padding:7px 10px;border-bottom:1px solid #161d27;white-space:nowrap}
tbody tr:hover{background:#151c25}
.num{text-align:right}
.badge{display:inline-block;padding:2px 9px;border-radius:10px;font-size:12px}
.b-sig{background:rgba(240,82,79,.15);color:var(--up);border:1px solid rgba(240,82,79,.4)}
.b-watch{background:rgba(232,179,57,.12);color:var(--accent);border:1px solid rgba(232,179,57,.4)}
.b-none{background:#1a212b;color:var(--dim);border:1px solid var(--border)}
.b-err{background:rgba(240,82,79,.08);color:#c66;border:1px solid #4a2020}
.chart-box{position:relative}
.chart-box svg{display:block;width:100%;height:560px}
.chart-box.small svg{height:210px}
.hint{color:var(--dim);font-size:11px;text-align:right;margin-top:4px}
#tip{position:absolute;pointer-events:none;background:#0d1420ee;border:1px solid #2a3646;
  border-radius:8px;padding:8px 11px;font-size:12px;line-height:1.7;display:none;
  z-index:5;box-shadow:0 4px 16px #0009;white-space:nowrap}
#cross{position:absolute;top:0;bottom:0;width:0;border-left:1px dashed #4a5a70;
  pointer-events:none;display:none;z-index:4}
#toast{position:fixed;left:50%;bottom:30px;transform:translateX(-50%);background:#1c2430;
  border:1px solid var(--border);color:var(--text);padding:9px 18px;border-radius:10px;
  display:none;z-index:99;box-shadow:0 6px 20px #000a}
#toast.bad{border-color:#7a2e2e;color:#f2b8b5}
.legend{display:flex;gap:16px;flex-wrap:wrap;color:var(--dim);font-size:12px;margin-top:6px}
.legend i{display:inline-block;width:14px;height:3px;border-radius:2px;margin-right:5px;vertical-align:middle}
.prog{height:6px;background:var(--panel2);border-radius:3px;overflow:hidden;margin:10px 0 6px}
.prog-bar{height:100%;background:var(--accent);width:0;transition:width .3s}
.s-params{display:flex;gap:12px;flex-wrap:wrap;align-items:center;color:var(--dim);font-size:12px}
.s-params label{display:flex;align-items:center;gap:5px}
.s-params input[type=number]{width:72px;background:var(--panel2);border:1px solid var(--border);
  color:var(--text);border-radius:6px;padding:3px 7px;outline:none;font-size:12px}
.s-params select{background:var(--panel2);border:1px solid var(--border);color:var(--text);
  border-radius:6px;padding:3px 7px;outline:none;font-size:12px}
.kv{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.kv>div{background:var(--panel2);border:1px solid var(--border);border-radius:8px;padding:7px 10px}
.kv .k{color:var(--dim);font-size:11px}
.kv .v{font-size:14px;font-weight:600;margin-top:2px;word-break:break-all}
.sync-out{background:var(--panel2);border:1px solid var(--border);border-radius:8px;
  padding:10px 14px;font-size:12px;line-height:1.8;white-space:pre-wrap;color:var(--dim);
  max-height:260px;overflow:auto}
@media (max-width:900px){
  .stats{grid-template-columns:repeat(2,1fr)}
  #codes{width:100%;max-width:none}
  .chart-box svg{height:420px}
}
</style>
</head>
<body>
<header>
  <div class="brand">钻潜<span>·可视化</span></div>
  <input id="codes" list="dl" spellcheck="false"
    placeholder="代码或名称，多只用逗号分隔，如 300452, 中信证券">
  <datalist id="dl"></datalist>
  <button id="btn-scan" class="primary">信号扫描</button>
  <button id="btn-bt" class="primary">回测分析</button>
  <button id="btn-quote" class="primary">查行情</button>
  <button id="btn-watch" title="载入 src/ 自选股">载入自选</button>
</header>
<div class="params">
  <label>回测K线数 <input id="p-days" type="number" value="600" min="200" max="800" step="50"></label>
  <label>初始资金 <input id="p-cap" type="number" value="1000000" step="100000"></label>
  <label>单笔风险% <input id="p-risk" type="number" value="1.0" step="0.1" min="0.1"></label>
  <label>止盈1(R) <input id="p-tp1" type="number" value="2" step="0.5" min="0.5"></label>
  <label>止盈2(R) <input id="p-tp2" type="number" value="3" step="0.5" min="0.5"></label>
  <label>止损上限% <input id="p-msp" type="number" value="12" step="1" min="1"></label>
</div>
<main>
  <div class="tabs">
    <button class="tab active" data-tab="scan">信号扫描</button>
    <button class="tab" data-tab="bt">回测分析</button>
    <button class="tab" data-tab="quote">行情监控</button>
    <button class="tab" data-tab="screen">全市场选股</button>
    <button class="tab" data-tab="dx">超短线</button>
  </div>
  <section id="pane-scan">
    <div class="pane-head">
      <span class="meta" id="scan-meta"></span>
      <button id="btn-csv" class="small" disabled>导出 CSV</button>
    </div>
    <div id="scan-body" class="empty">输入标的，点「信号扫描」查看最近 3 个交易日的止盈止损位</div>
  </section>
  <section id="pane-bt" hidden>
    <div class="chips" id="bt-chips"></div>
    <div id="bt-body" class="empty">输入标的，点「回测分析」查看策略收益与买卖点</div>
  </section>
  <section id="pane-quote" hidden>
    <div class="pane-head">
      <span class="meta" id="quote-meta"></span>
      <div style="display:flex;gap:8px;align-items:center">
        <label style="color:var(--dim);font-size:12px;display:flex;align-items:center;gap:5px">
          自动刷新
          <select id="q-interval">
            <option value="0">关</option>
            <option value="5">5秒</option>
            <option value="15">15秒</option>
            <option value="30">30秒</option>
            <option value="60">60秒</option>
          </select>
        </label>
        <button id="btn-q-refresh" class="small">立即刷新</button>
        <button id="btn-sync" class="small" title="15:00 后把当日收盘记录追加到 src/*.md（幂等，可重复执行）">收盘同步</button>
        <button id="btn-dapan-sync" class="small" title="把指数收盘记录补齐/追加到 src/大盘/*.md（幂等，可重复执行）">大盘同步</button>
        <button id="btn-value" class="small" title="对输入框第一个标的做价值投资分析（估值模型+安全边际，value.py）">价值分析</button>
        <button id="btn-daily" class="small" title="生成每日分析报告：大盘+持仓+候选股+执行价位+条件单（写入 reports/，daily.py）">每日报告</button>
      </div>
    </div>
    <div id="dapan-body" class="empty">大盘指数载入中…</div>
    <div id="quote-body" class="empty">载入自选股行情…</div>
    <div id="quote-detail"></div>
    <div id="sync-out" style="margin-top:14px"></div>
  </section>
  <section id="pane-screen" hidden>
    <div class="card">
      <h3>扫描设置（顶部输入框有内容时只检查指定标的，留空为全市场；止损/止盈/股数按顶部参数栏计算）</h3>
      <div class="s-params">
        <label>模式
          <select id="s-watch">
            <option value="0">突破信号</option>
            <option value="1">预备箱体</option>
          </select>
        </label>
        <label>回看K线 <input id="s-lookback" type="number" value="1" min="1" max="10"></label>
        <label>成交额下限(万) <input id="s-amount" type="number" value="2000" min="0" step="500"></label>
        <label>涨幅下限% <input id="s-chg" type="number" value="0" step="0.5"></label>
        <label>股价下限 <input id="s-price" type="number" value="2" min="0" step="0.5"></label>
        <label>最多显示 <input id="s-top" type="number" value="40" min="1" max="200"></label>
        <label><input id="s-bj" type="checkbox" style="accent-color:var(--accent)"> 含北交所</label>
        <button id="btn-screen" class="primary">开始扫描</button>
      </div>
      <div class="prog" id="s-prog" hidden><div class="prog-bar" id="s-prog-bar"></div></div>
      <div style="color:var(--dim);font-size:12px" id="s-status"></div>
    </div>
    <div class="pane-head" id="s-res-head" hidden>
      <span class="meta" id="s-meta"></span>
      <button id="btn-scsv" class="small" disabled>导出 CSV</button>
    </div>
    <div id="screen-body" class="empty">点「开始扫描」运行全市场选股（约 1~2 分钟，视网络而定）；盘中最后一根K线为实时快照，收盘前信号可能变化</div>
  </section>
  <section id="pane-dx" hidden>
    <div class="card">
      <h3>隔日超短线（当天买、次日卖；情绪周期决定做不做——冰点/退潮建议空仓，不一定要每天操作）</h3>
      <div class="s-params">
        <label>日期 <input id="dx-date" type="date" title="留空=最新交易日；选历史日期为复盘模式（仅 A 首板可复盘）"></label>
        <button id="btn-dx" class="primary">开始扫描</button>
        <span class="meta" id="dx-status"></span>
      </div>
      <div class="meta" style="margin-top:6px">
        择时口径：涨停家数 / 最高连板 / 炸板率 / 跌停家数 / 昨日涨停股今日表现（接力赚钱效应）
        → 冰点·退潮·修复·启动·发酵·高潮；A=当日首板排板（次日冲高卖），B=尾盘强势（涨幅4~9.5%未涨停，尾盘买入次日卖）
      </div>
    </div>
    <div id="dx-senti" class="empty">尚未扫描。建议 14:30 后运行：B 模式用实时快照选尾盘标的，A 模式看当日首板准备次日排板</div>
    <div id="dx-out"></div>
  </section>
</main>
<div id="toast"></div>
<script>
"use strict";
__JS1__
__JS2__
__JS3__
__JS4__
</script>
</body>
</html>
"""


# ---------------------------------------------------------------- 前端脚本 1
# 工具函数 / 信号扫描 / 回测渲染（K线图类在 JS2）

JS1 = r"""
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g,
  c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt = (v,d=2) => (v==null||v===""||isNaN(v)) ? "—" :
  Number(v).toLocaleString("zh-CN",{minimumFractionDigits:d,maximumFractionDigits:d});
const fmtI = v => (v==null||v===""||isNaN(v)) ? "—" : Number(v).toLocaleString("zh-CN");
const pctS = v => (v==null||isNaN(v)) ? "—" : (v>0?"+":"")+v.toFixed(2)+"%";
const cls = v => v>0?"up":v<0?"dn":"";
let toastTimer=null;
function toast(msg,bad){
  const t=$("#toast"); t.textContent=msg; t.className=bad?"bad":""; t.style.display="block";
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.style.display="none",3200);
}
async function api(path){
  const r = await fetch(path);
  const j = await r.json();
  if(j.error) throw new Error(j.error);
  return j;
}
function getParams(){
  return {days:$("#p-days").value, capital:$("#p-cap").value, risk:$("#p-risk").value,
          tp1:$("#p-tp1").value, tp2:$("#p-tp2").value, max_stop_pct:$("#p-msp").value};
}
const qs = o => Object.entries(o).map(([k,v])=>k+"="+encodeURIComponent(v)).join("&");
function busy(btn,on,txt){
  if(on){ btn.dataset.t=btn.textContent; btn.textContent=txt||"计算中…"; btn.disabled=true; }
  else { btn.textContent=btn.dataset.t||btn.textContent; btn.disabled=false; }
}
function switchTab(name){
  document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===name));
  $("#pane-scan").hidden = name!=="scan";
  $("#pane-bt").hidden = name!=="bt";
  $("#pane-quote").hidden = name!=="quote";
  $("#pane-screen").hidden = name!=="screen";
  $("#pane-dx").hidden = name!=="dx";
  if(name==="quote"){ loadHoldings(true); loadDapan(); }
}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));

/* ---------------- 信号扫描 ---------------- */
let scanRows=[];
const badge = s => {
  const m={"突破信号":"b-sig","预备箱体":"b-watch","无信号":"b-none"};
  return '<span class="badge '+(m[s]||"b-err")+'">'+esc(s||"—")+"</span>";
};
async function runScan(){
  const codes=$("#codes").value.trim();
  if(!codes){ toast("请先输入股票代码或名称",true); return; }
  const btn=$("#btn-scan"); busy(btn,true,"扫描中…");
  try{
    const j=await api("api/scan?"+qs({...getParams(),codes}));
    scanRows=j.rows||[];
    renderScan();
    switchTab("scan");
  }catch(e){ toast("扫描失败: "+e.message,true); }
  finally{ busy(btn,false); }
}
function renderScan(){
  const box=$("#scan-body");
  $("#btn-csv").disabled = !scanRows.length;
  $("#scan-meta").textContent = "最近3个交易日 · "+scanRows.length+" 个标的";
  if(!scanRows.length){ box.className="empty"; box.textContent="没有结果"; return; }
  let h='<div class="card"><div class="table-wrap"><table><thead><tr>'+
    "<th>名称/代码</th><th>状态</th><th class='num'>收盘</th><th class='num'>触发价</th>"+
    "<th>箱体</th><th class='num'>止损价</th><th class='num'>止盈1</th><th class='num'>止盈2</th>"+
    "<th class='num'>止损距离%</th><th class='num'>建议股数</th><th class='num'>仓位%</th>"+
    "<th>说明</th><th></th></tr></thead><tbody>";
  for(const r of scanRows){
    const boxTxt = r["箱体下沿"]!=="" ?
      fmt(r["箱体下沿"])+" ~ "+fmt(r["箱体上沿"])+" ("+r["箱体根数"]+"根)" : "—";
    h+="<tr><td><b>"+esc(r["名称"])+"</b> <span style='color:var(--dim)'>"+esc(r["代码"])+"</span></td>"+
      "<td>"+badge(r["状态"])+"</td>"+
      "<td class='num'>"+fmt(r["收盘价"])+"</td>"+
      "<td class='num'>"+fmt(r["触发价"])+"</td>"+
      "<td>"+boxTxt+"</td>"+
      "<td class='num dn'>"+fmt(r["止损价"])+"</td>"+
      "<td class='num up'>"+fmt(r["止盈1价"])+"</td>"+
      "<td class='num up'>"+fmt(r["止盈2价"])+"</td>"+
      "<td class='num'>"+(r["止损距离%"]!==""?r["止损距离%"]+"%":"—")+"</td>"+
      "<td class='num'>"+fmtI(r["建议股数"])+"</td>"+
      "<td class='num'>"+(r["仓位%"]!==""?r["仓位%"]+"%":"—")+"</td>"+
      "<td style='color:var(--dim)'>"+esc(r["说明"]||"")+"</td>"+
      "<td>"+(r["代码"]&&r["代码"]!=="-"?'<button class="small" data-bt="'+esc(r["代码"])+'">回测</button>':"")+"</td></tr>";
  }
  h+="</tbody></table></div></div>";
  box.className=""; box.innerHTML=h;
  box.querySelectorAll("[data-bt]").forEach(b=>b.onclick=ev=>{
    ev.stopPropagation(); $("#codes").value=b.dataset.bt; runBacktest();
  });
}
function exportCsv(rows,name){
  if(!rows||!rows.length){ toast("没有可导出的数据",true); return; }
  const cols=Object.keys(rows[0]);
  const esc2=v=>{v=v==null?"":String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;};
  const csv="\ufeff"+cols.join(",")+"\r\n"+
    rows.map(r=>cols.map(c=>esc2(r[c])).join(",")).join("\r\n");
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
  a.download=name; a.click(); URL.revokeObjectURL(a.href);
}
$("#btn-csv").onclick=()=>exportCsv(scanRows,"止盈止损.csv");

/* ---------------- 回测分析 ---------------- */
let btResults=[], btCur=0, kchart=null;
async function runBacktest(){
  const codes=$("#codes").value.trim();
  if(!codes){ toast("请先输入股票代码或名称",true); return; }
  const btn=$("#btn-bt"); busy(btn,true,"回测中…");
  try{
    const j=await api("api/backtest?"+qs({...getParams(),codes}));
    btResults=j.results||[]; btCur=0;
    renderBt();
    switchTab("bt");
  }catch(e){ toast("回测失败: "+e.message,true); }
  finally{ busy(btn,false); }
}
function renderBt(){
  const chips=$("#bt-chips"), body=$("#bt-body");
  chips.innerHTML = btResults.map((r,i)=>
    '<span class="chip'+(i===btCur?" active":"")+(r.error?" err":"")+'" data-i="'+i+'">'+
    esc(r.name)+(r.error?" !":"")+"</span>").join("");
  chips.querySelectorAll(".chip").forEach(c=>c.onclick=()=>{btCur=+c.dataset.i;renderBt();});
  const r=btResults[btCur];
  if(!r){ body.className="empty"; body.textContent="没有结果"; return; }
  if(r.error){
    body.className=""; body.innerHTML='<div class="empty">'+esc(r.name+"："+r.error)+"</div>";
    return;
  }
  body.className="";
  body.innerHTML=
    '<div class="stats" id="bt-stats"></div>'+
    '<div class="card"><h3>K线 · 买卖点（'+esc(r.bars[r.warm].date)+" ~ "+
      esc(r.bars[r.bars.length-1].date)+"）</h3>"+
      '<div class="chart-box"><svg id="kchart"></svg><div id="cross"></div><div id="tip"></div></div>'+
      '<div class="legend">'+
        '<span><i style="background:#f0524f"></i>阳线 / 买入B</span>'+
        '<span><i style="background:#2ebd85"></i>阴线 / 卖出S</span>'+
        '<span><i style="background:#e8b339"></i>EMA20出场线</span>'+
        '<span><i style="background:#8f7ff0"></i>EMA趋势线</span>'+
        '<span><i style="background:#6ea8fe"></i>横盘箱体</span>'+
        '<span><i style="background:none;border-top:2px dotted #e8b339;height:0"></i>未成交信号</span>'+
      "</div>"+
      '<div class="hint">滚轮缩放 · 拖动平移 · 双击复位 · 悬停看明细</div></div>'+
    '<div class="card"><h3>权益曲线（策略 vs 买入持有，归一化）</h3>'+
      '<div class="chart-box small"><svg id="echart"></svg></div></div>'+
    '<div class="card"><h3>交易明细</h3><div id="trades"></div></div>';
  renderStats(r.stats);
  if(!kchart) kchart=new KChart($("#kchart"),$("#cross"),$("#tip"));
  kchart.setData(r);
  drawEquity($("#echart"),r);
  renderTrades(r.trades);
}
function renderStats(st){
  const pf = st.pf==null?"∞":st.pf.toFixed(2);
  const items=[
    ["总收益率",'<span class="v big '+cls(st.total_ret)+'">'+pctS(st.total_ret)+"</span>"],
    ["期末权益",'<span class="v">'+fmt(st.final,0)+"</span>"],
    ["最大回撤",'<span class="v dn">'+st.max_dd.toFixed(2)+"%</span>"],
    ["买入持有",'<span class="v '+cls(st.bench)+'">'+pctS(st.bench)+"</span>"],
    ["交易次数",'<span class="v">'+st.n+"</span>"],
    ["胜率",'<span class="v">'+st.win_rate.toFixed(1)+"%</span>"],
    ["平均R",'<span class="v '+cls(st.avg_r)+'">'+(st.avg_r>0?"+":"")+st.avg_r.toFixed(2)+"</span>"],
    ["盈亏比",'<span class="v">'+pf+"</span>"],
  ];
  $("#bt-stats").innerHTML=items.map(([k,v])=>
    '<div class="stat"><div class="k">'+k+"</div>"+v+"</div>").join("")+
    (st.skipped?'<div style="grid-column:1/-1;color:var(--dim);font-size:12px">跳过信号 '+
      st.skipped+" 个（止损过宽/资金不足）</div>":"");
}
function renderTrades(trades){
  const box=$("#trades");
  if(!trades||!trades.length){
    box.innerHTML='<div class="empty" style="padding:24px">区间内无成交信号</div>'; return;
  }
  let h='<div class="table-wrap"><table><thead><tr><th>#</th><th>买入日</th><th>卖出日</th>'+
    "<th class='num'>买入价</th><th class='num'>卖出价</th><th class='num'>股数</th>"+
    "<th class='num'>净盈亏</th><th class='num'>R</th><th class='num'>持仓天</th><th>出场原因</th></tr></thead><tbody>";
  trades.forEach((t,i)=>{
    h+="<tr><td>"+(i+1)+"</td><td>"+t.entry_date+"</td><td>"+t.exit_date+"</td>"+
      "<td class='num'>"+fmt(t.entry)+"</td><td class='num'>"+fmt(t.exit)+"</td>"+
      "<td class='num'>"+fmtI(t.shares)+"</td>"+
      "<td class='num "+cls(t.pnl)+"'>"+(t.pnl>0?"+":"")+fmt(t.pnl,0)+"</td>"+
      "<td class='num "+cls(t.r)+"'>"+(t.r>0?"+":"")+t.r.toFixed(2)+"</td>"+
      "<td class='num'>"+t.bars+"</td><td style='color:var(--dim)'>"+esc(t.note)+"</td></tr>";
  });
  h+="</tbody></table></div>"+
    '<div style="text-align:right;margin-top:8px"><button class="small" id="btn-tcsv">导出交易 CSV</button></div>';
  box.innerHTML=h;
  $("#btn-tcsv").onclick=()=>exportCsv(trades.map(t=>({
    "买入日":t.entry_date,"卖出日":t.exit_date,"买入价":t.entry,"卖出价":t.exit,
    "股数":t.shares,"净盈亏":Math.round(t.pnl),"R":+t.r.toFixed(2),
    "持仓天":t.bars,"出场原因":t.note})),"交易明细.csv");
}
"""


# ---------------------------------------------------------------- 前端脚本 2
# SVG K线图（缩放/平移/十字线）、权益曲线、页面初始化

JS2 = r"""
function niceTicks(lo,hi,n){
  const span=hi-lo; if(!(span>0)) return [lo];
  const raw=span/n, mag=Math.pow(10,Math.floor(Math.log10(raw))), norm=raw/mag;
  const step=(norm<1.5?1:norm<3?2:norm<7?5:10)*mag, out=[];
  for(let v=Math.ceil(lo/step)*step; v<=hi+1e-9; v+=step) out.push(+v.toFixed(6));
  return out;
}
const tickTxt=(v,step)=>v.toFixed(step>=1?0:step>=0.1?1:2);

class KChart{
  constructor(svg,cross,tip){
    this.svg=svg; this.cross=cross; this.tip=tip; this.d=null; this.view=null; this.drag=null;
    this.PADL=6; this.PADR=62; this.PADT=10; this.AXIS=20; this.VOLH=64; this.GAP=10;
    svg.addEventListener("wheel",e=>{ if(this.d){e.preventDefault();this.zoom(e);} },{passive:false});
    svg.addEventListener("pointerdown",e=>{ if(!this.d)return;
      this.drag={x:e.clientX,v:[...this.range()]}; svg.setPointerCapture(e.pointerId); });
    svg.addEventListener("pointermove",e=>{ if(this.drag) this.pan(e); else if(this.d) this.hover(e); });
    svg.addEventListener("pointerup",()=>this.drag=null);
    svg.addEventListener("pointerleave",()=>{this.drag=null;this.hideTip();});
    svg.addEventListener("dblclick",()=>this.reset());
    let rt=null;
    new ResizeObserver(()=>{ clearTimeout(rt); rt=setTimeout(()=>this.draw(),120); })
      .observe(svg.parentElement);
  }
  setData(d){ this.d=d; this.view=null; this.draw(); }
  reset(){ this.view=null; this.draw(); }
  range(){ const n=this.d.bars.length;
    if(!this.view) this.view=[Math.max(0,this.d.warm-5),n];
    return this.view; }
  zoom(e){
    const rect=this.svg.getBoundingClientRect(), [s,eI]=this.range(), n=eI-s;
    const step=(rect.width-this.PADL-this.PADR)/n;
    const iAt=s+(e.clientX-rect.left-this.PADL)/step;
    const f=e.deltaY>0?1.18:1/1.18, total=this.d.bars.length;
    let ns=Math.round(iAt-(iAt-s)*f), ne=Math.round(iAt+(eI-iAt)*f);
    if(ne-ns<20){ const c=(ns+ne)/2; ns=c-10; ne=c+10; }
    ns=Math.max(0,Math.min(ns,total-20)); ne=Math.max(ns+20,Math.min(total,ne));
    this.view=[ns,ne]; this.draw();
  }
  pan(e){
    const rect=this.svg.getBoundingClientRect(), [s0,e0]=this.drag.v, n=e0-s0;
    const step=(rect.width-this.PADL-this.PADR)/n;
    const di=Math.round((e.clientX-this.drag.x)/step);
    let ns=s0-di, ne=e0-di; const total=this.d.bars.length;
    if(ns<0){ ne-=ns; ns=0; }
    if(ne>total){ ns-=ne-total; ne=total; }
    if(ns!==s0){ this.view=[ns,ne]; this.draw(); }
  }
  hideTip(){ this.tip.style.display="none"; this.cross.style.display="none"; }
  hover(e){
    const rect=this.svg.getBoundingClientRect(), [s,eI]=this.range();
    const step=(rect.width-this.PADL-this.PADR)/(eI-s);
    let i=s+Math.floor((e.clientX-rect.left-this.PADL)/step);
    i=Math.max(s,Math.min(eI-1,i));
    const d=this.d, b=d.bars[i];
    const cx=this.PADL+(i-s+0.5)*step;
    this.cross.style.display="block"; this.cross.style.left=cx+"px";
    const prev=i>0?d.bars[i-1]:null;
    const chg=prev?((b.close/prev.close-1)*100):0;
    const bx=d.box_seq[i-d.warm];
    const sig=d.signals.find(x=>x.i===i);
    let h="<b>"+b.date+"</b><br>"+
      "开 "+fmt(b.open)+"　高 "+fmt(b.high)+"<br>"+
      "低 "+fmt(b.low)+"　收 <span class='"+cls(chg)+"'>"+fmt(b.close)+" ("+pctS(chg)+")</span><br>"+
      "量 "+fmtI(b.vol/100)+"手　EMA20 "+fmt(d.ema_exit[i])+"<br>"+
      "EMA60 "+fmt(d.ema_trend[i]);
    if(bx) h+="<br>箱体 "+fmt(bx[1])+" ~ "+fmt(bx[0])+"";
    if(sig) h+="<br><span style='color:var(--accent)'>突破信号（箱体"+sig.L+"根）</span>";
    this.tip.innerHTML=h; this.tip.style.display="block";
    const bw=this.svg.parentElement.getBoundingClientRect().width;
    const tw=this.tip.offsetWidth;
    this.tip.style.left=(cx+14+tw>bw?cx-tw-14:cx+14)+"px";
    this.tip.style.top="14px";
  }
  draw(){
    const d=this.d; if(!d||!this.svg.clientWidth) return;
    const [s,eI]=this.range(), bars=d.bars;
    const W=this.svg.clientWidth, H=this.svg.clientHeight||560;
    const P=this, PADL=P.PADL, PADR=P.PADR, PADT=P.PADT;
    const mainH=H-P.AXIS-P.VOLH-P.GAP-PADT;
    const step=(W-PADL-PADR)/(eI-s);
    const X=i=>PADL+(i-s+0.5)*step;
    let lo=Infinity, hi=-Infinity;
    for(let i=s;i<eI;i++){
      const b=bars[i]; if(b.low<lo)lo=b.low; if(b.high>hi)hi=b.high;
      const bx=d.box_seq[i-d.warm];
      if(bx){ if(bx[1]<lo)lo=bx[1]; if(bx[0]>hi)hi=bx[0]; }
      const e1=d.ema_exit[i]; if(e1!=null){ if(e1<lo)lo=e1; if(e1>hi)hi=e1; }
      const e2=d.ema_trend[i]; if(e2!=null){ if(e2<lo)lo=e2; if(e2>hi)hi=e2; }
    }
    for(const t of d.trades){
      if(t.exit_i<s||t.entry_i>=eI) continue;
      for(const v of [t.stop,t.tp1,t.tp2]) if(v!=null){ if(v<lo)lo=v; if(v>hi)hi=v; }
    }
    if(!isFinite(lo)){ lo=0; hi=1; }
    const pad=(hi-lo)*0.05||1; lo-=pad; hi+=pad;
    const Y=p=>PADT+(hi-p)/(hi-lo)*mainH;
    let h="";
    const ticks=niceTicks(lo,hi,5);
    let tstep=ticks.length>1?ticks[1]-ticks[0]:1;
    for(const tv of ticks){
      const y=Y(tv);
      h+='<line x1="'+PADL+'" y1="'+y.toFixed(1)+'" x2="'+(W-PADR)+'" y2="'+y.toFixed(1)+
         '" stroke="#1c2430"/>'+
         '<text x="'+(W-PADR+6)+'" y="'+(y+3.5).toFixed(1)+'" fill="#7d8b9e" font-size="10">'+
         tickTxt(tv,tstep)+"</text>";
    }
    // 箱体段（阶梯线 + 浅色底）
    let segA=null;
    const flushSeg=(a,b)=>{
      if(a==null) return;
      let up="",dn="",top=Infinity,bot=-Infinity;
      for(let i=a;i<=b;i++){
        const bx=d.box_seq[i-d.warm], x1=X(i)-step/2, x2=x1+step;
        up+="L"+x1.toFixed(1)+" "+Y(bx[0]).toFixed(1)+"L"+x2.toFixed(1)+" "+Y(bx[0]).toFixed(1);
        dn+="L"+x1.toFixed(1)+" "+Y(bx[1]).toFixed(1)+"L"+x2.toFixed(1)+" "+Y(bx[1]).toFixed(1);
        top=Math.min(top,Y(bx[0])); bot=Math.max(bot,Y(bx[1]));
      }
      h+='<rect x="'+(X(a)-step/2).toFixed(1)+'" y="'+top.toFixed(1)+'" width="'+
         ((b-a+1)*step).toFixed(1)+'" height="'+Math.max(1,bot-top).toFixed(1)+
         '" fill="rgba(110,168,254,.06)"/>'+
         '<path d="'+up.slice(1)+'" fill="none" stroke="rgba(110,168,254,.55)" '+
         'stroke-width="1" stroke-dasharray="4 3"/>'+
         '<path d="'+dn.slice(1)+'" fill="none" stroke="rgba(110,168,254,.55)" '+
         'stroke-width="1" stroke-dasharray="4 3"/>';
    };
    for(let i=s;i<eI;i++){
      const has=d.box_seq[i-d.warm]!=null;
      if(has&&segA==null) segA=i;
      if((!has||i===eI-1)&&segA!=null){ flushSeg(segA,has?i:i-1); segA=null; }
    }
    // 蜡烛
    const bw=Math.max(1,Math.min(13,step*0.66));
    for(let i=s;i<eI;i++){
      const b=bars[i], up=b.close>=b.open, c=up?"#f0524f":"#2ebd85", x=X(i);
      h+='<line x1="'+x.toFixed(1)+'" y1="'+Y(b.high).toFixed(1)+'" x2="'+x.toFixed(1)+
         '" y2="'+Y(b.low).toFixed(1)+'" stroke="'+c+'"/>';
      if(bw>1.5){
        const y1=Y(Math.max(b.open,b.close)), y2=Y(Math.min(b.open,b.close));
        h+='<rect x="'+(x-bw/2).toFixed(1)+'" y="'+y1.toFixed(1)+'" width="'+bw.toFixed(1)+
           '" height="'+Math.max(1,y2-y1).toFixed(1)+'" fill="'+c+'"/>';
      }
    }
    // 均线
    const line=(arr,color,w)=>{
      let p="",pen=false;
      for(let i=s;i<eI;i++){ const v=arr[i];
        if(v==null){ pen=false; continue; }
        p+=(pen?"L":"M")+X(i).toFixed(1)+" "+Y(v).toFixed(1); pen=true; }
      return p?'<path d="'+p+'" fill="none" stroke="'+color+'" stroke-width="'+w+'"/>':""; };
    h+=line(d.ema_exit,"#e8b339",1.3)+line(d.ema_trend,"#8f7ff0",1.3);
    // 持仓区间：止损/止盈线 + B/S 标记
    for(const t of d.trades){
      if(t.exit_i<s||t.entry_i>=eI) continue;
      const a=Math.max(t.entry_i,s), b2=Math.min(t.exit_i,eI-1);
      h+='<rect x="'+(X(t.entry_i)-step/2).toFixed(1)+'" y="'+PADT+'" width="'+
         ((b2-a+1)*step).toFixed(1)+'" height="'+mainH+'" fill="rgba(232,179,57,.04)"/>';
      const seg=(v,color)=>{
        if(v==null) return;
        const y=Y(v);
        h+='<line x1="'+X(a).toFixed(1)+'" y1="'+y.toFixed(1)+'" x2="'+(X(b2)+step/2).toFixed(1)+
           '" y2="'+y.toFixed(1)+'" stroke="'+color+'" stroke-width="1" stroke-dasharray="5 4" opacity=".8"/>';
        if(b2+4<eI) h+='<text x="'+(X(b2)+step/2+4).toFixed(1)+'" y="'+(y+3).toFixed(1)+
           '" fill="'+color+'" font-size="9">'+tickTxt(v,0.01)+"</text>";
      };
      seg(t.stop,"#f0524f"); seg(t.tp1,"#2ebd85"); seg(t.tp2,"#2ebd85");
      if(t.entry_i>=s&&t.entry_i<eI){
        const x=X(t.entry_i), y=Y(bars[t.entry_i].low)+8;
        h+='<path d="M'+x.toFixed(1)+" "+(y-6).toFixed(1)+"l5 9h-10z"+'" fill="#f0524f"/>'+
           '<text x="'+x.toFixed(1)+'" y="'+(y+15).toFixed(1)+'" fill="#ffb4b2" font-size="9" '+
           'text-anchor="middle">B</text>';
      }
      if(t.exit_i>=s&&t.exit_i<eI){
        const x=X(t.exit_i), y=Y(bars[t.exit_i].high)-8;
        h+='<path d="M'+x.toFixed(1)+" "+(y+6).toFixed(1)+"l5 -9h-10z"+'" fill="#2ebd85"/>'+
           '<text x="'+x.toFixed(1)+'" y="'+(y-7).toFixed(1)+'" fill="#9ce8c8" font-size="9" '+
           'text-anchor="middle">S</text>';
      }
    }
    // 未成交信号：金色空心圈
    for(const sg of d.signals){
      if(sg.i<s||sg.i>=eI) continue;
      h+='<circle cx="'+X(sg.i).toFixed(1)+'" cy="'+(Y(bars[sg.i].high)-10).toFixed(1)+
         '" r="3.2" fill="none" stroke="#e8b339" stroke-width="1.2"/>';
    }
    // 成交量副图
    const vy0=PADT+mainH+P.GAP;
    let vmax=0;
    for(let i=s;i<eI;i++) if(bars[i].vol>vmax) vmax=bars[i].vol;
    for(let i=s;i<eI;i++){
      const b=bars[i], hh=vmax?b.vol/vmax*P.VOLH:0;
      if(hh<=0) continue;
      h+='<rect x="'+(X(i)-bw/2).toFixed(1)+'" y="'+(vy0+P.VOLH-hh).toFixed(1)+'" width="'+
         bw.toFixed(1)+'" height="'+hh.toFixed(1)+'" fill="'+
         (b.close>=b.open?"#f0524f":"#2ebd85")+'" opacity=".5"/>';
    }
    let vp="",vpen=false;
    for(let i=s;i<eI;i++){ const v=d.vol_ma[i];
      if(v==null||!vmax){ vpen=false; continue; }
      vp+=(vpen?"L":"M")+X(i).toFixed(1)+" "+(vy0+P.VOLH-v/vmax*P.VOLH).toFixed(1); vpen=true; }
    if(vp) h+='<path d="'+vp+'" fill="none" stroke="#e8b339" stroke-width="1" opacity=".7"/>';
    // 日期轴
    const tickN=Math.max(2,Math.floor((W-PADL-PADR)/90));
    for(let k=0;k<=tickN;k++){
      const i=s+Math.round(k*(eI-s-1)/tickN);
      h+='<text x="'+X(i).toFixed(1)+'" y="'+(H-6)+'" fill="#7d8b9e" font-size="10" '+
         'text-anchor="middle">'+bars[i].date.slice(5)+"</text>";
    }
    this.svg.innerHTML=h;
  }
}

/* ---------------- 权益曲线 ---------------- */
function drawEquity(svg,r){
  const eq=r.equity, warm=r.warm, bars=r.bars, n=eq.length;
  if(!n){ svg.innerHTML=""; return; }
  const W=svg.clientWidth||900, H=svg.clientHeight||210;
  const PADL=6, PADR=70, PADT=10, PADB=18;
  const strat=eq.map(v=>v/eq[0]);
  const base=bars[warm].close;
  const bench=[]; for(let i=0;i<n;i++) bench.push(bars[warm+i].close/base);
  let lo=Infinity, hi=-Infinity;
  for(let i=0;i<n;i++){
    lo=Math.min(lo,strat[i],bench[i]); hi=Math.max(hi,strat[i],bench[i]);
  }
  const pad=(hi-lo)*0.08||0.01; lo-=pad; hi+=pad;
  const X=i=>PADL+i/(n-1||1)*(W-PADL-PADR);
  const Y=v=>PADT+(hi-v)/(hi-lo)*(H-PADT-PADB);
  const path=arr=>{ let p="",pen=false;
    for(let i=0;i<n;i++){ p+=(pen?"L":"M")+X(i).toFixed(1)+" "+Y(arr[i]).toFixed(1); pen=true; }
    return p; };
  let h="";
  for(const tv of niceTicks(lo,hi,4)){
    const y=Y(tv), pp=((tv-1)*100);
    h+='<line x1="'+PADL+'" y1="'+y.toFixed(1)+'" x2="'+(W-PADR)+'" y2="'+y.toFixed(1)+
       '" stroke="#1c2430"/>'+
       '<text x="'+(W-PADR+6)+'" y="'+(y+3.5).toFixed(1)+'" fill="#7d8b9e" font-size="10">'+
       (pp>0?"+":"")+pp.toFixed(0)+"%</text>";
  }
  const y0=Y(1);
  h+='<line x1="'+PADL+'" y1="'+y0.toFixed(1)+'" x2="'+(W-PADR)+'" y2="'+y0.toFixed(1)+
     '" stroke="#3a4656" stroke-dasharray="3 3"/>';
  h+='<path d="'+path(bench)+'" fill="none" stroke="#5b6b81" stroke-width="1.2" stroke-dasharray="4 3"/>';
  h+='<path d="'+path(strat)+'" fill="none" stroke="#e8b339" stroke-width="1.8"/>';
  const lp=strat[n-1], lb=bench[n-1];
  h+='<text x="'+(W-PADR+6)+'" y="'+(Y(lp)+4).toFixed(1)+'" fill="#e8b339" font-size="10">'+
     pctS((lp-1)*100)+"</text>"+
     '<text x="'+(W-PADR+6)+'" y="'+(Y(lb)+14).toFixed(1)+'" fill="#5b6b81" font-size="10">'+
     pctS((lb-1)*100)+"</text>";
  h+='<text x="'+PADL+'" y="'+(H-5)+'" fill="#7d8b9e" font-size="10">'+bars[warm].date+"</text>"+
     '<text x="'+(W-PADR)+'" y="'+(H-5)+'" fill="#7d8b9e" font-size="10" text-anchor="end">'+
     bars[n-1+warm].date+"</text>";
  svg.innerHTML=h;
}

/* ---------------- 初始化 ---------------- */
$("#btn-scan").onclick=runScan;
$("#btn-bt").onclick=runBacktest;
$("#codes").addEventListener("keydown",e=>{ if(e.key==="Enter") runBacktest(); });
$("#btn-watch").onclick=async()=>{
  try{
    const j=await api("api/watchlist");
    const names=(j.items||[]).filter(x=>x.symbol).map(x=>x.name);
    if(!names.length){ toast("src/ 下没有可用的自选股",true); return; }
    $("#codes").value=names.join(", ");
    toast("已载入 "+names.length+" 只自选股");
  }catch(e){ toast(e.message,true); }
};
let searchTimer=null;
$("#codes").addEventListener("input",()=>{
  clearTimeout(searchTimer);
  searchTimer=setTimeout(async()=>{
    const q=$("#codes").value.trim();
    if(!q){ $("#dl").innerHTML=""; return; }
    try{
      const j=await api("api/search?q="+encodeURIComponent(q));
      $("#dl").innerHTML=(j.items||[]).map(x=>
        '<option value="'+esc(x.name)+'" label="'+esc(x.code)+'">').join("");
    }catch(err){/* 静默 */}
  },250);
});
"""


# ---------------------------------------------------------------- 前端脚本 3
# 行情监控（自选股行情/个股详情/收盘同步）与全市场选股

JS3 = r"""
const fmtWan = w => (w==null||isNaN(w)) ? "—" :
  Math.abs(w)>=1e4 ? (w/1e4).toFixed(2)+"亿" : Math.round(w)+"万";
const fmtShou = v => (v==null||isNaN(v)) ? "—" :
  v>=1e8 ? (v/1e8).toFixed(2)+"亿手" : v>=1e4 ? (v/1e4).toFixed(2)+"万手" : Math.round(v)+"手";

/* ---------------- 行情监控 ---------------- */
let quoteTimer=null;
async function loadHoldings(silent){
  try{
    const j=await api("api/holdings");
    renderHoldings(j.items||[]);
  }catch(e){
    if(!silent) toast("行情获取失败: "+e.message,true);
    $("#quote-body").className="empty";
    $("#quote-body").textContent="行情获取失败: "+e.message;
  }
}
function renderHoldings(items){
  const box=$("#quote-body");
  const ok=items.filter(x=>!x["状态"]);
  $("#quote-meta").textContent="自选股 "+items.length+" 只 · 数据源腾讯行情快照";
  if(!items.length){ box.className="empty"; box.textContent="src/ 下没有自选股（*.md）"; return; }
  let h='<div class="card"><div class="table-wrap"><table><thead><tr>'+
    "<th>名称/代码</th><th class='num'>现价</th><th class='num'>成本</th>"+
    "<th class='num'>盈亏</th><th class='num'>涨跌</th><th class='num'>换手</th>"+
    "<th class='num'>成交额</th><th>行情时间</th><th>操作</th></tr></thead><tbody>";
  for(const r of items){
    if(r["状态"]){
      h+="<tr><td><b>"+esc(r["名称"])+"</b> <span style='color:var(--dim)'>"+esc(r["代码"])+"</span></td>"+
        "<td colspan='8' style='color:var(--dim)'>"+esc(r["状态"])+"</td></tr>";
      continue;
    }
    h+="<tr><td><b>"+esc(r["名称"])+"</b> <span style='color:var(--dim)'>"+esc(r["代码"])+"</span></td>"+
      "<td class='num'>"+fmt(r["现价"])+"</td>"+
      "<td class='num'>"+(r["成本"]!=null?fmt(r["成本"]):"—")+"</td>"+
      "<td class='num "+cls(r["盈亏%"])+"'>"+pctS(r["盈亏%"])+"</td>"+
      "<td class='num "+cls(r["涨跌%"])+"'>"+pctS(r["涨跌%"])+"</td>"+
      "<td class='num'>"+fmt(r["换手%"])+"%</td>"+
      "<td class='num'>"+fmtWan(r["成交额(万)"])+"</td>"+
      "<td style='color:var(--dim)'>"+esc(r["行情时间"]||"—")+"</td>"+
      "<td>"+(r["代码"]&&r["代码"]!=="-"?'<button class="small" data-bt="'+esc(r["代码"])+'">回测</button>':"")+"</td></tr>";
  }
  h+="</tbody></table></div></div>";
  box.className=""; box.innerHTML=h;
  box.querySelectorAll("[data-bt]").forEach(b=>b.onclick=ev=>{
    ev.stopPropagation(); $("#codes").value=b.dataset.bt; runBacktest();
  });
}
function setQuoteInterval(){
  clearInterval(quoteTimer); quoteTimer=null;
  const sec=+$("#q-interval").value;
  if(sec>0) quoteTimer=setInterval(()=>loadHoldings(true),sec*1000);
}
async function runQuote(){
  const codes=$("#codes").value.trim();
  if(!codes){ toast("请先在上方输入股票代码或名称",true); return; }
  const btn=$("#btn-quote"); busy(btn,true,"查询中…");
  try{
    const j=await api("api/quotes?"+qs({codes}));
    renderQuoteDetail(j.items||[]);
    switchTab("quote");
  }catch(e){ toast("行情查询失败: "+e.message,true); }
  finally{ busy(btn,false); }
}
function renderQuoteDetail(items){
  const box=$("#quote-detail");
  if(!items.length){ box.innerHTML=""; return; }
  const kv=(k,v,cl)=>'<div><div class="k">'+k+'</div><div class="v '+(cl||"")+'">'+v+"</div></div>";
  box.innerHTML=items.map(r=>{
    if(r["状态"]) return '<div class="card"><h3>'+esc(r["名称"])+"</h3><div class='empty' style='padding:18px'>"+
      esc(r["状态"])+"</div></div>";
    const head='<b>'+esc(r["名称"])+"</b> <span style='color:var(--dim)'>"+esc(r["代码"])+"</span>　"+
      '<span class="'+cls(r["涨跌%"])+'">'+fmt(r["现价"])+"  "+pctS(r["涨跌%"])+"</span>";
    return '<div class="card"><h3>'+head+"</h3><div class=\"kv\">"+
      kv("今开",fmt(r["今开"]))+kv("昨收",fmt(r["昨收"]))+
      kv("最高",fmt(r["最高"]))+kv("最低",fmt(r["最低"]))+
      kv("成交量",fmtShou(r["成交量(手)"]))+kv("成交额",fmtWan(r["成交额(万)"]))+
      kv("换手率",fmt(r["换手%"])+"%")+kv("振幅",fmt(r["振幅%"])+"%")+
      kv("市盈率TTM",esc(r["市盈率TTM"]||"—"))+kv("市净率",esc(r["市净率"]||"—"))+
      kv("流通市值",fmt(r["流通市值(亿)"],0)+"亿")+kv("总市值",fmt(r["总市值(亿)"],0)+"亿")+
      kv("涨停价",esc(r["涨停价"]||"—"))+kv("跌停价",esc(r["跌停价"]||"—"))+
      kv("行情时间",esc(r["行情时间"]||"—"))+"</div></div>";
  }).join("");
}
$("#btn-quote").onclick=runQuote;
$("#btn-q-refresh").onclick=()=>{ loadHoldings(); loadDapan(); };
$("#q-interval").onchange=setQuoteInterval;
$("#btn-sync").onclick=async()=>{
  const btn=$("#btn-sync"); busy(btn,true,"同步中…");
  try{
    const j=await api("api/sync");
    $("#sync-out").innerHTML='<div class="card"><h3>收盘同步结果（追加到 src/*.md，已有当日记录自动跳过）</h3>'+
      '<div class="sync-out">'+esc(j.output||"没有需要同步的内容")+"</div></div>";
    toast("收盘同步已执行");
  }catch(e){ toast("同步失败: "+e.message,true); }
  finally{ busy(btn,false); }
};

/* ---------------- 全市场选股 ---------------- */
let screenRows=[], screenMode="突破信号", pollTimer=null;
async function startScreen(){
  if(pollTimer){ toast("扫描正在进行中",true); return; }
  const btn=$("#btn-screen"); busy(btn,true,"提交中…");
  try{
    const params={watch:$("#s-watch").value, lookback:$("#s-lookback").value,
      min_amount:$("#s-amount").value, min_chg:$("#s-chg").value,
      min_price:$("#s-price").value, top:$("#s-top").value,
      include_bj:$("#s-bj").checked?"1":"0",
      capital:$("#p-cap").value, risk:$("#p-risk").value,
      tp1:$("#p-tp1").value, tp2:$("#p-tp2").value, max_stop_pct:$("#p-msp").value};
    const codes=$("#codes").value.trim();
    if(codes) params.codes=codes;
    const j=await api("api/screener?"+qs(params));
    if(!j.started){ toast(j.msg||"无法启动扫描",true); return; }
    $("#s-prog").hidden=false; $("#s-prog-bar").style.width="0";
    $("#s-status").textContent="扫描已启动…";
    pollScreen();
  }catch(e){ toast("启动失败: "+e.message,true); }
  finally{ busy(btn,false); }
}
function pollScreen(){
  clearInterval(pollTimer);
  pollTimer=setInterval(async()=>{
    let j;
    try{ j=await api("api/screener/progress"); }
    catch(e){ return; }
    const pct=j.total?Math.round(j.done/j.total*100):0;
    $("#s-prog-bar").style.width=pct+"%";
    $("#s-status").textContent=(j.running?("扫描中 "+j.done+"/"+j.total+"（"+pct+"%）· "+j.phase)
      :j.phase||"")+(j.scope?" · "+j.scope:"");
    if(j.running) return;
    clearInterval(pollTimer); pollTimer=null;
    $("#s-prog").hidden=true;
    if(j.error){
      $("#s-status").textContent="扫描失败: "+j.error;
      toast("扫描失败: "+j.error,true);
      return;
    }
    if(j.result){
      screenRows=j.result.rows||[]; screenMode=j.result.mode;
      renderScreen(j.result);
      toast("扫描完成：命中 "+j.result.total_hits+" 只");
    }
  },1000);
}
function renderScreen(res){
  const head=$("#s-res-head"), body=$("#screen-body");
  head.hidden=false;
  $("#btn-scsv").disabled=!screenRows.length;
  $("#s-meta").textContent=res.mode+" · "+res.scope+" · 命中 "+res.total_hits+" 只，显示 "+
    screenRows.length+" 只"+(res.note?" · "+res.note:"")+" · 盘中最后一根K线为实时快照";
  if(!screenRows.length){
    body.className="empty";
    body.textContent="无命中。可放宽参数（成交额/涨幅下限、回看K线数），或切换「预备箱体」模式";
    return;
  }
  const isSig=screenMode==="突破信号";
  let h='<div class="card"><div class="table-wrap"><table><thead><tr>'+
    "<th>名称/代码</th><th>行业</th>"+(isSig?"<th>信号日</th>":"<th>日期</th>")+
    "<th class='num'>收盘</th>"+(isSig?"<th class='num'>涨幅</th>":"<th class='num'>触发价</th><th class='num'>距触发</th>")+
    "<th class='num'>ATR%</th>"+(isSig?"<th class='num'>量比</th>":"")+
    "<th>箱体</th>"+(isSig?"<th class='num'>止损</th><th class='num'>止盈1</th><th class='num'>止盈2</th>"+
      "<th class='num'>股数</th><th class='num'>仓位</th>":"")+
    "<th></th></tr></thead><tbody>";
  for(const r of screenRows){
    const boxTxt=fmt(r["箱体低"])+" ~ "+fmt(r["箱体高"])+" ("+r["箱体K线数"]+"根)";
    h+="<tr><td><b>"+esc(r["名称"])+"</b> <span style='color:var(--dim)'>"+esc(r["代码"])+"</span></td>"+
      "<td style='color:var(--dim)'>"+esc(r["行业"]||"-")+"</td>"+
      "<td>"+esc(r[isSig?"信号日":"日期"]||"—")+"</td>"+
      "<td class='num'>"+fmt(r["收盘"])+"</td>"+
      (isSig
        ?"<td class='num "+cls(r["涨幅%"])+"'>"+pctS(r["涨幅%"])+"</td>"
        :"<td class='num up'>"+fmt(r["触发价"])+"</td><td class='num'>"+fmt(r["距触发%"])+"%</td>")+
      "<td class='num'>"+fmt(r["ATR%"])+"</td>"+
      (isSig?"<td class='num'>"+fmt(r["量比"])+"</td>":"")+
      "<td>"+boxTxt+"</td>"+
      (isSig
        ?"<td class='num dn'>"+fmt(r["止损"])+"</td>"+
         "<td class='num up'>"+fmt(r["止盈1"])+"</td><td class='num up'>"+fmt(r["止盈2"])+"</td>"+
         "<td class='num'>"+fmtI(r["建议股数"])+"</td>"+
         "<td class='num'>"+(r["仓位%"]!==""&&r["仓位%"]!=null?r["仓位%"]+"%":"—")+"</td>"
        :"")+
      "<td>"+'<button class="small" data-bt="'+esc(r["代码"])+'">回测</button>'+"</td></tr>";
  }
  h+="</tbody></table></div></div>";
  body.className=""; body.innerHTML=h;
  body.querySelectorAll("[data-bt]").forEach(b=>b.onclick=ev=>{
    ev.stopPropagation(); $("#codes").value=b.dataset.bt; runBacktest();
  });
}
$("#btn-screen").onclick=startScreen;
$("#btn-scsv").onclick=()=>exportCsv(screenRows,screenMode==="预备箱体"?"预备箱体.csv":"选股信号.csv");

/* ---------------- 大盘指数（dapan.py，复盘先看大盘） ---------------- */
async function loadDapan(){
  const body=$("#dapan-body");
  try{
    const j=await api("api/dapan");
    if(!j.rows||!j.rows.length){ body.className="empty"; body.textContent="暂无指数数据"; return; }
    let h='<div class="card"><div class="table-wrap"><table><thead><tr>'+
      "<th>指数</th><th class='num'>收盘</th><th class='num'>涨跌</th>"+
      "<th class='num'>ma5</th><th class='num'>ma13</th><th class='num'>ma60</th>"+
      "<th class='num'>MACD柱</th><th>量能</th></tr></thead><tbody>";
    for(const r of j.rows){
      if(r["状态"]){ h+='<tr><td>'+esc(r["名称"])+'</td><td colspan="7" style="color:var(--dim)">'+esc(r["状态"])+"</td></tr>"; continue; }
      h+="<tr><td><b>"+esc(r["名称"])+"</b></td>"+
        '<td class="num">'+fmt(r["收盘"])+"</td>"+
        '<td class="num '+cls(r["涨跌%"])+'">'+pctS(r["涨跌%"])+"</td>"+
        '<td class="num">'+fmt(r["ma5"])+"</td>"+
        '<td class="num">'+fmt(r["ma13"])+"</td>"+
        '<td class="num">'+fmt(r["ma60"])+"</td>"+
        '<td class="num '+cls(r["macd柱"])+'">'+fmt(r["macd柱"])+"</td>"+
        "<td>"+esc(r["量能"])+"</td></tr>";
    }
    h+="</tbody></table></div><div style='color:var(--dim);font-size:12px;margin-top:6px'>数据截至 "+esc(j.asof||"—")+
       "（今日未收盘时为上一交易日）；15:00 后点「大盘同步」把当日记录追加到 src/大盘/*.md</div></div>";
    body.className=""; body.innerHTML=h;
  }catch(e){ body.className="empty"; body.textContent="大盘指数载入失败: "+e.message; }
}
$("#btn-dapan-sync").onclick=async()=>{
  const btn=$("#btn-dapan-sync"); busy(btn,true,"同步中…");
  try{
    const j=await api("api/dapan/sync");
    $("#sync-out").innerHTML='<div class="card"><h3>大盘同步结果（追加到 src/大盘/*.md，已有记录自动跳过）</h3>'+
      '<div class="sync-out">'+esc(j.output||"没有需要同步的内容")+"</div></div>";
    toast("大盘同步已执行");
  }catch(e){ toast("大盘同步失败: "+e.message,true); }
  finally{ busy(btn,false); }
};

/* ---------------- 价值分析（value.py）与每日报告（daily.py） ---------------- */
$("#btn-value").onclick=async()=>{
  const sym=$("#codes").value.split(",")[0].trim();
  if(!sym){ toast("请先在输入框填写标的（6 位代码或名称）",true); return; }
  const btn=$("#btn-value"); busy(btn,true,"分析中…");
  try{
    const j=await api("api/value?symbol="+encodeURIComponent(sym));
    $("#sync-out").innerHTML='<div class="card"><h3>价值分析：'+esc(j.name||"")+
      '（现价 '+esc(j.price)+"）</h3>"+
      '<pre style="white-space:pre-wrap;font-size:13px;line-height:1.6">'+esc(j.report||"")+"</pre></div>";
    toast("价值分析完成");
  }catch(e){ toast("价值分析失败: "+e.message,true); }
  finally{ busy(btn,false); }
};
$("#btn-daily").onclick=async()=>{
  const btn=$("#btn-daily"); busy(btn,true,"生成中…");
  try{
    const j=await api("api/daily");
    $("#sync-out").innerHTML='<div class="card"><h3>每日分析报告'+
      (j.csv?'（条件单清单：reports/'+esc(j.csv)+"）":"（今日无候选股，无条件单）")+
      '</h3><pre style="white-space:pre-wrap;font-size:13px;line-height:1.6">'+esc(j.report||"")+"</pre></div>";
    toast("每日报告已生成");
  }catch(e){ toast("每日报告生成失败: "+e.message,true); }
  finally{ busy(btn,false); }
};
"""


# ---------------------------------------------------------------- 前端脚本 4
# 超短线：情绪周期卡片 + 隔日候选（A 首板排板 / B 尾盘强势）+ 次日卖出预案
JS4 = r"""
/* ============ 超短线（情绪周期 + 隔日候选） ============ */
let dxTimer=null;
function startDx(){
  const btn=$("#btn-dx"); busy(btn,true,"扫描中…");
  const d=($("#dx-date").value||"").replace(/-/g,"");
  api("api/duanxian?date="+encodeURIComponent(d)).then(r=>{
    if(!r.started){ toast(r.error||"启动失败"); busy(btn,false); return; }
    $("#dx-status").textContent="启动…";
    $("#dx-senti").className="empty"; $("#dx-senti").textContent="扫描中…";
    $("#dx-out").innerHTML="";
    dxTimer=setInterval(pollDx,1200);
  }).catch(e=>{ toast("启动失败: "+e.message); busy(btn,false); });
}
function pollDx(){
  api("api/duanxian/progress").then(r=>{
    $("#dx-status").textContent=r.running
      ? (r.phase+(r.total?(" "+r.done+"/"+r.total):""))
      : (r.error?("失败: "+r.error):"完成");
    if(r.running) return;
    clearInterval(dxTimer); dxTimer=null; busy($("#btn-dx"),false);
    if(r.error){ toast("超短线扫描失败: "+r.error); $("#dx-senti").textContent="扫描失败: "+r.error; return; }
    if(r.result) renderDx(r.result);
  }).catch(()=>{});
}
function dxTable(rows){
  const cols=Object.keys(rows[0]);
  return `<div class="table-wrap"><table><thead><tr>${
    cols.map(c=>`<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${
    rows.map(r=>`<tr>${cols.map(c=>{
      const v=r[c];
      let cls="";
      if(c==="建议") cls=v==="重点关注"?' class="up"':(v==="观察"?' class="dn"':"");
      if(c==="涨幅%"&&typeof v==="number") cls=v>0?' class="up"':(v<0?' class="dn"':"");
      return `<td${cls}>${v==null?"—":esc(String(v))}</td>`;
    }).join("")}</tr>`).join("")}</tbody></table></div>`;
}
function renderDx(res){
  const s=res.sentiment||{}, m=s.metrics||{};
  const chips=Object.entries(m).map(([k,v])=>
    `<span class="chip" style="cursor:default">${esc(k)} <b>${v==null?"—":esc(String(v))}</b></span>`).join("");
  const series=(s.series||[]).map(x=>
    `${x.date.slice(4,6)}/${x.date.slice(6,8)} ${x.count}家·${x.lb_max}板`).join(" → ");
  $("#dx-senti").className="";
  $("#dx-senti").innerHTML=`
    <div class="card">
      <div class="dx-head">
        <span class="dx-cycle">${esc(s.cycle||"—")}</span>
        <span>建议仓位 <b>${esc(s.position||"—")}</b></span>
        <span>情绪分 <b>${s.score==null?"—":(s.score>0?"+":"")+s.score}</b></span>
        <span class="meta">${esc(s.date||"")}${s.intraday?" · 盘中数据，收盘前会变化":""}</span>
      </div>
      <div class="chips">${chips}</div>
      <div class="meta">近${(s.series||[]).length}日（涨停家数·最高连板）: ${esc(series||"—")}</div>
      <ul class="dx-reasons">${(s.reasons||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
      <div class="meta" style="margin-top:8px">${esc(s.advice||"")}</div>
    </div>`;
  let h="";
  if(res.rows_a&&res.rows_a.length){
    h+=`<div class="card" style="margin-top:14px"><h3>A 首板排板候选（${esc(res.note_a||"")}）—— 收盘涨停价排板，次日按预案卖</h3>${dxTable(res.rows_a)}</div>`;
  }else if(res.note_a){
    h+=`<div class="card" style="margin-top:14px"><h3>A 首板排板候选</h3><div class="empty">${esc(res.note_a)}，无候选</div></div>`;
  }
  if(res.rows_b&&res.rows_b.length){
    h+=`<div class="card" style="margin-top:14px"><h3>B 尾盘强势候选（${esc(res.note_b||"")}）—— 尾盘竞价买入，次日按预案卖</h3>${dxTable(res.rows_b)}</div>`;
  }else if(res.note_b){
    h+=`<div class="card" style="margin-top:14px"><h3>B 尾盘强势候选</h3><div class="empty">${esc(res.note_b)}</div></div>`;
  }
  h+=`<div class="card" style="margin-top:14px"><h3>次日卖出预案（竞价后对号入座）</h3>
      <ul class="dx-reasons">${(res.plan||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
      <div class="meta" style="margin-top:8px">${esc(res.disclaimer||"")}</div></div>`;
  $("#dx-out").innerHTML=h;
}
$("#btn-dx").onclick=startDx;
"""


def main():
    enable_ansi()  # 防止子函数 print 中文/转义时在部分终端抛编码异常
    ap = argparse.ArgumentParser(description="钻潜交易体系·本地可视化界面")
    ap.add_argument("--port", type=int, default=8666, help="服务端口（默认8666）")
    args = ap.parse_args()

    httpd = None
    for port in range(args.port, args.port + 10):
        try:
            httpd = ThreadingHTTPServer(("127.0.0.1", port), Handler)
            break
        except OSError:
            continue
    if httpd is None:
        print(f"端口 {args.port}~{args.port + 9} 均被占用，可用 --port 换一个")
        return 1

    url = f"http://127.0.0.1:{httpd.server_address[1]}/"
    html = (PAGE_HTML.replace("__JS1__", JS1).replace("__JS2__", JS2)
            .replace("__JS3__", JS3).replace("__JS4__", JS4))
    globals()["PAGE_HTML"] = html
    print(f"钻潜可视化界面已启动: {url}   （Ctrl+C 退出）")
    threading.Timer(0.5, webbrowser.open, args=(url,)).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n已退出")
    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())

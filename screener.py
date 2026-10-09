#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""钻潜交易体系·全市场选股工具（东财股票列表 + 腾讯日K，仅标准库，零第三方依赖）

流程:
  1. 拉取全市场 A 股列表（东财 clist 多主机，失败自动切换腾讯备用列表）
  2. 预筛: 剔除 ST/退市/上市初期/停牌/低价，可按成交额、流通市值、当日涨幅提速
  3. 多线程逐只拉取日K，复用 zuanqian.py 的信号规则:
     日线EMA趋势 + 周线共振 + 横盘箱体 + 动能突破 + 量价配合 + ATR波动上限
  4. 输出信号表（箱体/止损/止盈/建议股数与仓位），可导出 CSV

两种模式:
  突破信号（默认）  最近 lookback 根K线内触发「钻潜突破」的股票
  预备箱体 --watch  趋势与箱体已就绪、尚未突破的候选（触发价 = 箱体上沿）

用法:
  python screener.py                            全市场选股（突破信号）
  python screener.py --watch                    预备箱体候选
  python screener.py 600030 万华化学            只检查指定标的
  python screener.py --lookback 3 --top 60      回看3天、显示前60名
  GYTO……Gp.iuj8=]u

说明:
  - 盘中运行时最后一根K线为实时快照，收盘前信号可能变化，建议收盘后运行;
  - 建议股数以「信号日收盘 ≈ 次日开盘」估算，实际按次日开盘价计算;
  - 规则为公开「钻潜」思想的程序化近似，仅供学习研究，不构成投资建议。
"""
import argparse
import csv
import json
import sys
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

from zuanqian import (BOLD, DIM, RESET, check_signal, compute_indicators,
                      enable_ansi, fetch_kline, find_box, load_config, pad,
                      paint, resolve_targets)

CLIST_PATH = ("{host}/api/qt/clist/get"
              "?pn={pn}&pz=100&po=1&np=1&fltt=2&invt=2&fid=f6&fs={fs}"
              "&fields=f2,f3,f6,f12,f13,f14,f21,f100"
              "&ut=bd1d9ddb04089700cf9c27f6f7426281")
CLIST_HOSTS = ("https://push2.eastmoney.com",       # 主源
               "https://push2delay.eastmoney.com",  # 延时行情镜像
               "http://push2.eastmoney.com",
               "http://push2delay.eastmoney.com")
TENCENT_RANK_API = ("https://proxy.finance.qq.com/cgi/cgi-bin/rank/hs/getBoardRankList"
                    "?board_code=aStock&sort_type=price&direct=down&offset={off}&count=100")
FS_A = "m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23"   # 深主板/创业板/沪主板/科创板
FS_BJ = "m:0+t:81+s:2048"                    # 北交所
MIN_BARS = 120                               # 上市不足约半年的不参与
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://quote.eastmoney.com/",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "zh-CN,zh;q=0.9",
}


# ---------------------------------------------------------------- 全市场列表

def http_json(url, timeout=15, retries=2):
    last: BaseException = OSError(f"请求失败: {url}")
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return json.loads(resp.read().decode("utf-8", errors="replace"))
        except (OSError, ValueError) as e:
            last = e
            time.sleep(0.4 * (attempt + 1))
    raise last


def num(v):
    if isinstance(v, (int, float)):
        return float(v)
    if isinstance(v, str):
        try:
            return float(v)
        except ValueError:
            return None
    return None


def to_symbol(code, market):
    """东财代码 -> 腾讯带前缀代码。北交所: 4/8/92 开头。"""
    if code[:2] == "92" or code[:1] in ("4", "8"):
        return "bj" + code
    return ("sh" if market == 1 else "sz") + code


def fetch_universe(include_bj):
    """全市场快照列表（东财 clist，逐页多主机自动切换）。"""
    fs = FS_A + ("," + FS_BJ if include_bj else "")
    quoted = urllib.parse.quote(fs, safe=",")

    def page(pn):
        errs = []
        for host in CLIST_HOSTS:
            try:
                data = http_json(CLIST_PATH.format(host=host, pn=pn, fs=quoted),
                                 timeout=10).get("data") or {}
                diff = data.get("diff") or []
                if isinstance(diff, dict):
                    diff = list(diff.values())
                return int(data.get("total") or 0), diff
            except (OSError, ValueError) as e:
                errs.append(str(e))
        raise OSError(" / ".join(dict.fromkeys(errs)) or "全部主机无响应")

    total, rows = page(1)
    if total > len(rows):
        pages = (total + 99) // 100
        with ThreadPoolExecutor(max_workers=8) as ex:
            for fut in as_completed([ex.submit(page, pn) for pn in range(2, pages + 1)]):
                try:
                    rows.extend(fut.result()[1])
                except (OSError, ValueError):
                    continue
    out, seen = [], set()
    for r in rows:
        code = str(r.get("f12") or "")
        if not code or code in seen:
            continue
        seen.add(code)
        out.append({
            "code": code,
            "name": str(r.get("f14") or "").strip(),
            "symbol": to_symbol(code, r.get("f13")),
            "industry": str(r.get("f100") or "-"),
            "price": num(r.get("f2")),
            "chg": num(r.get("f3")),
            "amount": num(r.get("f6")),
            "float_mv": num(r.get("f21")),
        })
    return out


def fetch_universe_tencent():
    """备用列表: 腾讯沪深A股排行接口（含价格/涨跌幅/成交额/流通市值，无行业）。"""
    out, seen, offset = [], set(), 0
    while True:
        data = http_json(TENCENT_RANK_API.format(off=offset), timeout=10).get("data") or {}
        lst = data.get("rank_list") or []
        if not lst:
            break
        for it in lst:
            full = str(it.get("code") or "")
            if len(full) <= 2:
                continue
            code = full[2:]
            if code in seen:
                continue
            seen.add(code)
            amount = num(it.get("turnover"))        # 万元
            ltsz = num(it.get("ltsz"))              # 亿元
            out.append({
                "code": code, "name": str(it.get("name") or "").strip(),
                "symbol": full, "industry": "-",
                "price": num(it.get("zxj")),
                "chg": num(it.get("zdf")),
                "amount": amount * 1e4 if amount is not None else None,
                "float_mv": ltsz * 1e8 if ltsz is not None else None,
            })
        offset += len(lst)
        if len(lst) < 100 or offset > 9000:
            break
    return out


def base_filter(u, p):
    """快照预筛: 剔除 ST/退市/上市初期/低价/低流动性（字段缺失时放行，交给K线阶段）。"""
    name = u["name"]
    if "ST" in name.upper() or "退" in name:
        return False
    if name[:1] in ("N", "C"):                      # 上市初期标记
        return False
    price = u["price"]
    if price is not None:
        if price < p.min_price:
            return False
        if p.max_price and price > p.max_price:
            return False
    if p.min_amount and u["amount"] is not None and u["amount"] < p.min_amount * 1e4:
        return False
    if p.min_cap and u["float_mv"] is not None and u["float_mv"] < p.min_cap * 1e8:
        return False
    if p.min_chg and u["chg"] is not None and u["chg"] < p.min_chg:
        return False
    return True


# ---------------------------------------------------------------- 逐只检查

def fetch_kline_retry(symbol, count, retries=2):
    last: BaseException = OSError(f"K线拉取失败: {symbol}")
    for attempt in range(retries + 1):
        try:
            return fetch_kline(symbol, count)
        except (OSError, ValueError) as e:
            last = e
            time.sleep(0.6 * (attempt + 1))
    raise last


def signal_payload(bars, ind, hit, p):
    """信号明细; 止损过宽（体系放弃）返回 None。"""
    j, sig = hit
    atr = ind["atr"][j] or 0.0
    close = bars[j]["close"]
    if close <= 0:
        return None
    stop = sig["box_low"] - p.stop_buffer * atr
    dist = close - stop
    if dist < p.min_stop_atr * atr:
        dist = p.min_stop_atr * atr
        stop = close - dist
    if dist / close > p.max_stop_pct / 100:
        return None
    vma = ind["vol_ma"][j] or 0.0
    prev = bars[j - 1]["close"] if j else close
    return {
        "date": bars[j]["date"], "close": close,
        "chg": (close / prev - 1) * 100 if prev else 0.0,
        "atr_pct": atr / close * 100,
        "vol_ratio": bars[j]["vol"] / vma if vma else 0.0,
        "box_low": sig["box_low"], "box_high": sig["box_high"], "L": sig["L"],
        "stop": stop, "dist": dist,
        "tp1": close + p.tp1 * dist, "tp2": close + p.tp2 * dist,
    }


def watch_payload(bars, ind, j, p):
    """预备箱体明细; 距触发价过远返回 None。"""
    atr = ind["atr"][j] or 0.0
    box = find_box(bars, atr, j, p)
    if not box:
        return None
    bh, bl, L = box
    close = bars[j]["close"]
    if close <= 0:
        return None
    dist_pct = (bh - close) / close * 100
    if dist_pct > p.watch_dist:
        return None
    prev = bars[j - 1]["close"] if j else close
    return {
        "date": bars[j]["date"], "close": close,
        "chg": (close / prev - 1) * 100 if prev else 0.0,
        "atr_pct": atr / close * 100,
        "box_low": bl, "box_high": bh, "L": L,
        "trigger": bh, "dist_pct": dist_pct,
    }


def eval_one(item, p, klines):
    """工作线程: 拉K线并按模式判定。返回 (kind, item, payload)。"""
    try:
        bars = fetch_kline_retry(item["symbol"], klines)
    except (OSError, ValueError) as e:
        return ("fail", item, str(e))
    if len(bars) < MIN_BARS:
        return ("short", item, None)
    ind = compute_indicators(bars, p)
    n = len(bars)

    if p.watch:  # 只看最新一根: 已突破的不算预备
        j = n - 1
        sig, reason = check_signal(bars, ind, j, p)
        if sig:
            return (None, item, None)
        if reason == "未突破箱体上沿":
            w = watch_payload(bars, ind, j, p)
            if w:
                return ("watch", item, w)
        return (None, item, None)

    hit = None
    for j in range(max(70, n - p.lookback), n):
        sig, _ = check_signal(bars, ind, j, p)
        if sig:
            hit = (j, sig)
    if hit:
        d = signal_payload(bars, ind, hit, p)
        return ("signal" if d else "wide", item, d)
    return (None, item, None)


def sizing(close, dist, p):
    """按单笔风险反推建议股数（100股整手）与仓位占比。"""
    if dist <= 0 or close <= 0:
        return 0, 0.0
    shares = int(p.capital * p.risk / 100 / dist / 100) * 100
    if shares * close > p.capital:
        shares = int(p.capital / close / 100) * 100
    return shares, (shares * close / p.capital * 100 if shares else 0.0)


# ---------------------------------------------------------------- 输出

def trunc(s, width):
    out, w = "", 0
    for ch in s:
        cw = 2 if ord(ch) > 127 else 1
        if w + cw > width:
            break
        out += ch
        w += cw
    return out


def print_signals(rows, p):
    show_date = p.lookback > 1
    header = ["#", "名称", "代码", "行业"] + (["信号日"] if show_date else []) + [
        "收盘", "涨幅%", "ATR%", "量比", "箱体", "止损", "止盈1", "止盈2", "股数", "仓位%"]
    widths = [4, 10, 8, 9] + ([11] if show_date else []) + [
        8, 7, 6, 6, 17, 8, 8, 8, 9, 7]
    aligns = ["left"] * (4 + (1 if show_date else 0)) + [
        "right", "right", "right", "right", "left",
        "right", "right", "right", "right", "right"]
    print(DIM + " ".join(pad(h, w) for h, w in zip(header, widths)) + RESET)
    for k, (item, d) in enumerate(rows, 1):
        shares, pct = sizing(d["close"], d["dist"], p)
        cells = [str(k), trunc(item["name"], 10), item["code"], trunc(item["industry"], 9)]
        if show_date:
            cells.append(d["date"])
        cells += [
            f"{d['close']:.2f}",
            paint(d["chg"], f"{d['chg']:+.1f}"),
            f"{d['atr_pct']:.1f}",
            f"{d['vol_ratio']:.1f}",
            f"{d['box_low']:.2f}~{d['box_high']:.2f}",
            f"{d['stop']:.2f}",
            f"{d['tp1']:.2f}",
            f"{d['tp2']:.2f}",
            f"{shares:,}" if shares >= 100 else "—",
            f"{pct:.1f}" if shares >= 100 else "—",
        ]
        print(" ".join(pad(c, w, a) for c, w, a in zip(cells, widths, aligns)))


def print_watch(rows):
    header = ("#", "名称", "代码", "行业", "触发价", "距触发%", "收盘", "涨幅%", "ATR%", "箱体", "L")
    widths = [4, 10, 8, 9, 8, 8, 8, 7, 6, 17, 4]
    aligns = ["left"] * 4 + ["right", "right", "right", "right", "right", "left", "right"]
    print(DIM + " ".join(pad(h, w) for h, w in zip(header, widths)) + RESET)
    for k, (item, d) in enumerate(rows, 1):
        cells = [
            str(k), trunc(item["name"], 10), item["code"], trunc(item["industry"], 9),
            f"{d['trigger']:.2f}", f"{d['dist_pct']:.1f}", f"{d['close']:.2f}",
            paint(d["chg"], f"{d['chg']:+.1f}"), f"{d['atr_pct']:.1f}",
            f"{d['box_low']:.2f}~{d['box_high']:.2f}", str(d["L"]),
        ]
        print(" ".join(pad(c, w, a) for c, w, a in zip(cells, widths, aligns)))


def save_csv(path, kind, rows, p):
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        if kind == "signal":
            w.writerow(["代码", "名称", "行业", "信号日", "收盘", "涨幅%", "ATR%", "量比",
                        "箱体低", "箱体高", "箱体K线数", "止损", "止盈1", "止盈2",
                        "建议股数", "仓位%"])
            for item, d in rows:
                shares, pct = sizing(d["close"], d["dist"], p)
                w.writerow([item["code"], item["name"], item["industry"], d["date"],
                            f"{d['close']:.2f}", f"{d['chg']:+.2f}", f"{d['atr_pct']:.2f}",
                            f"{d['vol_ratio']:.2f}", f"{d['box_low']:.2f}", f"{d['box_high']:.2f}",
                            d["L"], f"{d['stop']:.2f}", f"{d['tp1']:.2f}", f"{d['tp2']:.2f}",
                            shares if shares >= 100 else "",
                            f"{pct:.1f}" if shares >= 100 else ""])
        else:
            w.writerow(["代码", "名称", "行业", "日期", "收盘", "触发价", "距触发%",
                        "ATR%", "箱体低", "箱体高", "箱体K线数"])
            for item, d in rows:
                w.writerow([item["code"], item["name"], item["industry"], d["date"],
                            f"{d['close']:.2f}", f"{d['trigger']:.2f}", f"{d['dist_pct']:.1f}",
                            f"{d['atr_pct']:.2f}", f"{d['box_low']:.2f}", f"{d['box_high']:.2f}",
                            d["L"]])


# ---------------------------------------------------------------- 入口

def build_parser():
    ap = argparse.ArgumentParser(
        description="钻潜交易体系·全市场选股工具（东财列表 + 腾讯日K）",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    ap.add_argument("targets", nargs="*", help="只检查指定代码/名称（留空=全市场扫描）")
    ap.add_argument("--watch", action="store_true",
                    help="预备箱体模式: 只列未突破候选（已突破的用默认模式）")
    g = ap.add_argument_group("扫描范围")
    g.add_argument("--lookback", type=int, default=1, help="信号回看最近几根K线")
    g.add_argument("--watch-dist", type=float, default=3.0,
                   help="--watch 模式: 收盘距箱体上沿上限%%")
    g.add_argument("--top", type=int, default=40, help="最多显示多少行")
    g.add_argument("--workers", type=int, default=12, help="并发线程数")
    g.add_argument("--klines", type=int, default=180, help="每只股票取多少根日K")
    g.add_argument("--include-bj", action="store_true", help="包含北交所")
    g.add_argument("--csv", metavar="FILE", help="结果导出 CSV（utf-8-sig）")
    g2 = ap.add_argument_group("预筛（全市场模式）")
    g2.add_argument("--min-amount", type=float, default=2000, help="当日成交额下限（万元）")
    g2.add_argument("--min-cap", type=float, default=0, help="流通市值下限（亿元，0=不限）")
    g2.add_argument("--min-price", type=float, default=2.0, help="股价下限（元）")
    g2.add_argument("--max-price", type=float, default=0, help="股价上限（元，0=不限）")
    g2.add_argument("--min-chg", type=float, default=0,
                    help="当日涨幅下限%%（0=不限，设置后可大幅提速）")
    g3 = ap.add_argument_group("资金")
    g3.add_argument("--capital", type=float, default=1_000_000, help="资金规模（元），用于建议股数")
    g3.add_argument("--risk", type=float, default=1.0, help="单笔风险占资金%%")
    g4 = ap.add_argument_group("策略参数（与 zuanqian.py 一致）")
    g4.add_argument("--ema-trend", type=int, default=60, help="日线趋势EMA周期")
    g4.add_argument("--weekly-ema", type=int, default=8, help="周线趋势EMA周期")
    g4.add_argument("--box-min", type=int, default=6, help="横盘箱体最短K线数")
    g4.add_argument("--box-max", type=int, default=25, help="横盘箱体最长K线数")
    g4.add_argument("--box-atr", type=float, default=3.0, help="箱体宽度上限 = 倍数*ATR")
    g4.add_argument("--body-atr", type=float, default=1.0, help="突破阳线实体下限 = 倍数*ATR")
    g4.add_argument("--vol-mult", type=float, default=1.5, help="突破量能下限 = 倍数*20日均量")
    g4.add_argument("--atr-max", type=float, default=7.0, help="ATR占比上限%%，超过不做")
    g4.add_argument("--chase-atr", type=float, default=1.0, help="收盘超出箱体上沿多少倍ATR放弃")
    g4.add_argument("--tp1", type=float, default=2.0, help="第一止盈R倍数（减半仓）")
    g4.add_argument("--tp2", type=float, default=3.0, help="第二止盈R倍数")
    g4.add_argument("--stop-buffer", type=float, default=0.2, help="止损低于箱体下沿的ATR缓冲")
    g4.add_argument("--min-stop-atr", type=float, default=1.0, help="最小止损距离 = 倍数*ATR")
    g4.add_argument("--max-stop-pct", type=float, default=12.0, help="止损距离占现价上限%%，超过剔除")
    return ap


def main():
    enable_ansi()
    p = build_parser().parse_args()
    p.lookback = max(1, p.lookback)
    t0 = time.time()

    # 标的集合
    if p.targets:
        config = load_config()
        items = []
        for name, sym in resolve_targets(p.targets, config):
            if not sym:
                print(f"未找到: {name}（可在 stocks.json 中补充代码映射）")
                continue
            items.append({"code": sym[2:], "name": name, "symbol": sym, "industry": "-",
                          "price": None, "chg": None, "amount": None, "float_mv": None})
        scope = f"指定标的 {len(items)} 只"
    else:
        print("拉取全市场列表（东财）...")
        universe = None
        try:
            universe = fetch_universe(p.include_bj)
            if not universe:
                raise OSError("东财返回空列表")
        except (OSError, ValueError) as e:
            print(DIM + f"东财列表不可用（{e}），切换腾讯备用列表 ..." + RESET)
            universe = None
        if universe is None:
            try:
                universe = fetch_universe_tencent()
            except (OSError, ValueError) as e:
                print(f"列表获取失败: {e}")
                print(DIM + "请检查网络/代理后重试；或先用指定标的模式: python screener.py 600030" + RESET)
                return 1
            if not universe:
                print("备用列表为空，请稍后重试")
                return 1
            print(DIM + "备用列表无行业字段（行业列显示 -），其余功能一致" + RESET)
        items = [u for u in universe if base_filter(u, p)]
        scope = f"全市场 {len(universe)} 只 → 预筛 {len(items)} 只"
    if not items:
        print("没有符合条件的标的（可放宽 --min-amount / --min-chg 等预筛条件）")
        return 1

    # 多线程逐只检查
    counters = {"fail": 0, "short": 0, "wide": 0}
    first_err = ""
    signals, watches = [], []
    klines = max(MIN_BARS + 60, min(p.klines, 800))
    done = 0
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
                if kind == "fail" and not first_err:
                    first_err = str(payload or "")[:100]
            done += 1
            if done % 25 == 0 or done == len(items):
                print(f"\r  检查进度 {done}/{len(items)}", end="", flush=True)
    print("\r" + " " * 44 + "\r", end="")

    # 排序与截取
    mode = "预备箱体" if p.watch else "突破信号"
    if p.watch:
        watches.sort(key=lambda x: x[1]["dist_pct"])
        hits, rows = watches, watches[: max(0, p.top)]
    else:
        signals.sort(key=lambda x: (-x[1]["vol_ratio"], -x[1]["chg"]))
        hits, rows = signals, signals[: max(0, p.top)]

    extra = ""
    if counters["short"] or counters["fail"] or counters["wide"]:
        extra = (f"（数据不足 {counters['short']} · 失败 {counters['fail']}"
                 + (f" · 止损过宽剔除 {counters['wide']}" if counters["wide"] else "") + "）")
        if first_err:
            extra += DIM + f" 首个错误: {first_err}" + RESET
        if counters["fail"] > len(items) * 0.2:
            extra += DIM + " 失败过多: 可能被数据源临时限流，建议降低 --workers 或稍后重试" + RESET
    print(BOLD + f"钻潜选股 · {mode}（箱体 {p.box_min}~{p.box_max} 根 ≤{p.box_atr:g}×ATR · "
          f"实体 ≥{p.body_atr:g}×ATR · 量 ≥{p.vol_mult:g}×20日均量 · "
          f"ATR ≤{p.atr_max:g}% · 回看 {p.lookback} 根）" + RESET)
    print(f"{scope} {extra}")
    print(f"{mode}命中 {len(hits)} 只" + (f"，显示前 {len(rows)} 只" if len(rows) < len(hits) else ""))
    if not rows:
        print(DIM + "无命中。可放宽参数（--box-atr/--vol-mult/--atr-max），"
                    "或用 --lookback 扩大回看范围、--watch 查看预备箱体。" + RESET)
    else:
        print()
        if p.watch:
            print_watch(rows)
        else:
            print_signals(rows, p)

    if p.csv and rows:
        save_csv(p.csv, "watch" if p.watch else "signal", rows, p)
        print(f"\n已导出 {len(rows)} 行 → {p.csv}")
    print(f"\n用时 {time.time() - t0:.1f}s · 盘中运行时最后一根K线为实时快照，收盘前信号可能变化")
    print(DIM + "提示: 规则为公开「钻潜」思想的程序化近似；仅供学习研究，不构成投资建议。" + RESET)
    return 0


if __name__ == "__main__":
    sys.exit(main())

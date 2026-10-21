#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
daily.py — 每日分析报告（大盘 + 持仓 + 候选股 + 执行价位 + 条件单）

用法:
  python daily.py                  # 自选股范围（快）
  python daily.py --market         # 全市场扫描（东财列表 + 多线程，较慢）
  python daily.py --top 5 --capital 1000000 --risk 1.0

产出（reports/ 目录，按日期命名，覆盖式更新当日文件）:
  - 每日报告_YYYYMMDD.md   大盘状态 + 持仓盈亏 + 候选股 Top N + 执行价位清单
  - 条件单_YYYYMMDD.csv    券商手工录入用（utf-8-sig）

执行价位口径（全部来自 zuanqian/screener 既有规则，不新造参数）:
  - 突破信号: 买点 = 信号日收盘；止损 = stop（箱体下沿 − 缓冲×ATR）；止盈 = tp1/tp2（R 倍数）
  - 预备箱体: 突破买点 = 箱体上沿 trigger；回踩参考 = trigger；
          止损 = trigger − (stop_buffer + min_stop_atr)×ATR；止盈 = 买点 + tp1/tp2 倍 R
  - 建议股数 = sizing(价格, 止损距离)（单笔风险反推，100 股整手）

流程: 大盘状态（dapan）→ 持仓盈亏（stock）→ 候选股扫描（screener 规则引擎，
突破信号优先、预备箱体补足 Top N）→ 执行价位与条件单清单。

仅供学习研究，不构成投资建议。
"""

from __future__ import annotations

import argparse
import csv
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from copy import copy
from pathlib import Path

import dapan
import stock
import zuanqian
import screener
from screener import MIN_BARS, base_filter, eval_one, fetch_universe, sizing

ROOT = Path(__file__).resolve().parent
REPORTS_DIR = ROOT / "reports"


# ---------------------------------------------------------------- 扫描

def _scan(items, p, klines, watch, label):
    """多线程跑 eval_one，返回 payload 列表（附名称/代码）。"""
    pw = copy(p)
    pw.watch = watch
    out, failed = [], 0
    with ThreadPoolExecutor(max_workers=max(1, pw.workers)) as ex:
        futs = {ex.submit(eval_one, it, pw, klines): it for it in items}
        for fut in as_completed(futs):
            kind, item, payload = fut.result()
            if kind == "fail":
                failed += 1
                continue
            if payload:
                payload["名称"], payload["代码"] = item.get("name"), item.get("symbol")
                out.append(payload)
    if failed:
        print(f"  [{label}] {failed} 只拉取失败已跳过")
    return out


def pick_candidates(items, p, klines, top):
    """突破信号优先，预备箱体补足 Top N；返回 (signals, watches)。"""
    signals = _scan(items, p, klines, watch=False, label="突破信号")
    signals.sort(key=lambda d: (-d["vol_ratio"], -d["chg"]))
    watches = []
    if len(signals) < top:
        watches = _scan(items, p, klines, watch=True, label="预备箱体")
        watches.sort(key=lambda d: d["dist_pct"])
    return signals[:top], watches[:top - len(signals)] if len(signals) < top else []


# ---------------------------------------------------------------- 执行价位

def price_rows(signals, watches, p):
    """合并信号与预备箱体的执行价位（口径见模块 docstring）。"""
    rows = []
    for d in signals:
        shares, pos = sizing(d["close"], d["dist"], p)
        rows.append({
            "名称": d["名称"], "代码": d["代码"], "类型": "突破信号",
            "买点": d["close"], "回踩参考": d["box_high"],
            "止损": d["stop"], "止盈1": d["tp1"], "止盈2": d["tp2"],
            "建议股数": shares, "仓位%": pos,
            "量能": f"{d['vol_ratio']:.2f}", "日期": d["date"],
        })
    for d in watches:
        atr = d["atr_pct"] / 100 * d["close"]
        stop = d["trigger"] - (p.stop_buffer + p.min_stop_atr) * atr
        risk = d["trigger"] - stop
        shares, pos = sizing(d["trigger"], risk, p)
        rows.append({
            "名称": d["名称"], "代码": d["代码"], "类型": "预备箱体",
            "买点": d["trigger"], "回踩参考": d["trigger"],
            "止损": stop, "止盈1": d["trigger"] + p.tp1 * risk,
            "止盈2": d["trigger"] + p.tp2 * risk,
            "建议股数": shares, "仓位%": pos,
            "量能": f"{d['dist_pct']:.1f}%距突破", "日期": d["date"],
        })
    return rows


# ---------------------------------------------------------------- 报告渲染

def _md_table(head, rows):
    out = ["| " + " | ".join(head) + " |",
           "|" + "---|" * len(head)]
    for r in rows:
        out.append("| " + " | ".join(str(r[k]) for k in head) + " |")
    return "\n".join(out)


def render_report(asof, dapan_rows, hold_rows, signals, watches, price_list, top):
    today = stock._beijing_now().strftime("%Y-%m-%d")
    L = [f"# 每日复盘报告 {today}（行情数据截至 {asof or '—'}）\n"]

    L.append("## 一、大盘环境（复盘先看大盘）\n")
    if dapan_rows:
        head = ["名称", "收盘", "涨跌%", "ma5", "ma13", "ma60", "macd柱", "量能"]
        disp = []
        for r in dapan_rows:
            if r.get("状态"):
                disp.append({**{k: "—" for k in head},
                             "名称": r["名称"], "量能": r["状态"]})
                continue
            disp.append({
                "名称": r["名称"], "收盘": f"{r['收盘']:.2f}",
                "涨跌%": f"{r['涨跌%']:+.2f}", "ma5": f"{r['ma5']:.2f}",
                "ma13": f"{r['ma13']:.2f}", "ma60": f"{r['ma60']:.2f}",
                "macd柱": f"{r['macd柱']:.2f}", "量能": r["量能"],
            })
        L.append(_md_table(head, disp))
    else:
        L.append("（无指数数据，先运行 python dapan.py）")
    L.append("")

    L.append("## 二、持仓盈亏\n")
    if hold_rows:
        L.append(_md_table(["名称", "现价", "成本", "盈亏%", "涨跌%"], hold_rows))
    else:
        L.append("（src/*.md 无自选股记录）")
    L.append("")

    L.append(f"## 三、候选股（突破信号优先，Top {top}）\n")
    if signals:
        L.append("### 突破信号\n")
        L.append(_md_table(
            ["名称", "代码", "收盘", "涨跌%", "量能", "箱体上沿", "箱体下沿", "理由"],
            [{"名称": s["名称"], "代码": s["代码"], "收盘": f"{s['close']:.2f}",
              "涨跌%": f"{s['chg']:+.2f}", "量能": f"{s['vol_ratio']:.2f}",
              "箱体上沿": f"{s['box_high']:.2f}", "箱体下沿": f"{s['box_low']:.2f}",
              "理由": "突破箱体上沿"} for s in signals]))
    else:
        L.append("（今日无突破信号）")
    if watches:
        L.append("\n### 预备箱体\n")
        L.append(_md_table(
            ["名称", "代码", "收盘", "涨跌%", "距突破%", "箱体上沿", "箱体下沿"],
            [{"名称": w["名称"], "代码": w["代码"], "收盘": f"{w['close']:.2f}",
              "涨跌%": f"{w['chg']:+.2f}", "距突破%": f"{w['dist_pct']:.1f}",
              "箱体上沿": f"{w['box_high']:.2f}", "箱体下沿": f"{w['box_low']:.2f}"}
             for w in watches]))
    L.append("")

    L.append("## 四、执行价位与条件单\n")
    if price_list:
        L.append(_md_table(
            ["名称", "类型", "买点", "回踩参考", "止损", "止盈1", "止盈2",
             "建议股数", "仓位%"],
            price_list))
    else:
        L.append("（今日无候选股，无条件单）")
    L.append("")
    L.append("> 仅供学习研究，不构成投资建议；执行价位为体系规则推算，下单前自行复核。")
    return "\n".join(L)


def write_csv(path, rows):
    """条件单清单（券商手工录入用，utf-8-sig 方便 Excel 打开）。"""
    head = ["名称", "代码", "方向", "买点", "止损", "止盈1", "止盈2", "建议股数", "备注"]
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(head)
        for r in rows:
            w.writerow([r["名称"], r["代码"], "买",
                        f"{r['买点']:.2f}", f"{r['止损']:.2f}",
                        f"{r['止盈1']:.2f}", f"{r['止盈2']:.2f}",
                        r["建议股数"], f"{r['类型']}（{r['量能']}）"])


# ---------------------------------------------------------------- 主流程

def build_report(scope="watchlist", top=5, capital=1_000_000.0, risk=1.0,
                 include_bj=False, workers=12, market_only_signal=True):
    """生成每日报告，返回 (report_text, csv_path)。抛 ValueError 为可读错误。"""
    p = screener.build_parser().parse_args([])
    p.capital, p.risk, p.workers = capital, risk, workers
    klines = max(MIN_BARS + 60, min(p.klines, 800))

    # 1) 大盘
    dapan_rows, asof = dapan.collect_rows()

    # 2) 持仓
    config = stock.load_config()
    hold_rows = []
    holdings = stock.load_holdings(config)
    if holdings:
        syms = [h["symbol"] for h in holdings if h.get("symbol")]
        quotes = stock.fetch_quotes(syms) if syms else {}
        for h in holdings:
            qt = quotes.get(h.get("symbol")) or {}
            if not qt.get("price"):
                continue
            cost = h.get("cost")
            pnl = (qt["price"] / cost - 1) * 100 if cost else None
            hold_rows.append({
                "名称": h["name"], "现价": f"{qt['price']:.2f}",
                "成本": f"{cost:.2f}" if cost else "—",
                "盈亏%": f"{pnl:+.1f}" if pnl is not None else "—",
                "涨跌%": f"{qt.get('pct', 0):+.2f}",
            })

    # 3) 候选股
    if scope == "market":
        universe = fetch_universe(include_bj)
        items = [u for u in universe if base_filter(u, p)]
        print(f"全市场过滤后 {len(items)} 只，开始扫描…")
        signals, watches = [], []
        sig = _scan(items, p, klines, watch=False, label="突破信号")
        sig.sort(key=lambda d: (-d["vol_ratio"], -d["chg"]))
        signals = sig[:top]
        if len(signals) < top and not market_only_signal:
            w = _scan(items, p, klines, watch=True, label="预备箱体")
            w.sort(key=lambda d: d["dist_pct"])
            watches = w[:top - len(signals)]
    else:
        items = [{"name": h["name"], "symbol": h["symbol"]}
                 for h in holdings if h.get("symbol")]
        if not items:
            raise ValueError("src/*.md 无自选股，或 stocks.json 缺代码映射")
        signals, watches = pick_candidates(items, p, klines, top)

    # 4) 执行价位 + 落盘
    price_list = price_rows(signals, watches, p)
    text = render_report(asof, dapan_rows, hold_rows, signals, watches, price_list, top)

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    day = stock._beijing_now().strftime("%Y%m%d")
    md_path = REPORTS_DIR / f"每日报告_{day}.md"
    csv_path = REPORTS_DIR / f"条件单_{day}.csv"
    md_path.write_text(text, "utf-8")
    if price_list:
        write_csv(csv_path, price_list)
    else:
        csv_path = None
    return text, csv_path


def main(argv=None):
    zuanqian.enable_ansi()
    ap = argparse.ArgumentParser(
        description="每日分析报告（大盘 + 持仓 + 候选股 + 执行价位 + 条件单）",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    ap.add_argument("--market", action="store_true", help="全市场扫描（默认仅自选股）")
    ap.add_argument("--top", type=int, default=5, help="候选股数量上限")
    ap.add_argument("--capital", type=float, default=1_000_000, help="账户资金（元），用于仓位计算")
    ap.add_argument("--risk", type=float, default=1.0, help="单笔风险（%%账户资金）")
    ap.add_argument("--include-bj", action="store_true", help="全市场模式包含北交所")
    ap.add_argument("--workers", type=int, default=12, help="全市场扫描线程数")
    args = ap.parse_args(argv)

    try:
        text, csv_path = build_report(
            scope="market" if args.market else "watchlist",
            top=args.top, capital=args.capital, risk=args.risk,
            include_bj=args.include_bj, workers=args.workers)
    except (OSError, ValueError) as e:
        print(f"生成失败 — {e}")
        return 1
    print(text)
    print()
    day = stock._beijing_now().strftime("%Y%m%d")
    print(zuanqian.paint(1, f"报告已写入 reports/每日报告_{day}.md"
                          + (f"，条件单清单 → reports/条件单_{day}.csv" if csv_path else "")))
    return 0


if __name__ == "__main__":
    sys.exit(main())

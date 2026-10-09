#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""均线金叉·趋势起步与MACD动能确认（数据源：腾讯财经日K接口，仅用标准库，零第三方依赖）

与 zuanqian.py（横盘突破）、qushi.py（趋势回调）互补：捕捉均线多头起步点——
5日均线上穿13日均线（金叉）、收盘站上60日均线（中长期趋势向上）、
MACD柱增大（动能增强）三条件同日满足时视为趋势启动信号。

策略规则（全部可参数化）:
  1. 金叉确认  MA5 上穿 MA13：昨日 MA5 <= MA13 且今日 MA5 > MA13（简单移动平均）
  2. 位置过滤  信号日收盘 > MA60（价格站上60日均线）
  3. 动能确认  MACD柱逐步增大：连续 macd_up 日逐日增大（默认2日，红柱放大或绿柱收窄均算）
              MACD口径与 stock.py 一致：DIF=EMA12-EMA26，DEA=EMA(DIF,9)，柱=2×(DIF-DEA)
  4. 波动过滤  ATR占比超过 atr_max% 不做
  5. 入场      信号次日开盘价买入
  6. 初始止损  入场价 - stop_atr*ATR
  7. 离场      收盘跌破 MA13（金叉关系失效，--exit-ma 可调）；无固定止盈，让利润奔跑
  8. 资金管理  单笔风险 = 资金 * risk%，按止损距离反推股数（100股整数倍，不加杠杆）

用法:
  python jinxian.py                    回测 src/ 全部自选股（汇总）
  python jinxian.py 600030 万华化学     回测指定标的（含交易明细）
  python jinxian.py 600030 --scan      只扫描最近3个交易日信号，不回测
  python jinxian.py 600030 --scan --csv 金叉信号.csv   扫描并导出CSV
  python jinxian.py --full             多标的时也输出完整交易明细
  python jinxian.py --fast 10 --slow 20 --base 60   调参

说明:
  - 均线为简单移动平均（与 stock.py 口径一致）；金叉日信号本身较稀少属正常；
  - 前复权日线数据来自腾讯公开接口；回测结果不代表未来收益，仅供学习研究。
"""
import argparse
import sys

from zuanqian import (RED, BOLD, DIM, RESET, atr_series, enable_ansi, fetch_kline,
                      fill_position, load_config, pad, print_full_report,
                      print_summary_row, resolve_targets, sma_series, summarize,
                      watchlist, write_csv)


# ---------------------------------------------------------------- 指标计算

def _ema(vals, n):
    """EMA（与 stock.py 同口径：首值种子，从第0根起输出，避免长序列初值漂移）。"""
    k = 2.0 / (n + 1)
    out, prev = [], None
    for v in vals:
        prev = v if prev is None else v * k + prev * (1 - k)
        out.append(prev)
    return out


def macd_bar_series(closes):
    """MACD柱序列（口径与 stock.py 一致）：DIF=EMA12-EMA26，柱=2×(DIF-DEA)。"""
    dif = [a - b for a, b in zip(_ema(closes, 12), _ema(closes, 26))]
    return [2 * (d - e) for d, e in zip(dif, _ema(dif, 9))]


def compute_indicators(bars, p):
    closes = [b["close"] for b in bars]
    return {
        "ma_fast": sma_series(closes, p.fast),
        "ma_slow": sma_series(closes, p.slow),
        "ma_base": sma_series(closes, p.base),
        "ma_exit": sma_series(closes, p.exit_ma),
        "macd_bar": macd_bar_series(closes),
        "atr": atr_series(bars, 14),
    }


# ---------------------------------------------------------------- 信号规则

def check_signal(bars, ind, j, p):
    """判断第 j 根K线收盘是否触发均线金叉信号。返回 (信号dict, 未触发原因)。"""
    if j < max(1, p.macd_up):
        return None, "指标未就绪"
    b = bars[j]
    mf, ms, mb = ind["ma_fast"][j], ind["ma_slow"][j], ind["ma_base"][j]
    mf0, ms0 = ind["ma_fast"][j - 1], ind["ma_slow"][j - 1]
    bar = ind["macd_bar"][j]
    if None in (mf, ms, mb, mf0, ms0):
        return None, "指标未就绪"
    if not (mf0 <= ms0 and mf > ms):
        return None, f"MA{p.fast}未上穿MA{p.slow}（非金叉日）"
    if b["close"] <= mb:
        return None, f"收盘未站上MA{p.base}"
    for k in range(p.macd_up):
        if ind["macd_bar"][j - k] <= ind["macd_bar"][j - k - 1]:
            return None, "MACD柱未逐步增大"
    atr = ind["atr"][j]
    if not atr or atr / b["close"] > p.atr_max / 100:
        return None, "波动过大（不做）"
    return {"ma_fast": mf, "ma_slow": ms, "ma_base": mb, "macd_bar": bar}, None


# ---------------------------------------------------------------- 回测引擎

def run_backtest(symbol, bars, ind, p):
    """单标的、单持仓的均线金叉回测。返回 (trades, equity_curve, skipped)。"""
    cash = float(p.capital)
    pos = None
    trades = []
    equity_curve = []
    skipped = 0
    last_exit_bar = -10 ** 9
    n = len(bars)
    warm = max(p.base + 10, 70)

    def close_trade(i, note):
        nonlocal cash, pos, last_exit_bar
        sell_net = sum(pr * sh - fee for _, pr, sh, _, fee in pos["legs"])
        cost_total = pos["shares0"] * pos["entry"] + pos["buy_fee"]
        pnl = sell_net - cost_total
        trades.append({
            "symbol": symbol,
            "entry_date": pos["entry_date"],
            "exit_date": pos["legs"][-1][0],
            "entry": pos["entry"],
            "exit": pos["legs"][-1][1],
            "shares": pos["shares0"],
            "pnl": pnl,
            "r": pnl / (pos["shares0"] * pos["dist"]) if pos["dist"] > 0 else 0.0,
            "bars": i - pos["entry_bar"],
            "note": note,
        })
        pos = None
        last_exit_bar = i

    def sell(i, sh, price, reason):
        nonlocal cash
        proceeds = sh * price
        fee = max(5.0, proceeds * p.commission) + proceeds * p.stamp
        cash += proceeds - fee
        pos["legs"].append((bars[i]["date"], price, sh, reason, fee))
        pos["shares"] -= sh

    for i in range(warm, n):
        b = bars[i]
        if pos is None:
            j = i - 1  # 昨收触发信号 -> 今开入场
            if j >= warm and i - last_exit_bar > p.cooldown:
                sig, _ = check_signal(bars, ind, j, p)
                if sig:
                    atr = ind["atr"][j]
                    entry = b["open"]
                    stop = entry - p.stop_atr * atr
                    dist = entry - stop
                    if dist / entry > p.max_stop_pct / 100:
                        skipped += 1  # 止损过宽，放弃
                    else:
                        shares = int(cash * p.risk / 100 / dist / 100) * 100
                        if shares * entry > cash:
                            shares = int(cash / entry / 100) * 100
                        if shares < 100:
                            skipped += 1  # 资金不足一手
                        else:
                            cost = shares * entry
                            fee = max(5.0, cost * p.commission)
                            cash -= cost + fee
                            pos = {
                                "entry_bar": i, "entry_date": b["date"],
                                "entry": entry, "stop": stop, "dist": dist,
                                "shares0": shares, "shares": shares,
                                "buy_fee": fee, "legs": [],
                            }
        elif i > pos["entry_bar"]:  # T+1：买入当根不动作
            exited = False
            if b["open"] <= pos["stop"]:
                sell(i, pos["shares"], b["open"], "止损(跳空)")
                exited = True
            elif b["low"] <= pos["stop"]:
                sell(i, pos["shares"], pos["stop"], "止损")
                exited = True
            if not exited and pos["shares"] > 0:
                if b["close"] < ind["ma_exit"][i]:
                    sell(i, pos["shares"], b["close"], f"MA{p.exit_ma}跟踪离场")
            if pos and pos["shares"] <= 0:
                close_trade(i, "；".join(lg[3] for lg in pos["legs"]))
        equity_curve.append(cash + (pos["shares"] * b["close"] if pos else 0.0))

    if pos:  # 数据结束强制平仓，保证统计完整
        i = n - 1
        sell(i, pos["shares"], bars[i]["close"], "回测结束平仓")
        close_trade(i, "回测结束平仓")
        equity_curve[-1] = cash
    return trades, equity_curve, skipped


# ---------------------------------------------------------------- 信号扫描

def scan_symbol(name, symbol, p):
    """扫描最近3个交易日的均线金叉信号，打印止损参考并返回一行结果（供CSV导出）。"""
    row = {"名称": name, "代码": symbol, "状态": "", "信号日": "", "收盘价": "",
           "触发价": "", "止损价": "", "止损距离%": "",
           "建议股数": "", "仓位%": "", "趋势": "", "ATR%": "", "说明": ""}
    try:
        bars = fetch_kline(symbol, p.days)
    except OSError as e:
        print(f"{pad(name, 10)} {pad(symbol, 9)} 获取失败: {e}")
        row["状态"], row["说明"] = "获取失败", str(e)
        return row
    if len(bars) < 80:
        print(f"{pad(name, 10)} {pad(symbol, 9)} 数据不足（{len(bars)}根）")
        row["状态"], row["说明"] = "数据不足", f"仅{len(bars)}根K线"
        return row
    ind = compute_indicators(bars, p)
    n = len(bars)
    last = bars[-1]
    atr = ind["atr"][-1] or 0.0
    mf, ms, mb = ind["ma_fast"][-1], ind["ma_slow"][-1], ind["ma_base"][-1]
    up = mb is not None and last["close"] > mb
    if not up:
        trend = f"MA{p.base}下方"
    elif mf is not None and ms is not None and mf > ms:
        trend = f"MA{p.base}上·多头排列"
    else:
        trend = f"MA{p.base}上·未金叉"
    atr_pct = atr / last["close"] * 100 if atr else 0.0
    row.update({"信号日": last["date"], "收盘价": round(last["close"], 2),
                "趋势": trend, "ATR%": round(atr_pct, 1)})
    close_s = f"{last['close']:.2f}"
    head = (f"{pad(name, 10)} {pad(symbol, 9)} {pad(close_s, 8, 'right')} "
            f"趋势:{trend:<12} ATR%:{atr_pct:.1f}  ")

    found = None
    for j in range(max(70, n - 3), n):
        sig, _ = check_signal(bars, ind, j, p)
        if sig:
            found = (j, sig)

    if found:
        j, _ = found
        atr_j = ind["atr"][j]
        entry = bars[j + 1]["open"] if j + 1 < n else last["close"]  # 次日开盘买入
        stop = entry - p.stop_atr * atr_j
        dist = entry - stop
        print(head + f"{RED}信号@{bars[j]['date']}{RESET} "
                     f"MA{p.fast}上穿MA{p.slow} 买入参考{entry:.2f} → 初始止损 {stop:.2f} "
                     f"（收盘跌破MA{p.exit_ma}离场）")
        row.update({"状态": "均线金叉", "信号日": bars[j]["date"], "触发价": round(entry, 2),
                    "止损价": round(stop, 2), "止损距离%": round(dist / entry * 100, 1),
                    "说明": f"MA{p.fast}金叉MA{p.slow}且MACD柱连续{p.macd_up}日增大；收盘跌破MA{p.exit_ma}离场"})
        fill_position(row, entry, dist, p)
        if dist / entry > p.max_stop_pct / 100:
            row["说明"] = f"止损距离超{p.max_stop_pct:g}%上限，按规则放弃"
    elif up and mf is not None and ms is not None and mf > ms:
        print(head + DIM + f"多头排列，等MA{p.fast}回落后再上穿MA{p.slow}触发" + RESET)
        row["状态"] = "等待金叉"
        row["说明"] = f"收盘在MA{p.base}上且MA{p.fast}>MA{p.slow}，金叉日触发信号"
    else:
        _, reason = check_signal(bars, ind, n - 1, p)
        print(head + DIM + f"无信号（{reason}）" + RESET)
        row["状态"], row["说明"] = "无信号", reason
    return row


# ---------------------------------------------------------------- 入口

def build_parser():
    ap = argparse.ArgumentParser(description="均线金叉·趋势起步与MACD动能确认（腾讯日K数据）")
    ap.add_argument("targets", nargs="*", help="股票代码或名称，留空则回测 src/ 全部自选股")
    ap.add_argument("--scan", action="store_true", help="只扫描最近3个交易日的信号，不回测")
    ap.add_argument("--full", action="store_true", help="多标的时也输出完整交易明细")
    ap.add_argument("--csv", metavar="FILE", help="扫描结果导出CSV（配合--scan）")
    ap.add_argument("--days", type=int, default=600, help="回测/扫描取多少根日K（默认600）")
    ap.add_argument("--capital", type=float, default=1_000_000, help="初始资金（默认100万）")
    ap.add_argument("--risk", type=float, default=1.0, help="单笔风险占资金%%（默认1.0）")
    ap.add_argument("--commission", type=float, default=0.0003, help="佣金率（双边，默认万3）")
    ap.add_argument("--stamp", type=float, default=0.0005, help="印花税率（仅卖出，默认万5）")
    ap.add_argument("--fast", type=int, default=5, help="快速均线周期（默认5）")
    ap.add_argument("--slow", type=int, default=13, help="慢速均线周期（默认13）")
    ap.add_argument("--base", type=int, default=60, help="位置过滤均线周期（默认60）")
    ap.add_argument("--macd-up", type=int, default=2, help="MACD柱需连续增大几日（含信号日，默认2）")
    ap.add_argument("--exit-ma", type=int, default=13, help="收盘跌破该均线离场（默认13）")
    ap.add_argument("--stop-atr", type=float, default=2.5,
                    help="初始止损 = 入场价-倍数*ATR（默认2.5）")
    ap.add_argument("--atr-max", type=float, default=7.0, help="ATR占比上限%%，超过不做（默认7.0）")
    ap.add_argument("--max-stop-pct", type=float, default=15.0, help="止损距离占现价上限%%（默认15）")
    ap.add_argument("--cooldown", type=int, default=3, help="平仓后冷却K线数（默认3）")
    return ap


def main():
    enable_ansi()
    p = build_parser().parse_args()
    config = load_config()

    if p.targets:
        targets = resolve_targets(p.targets, config)
    else:
        targets = watchlist(config)
    valid = [(n, s) for n, s in targets if s]
    for n, s in targets:
        if not s:
            print(DIM + f"未找到: {n}（可在 stocks.json 中补充代码映射）" + RESET)
    if not valid:
        print("没有可处理的标的")
        return 1

    if p.scan or p.csv:
        if not p.scan:
            print(DIM + "未指定 --scan，按信号扫描模式输出止损参考" + RESET)
        print(BOLD + "均线金叉信号扫描（最近3个交易日）" + RESET)
        rows = []
        for name, sym in valid:
            r = scan_symbol(name, sym, p)
            if r:
                rows.append(r)
        if p.csv:
            write_csv(p.csv, rows)
        return 0

    warm = max(p.base + 10, 70)
    results = []
    for name, sym in valid:
        try:
            bars = fetch_kline(sym, p.days)
        except OSError as e:
            print(DIM + f"{name} {sym} 获取失败: {e}" + RESET)
            continue
        if len(bars) < warm + 30:
            print(DIM + f"{name} {sym} 数据不足（{len(bars)}根），跳过" + RESET)
            continue
        ind = compute_indicators(bars, p)
        trades, eq, skipped = run_backtest(sym, bars, ind, p)
        st = summarize(trades, eq, bars, warm, p, skipped)
        results.append((name, sym, st))
        if len(results) == 1 or p.full:
            print_full_report(name, sym, st)

    if len(results) > 1:
        print(BOLD + "\n均线金叉回测汇总（参数: "
              f"risk={p.risk:g}% ma={p.fast}/{p.slow}/{p.base} "
              f"止损={p.stop_atr:g}ATR 离场=MA{p.exit_ma}）" + RESET)
        header = ("名称", "代码", "交易", "胜率", "平均R", "盈亏比", "总收益", "回撤", "基准")
        widths = [10, 9, 4, 5, 7, 6, 8, 7, 8]
        print(DIM + " ".join(pad(h, w) for h, w in zip(header, widths)) + RESET)
        for name, sym, st in results:
            print_summary_row(name, sym, st)
    elif results:
        pass
    else:
        print("没有可回测的数据")
        return 1
    print(DIM + "\n提示: 金叉日信号较稀少属正常；回测不代表未来收益，仅供学习研究。" + RESET)
    return 0


if __name__ == "__main__":
    sys.exit(main())

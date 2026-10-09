#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""趋势跟随·回调上车与吊灯止损（数据源：腾讯财经日K接口，仅用标准库，零第三方依赖）

与 zuanqian.py 的「横盘突破」互补：不等箱体形成，在已确认的趋势中趁回调上车，
用吊灯跟踪止损让利润奔跑，专吃大趋势。数据获取与指标计算复用 zuanqian 的公共函数。

策略规则（全部可参数化）:
  1. 趋势确认  EMA快 > EMA慢 且 收盘 > EMA慢（日线多头排列）
  2. 回调到位  最近 pull_age 根K线（含信号日）最低价触及 EMA快（允许 pull_tol% 容差），
              且较低点前 pull_look 根内最高收盘回撤至少 pull_min%（真回调，非贴线爬升）
  3. 企稳确认  信号日收阳、收盘站回 EMA快 且收盘高于昨收
  4. 波动过滤  ATR占比超过 atr_max% 不做
  5. 入场      信号次日开盘价买入
  6. 初始止损  入场价 - stop_atr*ATR
  7. 跟踪止损  吊灯 = 入场后最高收盘 - trail_atr*ATR，只上移不下移
               （用截至昨日数据计算，避免未来函数）
  8. 离场      触发跟踪止损，或收盘跌破 EMA快；无固定止盈、无时间止损，让利润奔跑
  9. 资金管理  单笔风险 = 资金 * risk%，按止损距离反推股数（100股整数倍，不加杠杆）

用法:
  python qushi.py                    回测 src/ 全部自选股（汇总）
  python qushi.py 600030 万华化学     回测指定标的（含交易明细）
  python qushi.py 600030 --scan      只扫描最近信号，不回测
  python qushi.py 600030 --scan --csv 趋势信号.csv   扫描并导出CSV
  python qushi.py --full             多标的时也输出完整交易明细
  python qushi.py --trail-atr 4 --stop-atr 3 --risk 0.5   调参

说明:
  - 趋势跟随胜率偏低（40%上下）靠大赢家盈利，评估看盈亏比与平均R，不要只看胜率；
  - 前复权日线数据来自腾讯公开接口；回测结果不代表未来收益，仅供学习研究。
"""
import argparse
import sys

from zuanqian import (RED, BOLD, DIM, RESET, atr_series, ema_series, enable_ansi,
                      fetch_kline, fill_position, load_config, pad, paint,
                      print_full_report, print_summary_row, resolve_targets,
                      summarize, watchlist, write_csv)


# ---------------------------------------------------------------- 指标计算

def compute_indicators(bars, p):
    closes = [b["close"] for b in bars]
    return {
        "ema": ema_series(closes, p.ema),
        "trend_ema": ema_series(closes, p.trend_ema),
        "atr": atr_series(bars, 14),
    }


# ---------------------------------------------------------------- 信号规则

def check_signal(bars, ind, j, p):
    """判断第 j 根K线收盘是否触发回调企稳信号。返回 (信号dict, 未触发原因)。"""
    b = bars[j]
    ema = ind["ema"][j]
    tema = ind["trend_ema"][j]
    if ema is None or tema is None:
        return None, "指标未就绪"
    if not (ema > tema and b["close"] > tema):
        return None, "趋势未确认（非多头排列）"
    atr = ind["atr"][j]
    if not atr or atr / b["close"] > p.atr_max / 100:
        return None, "波动过大（不做）"
    lo = max(0, j - p.pull_age + 1)
    lowest = min(x["low"] for x in bars[lo:j + 1])
    if lowest > ema * (1 + p.pull_tol / 100):
        return None, "未回调到均线附近"
    hi_ref = max(x["close"] for x in bars[max(0, j - p.pull_look):j])
    if lowest > hi_ref * (1 - p.pull_min / 100):
        return None, "回调幅度不足"
    if b["close"] <= b["open"]:
        return None, "未企稳（非阳线）"
    if b["close"] < ema:
        return None, "收盘仍在均线下方"
    if j > 0 and b["close"] <= bars[j - 1]["close"]:
        return None, "收盘未回升"
    return {"pull_low": lowest}, None


# ---------------------------------------------------------------- 回测引擎

def run_backtest(symbol, bars, ind, p):
    """单标的、单持仓的趋势跟随回测。返回 (trades, equity_curve, skipped)。"""
    cash = float(p.capital)
    pos = None
    trades = []
    equity_curve = []
    skipped = 0
    last_exit_bar = -10 ** 9
    n = len(bars)
    warm = max(p.trend_ema + 10, 70)

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
                                "hi_close": entry,  # 入场后最高收盘（吊灯基准）
                                "buy_fee": fee, "legs": [],
                            }
        elif i > pos["entry_bar"]:  # T+1：买入当根不动作
            exited = False
            atr_prev = ind["atr"][i - 1] or ind["atr"][i]
            if atr_prev:  # 吊灯止损：用截至昨日的最高收盘上移（避免未来函数）
                pos["stop"] = max(pos["stop"], pos["hi_close"] - p.trail_atr * atr_prev)
            if b["open"] <= pos["stop"]:
                sell(i, pos["shares"], b["open"], "止损(跳空)")
                exited = True
            elif b["low"] <= pos["stop"]:
                sell(i, pos["shares"], pos["stop"],
                     "吊灯跟踪止损" if pos["stop"] > pos["entry"] else "止损")
                exited = True
            if not exited and pos["shares"] > 0:
                pos["hi_close"] = max(pos["hi_close"], b["close"])
                if b["close"] < ind["ema"][i]:
                    sell(i, pos["shares"], b["close"], f"EMA{p.ema}跟踪离场")
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
    """扫描最近3个交易日的回调企稳信号，打印止损参考并返回一行结果（供CSV导出）。"""
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
    ema = ind["ema"][-1]
    tema = ind["trend_ema"][-1]
    up = ema is not None and tema is not None and ema > tema and last["close"] > tema
    trend = "多头" if up else "空/震荡"
    atr_pct = atr / last["close"] * 100 if atr else 0.0
    row.update({"信号日": last["date"], "收盘价": round(last["close"], 2),
                "趋势": trend, "ATR%": round(atr_pct, 1)})
    close_s = f"{last['close']:.2f}"
    head = (f"{pad(name, 10)} {pad(symbol, 9)} {pad(close_s, 8, 'right')} "
            f"趋势:{trend:<5} ATR%:{atr_pct:.1f}  ")

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
                     f"买入参考{entry:.2f} → 初始止损 {stop:.2f} "
                     f"（吊灯{p.trail_atr:g}ATR跟踪，收盘跌破EMA{p.ema}离场）")
        row.update({"状态": "回调企稳", "信号日": bars[j]["date"], "触发价": round(entry, 2),
                    "止损价": round(stop, 2), "止损距离%": round(dist / entry * 100, 1),
                    "说明": f"吊灯{p.trail_atr:g}ATR跟踪，收盘跌破EMA{p.ema}离场"})
        fill_position(row, entry, dist, p)
        if dist / entry > p.max_stop_pct / 100:
            row["说明"] = f"止损距离超{p.max_stop_pct:g}%上限，按规则放弃"
    elif up and ema is not None:
        gap = (last["close"] - ema) / ema * 100
        tip = f"（现价高于均线{gap:+.1f}%）" if gap > p.pull_tol else ""
        print(head + DIM + f"趋势多头，等回调至EMA{p.ema}≈{ema:.2f}附近企稳{tip}" + RESET)
        row["状态"] = "等待回调"
        row["说明"] = f"EMA{p.ema}参考位{ema:.2f}，回调触及且收阳站回可关注"
    else:
        _, reason = check_signal(bars, ind, n - 1, p)
        print(head + DIM + f"无信号（{reason}）" + RESET)
        row["状态"], row["说明"] = "无信号", reason
    return row


# ---------------------------------------------------------------- 入口

def build_parser():
    ap = argparse.ArgumentParser(description="趋势跟随·回调上车与吊灯止损（腾讯日K数据）")
    ap.add_argument("targets", nargs="*", help="股票代码或名称，留空则回测 src/ 全部自选股")
    ap.add_argument("--scan", action="store_true", help="只扫描最近3个交易日的信号，不回测")
    ap.add_argument("--full", action="store_true", help="多标的时也输出完整交易明细")
    ap.add_argument("--csv", metavar="FILE", help="扫描结果导出CSV（配合--scan）")
    ap.add_argument("--days", type=int, default=600, help="回测/扫描取多少根日K（默认600）")
    ap.add_argument("--capital", type=float, default=1_000_000, help="初始资金（默认100万）")
    ap.add_argument("--risk", type=float, default=1.0, help="单笔风险占资金%%（默认1.0）")
    ap.add_argument("--commission", type=float, default=0.0003, help="佣金率（双边，默认万3）")
    ap.add_argument("--stamp", type=float, default=0.0005, help="印花税率（仅卖出，默认万5）")
    ap.add_argument("--ema", type=int, default=20, help="回调参考/跟踪离场EMA周期（默认20）")
    ap.add_argument("--trend-ema", type=int, default=60, help="趋势确认EMA周期（默认60）")
    ap.add_argument("--pull-age", type=int, default=5, help="回调发生在最近几根K线内（默认5）")
    ap.add_argument("--pull-tol", type=float, default=1.0, help="回调触及EMA的容差%%（默认1.0）")
    ap.add_argument("--pull-look", type=int, default=20, help="回调参照的高点回看窗口（默认20）")
    ap.add_argument("--pull-min", type=float, default=1.5, help="低点较高点回撤下限%%（默认1.5）")
    ap.add_argument("--stop-atr", type=float, default=2.5,
                    help="初始止损 = 入场价-倍数*ATR（默认2.5）")
    ap.add_argument("--trail-atr", type=float, default=3.0,
                    help="吊灯跟踪止损 = 最高收盘-倍数*ATR（默认3.0）")
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
        print(BOLD + "趋势跟随信号扫描（最近3个交易日）" + RESET)
        rows = []
        for name, sym in valid:
            r = scan_symbol(name, sym, p)
            if r:
                rows.append(r)
        if p.csv:
            write_csv(p.csv, rows)
        return 0

    warm = max(p.trend_ema + 10, 70)
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
        print(BOLD + "\n趋势跟随回测汇总（参数: "
              f"risk={p.risk:g}% ema={p.ema}/{p.trend_ema} "
              f"止损={p.stop_atr:g}ATR 吊灯={p.trail_atr:g}ATR）" + RESET)
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
    print(DIM + "\n提示: 趋势跟随胜率偏低靠大赢家盈利；回测不代表未来收益，仅供学习研究。" + RESET)
    return 0


if __name__ == "__main__":
    sys.exit(main())

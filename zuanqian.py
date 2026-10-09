#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""钻潜交易体系·规则化回测与信号扫描（数据源：腾讯财经日K接口，仅用标准库，零第三方依赖）

把「横盘做突破 + 动能确认 + 量价配合 + 趋势过滤 + 固定风险仓位」这套价格行为
规则写成可回测的程序，用来验证策略思想在历史数据上的统计表现。

策略规则（全部可参数化）:
  1. 趋势定义  日线收盘 > EMA趋势线且均线上行，且周线收盘 > 周线EMA（多周期共振）
  2. 两类不做  趋势向下不做；ATR占比过高（波动极端）不做
  3. 横盘箱体  最近 box_min~box_max 根K线高低点区间 <= box_atr * ATR
  4. 动能突破  阳线实体 >= body_atr * ATR，收盘突破箱体上沿且未远离（防追高）
  5. 量价配合  突破日成交量 >= vol_mult * 20日均量，且收盘位于K线上部60%
  6. 入场      信号次日开盘价买入
  7. 止损      箱体下沿 - stop_buffer*ATR（结构破坏）；过窄则放宽到 min_stop_atr*ATR
  8. 止盈      达到 tp1*R 减半仓并将止损上移到成本；其余在 tp2*R 或收盘跌破EMA20离场
  9. 资金管理  单笔风险 = 资金 * risk%，按止损距离反推股数（100股整数倍，不加杠杆）
  10. 规则化   T+1、佣金/印花税、时间止损，全程无主观干预

用法:
  python zuanqian.py                    回测 src/ 全部自选股（汇总）
  python zuanqian.py 600030 万华化学     回测指定标的（含交易明细）
  python zuanqian.py 600030 --scan      只扫描最近信号，不回测
  python zuanqian.py 600030 --scan --csv 信号.csv   扫描并导出止盈止损CSV
  python zuanqian.py --full             多标的时也输出完整交易明细
  python zuanqian.py 600030 --risk 0.5 --tp1 1.5 --tp2 2.5   调参

说明:
  - 规则是对公开流传的「钻潜」思想的程序化近似，并非官方课程内容；
  - 前复权日线数据来自腾讯公开接口；回测结果不代表未来收益，仅供学习研究。
"""
import argparse
import csv
import json
import os
import sys
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC_DIR = ROOT / "src"
CONFIG_FILE = ROOT / "stocks.json"

KLINE_URLS = ("https://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param={},day,,,{},qfq",
              "https://ifzq.gtimg.cn/appstock/app/fqkline/get?param={},day,,,{},qfq",
              # proxy 域名的路径必须带 /ifzqgtimg 前缀
              "https://proxy.finance.qq.com/ifzqgtimg/appstock/app/fqkline/get?param={},day,,,{},qfq")

# 红涨绿跌（A股习惯）
RED, GREEN, DIM, BOLD, RESET = "\033[31m", "\033[32m", "\033[2m", "\033[1m", "\033[0m"


def enable_ansi():
    os.system("")  # 让 Windows 终端启用 ANSI 转义序列
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except AttributeError:
            pass


def paint(v, text):
    if v > 0:
        return f"{RED}{text}{RESET}"
    if v < 0:
        return f"{GREEN}{text}{RESET}"
    return text


def disp_width(s):
    return sum(2 if ord(ch) > 127 else 1 for ch in s)


def pad(s, width, align="left"):
    gap = width - disp_width(s)
    if gap <= 0:
        return s
    return s + " " * gap if align == "left" else " " * gap + s


# ---------------------------------------------------------------- 数据获取

def guess_symbol(token):
    """根据代码推断带交易所前缀的代码，如 600030 -> sh600030。"""
    t = token.strip().lower()
    if len(t) >= 8 and t[:2] in ("sh", "sz", "bj") and t[2:].isdigit():
        return t
    if len(t) == 6 and t.isdigit():
        head = t[0]
        if head in "569":
            return "sh" + t
        if head in "0123":
            return "sz" + t
        if head in "48":
            return "bj" + t
    return None


def load_config():
    if CONFIG_FILE.exists():
        try:
            return json.loads(CONFIG_FILE.read_text("utf-8"))
        except (json.JSONDecodeError, OSError):
            pass
    return {}


def fetch_kline(symbol, count):
    """腾讯日K（前复权），返回 [{date, open, close, high, low, vol}, ...]"""
    data = None
    for tpl in KLINE_URLS:
        req = urllib.request.Request(tpl.format(symbol, min(count, 800)),
                                     headers={"User-Agent": "Mozilla/5.0"})
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode("utf-8", errors="replace"))
            break
        except (OSError, ValueError):
            continue
    if data is None:
        raise OSError(f"K线接口不可用: {symbol}")
    node = (data.get("data") or {}).get(symbol) or {}
    rows = node.get("qfqday") or node.get("day") or []
    bars = []
    for r in rows:
        try:
            bars.append({
                "date": r[0],
                "open": float(r[1]),
                "close": float(r[2]),
                "high": float(r[3]),
                "low": float(r[4]),
                "vol": float(r[5]) if len(r) > 5 and r[5] else 0.0,
            })
        except (ValueError, IndexError):
            continue
    return bars


# ---------------------------------------------------------------- 指标计算

def ema_series(values, n):
    out = [None] * len(values)
    if len(values) < n:
        return out
    k = 2.0 / (n + 1)
    e = sum(values[:n]) / n
    out[n - 1] = e
    for i in range(n, len(values)):
        e = values[i] * k + e * (1 - k)
        out[i] = e
    return out


def sma_series(values, n):
    out = [None] * len(values)
    s = 0.0
    for i, v in enumerate(values):
        s += v
        if i >= n:
            s -= values[i - n]
        if i >= n - 1:
            out[i] = s / n
    return out


def atr_series(bars, n=14):
    trs = []
    for i, b in enumerate(bars):
        if i == 0:
            trs.append(b["high"] - b["low"])
        else:
            pc = bars[i - 1]["close"]
            trs.append(max(b["high"] - b["low"], abs(b["high"] - pc), abs(b["low"] - pc)))
    out = [None] * len(bars)
    if len(bars) < n:
        return out
    a = sum(trs[:n]) / n
    out[n - 1] = a
    for i in range(n, len(bars)):
        a = (a * (n - 1) + trs[i]) / n
        out[i] = a
    return out


def daily_flags(closes, ema_n, slope_lb=5):
    """日线趋势：收盘在EMA上方且EMA上行。"""
    e = ema_series(closes, ema_n)
    flags = []
    for i in range(len(closes)):
        if e[i] is None or i < slope_lb or e[i - slope_lb] is None:
            flags.append(False)
        else:
            flags.append(closes[i] > e[i] and e[i] > e[i - slope_lb])
    return flags


def weekly_flags(bars, ema_n=8):
    """周线环境：当前收盘 > 上一完整周的周线EMA（只用已完结周，避免未来函数）。"""
    flags = [False] * len(bars)
    completed = []          # 已完结周的收盘
    cur_key, cur_close = None, None
    ema = None
    k = 2.0 / (ema_n + 1)
    for i, b in enumerate(bars):
        try:
            key = datetime.strptime(b["date"], "%Y-%m-%d").isocalendar()[:2]
        except ValueError:
            key = b["date"][:7]
        if key != cur_key:
            if cur_key is not None:
                completed.append(cur_close)
                if len(completed) >= ema_n:
                    if ema is None:
                        ema = sum(completed[-ema_n:]) / ema_n
                    else:
                        ema = completed[-1] * k + ema * (1 - k)
            cur_key, cur_close = key, b["close"]
        else:
            cur_close = b["close"]
        if ema is not None:
            flags[i] = b["close"] > ema
    return flags


def compute_indicators(bars, p):
    closes = [b["close"] for b in bars]
    return {
        "ema_exit": ema_series(closes, 20),
        "atr": atr_series(bars, 14),
        "vol_ma": sma_series([b["vol"] for b in bars], 20),
        "daily_up": daily_flags(closes, p.ema_trend),
        "weekly_up": weekly_flags(bars, p.weekly_ema),
    }


# ---------------------------------------------------------------- 信号规则

def find_box(bars, atr, j, p):
    """在信号K线 j 之前寻找横盘箱体，返回 (box_high, box_low, L) 或 None（取最长有效箱体）。"""
    for L in range(p.box_max, p.box_min - 1, -1):
        lo = j - L
        if lo < 0:
            continue
        seg = bars[lo:j]
        bh = max(b["high"] for b in seg)
        bl = min(b["low"] for b in seg)
        if atr and (bh - bl) <= p.box_atr * atr:
            return bh, bl, L
    return None


def check_signal(bars, ind, j, p):
    """判断第 j 根K线收盘是否触发钻潜突破信号。返回 (信号dict, 未触发原因)。"""
    """判断第 j 根K线收盘是否触发钻潜突破信号。返回 (信号dict, 未触发原因)。"""
    b = bars[j]
    if not (ind["daily_up"][j] and ind["weekly_up"][j]):
        return None, "趋势过滤未通过"
    atr = ind["atr"][j]
    if not atr or atr / b["close"] > p.atr_max / 100:
        return None, "波动过大（不做）"
    box = find_box(bars, atr, j, p)
    if not box:
        return None, "无有效横盘箱体"
    bh, bl, L = box
    if b["close"] <= bh:
        return None, "未突破箱体上沿"
    if b["close"] - bh > p.chase_atr * atr:
        return None, "突破过远（防追高）"
    if b["close"] - b["open"] < p.body_atr * atr:
        return None, "动能不足"
    hl = b["high"] - b["low"]
    if hl > 0 and (b["close"] - b["low"]) / hl < 0.6:
        return None, "收盘偏弱"
    vma = ind["vol_ma"][j]
    if vma and b["vol"] < p.vol_mult * vma:
        return None, "量能不足"
    return {"box_high": bh, "box_low": bl, "L": L}, None


# ---------------------------------------------------------------- 回测引擎

def run_backtest(symbol, bars, ind, p):
    """单标的、单持仓的规则化回测。返回 (trades, equity_curve, skipped)。"""
    cash = float(p.capital)
    pos = None
    trades = []
    equity_curve = []
    skipped = 0
    last_exit_bar = -10 ** 9
    n = len(bars)
    warm = max(p.ema_trend + 10, 70)

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
            "stop": pos["stop"], "tp1": pos["tp1"], "tp2": pos["tp2"],
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
                    stop = sig["box_low"] - p.stop_buffer * atr
                    dist = entry - stop
                    if dist < p.min_stop_atr * atr:
                        dist = p.min_stop_atr * atr
                        stop = entry - dist
                    if entry <= stop or dist / entry > p.max_stop_pct / 100:
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
                                "tp1": entry + p.tp1 * dist,
                                "tp2": entry + p.tp2 * dist,
                                "tp1_done": False, "buy_fee": fee, "legs": [],
                            }
        elif i > pos["entry_bar"]:  # T+1：买入当根不动作
            exited = False
            if b["open"] <= pos["stop"]:
                sell(i, pos["shares"], b["open"], "止损(跳空)")
                exited = True
            elif b["low"] <= pos["stop"]:
                sell(i, pos["shares"], pos["stop"], "保本止损" if pos["tp1_done"] else "止损")
                exited = True
            if not exited and pos["shares"] > 0:
                if not pos["tp1_done"] and b["high"] >= pos["tp1"]:
                    half = (pos["shares"] // 2) // 100 * 100
                    if half >= 100 and pos["shares"] - half >= 100:
                        sell(i, half, pos["tp1"], f"止盈{p.tp1:g}R减半")
                        pos["stop"] = max(pos["stop"], pos["entry"])
                        pos["tp1_done"] = True
                    else:
                        sell(i, pos["shares"], pos["tp1"], f"止盈{p.tp1:g}R")
                if pos["shares"] > 0 and pos["tp1_done"] and b["low"] <= pos["stop"]:
                    sell(i, pos["shares"], pos["stop"], "保本止损")
                elif pos["shares"] > 0 and pos["tp1_done"] and b["high"] >= pos["tp2"]:
                    sell(i, pos["shares"], pos["tp2"], f"止盈{p.tp2:g}R")
                elif pos["shares"] > 0 and pos["tp1_done"] and b["close"] < ind["ema_exit"][i]:
                    sell(i, pos["shares"], b["close"], "EMA20跟踪离场")
                elif pos["shares"] > 0 and i - pos["entry_bar"] >= p.max_hold:
                    sell(i, pos["shares"], b["close"], "时间止损")
            if pos and pos["shares"] <= 0:
                close_trade(i, "；".join(lg[3] for lg in pos["legs"]))
        equity_curve.append(cash + (pos["shares"] * b["close"] if pos else 0.0))

    if pos:  # 数据结束强制平仓，保证统计完整
        i = n - 1
        sell(i, pos["shares"], bars[i]["close"], "回测结束平仓")
        close_trade(i, "回测结束平仓")
        equity_curve[-1] = cash
    return trades, equity_curve, skipped


def summarize(trades, equity_curve, bars, warm, p, skipped):
    eq = equity_curve
    final = eq[-1] if eq else p.capital
    total_ret = (final / p.capital - 1) * 100
    peak, max_dd = -1.0, 0.0
    for v in eq:
        peak = max(peak, v)
        if peak > 0:
            max_dd = min(max_dd, (v / peak - 1) * 100)
    wins = [t for t in trades if t["pnl"] > 0]
    losses = [t for t in trades if t["pnl"] <= 0]
    gw = sum(t["pnl"] for t in wins)
    gl = -sum(t["pnl"] for t in losses)
    bench = (bars[-1]["close"] / bars[warm]["close"] - 1) * 100 if len(bars) > warm else 0.0
    return {
        "trades": trades, "final": final, "total_ret": total_ret, "max_dd": max_dd,
        "n": len(trades), "win_rate": len(wins) / len(trades) * 100 if trades else 0.0,
        "avg_r": sum(t["r"] for t in trades) / len(trades) if trades else 0.0,
        "pf": gw / gl if gl > 0 else float("inf"),
        "bench": bench, "skipped": skipped,
        "start_date": bars[warm]["date"] if len(bars) > warm else "-",
        "end_date": bars[-1]["date"] if bars else "-",
        "bars": max(0, len(bars) - warm),
    }


# ---------------------------------------------------------------- 输出

def print_full_report(name, symbol, st):
    line = "─" * 66
    print(f"\n{BOLD}{name} {symbol}{RESET}  {DIM}{st['start_date']} ~ {st['end_date']}（{st['bars']}根K线）{RESET}")
    print(line)
    eq_s = paint(st["total_ret"], f"{st['final']:,.0f}（{st['total_ret']:+.2f}%）")
    bench_s = paint(st["bench"], f"{st['bench']:+.2f}%")
    r_s = paint(st["avg_r"], f"{st['avg_r']:+.2f}")
    print(f"期末权益    {eq_s}   基准买入持有: {bench_s}")
    print(f"最大回撤    {st['max_dd']:.2f}%")
    pf = f"{st['pf']:.2f}" if st["pf"] != float("inf") else "∞"
    print(f"交易次数    {st['n']}   胜率 {st['win_rate']:.1f}%   平均R {r_s}   盈亏比 {pf}")
    if st["skipped"]:
        print(DIM + f"跳过信号    {st['skipped']} 个（止损过宽/资金不足）" + RESET)
    if not st["trades"]:
        print(DIM + "区间内无成交易信号" + RESET)
        return
    header = ("#", "买入日", "卖出日", "买入价", "卖出价", "股数", "净盈亏", "R", "天", "出场")
    widths = [4, 11, 11, 9, 9, 7, 11, 7, 4, 24]
    print(DIM + " ".join(pad(h, w) for h, w in zip(header, widths)) + RESET)
    for k, t in enumerate(st["trades"], 1):
        row = [
            pad(str(k), widths[0]),
            pad(t["entry_date"], widths[1]),
            pad(t["exit_date"], widths[2]),
            pad(f"{t['entry']:.2f}", widths[3], "right"),
            pad(f"{t['exit']:.2f}", widths[4], "right"),
            pad(f"{t['shares']}", widths[5], "right"),
            pad(f"{t['pnl']:+,.0f}", widths[6], "right"),
            pad(f"{t['r']:+.2f}", widths[7], "right"),
            pad(str(t["bars"]), widths[8], "right"),
            pad(t["note"], widths[9]),
        ]
        row[6] = paint(t["pnl"], row[6])
        row[7] = paint(t["r"], row[7])
        print(" ".join(row))


def print_summary_row(name, symbol, st):
    pf = f"{st['pf']:.2f}" if st["pf"] != float("inf") else "∞"
    row = [
        pad(name, 10), pad(symbol, 9),
        pad(str(st["n"]), 4, "right"),
        pad(f"{st['win_rate']:.0f}%", 5, "right"),
        pad(f"{st['avg_r']:+.2f}", 7, "right"),
        pad(pf, 6, "right"),
        pad(f"{st['total_ret']:+.1f}%", 8, "right"),
        pad(f"{st['max_dd']:.1f}%", 7, "right"),
        pad(f"{st['bench']:+.1f}%", 8, "right"),
    ]
    row[6] = paint(st["total_ret"], row[6])
    print(" ".join(row))


# ---------------------------------------------------------------- 信号扫描

def fill_position(row, ref_price, dist, p):
    """按资金管理规则填入建议股数与仓位占比（与回测口径一致）。"""
    if dist <= 0:
        return
    shares = int(p.capital * p.risk / 100 / dist / 100) * 100
    if shares >= 100:
        row["建议股数"] = shares
        row["仓位%"] = round(shares * ref_price / p.capital * 100, 1)


def scan_symbol(name, symbol, p):
    """扫描最近3个交易日信号，打印止盈止损位并返回一行结果（供CSV导出）。"""
    row = {"名称": name, "代码": symbol, "状态": "", "信号日": "", "收盘价": "",
           "触发价": "", "箱体下沿": "", "箱体上沿": "", "箱体根数": "",
           "止损价": "", "止盈1价": "", "止盈2价": "", "止损距离%": "",
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
    trend = "多" if (ind["daily_up"][-1] and ind["weekly_up"][-1]) else \
            ("日多周弱" if ind["daily_up"][-1] else "空/震荡")
    atr_pct = atr / last["close"] * 100 if atr else 0.0
    row.update({"信号日": last["date"], "收盘价": round(last["close"], 2),
                "趋势": trend, "ATR%": round(atr_pct, 1)})
    close_s = f"{last['close']:.2f}"
    head = (f"{pad(name, 10)} {pad(symbol, 9)} {pad(close_s, 8, 'right')} "
            f"趋势:{trend:<6} ATR%:{atr_pct:.1f}  ")

    found = None
    for j in range(max(70, n - 3), n):
        sig, _ = check_signal(bars, ind, j, p)
        if sig:
            found = (j, sig)

    if found:
        j, sig = found
        stop = sig["box_low"] - p.stop_buffer * atr
        entry = bars[j + 1]["open"] if j + 1 < n else last["close"]  # 次日开盘买入
        dist = max(entry - stop, p.min_stop_atr * atr)
        tp1, tp2 = entry + p.tp1 * dist, entry + p.tp2 * dist
        print(head + f"{RED}信号@{bars[j]['date']}{RESET} "
                     f"箱体{sig['box_low']:.2f}~{sig['box_high']:.2f}({sig['L']}根) "
                     f"买入参考{entry:.2f} → 止损 {stop:.2f} / 止盈1 {tp1:.2f} / 止盈2 {tp2:.2f}")
        row.update({"状态": "突破信号", "信号日": bars[j]["date"], "触发价": round(entry, 2),
                    "箱体下沿": round(sig["box_low"], 2), "箱体上沿": round(sig["box_high"], 2),
                    "箱体根数": sig["L"], "止损价": round(stop, 2),
                    "止盈1价": round(tp1, 2), "止盈2价": round(tp2, 2),
                    "止损距离%": round(dist / entry * 100, 1)})
        fill_position(row, entry, dist, p)
        if dist / entry > p.max_stop_pct / 100:
            row["说明"] = f"止损距离超{p.max_stop_pct:g}%上限，按规则放弃"
    else:
        _, reason = check_signal(bars, ind, n - 1, p)
        box = find_box(bars, atr, n - 1, p) if reason == "未突破箱体上沿" and atr else None
        if box:
            bh, bl, ln = box
            dist_pct = (bh - last["close"]) / last["close"] * 100
            if dist_pct <= p.watch_dist:
                trigger = bh
                stop = bl - p.stop_buffer * atr
                dist = max(trigger - stop, p.min_stop_atr * atr)
                tp1, tp2 = trigger + p.tp1 * dist, trigger + p.tp2 * dist
                print(head + f"预备箱体 箱体{bl:.2f}~{bh:.2f}({ln}根) "
                             f"触发{trigger:.2f}(距{dist_pct:+.1f}%) → "
                             f"止损 {stop:.2f} / 止盈1 {tp1:.2f} / 止盈2 {tp2:.2f}")
                row.update({"状态": "预备箱体", "触发价": round(trigger, 2),
                            "箱体下沿": round(bl, 2), "箱体上沿": round(bh, 2),
                            "箱体根数": ln, "止损价": round(stop, 2),
                            "止盈1价": round(tp1, 2), "止盈2价": round(tp2, 2),
                            "止损距离%": round(dist / trigger * 100, 1),
                            "说明": "收盘站上触发价按突破信号执行"})
                fill_position(row, trigger, dist, p)
                return row
        print(head + DIM + f"无信号（{reason}）" + RESET)
        row["状态"], row["说明"] = "无信号", reason
    return row


def write_csv(path, rows):
    """扫描结果导出CSV（utf-8-sig带BOM，Excel直接打开不乱码）。"""
    if not rows:
        print("没有可导出的数据")
        return
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    print(f"\n已导出 {len(rows)} 条 → {path}")


# ---------------------------------------------------------------- 入口

def resolve_targets(tokens, config):
    """代码/名称 -> (名称, 带前缀代码)。名称优先查 stocks.json。"""
    out = []
    for t in tokens:
        sym = guess_symbol(t)
        if sym:
            out.append((t, sym))
            continue
        code = config.get(t)
        if code:
            sym = guess_symbol(code)
            if sym:
                out.append((t, sym))
                continue
        out.append((t, None))
    return out


def watchlist(config):
    """src/*.md 文件名即自选股名称，经 stocks.json 映射为代码。"""
    items = []
    if SRC_DIR.is_dir():
        for md in sorted(SRC_DIR.glob("*.md")):
            code = config.get(md.stem)
            sym = guess_symbol(code) if code else None
            items.append((md.stem, sym))
    return items


def build_parser():
    ap = argparse.ArgumentParser(description="钻潜交易体系·规则化回测与信号扫描（腾讯日K数据）")
    ap.add_argument("targets", nargs="*", help="股票代码或名称，留空则回测 src/ 全部自选股")
    ap.add_argument("--scan", action="store_true", help="只扫描最近3个交易日的信号，不回测")
    ap.add_argument("--full", action="store_true", help="多标的时也输出完整交易明细")
    ap.add_argument("--csv", metavar="FILE", help="扫描结果导出CSV（配合--scan，含止盈止损位）")
    ap.add_argument("--watch-dist", type=float, default=3.0,
                    help="预备箱体: 收盘距触发价上限%%（默认3）")
    ap.add_argument("--days", type=int, default=600, help="回测/扫描取多少根日K（默认600）")
    ap.add_argument("--capital", type=float, default=1_000_000, help="初始资金（默认100万）")
    ap.add_argument("--risk", type=float, default=1.0, help="单笔风险占资金%%（默认1.0）")
    ap.add_argument("--commission", type=float, default=0.0003, help="佣金率（双边，默认万3）")
    ap.add_argument("--stamp", type=float, default=0.0005, help="印花税率（仅卖出，默认万5）")
    ap.add_argument("--ema-trend", type=int, default=60, help="日线趋势EMA周期（默认60）")
    ap.add_argument("--weekly-ema", type=int, default=8, help="周线趋势EMA周期（默认8）")
    ap.add_argument("--box-min", type=int, default=6, help="横盘箱体最短K线数（默认6）")
    ap.add_argument("--box-max", type=int, default=25, help="横盘箱体最长K线数（默认25）")
    ap.add_argument("--box-atr", type=float, default=3.0, help="箱体宽度上限 = 倍数*ATR（默认3.0）")
    ap.add_argument("--body-atr", type=float, default=1.0, help="突破阳线实体下限 = 倍数*ATR（默认1.0）")
    ap.add_argument("--vol-mult", type=float, default=1.5, help="突破量能下限 = 倍数*20日均量（默认1.5）")
    ap.add_argument("--atr-max", type=float, default=7.0, help="ATR占比上限%%，超过不做（默认7.0）")
    ap.add_argument("--chase-atr", type=float, default=1.0, help="收盘超出箱体上沿多少倍ATR放弃（默认1.0）")
    ap.add_argument("--tp1", type=float, default=2.0, help="第一止盈R倍数，减半仓（默认2.0）")
    ap.add_argument("--tp2", type=float, default=3.0, help="第二止盈R倍数（默认3.0）")
    ap.add_argument("--stop-buffer", type=float, default=0.2, help="止损低于箱体下沿的ATR缓冲（默认0.2）")
    ap.add_argument("--min-stop-atr", type=float, default=1.0, help="最小止损距离 = 倍数*ATR（默认1.0）")
    ap.add_argument("--max-stop-pct", type=float, default=12.0, help="止损距离占现价上限%%（默认12）")
    ap.add_argument("--max-hold", type=int, default=60, help="最长持仓K线数（默认60）")
    ap.add_argument("--cooldown", type=int, default=5, help="平仓后冷却K线数（默认5）")
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
            print(DIM + "未指定 --scan，按信号扫描模式输出止盈止损位" + RESET)
        print(BOLD + "钻潜信号扫描（最近3个交易日）" + RESET)
        rows = []
        for name, sym in valid:
            r = scan_symbol(name, sym, p)
            if r:
                rows.append(r)
        if p.csv:
            write_csv(p.csv, rows)
        return 0

    warm = max(p.ema_trend + 10, 70)
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
        print(BOLD + "\n钻潜体系回测汇总（参数: "
              f"risk={p.risk:g}% box={p.box_min}~{p.box_max} tp={p.tp1:g}R/{p.tp2:g}R）" + RESET)
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
    print(DIM + "\n提示: 规则为公开「钻潜」思想的程序化近似；回测不代表未来收益，仅供学习研究。" + RESET)
    return 0


if __name__ == "__main__":
    sys.exit(main())

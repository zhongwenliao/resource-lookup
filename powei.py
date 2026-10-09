#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""5 分钟破位预警（钻潜交易体系·盘中风控补充模块）。

独立模块、默认关闭：不改动任何既有工具的行为，仅显式运行本脚本时生效。

用途：
  盘中/盘后检查自选股是否在 5 分钟级别跌破关键位并输出预警。关键位与
  zuanqian.py 回测同口径（前复权日K计算）：
    1. 箱体下沿   find_box 在最近完成日K上寻找横盘箱体（与回测同一函数）
    2. 止损参考位 箱体下沿 - stop_buffer*ATR（与回测止损公式一致，缓冲为0时不单列）
    3. EMA20      回测跟踪离场参考线
  判定：当日 5 分钟K线最低价跌破关键位记"盘中破位"；最新价仍在线下为
  "破位未收复"（强预警 [!]），已收回线上为"盘中破已收复"（弱预警 [~]）。

用法：
  python powei.py                    # 检查 src/ 全部自选股
  python powei.py 万华化学 600030    # 检查指定标的（名称或6位代码，可混用）
  python powei.py --box-atr 3.0 --stop-buffer 0.2   # 覆盖箱体/止损参数

口径：
  日K为前复权（与回测一致）；5分钟K线为腾讯接口原始价格（不复权），
  近期除权的标的两者不可比，程序检测到价格差异过大时会标注"仅供参考"。
  盘中（15:00 前）最后一根日K未完成，关键位计算自动剔除该根。
  5分钟数据取腾讯多域名接口，单域名失败自动切换，单只失败只跳过不中断。
  仅供学习研究，不构成投资建议。
"""
import argparse
import json
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta, timezone

from zuanqian import (DIM, RED, RESET, build_parser, compute_indicators,
                      disp_width, enable_ansi, fetch_kline, find_box,
                      load_config, open_url, pad, paint, resolve_targets,
                      watchlist)

# 腾讯5分钟K线，多域名轮换（proxy 域名路径带 /ifzqgtimg 前缀，同日K接口约定）
M5_URLS = ("https://web.ifzq.gtimg.cn/appstock/app/kline/mkline?param={},m5,,{}",
           "https://ifzq.gtimg.cn/appstock/app/kline/mkline?param={},m5,,{}",
           "https://proxy.finance.qq.com/ifzqgtimg/appstock/app/kline/mkline?param={},m5,,{}")
M5_COUNT = 320        # 5分钟K线根数（约6.7个交易日，足够覆盖当日）
DAY_COUNT = 160       # 日K根数（箱体35根 + ATR14/EMA20 预热足够）
WORKERS = 6           # 并发线程数
TZ_BJ = timezone(timedelta(hours=8))   # 北京时间


# ---------------------------------------------------------------- 数据获取

def fetch_m5(symbol, count=M5_COUNT):
    """腾讯5分钟K线（不复权），返回 [{date, time, open, close, high, low}, ...]"""
    data = None
    for tpl in M5_URLS:
        req = urllib.request.Request(tpl.format(symbol, min(count, 800)),
                                     headers={"User-Agent": "Mozilla/5.0"})
        try:
            with open_url(req, timeout=15) as resp:
                data = json.loads(resp.read().decode("utf-8", errors="replace"))
            break
        except (OSError, ValueError):
            continue
    if data is None:
        raise OSError(f"5分钟K线接口不可用: {symbol}")
    node = (data.get("data") or {}).get(symbol) or {}
    rows = node.get("m5") or []
    bars = []
    for r in rows:
        try:
            # 行格式: [YYYYMMDDHHMM, 开, 收, 高, 低, 量(手), ...]
            bars.append({
                "date": "%s-%s-%s" % (r[0][:4], r[0][4:6], r[0][6:8]),
                "time": r[0][8:10] + ":" + r[0][10:12],
                "open": float(r[1]), "close": float(r[2]),
                "high": float(r[3]), "low": float(r[4]),
            })
        except (ValueError, IndexError, TypeError):
            continue
    if not bars:
        raise OSError(f"5分钟K线为空: {symbol}")
    return bars


def price_decimals(symbol):
    """价格小数位：股票2位，ETF（代码15/51开头）3位。"""
    return 3 if symbol[2:4] in ("15", "51") else 2


# ---------------------------------------------------------------- 破位判定

def key_levels(done, p):
    """关键位（与回测同口径），返回 ([(名称, 价格), ...], 箱体说明)。"""
    ind = compute_indicators(done, p)
    levels, note = [], ""
    atr = ind["atr"]
    # 先把箱体延伸到最后完成K线（ATR取最新值）；失败（最近一根破坏箱体形态）
    # 再退一步重找（ATR取倒数第二根，与回测"信号K线处ATR"口径一致）
    box = (find_box(done, atr[-1], len(done), p)
           or find_box(done, atr[-2], len(done) - 1, p))
    if box:
        box_low = box[1]
        levels.append(("箱体下沿", box_low))
        stop_ref = box_low - p.stop_buffer * ind["atr"][-1]
        if stop_ref < box_low - 1e-9:      # 缓冲为0时与箱体下沿重合，不单列
            levels.append(("止损参考", stop_ref))
    else:
        note = "无有效箱体"
    levels.append(("EMA20", ind["ema_exit"][-1]))
    return levels, note


def analyze(name, symbol, p):
    """单只标的破位分析，返回结果 dict（异常向上抛出，由调用方容错跳过）。"""
    daily = fetch_kline(symbol, DAY_COUNT)
    if len(daily) < 40:
        raise OSError(f"日K数据不足（{len(daily)}根）")
    now = datetime.now(TZ_BJ)
    today = now.strftime("%Y-%m-%d")
    # 盘中最后一根日K未完成，关键位计算剔除（盘后/非交易日自然全纳入）
    done = daily[:-1] if daily[-1]["date"] == today and now.hour < 15 else daily
    levels, note = key_levels(done, p)

    m5 = fetch_m5(symbol)
    last_day = m5[-1]["date"]
    day_bars = [b for b in m5 if b["date"] == last_day]
    price = day_bars[-1]["close"]
    prev = next((b["close"] for b in reversed(daily) if b["date"] < last_day), None)
    chg = price / prev - 1 if prev else 0.0
    # 除权防御：5分钟（不复权）与日K（前复权）价格差异过大时提示仅供参考
    if abs(price / daily[-1]["close"] - 1) > 0.03:
        note += ("；" if note else "") + "5分钟价与日K差异较大（可能除权），仅供参考"

    dec = price_decimals(symbol)
    alerts = []                            # (severity, 文本)，按关键位严重度排序
    for lname, lv in levels:
        hits = [b for b in day_bars if b["low"] < lv]
        if not hits:
            continue
        first = hits[0]["time"]
        if price < lv:
            alerts.append((0, f"破{lname} {lv:.{dec}f}（{first} 首破，未收复）"))
        else:
            alerts.append((1, f"盘中破{lname} {lv:.{dec}f}（{first} 首破，已收复）"))
    severity = min((a[0] for a in alerts), default=2)
    return {"name": name, "symbol": symbol, "price": price, "chg": chg,
            "dec": dec, "severity": severity, "alerts": alerts, "note": note,
            "day": last_day}


# ---------------------------------------------------------------- 输出

def print_report(results, skipped):
    """按严重度排序输出：破位未收复 > 盘中破已收复 > 正常。"""
    results.sort(key=lambda r: (r["severity"], r["name"]))
    name_w = max((disp_width(r["name"]) for r in results), default=8)
    sym_w = max((len(r["symbol"]) for r in results), default=8)
    for r in results:
        tag = {0: f"{RED}[!]{RESET}", 1: "[~]", 2: f"{DIM}[·]{RESET}"}[r["severity"]]
        head = (f"{tag} {pad(r['name'], name_w)}  {r['symbol']:<{sym_w}}  现价 "
                + paint(r["chg"], "%.*f" % (r["dec"], r["price"]))
                + " " + paint(r["chg"], "%+.2f%%" % (r["chg"] * 100)))
        if r["severity"] == 0:
            detail = RED + "；".join(a[1] for a in r["alerts"]) + RESET
        elif r["severity"] == 1:
            detail = "；".join(a[1] for a in r["alerts"])
        else:
            detail = DIM + "关键位均未破" + RESET
        line = head + "  " + detail
        if r["note"]:
            line += DIM + f"（{r['note']}）" + RESET
        print(line)
    n_strong = sum(1 for r in results if r["severity"] == 0)
    n_weak = sum(1 for r in results if r["severity"] == 1)
    day = results[0]["day"] if results else ""
    print(DIM + "─" * 56 + RESET)
    summary = (f"破位未收复 {n_strong} 只 · 盘中破已收复 {n_weak} 只"
               f" / 共 {len(results)} 只（交易日 {day}）")
    print((RED if n_strong else "") + summary + (RESET if n_strong else ""))
    if skipped:
        print(DIM + f"跳过 {skipped} 只（数据获取失败）" + RESET)
    print(DIM + "仅供学习研究，不构成投资建议" + RESET)


def main():
    enable_ansi()
    ap = argparse.ArgumentParser(
        description="5分钟破位预警（钻潜体系·盘中风控补充，独立运行默认关闭）")
    ap.add_argument("targets", nargs="*",
                    help="股票代码或名称，留空则检查 src/ 全部自选股")
    ap.add_argument("--box-min", type=int, default=5,
                    help="横盘箱体最短K线数（默认5，与回测一致）")
    ap.add_argument("--box-max", type=int, default=35,
                    help="横盘箱体最长K线数（默认35，与回测一致）")
    ap.add_argument("--box-atr", type=float, default=3.0,
                    help="箱体宽度上限 = 倍数*ATR（默认3.0，与回测一致）")
    ap.add_argument("--stop-buffer", type=float, default=0.0,
                    help="止损参考低于箱体下沿的ATR缓冲（默认0.0，与回测一致）")
    args = ap.parse_args()
    p = build_parser().parse_args([])      # 复用回测默认参数，保证口径一致
    p.box_min, p.box_max = args.box_min, args.box_max
    p.box_atr, p.stop_buffer = args.box_atr, args.stop_buffer

    config = load_config()
    if args.targets:
        items = resolve_targets(args.targets, config)
    else:
        items = watchlist(config)
        if not items:
            print("src/ 下无自选股笔记，请指定标的：python powei.py 万华化学 或 600030")
            return 1
    valid, seen = [], set()
    for n, s in items:
        if not s:
            print(DIM + f"跳过 {n}（stocks.json 缺代码映射）" + RESET)
        elif s in seen:                        # 名称与代码指向同一只时去重
            continue
        else:
            seen.add(s)
            valid.append((n, s))
    if not valid:
        print("无可用标的")
        return 1

    print(f"5分钟破位预警 · 关键位=箱体下沿/止损参考/EMA20"
          f"（前复权日K口径，{len(valid)} 只）")
    results, skipped = [], 0
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futs = {pool.submit(analyze, n, s, p): (n, s) for n, s in valid}
        for fut in as_completed(futs):
            name, sym = futs[fut]
            try:
                results.append(fut.result())
            except (OSError, ValueError) as e:
                skipped += 1
                print(DIM + f"跳过 {name}({sym})：{e}" + RESET)
    if not results:
        print("全部标的获取失败，请稍后重试")
        return 1
    print_report(results, skipped)
    return 0


if __name__ == "__main__":
    sys.exit(main())

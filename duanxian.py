#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""钻潜交易体系·隔日超短线工具（情绪周期 + 首板/尾盘强势隔日策略，仅标准库，零第三方依赖）

策略思想（公开超短线方法的程序化近似，供学习研究）:
  当天买、次日卖的超短线，核心不是预测，而是「择时 + 选强 + 纪律」:

  1. 情绪周期择时（决定今天做不做、做多少）——不一定要每天操作:
     用可量化的市场指标把情绪划为六段循环:
       冰点 → 修复 → 启动 → 发酵 → 高潮 → 退潮 →（冰点）
     指标（东财涨停池/炸板池/跌停池 + 昨日涨停股今日表现）:
       涨停家数、最高连板、二板以上家数、炸板率、跌停家数、
       昨日涨停股今日平均涨幅与红盘率（接力赚钱效应，权重最高）、
       涨停家数较 3 日前的趋势
     打分映射周期与仓位:
       冰点期 空仓        退潮期 0~1成     修复期 1~2成（试错）
       启动期 2~3成       发酵期 3~5成     高潮期 ≤3成（只做龙头防分歧）

  2. 选股（决定买什么），两种模式:
     A 首板排板: 当日首板涨停、非一字（买得进）、封板早/炸板少、
        流通市值 20~300 亿、非 ST/新股/科创板/北交所；
        日K确认低位、放量、站上 MA60、突破 20 日高、同行业涨停家数（板块效应）
     B 尾盘强势: 当日涨幅 4~9.5% 未涨停、成交额 ≥2 亿、放量（≥1.5 倍 5 日均量）、
        站上 MA60 或突破 20 日高；尾盘竞价买入，次日冲高卖
        （B 依赖实时快照，仅支持当日；历史复盘只有 A）

  3. 卖出纪律（决定怎么卖）——次日按开盘情况执行预案:
     高开>5% 冲高滞涨卖 / 高开2~5% 早盘冲高卖 / 高开0~2% 看承接 /
     低开-2~0% 反抽不过昨收卖 / 低开<-2% 竞价直接走 / 亏损5% 无条件止损

回测口径（--backtest，仅 A 模式）:
  买入 = T 日收盘价（收盘涨停 ≈ 排板成交假设；剔除一字板——实际买不进）
  卖出 = T+1 开盘价（竞价卖）与 T+1 收盘价（持有到收盘）两种口径分别统计
  未计滑点与手续费；一字跌停开盘实际无法成交，竞价口径偏乐观；
  打板存在排板不成交的可能，结果仅供研究，不构成投资建议。

用法:
  python duanxian.py                      情绪周期 + 今日隔日候选（A+B）
  python duanxian.py --mode a             只看首板排板候选
  python duanxian.py --date 20261013      复盘某日情绪与首板候选（近8个交易日内）
  python duanxian.py --backtest 20        回测最近 20 个交易日的首板隔日策略
  python duanxian.py --top 30 --csv x.csv
"""
import argparse
import csv
import statistics
import sys
import time
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

from screener import fetch_universe, http_json, num, to_symbol
from stock import fetch_quotes
from zuanqian import (BOLD, DIM, RESET, enable_ansi, fetch_kline, pad, paint)

POOL_URL = ("https://push2ex.eastmoney.com/getTopic{kind}Pool"
            "?ut=7eea3edcaed734bea9cbfc24409ed989&dpt=wz.ztzt"
            "&Pageindex=0&pagesize=600&sort=fbt%3Aasc&date={date}")
INDEX_SYMBOL = "sh000001"          # 上证指数 -> 交易日历
MIN_BARS = 70                      # 日K确认所需最少根数
POSITION = {
    "冰点期": ("空仓", "亏钱效应见底，只看不做；冰点后的首批首板是启动先声，重点跟踪"),
    "退潮期": ("0~1成", "高位股大面频出，原则上空仓；不接力、不抄底高位股"),
    "修复期": ("1~2成", "情绪开始回暖，轻仓试错首板，快进快出"),
    "启动期": ("2~3成", "赚钱效应恢复，首板为主，选低位+放量+有板块效应的"),
    "发酵期": ("3~5成", "情绪主升，首板与低位 1 进 2 均可参与，仓位可适度加大"),
    "高潮期": ("≤3成", "连板高度见顶，只做最强龙头，严禁追高位板，随时防分歧大面"),
}
SELL_PLAN = [
    "高开 >5%   竞价不急卖，开盘冲高滞涨（放量不创新高）即卖",
    "高开 2~5%  9:40 前冲高卖出；未冲高则跌破分时均价卖",
    "高开 0~2%  看前 30 分钟承接，放量滞涨或回落破均价卖",
    "低开 -2~0% 反抽不过昨收即卖，不幻想",
    "低开 <-2%  竞价直接卖出，严防大面",
    "亏损达 5%  无条件止损，当日了结",
]


# ---------------------------------------------------------------- 数据抓取

def fetch_pool(kind, date):
    """东财涨停/炸板/跌停池。kind: ZT 涨停 | ZB 炸板 | DT 跌停。date: YYYYMMDD。"""
    data = http_json(POOL_URL.format(kind=kind, date=date), timeout=15).get("data") or {}
    pool = data.get("pool") or []
    out = []
    for r in pool:
        code = str(r.get("c") or "")
        if not code:
            continue
        out.append({
            "code": code,
            "symbol": to_symbol(code, r.get("m")),
            "name": str(r.get("n") or "").strip(),
            "price": (num(r.get("p")) or 0) / 1000,       # 接口价格 ×1000
            "chg": num(r.get("zdp")),
            "lbc": int(num(r.get("lbc")) or 1),           # 连板数
            "fbt": num(r.get("fbt")) or 0,                # 首次封板时间 HHMMSS
            "zbc": int(num(r.get("zbc")) or 0),           # 炸板次数
            "hs": num(r.get("hs")),                       # 换手率 %
            "float_mv": num(r.get("ltsz")),               # 流通市值（元）
            "industry": str(r.get("hybk") or "-"),
        })
    return out


def trading_dates(n):
    """最近 n 个交易日（YYYYMMDD，来自上证指数日K，自动跳过休市）。"""
    bars = fetch_kline(INDEX_SYMBOL, n + 6)
    return [b["date"].replace("-", "") for b in bars[-n:]]


def bad_name(name):
    """ST/退市/上市初期的股票不参与。"""
    u = name.upper()
    return "ST" in u or "退" in name or name[:1] in ("N", "C")


def pool_metrics(pool):
    """涨停池 -> 当日情绪基础指标（剔除 ST/退市/新股）。"""
    rows = [r for r in pool if not bad_name(r["name"])]
    lb = [r["lbc"] for r in rows]
    return {
        "count": len(rows),
        "lb_max": max(lb) if lb else 0,
        "lb2": sum(1 for x in lb if x >= 2),
        "yizi": sum(1 for r in rows if r["fbt"] <= 92500 and not r["zbc"]),
        "early": sum(1 for r in rows if 0 < r["fbt"] <= 100000),
    }


def hist_change(symbols, date, workers=12):
    """一组代码在 date 日的涨幅（相对前一日收盘，前复权口径）。
    用于「昨日涨停股今日表现」；当日实时口径同样适用（日K最后一根为快照）。"""
    if not symbols:
        return None

    def one(sym):
        try:
            bars = fetch_kline(sym, 20)
        except (OSError, ValueError):
            return None
        idx = next((i for i, b in enumerate(bars) if b["date"].replace("-", "") == date), None)
        if idx is None or idx == 0 or bars[idx - 1]["close"] <= 0:
            return None
        return (bars[idx]["close"] / bars[idx - 1]["close"] - 1) * 100

    pcts = []
    with ThreadPoolExecutor(max_workers=min(workers, 32)) as ex:
        for fut in as_completed([ex.submit(one, s) for s in symbols]):
            v = fut.result()
            if v is not None:
                pcts.append(v)
    if not pcts:
        return None
    return {"avg": sum(pcts) / len(pcts),
            "red": sum(1 for x in pcts if x > 0) / len(pcts) * 100,
            "n": len(pcts)}


# ---------------------------------------------------------------- 情绪周期

def score_sentiment(m, zb_rate, dt_count, yst, series):
    """情绪打分（-12 ~ +9）与依据说明。yst: 昨日涨停今日表现 dict 或 None。"""
    s, reasons = 0, []
    zt = m["count"]

    if zt < 25:
        s -= 2; reasons.append(f"涨停仅 {zt} 家，情绪低迷（-2）")
    elif zt < 45:
        reasons.append(f"涨停 {zt} 家，中性（0）")
    elif zt < 70:
        s += 2; reasons.append(f"涨停 {zt} 家，赚钱效应好（+2）")
    else:
        s += 3; reasons.append(f"涨停 {zt} 家，情绪高涨（+3）")

    lb = m["lb_max"]
    if lb <= 2:
        s -= 2; reasons.append(f"最高 {lb} 板，高度压制（-2）")
    elif lb <= 4:
        reasons.append(f"最高 {lb} 板（0）")
    elif lb <= 6:
        s += 2; reasons.append(f"最高 {lb} 板，空间打开（+2）")
    else:
        s += 1; reasons.append(f"最高 {lb} 板，高度过高警惕分歧（+1）")

    if yst:
        avg = yst["avg"]
        tag = f"昨日涨停今日平均 {avg:+.1f}%（接力效应 "
        if avg < -3:
            s -= 3; reasons.append(tag + "极差，-3）")
        elif avg < 0:
            s -= 1; reasons.append(tag + "偏差，-1）")
        elif avg < 2:
            s += 1; reasons.append(tag + "尚可，+1）")
        elif avg < 4:
            s += 2; reasons.append(tag + "好，+2）")
        else:
            s += 1; reasons.append(tag + "过热，+1）")

    if zb_rate >= 0.4:
        s -= 2; reasons.append(f"炸板率 {zb_rate*100:.0f}%，封板质量差（-2）")
    elif zb_rate >= 0.25:
        s -= 1; reasons.append(f"炸板率 {zb_rate*100:.0f}%，偏高（-1）")
    else:
        s += 1; reasons.append(f"炸板率 {zb_rate*100:.0f}%，健康（+1）")

    if dt_count >= 10:
        s -= 2; reasons.append(f"跌停 {dt_count} 家，大面频出（-2）")
    elif dt_count >= 5:
        s -= 1; reasons.append(f"跌停 {dt_count} 家（-1）")
    else:
        reasons.append(f"跌停 {dt_count} 家（0）")

    if len(series) >= 4:
        zt3 = series[-4]["count"]
        if zt > zt3:
            s += 1; reasons.append(f"涨停家数较 3 日前回升（{zt3}→{zt}，+1）")
        elif zt < zt3:
            s -= 1; reasons.append(f"涨停家数较 3 日前回落（{zt3}→{zt}，-1）")
    return s, reasons


def map_cycle(score, m, series, zb_rate):
    """打分 + 结构特征 -> 情绪周期。"""
    lb3 = max((x["lb_max"] for x in series[:-1][-3:]), default=0)
    zt3 = series[-4]["count"] if len(series) >= 4 else m["count"]
    rising = m["count"] > zt3
    if score <= -5:
        return "退潮期" if (lb3 >= 5 and not rising) else "冰点期"
    if score <= -2:
        return "修复期" if rising else "退潮期"
    if score <= 1:
        return "启动期"
    if score <= 4:
        return "发酵期"
    return "高潮期"


def collect_sentiment(date=None, progress=None):
    """情绪周期判定（收盘口径为主）。date=None 取最新交易日，否则为近 8 个交易日内某日。
    返回 JSON 友好 dict（GUI 与 CLI 共用）。"""
    def step(phase, done=0, total=0):
        if progress:
            progress(phase, done, total)

    dates = trading_dates(8)
    if date:
        d = date.replace("-", "")
        if d not in dates:
            raise ValueError(f"{date} 不在最近 {len(dates)} 个交易日内"
                             f"（{dates[0]}~{dates[-1]}）")
        dates = dates[:dates.index(d) + 1]
    tdate = dates[-1]

    step("拉取近 6 日涨停池")
    series = []
    for i, d in enumerate(dates[-6:]):
        m = pool_metrics(fetch_pool("ZT", d))
        m["date"] = d
        series.append(m)
        step("拉取近 6 日涨停池", i + 1, min(6, len(dates)))
    today = series[-1]

    step("拉取炸板池/跌停池")
    zb = fetch_pool("ZB", tdate)
    zb_n = len([r for r in zb if not bad_name(r["name"])])
    dt_n = len([r for r in fetch_pool("DT", tdate) if not bad_name(r["name"])])
    zb_rate = zb_n / (zb_n + today["count"]) if (zb_n + today["count"]) else 0.0

    step("计算昨日涨停股今日表现")
    yst = None
    if len(series) >= 2:
        prev = fetch_pool("ZT", series[-2]["date"])
        codes = [r["symbol"] for r in prev
                 if not bad_name(r["name"]) and not r["symbol"].startswith("bj")]
        yst = hist_change(codes, tdate)

    score, reasons = score_sentiment(today, zb_rate, dt_n, yst, series)
    cycle = map_cycle(score, today, series, zb_rate)
    pos, advice = POSITION[cycle]

    intraday = (date is None and tdate == datetime.now().strftime("%Y%m%d")
                and datetime.now().hour < 15)
    return {
        "date": tdate,
        "intraday": intraday,
        "cycle": cycle,
        "position": pos,
        "advice": advice,
        "score": score,
        "metrics": {
            "涨停家数": today["count"],
            "最高连板": today["lb_max"],
            "二板以上": today["lb2"],
            "一字板": today["yizi"],
            "炸板家数": zb_n,
            "炸板率%": round(zb_rate * 100, 1),
            "跌停家数": dt_n,
            "昨日涨停平均涨幅%": round(yst["avg"], 2) if yst else None,
            "昨日涨停红盘率%": round(yst["red"], 1) if yst else None,
        },
        "reasons": reasons,
        "series": [{"date": x["date"], "count": x["count"], "lb_max": x["lb_max"]}
                   for x in series],
    }


# ---------------------------------------------------------------- 日K确认

def fetch_kline_retry(symbol, count, retries=2):
    last: BaseException = OSError(f"K线拉取失败: {symbol}")
    for attempt in range(retries + 1):
        try:
            return fetch_kline(symbol, count)
        except (OSError, ValueError) as e:
            last = e
            time.sleep(0.6 * (attempt + 1))
    raise last


def kline_confirm(symbol, klines=200):
    """日K特征: 低位程度/60日涨幅/MA60/量比/是否突破20日高。数据不足返回 None。"""
    try:
        bars = fetch_kline_retry(symbol, klines)
    except (OSError, ValueError):
        return None
    n = len(bars)
    if n < MIN_BARS:
        return None
    closes = [b["close"] for b in bars]
    highs = [b["high"] for b in bars]
    lows = [b["low"] for b in bars]
    vols = [b["vol"] for b in bars]
    low_n = min(lows[-250:])
    vol5 = sum(vols[-6:-1]) / 5 if n >= 6 and sum(vols[-6:-1]) else 0.0
    return {
        "pos_low": closes[-1] / low_n - 1 if low_n > 0 else 9.9,   # 距近一年低点
        "chg60": closes[-1] / closes[-61] - 1 if n >= 61 else None,
        "above60": n >= 60 and closes[-1] > sum(closes[-60:]) / 60,
        "vol_ratio": vols[-1] / vol5 if vol5 else 0.0,
        "break20": n >= 22 and closes[-1] >= max(highs[-21:-1]),
    }


# ---------------------------------------------------------------- A 首板排板

def hard_filter_a(r, include_star=False):
    """首板硬条件: 买得进、封得稳、体量适中。"""
    if bad_name(r["name"]) or r["lbc"] != 1:
        return False
    sym = r["symbol"]
    if sym.startswith("bj") or (not include_star and sym.startswith("sh688")):
        return False
    if r["fbt"] <= 92500 and not r["zbc"]:      # 一字/秒板，买不进
        return False
    if r["fbt"] > 143000:                       # 尾盘偷袭板，质量差
        return False
    if r["zbc"] > 2:
        return False
    mv = r["float_mv"] or 0
    if not 20e8 <= mv <= 300e8:
        return False
    return 3 <= (r["price"] or 0) <= 100


def score_a(r, k, hy_count):
    """首板评分（0~11）与标签。k: kline_confirm 结果或 None。"""
    s, tags = 0, []
    if 0 < r["fbt"] <= 100000:
        s += 1; tags.append("早盘板")
    if not r["zbc"]:
        s += 1; tags.append("封死")
    hs = r["hs"] or 0
    if 3 <= hs <= 15:
        s += 1; tags.append("换手健康")
    elif hs > 25:
        s -= 1; tags.append("换手过大")
    if hy_count >= 3:
        s += 2; tags.append("板块效应强")
    elif hy_count == 2:
        s += 1; tags.append("有板块效应")
    if k:
        if k["pos_low"] < 0.5:
            s += 2; tags.append("低位")
        elif k["pos_low"] < 0.8:
            s += 1
        if k["chg60"] is not None and k["chg60"] < 0.3:
            s += 1; tags.append("非高位")
        if k["above60"]:
            s += 1; tags.append("MA60上")
        if k["vol_ratio"] >= 2:
            s += 2; tags.append("放量")
        elif k["vol_ratio"] >= 1.5:
            s += 1
        if k["break20"]:
            s += 1; tags.append("破20日高")
    return s, tags


def grade(s):
    return "重点关注" if s >= 8 else ("可关注" if s >= 5 else "观察")


def fmt_time(t):
    """92500 -> 09:25:00；0/None -> '—'。"""
    if not t:
        return "—"
    t = int(t)
    return f"{t//10000:02d}:{t//100%100:02d}:{t%100:02d}"


def pick_a(tdate, top=20, workers=12, include_star=False, progress=None):
    """A 首板排板候选。返回 (rows, note)。"""
    pool = fetch_pool("ZT", tdate)
    cands = [r for r in pool if hard_filter_a(r, include_star)]
    hy = Counter(r["industry"] for r in pool if not bad_name(r["name"]))
    rows, fails, done = [], 0, 0
    with ThreadPoolExecutor(max_workers=min(workers, 32)) as ex:
        futs = {ex.submit(kline_confirm, r["symbol"]): r for r in cands}
        for fut in as_completed(futs):
            r = futs[fut]
            done += 1
            if progress:
                progress("A 首板日K确认", done, len(cands))
            k = fut.result()
            if k is None:
                fails += 1
            s, tags = score_a(r, k, hy.get(r["industry"], 0))
            rows.append({
                "代码": r["code"], "名称": r["name"], "行业": r["industry"],
                "现价": round(r["price"], 2), "涨幅%": round(r["chg"] or 0, 2),
                "封板": fmt_time(r["fbt"]), "炸板": r["zbc"],
                "换手%": round(r["hs"], 1) if r["hs"] is not None else None,
                "流通亿": round((r["float_mv"] or 0) / 1e8, 1),
                "距低点%": round(k["pos_low"] * 100, 1) if k else None,
                "量比": round(k["vol_ratio"], 2) if k else None,
                "MA60上": "是" if (k and k["above60"]) else "否",
                "板块涨停": hy.get(r["industry"], 0),
                "评分": s, "建议": grade(s), "标签": " ".join(tags),
            })
    rows.sort(key=lambda x: -x["评分"])
    note = f"首板 {len(cands)} 只通过硬条件" + (f"，{fails} 只日K数据不足" if fails else "")
    return rows[:max(0, top)], note


# ---------------------------------------------------------------- B 尾盘强势

def pick_b(tdate, top=20, workers=12, progress=None):
    """B 尾盘强势候选（实时快照口径，仅支持当日）。返回 (rows, note)。"""
    def step(ph, d, t):
        if progress:
            progress(ph, d, t)

    step("拉取全市场快照", 0, 1)
    universe = fetch_universe(False)
    zt_codes = {r["code"] for r in fetch_pool("ZT", tdate)}
    cands = []
    for u in universe:
        if bad_name(u["name"]) or u["code"] in zt_codes:
            continue
        if u["symbol"].startswith(("sh688", "bj")):
            continue
        chg = u["chg"]
        if chg is None or not 4.0 <= chg <= 9.5:
            continue
        if (u["amount"] or 0) < 2e8:
            continue
        mv = u["float_mv"]
        if mv is not None and not 15e8 <= mv <= 500e8:
            continue
        cands.append(u)
    step("快照预筛完成", 1, 1)

    hy = Counter(u["industry"] for u in cands)
    rows, fails, done = [], 0, 0
    with ThreadPoolExecutor(max_workers=min(workers, 32)) as ex:
        futs = {ex.submit(kline_confirm, u["symbol"]): u for u in cands}
        for fut in as_completed(futs):
            u = futs[fut]
            done += 1
            if progress:
                progress("B 尾盘日K确认", done, len(cands))
            k = fut.result()
            if k is None:
                fails += 1
                continue
            # 硬条件: 放量 且（站上MA60 或 突破20日高）
            if k["vol_ratio"] < 1.5 or not (k["above60"] or k["break20"]):
                continue
            s, tags = 0, []
            if k["vol_ratio"] >= 2:
                s += 2; tags.append("放量")
            else:
                s += 1
            if k["break20"]:
                s += 2; tags.append("破20日高")
            if k["above60"]:
                s += 1; tags.append("MA60上")
            if k["pos_low"] < 0.5:
                s += 2; tags.append("低位")
            elif k["pos_low"] < 0.8:
                s += 1
            if k["chg60"] is not None and k["chg60"] < 0.3:
                s += 1; tags.append("非高位")
            if 5 <= (u["chg"] or 0) <= 8:
                s += 1; tags.append("涨幅适中")
            hc = hy.get(u["industry"], 0)
            if hc >= 3:
                s += 2; tags.append("板块效应强")
            elif hc == 2:
                s += 1; tags.append("有板块效应")
            rows.append({
                "代码": u["code"], "名称": u["name"], "行业": u["industry"],
                "现价": round(u["price"], 2), "涨幅%": round(u["chg"], 2),
                "量比": round(k["vol_ratio"], 2),
                "流通亿": round((u["float_mv"] or 0) / 1e8, 1),
                "距低点%": round(k["pos_low"] * 100, 1),
                "MA60上": "是" if k["above60"] else "否",
                "破20日高": "是" if k["break20"] else "否",
                "评分": s, "建议": grade(s), "标签": " ".join(tags),
            })
    rows.sort(key=lambda x: -x["评分"])
    note = (f"快照 {len(universe)} 只 → 涨幅4~9.5%预筛 {len(cands)} 只 → 日K确认 {len(rows)} 只"
            + (f"（{fails} 只数据不足剔除）" if fails else ""))
    return rows[:max(0, top)], note


# ---------------------------------------------------------------- 回测（A 模式）

def backtest_a(days=20, workers=12, include_star=False):
    """首板隔日回测。买入=T日收盘价（排板假设，剔除一字），卖出=T+1 开盘/收盘两种口径。
    返回 dict（GUI/CLI 共用）。"""
    dates = trading_dates(days + 2)
    pairs = [(dates[i], dates[i + 1]) for i in range(max(0, len(dates) - days - 1),
                                                     len(dates) - 1)]
    per_day, all_open, all_close = [], [], []

    def one(sym, d, nxt):
        try:
            bars = fetch_kline_retry(sym, 60)
        except (OSError, ValueError):
            return None
        idx = next((i for i, b in enumerate(bars)
                    if b["date"].replace("-", "") == d), None)
        jdx = next((i for i, b in enumerate(bars)
                    if b["date"].replace("-", "") == nxt), None)
        if idx is None or jdx != idx + 1:            # 缺日K/次日停牌
            return None
        buy = bars[idx]["close"]
        if buy <= 0:
            return None
        return {"open": (bars[jdx]["open"] / buy - 1) * 100,
                "close": (bars[jdx]["close"] / buy - 1) * 100}

    for d, nxt in pairs:
        pool = fetch_pool("ZT", d)
        cands = [r for r in pool if hard_filter_a(r, include_star)]
        rets = []
        with ThreadPoolExecutor(max_workers=min(workers, 32)) as ex:
            for fut in as_completed([ex.submit(one, r["symbol"], d, nxt) for r in cands]):
                v = fut.result()
                if v:
                    rets.append(v)
        o = [x["open"] for x in rets]
        c = [x["close"] for x in rets]
        all_open += o
        all_close += c
        ds = f"{d[:4]}-{d[4:6]}-{d[6:]}"
        if rets:
            print(f"  {ds}: 候选 {len(cands):2d} 只 · 成交 {len(rets):2d} 只 · "
                  f"竞价卖均值 {sum(o)/len(o):+6.2f}% · 收盘卖均值 {sum(c)/len(c):+6.2f}%")
        else:
            print(f"  {ds}: 候选 {len(cands):2d} 只 · 无有效样本")
        per_day.append({"date": d, "候选": len(cands), "成交": len(rets),
                        "竞价卖均值%": round(sum(o) / len(o), 2) if o else None,
                        "收盘卖均值%": round(sum(c) / len(c), 2) if c else None})

    def stat(rets):
        if not rets:
            return None
        wins = [x for x in rets if x > 0]
        losses = [x for x in rets if x < 0]
        return {
            "样本": len(rets),
            "胜率%": round(len(wins) / len(rets) * 100, 1),
            "均值%": round(sum(rets) / len(rets), 2),
            "中位数%": round(statistics.median(rets), 2),
            "最好%": round(max(rets), 2),
            "最差%": round(min(rets), 2),
            "盈亏比": round((sum(wins) / len(wins)) / abs(sum(losses) / len(losses)), 2)
                      if wins and losses else None,
        }

    return {
        "days": len(pairs),
        "口径": ("买入=T日收盘价（排板假设，剔除一字板）；卖出=T+1开盘价（竞价卖）"
                 "或T+1收盘价；未计滑点手续费；一字跌停实际无法成交，竞价口径偏乐观"),
        "竞价卖": stat(all_open),
        "收盘卖": stat(all_close),
        "per_day": per_day,
    }


# ---------------------------------------------------------------- 汇总入口

def scan(date=None, mode="all", top=20, workers=12, include_star=False, progress=None):
    """情绪周期 + 隔日候选，返回 JSON 友好 dict（GUI 与 CLI 共用）。"""
    senti = collect_sentiment(date, progress)
    tdate = senti["date"]
    out = {"sentiment": senti, "rows_a": [], "rows_b": [], "note_a": "", "note_b": "",
           "plan": SELL_PLAN, "disclaimer": "仅供学习研究，不构成投资建议"}

    if mode in ("a", "all"):
        out["rows_a"], out["note_a"] = pick_a(tdate, top, workers, include_star, progress)
    if mode in ("b", "all"):
        if date and date.replace("-", "") != datetime.now().strftime("%Y%m%d"):
            out["note_b"] = "B 尾盘强势依赖实时快照，历史复盘不可得（仅 A 模式可复盘）"
        else:
            out["rows_b"], out["note_b"] = pick_b(tdate, top, workers, progress)
    return out


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


def print_table(rows, header, widths, aligns):
    print(DIM + " ".join(pad(h, w) for h, w in zip(header, widths)) + RESET)
    for r in rows:
        cells = []
        for h, w, a in zip(header, widths, aligns):
            v = r.get(h, "")
            v = "—" if v is None else str(v)
            cells.append(pad(trunc(v, w), w, a))
        print(" ".join(cells))


def print_scan(res):
    senti = res["sentiment"]
    ds = f"{senti['date'][:4]}-{senti['date'][4:6]}-{senti['date'][6:]}"
    m = senti["metrics"]
    print(BOLD + f"钻潜隔日超短线 · 情绪周期（{ds}{' · 盘中数据，收盘前会变化' if senti['intraday'] else ''}）" + RESET)
    print(f"周期: {BOLD}{senti['cycle']}{RESET}    建议仓位: {BOLD}{senti['position']}{RESET}    "
          f"情绪分: {senti['score']:+d}")
    print(f"指标: 涨停 {m['涨停家数']} · 最高 {m['最高连板']} 板 · 二板以上 {m['二板以上']} · "
          f"炸板率 {m['炸板率%']}% · 跌停 {m['跌停家数']} · "
          + (f"昨日涨停今日平均 {m['昨日涨停平均涨幅%']:+.1f}% / 红盘率 {m['昨日涨停红盘率%']}%"
             if m["昨日涨停平均涨幅%"] is not None else "昨日涨停表现: 无数据"))
    print("依据: " + "；".join(senti["reasons"]))
    print(f"近 {len(senti['series'])} 日: 涨停 "
          + "→".join(str(x["count"]) for x in senti["series"])
          + " · 最高连板 " + "→".join(str(x["lb_max"]) for x in senti["series"]))
    print(DIM + f"操作建议: {senti['position']} —— {senti['advice']}" + RESET)

    if res["note_a"]:
        if res["rows_a"]:
            print(f"\n{BOLD}── A 首板排板候选（{res['note_a']}）──{RESET}")
            print_table(res["rows_a"],
                        ["#", "名称", "代码", "行业", "现价", "涨幅%", "封板", "炸板", "换手%",
                         "流通亿", "距低点%", "量比", "MA60上", "板块涨停", "评分", "建议", "标签"],
                        [3, 10, 8, 9, 8, 7, 9, 5, 6, 7, 8, 6, 7, 8, 5, 9, 26],
                        ["right"] + ["left"] * 3 + ["right"] * 11 + ["left", "left"])
        else:
            print(f"\n{BOLD}── A 首板排板候选 ──{RESET}")
            print(DIM + f"无候选（{res['note_a']}）" + RESET)

    if res["note_b"]:
        print(f"\n{BOLD}── B 尾盘强势候选 ──{RESET}")
        if res["rows_b"]:
            print_table(res["rows_b"],
                        ["#", "名称", "代码", "行业", "现价", "涨幅%", "量比", "流通亿",
                         "距低点%", "MA60上", "破20日高", "评分", "建议", "标签"],
                        [3, 10, 8, 9, 8, 7, 6, 7, 8, 7, 8, 5, 9, 22],
                        ["right"] + ["left"] * 3 + ["right"] * 5 + ["left"] * 2
                        + ["right", "right", "left"])
        else:
            print(DIM + f"无候选（{res['note_b']}）" + RESET)

    print(f"\n{BOLD}次日卖出预案（竞价后对号入座）:{RESET}")
    for line in res["plan"]:
        print("  " + line)
    print(DIM + "提示: " + res["disclaimer"] + RESET)


def print_backtest(res):
    print(BOLD + f"钻潜隔日超短线 · 首板隔日回测（最近 {res['days']} 个交易日）" + RESET)
    print(DIM + "口径: " + res["口径"] + RESET)
    for key in ("竞价卖", "收盘卖"):
        st = res[key]
        if not st:
            print(f"{key}: 无样本")
            continue
        print(f"{key}: 样本 {st['样本']} · 胜率 {st['胜率%']}% · 均值 {st['均值%']:+.2f}% · "
              f"中位 {st['中位数%']:+.2f}% · 最好 {st['最好%']:+.2f}% · 最差 {st['最差%']:+.2f}%"
              + (f" · 盈亏比 {st['盈亏比']}" if st["盈亏比"] else ""))
    print(DIM + "提示: 打板存在排板不成交的可能；结果仅供研究，不构成投资建议。" + RESET)


def save_csv(path, res):
    rows = []
    for r in res["rows_a"]:
        rows.append({"模式": "A首板", **r})
    for r in res["rows_b"]:
        rows.append({"模式": "B尾盘", **r})
    if not rows:
        return 0
    cols = []
    for r in rows:
        for k in r:
            if k not in cols:
                cols.append(k)
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(cols)
        for r in rows:
            w.writerow([r.get(c, "") for c in cols])
    return len(rows)


def build_parser():
    ap = argparse.ArgumentParser(
        description="钻潜交易体系·隔日超短线（情绪周期 + 首板/尾盘强势）",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    ap.add_argument("--date", default=None, help="复盘某交易日（YYYYMMDD，近8个交易日内）")
    ap.add_argument("--mode", choices=("all", "a", "b"), default="all",
                    help="候选模式: a=首板排板 b=尾盘强势")
    ap.add_argument("--backtest", type=int, default=0, metavar="N",
                    help="回测最近 N 个交易日的首板隔日策略（代替扫描）")
    ap.add_argument("--top", type=int, default=20, help="每类候选最多显示多少行")
    ap.add_argument("--workers", type=int, default=12, help="并发线程数")
    ap.add_argument("--include-star", action="store_true", help="A 模式包含科创板（688）")
    ap.add_argument("--csv", metavar="FILE", help="候选导出 CSV（utf-8-sig）")
    return ap


def main():
    enable_ansi()
    p = build_parser().parse_args()
    t0 = time.time()
    try:
        if p.backtest > 0:
            res = backtest_a(min(p.backtest, 60), p.workers, p.include_star)
            print()
            print_backtest(res)
        else:
            res = scan(p.date, p.mode, p.top, p.workers, p.include_star)
            print()
            print_scan(res)
            if p.csv:
                n = save_csv(p.csv, res)
                if n:
                    print(f"\n已导出 {n} 行 → {p.csv}")
    except (OSError, ValueError) as e:
        print(f"失败: {e}")
        return 1
    print(f"\n用时 {time.time() - t0:.1f}s")
    return 0


if __name__ == "__main__":
    sys.exit(main())

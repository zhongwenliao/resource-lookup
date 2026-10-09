#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""钻潜交易体系·规则化回测与信号扫描（数据源：腾讯财经日K接口，仅用标准库，零第三方依赖）

把「横盘做突破 + 动能确认 + 量价配合 + 趋势过滤 + 固定风险仓位」这套价格行为
规则写成可回测的程序，用来验证策略思想在历史数据上的统计表现。

策略规则（全部可参数化）:
  1. 趋势定义  日线收盘 > EMA趋势线且均线上行，且周线收盘 > 周线EMA（多周期共振）；
              --strict 时还须收盘站上MA20（月线级别平均成本线）
  2. 两类不做  趋势向下不做；ATR占比高于 atr_max 或低于 atr_min（摆动量区间外）不做
  3. 横盘箱体  最近 box_min~box_max 根K线高低点区间 <= box_atr * ATR；箱体内部出现
              >= purify_atr*ATR 的大波动K线则该箱体作废（箱体内大K线不纳入交易范围）
  4. 四共振    均线粘合(MA20与长均线收敛<=glue_pct%) + 长均线方向(ma_long走平或上行)
              + 波动幅度(箱体宽度) + ATR摆动量(atr_min~atr_max%)，缺一不做；
              --strict 一键启用纪要口径（横盘>=40根≈2个月、标准K线2*ATR、净化2*ATR）
  5. 动能突破  阳线实体 >= body_atr * ATR（--std-kline-atr 时整根幅度还须 >= N*ATR），
              收盘突破箱体上沿且未远离（防追高）
  6. 量价配合  突破日成交量 >= vol_mult * 20日均量，且收盘位于K线上部60%
  7. 入场      信号次日开盘价买入；--reentry 二次进场模式：不参与第一根方向确立K线，
              等小级别调整结束、收盘再次突破前高，次日开盘进场（收盘跌回箱体内或
              调整超过 reentry_max 根K线则作废）
  8. 止损      箱体下沿 - stop_buffer*ATR（结构破坏）；二次进场模式取调整段最低点；
              过窄则放宽到 min_stop_atr*ATR
  9. 止盈      达到 tp1*R 减半仓并将止损上移到成本；其余在 tp2*R、收盘跌破EMA20或
              --tp-mid 中值止盈线（(进场价+阶段最高价)/2，随新高上移）离场
  10. 资金管理 单笔风险 = 资金 * risk%，按止损距离反推股数（100股整数倍，不加杠杆）；
              单只仓位不超过 max_pos_pct% 总资金；组合模式总仓位不超过 max_total_pct%、
              最多 max_pos 只，盈利释放仓位后同样不得超限
  11. 规则化   T+1、佣金/印花税、时间止损，全程无主观干预

用法:
  python zuanqian.py                    回测 src/ 全部自选股（汇总）
  python zuanqian.py 600030 万华化学     回测指定标的（含交易明细）
  python zuanqian.py 600030 --scan      只扫描最近信号，不回测
  python zuanqian.py 600030 --scan --csv 信号.csv   扫描并导出止盈止损CSV
  python zuanqian.py 600030 --reentry --scan   二次进场模式扫描（止损=调整段最低点）
  python zuanqian.py 600030 --strict --scan   纪要严格口径扫描（四共振+2个月箱体+标准K线）
  python zuanqian.py --full             多标的时也输出完整交易明细
  python zuanqian.py 600030 --risk 0.5 --tp1 1.5 --tp2 2.5   调参
  python zuanqian.py --portfolio        组合模式：共享资金池、多标的并行持仓
  python zuanqian.py --portfolio --risk 2 --max-pos 8    组合模式调参

说明:
  - 规则是对公开流传的「钻潜」思想的程序化近似，并非官方课程内容；
  - 前复权日线数据来自腾讯公开接口；回测结果不代表未来收益，仅供学习研究。
"""
import argparse
import csv
import json
import os
import ssl
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
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

# 企业网关/安全代理常用自签证书做HTTPS中间人，正常校验会失败；
# 确属证书问题时降级为不校验重试（仅公开行情数据，不涉及敏感信息）
_SSL_CTX = ssl.create_default_context()
_SSL_OPEN = ssl.create_default_context()
_SSL_OPEN.check_hostname = False
_SSL_OPEN.verify_mode = ssl.CERT_NONE


def open_url(req, timeout=15):
    """带证书降级的 urlopen：先按系统证书正常校验，证书验证失败（网关自签）再不校验重试。"""
    try:
        return urllib.request.urlopen(req, timeout=timeout, context=_SSL_CTX)
    except urllib.error.URLError as e:
        if isinstance(e.reason, ssl.SSLCertVerificationError):
            return urllib.request.urlopen(req, timeout=timeout, context=_SSL_OPEN)
        raise


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
            with open_url(req, timeout=15) as resp:
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
    ma_long_n = getattr(p, "ma_long", 0)      # 长均线周期（0=不启用，兼容旧参数对象）
    return {
        "ema_exit": ema_series(closes, 20),
        "atr": atr_series(bars, 14),
        "vol_ma": sma_series([b["vol"] for b in bars], 20),
        "daily_up": daily_flags(closes, p.ema_trend),
        "weekly_up": weekly_flags(bars, p.weekly_ema),
        "ma20": sma_series(closes, 20),
        "ma_long": sma_series(closes, ma_long_n) if ma_long_n else None,
    }


# ---------------------------------------------------------------- 信号规则

def find_box(bars, atr, j, p):
    """在信号K线 j 之前寻找横盘箱体，返回 (box_high, box_low, L) 或 None（取最长有效箱体）。
    purify_atr > 0 时，箱体内部出现整根幅度 >= purify_atr*ATR 的大波动K线则该箱体
    作废，向前缩短箱体重找（纪要口径：箱体内的大波动K线不纳入交易范围）。"""
    purify = getattr(p, "purify_atr", 0.0)    # 0=不启用（兼容旧参数对象）
    for L in range(p.box_max, p.box_min - 1, -1):
        lo = j - L
        if lo < 0:
            continue
        seg = bars[lo:j]
        bh = max(b["high"] for b in seg)
        bl = min(b["low"] for b in seg)
        if atr and (bh - bl) <= p.box_atr * atr:
            if purify > 0 and any((x["high"] - x["low"]) >= purify * atr for x in seg):
                continue                      # 内部有大波动K线，作废，缩短箱体重找
            return bh, bl, L
    return None


def check_signal(bars, ind, j, p):
    """判断第 j 根K线收盘是否触发钻潜突破信号。返回 (信号dict, 未触发原因)。
    四共振/标准K线/MA20 位置等新条件经 getattr 读取，缺字段视为不启用，
    兼容 gui.py/screener.py 的旧参数对象。"""
    b = bars[j]
    if not (ind["daily_up"][j] and ind["weekly_up"][j]):
        return None, "趋势过滤未通过"
    if getattr(p, "strict", False):           # MA20=月线级别平均成本线，趋势方向核心参照
        m20 = ind.get("ma20")
        if not (m20 and m20[j]):
            return None, "MA20数据不足"
        if b["close"] <= m20[j]:
            return None, "收盘未站上MA20"
    atr = ind["atr"][j]
    if not atr or atr / b["close"] > p.atr_max / 100:
        return None, "波动过大（不做）"
    atr_min = getattr(p, "atr_min", 0.0)
    if atr_min > 0 and atr / b["close"] * 100 < atr_min:
        return None, "波动过小（无能量）"
    ma_long_n = getattr(p, "ma_long", 0)
    glue_pct = getattr(p, "glue_pct", 0.0)
    if ma_long_n > 0:
        ml = ind.get("ma_long")
        if not (ml and j >= 5 and ml[j] is not None and ml[j - 5] is not None):
            return None, "长均线数据不足"
        if ml[j] < ml[j - 5]:
            return None, "长均线方向向下"
        if glue_pct > 0:                      # 均线粘合: MA20 与长均线收敛
            m20 = ind.get("ma20")
            if not (m20 and m20[j]):
                return None, "均线数据不足"
            lo_ma = min(m20[j], ml[j])
            if (max(m20[j], ml[j]) - lo_ma) / lo_ma * 100 > glue_pct:
                return None, "均线未粘合"
    box = find_box(bars, atr, j, p)
    if not box:
        return None, "无有效横盘箱体"
    bh, bl, L = box
    if b["close"] <= bh:
        return None, "未突破箱体上沿"
    if b["close"] - bh > p.chase_atr * atr:
        return None, "突破过远（防追高）"
    std_k = getattr(p, "std_kline_atr", 0.0)
    if std_k > 0 and (b["high"] - b["low"]) < std_k * atr:
        return None, "非标准K线（幅度不足）"
    if b["close"] - b["open"] < p.body_atr * atr:
        return None, "动能不足"
    hl = b["high"] - b["low"]
    if hl > 0 and (b["close"] - b["low"]) / hl < 0.6:
        return None, "收盘偏弱"
    vma = ind["vol_ma"][j]
    if vma and b["vol"] < p.vol_mult * vma:
        return None, "量能不足"
    return {"box_high": bh, "box_low": bl, "L": L}, None


def reentry_update(pend, i, b, p):
    """推进二次进场状态机一步。pend 为突破K线后的等待状态，b 为当根K线。
    返回 (新状态或None, 是否触发再次突破)。收盘跌回箱体内或调整超过
    reentry_max 根K线则作废；触发时止损冻结为调整段最低点。"""
    hi_prev = pend["hi"]                      # 突破后前高（不含当根）
    adj = b["low"] if pend["adj_low"] is None else min(pend["adj_low"], b["low"])
    age = i - pend["bo_bar"] - 1              # 突破K线与当根之间的调整根数
    if b["close"] < pend["box_high"] or age > p.reentry_max:
        return None, False
    new = dict(pend)
    new["adj_low"] = adj
    if age >= p.reentry_min and b["close"] > hi_prev:
        new["stop"] = adj                     # 止损 = 调整段最低点
        return new, True
    new["hi"] = max(hi_prev, b["high"])
    return new, False


def reentry_scan_state(bars, p, j0, box_high):
    """从突破K线 j0 起重放二次进场状态机至最后一根K线。
    返回 (状态, 触发K线索引或None, 止损参考, 再突破参考价, 调整段最低点)。"""
    pend = {"bo_bar": j0, "hi": bars[j0]["high"], "box_high": box_high,
            "adj_low": None}
    for i in range(j0 + 1, len(bars)):
        pend, trig = reentry_update(pend, i, bars[i], p)
        if pend is None:
            return "failed", None, None, None, None
        if trig:
            return "triggered", i, pend["stop"], None, pend["adj_low"]
    return "waiting", None, pend["adj_low"], pend["hi"], pend["adj_low"]


def cap_shares(shares, entry, p):
    """按单只最大开仓比例限制股数（max_pos_pct% 初始资金，0=不限）。
    用 getattr 兼容未定义该字段的旧参数对象（如 qushi.py 复用 fill_position）。"""
    cap_pct = getattr(p, "max_pos_pct", 0.0)
    if cap_pct > 0 and entry > 0:
        cap = int(p.capital * cap_pct / 100 / entry / 100) * 100
        shares = min(shares, cap)
    return shares


# ---------------------------------------------------------------- 回测引擎

def run_backtest(symbol, bars, ind, p):
    """单标的、单持仓的规则化回测。返回 (trades, equity_curve, skipped)。"""
    cash = float(p.capital)
    pos = None
    pending = None       # 二次进场模式：突破K线后的等待状态
    trades = []
    equity_curve = []
    skipped = 0
    last_exit_bar = -10 ** 9
    tp_mid = getattr(p, "tp_mid", False)   # 剩余仓位中值止盈线（缺字段=不启用）
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
            if p.reentry:
                # 二次进场：突破K线后等待小级别调整，收盘再次突破前高才进场
                if pending is None:
                    j = i - 1  # 昨收方向确立K线 -> 今起跟踪调整
                    if j >= warm and i - last_exit_bar > p.cooldown:
                        sig, _ = check_signal(bars, ind, j, p)
                        if sig:
                            pending = {"bo_bar": j, "hi": bars[j]["high"],
                                       "box_high": sig["box_high"], "adj_low": None}
                if pending is not None and "enter_bar" not in pending:
                    pending, trig = reentry_update(pending, i, b, p)
                    if pending is not None and trig:
                        pending["enter_bar"] = i + 1  # 次日开盘进场
                if pending is not None and i >= pending.get("enter_bar", 10 ** 9):
                    atr = ind["atr"][pending["bo_bar"]]
                    entry = b["open"]
                    stop = pending["stop"]  # 调整段最低点（触发日冻结）
                    dist = entry - stop
                    if dist < p.min_stop_atr * atr:
                        dist = p.min_stop_atr * atr
                        stop = entry - dist
                    if entry <= stop or dist / entry > p.max_stop_pct / 100:
                        skipped += 1  # 止损过宽，放弃
                    else:
                        shares = cap_shares(
                            int(cash * p.risk / 100 / dist / 100) * 100, entry, p)
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
                                "hi": b["high"],
                            }
                    pending = None  # 无论成败，本次 setup 已消费
            else:
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
                            shares = cap_shares(
                                int(cash * p.risk / 100 / dist / 100) * 100,
                                entry, p)
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
                                    "hi": b["high"],
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
                        pos["hi"] = max(pos["hi"], b["high"])  # 突破当日高点计入阶段最高价
                    else:
                        sell(i, pos["shares"], pos["tp1"], f"止盈{p.tp1:g}R")
                mid = (pos["entry"] + pos["hi"]) / 2.0  # 中值止盈线（随阶段新高上移）
                if (pos["shares"] > 0 and pos["tp1_done"] and tp_mid
                        and b["low"] <= mid):
                    px = mid if b["high"] >= mid else b["open"]
                    sell(i, pos["shares"], px, "中值止盈线")
                elif pos["shares"] > 0 and pos["tp1_done"] and b["low"] <= pos["stop"]:
                    sell(i, pos["shares"], pos["stop"], "保本止损")
                elif pos["shares"] > 0 and pos["tp1_done"] and b["high"] >= pos["tp2"]:
                    sell(i, pos["shares"], pos["tp2"], f"止盈{p.tp2:g}R")
                elif pos["shares"] > 0 and pos["tp1_done"] and b["close"] < ind["ema_exit"][i]:
                    sell(i, pos["shares"], b["close"], "EMA20跟踪离场")
                elif pos["shares"] > 0 and i - pos["entry_bar"] >= p.max_hold:
                    sell(i, pos["shares"], b["close"], "时间止损")
            if pos["shares"] > 0:
                pos["hi"] = max(pos["hi"], b["high"])  # 阶段最高价（收盘后更新）
            if pos and pos["shares"] <= 0:
                close_trade(i, "；".join(lg[3] for lg in pos["legs"]))
        equity_curve.append(cash + (pos["shares"] * b["close"] if pos else 0.0))

    if pos:  # 数据结束强制平仓，保证统计完整
        i = n - 1
        sell(i, pos["shares"], bars[i]["close"], "回测结束平仓")
        close_trade(i, "回测结束平仓")
        equity_curve[-1] = cash
    return trades, equity_curve, skipped


def yearly_stats(trades):
    """按卖出日年份聚合交易，返回 [(年份, 笔数, 胜数, 盈亏合计, R合计), ...]（按年升序）。"""
    by = {}
    for t in trades:
        s = by.setdefault(t["exit_date"][:4], {"n": 0, "win": 0, "pnl": 0.0, "r": 0.0})
        s["n"] += 1
        s["win"] += 1 if t["pnl"] > 0 else 0
        s["pnl"] += t["pnl"]
        s["r"] += t["r"]
    return [(y, s["n"], s["win"], s["pnl"], s["r"]) for y, s in sorted(by.items())]


def monthly_returns(dates, eq, base):
    """按自然月计算月收益率（月末权益/上月末权益-1，首月以初始资金为基准）。
    返回 [("YYYY-MM", %), ...]；dates 与 eq 须一一对应
    （单股为 bars[warm:] 日期，组合为全部交易日并集）。"""
    rows, cur, month_end, prev_end = [], None, None, base
    for d, v in zip(dates, eq):
        m = d[:7]
        if m != cur:
            if cur is not None and month_end is not None:
                rows.append((cur, (month_end / prev_end - 1) * 100))
                prev_end = month_end
            cur = m
        month_end = v
    if cur is not None and month_end is not None:
        rows.append((cur, (month_end / prev_end - 1) * 100))
    return rows


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
    dates = [b["date"] for b in bars[warm:]]      # 与 equity_curve 逐日对齐
    return {
        "trades": trades, "final": final, "total_ret": total_ret, "max_dd": max_dd,
        "n": len(trades), "win_rate": len(wins) / len(trades) * 100 if trades else 0.0,
        "avg_r": sum(t["r"] for t in trades) / len(trades) if trades else 0.0,
        "pf": gw / gl if gl > 0 else float("inf"),
        "bench": bench, "skipped": skipped,
        "start_date": bars[warm]["date"] if len(bars) > warm else "-",
        "end_date": bars[-1]["date"] if bars else "-",
        "bars": max(0, len(bars) - warm),
        "yearly": yearly_stats(trades),
        "monthly": monthly_returns(dates, eq, p.capital),
    }


# ---------------------------------------------------------------- 组合回测

def run_portfolio(pdata, p):
    """组合级回测：全部标的共享一个资金池、并行持仓（每标的最多1笔）。
    约定: 每日先处理持仓退出释放资金，再处理入场（昨收信号->今开买入；
    --reentry 时为二次进场模式，突破后等调整再突破才进场）；
    同日多信号按传入顺序分配资金，资金不足一手则放弃。停牌日沿用昨收估值。
    返回 (trades, equity_curve, info)。
    """
    warm = max(p.ema_trend + 10, 70)
    date_index = {sym: {b["date"]: i for i, b in enumerate(bars)}
                  for _, sym, bars, _ in pdata}
    all_dates = sorted(set().union(*(date_index[sym].keys()
                                     for _, sym, _, _ in pdata)))

    cash = float(p.capital)
    tp_mid = getattr(p, "tp_mid", False)   # 剩余仓位中值止盈线（缺字段=不启用）
    positions = {}        # sym -> 持仓
    last_exit_idx = {}    # sym -> 完全平仓时的K线索引（冷却用）
    pendings = {}         # sym -> 二次进场等待状态（仅 --reentry 模式使用）
    trades = []
    equity_curve = []
    conc_sum = conc_days = 0
    util_sum = 0.0
    max_conc = 0

    def mark_equity():
        return cash + sum(pos["shares"] * pos["last_close"]
                          for pos in positions.values())

    def close_pos(sym, pos, note):
        sell_net = sum(pr * sh - fee for _, pr, sh, _, fee in pos["legs"])
        cost_total = pos["shares0"] * pos["entry"] + pos["buy_fee"]
        pnl = sell_net - cost_total
        trades.append({
            "name": pos["name"], "symbol": sym,
            "entry_date": pos["entry_date"], "exit_date": pos["legs"][-1][0],
            "entry": pos["entry"], "exit": pos["legs"][-1][1],
            "shares": pos["shares0"], "pnl": pnl,
            "r": pnl / (pos["shares0"] * pos["dist"]) if pos["dist"] > 0 else 0.0,
            "bars": pos["exit_idx"] - pos["entry_idx"], "note": note,
        })

    def sell(sym, pos, date, sh, price, reason):
        nonlocal cash
        proceeds = sh * price
        fee = max(5.0, proceeds * p.commission) + proceeds * p.stamp
        cash += proceeds - fee
        pos["legs"].append((date, price, sh, reason, fee))
        pos["shares"] -= sh

    for d in all_dates:
        # 1) 持仓退出
        for _, sym, bars, ind in pdata:
            pos = positions.get(sym)
            if pos is None:
                continue
            idx = date_index[sym].get(d)
            if idx is None:
                continue                      # 当日停牌，沿用昨收估值
            pos["last_close"] = bars[idx]["close"]
            pos["last_date"] = bars[idx]["date"]
            pos["exit_idx"] = idx
            if idx <= pos["entry_idx"]:       # T+1：买入当根不动作
                continue
            b = bars[idx]
            if b["open"] <= pos["stop"]:
                sell(sym, pos, b["date"], pos["shares"], b["open"], "止损(跳空)")
            elif b["low"] <= pos["stop"]:
                sell(sym, pos, b["date"], pos["shares"], pos["stop"],
                     "保本止损" if pos["tp1_done"] else "止损")
            elif pos["shares"] > 0:
                if not pos["tp1_done"] and b["high"] >= pos["tp1"]:
                    half = (pos["shares"] // 2) // 100 * 100
                    if half >= 100 and pos["shares"] - half >= 100:
                        sell(sym, pos, b["date"], half, pos["tp1"],
                             f"止盈{p.tp1:g}R减半")
                        pos["stop"] = max(pos["stop"], pos["entry"])
                        pos["tp1_done"] = True
                        pos["hi"] = max(pos["hi"], b["high"])  # 突破当日高点计入阶段最高价
                    else:
                        sell(sym, pos, b["date"], pos["shares"], pos["tp1"],
                             f"止盈{p.tp1:g}R")
                mid = (pos["entry"] + pos["hi"]) / 2.0  # 中值止盈线（随阶段新高上移）
                if (pos["shares"] > 0 and pos["tp1_done"] and tp_mid
                        and b["low"] <= mid):
                    px = mid if b["high"] >= mid else b["open"]
                    sell(sym, pos, b["date"], pos["shares"], px, "中值止盈线")
                elif pos["shares"] > 0 and pos["tp1_done"] and b["low"] <= pos["stop"]:
                    sell(sym, pos, b["date"], pos["shares"], pos["stop"], "保本止损")
                elif pos["shares"] > 0 and pos["tp1_done"] and b["high"] >= pos["tp2"]:
                    sell(sym, pos, b["date"], pos["shares"], pos["tp2"],
                         f"止盈{p.tp2:g}R")
                elif (pos["shares"] > 0 and pos["tp1_done"]
                      and b["close"] < ind["ema_exit"][idx]):
                    sell(sym, pos, b["date"], pos["shares"], b["close"], "EMA20跟踪离场")
                elif pos["shares"] > 0 and idx - pos["entry_idx"] >= p.max_hold:
                    sell(sym, pos, b["date"], pos["shares"], b["close"], "时间止损")
            if pos["shares"] > 0:
                pos["hi"] = max(pos["hi"], b["high"])  # 阶段最高价（收盘后更新）
            if pos["shares"] <= 0:
                close_pos(sym, pos, "；".join(lg[3] for lg in pos["legs"]))
                last_exit_idx[sym] = idx
                del positions[sym]

        # 2) 入场（昨收触发信号 -> 今开买入；--reentry 为二次进场模式）
        for name, sym, bars, ind in pdata:
            if sym in positions:
                continue
            idx = date_index[sym].get(d)
            if idx is None:
                continue
            b = bars[idx]
            j = idx - 1
            if p.reentry:
                pend = pendings.get(sym)
                if pend is None:
                    if (j >= warm
                            and idx - last_exit_idx.get(sym, -10 ** 9) > p.cooldown):
                        sig, _ = check_signal(bars, ind, j, p)
                        if sig:
                            pend = {"bo_bar": j, "hi": bars[j]["high"],
                                    "box_high": sig["box_high"], "adj_low": None}
                if pend is not None and "enter_bar" not in pend:
                    pend, trig = reentry_update(pend, idx, b, p)
                    if pend is None:
                        pendings.pop(sym, None)       # 跌回箱体/调整超时，作废
                    else:
                        pendings[sym] = pend
                        if trig:
                            pend["enter_bar"] = idx + 1   # 次日开盘进场
                elif pend is not None and idx >= pend["enter_bar"]:
                    if len(positions) >= p.max_pos:
                        pendings.pop(sym, None)           # 无空位，放弃本次机会
                        continue
                    atr = ind["atr"][pend["bo_bar"]]
                    entry = b["open"]
                    stop = pend["stop"]                   # 调整段最低点（触发日冻结）
                    dist = entry - stop
                    if dist < p.min_stop_atr * atr:
                        dist = p.min_stop_atr * atr
                        stop = entry - dist
                    if entry <= stop or dist / entry > p.max_stop_pct / 100:
                        pendings.pop(sym, None)           # 止损过宽，放弃
                        continue
                    equity = mark_equity()
                    shares = cap_shares(
                        int(equity * p.risk / 100 / dist / 100) * 100, entry, p)
                    if shares * entry > cash:
                        shares = int(cash / entry / 100) * 100
                    if p.max_total_pct > 0:               # 总仓位上限（按初始资金计）
                        held = sum(pp["shares"] * pp["last_close"]
                                   for pp in positions.values())
                        room = p.capital * p.max_total_pct / 100 - held
                        if shares * entry > room:
                            shares = int(room / entry / 100) * 100
                    if shares < 100:
                        pendings.pop(sym, None)           # 资金不足一手
                        continue
                    cost = shares * entry
                    fee = max(5.0, cost * p.commission)
                    cash -= cost + fee
                    positions[sym] = {
                        "name": name, "entry_idx": idx, "entry_date": b["date"],
                        "entry": entry, "stop": stop, "dist": dist,
                        "shares0": shares, "shares": shares,
                        "tp1": entry + p.tp1 * dist, "tp2": entry + p.tp2 * dist,
                        "tp1_done": False, "buy_fee": fee, "legs": [],
                        "hi": b["high"],
                        "last_close": b["close"], "last_date": b["date"],
                        "exit_idx": idx,
                    }
                    max_conc = max(max_conc, len(positions))
                    pendings.pop(sym, None)
                continue
            if len(positions) >= p.max_pos:
                break
            if j < warm or idx - last_exit_idx.get(sym, -10 ** 9) <= p.cooldown:
                continue
            sig, _ = check_signal(bars, ind, j, p)
            if not sig:
                continue
            atr = ind["atr"][j]
            entry = bars[idx]["open"]
            stop = sig["box_low"] - p.stop_buffer * atr
            dist = entry - stop
            if dist < p.min_stop_atr * atr:
                dist = p.min_stop_atr * atr
                stop = entry - dist
            if entry <= stop or dist / entry > p.max_stop_pct / 100:
                continue                      # 止损过宽，放弃
            equity = mark_equity()
            shares = cap_shares(int(equity * p.risk / 100 / dist / 100) * 100,
                                entry, p)
            if shares * entry > cash:
                shares = int(cash / entry / 100) * 100
            if p.max_total_pct > 0:           # 总仓位上限（按初始资金计）
                held = sum(pp["shares"] * pp["last_close"]
                           for pp in positions.values())
                room = p.capital * p.max_total_pct / 100 - held
                if shares * entry > room:
                    shares = int(room / entry / 100) * 100
            if shares < 100:
                continue                      # 资金不足一手/仓位上限已满
            cost = shares * entry
            fee = max(5.0, cost * p.commission)
            cash -= cost + fee
            positions[sym] = {
                "name": name, "entry_idx": idx, "entry_date": bars[idx]["date"],
                "entry": entry, "stop": stop, "dist": dist,
                "shares0": shares, "shares": shares,
                "tp1": entry + p.tp1 * dist, "tp2": entry + p.tp2 * dist,
                "tp1_done": False, "buy_fee": fee, "legs": [],
                "hi": b["high"],
                "last_close": bars[idx]["close"], "last_date": bars[idx]["date"],
                "exit_idx": idx,
            }
            max_conc = max(max_conc, len(positions))

        conc_sum += len(positions)
        conc_days += 1
        eq = mark_equity()
        equity_curve.append(eq)
        if eq > 0:
            util_sum += (eq - cash) / eq

    for sym, pos in list(positions.items()):  # 数据结束强制平仓
        sell(sym, pos, pos["last_date"], pos["shares"], pos["last_close"],
             "回测结束平仓")
        close_pos(sym, pos, "回测结束平仓")
        del positions[sym]
    if equity_curve:
        equity_curve[-1] = cash
    info = {
        "max_conc": max_conc,
        "avg_conc": conc_sum / conc_days if conc_days else 0.0,
        "avg_util": util_sum / conc_days if conc_days else 0.0,
        "start_date": all_dates[0] if all_dates else "-",
        "end_date": all_dates[-1] if all_dates else "-",
        "days": len(all_dates),
    }
    return trades, equity_curve, info


def summarize_portfolio(trades, eq, pdata, p, info):
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
    warm = max(p.ema_trend + 10, 70)
    rets = [bars[-1]["close"] / bars[warm]["close"] - 1
            for _, _, bars, _ in pdata if len(bars) > warm]
    bench = sum(rets) / len(rets) * 100 if rets else 0.0
    # 组合权益曲线与全部交易日并集逐日对齐（与 run_portfolio 的 all_dates 同一构造）
    all_dates = sorted({b["date"] for _, _, bars, _ in pdata for b in bars})
    return {
        "trades": trades, "final": final, "total_ret": total_ret, "max_dd": max_dd,
        "n": len(trades), "win_rate": len(wins) / len(trades) * 100 if trades else 0.0,
        "avg_r": sum(t["r"] for t in trades) / len(trades) if trades else 0.0,
        "pf": gw / gl if gl > 0 else float("inf"),
        "bench": bench, "info": info,
        "yearly": yearly_stats(trades),
        "monthly": monthly_returns(all_dates, eq, p.capital),
    }


# ---------------------------------------------------------------- 输出

def print_yearly(rows):
    """分年度统计块（跨年时输出；单年与顶部汇总重复，省略）。"""
    if len(rows) < 2:
        return
    print(DIM + "\n分年度统计:" + RESET)
    header = ("年份", "交易", "胜率", "盈亏", "平均R")
    widths = (6, 4, 5, 12, 7)
    print(DIM + "  ".join(pad(h, w) for h, w in zip(header, widths)) + RESET)
    for y, n, win, pnl, r_sum in rows:
        avg_r = r_sum / n
        row = [
            pad(y, widths[0]), pad(str(n), widths[1], "right"),
            pad(f"{win / n * 100:.0f}%", widths[2], "right"),
            pad(f"{pnl:+,.0f}", widths[3], "right"),
            pad(f"{avg_r:+.2f}", widths[4], "right"),
        ]
        row[3] = paint(pnl, row[3])
        row[4] = paint(avg_r, row[4])
        print("  ".join(row))


def print_monthly(rows):
    """月度收益块：每年一行、1~12月定宽格子（月末权益环比%）。"""
    if len(rows) < 2:
        return
    print(DIM + "\n月度收益%（月末权益环比）:" + RESET)
    by_year = {}
    for m, ret in rows:
        by_year.setdefault(m[:4], {})[m[5:7]] = ret
    head = pad("年份", 4) + " " + " ".join(pad(f"{mm}月", 5, "right")
                                          for mm in range(1, 13))
    print(DIM + head + RESET)
    for y in sorted(by_year):
        cells = [pad(y, 4)]
        for mm in range(1, 13):
            key = f"{mm:02d}"
            if key in by_year[y]:
                v = by_year[y][key]
                cells.append(paint(v, f"{v:+5.1f}"))
            else:
                cells.append(DIM + pad("·", 5, "right") + RESET)
        print(" ".join(cells))


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
    print_yearly(st["yearly"])
    print_monthly(st["monthly"])


def write_md_note(name, symbol, st, p):
    """单标的回测记录以 Markdown 追加写入 src/<名称>.md（不覆盖笔记已有内容）。"""
    md = SRC_DIR / f"{name}.md"
    pf = f"{st['pf']:.2f}" if st["pf"] != float("inf") else "∞"
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    tp2_s = "不设" if p.tp2 >= 999 else f"{p.tp2:g}R"
    mode_s = " · 二次进场" if p.reentry else ""
    if getattr(p, "tp_mid", False):
        mode_s += " · 中值止盈线"
    lines = [
        f"## 回测记录 {now}",
        "",
        f"- 参数：days={p.days} · risk={p.risk:g}% · tp1={p.tp1:g}R · tp2={tp2_s}"
        f" · 止损上限={p.max_stop_pct:g}%{mode_s}",
        f"- 区间：{st['start_date']} ~ {st['end_date']}（{st['bars']}根K线）",
        f"- 期末权益：{st['final']:,.0f}（{st['total_ret']:+.2f}%）｜基准买入持有：{st['bench']:+.2f}%",
        f"- 最大回撤：{st['max_dd']:.2f}%",
        f"- 交易次数：{st['n']}｜胜率 {st['win_rate']:.1f}%｜平均R {st['avg_r']:+.2f}｜盈亏比 {pf}",
    ]
    if st["skipped"]:
        lines.append(f"- 跳过信号：{st['skipped']} 个（止损过宽/资金不足）")
    if len(st["yearly"]) >= 2:                 # 跨年时附分年度统计表
        lines += [
            "",
            "**分年度统计**",
            "",
            "| 年份 | 交易 | 胜率 | 盈亏 | 平均R |",
            "|------|-----:|-----:|-----:|------:|",
        ]
        for y, n, win, pnl, r_sum in st["yearly"]:
            lines.append(f"| {y} | {n} | {win / n * 100:.0f}% "
                         f"| {pnl:+,.0f} | {r_sum / n:+.2f} |")
    lines += [
        "",
        "| # | 买入日 | 卖出日 | 买入价 | 卖出价 | 股数 | 净盈亏 | R | 天 | 出场 |",
        "|---|--------|--------|-------:|-------:|-----:|-------:|--:|--:|------|",
    ]
    for k, t in enumerate(st["trades"], 1):
        lines.append(
            f"| {k} | {t['entry_date']} | {t['exit_date']} | {t['entry']:.2f} | "
            f"{t['exit']:.2f} | {t['shares']} | {t['pnl']:+,.0f} | {t['r']:+.2f} | "
            f"{t['bars']} | {t['note']} |")
    if not st["trades"]:
        lines.append("| - | 区间内无成交信号 | | | | | | | | |")
    body = "\n".join(lines) + "\n"
    try:
        if md.exists():
            old = md.read_text("utf-8").rstrip("\n")
            md.write_text(old + "\n\n---\n\n" + body, "utf-8")
        else:
            md.write_text(f"# {name}（{symbol}）\n\n" + body, "utf-8")
        print(DIM + f"回测记录已写入 {md}" + RESET)
    except OSError as e:
        print(DIM + f"写入 {md} 失败: {e}" + RESET)


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


def print_portfolio_report(st, p):
    line = "─" * 66
    info = st["info"]
    print(f"\n{BOLD}钻潜组合回测（共享资金池，并行持仓）{RESET}  "
          f"{DIM}{info['start_date']} ~ {info['end_date']}（{info['days']}个交易日）{RESET}")
    print(line)
    eq_s = paint(st["total_ret"], f"{st['final']:,.0f}（{st['total_ret']:+.2f}%）")
    bench_s = paint(st["bench"], f"{st['bench']:+.2f}%")
    r_s = paint(st["avg_r"], f"{st['avg_r']:+.2f}")
    pf = f"{st['pf']:.2f}" if st["pf"] != float("inf") else "∞"
    print(f"期末权益    {eq_s}   等权买入持有基准: {bench_s}")
    print(f"最大回撤    {st['max_dd']:.2f}%   平均资金利用率 {info['avg_util']*100:.1f}%   "
          f"同时持仓 均{info['avg_conc']:.1f}/峰{info['max_conc']}")
    print(f"交易次数    {st['n']}   胜率 {st['win_rate']:.1f}%   平均R {r_s}   盈亏比 {pf}")
    if not st["trades"]:
        print(DIM + "区间内无成交信号" + RESET)
        return
    by_sym = {}
    for t in st["trades"]:
        s = by_sym.setdefault(t["name"], {"n": 0, "win": 0, "pnl": 0.0})
        s["n"] += 1
        s["win"] += 1 if t["pnl"] > 0 else 0
        s["pnl"] += t["pnl"]
    print(DIM + "\n按标的盈亏:" + RESET)
    for name, s in sorted(by_sym.items(), key=lambda kv: -kv[1]["pnl"]):
        wr = s["win"] / s["n"] * 100
        print(f"  {pad(name, 10)} {s['n']:>2}笔 {wr:4.0f}%  "
              + paint(s["pnl"], f"{s['pnl']:+,.0f}"))
    print_yearly(st["yearly"])
    print_monthly(st["monthly"])
    if p.full:
        header = ("#", "标的", "买入日", "卖出日", "买入价", "卖出价",
                  "股数", "净盈亏", "R", "天", "出场")
        widths = [4, 10, 11, 11, 9, 9, 7, 11, 7, 4, 24]
        print(DIM + "\n" + " ".join(pad(h, w) for h, w in zip(header, widths)) + RESET)
        for k, t in enumerate(st["trades"], 1):
            row = [
                pad(str(k), widths[0]), pad(t["name"], widths[1]),
                pad(t["entry_date"], widths[2]), pad(t["exit_date"], widths[3]),
                pad(f"{t['entry']:.2f}", widths[4], "right"),
                pad(f"{t['exit']:.2f}", widths[5], "right"),
                pad(f"{t['shares']}", widths[6], "right"),
                pad(f"{t['pnl']:+,.0f}", widths[7], "right"),
                pad(f"{t['r']:+.2f}", widths[8], "right"),
                pad(str(t["bars"]), widths[9], "right"),
                pad(t["note"], widths[10]),
            ]
            row[7] = paint(t["pnl"], row[7])
            row[8] = paint(t["r"], row[8])
            print(" ".join(row))


# ---------------------------------------------------------------- 信号扫描

def fill_position(row, ref_price, dist, p):
    """按资金管理规则填入建议股数与仓位占比（与回测口径一致）。"""
    if dist <= 0:
        return
    shares = cap_shares(int(p.capital * p.risk / 100 / dist / 100) * 100,
                        ref_price, p)
    if shares >= 100:
        row["建议股数"] = shares
        row["仓位%"] = round(shares * ref_price / p.capital * 100, 1)


def scan_reentry(p, bars, ind, head, row, n, last):
    """二次进场模式扫描：报告 方向确立/等待二次进场/二次进场 三种状态。"""
    j0, sig0 = None, None
    for j in range(n - 1, max(70, n - p.reentry_max - 8) - 1, -1):
        sg, _ = check_signal(bars, ind, j, p)
        if sg:
            j0, sig0 = j, sg
            break
    if j0 is None:
        print(head + DIM + "无信号（近期无方向确立K线）" + RESET)
        row["状态"], row["说明"] = "无信号", "近期无突破K线"
        return row
    state, t, stop_r, hi_r, adj_r = reentry_scan_state(bars, p, j0, sig0["box_high"])
    if state == "triggered" and t >= n - 3:
        entry = bars[t + 1]["open"] if t + 1 < n else last["close"]
        stop = stop_r
        atr_j = ind["atr"][t] or ind["atr"][-1] or 0.0
        dist = max(entry - stop, p.min_stop_atr * atr_j)
        tp1, tp2 = entry + p.tp1 * dist, entry + p.tp2 * dist
        print(head + f"{RED}二次进场@{bars[t]['date']}{RESET} 突破K@{bars[j0]['date']} "
                     f"买入参考{entry:.2f} → 止损(调整低点) {stop:.2f} / "
                     f"止盈1 {tp1:.2f} / 止盈2 {tp2:.2f}")
        row.update({"状态": "二次进场", "信号日": bars[t]["date"],
                    "触发价": round(entry, 2), "止损价": round(stop, 2),
                    "止盈1价": round(tp1, 2), "止盈2价": round(tp2, 2),
                    "止损距离%": round(dist / entry * 100, 1),
                    "说明": f"突破K@{bars[j0]['date']}，止损=调整段最低点"})
        fill_position(row, entry, dist, p)
        if dist / entry > p.max_stop_pct / 100:
            row["说明"] = f"止损距离超{p.max_stop_pct:g}%上限，按规则放弃"
        return row
    if state == "waiting":
        trigger = hi_r
        stop_s = f"{adj_r:.2f}" if adj_r else "待调整形成"
        print(head + f"方向确立@{bars[j0]['date']} 调整中 → 收盘过 {trigger:.2f} "
                     f"触发二次进场（止损参考=调整低点 {stop_s}）")
        row.update({"状态": "等待二次进场", "信号日": bars[j0]["date"],
                    "触发价": round(trigger, 2),
                    "止损价": round(adj_r, 2) if adj_r else "",
                    "说明": "突破K线后小级别调整中；收盘再过前高触发，止损=调整段最低点"})
        return row
    if state == "triggered":
        print(head + DIM + f"无信号（{bars[t]['date']}已触发二次进场，超出近3日）" + RESET)
        row["状态"], row["说明"] = "无信号", "二次进场触发已过3日"
        return row
    print(head + DIM + "无信号（突破后跌回箱体或调整超时）" + RESET)
    row["状态"], row["说明"] = "无信号", "突破后结构破坏或调整超时"
    return row


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

    if p.reentry:
        return scan_reentry(p, bars, ind, head, row, n, last)

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
    code2name = {v: k for k, v in config.items()}
    out = []
    for t in tokens:
        sym = guess_symbol(t)
        if sym:
            out.append((code2name.get(t) or code2name.get(sym[2:]) or t, sym))
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


def universe_targets(p):
    """全市场预筛样本（复用 screener.py 的列表拉取与预筛规则）。"""
    from screener import base_filter, fetch_universe, fetch_universe_tencent
    print("拉取全市场列表（东财）...")
    try:
        universe = fetch_universe(False)
        if not universe:
            raise OSError("东财返回空列表")
    except (OSError, ValueError) as e:
        print(DIM + f"东财列表不可用（{e}），切换腾讯备用列表 ..." + RESET)
        try:
            universe = fetch_universe_tencent()
        except (OSError, ValueError) as e2:
            print(f"列表获取失败: {e2}")
            return []
    items = [u for u in universe if base_filter(u, p)]
    print(f"全市场 {len(universe)} 只 → 预筛 {len(items)} 只")
    return [(u["name"], u["symbol"]) for u in items]


def fetch_pdata(valid, p, workers=1):
    """拉K线并计算指标，返回 pdata（保持传入顺序）；workers>1 时并发。"""
    warm = max(p.ema_trend + 10, 70)
    out = [None] * len(valid)
    errs = []

    def work(i, name, sym):
        try:
            bars = fetch_kline(sym, p.days)
        except OSError as e:
            return f"{name} {sym} 获取失败: {e}"
        if len(bars) < warm + 30:
            return f"{name} {sym} 数据不足（{len(bars)}根），跳过"
        out[i] = (name, sym, bars, compute_indicators(bars, p))
        return None

    if workers <= 1:
        for i, (name, sym) in enumerate(valid):
            e = work(i, name, sym)
            if e:
                errs.append(e)
    else:
        with ThreadPoolExecutor(max_workers=workers) as ex:
            futs = [ex.submit(work, i, n, s) for i, (n, s) in enumerate(valid)]
            done = 0
            for fut in as_completed(futs):
                e = fut.result()
                if e:
                    errs.append(e)
                done += 1
                if done % 50 == 0 or done == len(valid):
                    print(f"\r  拉取进度 {done}/{len(valid)}", end="", flush=True)
        print("\r" + " " * 30 + "\r", end="")
    for e in errs:
        print(DIM + e + RESET)
    return [x for x in out if x]


def apply_strict(p):
    """--strict 会议纪要严格筛选口径：四共振 + 标准K线 + 箱体净化 + 横盘2个月。
    仅填充未显式指定的项（值为0视为未指定）；box_min 不低于40根（约2个月交易日）。"""
    if not getattr(p, "strict", False):
        return p
    p.std_kline_atr = p.std_kline_atr or 2.0      # 标准K线: 整根幅度 >= 2*ATR
    p.glue_pct = p.glue_pct or 3.0                # 均线粘合: MA20/长均线收敛 <= 3%
    p.ma_long = p.ma_long or 60                   # 长均线方向: MA60 走平或上行
    p.atr_min = p.atr_min or 1.5                  # ATR摆动量下限 1.5%
    p.purify_atr = p.purify_atr or 2.0            # 箱体净化: 内部 2*ATR 大K线作废
    p.box_min = max(p.box_min, 40)                # 横盘 >= 2个月（约40个交易日）
    p.box_max = max(p.box_max, p.box_min)
    return p


def build_parser():
    ap = argparse.ArgumentParser(description="钻潜交易体系·规则化回测与信号扫描（腾讯日K数据）")
    ap.add_argument("targets", nargs="*", help="股票代码或名称，留空则回测 src/ 全部自选股")
    ap.add_argument("--scan", action="store_true", help="只扫描最近3个交易日的信号，不回测")
    ap.add_argument("--full", action="store_true", help="多标的时也输出完整交易明细")
    ap.add_argument("--md", action="store_true",
                    help="回测记录追加写入 src/<名称>.md 笔记")
    ap.add_argument("--portfolio", action="store_true",
                    help="组合模式：全部标的共享资金池并行持仓回测")
    ap.add_argument("--universe", action="store_true",
                    help="全市场预筛样本组合回测（东财列表+预筛，隐含--portfolio，忽略命令行标的）")
    ap.add_argument("--workers", type=int, default=12,
                    help="--universe 模式并发拉取K线的线程数")
    ap.add_argument("--min-amount", type=float, default=2000,
                    help="--universe 预筛: 当日成交额下限（万元）")
    ap.add_argument("--min-cap", type=float, default=0,
                    help="--universe 预筛: 流通市值下限（亿元，0=不限）")
    ap.add_argument("--min-price", type=float, default=2.0,
                    help="--universe 预筛: 股价下限（元）")
    ap.add_argument("--max-price", type=float, default=0,
                    help="--universe 预筛: 股价上限（元，0=不限）")
    ap.add_argument("--min-chg", type=float, default=0,
                    help="--universe 预筛: 当日涨幅下限%%（0=不限，设置后可大幅缩小样本提速）")
    ap.add_argument("--max-pos", type=int, default=4,
                    help="组合模式最大同时持仓数（默认4）")
    ap.add_argument("--csv", metavar="FILE", help="扫描结果导出CSV（配合--scan，含止盈止损位）")
    ap.add_argument("--watch-dist", type=float, default=3.0,
                    help="预备箱体: 收盘距触发价上限%%（默认3）")
    ap.add_argument("--days", type=int, default=600, help="回测/扫描取多少根日K（默认600）")
    ap.add_argument("--capital", type=float, default=1_000_000, help="初始资金（默认100万）")
    ap.add_argument("--risk", type=float, default=1.0, help="单笔风险占资金%%（默认1.0）")
    ap.add_argument("--commission", type=float, default=0.0003, help="佣金率（双边，默认万3）")
    ap.add_argument("--stamp", type=float, default=0.0005, help="印花税率（仅卖出，默认万5）")
    ap.add_argument("--ema-trend", type=int, default=40, help="日线趋势EMA周期（默认40）")
    ap.add_argument("--weekly-ema", type=int, default=8, help="周线趋势EMA周期（默认8）")
    ap.add_argument("--box-min", type=int, default=5, help="横盘箱体最短K线数（默认5）")
    ap.add_argument("--box-max", type=int, default=35, help="横盘箱体最长K线数（默认35）")
    ap.add_argument("--box-atr", type=float, default=3.0, help="箱体宽度上限 = 倍数*ATR（默认3.0）")
    ap.add_argument("--body-atr", type=float, default=0.7, help="突破阳线实体下限 = 倍数*ATR（默认0.7）")
    ap.add_argument("--vol-mult", type=float, default=1.2, help="突破量能下限 = 倍数*20日均量（默认1.2）")
    ap.add_argument("--atr-max", type=float, default=6.0, help="ATR占比上限%%，超过不做（默认6.0）")
    ap.add_argument("--chase-atr", type=float, default=1.5, help="收盘超出箱体上沿多少倍ATR放弃（默认1.5）")
    ap.add_argument("--tp1", type=float, default=2.5, help="第一止盈R倍数，减半仓（默认2.5）")
    ap.add_argument("--tp2", type=float, default=999.0, help="第二止盈R倍数，设大即近似纯EMA20跟踪（默认999=不设）")
    ap.add_argument("--tp-mid", action="store_true",
                    help="剩余仓位中值止盈线: (进场价+阶段最高价)/2，回落触及离场"
                         "（随新高上移，锁住约一半峰值利润）")
    ap.add_argument("--stop-buffer", type=float, default=0.0, help="止损低于箱体下沿的ATR缓冲（默认0.0）")
    ap.add_argument("--min-stop-atr", type=float, default=1.0, help="最小止损距离 = 倍数*ATR（默认1.0）")
    ap.add_argument("--max-stop-pct", type=float, default=15.0, help="止损距离占现价上限%%（默认15）")
    ap.add_argument("--max-hold", type=int, default=60, help="最长持仓K线数（默认60）")
    ap.add_argument("--cooldown", type=int, default=3, help="平仓后冷却K线数（默认3）")
    ap.add_argument("--reentry", action="store_true",
                    help="二次进场模式：不参与第一根方向确立K线，调整后再突破才进场，"
                         "止损=调整段最低点")
    ap.add_argument("--reentry-min", type=int, default=1,
                    help="二次进场: 突破后至少调整几根K线才可触发（默认1）")
    ap.add_argument("--reentry-max", type=int, default=10,
                    help="二次进场: 调整超过几根K线作废（默认10）")
    ap.add_argument("--max-pos-pct", type=float, default=10.0,
                    help="单只最大开仓比例%%总资金（默认10，0=不限）")
    ap.add_argument("--max-total-pct", type=float, default=40.0,
                    help="组合模式总仓位上限%%初始资金（默认40，0=不限）")
    ap.add_argument("--strict", action="store_true",
                    help="会议纪要严格筛选口径: 横盘>=40根(2个月) + 标准K线2*ATR + "
                         "均线粘合(MA20/长均线<=3%%) + 长均线MA60走平或上行 + "
                         "ATR摆动量1.5%%~6%% + 箱体净化(内部2*ATR大K线作废)")
    ap.add_argument("--std-kline-atr", type=float, default=0.0,
                    help="标准K线: 整根幅度>=N*ATR（0=不启用，纪要口径2.0）")
    ap.add_argument("--glue-pct", type=float, default=0.0,
                    help="均线粘合: (MA20与长均线max-min)/min<=N%%（0=不启用，纪要口径3，"
                         "需配合--ma-long）")
    ap.add_argument("--ma-long", type=int, default=0,
                    help="长均线周期N，走平或上行才可做（0=不启用，纪要口径60）")
    ap.add_argument("--atr-min", type=float, default=0.0,
                    help="ATR摆动量下限: ATR/收盘>=N%%（0=不启用）")
    ap.add_argument("--purify-atr", type=float, default=0.0,
                    help="箱体净化: 箱体内整根幅度>=N*ATR的大K线使箱体作废"
                         "（0=不启用，纪要口径2.0）")
    return ap


def main():
    enable_ansi()
    p = apply_strict(build_parser().parse_args())
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

    if p.portfolio or p.universe:
        if p.universe:
            if p.targets:
                print(DIM + "--universe 模式忽略命令行标的，使用全市场预筛样本" + RESET)
            valid = universe_targets(p)
            if not valid:
                return 1
        pdata = fetch_pdata(valid, p,
                            max(1, min(p.workers, 32)) if p.universe else 1)
        if len(pdata) < 2:
            print("组合模式至少需要2个可用标的")
            return 1
        trades, eq, info = run_portfolio(pdata, p)
        st = summarize_portfolio(trades, eq, pdata, p, info)
        print_portfolio_report(st, p)
        print(DIM + "\n提示: 规则为公开「钻潜」思想的程序化近似；"
              "回测不代表未来收益，仅供学习研究。" + RESET)
        return 0

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
        if p.md:
            write_md_note(name, sym, st, p)

    if len(results) > 1:
        mode_s = "二次进场" if p.reentry else "突破直入"
        print(BOLD + f"\n钻潜体系回测汇总（{mode_s} · risk={p.risk:g}% "
              f"box={p.box_min}~{p.box_max} tp={p.tp1:g}R/{p.tp2:g}R）" + RESET)
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

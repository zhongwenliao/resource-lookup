"""高股息观察池·建仓辅助（src/高股息/）

用途:
  对 src/高股息/*.md 观察池逐只做「建仓体检」：趋势位置、MACD 动能、横盘
  箱体、年内回撤，给出状态结论（突破买入/企稳分批/回踩挂单/继续观望）、
  三批建仓价位与股数、止损参考与建仓理由；收盘后把当日结论回写到
  src/高股息/<名称>.md（追加式、幂等，与 stock.py 的收盘记录并存）。

用法:
  python guxi.py                          体检观察池全部标的
  python guxi.py 600900 工商银行          只体检指定标的（代码或名称）
  python guxi.py --capital 100000         按总资金 10 万元给出分批股数
  python guxi.py --per-stock 15           单只资金上限 15%（默认 0=均分）
  python guxi.py --no-save                只展示，不回写结论到观察池文件

口径:
  - 技术分析用前复权日K（与 zuanqian/screener 一致）；红涨绿跌
  - MACD柱 = 2×(DIF−DEA)，DIF=EMA12−EMA26，DEA=EMA9；均线 ma13/ma60
  - 箱体/止损沿用钻潜体系默认参数：箱体 6~25 根 ≤3×ATR，止损=箱体下沿−0.2×ATR
  - 建仓分三批等分资金：批1 现价/回踩支撑，批2 更深回撤，批3 右侧确认
  - 状态优先级：突破信号 > 企稳分批 > 回踩挂单 > 继续观望
  - 股数按 1 手（100股）向下取整；ETF（代码 15/51 开头）价格 3 位小数
  - 结论回写：日期取最后一根K线（周末/节假日运行标注最近交易日）；K线为
    当日但未到 15:00 视为盘中，只展示不写入；已有同日结论则跳过
  - 仅供学习研究，不构成投资建议
"""
import argparse
import sys
from types import SimpleNamespace

from stock import CHECK_RE, WATCH_DIR, _beijing_now, load_watchlist
from zuanqian import (BOLD, DIM, RESET, check_signal, compute_indicators,
                      enable_ansi, ema_series, fetch_kline, find_box,
                      guess_symbol, load_config, pad, paint, resolve_targets,
                      sma_series)

KLINE_COUNT = 260   # 日K根数：覆盖250日高低点与指标预热
SUPPORT_ATR = 1.5   # 距支撑 ≤1.5×ATR 视为「临近支撑」
LOT = 100           # 一手股数
LINE = "─" * 66


def build_params():
    """钻潜体系默认参数（与 zuanqian.py / screener.py 默认一致）。"""
    return SimpleNamespace(
        ema_trend=60, weekly_ema=8, lookback=1,
        box_min=6, box_max=25, box_atr=3.0,
        body_atr=1.0, vol_mult=1.5, atr_max=7.0, chase_atr=1.0,
        tp1=2.0, tp2=3.0, stop_buffer=0.2, min_stop_atr=1.0, max_stop_pct=12.0)


def macd_series(closes):
    """MACD：DIF=EMA12−EMA26，DEA=EMA9(DIF)，柱=2×(DIF−DEA)。"""
    e12, e26 = ema_series(closes, 12), ema_series(closes, 26)
    dif = [None if a is None or b is None else a - b for a, b in zip(e12, e26)]
    valid = [d for d in dif if d is not None]
    dea_valid = ema_series(valid, 9)
    dea, k = [None] * len(dif), 0
    for i, d in enumerate(dif):
        if d is not None:
            dea[i] = dea_valid[k]
            k += 1
    bar = [None if d is None or e is None else 2 * (d - e) for d, e in zip(dif, dea)]
    return dif, bar


def price_dec(symbol):
    """价格小数位：ETF（代码 15/51 开头）3 位，股票 2 位。"""
    return 3 if symbol[2:].startswith(("15", "51")) else 2


def lots(amount, price):
    """按预算与价格算股数，1 手取整；不足一手返回 0。"""
    if price <= 0 or amount <= 0:
        return 0
    return int(amount / price / LOT) * LOT


def analyze_one(name, symbol, p):
    """单只建仓体检，返回结果 dict；数据不足抛 ValueError。"""
    bars = fetch_kline(symbol, KLINE_COUNT)
    if len(bars) < 60:
        raise ValueError(f"K线不足（{len(bars)}根）")
    ind = compute_indicators(bars, p)
    j = len(bars) - 1
    close = bars[j]["close"]
    chg = (close / bars[j - 1]["close"] - 1) * 100
    closes = [b["close"] for b in bars]
    ma13s, ma60s = sma_series(closes, 13), sma_series(closes, 60)
    ma13, ma60 = ma13s[j], ma60s[j]
    dif, mbar = macd_series(closes)
    atr = ind["atr"][j] or 0.0
    atr_pct = atr / close * 100

    seg = bars[-250:]
    hi = max(b["high"] for b in seg)
    lo = min(b["low"] for b in seg)
    drawdown = (close / hi - 1) * 100            # 距250日高点回撤
    range_pos = (close - lo) / (hi - lo) * 100 if hi > lo else 50.0

    box = find_box(bars, atr, j, p)
    box_high, box_low = (box[0], box[1]) if box else (None, None)

    sig, _ = check_signal(bars, ind, j, p)
    gold = (mbar[j] is not None and mbar[j - 1] is not None
            and mbar[j] > 0 >= mbar[j - 1])
    shrink = (mbar[j] is not None and mbar[j] < 0 and mbar[j - 1] is not None
              and mbar[j - 1] < 0 and mbar[j - 2] is not None
              and abs(mbar[j]) < abs(mbar[j - 1]) < abs(mbar[j - 2]))
    above_ma13 = ma13 is not None and close > ma13
    ma13_up = (ma13 is not None and ma13s[j - 1] is not None and ma13 >= ma13s[j - 1])

    # 支撑 = 现价下方最近的关键位（箱体下沿/ma13/ma60/250日低点）
    below = [x for x in (box_low, ma13, ma60, lo) if x is not None and x < close]
    support = max(below) if below else lo
    # 触发 = 现价上方最近的关键位（箱体上沿/ma60/250日高点）
    above = [x for x in (box_high, ma60, hi) if x is not None and x > close]
    trigger = min(above) if above else close

    if sig:
        state = "突破买入"
    elif above_ma13 and (gold or shrink or ma13_up):
        state = "企稳分批"
    elif atr and (close - support) / atr <= SUPPORT_ATR:
        state = "回踩挂单"
    else:
        state = "继续观望"

    # 三批建仓参考价：（价位, 说明）
    if state == "突破买入":
        plan = [(close, "突破确认收盘"), (box_high, "回踩箱体上沿"),
                (box_low or close, "回踩箱体下沿不破")]
    elif state == "企稳分批":
        plan = [(close, "企稳现价"), (support, "回踩支撑位"), (trigger, "右侧确认加仓")]
    else:
        plan = [(support, "支撑位挂单"), (support - atr, "支撑下方1×ATR"),
                (trigger, "右侧确认后跟进")]

    if box_low is not None:
        stop, stop_note = box_low - 0.2 * atr, "箱体下沿−0.2×ATR"
    else:
        stop, stop_note = lo - 0.2 * atr, "250日低点−0.2×ATR"

    # ---- 建仓理由（全部由计算结果生成） ----
    if ma60 is None:
        trend_txt = "ma60数据不足"
    elif close >= ma60:
        trend_txt = f"高于ma60 {(close / ma60 - 1) * 100:+.1f}%"
    else:
        trend_txt = f"低于ma60 {(1 - close / ma60) * 100:.1f}%"
    reasons = [f"趋势：{trend_txt}，距250日高点回撤 {drawdown:.1f}%，年内位置 {range_pos:.0f}%"]

    if mbar[j] is None:
        macd_txt = "MACD数据不足"
    else:
        side = "零轴上方" if dif[j] > 0 else "零轴下方"
        color = "红" if mbar[j] > 0 else "绿"
        if gold:
            move = "金叉"
        elif mbar[j - 1] is not None and abs(mbar[j]) > abs(mbar[j - 1]):
            move = "扩大"
        else:
            move = "缩小"
        macd_txt = f"MACD{side}，{color}柱{move}（{mbar[j]:.2f}）"
    reasons.append(f"动能：{macd_txt}，ATR {atr_pct:.1f}%")

    if box:
        reasons.append(f"箱体：{box_low:.2f}~{box_high:.2f}（{box[2]}根K线），"
                       f"触发位 {box_high:.2f}（距 {(box_high / close - 1) * 100:+.1f}%）")
    else:
        reasons.append("箱体：暂无有效横盘箱体（≤3×ATR）")

    sigs = [t for t, on in (("MACD金叉", gold), ("绿柱连续收窄", shrink),
                            ("站上ma13", above_ma13), ("ma13拐头向上", ma13_up)) if on]
    reasons.append("企稳信号：" + ("、".join(sigs) if sigs else "暂无（等站上ma13或MACD金叉）"))

    if state == "继续观望":
        concl = ("企稳信号初步出现但未确认（还需站上ma13且动能修复），"
                 "等回踩支撑挂单或右侧确认" if sigs else
                 "企稳信号未出现，等回踩支撑挂单或右侧确认后再进")
    else:
        concl = {
            "突破买入": "触发钻潜突破信号，可执行第一批（突破确认）",
            "企稳分批": "趋势与动能初步企稳，可开始分批建仓",
            "回踩挂单": f"距支撑 {support:.2f} 仅 {(close / support - 1) * 100:.1f}%，可挂单等回踩",
        }[state]

    brief = "；".join([
        trend_txt,
        f"箱体{box_low:.2f}~{box_high:.2f}（{box[2]}根）" if box else "无有效箱体",
        "、".join(sigs) if sigs else "无企稳信号",
    ])

    return {"name": name, "symbol": symbol, "date": bars[j]["date"],
            "close": close, "chg": chg, "state": state, "plan": plan,
            "stop": stop, "stop_note": stop_note, "reasons": reasons,
            "brief": brief, "concl": concl}


def render_report(rows, budget):
    """打印汇总表 + 逐只明细（理由/三批计划/止损）。"""
    print(BOLD + f"高股息观察池 · 建仓体检（src/高股息/，前复权日K，截至 {rows[0]['date']}）" + RESET)
    print(f"每只预算 {budget:,.0f} 元 · 分 3 批等分（每批 {budget / 3:,.0f} 元）· 股数按 1 手取整")
    header = ("名称", "现价", "涨跌", "状态", "批1参考", "批3触发", "止损")
    widths = [10, 8, 8, 8, 9, 9, 8]
    print(" ".join(pad(h, w) for h, w in zip(header, widths)))
    for r in rows:
        dec = price_dec(r["symbol"])
        state_cell = pad(r["state"], widths[3])
        if r["state"] == "继续观望":
            state_cell = DIM + state_cell + RESET
        elif r["state"] in ("突破买入", "企稳分批"):
            state_cell = BOLD + state_cell + RESET
        chg_cell = paint(r["chg"], pad(f"{r['chg']:+.2f}%", widths[2], "right"))
        row = [
            pad(r["name"], widths[0]),
            pad(f"{r['close']:.{dec}f}", widths[1], "right"),
            chg_cell,
            state_cell,
            pad(f"{r['plan'][0][0]:.{dec}f}", widths[4], "right"),
            pad(f"{r['plan'][2][0]:.{dec}f}", widths[5], "right"),
            pad(f"{r['stop']:.{dec}f}", widths[6], "right"),
        ]
        print(" ".join(row))

    for r in rows:
        dec = price_dec(r["symbol"])
        print("\n" + LINE)
        print(BOLD + f"{r['name']} {r['symbol']}  现价 {r['close']:.{dec}f}"
              f"（{r['chg']:+.2f}%）  状态: {r['state']}" + RESET)
        for rs in r["reasons"]:
            print(f"  · {rs}")
        print(BOLD + f"  结论: {r['concl']}" + RESET)
        print(f"  三批计划（每批 {budget / 3:,.0f} 元）:")
        for k, (price, note) in enumerate(r["plan"], 1):
            n = lots(budget / 3, price)
            if n:
                qty = f"{n}股"
            else:  # 单批不足一手：提示两批合并
                n2 = lots(budget / 3 * 2, price)
                qty = f"两批合并 {n2}股" if n2 else "—（预算不足一手）"
            print(f"      批{k} {note}: {price:.{dec}f} → {qty}")
        stop_dist = (r["stop"] / r["close"] - 1) * 100
        print(f"  止损参考: {r['stop']:.{dec}f}（{r['stop_note']}，距现价 {stop_dist:.1f}%）")
        if stop_dist <= -12:
            print(DIM + "  注意: 止损距离超过体系上限12%，建议等横盘箱体形成后再进" + RESET)

    print("\n" + DIM + "纪律提醒:" + RESET)
    print(DIM + "  - 大盘未站上ma60前（python dapan.py 查看），优先批1/批2左侧挂单，"
                "批3右侧确认需大盘同步企稳" + RESET)
    print(DIM + "  - 持股满1年股息免税；除息季（5~7月）核对到账；单只亏损不补仓，只在计划价位接" + RESET)
    print(DIM + "  - 仅供学习研究，不构成投资建议" + RESET)


def watch_file_map(config):
    """观察池 代码→笔记文件 映射（结论回写用；不在观察池的标的跳过回写）。"""
    mapping = {}
    if not WATCH_DIR.is_dir():
        return mapping
    for md in WATCH_DIR.glob("*.md"):
        if md.stem in config:
            symbol = guess_symbol(config[md.stem])
            if symbol:
                mapping[symbol] = md
    return mapping


def build_check_block(r):
    """生成一条体检结论记录（头行 + 缩进子项，与收盘记录同风格）。"""
    dec = price_dec(r["symbol"])
    month, day = int(r["date"][5:7]), int(r["date"][8:10])
    ind = " " * 5    # 与头行「体检 」宽度对齐（体检=4列 + 1空格）
    head = f"体检 {month}月{day}日：{r['state']}（现价 {r['close']:.{dec}f}）"
    plan_txt = " / ".join(f"{price:.{dec}f}{note}" for price, note in r["plan"])
    return [head,
            f"{ind}1. 理由：{r['brief']}",
            f"{ind}2. 三批：{plan_txt}",
            f"{ind}3. 止损：{r['stop']:.{dec}f}（{r['stop_note']}）"]


def write_conclusions(rows, watch_map):
    """把体检结论追加到 src/高股息/<名称>.md（幂等；盘中只展示不写入）。

    口径：结论日期取最后一根K线日期（周末/节假日运行标注最近交易日）；
    K线为当日但未到 15:00 视为盘中，避免用盘中数据写结论；只追加不改写。
    """
    for r in rows:
        md = watch_map.get(r["symbol"])
        if md is None:
            print(DIM + f"  - {r['name']}: 不在观察池，跳过回写" + RESET)
            continue
        try:
            text = md.read_text("utf-8")
        except OSError as e:
            print(DIM + f"  - {r['name']}: 读取失败（{e}），跳过回写" + RESET)
            continue
        month, day = int(r["date"][5:7]), int(r["date"][8:10])
        exists = False
        for ln in text.splitlines():
            hit = CHECK_RE.match(ln)
            if hit and hit.group(1) == str(month) and hit.group(2) == str(day):
                exists = True
                break
        if exists:
            print(DIM + f"  = {r['name']}: {month}月{day}日 体检结论已存在，跳过" + RESET)
            continue
        now = _beijing_now()
        if r["date"] == now.strftime("%Y-%m-%d") and (now.hour, now.minute) < (15, 0):
            print(DIM + f"  - {r['name']}: 未收盘，体检结论暂不写入" + RESET)
            continue
        try:
            block = "\n".join(build_check_block(r))
            md.write_text(text.rstrip("\n") + "\n" + block + "\n", encoding="utf-8")
        except OSError as e:
            print(DIM + f"  - {r['name']}: 写入失败（{e}）" + RESET)
            continue
        print(f"  + {r['name']}: 已追加 {month}月{day}日 体检结论（{r['state']}）")


def main():
    enable_ansi()
    ap = argparse.ArgumentParser(description="高股息观察池·建仓辅助（src/高股息/，前复权日K）")
    ap.add_argument("targets", nargs="*", help="只体检指定代码/名称（留空=观察池全部）")
    ap.add_argument("--capital", type=float, default=100000, help="计划投入总资金（元）")
    ap.add_argument("--per-stock", type=float, default=0, help="单只资金上限%%（0=均分）")
    ap.add_argument("--no-save", action="store_true",
                    help="只展示，不把体检结论回写到 src/高股息/*.md")
    args = ap.parse_args()

    config = load_config()
    if args.targets:
        items = [{"name": n, "symbol": s} for n, s in resolve_targets(args.targets, config)]
    else:
        items = load_watchlist(config)
    items = [it for it in items if it.get("symbol")]
    if not items:
        print("未找到可分析的标的（检查 src/高股息/ 文件或 stocks.json 映射）")
        return 1

    budget = (args.capital * args.per_stock / 100 if args.per_stock > 0
              else args.capital / len(items))
    p = build_params()
    rows = []
    for it in items:
        try:
            rows.append(analyze_one(it["name"], it["symbol"], p))
        except (OSError, ValueError) as e:
            print(DIM + f"  ? {it['name']}: {e}，跳过" + RESET)
    if not rows:
        return 1
    render_report(rows, budget)
    if not args.no_save:
        watch_map = watch_file_map(config)
        if watch_map:
            print("\n" + BOLD + "结论回写（src/高股息/，追加式、幂等）:" + RESET)
            write_conclusions(rows, watch_map)
        else:
            print(DIM + "  - 未找到 src/高股息/ 观察池文件，跳过结论回写" + RESET)
    return 0


if __name__ == "__main__":
    sys.exit(main())

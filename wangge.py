#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""网格交易回测（数据源：腾讯财经日K接口，仅用标准库，零第三方依赖）

与 zuanqian.py（横盘突破）、qushi.py（趋势回调）、jinxian.py（均线金叉）互补：
网格赚的是震荡市的波动钱——价格每跌破一条网格线买入一格、每涨破一条网格线卖出一格，
区间内反复高抛低吸。单边下跌会满仓套牢、单边上涨会提前清仓，是网格的固有短板，
因此更适合震荡标的（宽基ETF、区间稳定的股票）。

策略规则（全部可参数化）:
  1. 区间确定  默认取前 range_days 根收盘价的最低/最高为下沿/上沿（--low/--high 可手动指定）
  2. 网格划分  区间均分为 grids 格（默认10），共 grids+1 条网格线，格宽=(上沿-下沿)/grids
  3. 每格资金  初始资金/grids，按成交格线价折算股数（100股整数倍，不足一手该格跳过并计数）
  4. 建仓      回测起点（第 range_days 根）按收盘价所在格一次性买入目标格数（市价建仓口径）
  5. 撮合      以昨日收盘为参考价：今日最高 ≥ 上方网格线则从低到高逐线卖出一格；
              今日最低 ≤ 下方网格线则从高到低逐线买入一格；均按格线价成交（限价单口径，
              不考虑滑点与跳空优化，结果偏保守）；先卖后买，天然满足 T+1
  6. 边界      跌破下沿：满仓持有不动（网格的套牢短板）；涨破上沿：逐步清仓等待回落
  7. 成本      佣金双边（默认万3、最低5元）+ 印花税仅卖出（默认万5；ETF 免印花税建议 --stamp 0）

说明:
  - 日K无法还原日内路径，按「相对昨收单程穿越」撮合，每条网格线当日最多成交一次；
  - 前复权日线数据来自腾讯公开接口；回测结果不代表未来收益，仅供学习研究，不构成投资建议。

用法:
  python wangge.py 510300                          回测沪深300ETF（ETF建议 --stamp 0）
  python wangge.py 600030 510300                   多标的汇总对比
  python wangge.py 510300 --grids 12 --range-days 120   调参
  python wangge.py 510300 --low 3.5 --high 4.6 --full   手动区间并输出全部成交
  python wangge.py 510300 --csv 网格成交.csv            成交明细导出CSV（单标的）
"""
import argparse
import sys

from zuanqian import (BOLD, DIM, RED, RESET, enable_ansi, fetch_kline,
                      load_config, pad, resolve_targets, watchlist, write_csv)


# ---------------------------------------------------------------- 网格构建

def price_decimals(symbol):
    """ETF（代码15/51开头）价格3位小数，其余2位（与 stock.py 口径一致）。"""
    code = symbol[2:] if len(symbol) > 6 else symbol
    return 3 if code[:2] in ("15", "51") else 2


def build_lines(low, high, grids):
    """区间均分为 grids 格，返回 grids+1 条等距网格线（含下沿与上沿）。"""
    step = (high - low) / grids
    return [low + k * step for k in range(grids + 1)]


def target_units(price, lines):
    """价格所在格的目标持仓格数：最底格满仓、每升一格减1格、涨破上沿清仓。"""
    grids = len(lines) - 1
    if price >= lines[-1]:
        return 0
    if price <= lines[0]:
        return grids
    k = int((price - lines[0]) / (lines[1] - lines[0]))
    return grids - k


def resolve_range(bars, range_days, low, high):
    """网格区间：手动 low/high 优先（可只给一边），否则取前 range_days 根收盘的最低/最高。"""
    window = [b["close"] for b in bars[:range_days]]
    low = low if low is not None else min(window)
    high = high if high is not None else max(window)
    if not high > low:
        raise ValueError("区间上沿必须大于下沿")
    return low, high


# ---------------------------------------------------------------- 回测引擎

def run_grid_backtest(symbol, bars, p):
    """网格回测主循环。返回统计 dict（含成交明细 fills 与逐日权益 equity）。"""
    lines = build_lines(p.low, p.high, p.grids)
    per_grid = p.capital / p.grids
    dec = price_decimals(symbol)
    start = p.range_days
    cash = float(p.capital)
    units = 0
    sh_now = 0          # 当前持仓股数（权益按股数×现价计，格数仅表示持仓批次）
    lots = []            # FIFO 持仓批次: (买入价, 股数, 含费成本)
    fills = []
    equity = []
    realized = 0.0
    skipped = 0
    buy_n = sell_n = 0

    def buy(i, price, note):
        nonlocal cash, units, sh_now, skipped, buy_n
        sh = int(per_grid / price / 100) * 100
        amount = sh * price
        fee = max(5.0, amount * p.commission)
        if sh < 100 or amount + fee > cash:
            skipped += 1
            return
        cash -= amount + fee
        units += 1
        sh_now += sh
        buy_n += 1
        lots.append((price, sh, amount + fee))
        fills.append({"日期": bars[i]["date"], "方向": "买入",
                      "格线价": round(price, dec), "股数": sh,
                      "金额": round(amount, 2), "费用": round(fee, 2), "备注": note})

    def sell(i, price, note):
        nonlocal cash, units, sh_now, realized, sell_n
        _, sh, cost = lots.pop(0)
        amount = sh * price
        fee = max(5.0, amount * p.commission) + amount * p.stamp
        cash += amount - fee
        units -= 1
        sh_now -= sh
        sell_n += 1
        realized += amount - fee - cost
        fills.append({"日期": bars[i]["date"], "方向": "卖出",
                      "格线价": round(price, dec), "股数": sh,
                      "金额": round(amount, 2), "费用": round(fee, 2), "备注": note})

    # 建仓：起点收盘价所在格，一次性买入目标格数
    ref = bars[start]["close"]
    for _ in range(target_units(ref, lines)):
        buy(start, ref, "建仓")

    for i in range(start + 1, len(bars)):
        b = bars[i]
        r = bars[i - 1]["close"]
        for lv in lines:                  # 先卖：涨破上方格线（低→高），T+1 安全
            if r < lv <= b["high"] and units > 0:
                sell(i, lv, "涨破格线")
        for lv in reversed(lines):        # 后买：跌破下方格线（高→低）
            if b["low"] <= lv < r and units < p.grids:
                buy(i, lv, "跌破格线")
        equity.append(cash + sh_now * b["close"])

    held_cost = sum(c for _, _, c in lots)
    last = bars[-1]["close"]
    total = cash + sh_now * last
    peak, mdd = p.capital, 0.0
    for v in equity:
        peak = max(peak, v)
        mdd = min(mdd, v / peak - 1)
    return {
        "lines": lines, "step": (p.high - p.low) / p.grids, "per_grid": per_grid,
        "start_date": bars[start]["date"], "end_date": bars[-1]["date"],
        "nbars": len(bars) - start, "init_units": target_units(ref, lines),
        "fills": fills, "equity": equity, "buy_n": buy_n, "sell_n": sell_n,
        "skipped": skipped,
        "cash": cash, "units": len(lots), "shares": sh_now,
        "realized": realized, "unrealized": sh_now * last - held_cost,
        "total": total, "ret": (total / p.capital - 1) * 100,
        "bh": (last / bars[start]["close"] - 1) * 100, "mdd": mdd * 100,
    }


# ---------------------------------------------------------------- 输出

def print_report(name, symbol, st, p, full=False):
    """单标的完整报告：区间参数、权益统计与最近成交明细。"""
    dec = price_decimals(symbol)
    lo, hi = st["lines"][0], st["lines"][-1]
    print(BOLD + f"\n网格交易回测 {name} {symbol}" + RESET + DIM
          + f"  {st['start_date']} ~ {st['end_date']}（{st['nbars']}根K线）" + RESET)
    print(f"区间 {lo:.{dec}f} ~ {hi:.{dec}f}   格数 {p.grids}   格宽 {st['step']:.{dec}f}   "
          f"每格资金 {st['per_grid']:,.0f}   建仓目标 {st['init_units']} 格")
    print("─" * 50)
    ret_s = f"{st['ret']:+.2f}%"
    ret_c = RED + ret_s + RESET if st["ret"] >= 0 else ret_s
    print(f"期末权益    {st['total']:,.0f}（总收益 {ret_c}）   基准买入持有: {st['bh']:+.2f}%")
    print(f"已实现网格利润 {st['realized']:+,.0f}   浮动盈亏 {st['unrealized']:+,.0f}")
    print(f"持仓 {st['units']} 格（{st['shares']:,}股）   现金 {st['cash']:,.0f}   "
          f"成交 {st['buy_n']}买/{st['sell_n']}卖   跳过 {st['skipped']} 格")
    print(f"最大回撤    {st['mdd']:.2f}%")
    rows = st["fills"] if full else st["fills"][-8:]
    if rows:
        print(DIM + pad("日期", 11) + pad("方向", 5) + pad("格线价", 8, "right")
              + pad("股数", 8, "right") + pad("费用", 7, "right") + "  备注" + RESET)
        for f in rows:
            print(pad(f["日期"], 11) + pad(f["方向"], 5)
                  + pad(f"{f['格线价']:.{dec}f}", 8, "right")
                  + pad(f"{f['股数']:,}", 8, "right")
                  + pad(f"{f['费用']:,.0f}", 7, "right") + "  " + f["备注"])
        if not full and len(st["fills"]) > 8:
            print(DIM + f"（仅显示最近8笔，共{len(st['fills'])}笔；--full 查看全部，--csv 导出）" + RESET)


def print_summary(results, p):
    """多标的汇总表。"""
    print(BOLD + f"\n网格回测汇总（{p.grids}格 每格资金 {p.capital / p.grids:,.0f}）" + RESET)
    header = ("名称", "代码", "买/卖格", "已实现", "总收益%", "回撤%", "基准%")
    widths = [10, 9, 8, 10, 8, 7, 8]
    print(DIM + " ".join(pad(h, w) for h, w in zip(header, widths)) + RESET)
    for name, sym, st in results:
        row = (name, sym, f"{st['buy_n']}/{st['sell_n']}",
               f"{st['realized']:+,.0f}", f"{st['ret']:+.2f}",
               f"{st['mdd']:.2f}", f"{st['bh']:+.2f}")
        print(" ".join(pad(v, w) for v, w in zip(row, widths)))


# ---------------------------------------------------------------- 入口

def build_parser():
    ap = argparse.ArgumentParser(description="网格交易回测（腾讯日K数据，震荡市高抛低吸）")
    ap.add_argument("targets", nargs="*", help="股票/ETF代码或名称，留空则回测 src/ 全部自选股")
    ap.add_argument("--days", type=int, default=600, help="取多少根日K（默认600）")
    ap.add_argument("--capital", type=float, default=100_000, help="网格总资金（默认10万）")
    ap.add_argument("--grids", type=int, default=10, help="网格格数（默认10）")
    ap.add_argument("--range-days", type=int, default=60, help="自动区间取前多少根收盘价（默认60）")
    ap.add_argument("--low", type=float, help="手动区间下沿（默认自动）")
    ap.add_argument("--high", type=float, help="手动区间上沿（默认自动）")
    ap.add_argument("--commission", type=float, default=0.0003, help="佣金率（双边，默认万3）")
    ap.add_argument("--stamp", type=float, default=0.0005,
                    help="印花税率（仅卖出，默认万5；ETF免印花税建议0）")
    ap.add_argument("--full", action="store_true", help="输出全部成交明细")
    ap.add_argument("--csv", metavar="FILE", help="成交明细导出CSV（单标的）")
    return ap


def main():
    enable_ansi()
    p = build_parser().parse_args()
    if p.grids < 2:
        print("格数至少为2")
        return 1
    config = load_config()
    targets = resolve_targets(p.targets, config) if p.targets else watchlist(config)
    valid = [(n, s) for n, s in targets if s]
    for n, s in targets:
        if not s:
            print(DIM + f"未找到: {n}（可在 stocks.json 中补充代码映射）" + RESET)
    if not valid:
        print("没有可处理的标的")
        return 1
    if p.csv and len(valid) > 1:
        print(DIM + "多标的模式不导出CSV（--csv 仅支持单标的）" + RESET)

    manual_low, manual_high = p.low, p.high  # 手动区间只看用户输入，不串标的
    results = []
    for name, sym in valid:
        try:
            bars = fetch_kline(sym, p.days)
        except OSError as e:
            print(DIM + f"{name} {sym} 获取失败: {e}" + RESET)
            continue
        if len(bars) < p.range_days + 30:
            print(DIM + f"{name} {sym} 数据不足（{len(bars)}根），跳过" + RESET)
            continue
        try:
            p.low, p.high = resolve_range(bars, p.range_days, manual_low, manual_high)
        except ValueError as e:
            print(DIM + f"{name} {sym} {e}，跳过" + RESET)
            continue
        st = run_grid_backtest(sym, bars, p)
        results.append((name, sym, st))
        if len(valid) == 1:
            print_report(name, sym, st, p)
            if p.csv:
                write_csv(p.csv, st["fills"])
        elif p.full:
            print_report(name, sym, st, p)

    if len(results) > 1:
        print_summary(results, p)
    elif not results:
        print("没有可回测的数据")
        return 1
    print(DIM + "\n提示: 网格适合震荡标的，单边行情表现差属正常；"
                "回测不代表未来收益，仅供学习研究，不构成投资建议。" + RESET)
    return 0


if __name__ == "__main__":
    sys.exit(main())

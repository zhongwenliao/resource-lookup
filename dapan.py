#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""大盘复盘工具（五大指数每日状态 + 追加式记录，仅标准库，零第三方依赖）

用法:
  python dapan.py                  显示五大指数最新状态表，并把缺失交易日的
                                   收盘记录补齐/追加到 src/大盘/*.md（幂等）
  python dapan.py --init-days 60   全新文件首次补齐的历史交易日数（默认 60）

说明:
  - 覆盖指数：上证指数、深证成指、创业板指、沪深300、科创50（INDICES 可增删）
  - 数据源：腾讯日K接口（zuanqian.fetch_kline，多域名自动切换，带超时）
  - 记录追加式写入 src/大盘/<指数名>.md，格式与 src/*.md 自选股笔记同构
    （同一正则可解析）；src/大盘/ 为子目录，不参与 stock.py 的 src/*.md 遍历
  - 15:00 前运行只补齐历史交易日、不写当日（当日未收盘）；15:00 后含当日；
    已有记录自动跳过，休市/停牌（无K线）自然跳过，可重复执行
  - 仅供学习研究，不构成投资建议

口径（与 stock.py / zuanqian.py 一致）:
  - 指数无复权概念，收盘点位直接取日K收盘价
  - 均线为简单移动平均 ma5/ma13/ma60；MACD柱 = 2×(DIF−DEA)
  - 红涨绿跌（A股习惯）：收盘 ≥ 昨收记「红线」
  - 量能：日K成交量（腾讯口径）较昨日比值，≥1.104 放大、≤0.908 缩小
  - 指数点位固定 2 位小数
"""
import argparse
import sys
from datetime import datetime
from pathlib import Path

from stock import (BEIJING_TZ, ENTRY_RE, VOL_DOWN, VOL_UP, _compute_series,
                   _fmt_bar, _macd_desc, _vol_desc)
from zuanqian import (BOLD, DIM, RESET, enable_ansi, fetch_kline, pad, paint)

ROOT = Path(__file__).resolve().parent
DAPAN_DIR = ROOT / "src" / "大盘"

# 覆盖的指数（带交易所前缀的代码, 名称）；文件名 = 名称
INDICES = (
    ("sh000001", "上证指数"),
    ("sz399001", "深证成指"),
    ("sz399006", "创业板指"),
    ("sh000300", "沪深300"),
    ("sh000688", "科创50"),
)
KLINE_COUNT = 320   # 日K根数（覆盖 ma60 与补齐窗口）
INIT_DAYS = 60      # 全新文件首次补齐的历史交易日数
DEC = 2             # 指数点位小数位


def _completed(bars, today_iso, after_close):
    """已完成交易的K线：早于今天的全部；今天的仅收盘后（15:00）计入。"""
    return [b for b in bars
            if b[0] < today_iso or (b[0] == today_iso and after_close)]


def _find_index(bars, month, day):
    """同月日的最新一根K线下标（跨年时取不早于记录的最新匹配）。"""
    hit = None
    for i, b in enumerate(bars):
        if int(b[0][5:7]) == month and int(b[0][8:10]) == day:
            hit = i
    return hit


def _score_at(bars, series, last, j):
    """第 j 根K线与文件末条记录的吻合度（0-4），校验记录口径。"""
    if last is None or j is None or j < 0 or j >= len(bars):
        return -1
    score = 0
    for rec, calc in ((last.group(5), bars[j][1]),
                      (last.group(6), series[0][j]),
                      (last.group(7), series[1][j]),
                      (last.group(8), series[2][j])):
        dec = len(rec.partition(".")[2])
        score += int(f"{calc:.{dec}f}" == rec)
    return score


def _vol_short(vol, prev_vol):
    """量能短描述（表格用）。"""
    if prev_vol <= 0:
        return "持平"
    if vol / prev_vol >= VOL_UP:
        return "放大"
    if vol / prev_vol <= VOL_DOWN:
        return "缩小"
    return "持平"


def collect_rows():
    """五大指数最新状态（基于最近一个已完成交易日），供表格与 GUI 使用。

    返回 (rows, asof)：rows 每项为指数状态字典（获取失败时带「状态」字段），
    asof 为全部指数中最新的已完成交易日（ISO 日期）。
    """
    now = datetime.now(BEIJING_TZ)
    today_iso = now.strftime("%Y-%m-%d")
    after_close = (now.hour, now.minute) >= (15, 0)
    rows, asof = [], ""
    for symbol, name in INDICES:
        try:
            raw = fetch_kline(symbol, KLINE_COUNT)
        except OSError as e:
            rows.append({"名称": name, "代码": symbol,
                         "状态": f"日K获取失败（{e}）"})
            continue
        done = _completed([(b["date"], b["close"], b["vol"]) for b in raw],
                          today_iso, after_close)
        if len(done) < 60:
            rows.append({"名称": name, "代码": symbol, "状态": "已完成日K不足 60 根"})
            continue
        asof = max(asof, done[-1][0])
        series = _compute_series(done)
        i = len(done) - 1
        close, prev_close = done[i][1], done[i - 1][1]
        ma5, ma13, ma60, dif, bar = series
        rows.append({
            "名称": name, "代码": symbol, "日期": done[i][0],
            "收盘": close,
            "涨跌%": round((close / prev_close - 1) * 100, 2),
            "ma5": ma5[i], "ma13": ma13[i], "ma60": ma60[i],
            "macd柱": bar[i],
            "量能": _vol_short(done[i][2], done[i - 1][2]),
        })
    return rows, asof


def render_table(rows, asof):
    """打印指数状态表（红涨绿跌）。"""
    print(BOLD + "大盘指数（复盘先看大盘）" + RESET)
    if asof:
        print(DIM + f"数据截至 {asof}（今日未收盘时为上一交易日）" + RESET)
    header = ("指数", "收盘", "涨跌", "ma5", "ma13", "ma60", "macd柱", "量能")
    widths = [10, 10, 9, 10, 10, 10, 10, 8]
    print(" ".join(pad(h, w) for h, w in zip(header, widths)))
    for r in rows:
        if r.get("状态"):
            print(DIM + pad(r["名称"], widths[0]) + "  " + r["状态"] + RESET)
            continue
        cells = [
            pad(r["名称"], widths[0]),
            pad(f"{r['收盘']:.{DEC}f}", widths[1], "right"),
            pad(f"{r['涨跌%']:+.{DEC}f}%", widths[2], "right"),
            pad(f"{r['ma5']:.{DEC}f}", widths[3], "right"),
            pad(f"{r['ma13']:.{DEC}f}", widths[4], "right"),
            pad(f"{r['ma60']:.{DEC}f}", widths[5], "right"),
            pad(_fmt_bar(r["macd柱"], DEC), widths[6], "right"),
            pad(r["量能"], widths[7]),
        ]
        cells[2] = paint(r["涨跌%"], cells[2])
        cells[6] = paint(r["macd柱"], cells[6])
        print(" ".join(cells))
    print()


def sync_file(path, name, symbol, today_iso, after_close, init_days):
    """补齐/追加单个指数的收盘记录，返回追加条数；跳过时返回 None。"""
    try:
        raw = fetch_kline(symbol, KLINE_COUNT)
    except OSError as e:
        print(DIM + f"  - {name}: 日K获取失败（{e}），跳过" + RESET)
        return None
    done = _completed([(b["date"], b["close"], b["vol"]) for b in raw],
                      today_iso, after_close)
    if len(done) < 60:
        print(DIM + f"  - {name}: 已完成日K不足 60 根，跳过" + RESET)
        return None
    text = ""
    if path.exists():
        try:
            text = path.read_text("utf-8")
        except OSError as e:
            print(DIM + f"  - {name}: 文件读取失败（{e}），跳过" + RESET)
            return None
    last = None
    for ln in text.splitlines():
        m = ENTRY_RE.match(ln)
        if m:
            last = m
    body = [ln for ln in text.splitlines()[1:] if ln.strip()]
    series = _compute_series(done)
    if last is None:
        if body:  # 有内容但无标准记录：禁止盲写
            print(DIM + f"  - {name}: 未识别到标准记录格式，跳过" + RESET)
            return None
        todo = list(range(max(1, len(done) - init_days), len(done)))
    else:
        j = _find_index(done, int(last.group(2)), int(last.group(3)))
        if j is None:
            print(DIM + f"  - {name}: 日K中找不到末条记录日期 "
                        f"{last.group(2)}月{last.group(3)}日，跳过" + RESET)
            return None
        if _score_at(done, series, last, j) < 3:
            print(DIM + f"  - {name}: 末条记录与日K计算不符（口径存疑），跳过" + RESET)
            return None
        todo = list(range(j + 1, len(done)))
    if not todo:
        print(DIM + f"  = {name}: 记录已是最新，跳过" + RESET)
        return None
    num = int(last.group(1)) if last else 0
    ma5, ma13, ma60, dif, bar = series
    entries = []
    for i in todo:
        num += 1
        date_iso = done[i][0]
        close, vol = done[i][1], done[i][2]
        prev_close, prev_vol = done[i - 1][1], done[i - 1][2]
        ind = " " * (len(str(num)) + 2)
        entries.append(
            f"{num}. {int(date_iso[5:7])}月{int(date_iso[8:10])}日："
            f"收{'红' if close >= prev_close else '绿'}线（{close:.{DEC}f}）,"
            f"ma5({ma5[i]:.{DEC}f}),ma13({ma13[i]:.{DEC}f}),ma60({ma60[i]:.{DEC}f})")
        entries.append(f"{ind}1. {_macd_desc(bar[i], bar[i - 1], dif[i], DEC)}")
        entries.append(f"{ind}2. {_vol_desc(vol, prev_vol)}")
    if not text:
        text = f"# {name} 大盘复盘\n"
    try:
        path.write_text(text.rstrip("\n") + "\n" + "\n".join(entries) + "\n",
                        encoding="utf-8")
    except OSError as e:
        print(DIM + f"  - {name}: 文件写入失败（{e}），跳过" + RESET)
        return None
    first, last_i = done[todo[0]][0], done[todo[-1]][0]
    span = f"{int(first[5:7])}月{int(first[8:10])}日"
    if first != last_i:
        span += f"~{int(last_i[5:7])}月{int(last_i[8:10])}日"
    print(f"  + {name}: 已补齐 {span}（{len(todo)} 条）")
    return len(todo)


def sync_all(init_days=INIT_DAYS):
    """把各指数缺失交易日的收盘记录补齐/追加到 src/大盘/*.md（幂等，可重复执行）。"""
    now = datetime.now(BEIJING_TZ)
    today_iso = now.strftime("%Y-%m-%d")
    after_close = (now.hour, now.minute) >= (15, 0)
    if not after_close:
        print(DIM + "  - 未到 15:00：仅补齐历史交易日，当日收盘后再次运行补当日" + RESET)
    try:
        DAPAN_DIR.mkdir(parents=True, exist_ok=True)
    except OSError as e:
        print(DIM + f"  - 创建 {DAPAN_DIR} 失败（{e}），跳过同步" + RESET)
        return
    for symbol, name in INDICES:
        sync_file(DAPAN_DIR / f"{name}.md", name, symbol,
                  today_iso, after_close, init_days)


def main():
    enable_ansi()
    ap = argparse.ArgumentParser(description="大盘复盘（五大指数状态 + 追加式记录）")
    ap.add_argument("--init-days", type=int, default=INIT_DAYS,
                    help="全新文件首次补齐的历史交易日数（默认 %(default)s）")
    args = ap.parse_args()
    rows, asof = collect_rows()
    render_table(rows, asof)
    sync_all(args.init_days)
    return 0


if __name__ == "__main__":
    sys.exit(main())

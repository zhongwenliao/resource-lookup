#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""A股实时行情查询工具（数据源：腾讯财经公开接口，仅用标准库，零第三方依赖）

用法:
  python stock.py                   查询 src/ 全部自选股现价与持仓盈亏
  python stock.py -w 5              自选股行情每 5 秒自动刷新
  python stock.py 600030 300750     按代码查询（自动识别沪/深/北交易所）
  python stock.py 中信证券 万华化学  按名称查询（stocks.json 优先，腾讯搜索兜底）

说明:
  - 自选股名单取自 src/*.md 文件名，成本取自标题「目前成本（xx.xx）」
  - 股票名称与代码的映射保存在 stocks.json，可自行增删；未收录的名称会自动
    通过腾讯搜索接口匹配，并把结果写回 stocks.json
  - 接口返回的是最近一次行情快照；收盘后/休市期间显示最后成交数据
  - 查询自选股时（不带代码参数），15:00 后会自动把当日收盘记录（收盘价/
    均线/MACD/量能描述）追加到 src/*.md 对应文件；已有当日记录则跳过，
    可重复执行
"""
import argparse
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC_DIR = ROOT / "src"
CONFIG_FILE = ROOT / "stocks.json"

QUOTE_API = "https://qt.gtimg.cn/q={}"
SEARCH_API = "https://smartbox.gtimg.cn/s3/?v=2&q={}&t=all"
# 日K数据源（不复权收盘价）；主接口偶发 501 时自动切换备用域名
KLINE_APIS = (
    ("https://web.ifzq.gtimg.cn/appstock/app/kline/kline?param={},day,,,320,", False),
    ("https://ifzq.gtimg.cn/appstock/app/fqkline/get?param={},day,,,320,", True),
    ("https://proxy.finance.qq.com/ifzqgtimg/appstock/app/fqkline/get?param={},day,,,320,", True),
)

# 红涨绿跌（A股习惯）
RED, GREEN, DIM, BOLD, RESET = "\033[31m", "\033[32m", "\033[2m", "\033[1m", "\033[0m"

COST_RE = re.compile(r"成本\s*[（(]\s*([\d.]+)")

# 当日收盘记录追加：与 src/*.md 既有记录同口径（不复权，MACD柱=2×(DIF-DEA)）
ENTRY_RE = re.compile(
    r"^(\d+)\.\s*(\d+)月(\d+)日：收(红|绿)线（([\d.]+)）,"
    r"ma5\(([\d.]+)\),ma13\(([\d.]+)\),ma60\(([\d.]+)\)\s*$")
BEIJING_TZ = timezone(timedelta(hours=8))
VOL_UP, VOL_DOWN = 1.104, 0.908  # 量能放大/缩小判定阈值（较昨日成交量比值）


def enable_ansi():
    os.system("")  # 让 Windows 终端启用 ANSI 转义序列
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except AttributeError:
            pass


def http_get(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return resp.read().decode("gbk", errors="replace")


def guess_symbol(token: str):
    """根据代码推断带交易所前缀的代码，如 600030 -> sh600030。"""
    t = token.strip().lower()
    if re.fullmatch(r"(sh|sz|bj)\d{6}", t):
        return t
    if re.fullmatch(r"\d{6}", t):
        head = t[0]
        if head in "569":      # 沪市：股票/ETF/B股
            return "sh" + t
        if head in "0123":     # 深市：主板/创业板/ETF/可转债
            return "sz" + t
        if head in "48":       # 北交所/三板
            return "bj" + t
    return None


def parse_quote(field: str):
    f = field.split("~")
    if len(f) < 49 or not f[2]:
        return None

    def num(i, default=0.0):
        try:
            return float(f[i])
        except (ValueError, IndexError):
            return default

    return {
        "symbol": f[2],
        "name": f[1],
        "price": num(3),
        "prev_close": num(4),
        "open": num(5),
        "volume": num(6),        # 手
        "amount": num(37),       # 万元
        "time": f[30],           # yyyymmddHHMMSS
        "change": num(31),
        "pct": num(32),
        "high": num(33),
        "low": num(34),
        "turnover": num(38),     # 换手率 %
        "pe": f[39],
        "amplitude": num(43),    # 振幅 %
        "float_mv": num(44),     # 流通市值（亿）
        "total_mv": num(45),     # 总市值（亿）
        "pb": f[46],
        "limit_up": f[47],
        "limit_down": f[48],
    }


def fetch_quotes(symbols):
    if not symbols:
        return {}
    quotes = {}
    last_err = None
    for _ in range(2):  # 仅网络异常时重试；代码无效会收到正常空响应
        try:
            raw = http_get(QUOTE_API.format(",".join(symbols)))
        except OSError as e:
            last_err = e
            time.sleep(1)
            continue
        for m in re.finditer(r'v_(\w+)="([^"]*)"', raw):
            q = parse_quote(m.group(2))
            if q and q["price"] > 0:
                q["symbol"] = m.group(1)  # 带交易所前缀，如 sh600309
                quotes[m.group(1)] = q
        break
    if not quotes and last_err:
        raise OSError(f"网络异常，行情获取失败（{last_err}）")
    return quotes


def load_config():
    if CONFIG_FILE.exists():
        try:
            return json.loads(CONFIG_FILE.read_text("utf-8"))
        except (json.JSONDecodeError, OSError):
            pass
    return {}


def save_config(config):
    CONFIG_FILE.write_text(
        json.dumps(config, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def search_symbol(name):
    """腾讯搜索接口兜底：名称 -> (带前缀代码, 规范名称)。

    返回格式形如 sz~300750~\\u5b81\\u5fb7...~ndsd~GP-A，仅取 A 股市场。
    """
    try:
        raw = http_get(SEARCH_API.format(urllib.parse.quote(name)))
    except OSError:
        return None
    m = re.search(r'v_hint="([^"]*)"', raw)
    if not m:
        return None
    fallback = None
    for entry in m.group(1).split("^"):
        parts = entry.split("~")
        if len(parts) < 3 or parts[0] not in ("sh", "sz", "bj"):
            continue
        symbol = parts[0] + parts[1]
        try:
            cname = bytes(parts[2], "ascii").decode("unicode_escape")
        except (UnicodeDecodeError, ValueError):
            cname = parts[2]
        if cname == name:
            return symbol, cname
        fallback = fallback or (symbol, cname)
    return fallback


def resolve_symbol(token, config):
    """输入代码或名称，返回带前缀代码；搜索命中时写回 stocks.json。"""
    sym = guess_symbol(token)
    if sym:
        return sym
    if token in config:
        return guess_symbol(config[token])
    for known, code in config.items():
        if token in known or known in token:
            return guess_symbol(code)
    hit = search_symbol(token)
    if hit:
        symbol, canonical = hit
        config[canonical] = symbol[2:]
        save_config(config)
        return symbol
    return None


def load_holdings(config):
    """从 src/*.md 读取自选股：文件名为股票名，标题里带成本。"""
    holdings = []
    if not SRC_DIR.is_dir():
        return holdings
    for md in sorted(SRC_DIR.glob("*.md")):
        name = md.stem
        cost = None
        try:
            m = COST_RE.search(md.read_text("utf-8", errors="replace")[:500])
            if m:
                cost = float(m.group(1))
        except OSError:
            pass
        symbol = None
        if name in config:
            symbol = guess_symbol(config[name])
        else:
            hit = search_symbol(name)
            if hit:
                symbol, canonical = hit
                config[canonical] = symbol[2:]
                save_config(config)
        holdings.append({"name": name, "symbol": symbol, "cost": cost})
    return holdings


# ---------------- 当日收盘数据同步（追加到 src/*.md） ----------------

def _beijing_now():
    return datetime.now(BEIJING_TZ)


def fetch_daily_kline(symbol, fq=""):
    """日K：fq='' 不复权 / 'qfq' 前复权；按日期升序返回 [(date, close, vol手), ...]。"""
    last_err = None
    for api, supports_fq in KLINE_APIS:
        if fq and not supports_fq:
            continue
        try:
            req = urllib.request.Request(api.format(symbol) + fq,
                                         headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8", errors="replace"))
            node = data["data"][symbol]
            bars = (node.get("qfqday" if fq == "qfq" else "day")
                    or node.get("day") or node.get("qfqday"))
            return [(b[0], float(b[2]), float(b[5])) for b in bars or []]
        except (OSError, ValueError, KeyError) as e:
            last_err = e
    raise OSError(f"日K获取失败（{last_err}）")


def _ema(vals, n):
    k = 2.0 / (n + 1)
    out, prev = [], None
    for v in vals:
        prev = v if prev is None else v * k + prev * (1 - k)
        out.append(prev)
    return out


def _sma_at(closes, n, i):
    return None if i + 1 < n else sum(closes[i - n + 1:i + 1]) / n


def _compute_series(bars):
    """计算 ma5/ma13/ma60、DIF、MACD柱（2×(DIF-DEA)）序列。"""
    closes = [b[1] for b in bars]
    dif = [a - b for a, b in zip(_ema(closes, 12), _ema(closes, 26))]
    bar = [2 * (d - e) for d, e in zip(dif, _ema(dif, 9))]
    n = len(closes)
    return ([_sma_at(closes, 5, i) for i in range(n)],
            [_sma_at(closes, 13, i) for i in range(n)],
            [_sma_at(closes, 60, i) for i in range(n)],
            dif, bar)


def _indicator_score(bars, series, last):
    """用倒数第二根K线（上一交易日）对比文件最后一条记录，评估复权口径吻合度。"""
    if last is None or len(bars) < 2:
        return -1
    i = len(bars) - 2
    score = 0
    for rec, calc in ((last.group(5), bars[i][1]),
                      (last.group(6), series[0][i]),
                      (last.group(7), series[1][i]),
                      (last.group(8), series[2][i])):
        dec = len(rec.partition(".")[2])
        score += int(f"{calc:.{dec}f}" == rec)
    return score


def _fmt_bar(v, dec):
    s = f"{v:.{dec}f}"
    if s.lstrip("-") == "0." + "0" * dec:  # 近零值加精到 3 位，避免显示 0.00
        s = f"{v:.3f}"
        if s == "-0.000":
            s = "0.000"
    return s


def _macd_desc(bar, prev_bar, dif, dec):
    pos = "上方" if dif > 0 else "下方"
    if prev_bar < 0 <= bar:
        clause = f"，处于0轴{pos}" if pos == "下方" else ""
        return f"macd**金叉**，红柱首次出现{clause}（{_fmt_bar(bar, dec)}）"
    if prev_bar > 0 >= bar:
        clause = f"，处于0轴{pos}" if pos == "上方" else ""
        return f"macd**死叉**，绿柱首次出现{clause}（{_fmt_bar(bar, dec)}）"
    color = "红" if bar > 0 else "绿"
    trend = "增大" if abs(bar) > abs(prev_bar) else "缩小"
    return f"macd在0轴{pos}，{color}柱{trend}（{_fmt_bar(bar, dec)}）"


def _vol_desc(vol, prev_vol):
    if prev_vol <= 0:
        return "量能与昨日基本持平"
    if vol / prev_vol >= VOL_UP:
        return "成交量放大"
    if vol / prev_vol <= VOL_DOWN:
        return "成交量缩小"
    return "量能与昨日基本持平"


def sync_daily_entries(config):
    """15:00 后运行时，把当日收盘记录追加到 src/*.md（已有当日记录则跳过）。

    口径默认不复权（以文件最后一条记录自动校验，不符时改用前复权），
    MACD柱=2×(DIF-DEA)、量能按较昨日成交量比值描述；价格小数位沿用
    文件中最近一条记录（股票 2 位、ETF 3 位）。
    """
    now = _beijing_now()
    if (now.hour, now.minute) < (15, 0):
        print(DIM + "  - 未到 15:00，跳过当日收盘数据同步" + RESET)
        return
    today_cn = f"{now.month}月{now.day}日"
    today_iso = now.strftime("%Y-%m-%d")
    for md in sorted(SRC_DIR.glob("*.md")):
        name = md.stem
        symbol = guess_symbol(config[name]) if name in config else None
        if not symbol:
            print(DIM + f"  - {name}: 未匹配到代码，跳过同步" + RESET)
            continue
        try:
            text = md.read_text("utf-8")
            last = None
            for ln in text.splitlines():
                m = ENTRY_RE.match(ln)
                if m:
                    last = m
            if last is None:
                body = [ln for ln in text.splitlines()[1:] if ln.strip()]
                if body:
                    print(DIM + f"  - {name}: 未识别到标准记录格式，跳过" + RESET)
                    continue
            if last and last.group(2) == str(now.month) and last.group(3) == str(now.day):
                print(DIM + f"  = {name}: {today_cn} 记录已存在，跳过" + RESET)
                continue
            bars = fetch_daily_kline(symbol)
            if len(bars) < 60 or bars[-1][0] != today_iso:
                print(DIM + f"  - {name}: 今日K线未生成（休市或数据未更新），跳过" + RESET)
                continue
            series = _compute_series(bars)
            # 用文件最后一条记录校验复权口径，不符时尝试前复权
            if last is not None and _indicator_score(bars, series, last) < 3:
                try:
                    qbars = fetch_daily_kline(symbol, "qfq")
                    qseries = _compute_series(qbars)
                    if _indicator_score(qbars, qseries, last) > _indicator_score(bars, series, last):
                        bars, series = qbars, qseries
                except OSError:
                    pass
            prev_close, prev_vol = bars[-2][1], bars[-2][2]
            close, vol = bars[-1][1], bars[-1][2]
            ma5, ma13, ma60, dif, bar = series
            i = len(bars) - 1
            close_str = last.group(5) if last else ""
            dec = len(close_str.partition(".")[2])
            if not dec:
                dec = 3 if symbol[2:].startswith(("15", "51")) else 2
            num = int(last.group(1)) + 1 if last else 1
            head = (f"{num}. {today_cn}：收{'红' if close >= prev_close else '绿'}线"
                    f"（{close:.{dec}f}）,ma5({ma5[i]:.{dec}f}),"
                    f"ma13({ma13[i]:.{dec}f}),"
                    f"ma60({ma60[i]:.{dec}f})")
            ind = " " * (len(str(num)) + 2)
            entry = [
                head,
                f"{ind}1. {_macd_desc(bar[i], bar[i - 1], dif[i], dec)}",
                f"{ind}2. {_vol_desc(vol, prev_vol)}",
            ]
            md.write_text(text.rstrip("\n") + "\n" + "\n".join(entry) + "\n",
                          encoding="utf-8")
            print(f"  + {name}: 已追加 {today_cn} 收盘记录（第 {num} 条）")
        except Exception as e:
            print(DIM + f"  - {name}: 同步失败（{e}），跳过" + RESET)


def disp_width(s):
    return sum(2 if ord(ch) > 127 else 1 for ch in s)


def pad(s, width, align="left"):
    gap = width - disp_width(s)
    if gap <= 0:
        return s
    return s + " " * gap if align == "left" else " " * gap + s


def signed(v):
    return f"{v:+.2f}%"


def paint(v, text):
    if v > 0:
        return f"{RED}{text}{RESET}"
    if v < 0:
        return f"{GREEN}{text}{RESET}"
    return text


def fmt_volume(shou):
    if shou >= 1e8:
        return f"{shou / 1e8:.2f}亿手"
    if shou >= 1e4:
        return f"{shou / 1e4:.2f}万手"
    return f"{shou:.0f}手"


def fmt_amount(wan):
    if abs(wan) >= 1e4:
        return f"{wan / 1e4:.2f}亿"
    return f"{wan:.0f}万"


def fmt_time(ts):
    if len(ts) == 14:
        return f"{ts[4:6]}-{ts[6:8]} {ts[8:10]}:{ts[10:12]}:{ts[12:14]}"
    return ts or "-"


def render_holdings(config):
    holdings = load_holdings(config)
    if not holdings:
        print(f"未在 {SRC_DIR} 找到自选股（*.md）")
        return
    quotes = fetch_quotes([h["symbol"] for h in holdings if h["symbol"]])

    header = ("名称", "代码", "现价", "成本", "盈亏", "涨跌", "换手", "成交额", "行情时间")
    widths = [10, 9, 8, 8, 9, 9, 7, 9, 15]
    print(BOLD + " ".join(pad(h, w) for h, w in zip(header, widths)) + RESET)

    unresolved = []
    no_quote = []
    for h in holdings:
        if not h["symbol"]:
            unresolved.append(h["name"])
            continue
        q = quotes.get(h["symbol"])
        if q is None:
            no_quote.append(h["name"])
            continue
        pnl = (q["price"] / h["cost"] - 1) * 100 if h["cost"] else None
        row = [
            pad(q["name"], widths[0]),
            pad(q["symbol"], widths[1]),
            pad(f"{q['price']:.2f}", widths[2], "right"),
            pad(f"{h['cost']:.2f}" if h["cost"] else "-", widths[3], "right"),
            pad(signed(pnl) if pnl is not None else "-", widths[4], "right"),
            pad(signed(q["pct"]), widths[5], "right"),
            pad(f"{q['turnover']:.2f}%", widths[6], "right"),
            pad(fmt_amount(q["amount"]), widths[7], "right"),
            pad(fmt_time(q["time"]), widths[8]),
        ]
        if pnl is not None:
            row[4] = paint(pnl, row[4])
        row[5] = paint(q["pct"], row[5])
        print(" ".join(row))

    for name in no_quote:
        print(DIM + f"  ? {name}: 暂无行情数据" + RESET)
    for name in unresolved:
        print(DIM + f"  ? {name}: 未匹配到代码，可在 stocks.json 中手动补充" + RESET)


def render_detail(symbols):
    quotes = fetch_quotes(symbols)
    if not quotes:
        print("未获取到行情数据（代码可能无效或接口不可用）")
        return
    for s in symbols:
        if s not in quotes:
            print(DIM + f"  ? {s}: 未获取到行情（代码可能无效或已退市）" + RESET)
    for q in quotes.values():
        head = (f"{q['name']} {q['symbol']}  {q['price']:.2f}  "
                f"{signed(q['change']).replace('%', '')} ({signed(q['pct'])})")
        print(BOLD + paint(q["pct"], head) + RESET)
        rows = [
            ("今开", f"{q['open']:.2f}", "昨收", f"{q['prev_close']:.2f}"),
            ("最高", f"{q['high']:.2f}", "最低", f"{q['low']:.2f}"),
            ("成交量", fmt_volume(q["volume"]), "成交额", fmt_amount(q["amount"])),
            ("换手率", f"{q['turnover']:.2f}%", "振幅", f"{q['amplitude']:.2f}%"),
            ("市盈率TTM", q["pe"], "市净率", q["pb"]),
            ("流通市值", f"{q['float_mv']:.0f}亿", "总市值", f"{q['total_mv']:.0f}亿"),
            ("涨停价", q["limit_up"], "跌停价", q["limit_down"]),
        ]
        for a, av, b, bv in rows:
            print(f"  {a:<12}{av:<14}{b:<12}{bv}")
        print(DIM + f"  行情时间: {fmt_time(q['time'])}" + RESET)
        print()


def watch(interval, render_fn):
    try:
        while True:
            os.system("cls" if os.name == "nt" else "clear")
            render_fn()
            print(DIM + f"\n每 {interval:g} 秒刷新，Ctrl+C 退出" + RESET)
            time.sleep(interval)
    except KeyboardInterrupt:
        print("\n已退出")


def main():
    enable_ansi()
    parser = argparse.ArgumentParser(description="A股实时行情查询（腾讯财经数据源）")
    parser.add_argument("targets", nargs="*",
                        help="股票代码或名称，留空则查询 src/ 全部自选股")
    parser.add_argument("-w", "--watch", metavar="秒", type=float, nargs="?",
                        const=5.0, help="循环刷新模式，默认 5 秒")
    args = parser.parse_args()

    config = load_config()

    if args.targets:
        symbols = []
        for t in args.targets:
            sym = resolve_symbol(t, config)
            if sym:
                symbols.append(sym)
            else:
                print(f"未找到: {t}")
        if not symbols:
            return 1
        symbols = list(dict.fromkeys(symbols))
        render_fn = lambda: render_detail(symbols)
    else:
        sync_daily_entries(config)  # 收盘后自动把当日收盘记录追加到 src/*.md
        render_fn = lambda: render_holdings(config)

    if args.watch:
        watch(args.watch, render_fn)
    else:
        try:
            render_fn()
        except OSError as e:
            print(f"查询失败: {e}")
            return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())

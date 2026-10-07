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
"""
import argparse
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC_DIR = ROOT / "src"
CONFIG_FILE = ROOT / "stocks.json"

QUOTE_API = "https://qt.gtimg.cn/q={}"
SEARCH_API = "https://smartbox.gtimg.cn/s3/?v=2&q={}&t=all"

# 红涨绿跌（A股习惯）
RED, GREEN, DIM, BOLD, RESET = "\033[31m", "\033[32m", "\033[2m", "\033[1m", "\033[0m"

COST_RE = re.compile(r"成本\s*[（(]\s*([\d.]+)")


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

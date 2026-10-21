#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
value.py — 价值投资分析工具（估值硬模型 + 安全边际）

用法:
  python value.py 600309                    # 分析（支持 6 位代码或中文名称）
  python value.py 万华化学 --save           # 分析并追加记录到 src/价值分析/<名称>.md
  python value.py 600309 --pe 12 --wacc 11.5 --force --save

口径与方法（量化模型来自 valuemodels.py，输入不足时返回 applicable=False，绝不编造）:
  - 取数: 现价/PE/PB 走腾讯行情快照（复用 stock.fetch_quotes）；
          年报序列与年度现金流走东财 F10 接口（复用 screener.http_json，带重试）。
  - 时间序列: 默认取最近 8 个年报（营收/归母净利/扣非/ROE/毛利率/资产负债率/ROIC/BPS）。
  - 周期归一化: 归一化净利 = 近 5 年平均归母净利（覆盖一轮景气周期），归一化 EPS = 归一化净利/总股本。
  - 情景加权（概率固定 25/50/25）: 中性 = 归一化 EPS × 合理PE(--pe，默认 12)；
          乐观 = 净利上修 25% 且 PE 上修 15%；悲观 = 净利下修 30% 且 PE 下修 20%。
  - EPV 零增长底线 = 归一化净利 / 折现率(--wacc，默认 10.5%，周期+高杠杆建议 11.5~13%)，
          以归母净利近似「调整后经营利润」，对高投入期公司偏保守。
  - 反向 DCF: 基准 FCF = 年度「经营现金流 − 购建固定资产等支出」的平均值；
          FCF ≤ 0（重资产扩张期常见）时模型不适用，如实输出，不强行下结论。
  - F-Score 9 项布尔全部来自年报序列与年度现金流（流动比率取东财 LD 字段）；
          M-Score / Z-Score 需三大报表明细，F10 接口不提供 → applicable=False，不强行下结论。
  - 安全边际 = (保守内在价值 − 现价) / 保守内在价值；保守值 = min(情景加权, EPV)。
  - 记录: --save 追加式写入 src/价值分析/<名称>.md（子目录不干扰 stock.py 的自选股遍历）；
          同日已有记录则跳过，--force 允许同日再追加一条（不改写历史）。

仅供学习研究，不构成投资建议。
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import stock
import valuemodels as vm
import zuanqian
from screener import http_json

ROOT = Path(__file__).resolve().parent
VALUE_DIR = ROOT / "src" / "价值分析"

F10_MAIN = ("https://datacenter-web.eastmoney.com/api/data/v1/get"
            "?reportName=RPT_F10_FINANCE_MAINFINADATA&columns=ALL"
            "&filter=(SECUCODE%3D%22{sec}%22)(REPORT_TYPE%3D%22%E5%B9%B4%E6%8A%A5%22)"
            "&pageNumber=1&pageSize=8&sortColumns=REPORT_DATE&sortTypes=-1"
            "&source=HSF10&client=PC")
F10_CASH = ("https://datacenter-web.eastmoney.com/api/data/v1/get"
            "?reportName=RPT_DMSK_FN_CASHFLOW&columns=ALL"
            "&filter=(SECUCODE%3D%22{sec}%22)&pageNumber=1&pageSize=40"
            "&sortColumns=REPORT_DATE&sortTypes=-1&source=HSF10&client=PC")
SUFFIX = {"sh": "SH", "sz": "SZ", "bj": "BJ"}

PE_DEFAULT = 12.0     # 周期股中性情景合理 PE
WACC_DEFAULT = 10.5   # 一般公司折现率%（周期+高杠杆建议 11.5~13）
PROB_OPT, PROB_BASE = 0.25, 0.50   # 情景概率: 乐观/中性/悲观 = 25/50/25


# ---------------------------------------------------------------- 取数（东财 F10）

def _f10_annual(secu):
    """年报主要指标（新→旧，最多 8 年）。金额统一转亿元。"""
    d = http_json(F10_MAIN.format(sec=secu))
    rows = (d.get("result") or {}).get("data") or []
    out = []
    for r in rows:
        out.append({
            "year": int(str(r.get("REPORT_DATE", ""))[:4] or 0),
            "rev": r.get("TOTALOPERATEREVE"),      # 营业总收入（元）
            "np": r.get("PARENTNETPROFIT"),        # 归母净利（元）
            "np_ded": r.get("KCFJCXSYJLR"),        # 扣非净利（元）
            "roe": r.get("ROEJQ"),                 # 加权 ROE（%）
            "gm": r.get("XSMLL"),                  # 毛利率（%）
            "nm": r.get("XSJLL"),                  # 销售净利率（%）
            "debt": r.get("ZCFZL"),                # 资产负债率（%）
            "roic": r.get("ROIC"),                 # ROIC（%）
            "bps": r.get("BPS"),                   # 每股净资产（元）
            "ta": r.get("TOTAL_ASSETS_PK"),        # 总资产（元）
            "shares": r.get("TOTAL_SHARE"),        # 总股本（股）
            "ld": r.get("LD"),                     # 流动比率
        })
    return out


def _f10_cashflow(secu):
    """年度现金流: {年份: (经营现金流净额, 购建固定资产等支出)}，单位亿元。"""
    d = http_json(F10_CASH.format(sec=secu))
    rows = (d.get("result") or {}).get("data") or []
    out = {}
    for r in rows:
        dt = str(r.get("REPORT_DATE", ""))[:10]
        if dt.endswith("12-31") and r.get("NETCASH_OPERATE") is not None \
                and r.get("CONSTRUCT_LONG_ASSET") is not None:
            out[int(dt[:4])] = (r["NETCASH_OPERATE"] / 1e8, r["CONSTRUCT_LONG_ASSET"] / 1e8)
    return out


def _yi(v):
    """元 → 亿元，保留 1 位；缺失返回 None。"""
    return round(v / 1e8, 1) if isinstance(v, (int, float)) else None


# ---------------------------------------------------------------- 分析编排

def analyze(token, pe=PE_DEFAULT, wacc=WACC_DEFAULT):
    """取数 + 跑量化模型，返回结果 dict（含 report 文本）。抛 ValueError 为可读错误。"""
    config = stock.load_config()
    symbol = stock.resolve_symbol(token, config)
    if not symbol:
        raise ValueError(f"未找到标的: {token}（可在 stocks.json 中补充代码映射）")
    secu = f"{symbol[2:]}.{SUFFIX[symbol[:2]]}"

    quotes = stock.fetch_quotes([symbol])
    qt = quotes.get(symbol) or {}
    price = qt.get("price")
    if not price:
        raise ValueError(f"未取到 {token} 现价（腾讯快照）")
    name = qt.get("name") or token

    def _f(v):
        try:
            return float(v)
        except (TypeError, ValueError):
            return None
    pe_ttm, pb = _f(qt.get("pe")), _f(qt.get("pb"))

    annual = _f10_annual(secu)
    if len(annual) < 3:
        raise ValueError(f"{name} 年报序列不足 3 年，无法做时间序列分析")
    cash = _f10_cashflow(secu)

    last = annual[0]
    shares_yi = last["shares"] / 1e8 if last["shares"] else None
    if not shares_yi:
        raise ValueError(f"{name} 未取到总股本，无法折算每股价值")
    mkt_cap = price * shares_yi                       # 亿元

    # 时间序列（亿元）
    for r in annual:
        r["rev_yi"], r["np_yi"], r["np_ded_yi"] = _yi(r["rev"]), _yi(r["np"]), _yi(r["np_ded"])
        r["ta_yi"] = _yi(r["ta"])
        cf = cash.get(r["year"])
        r["cfo_yi"] = round(cf[0], 1) if cf else None
        r["capex_yi"] = round(cf[1], 1) if cf else None
        r["fcf_yi"] = round(cf[0] - cf[1], 1) if cf else None

    # 周期归一化（近 5 年平均归母净利）
    np5 = [r["np_yi"] for r in annual[:5] if r["np_yi"] is not None]
    norm5 = sum(np5) / len(np5) if np5 else None
    eps_norm = norm5 / shares_yi if norm5 else None

    # ---- 量化模型（valuemodels.py 输出为准）----
    models = {}
    a, b = annual[0], annual[1] if len(annual) > 1 else annual[0]
    to_a = (a["rev"] / a["ta"]) if (a["rev"] and a["ta"]) else None
    to_b = (b["rev"] / b["ta"]) if (b["rev"] and b["ta"]) else None
    em = 1 / (1 - a["debt"] / 100) if a["debt"] is not None and a["debt"] < 100 else None
    models["dupont"] = vm.dupont(
        a["nm"] / 100 if a["nm"] is not None else None, to_a, em)
    nopat = (a["nm"] / 100 * a["rev"]) if (a["nm"] is not None and a["rev"]) else None
    ic = a["ta"] * (1 - a["debt"] / 100) if (a["ta"] and a["debt"] is not None) else None
    models["roic_wacc"] = vm.roic_wacc(nopat, ic, wacc / 100)
    flags = None
    if a["roe"] is not None and a["ta"] and a["rev"] and a["debt"] is not None \
            and b["roe"] is not None and b["ta"] and b["rev"] and b["debt"] is not None \
            and a["gm"] is not None and b["gm"] is not None \
            and a["ld"] is not None and b["ld"] is not None \
            and a["shares"] and b["shares"] \
            and a["cfo_yi"] is not None and a["np_yi"] is not None:
        flags = {
            "roa_positive": a["roe"] > 0,
            "cfo_positive": a["cfo_yi"] > 0,
            "roa_improving": a["roe"] > b["roe"],
            "accrual_low": a["cfo_yi"] >= a["np_yi"],
            "leverage_decreasing": a["debt"] < b["debt"],
            "liquidity_improving": a["ld"] > b["ld"],
            "no_dilution": a["shares"] <= b["shares"],
            "margin_improving": a["gm"] > b["gm"],
            "turnover_improving": to_a > to_b if (to_a and to_b) else False,
        }
    models["piotroski_f"] = vm.piotroski_f(flags) if flags else \
        {"applicable": False, "reason": "缺现金流或上年对比数据"}
    models["beneish_m"] = {"applicable": False,
                           "reason": "缺三大报表明细（应收/折旧/费用等），不强行下结论"}
    models["altman_z"] = {"applicable": False,
                          "reason": "缺三大报表明细（流动资产/留存收益等），不强行下结论"}
    models["earnings_quality"] = vm.earnings_quality(
        a["cfo_yi"], a["np_yi"], a["ta_yi"]) if (a["cfo_yi"] is not None
        and a["np_yi"] is not None and a["ta_yi"]) else \
        {"applicable": False, "reason": "缺现金流/总资产"}
    rev_cagr = vm.cagr(annual[-1]["rev"], annual[0]["rev"], len(annual) - 1) \
        if annual[-1]["rev"] else {"applicable": False}
    np_cagr = vm.cagr(annual[-1]["np"], annual[0]["np"], len(annual) - 1) \
        if annual[-1]["np"] else {"applicable": False}

    fcfs = [r["fcf_yi"] for r in annual if r["fcf_yi"] is not None]
    avg_fcf = sum(fcfs) / len(fcfs) if fcfs else None
    models["reverse_dcf"] = vm.reverse_dcf(mkt_cap, avg_fcf, wacc / 100) \
        if avg_fcf is not None else {"applicable": False, "reason": "缺现金流明细"}

    # 情景加权（每股价值）与 EPV
    scen = None
    if eps_norm:
        scen = vm.scenario([
            {"value": eps_norm * 1.25 * pe * 1.15, "prob": PROB_OPT},
            {"value": eps_norm * pe, "prob": PROB_BASE},
            {"value": eps_norm * 0.70 * pe * 0.80, "prob": 1 - PROB_OPT - PROB_BASE},
        ])
    epv_ps = norm5 / (wacc / 100) / shares_yi if norm5 else None

    # 安全边际（保守值 = min(情景加权, EPV)）
    v_sc = scen["expected_value"] if scen and scen.get("applicable") else None
    conservative = min(v for v in (v_sc, epv_ps) if v is not None) \
        if (v_sc is not None or epv_ps is not None) else None
    margin = (conservative - price) / conservative * 100 if conservative else None

    res = {
        "name": name, "symbol": symbol, "price": price, "pe_ttm": pe_ttm, "pb": pb,
        "mkt_cap": mkt_cap, "shares_yi": shares_yi, "annual": annual,
        "norm5": norm5, "eps_norm": eps_norm, "pe": pe, "wacc": wacc,
        "models": models, "rev_cagr": rev_cagr, "np_cagr": np_cagr,
        "avg_fcf": avg_fcf, "n_fcf": len(fcfs),
        "scen": scen, "v_sc": v_sc, "epv_ps": epv_ps,
        "conservative": conservative, "margin": margin,
    }
    res["report"] = render_report(res)
    return res


# ---------------------------------------------------------------- 报告渲染

def _fmt(v, nd=1):
    return f"{v:.{nd}f}" if isinstance(v, (int, float)) else "—"


def render_report(res):
    """渲染 Markdown 风格分析报告（终端与 --save 共用）。"""
    m = res["models"]
    L = []
    L.append(f"## {res['name']}（{res['symbol']}）价值投资分析\n")
    L.append(f"现价 **{res['price']:.2f}** ｜ 总市值 {res['mkt_cap']:.0f} 亿 ｜ "
             f"PE-TTM {_fmt(res['pe_ttm'])} ｜ PB {_fmt(res['pb'])}\n")

    L.append("### 时间序列（亿元）\n")
    L.append("| 年份 | 营收 | 归母净利 | 扣非 | ROE% | 毛利率% | 负债率% | ROIC% | FCF |")
    L.append("|---|---|---|---|---|---|---|---|---|")
    for r in res["annual"]:
        L.append(f"| {r['year']} | {_fmt(r['rev_yi'])} | {_fmt(r['np_yi'])} "
                 f"| {_fmt(r['np_ded_yi'])} | {_fmt(r['roe'], 2)} | {_fmt(r['gm'], 2)} "
                 f"| {_fmt(r['debt'], 2)} | {_fmt(r['roic'], 2)} | {_fmt(r['fcf_yi'])} |")
    L.append("")

    L.append("### 量化模型（valuemodels.py 输出）\n")
    d = m["dupont"]
    if d.get("applicable"):
        L.append(f"- 杜邦分解: ROE {d['roe']*100:.1f}% = 净利率 {d['net_margin']*100:.1f}%"
                 f" × 周转 {d['asset_turnover']:.2f} × 权益乘数 {d['equity_multiplier']:.2f}"
                 f" → {d['driver']}")
    rw = m["roic_wacc"]
    if rw.get("applicable"):
        L.append(f"- ROIC vs WACC: {rw['roic']*100:.1f}% − {rw['wacc']*100:.1f}% = "
                 f"{rw['spread']*100:+.1f}% → {rw['verdict']}（近似口径: NOPAT≈净利, 投入资本≈净资产）")
    f = m["piotroski_f"]
    L.append(f"- F-Score: {f['score']}/9 {f['grade']}" if f.get("applicable")
             else f"- F-Score: 不适用（{f.get('reason', '数据不足')}）")
    L.append(f"- M-Score / Z-Score: 不适用（{m['beneish_m']['reason']}）")
    eq = m["earnings_quality"]
    L.append(f"- 盈余质量: 现金含量 {eq['cash_content']:.2f} → {eq['verdict']}"
             if eq.get("applicable") else f"- 盈余质量: 不适用（{eq.get('reason')}）")
    rc, nc = res["rev_cagr"], res["np_cagr"]
    if rc.get("applicable") and nc.get("applicable"):
        n = len(res["annual"]) - 1
        L.append(f"- CAGR（近{n}年）: 营收 {rc['cagr']*100:+.1f}% / 归母净利 {nc['cagr']*100:+.1f}%")
    rd = m["reverse_dcf"]
    if rd.get("applicable"):
        L.append(f"- 反向 DCF（r={rd['discount_rate']*100:.1f}%）: 市场隐含永续增速 "
                 f"{rd['implied_growth']*100:.1f}% → {rd['verdict']}")
    else:
        L.append(f"- 反向 DCF: 不适用（近 {res['n_fcf']} 年平均 FCF "
                 f"{_fmt(res['avg_fcf'])} 亿，重资产扩张期 FCF 微薄/为负，不强行下结论）")
    if res["v_sc"] is not None:
        L.append(f"- 情景加权内在价值: **{res['v_sc']:.1f} 元/股**"
                 f"（中性=归一化EPS {_fmt(res['eps_norm'], 2)}×PE {res['pe']:g}；"
                 f"乐观/悲观 ±净利与 PE；概率 25/50/25）")
    if res["epv_ps"] is not None:
        L.append(f"- EPV 零增长底线: **{res['epv_ps']:.1f} 元/股**（r={res['wacc']:g}%，"
                 f"归一化净利 {_fmt(res['norm5'])} 亿）")
    L.append("")

    L.append("### 安全边际\n")
    if res["conservative"] is None:
        L.append("- 数据不足，无法计算（缺情景与 EPV 输入）\n")
    else:
        c = res["conservative"]
        verdict = "✅ 有安全边际" if res["margin"] >= 20 else \
                  ("🟡 接近买点" if res["margin"] >= 0 else "❌ 无安全边际")
        L.append(f"- 保守内在价值 = min(情景加权, EPV) = **{c:.1f} 元**")
        L.append(f"- 安全边际 = ({c:.1f} − {res['price']:.2f}) / {c:.1f} = "
                 f"**{res['margin']:+.1f}%** → {verdict}")
        L.append(f"- 20% 边际买点 **{c*0.8:.1f} 元** ｜ 30% 边际买点 **{c*0.7:.1f} 元**"
                 + (f" ｜ 情景加权口径 20% 边际买点 {res['v_sc']*0.8:.1f} 元"
                    if res["v_sc"] else ""))
        L.append("")
    L.append("> 仅供学习研究，不构成投资建议；模型对假设敏感，结论随参数变化。")
    return "\n".join(L)


# ---------------------------------------------------------------- 记录写入（追加式，幂等）

def save_report(res, force=False):
    """追加到 src/价值分析/<名称>.md；同日已有记录跳过（--force 允许再追加一条）。"""
    VALUE_DIR.mkdir(parents=True, exist_ok=True)
    path = VALUE_DIR / f"{res['name']}.md"
    today = stock._beijing_now().strftime("%Y-%m-%d")
    if path.exists():
        head = path.read_text("utf-8", errors="replace")
        if f"### {today}" in head and not force:
            return f"{name_tag(res)}: {today} 已有分析记录，跳过（--force 可再追加）"
    block = f"### {today}（现价 {res['price']:.2f}）\n\n" + \
        render_report(res).split("\n", 1)[1].strip() + "\n\n"
    if not path.exists():
        path.write_text(f"# {res['name']} 价值分析\n\n{block}", "utf-8")
    else:
        with path.open("a", encoding="utf-8") as f:
            f.write(block)
    try:
        shown = str(path.relative_to(ROOT))
    except ValueError:  # 测试时 monkeypatch 到项目外
        shown = str(path)
    return f"{name_tag(res)}: 已追加分析记录 → {shown}"


def name_tag(res):
    return f"{res['name']}({res['symbol']})"


# ---------------------------------------------------------------- CLI

def build_parser():
    ap = argparse.ArgumentParser(
        description="价值投资分析（估值硬模型 + 安全边际，模型来自 valuemodels.py）",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    ap.add_argument("targets", nargs="+", help="6 位代码或中文名称，可多只")
    ap.add_argument("--pe", type=float, default=PE_DEFAULT, help="中性情景合理 PE")
    ap.add_argument("--wacc", type=float, default=WACC_DEFAULT, help="折现率%%（周期+高杠杆建议 11.5~13）")
    ap.add_argument("--save", action="store_true", help="追加记录到 src/价值分析/<名称>.md")
    ap.add_argument("--force", action="store_true", help="同日已有记录时仍追加一条")
    return ap


def main(argv=None):
    zuanqian.enable_ansi()
    p = build_parser().parse_args(argv)
    rc = 0
    for token in p.targets:
        try:
            res = analyze(token, pe=p.pe, wacc=p.wacc)
        except (OSError, ValueError) as e:
            print(f"{token}: 分析失败 — {e}")
            rc = 1
            continue
        print(zuanqian.paint(1, res["report"]))
        if p.save:
            print(save_report(res, force=p.force))
    return rc


if __name__ == "__main__":
    sys.exit(main())

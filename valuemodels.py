#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
value_models.py — 股票价值投资分析量化模型库（纯 Python，可独立运行）

提供 8 大类模型，被 scripts/fetch_stock_data.py 调用，也可单独使用：
  - dupont          杜邦分解（ROE = 净利率 × 周转率 × 权益乘数）
  - roic_wacc       ROIC vs WACC（是否创造价值）
  - piotroski_f     Piotroski F-Score（0-9 财务健康）
  - beneish_m       Beneish M-Score（盈余操纵，含 applicable 护栏）
  - altman_z        Altman Z-Score（破产风险，含 applicable 护栏）
  - earnings_quality 盈余质量（现金含量 / 应计比）
  - reverse_dcf     反向 DCF（二分法反解市场隐含永续增速）
  - scenario        情景概率加权估值
  - cagr            复合年增长率

设计原则：
  - 所有模型在输入不足时返回 {"applicable": False}，绝不编造数字。
  - 不依赖外部库（仅标准库），pandas/numpy 缺失也能跑。
  - 与 SKILL.md 中 `models.*` 字段一一对应，报告须引用脚本输出，不得手算。

License: MIT
"""

from __future__ import annotations
import math
from typing import Any, Dict, List, Optional


def _ok(*vals: Any) -> bool:
    """所有值均非 None 且为有限数才视为可用。"""
    for v in vals:
        if v is None:
            return False
        if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
            return False
    return True


# ---------------------------------------------------------------------------
# 1. 杜邦分解
# ---------------------------------------------------------------------------
def dupont(net_margin: float, asset_turnover: float, equity_multiplier: float) -> Dict[str, Any]:
    if not _ok(net_margin, asset_turnover, equity_multiplier):
        return {"applicable": False, "reason": "缺净利率/周转率/权益乘数"}
    roe = net_margin * asset_turnover * equity_multiplier
    return {
        "applicable": True,
        "net_margin": net_margin,
        "asset_turnover": asset_turnover,
        "equity_multiplier": equity_multiplier,
        "roe": roe,
        "driver": "经营驱动" if equity_multiplier < 2.0 else "杠杆驱动",
    }


# ---------------------------------------------------------------------------
# 2. ROIC vs WACC
# ---------------------------------------------------------------------------
def roic_wacc(nopat: float, invested_capital: float, wacc: float) -> Dict[str, Any]:
    if not _ok(nopat, invested_capital, wacc) or invested_capital <= 0:
        return {"applicable": False, "reason": "缺 NOPAT/投入资本/WACC"}
    roic = nopat / invested_capital
    return {
        "applicable": True,
        "roic": roic,
        "wacc": wacc,
        "spread": roic - wacc,
        "verdict": "创造价值" if roic > wacc else "毁灭价值",
    }


# ---------------------------------------------------------------------------
# 3. Piotroski F-Score（0-9）
# ---------------------------------------------------------------------------
def piotroski_f(flags: Dict[str, bool]) -> Dict[str, Any]:
    keys = [
        "roa_positive", "cfo_positive", "roa_improving", "accrual_low",
        "leverage_decreasing", "liquidity_improving", "no_dilution",
        "margin_improving", "turnover_improving",
    ]
    if not all(k in flags for k in keys):
        return {"applicable": False, "reason": "F-Score 需 9 项布尔输入"}
    score = sum(1 for k in keys if flags.get(k))
    grade = "优秀" if score >= 7 else ("中性" if score >= 4 else "差")
    return {"applicable": True, "score": score, "grade": grade}


# ---------------------------------------------------------------------------
# 4. Beneish M-Score（盈余操纵）
# ---------------------------------------------------------------------------
def beneish_m(dsri, gmi, aqi, sgi, depi, sgai, tata, lvi=None) -> Dict[str, Any]:
    if not _ok(dsri, gmi, aqi, sgi, depi, sgai, tata):
        return {"applicable": False, "reason": "缺 M-Score 七项指数"}
    lvgi = lvi if lvi is not None else 1.0
    m = (-4.84 + 0.92 * dsri + 0.528 * gmi + 0.404 * aqi + 0.892 * sgi
         + 0.115 * depi - 0.172 * sgai + 4.679 * tata - 0.327 * lvgi)
    return {
        "applicable": True,
        "score": m,
        "triggered": m > -1.78,
        "verdict": "高概率盈余操纵" if m > -1.78 else "未触发",
    }


# ---------------------------------------------------------------------------
# 5. Altman Z-Score（破产风险）
# ---------------------------------------------------------------------------
def altman_z(x1, x2, x3, x4, x5) -> Dict[str, Any]:
    if not _ok(x1, x2, x3, x4, x5):
        return {"applicable": False, "reason": "缺 Z-Score 五项比率"}
    z = 1.2 * x1 + 1.4 * x2 + 3.3 * x3 + 0.6 * x4 + 1.0 * x5
    if z > 2.99:
        zone, risk = "安全", False
    elif z > 1.81:
        zone, risk = "灰色区", False
    else:
        zone, risk = "破产高危", True
    return {"applicable": True, "score": z, "zone": zone, "bankruptcy_risk": risk}


# ---------------------------------------------------------------------------
# 6. 盈余质量
# ---------------------------------------------------------------------------
def earnings_quality(cfo: float, net_income: float, total_assets: float) -> Dict[str, Any]:
    if not _ok(cfo, net_income, total_assets) or total_assets <= 0:
        return {"applicable": False, "reason": "缺经营现金流/净利/总资产"}
    cash_ratio = cfo / net_income if net_income not in (0, None) else None
    accrual = (net_income - cfo) / total_assets
    return {
        "applicable": True,
        "cash_content": cash_ratio,
        "accrual_ratio": accrual,
        "verdict": "现金含量高" if (cash_ratio is not None and cash_ratio >= 1) else "现金含量偏低",
    }


# ---------------------------------------------------------------------------
# 7. 反向 DCF（二分法反解隐含永续增速 g）
# ---------------------------------------------------------------------------
def reverse_dcf(market_cap: float, base_fcf: float, discount_rate: float,
                years: int = 10, near_growth: float = 0.10,
                lo: float = -0.05, hi: float = 0.30) -> Dict[str, Any]:
    if not _ok(market_cap, base_fcf, discount_rate) or base_fcf <= 0 or discount_rate <= 0:
        return {"applicable": False, "reason": "缺市值/基准FCF/折现率，或 FCF 非正"}
    r = discount_rate

    def ev(g):
        ev_sum = 0.0
        fcf = base_fcf
        for t in range(1, years + 1):
            fcf = fcf * (1 + near_growth)
            ev_sum += fcf / ((1 + r) ** t)
        tv = fcf * (1 + g) / (r - g) if (r - g) > 0 else float("inf")
        ev_sum += tv / ((1 + r) ** years)
        return ev_sum

    # 二分法求使 EV == market_cap 的 g
    # 终端增长率 g 必须 < 折现率 r，否则永续价值发散；此时隐含增速必低于 r，向下搜。
    hi = min(hi, r - 1e-3)
    a, b = lo, hi
    for _ in range(80):
        mid = (a + b) / 2
        if ev(mid) > market_cap:
            a = mid  # 价值偏大，需要更高的 g
        else:
            b = mid  # 价值偏小，需要更低的 g
    g = (a + b) / 2
    return {
        "applicable": True,
        "implied_growth": g,
        "discount_rate": r,
        "near_term_growth": near_growth,
        "verdict": "隐含增速偏高，可能透支未来" if g > 0.12 else "隐含增速保守，可能便宜",
    }


# ---------------------------------------------------------------------------
# 8. 情景概率加权估值
# ---------------------------------------------------------------------------
def scenario(scenarios: List[Dict[str, float]]) -> Dict[str, Any]:
    """scenarios: [{"value": 内在价值, "prob": 概率(0-1)}, ...]"""
    if not scenarios:
        return {"applicable": False, "reason": "无情景输入"}
    total_p = sum(s.get("prob", 0) for s in scenarios)
    if abs(total_p - 1.0) > 1e-6:
        return {"applicable": False, "reason": "概率合计须为 1.0"}
    expected = sum(s["value"] * s["prob"] for s in scenarios if "value" in s)
    return {"applicable": True, "expected_value": expected, "n_scenarios": len(scenarios)}


# ---------------------------------------------------------------------------
# 9. CAGR
# ---------------------------------------------------------------------------
def cagr(start: float, end: float, years: float) -> Dict[str, Any]:
    if not _ok(start, end, years) or start <= 0 or years <= 0:
        return {"applicable": False, "reason": "缺期初/期末/年数"}
    rate = (end / start) ** (1 / years) - 1
    return {"applicable": True, "cagr": rate}


if __name__ == "__main__":
    # 自测：腾讯式样例
    print("dupont:", dupont(0.25, 0.6, 1.5))
    print("reverse_dcf:", reverse_dcf(30000, 1500, 0.09))
    print("piotroski_f:", piotroski_f({k: True for k in [
        "roa_positive", "cfo_positive", "roa_improving", "accrual_low",
        "leverage_decreasing", "liquidity_improving", "no_dilution",
        "margin_improving", "turnover_improving"]}))
    print("scenario:", scenario([{"value": 400, "prob": 0.3}, {"value": 320, "prob": 0.5}, {"value": 220, "prob": 0.2}]))

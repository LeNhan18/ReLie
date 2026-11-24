"""Tính chi phí thật của một khoản vay từ dòng tiền thực tế.

Mọi con số hiển thị cho người dùng về chi phí vay PHẢI đi qua module này.
LLM không bao giờ tự tính lãi suất.

Quy ước dòng tiền: dương = tiền người vay NHẬN, âm = tiền người vay TRẢ.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, timedelta

DAYS_PER_YEAR = 365


@dataclass(frozen=True)
class CashFlow:
    on: date
    amount: int  # VND, dương = nhận, âm = trả


@dataclass
class CostResult:
    amount_received: int
    total_repaid: int
    total_cost: int
    term_days: int
    period_days: int            # độ dài một kỳ trả (ngày) dùng để quy năm
    period_rate: float          # lãi suất mỗi kỳ từ IRR (tỷ lệ, không phải %)
    # %/năm = lãi kỳ × số kỳ/năm (lãi danh nghĩa, không ghép lãi) — dùng đối chiếu trần %/năm của luật
    apr_simple: float
    apr_effective: float | None  # %/năm, lãi kép quy năm — chỉ để tham khảo; None nếu tràn số
    scenarios: dict[str, int] = field(default_factory=dict)


class CashFlowError(ValueError):
    pass


def _validate(flows: list[CashFlow]) -> list[CashFlow]:
    if len(flows) < 2:
        raise CashFlowError("Cần ít nhất 1 khoản nhận và 1 khoản trả")
    flows = sorted(flows, key=lambda f: f.on)
    if not any(f.amount > 0 for f in flows) or not any(f.amount < 0 for f in flows):
        raise CashFlowError("Dòng tiền phải có cả tiền nhận (dương) và tiền trả (âm)")
    if flows[0].amount <= 0:
        raise CashFlowError("Khoản đầu tiên phải là tiền nhận")
    return flows


def _npv(rate: float, flows: list[CashFlow]) -> float:
    t0 = flows[0].on
    return sum(f.amount / (1 + rate) ** ((f.on - t0).days) for f in flows)


def daily_irr(flows: list[CashFlow]) -> float:
    """IRR theo ngày bằng chia đôi (bisection) — ổn định, không phụ thuộc điểm khởi đầu.

    NPV(r) giảm dần theo r với dòng tiền "nhận trước, trả sau", nên luôn có nghiệm duy nhất
    khi tổng trả > tổng nhận.
    """
    flows = _validate(flows)
    lo, hi = -0.5, 1.0  # lãi ngày từ -50% đến 100%/ngày (cận dưới không quá thấp để tránh tràn số với kỳ hạn dài)
    f_lo, f_hi = _npv(lo, flows), _npv(hi, flows)
    if f_lo * f_hi > 0:
        raise CashFlowError("Không tìm được lãi suất trong khoảng hợp lý")
    for _ in range(200):
        mid = (lo + hi) / 2
        f_mid = _npv(mid, flows)
        if abs(f_mid) < 1e-6:
            return mid
        if f_lo * f_mid < 0:
            hi, f_hi = mid, f_mid
        else:
            lo, f_lo = mid, f_mid
    return (lo + hi) / 2


def _period_days(flows: list[CashFlow]) -> int:
    """Độ dài kỳ trả: trả một lần → cả kỳ hạn; trả nhiều lần → khoảng cách phổ biến nhất giữa các lần trả."""
    pays = [f.on for f in flows if f.amount < 0]
    if len(pays) == 1:
        return (pays[0] - flows[0].on).days
    gaps = [(b - a).days for a, b in zip(pays, pays[1:], strict=False) if (b - a).days > 0]
    return max(set(gaps), key=gaps.count) if gaps else 1


def true_cost(flows: list[CashFlow]) -> CostResult:
    flows = _validate(flows)
    received = sum(f.amount for f in flows if f.amount > 0)
    repaid = -sum(f.amount for f in flows if f.amount < 0)
    term_days = (flows[-1].on - flows[0].on).days
    if term_days <= 0:
        raise CashFlowError("Kỳ hạn phải lớn hơn 0 ngày")
    r_day = daily_irr(flows)
    p = _period_days(flows)
    r_period = (1 + r_day) ** p - 1
    apr_simple = r_period * DAYS_PER_YEAR / p * 100
    try:
        apr_effective: float | None = ((1 + r_day) ** DAYS_PER_YEAR - 1) * 100
    except OverflowError:
        apr_effective = None
    return CostResult(
        amount_received=received,
        total_repaid=repaid,
        total_cost=repaid - received,
        term_days=term_days,
        period_days=p,
        period_rate=r_period,
        apr_simple=round(apr_simple, 2),
        apr_effective=None if apr_effective is None else round(apr_effective, 2),
    )


# ---------- Bộ dựng dòng tiền cho các kiểu khoản vay thường gặp ----------

def one_time_loan(received: int, repay_total: int, start: date, term_days: int) -> list[CashFlow]:
    """Vay một lần, trả một lần (kiểu app vay 7-14 ngày)."""
    return [CashFlow(start, received), CashFlow(start + timedelta(days=term_days), -repay_total)]


def daily_installment_loan(received: int, daily_payment: int, days: int, start: date) -> list[CashFlow]:
    """Góp ngày: nhận tiền hôm nay, mỗi ngày góp một khoản cố định từ ngày hôm sau."""
    flows = [CashFlow(start, received)]
    flows += [CashFlow(start + timedelta(days=i), -daily_payment) for i in range(1, days + 1)]
    return flows


def flat_rate_monthly_loan(principal: int, monthly_rate_pct: float, months: int, start: date) -> list[CashFlow]:
    """Trả góp với lãi tính trên dư nợ BAN ĐẦU (lãi phẳng) — kiểu quảng cáo dễ gây hiểu nhầm.

    Dùng tháng chuẩn 30 ngày để giữ tính toán ổn định và kiểm thử được.
    """
    payment = round(principal / months + principal * monthly_rate_pct / 100)
    flows = [CashFlow(start, principal)]
    flows += [CashFlow(start + timedelta(days=30 * i), -payment) for i in range(1, months + 1)]
    return flows


def extension_scenarios(repay_total: int, extension_fee: int, max_extensions: int = 2) -> dict[str, int]:
    """Tổng tiền phải trả nếu gia hạn 0..n lần (phí gia hạn không trừ vào gốc)."""
    return {f"gia_han_{k}_lan": repay_total + k * extension_fee for k in range(max_extensions + 1)}

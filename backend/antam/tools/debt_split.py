"""Ước tính phần lãi trong trần dân sự và khoản thu vượt trần."""

from datetime import date
from decimal import ROUND_HALF_UP, Decimal


def split_debt(
    received: int,
    total_demanded: int,
    disbursed: date,
    last_due: date,
    cap_pct: float,
    applies: bool,
) -> tuple[int, int]:
    """Trả (lãi trong trần, khoản vượt trần), đơn vị VND nguyên.

    Khi tổng đòi thấp hơn gốc, phần lãi được chặn ở 0.
    Ngày trả cuối phải sau ngày giải ngân, kể cả khi không áp trần.
    """
    if received <= 0 or total_demanded < 0:
        raise ValueError("Tiền nhận phải dương và tổng đòi không được âm")
    if last_due <= disbursed:
        raise ValueError("Ngày trả cuối phải sau ngày giải ngân")
    cap = Decimal(str(cap_pct))
    if not cap.is_finite() or cap < 0:
        raise ValueError("Trần lãi suất phải là số hữu hạn không âm")
    charged_interest = max(0, total_demanded - received)
    if not applies:
        return charged_interest, 0
    ceiling = int(
        (Decimal(received) * cap * (last_due - disbursed).days / Decimal(36500))
        .quantize(Decimal(1), rounding=ROUND_HALF_UP)
    )
    lawful_interest = min(charged_interest, ceiling)
    return lawful_interest, charged_interest - lawful_interest

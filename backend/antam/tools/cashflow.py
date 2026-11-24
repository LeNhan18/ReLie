"""Dự báo dòng tiền: "Hôm nay bạn được tiêu" và cảnh báo thiếu tiền trước hạn trả nợ."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True)
class Debt:
    label: str
    due: date
    amount: int


@dataclass(frozen=True)
class FixedExpense:
    label: str
    due: date
    amount: int


@dataclass(frozen=True)
class Shortfall:
    debt_label: str
    due: date
    missing: int


@dataclass
class Forecast:
    spendable_today: int
    days_until_payday: int
    shortfalls: list[Shortfall]


def forecast(
    today: date,
    cash_on_hand: int,
    next_payday: date,
    avg_daily_spend: int,
    debts: list[Debt],
    fixed: list[FixedExpense],
    buffer: int = 0,
) -> Forecast:
    if next_payday <= today:
        raise ValueError("Ngày lương tiếp theo phải sau hôm nay")
    days = (next_payday - today).days
    due_before = sum(d.amount for d in debts if today <= d.due < next_payday)
    fixed_before = sum(f.amount for f in fixed if today <= f.due < next_payday)
    available = cash_on_hand - due_before - fixed_before - buffer
    spendable = max(0, available // days)

    shortfalls: list[Shortfall] = []
    committed = 0
    for d in sorted((d for d in debts if today <= d.due < next_payday), key=lambda d: d.due):
        spent = avg_daily_spend * (d.due - today).days
        fixed_by_then = sum(f.amount for f in fixed if today <= f.due <= d.due)
        balance_at_due = cash_on_hand - spent - fixed_by_then - committed
        if balance_at_due < d.amount:
            shortfalls.append(Shortfall(d.label, d.due, d.amount - max(balance_at_due, 0)))
        committed += d.amount
    return Forecast(spendable_today=spendable, days_until_payday=days, shortfalls=shortfalls)

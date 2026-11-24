from datetime import date

import pytest

from antam.tools.cashflow import Debt, FixedExpense, forecast

T = date(2026, 11, 25)


def test_spendable_and_shortfall():
    f = forecast(T, cash_on_hand=5_000_000, next_payday=date(2026, 12, 5), avg_daily_spend=150_000,
                 debts=[Debt("XanhCash", date(2026, 12, 4), 4_200_000)],
                 fixed=[FixedExpense("Tiền nhà", date(2026, 12, 1), 1_000_000)])
    assert f.days_until_payday == 10
    assert f.spendable_today == 0  # 5tr - 4.2tr - 1tr < 0
    assert len(f.shortfalls) == 1
    # Ngày 4/12: 5tr - 9×150k - 1tr = 2.65tr → thiếu 1.55tr
    assert f.shortfalls[0].missing == 1_550_000


def test_no_shortfall():
    f = forecast(T, 10_000_000, date(2026, 12, 5), 100_000, [Debt("A", date(2026, 12, 1), 1_000_000)], [])
    assert f.shortfalls == []
    assert f.spendable_today == 900_000


def test_payday_must_be_future():
    with pytest.raises(ValueError):
        forecast(T, 1, T, 0, [], [])

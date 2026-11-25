from datetime import date

import pytest

from antam.tools.debt_split import split_debt, summarize_debt

DISBURSED = date(2026, 11, 20)
DUE = date(2026, 12, 4)


def test_xanhcash():
    assert split_debt(3_000_000, 4_200_000, DISBURSED, DUE, 20, True) == (23014, 1176986)


@pytest.mark.parametrize("demanded, expected", [(3_010_000, (10000, 0)), (3_000_000, (0, 0)), (2_000_000, (0, 0))])
def test_low_demand(demanded, expected):
    assert split_debt(3_000_000, demanded, DISBURSED, DUE, 20, True) == expected


def test_credit_institution():
    assert split_debt(3_000_000, 4_200_000, DISBURSED, DUE, 20, False) == (1200000, 0)
    assert split_debt(3_000_000, 2_000_000, DISBURSED, DUE, 20, False) == (-1000000, 0)


def test_exact_ceiling_and_half_up_rounding():
    assert split_debt(36500, 43800, DISBURSED, date(2027, 11, 20), 20, True) == (7300, 0)
    assert split_debt(18250, 20000, DISBURSED, date(2026, 11, 21), 1, True) == (1, 1749)


@pytest.mark.parametrize("due", [DISBURSED, date(2026, 11, 19)])
@pytest.mark.parametrize("applies", [True, False])
def test_invalid_dates(due, applies):
    with pytest.raises(ValueError, match="Ngày trả cuối"):
        split_debt(3_000_000, 4_200_000, DISBURSED, due, 20, applies)


@pytest.mark.parametrize("received, demanded, cap", [
    (0, 100, 20), (100, -1, 20), (100, 200, -1),
    (100, 200, float("nan")), (100, 200, float("inf")),
])
def test_invalid_amounts_and_cap(received, demanded, cap):
    with pytest.raises(ValueError):
        split_debt(received, demanded, DISBURSED, DUE, cap, True)


def test_summarize_unsorted_schedule():
    assert summarize_debt(3_000_000, [(DUE, 2_200_000), (date(2026, 11, 27), 2_000_000)],
                          DISBURSED, 20, True) == (4200000, 23014, 1176986)


@pytest.mark.parametrize("schedule", [[], [(DUE, 0)], [(DUE, -1)], [(DISBURSED, 100)],
                                      [(date(2026, 11, 19), 100), (DUE, 100)]])
def test_summarize_rejects_invalid_schedule(schedule):
    with pytest.raises(ValueError):
        summarize_debt(100, schedule, DISBURSED, 20, True)

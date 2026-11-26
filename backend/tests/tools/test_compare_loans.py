from datetime import date, timedelta

import pytest

from antam.schemas.loan import ConfirmedLoan, Installment
from antam.tools.calc_true_cost import CashFlowError
from antam.tools.compare_loans import compare_loans

START = date(2026, 11, 20)


def offer(total: int, days: int = 30, received: int = 3_000_000) -> ConfirmedLoan:
    return ConfirmedLoan(
        lender_name="MẪU HƯ CẤU", amount_received=received, disbursed_date=START,
        schedule=[Installment(on=START + timedelta(days=days), amount=total)],
    )


def test_compare_costs_preserves_input_order_and_finds_cheapest():
    result = compare_loans([offer(4_200_000), offer(3_300_000), offer(3_600_000)])
    assert [cost.total_cost for cost in result.costs] == [1_200_000, 300_000, 600_000]
    assert result.cheapest_indices == [1]
    assert result.costs[1].apr_simple == pytest.approx(121.67, abs=0.01)


def test_equal_totals_preserve_ties_despite_different_apr():
    result = compare_loans([offer(3_300_000, 30), offer(3_300_000, 60)])
    assert result.cheapest_indices == [0, 1]
    assert result.costs[0].apr_simple > result.costs[1].apr_simple


def test_installments_and_unsorted_schedule():
    loan = offer(3_300_000)
    loan.schedule = [Installment(on=START + timedelta(days=60), amount=1_650_000),
                     Installment(on=START + timedelta(days=30), amount=1_650_000)]
    result = compare_loans([loan, offer(3_600_000, 60)])
    assert result.cheapest_indices == [0]
    assert result.costs[0].total_repaid == 3_300_000
    assert result.costs[0].term_days == 60


def test_four_zero_cost_offers():
    result = compare_loans([offer(3_000_000) for _ in range(4)])
    assert result.cheapest_indices == [0, 1, 2, 3]
    assert all(cost.total_cost == 0 for cost in result.costs)


@pytest.mark.parametrize("count", [0, 1, 5])
def test_reject_invalid_offer_count(count):
    with pytest.raises(CashFlowError, match="2 đến 4"):
        compare_loans([offer(3_300_000) for _ in range(count)])


def test_reject_different_received_amounts():
    with pytest.raises(CashFlowError, match="cùng tiền thực nhận"):
        compare_loans([offer(3_300_000), offer(2_200_000, received=2_000_000)])


def test_reject_different_disbursement_dates():
    later = offer(3_300_000)
    later.disbursed_date += timedelta(days=1)
    with pytest.raises(CashFlowError, match="ngày giải ngân"):
        compare_loans([offer(3_300_000), later])


@pytest.mark.parametrize("days, amount", [(0, 100), (-1, 100), (30, 0), (30, -100)])
def test_reject_invalid_installment(days, amount):
    with pytest.raises(CashFlowError, match="Mỗi kỳ trả"):
        compare_loans([offer(3_300_000), offer(amount, days)])

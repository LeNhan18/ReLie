"""Các ca bắt buộc trong kế hoạch: XanhCash, góp ngày, lãi phẳng, vay ngân hàng thường."""

from datetime import date

import pytest

from antam.tools.calc_true_cost import (
    CashFlow,
    CashFlowError,
    daily_installment_loan,
    extension_scenarios,
    flat_rate_monthly_loan,
    one_time_loan,
    true_cost,
)

D0 = date(2026, 11, 20)


def test_xanhcash_one_time_14_days():
    r = true_cost(one_time_loan(3_000_000, 4_200_000, D0, 14))
    assert r.total_cost == 1_200_000
    assert r.term_days == 14
    # 40% trong 14 ngày → 40 × 365/14 ≈ 1042.86%/năm
    assert r.apr_simple == pytest.approx(1042.86, abs=0.05)


def test_daily_installment_gop_ngay():
    r = true_cost(daily_installment_loan(9_000_000, 250_000, 50, D0))
    assert r.total_repaid == 12_500_000
    assert r.period_days == 1
    # IRR theo ngày ≈ 1.37%/ngày → ≈ 500%/năm
    assert r.period_rate == pytest.approx(0.0137, abs=0.0005)
    assert 480 < r.apr_simple < 520


def test_flat_rate_monthly_is_about_double_the_advertised_rate():
    # Quảng cáo 1%/tháng (12%/năm) tính trên dư nợ ban đầu, 12 kỳ
    r = true_cost(flat_rate_monthly_loan(10_000_000, 1.0, 12, D0))
    assert r.period_days == 30
    assert 20 < r.apr_simple < 24


def test_ordinary_bank_loan_low_apr():
    # 10 triệu, trả 1 lần 10.4 triệu sau 365 ngày ≈ 4%/năm
    r = true_cost(one_time_loan(10_000_000, 10_400_000, D0, 365))
    assert r.apr_simple == pytest.approx(4.0, abs=0.05)


def test_zero_cost_loan():
    r = true_cost(one_time_loan(5_000_000, 5_000_000, D0, 30))
    assert r.total_cost == 0
    assert r.apr_simple == pytest.approx(0, abs=0.01)


def test_order_independent():
    flows = one_time_loan(3_000_000, 4_200_000, D0, 14)
    assert true_cost(list(reversed(flows))).apr_simple == true_cost(flows).apr_simple


@pytest.mark.parametrize("flows", [
    [CashFlow(D0, 1_000_000)],
    [CashFlow(D0, 1_000_000), CashFlow(D0, 500_000)],
    [CashFlow(D0, -1_000_000), CashFlow(date(2026, 12, 1), 1_100_000)],
    [CashFlow(D0, 1_000_000), CashFlow(D0, -1_100_000)],
])
def test_invalid_flows_raise(flows):
    with pytest.raises(CashFlowError):
        true_cost(flows)


def test_extension_scenarios():
    assert extension_scenarios(4_200_000, 800_000) == {
        "gia_han_0_lan": 4_200_000, "gia_han_1_lan": 5_000_000, "gia_han_2_lan": 5_800_000,
    }

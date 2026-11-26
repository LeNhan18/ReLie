"""Mẫu hư cấu phải trích xuất được và giữ nguyên dòng tiền đã kiểm thử."""

import json
from datetime import date

import pytest
from fastapi.testclient import TestClient

from antam.config import settings
from antam.main import app
from antam.schemas.loan import LoanTerms
from antam.tools.calc_true_cost import (
    CashFlow,
    daily_installment_loan,
    flat_rate_monthly_loan,
    one_time_loan,
    true_cost,
)

client = TestClient(app)


@pytest.mark.parametrize("sample_id", ["gop_ngay", "cty_tai_chinh_a"])
def test_extract_fictional_sample(sample_id):
    raw = json.loads((settings.samples_dir / f"{sample_id}.terms.json").read_text(encoding="utf-8"))
    assert raw["_note"] == "MẪU HƯ CẤU"
    assert "MẪU HƯ CẤU" in raw["lender_name"]["value"]
    response = client.post("/loan/extract", data={"sample_id": sample_id})
    assert response.status_code == 200
    data = response.json()
    terms = LoanTerms.model_validate(data["terms"])
    assert data["low_confidence_fields"] == []
    assert terms.disbursed_date.value == date(2026, 11, 20)
    assert terms.fees == []
    flows = [CashFlow(terms.disbursed_date.value, terms.amount_received.value)]
    flows += [CashFlow(item.on, -item.amount) for item in terms.schedule]
    cost = true_cost(flows)
    if sample_id == "gop_ngay":
        assert terms.repayment_type.value == "daily"
        assert flows == daily_installment_loan(9_000_000, 250_000, 50, terms.disbursed_date.value)
        assert cost.total_repaid == 12_500_000
        assert cost.period_rate == pytest.approx(0.0137, abs=0.0005)
    else:
        assert terms.repayment_type.value == "installment"
        assert terms.rate_stated_pct_year.value == 12
        assert flows == flat_rate_monthly_loan(10_000_000, 1.0, 12, terms.disbursed_date.value)
        assert 20 < cost.apr_simple < 24


@pytest.mark.parametrize("sample_id, received, repaid, days, low_confidence, upfront", [
    ("vay_lai_thap", 10_000_000, 10_400_000, 365, set(), False),
    ("vay_nguoi_quen", 2_000_000, 2_000_000, 30, {"amount_received", "disbursed_date"}, False),
    ("doi_phi_truoc", 5_000_000, 5_050_000, 30, {"amount_received", "disbursed_date"}, True),
])
def test_extract_additional_fictional_samples(sample_id, received, repaid, days, low_confidence, upfront):
    raw = json.loads((settings.samples_dir / f"{sample_id}.terms.json").read_text(encoding="utf-8"))
    assert raw["_note"] == "MẪU HƯ CẤU"
    response = client.post("/loan/extract", data={"sample_id": sample_id})
    assert response.status_code == 200
    data = response.json()
    terms = LoanTerms.model_validate(data["terms"])
    assert "MẪU HƯ CẤU" in terms.lender_name.value
    assert set(data["low_confidence_fields"]) == low_confidence
    assert terms.requires_upfront_payment is upfront
    flows = [CashFlow(terms.disbursed_date.value, terms.amount_received.value)]
    flows += [CashFlow(item.on, -item.amount) for item in terms.schedule]
    assert flows == one_time_loan(received, repaid, date(2026, 11, 20), days)

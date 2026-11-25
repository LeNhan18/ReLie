from datetime import date

import pytest
from fastapi.testclient import TestClient

from antam.main import app
from antam.routers import aftercare
from antam.tools.check_license import Lender
from antam.tools.rule_engine import LegalParam

client = TestClient(app)


@pytest.fixture
def loan():
    return {
        "lender_name": "MẪU HƯ CẤU XanhCash",
        "amount_received": 3_000_000,
        "disbursed_date": "2026-11-20",
        "schedule": [{"on": "2026-12-04", "amount": 4_200_000}],
    }


def test_xanhcash_shape(loan):
    response = client.post("/aftercare/assess", json=loan)
    assert response.status_code == 200
    data = response.json()
    assert set(data) == {"lender_status", "principal_received", "lawful_interest", "excess_charge",
                         "total_demanded", "excess_applies", "checklist", "note"}
    assert data["lender_status"] == "not_found"
    assert data["principal_received"] == 3_000_000
    assert data["lawful_interest"] == 23014
    assert data["excess_charge"] == 1176986
    assert data["total_demanded"] == 4_200_000
    assert data["excess_applies"] is True
    assert [item["id"] for item in data["checklist"]] == [
        "luu_bang_chung", "tat_quyen", "bao_nguoi_than", "khong_vay_chong",
    ]
    assert all(set(item) == {"id", "text"} and item["text"] for item in data["checklist"])
    assert "Không phải tư vấn pháp lý" in data["note"]


@pytest.mark.parametrize("demanded, interest", [(4_200_000, 1_200_000), (2_000_000, -1_000_000)])
def test_credit_institution(loan, monkeypatch, demanded, interest):
    data = {**aftercare.seed(), "lenders": [Lender(loan["lender_name"], "cty_tai_chinh", "test fixture")]}
    monkeypatch.setattr(aftercare, "seed", lambda: data)
    loan["schedule"][0]["amount"] = demanded
    response = client.post("/aftercare/assess", json=loan)
    assert response.status_code == 200
    result = response.json()
    assert result["lender_status"] == "credit_institution"
    assert result["excess_applies"] is False
    assert result["lawful_interest"] == interest
    assert result["excess_charge"] == 0


def test_ambiguous_license_keeps_civil_branch(loan, monkeypatch):
    lender = Lender(loan["lender_name"], "cty_tai_chinh", "test fixture")
    monkeypatch.setattr(aftercare, "seed", lambda: {"lenders": [lender, lender],
                                                   "legal_params": aftercare_params()})
    result = client.post("/aftercare/assess", json=loan).json()
    assert result["lender_status"] == "ambiguous"
    assert result["excess_applies"] is True


def aftercare_params():
    return [
        LegalParam("cap_civil_pct", 10, date(2020, 1, 1), date(2025, 12, 31), "test fixture"),
        LegalParam("cap_civil_pct", 20, date(2026, 1, 1), None, "test fixture"),
    ]


def test_cap_selected_at_disbursement(loan, monkeypatch):
    monkeypatch.setattr(aftercare, "seed", lambda: {"lenders": [], "legal_params": aftercare_params()})
    loan.update(disbursed_date="2025-11-20", schedule=[{"on": "2025-12-04", "amount": 4_200_000}])
    response = client.post("/aftercare/assess", json=loan)
    assert response.status_code == 200
    assert response.json()["lawful_interest"] == 11507


def test_missing_legal_cap(loan, monkeypatch):
    monkeypatch.setattr(aftercare, "seed", lambda: {"lenders": [], "legal_params": []})
    response = client.post("/aftercare/assess", json=loan)
    assert response.status_code == 422
    assert response.json() == {"detail": "Chưa có tham số trần lãi suất tại ngày giải ngân"}


@pytest.mark.parametrize("schedule", [[], [{"on": "2026-11-20", "amount": 4_200_000}],
                                      [{"on": "2026-11-19", "amount": 1}, {"on": "2026-12-04", "amount": 1}],
                                      [{"on": "2026-12-04", "amount": -1}]])
def test_invalid_schedule(loan, schedule):
    loan["schedule"] = schedule
    response = client.post("/aftercare/assess", json=loan)
    assert response.status_code == 422
    assert isinstance(response.json()["detail"], str)


@pytest.mark.parametrize("field, value", [("lender_name", None), ("disbursed_date", "ngày sai"),
                                        ("amount_received", 0)])
def test_invalid_fields_return_vietnamese_detail(loan, field, value):
    loan[field] = value
    response = client.post("/aftercare/assess", json=loan)
    assert response.status_code == 422
    assert response.json() == {
        "detail": "Dữ liệu khoản vay không hợp lệ, vui lòng kiểm tra các trường và lịch trả nợ",
    }

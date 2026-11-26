from fastapi.testclient import TestClient

from antam.main import app

client = TestClient(app)


def test_today_budget_and_debt_shortfall():
    response = client.post("/plan/today", json={
        "today": "2026-11-25", "next_payday": "2026-12-05", "cash_on_hand": 5_000_000,
        "avg_daily_spend": 150_000,
        "debts": [{"label": "Khoản vay mẫu", "due": "2026-12-04", "amount": 4_200_000}],
        "fixed": [{"label": "Tiền nhà", "due": "2026-12-01", "amount": 1_000_000}],
    })
    assert response.status_code == 200
    assert response.json() == {
        "spendable_today": 0, "days_until_payday": 10,
        "shortfalls": [{"debt_label": "Khoản vay mẫu", "due": "2026-12-04", "missing": 1_550_000}],
    }


def test_negative_debt_returns_vietnamese_detail():
    response = client.post("/plan/today", json={
        "today": "2026-11-25", "next_payday": "2026-12-05", "cash_on_hand": 1_000_000,
        "avg_daily_spend": 0, "debts": [{"label": "Khoản vay mẫu", "due": "2026-12-04", "amount": -1}],
    })
    assert response.status_code == 422
    assert response.json() == {"detail": "Số tiền trả nợ và chi cố định không được âm"}

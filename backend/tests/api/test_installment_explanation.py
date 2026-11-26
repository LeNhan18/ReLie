"""Lời giải thích không biến lịch góp thành khoản trả một lần ngày cuối."""

from fastapi.testclient import TestClient

from antam.main import app

client = TestClient(app)


def test_installment_assessment_explains_total_over_entire_term():
    response = client.post("/loan/assess", json={
        "lender_name": "MẪU HƯ CẤU", "amount_received": 3_000_000,
        "disbursed_date": "2026-11-20",
        "schedule": [{"on": "2026-12-20", "amount": 1_650_000},
                     {"on": "2027-01-19", "amount": 1_650_000}],
    })
    assert response.status_code == 200
    result = response.json()
    assert result["total_repaid"] == 3_300_000
    assert "Tổng tiền phải trả là 3.300.000đ trong kỳ hạn 60 ngày" in result["explanation"]
    assert "theo lịch trả đã xác nhận" in result["explanation"]
    assert "sau 60 ngày" not in result["explanation"]

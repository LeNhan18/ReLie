"""Test API ở AI_MODE=mock (mặc định) — không gọi Bedrock."""

from fastapi.testclient import TestClient

from antam.main import app

client = TestClient(app)


def test_health():
    assert client.get("/health").json() == {"status": "ok"}


def test_extract_sample_flags_low_confidence():
    r = client.post("/loan/extract", data={"sample_id": "xanhcash"})
    assert r.status_code == 200
    assert "fees.Phí dịch vụ" in r.json()["low_confidence_fields"]


def test_assess_xanhcash_is_red():
    body = {
        "lender_name": "Công ty TNHH Công nghệ Tài chính XanhCash",
        "amount_received": 3_000_000, "disbursed_date": "2026-11-20",
        "schedule": [{"on": "2026-12-04", "amount": 4_200_000}],
        "rate_stated_pct_year": 0, "extension_fee": 800_000, "late_penalty_pct_per_day": 5,
        "data_access_contacts": True,
    }
    r = client.post("/loan/assess", json=body)
    assert r.status_code == 200
    j = r.json()
    assert j["risk_level"] == "red"
    assert {"R1", "R2", "R3", "R4", "R5", "R6"} <= {f["rule_id"] for f in j["findings"]}
    assert j["scenarios"]["gia_han_2_lan"] == 5_800_000


def test_need_options_puts_no_loan_first():
    r = client.post("/need/options", json={"purpose": "hoc_phi", "amount_band": "duoi_5tr"})
    opts = r.json()["options"]
    assert opts and opts[0]["kind"] == "no_loan"


def test_draft_message():
    r = client.post("/messages/draft", json={"alt_id": "tien_nha_xin_lui", "values": {"ten_nguoi_nhan": "cô Lan"}})
    assert "cô Lan" in r.json()["text"]

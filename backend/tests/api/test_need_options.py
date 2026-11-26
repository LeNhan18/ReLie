import pytest
from fastapi.testclient import TestClient

from antam.main import app
from antam.services import need

client = TestClient(app)


@pytest.mark.parametrize(
    ("purpose", "specific_options"),
    [
        ("hoc_phi", {"hoc_phi_xin_lui", "hoc_phi_hoi_ho_tro"}),
        ("tien_nha", {"tien_nha_xin_lui", "tien_nha_chia_nho"}),
        ("vien_phi", {"vien_phi_chia_nho", "vien_phi_hoi_bao_hiem"}),
        ("tra_no_cu", {"tra_no_cu_hoi_lich_tra"}),
        ("khac", set()),
    ],
)
def test_need_options_match_purpose(purpose, specific_options):
    response = client.post("/need/options", json={
        "purpose": purpose, "amount_band": "duoi_5tr", "has_salary": False,
    })
    assert response.status_code == 200
    options = response.json()["options"]
    assert {item["option_id"] for item in options if item["kind"] == "no_loan"} == (
        specific_options | {"ho_tro_khan_cap_dia_phuong", "nho_nguoi_than_ho_tro"}
    )


@pytest.mark.parametrize(("salary_profile", "fit"), [({}, "co_the"), ({"has_salary": True}, "cao")])
def test_salary_advance_kept_when_eligible_or_unknown(salary_profile, fit):
    response = client.post("/need/options", json={"purpose": "khac", "amount_band": "duoi_5tr", **salary_profile})
    assert response.status_code == 200
    advance = next(item for item in response.json()["options"] if item["option_id"] == "ung_luong")
    assert advance["fit"] == fit


def test_non_loan_options_precede_lending_channels(monkeypatch):
    data = need.seed()
    channel = {
        "channel_id": "fictional_fixture", "name": "Kênh thử nghiệm hư cấu", "apr_min_pct": "4",
        "apr_max_pct": "6", "speed": "Tùy hồ sơ", "needs_salary": "true",
    }
    monkeypatch.setattr(need, "seed", lambda: {**data, "loan_channels": [channel]})
    profile = {"purpose": "khac", "amount_band": "duoi_5tr", "has_salary": True}
    response = client.post("/need/options", json=profile)
    assert response.status_code == 200
    options = response.json()["options"]
    assert options[-1]["option_id"] == "fictional_fixture"
    assert all(item["kind"] == "no_loan" for item in options[:-1])
    profile["has_salary"] = False
    response = client.post("/need/options", json=profile)
    assert response.status_code == 200
    assert all(item["kind"] == "no_loan" for item in response.json()["options"])


@pytest.mark.parametrize("alt_id", [
    "hoc_phi_hoi_ho_tro", "tien_nha_chia_nho", "vien_phi_hoi_bao_hiem", "tra_no_cu_hoi_lich_tra",
    "ho_tro_khan_cap_dia_phuong", "nho_nguoi_than_ho_tro",
])
def test_new_templates_render_with_shared_draft_fields(alt_id):
    response = client.post("/messages/draft", json={
        "alt_id": alt_id, "values": {"ten_nguoi_nhan": "chị Lan", "han_moi": "05/12/2026"},
    })
    assert response.status_code == 200
    draft = response.json()["text"]
    assert "chị Lan" in draft and "05/12/2026" in draft
    assert "..." not in draft

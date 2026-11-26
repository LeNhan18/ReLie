import pytest
from fastapi.testclient import TestClient

from antam.main import app
from antam.routers import loan

client = TestClient(app)


@pytest.mark.parametrize(("data", "status", "detail"), [
    ({}, 422, "Vui lòng gửi đúng một ảnh, nội dung hoặc mã mẫu khoản vay"),
    ({"text": "   "}, 422, "Vui lòng gửi đúng một ảnh, nội dung hoặc mã mẫu khoản vay"),
    ({"text": "Nội dung mẫu", "sample_id": "xanhcash"}, 422,
     "Vui lòng gửi đúng một ảnh, nội dung hoặc mã mẫu khoản vay"),
    ({"sample_id": "khong_ton_tai"}, 404, "Không tìm thấy mẫu khoản vay"),
    ({"sample_id": "mã/mẫu"}, 422, "Mã mẫu không hợp lệ"),
])
def test_extract_rejects_invalid_requests(data, status, detail):
    response = client.post("/loan/extract", data=data)
    assert response.status_code == status
    assert response.json() == {"detail": detail}


@pytest.mark.parametrize(("content", "status"), [(b"", 422), (b"x", 422), (b"xx", 413)])
def test_extract_image_size_limits(monkeypatch, content, status):
    monkeypatch.setattr(loan, "MAX_IMAGE_BYTES", 1)
    response = client.post("/loan/extract", files={"file": ("mau.jpg", content, "image/jpeg")})
    assert response.status_code == status
    if status != 200:
        assert isinstance(response.json()["detail"], str)


@pytest.mark.parametrize("text", ["Văn bản mới không phải mẫu XanhCash", "Một hợp đồng khác của người dùng"])
def test_mock_never_returns_xanhcash_for_new_user_text(text):
    response = client.post("/loan/extract", data={"text": text})
    assert response.status_code == 422
    assert "terms" not in response.json()
    assert "chưa được bật" in response.json()["detail"]


def test_mock_never_returns_sample_for_uploaded_file():
    response = client.post("/loan/extract", files={"file": ("new-contract.png", b"new-file", "image/png")})
    assert response.status_code == 422
    assert "terms" not in response.json()
    assert "mẫu có sẵn" in response.json()["detail"]

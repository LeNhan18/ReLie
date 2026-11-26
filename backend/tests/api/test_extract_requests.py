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


@pytest.mark.parametrize(("content", "status"), [(b"", 422), (b"x", 200), (b"xx", 413)])
def test_extract_image_size_limits(monkeypatch, content, status):
    monkeypatch.setattr(loan, "MAX_IMAGE_BYTES", 1)
    response = client.post("/loan/extract", files={"file": ("mau.jpg", content, "image/jpeg")})
    assert response.status_code == status
    if status != 200:
        assert isinstance(response.json()["detail"], str)

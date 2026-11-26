import io
import json
import sys
from dataclasses import replace
from threading import Lock
from types import SimpleNamespace
from urllib.error import HTTPError

import pytest
from fastapi.testclient import TestClient

from antam.ai import extract, groq_client, paddle_local, write
from antam.ai.errors import AIUnavailable, OCRInputError
from antam.main import app


@pytest.fixture
def local_pipeline(monkeypatch):
    calls = []
    image = object()
    def predict(value, **kwargs):
        calls.append((value, kwargs))
        yield SimpleNamespace(markdown={"markdown_texts": "Nội dung OCR HƯ CẤU"})
    monkeypatch.setattr(paddle_local, "_pipeline", SimpleNamespace(predict=predict))
    monkeypatch.setattr(paddle_local, "_lock", Lock())
    monkeypatch.setattr(paddle_local, "_decode_image", lambda raw: image)
    return calls, image


def test_local_ocr_passes_memory_image_and_reads_markdown(local_pipeline):
    calls, image = local_pipeline
    assert paddle_local.read_image(b"fixture") == "Nội dung OCR HƯ CẤU"
    assert calls == [(image, {"use_queues": False, "max_new_tokens": 4096})]


def test_official_pipeline_is_explicitly_version_16(monkeypatch):
    kwargs_seen = {}
    def factory(**kwargs):
        kwargs_seen.update(kwargs)
        return object()
    monkeypatch.setitem(sys.modules, "paddleocr", SimpleNamespace(PaddleOCRVL=factory))
    paddle_local._new_pipeline()
    assert kwargs_seen["pipeline_version"] == "v1.6"
    assert kwargs_seen["device"] == paddle_local.settings.paddle_device


def test_busy_ocr_rejected_without_second_inference(local_pipeline):
    paddle_local._lock.acquire()
    try:
        with pytest.raises(AIUnavailable, match="đang xử lý"):
            paddle_local.read_image(b"fixture")
        assert not local_pipeline[0]
    finally:
        paddle_local._lock.release()


@pytest.mark.parametrize("markdown, error", [({}, AIUnavailable), ({"markdown_texts": ""}, OCRInputError),
                                             ({"markdown_texts": "x" * 50_001}, OCRInputError)])
def test_invalid_empty_or_oversized_ocr_is_not_success(local_pipeline, monkeypatch, markdown, error):
    monkeypatch.setattr(paddle_local, "_pipeline", SimpleNamespace(
        predict=lambda *args, **kwargs: iter([SimpleNamespace(markdown=markdown)]),
    ))
    with pytest.raises(error):
        paddle_local.read_image(b"fixture")
    assert not paddle_local._lock.locked()


def test_paddle_routes_ocr_text_to_groq_without_image(monkeypatch):
    monkeypatch.setattr(extract, "settings", replace(extract.settings, ai_mode="paddle_groq", groq_api_key="fake"))
    monkeypatch.setattr(extract, "read_image", lambda raw: "Văn bản HƯ CẤU từ Paddle")
    calls = []
    def llm(system, text):
        calls.append(text)
        return {"amount_received": {"value": 3_000_000, "confidence": 0.9}}
    monkeypatch.setattr(extract, "groq_json", llm)
    monkeypatch.setattr(extract, "converse_json", lambda *args: pytest.fail("Không được gọi Bedrock"))
    result = extract.extract_terms(image_bytes=b"image-fixture")
    assert result.amount_received.value == 3_000_000
    assert calls == ["Văn bản HƯ CẤU từ Paddle"]


def test_missing_llm_key_fails_before_loading_ocr(monkeypatch):
    monkeypatch.setattr(extract, "settings", replace(extract.settings, ai_mode="paddle_groq", groq_api_key=""))
    monkeypatch.setattr(extract, "read_image", lambda raw: pytest.fail("Chưa có LLM key không tải model"))
    response = TestClient(app).post("/loan/extract", files={"file": ("fixture.jpg", b"fixture", "image/jpeg")})
    assert response.status_code == 422
    assert "chưa sẵn sàng" in response.json()["detail"]
    assert "GROQ_API_KEY" not in response.json()["detail"]


def test_invalid_schema_retries_once_without_copying_error_values(monkeypatch):
    monkeypatch.setattr(extract, "settings", replace(extract.settings, ai_mode="paddle_groq", groq_api_key="fake"))
    calls = []
    def invalid(system, text):
        calls.append(text)
        return {"amount_received": {"value": "sensitive-invalid-model-value", "confidence": 0.9}}
    monkeypatch.setattr(extract, "groq_json", invalid)
    with pytest.raises(AIUnavailable):
        extract.extract_terms(text="Văn bản HƯ CẤU")
    assert len(calls) == 2
    assert "sensitive-invalid-model-value" not in calls[1]


def test_writer_uses_groq_and_judge_rejects_unsupported_claim(monkeypatch):
    monkeypatch.setattr(write, "settings", replace(write.settings, ai_mode="paddle_groq"))
    monkeypatch.setattr(write, "groq_json", lambda *args, **kwargs: {"text": "Chắc chắn được duyệt 999999 đồng"})
    assert write.explain(100, 110, 30, []) == write.template_explanation(100, 110, 30, [])


@pytest.mark.parametrize("finish_reason", ["stop", "length"])
def test_groq_request_is_text_only_json_and_rejects_truncation(monkeypatch, finish_reason):
    monkeypatch.setattr(groq_client, "settings", replace(groq_client.settings, groq_api_key="fake-secret"))
    calls = []
    def open_request(request, timeout):
        calls.append(request)
        data = {"choices": [{"finish_reason": finish_reason, "message": {"content": '{"text": "ok"}'}}]}
        return io.BytesIO(json.dumps(data).encode())
    monkeypatch.setattr(groq_client, "build_opener", lambda *args: SimpleNamespace(open=open_request))
    if finish_reason == "length":
        with pytest.raises(AIUnavailable, match="cắt ngắn"):
            groq_client.groq_json("system", "text")
    else:
        assert groq_client.groq_json("system", "text") == {"text": "ok"}
    body = json.loads(calls[0].data)
    assert body["model"] == "openai/gpt-oss-120b"
    assert body["response_format"] == {"type": "json_object"}
    assert all(isinstance(message["content"], str) for message in body["messages"])


def test_groq_upstream_error_does_not_expose_secret_or_content(monkeypatch):
    monkeypatch.setattr(groq_client, "settings", replace(groq_client.settings, groq_api_key="fake-secret"))
    def fail(*args, **kwargs):
        raise HTTPError("https://api.groq.com/", 429, "private", {}, io.BytesIO(b"private-content"))
    monkeypatch.setattr(groq_client, "build_opener", lambda *args: SimpleNamespace(open=fail))
    with pytest.raises(AIUnavailable) as exc:
        groq_client.groq_json("system", "private-document")
    assert "private" not in str(exc.value) and "fake-secret" not in str(exc.value)


def test_secret_not_in_settings_repr():
    assert "fake-secret" not in repr(replace(groq_client.settings, groq_api_key="fake-secret"))


@pytest.mark.parametrize("data", [None, [], {"choices": [None]}, {"choices": []},
                                {"choices": [{"finish_reason": "stop", "message": None}]}])
def test_malformed_groq_response_is_safe_service_error(monkeypatch, data):
    monkeypatch.setattr(groq_client, "settings", replace(groq_client.settings, groq_api_key="fake-secret"))
    monkeypatch.setattr(groq_client, "build_opener", lambda *args: SimpleNamespace(
        open=lambda *args, **kwargs: io.BytesIO(json.dumps(data).encode()),
    ))
    with pytest.raises(AIUnavailable):
        groq_client.groq_json("system", "fixture")


def test_decoder_preserves_bgr_without_file_output():
    image_module = pytest.importorskip("PIL.Image")
    pytest.importorskip("numpy")
    image = image_module.new("RGB", (2, 2), (10, 20, 30))
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    decoded = paddle_local._decode_image(buffer.getvalue())
    assert decoded.shape == (2, 2, 3)
    assert decoded[0, 0].tolist() == [30, 20, 10]


def test_decoder_rejects_oversized_pixels_before_inference(monkeypatch):
    image_module = pytest.importorskip("PIL.Image")
    pytest.importorskip("numpy")
    buffer = io.BytesIO()
    image_module.new("RGB", (2, 2)).save(buffer, format="PNG")
    monkeypatch.setattr(paddle_local, "MAX_PIXELS", 1)
    with pytest.raises(OCRInputError, match="độ phân giải"):
        paddle_local._decode_image(buffer.getvalue())


def test_decoder_rejects_non_image_bytes():
    pytest.importorskip("PIL.Image")
    pytest.importorskip("numpy")
    with pytest.raises(OCRInputError, match="Không đọc được ảnh"):
        paddle_local._decode_image(b"not-an-image")

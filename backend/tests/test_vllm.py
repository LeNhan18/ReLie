import io
import json
from dataclasses import replace
from types import SimpleNamespace

import pytest

from antam.ai import extract, groq_client, vllm_client, write
from antam.ai.errors import AIUnavailable


@pytest.fixture
def vllm_settings(monkeypatch):
    for module in (extract, vllm_client, write):
        monkeypatch.setattr(module, "settings", replace(
            module.settings, ai_mode="paddle_vllm", llm_provider="vllm",
            llm_base_url="http://100.64.0.10:8000/v1", llm_model_name="qwen2.5-7b", llm_api_key="",
        ))


def test_vllm_request_uses_configured_endpoint_model_and_max_tokens(vllm_settings, monkeypatch):
    calls = []
    def open_request(request, timeout):
        calls.append(request)
        return io.BytesIO(json.dumps({"choices": [{
            "finish_reason": "stop", "message": {"content": '{"ok": true}'},
        }]}).encode())
    monkeypatch.setattr(groq_client, "build_opener", lambda *args: SimpleNamespace(open=open_request))
    assert vllm_client.vllm_json("JSON system", "fictional text") == {"ok": True}
    assert calls[0].full_url == "http://100.64.0.10:8000/v1/chat/completions"
    assert calls[0].get_header("Authorization") is None
    payload = json.loads(calls[0].data)
    assert payload["model"] == "qwen2.5-7b"
    assert payload["max_tokens"] == 1500 and "max_completion_tokens" not in payload


@pytest.mark.parametrize("url", ["", "http\\://100.79.95.2:8000/v1\\", "file:///v1",
                                "http://user:password@server/v1", "http://server/v1?q=x",
                                "http://server/v1#fragment", "http://server/other", "http://server:bad/v1"])
def test_bad_configuration_rejected(vllm_settings, monkeypatch, url):
    monkeypatch.setattr(vllm_client, "settings", replace(vllm_client.settings, llm_base_url=url))
    with pytest.raises(AIUnavailable):
        vllm_client.validate_configuration()


def test_extract_uses_paddle_then_vllm_without_groq_or_aws(vllm_settings, monkeypatch):
    monkeypatch.setattr(extract, "read_image", lambda raw: "Fictional OCR terms")
    monkeypatch.setattr(extract, "groq_json", lambda *args: pytest.fail("Groq forbidden"))
    monkeypatch.setattr(extract, "converse_json", lambda *args: pytest.fail("AWS forbidden"))
    seen = []
    def completion(system, text):
        seen.append(text)
        return {"amount_received": {"value": 2000000, "confidence": 0.9}}
    monkeypatch.setattr(extract, "vllm_json", completion)
    assert extract.extract_terms(image_bytes=b"fictional-image").amount_received.value == 2000000
    assert seen == ["Fictional OCR terms"]


def test_writer_keeps_judge_for_vllm(vllm_settings, monkeypatch):
    monkeypatch.setattr(write, "vllm_json", lambda *args, **kwargs: {"text": "Chắc chắn được duyệt 999999 đồng"})
    assert write.explain(100, 110, 30, []) == write.template_explanation(100, 110, 30, [])

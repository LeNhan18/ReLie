import os

import pytest

from antam.run_live import configure


def test_live_launcher_overrides_mock_and_preserves_secret_and_custom_cache(monkeypatch):
    for name in ("AI_MODE", "LLM_PROVIDER", "LLM_BASE_URL", "LLM_MODEL_NAME", "PADDLE_DEVICE",
                 "PADDLE_PDX_CACHE_HOME", "HF_HOME", "MODELSCOPE_CACHE"):
        monkeypatch.delenv(name, raising=False)
    monkeypatch.setenv("AI_MODE", "mock")
    monkeypatch.setenv("LLM_API_KEY", "test-only-key")
    monkeypatch.setenv("HF_HOME", "custom-model-cache")
    configure("http://localhost:8080/v1/", "served-model", "cpu")
    assert os.environ["AI_MODE"] == "paddle_vllm"
    assert os.environ["LLM_PROVIDER"] == "vllm"
    assert os.environ["LLM_BASE_URL"] == "http://localhost:8080/v1"
    assert os.environ["LLM_MODEL_NAME"] == "served-model"
    assert os.environ["PADDLE_DEVICE"] == "cpu"
    assert os.environ["LLM_API_KEY"] == "test-only-key"
    assert os.environ["HF_HOME"] == "custom-model-cache"
    assert os.environ["PADDLE_PDX_CACHE_HOME"].endswith("paddlex")


@pytest.mark.parametrize("url", ["", "http://server/other", "http://user:secret@server/v1",
                                "http://server:bad/v1", "http://server/v1?q=x", "http://server/v1\\"])
def test_invalid_live_configuration_does_not_change_mode(monkeypatch, url):
    monkeypatch.setenv("AI_MODE", "mock")
    with pytest.raises(ValueError):
        configure(url, "qwen2.5-7b", "gpu:0")
    assert os.environ["AI_MODE"] == "mock"

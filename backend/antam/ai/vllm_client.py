"""vLLM tự host tương thích OpenAI; endpoint chỉ lấy từ cấu hình backend."""

from urllib.parse import urlsplit

from antam.ai.errors import AIUnavailable
from antam.ai.groq_client import completion_json
from antam.config import settings


def validate_configuration() -> str:
    base = settings.llm_base_url.rstrip("/")
    try:
        parts = urlsplit(base)
        valid = (
            settings.llm_provider == "vllm" and bool(settings.llm_model_name.strip())
            and parts.scheme in {"http", "https"} and bool(parts.hostname)
            and not parts.username and not parts.password and not parts.query and not parts.fragment
            and parts.path == "/v1" and not any(c.isspace() or c == "\\" for c in base)
            and (parts.port is None or 1 <= parts.port <= 65535)
        )
    except ValueError:
        valid = False
    if not valid:
        raise AIUnavailable("Kết nối AI chưa được cấu hình hợp lệ; vui lòng thử lại sau.")
    return base + "/chat/completions"


def vllm_json(system: str, text: str, max_tokens: int = 1500) -> dict:
    return completion_json(
        system, text, max_tokens, endpoint=validate_configuration(), model=settings.llm_model_name,
        api_key=settings.llm_api_key, token_parameter="max_tokens", timeout=120,
    )

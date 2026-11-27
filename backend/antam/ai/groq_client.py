"""API LLM cho chữ OCR; không truyền ảnh gốc, không log nội dung hay khóa."""

import json
from urllib.error import HTTPError, URLError
from urllib.request import HTTPRedirectHandler, Request, build_opener

from antam.ai.errors import AIUnavailable
from antam.ai.extraction_budget import TIMEOUT_MESSAGE, check_deadline, remaining_timeout
from antam.config import settings


class _NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def groq_json(system: str, text: str, max_tokens: int = 1500) -> dict:
    if not settings.groq_api_key:
        raise AIUnavailable("Chức năng hỗ trợ AI chưa sẵn sàng; vui lòng thử lại sau.")
    return completion_json(
        system, text, max_tokens, endpoint="https://api.groq.com/openai/v1/chat/completions",
        model=settings.groq_model, api_key=settings.groq_api_key,
    )


def completion_json(system: str, text: str, max_tokens: int, *, endpoint: str,
                    model: str, api_key: str = "", token_parameter: str = "max_completion_tokens",
                    timeout: int = 30) -> dict:
    """Transport dùng chung cho hai provider đã được backend cấu hình, không nhận URL từ request."""
    if len(text) > 50_000:
        raise AIUnavailable("Văn bản quá dài cho lượt trích xuất; vui lòng chia nhỏ tài liệu.")
    payload = {
        "model": model, "temperature": 0, token_parameter: max_tokens,
        "response_format": {"type": "json_object"},
        "messages": [{"role": "system", "content": system}, {"role": "user", "content": text}],
    }
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    request = Request(
        endpoint, data=json.dumps(payload).encode(), headers=headers,
        method="POST",
    )
    try:
        with build_opener(_NoRedirect()).open(request, timeout=remaining_timeout(timeout)) as response:
            raw = response.read(500_001)
        check_deadline()
        if len(raw) > 500_000:
            raise AIUnavailable("Phản hồi LLM quá lớn.")
        data = json.loads(raw)
        choices = data.get("choices") if isinstance(data, dict) else None
        if not isinstance(choices, list) or not choices or not isinstance(choices[0], dict):
            raise AIUnavailable("LLM trả cấu trúc phản hồi không hợp lệ.")
        choice = choices[0]
        if choice.get("finish_reason") != "stop":
            raise AIUnavailable("LLM chưa hoàn tất câu trả lời; không dùng kết quả bị cắt ngắn.")
        message = choice.get("message")
        if not isinstance(message, dict) or not isinstance(message.get("content"), str):
            raise AIUnavailable("LLM chưa trả được nội dung văn bản hợp lệ.")
        text_result = message["content"]
        result = json.loads(text_result)
        if not isinstance(result, dict):
            raise AIUnavailable("LLM chưa trả được JSON hợp lệ.")
        return result
    except HTTPError as exc:
        limited = exc.code == 429
        exc.close()
        raise AIUnavailable("LLM đang hết hạn mức; thử lại sau." if limited else "Chưa kết nối được LLM.") from None
    except TimeoutError:
        raise AIUnavailable(TIMEOUT_MESSAGE) from None
    except URLError as exc:
        if isinstance(exc.reason, TimeoutError):
            raise AIUnavailable(TIMEOUT_MESSAGE) from None
        raise AIUnavailable("Chưa kết nối được AI đọc điều khoản; vui lòng thử lại sau.") from None
    except (OSError, ValueError, KeyError, IndexError, TypeError):
        raise AIUnavailable("LLM chưa trả được kết quả hợp lệ; vui lòng thử lại.") from None

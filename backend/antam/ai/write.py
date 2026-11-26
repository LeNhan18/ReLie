"""Viết lời giải thích từ số liệu tool + quy tắc đã bật. Không được thêm con số mới."""

from __future__ import annotations

from antam.ai.bedrock_client import converse_json, load_prompt
from antam.ai.groq_client import groq_json
from antam.ai.judge import check, numbers_in
from antam.ai.vllm_client import vllm_json
from antam.config import settings


def _fmt_vnd(n: int) -> str:
    return f"{n:,}".replace(",", ".") + "đ"


def template_explanation(received: int, repaid: int, term_days: int, messages: list[str]) -> str:
    head = (
        f"Bạn nhận {_fmt_vnd(received)}. Tổng tiền phải trả là {_fmt_vnd(repaid)} "
        f"trong kỳ hạn {term_days} ngày theo lịch trả đã xác nhận."
    )
    return " ".join([head, *messages])


def explain(received: int, repaid: int, term_days: int, messages: list[str]) -> str:
    base = template_explanation(received, repaid, term_days, messages)
    if settings.ai_mode == "mock":
        return base
    try:
        if settings.ai_mode == "paddle_vllm":
            out = vllm_json(load_prompt("write_explanation"), base, max_tokens=400)
        elif settings.ai_mode == "paddle_groq":
            out = groq_json(load_prompt("write_explanation"), base, max_tokens=400)
        elif settings.ai_mode == "bedrock":
            out = converse_json(settings.bedrock_model_write, load_prompt("write_explanation"), base, max_tokens=400)
        else:
            return base
        text = str(out.get("text") or "")
        # Judge: mọi con số trong lời LLM phải có trong bản template do tool tạo ra
        return text if text and not check(text, numbers_in(base)) else base
    except Exception:
        return base  # luôn có câu trả lời dựa trên template nếu model lỗi

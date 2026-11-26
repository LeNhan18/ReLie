"""VLM trích xuất điều khoản khoản vay → LoanTerms (kèm độ tin cậy)."""

from __future__ import annotations

import re

from pydantic import ValidationError

from antam.ai.bedrock_client import converse_json, load_prompt
from antam.ai.errors import AIUnavailable
from antam.ai.groq_client import groq_json
from antam.ai.paddle_local import read_image
from antam.config import settings
from antam.schemas.loan import LoanTerms


class InvalidSampleId(ValueError):
    pass


class SampleNotFound(ValueError):
    pass


def extract_terms(image_bytes: bytes | None = None, text: str | None = None, sample_id: str | None = None) -> LoanTerms:
    if sample_id:
        sid = sample_id
        if not re.fullmatch(r"[a-z0-9_-]{1,64}", sid):
            raise InvalidSampleId("Mã mẫu không hợp lệ")
        path = settings.samples_dir / f"{sid}.terms.json"
        try:
            sample = path.read_text(encoding="utf-8")
        except FileNotFoundError as exc:
            raise SampleNotFound("Không tìm thấy mẫu khoản vay") from exc
        return LoanTerms.model_validate_json(sample)

    if settings.ai_mode == "mock":
        raise AIUnavailable(
            "Chức năng đọc tài liệu thật chưa được bật. Bạn có thể chọn mẫu có sẵn hoặc tự nhập số liệu.",
        )
    if settings.ai_mode not in {"bedrock", "paddle_groq"}:
        raise AIUnavailable("AI_MODE không được hỗ trợ; chưa gọi model.")
    if settings.ai_mode == "paddle_groq":
        if not settings.groq_api_key:
            raise AIUnavailable("Chức năng đọc hợp đồng chưa sẵn sàng; vui lòng nhập số liệu hoặc thử lại sau.")
        if image_bytes is not None:
            text = read_image(image_bytes)
        if not text or not text.strip():
            raise AIUnavailable("Chưa có văn bản để trích xuất khoản vay.")
    system = load_prompt("extract_loan_terms")
    user_text = text or "Trích xuất điều khoản từ ảnh hợp đồng/màn hình app vay đính kèm."
    for _attempt in range(2):  # retry 1 lần nếu sai schema
        raw = (groq_json(system, user_text) if settings.ai_mode == "paddle_groq" else
               converse_json(settings.bedrock_model_extract, system, user_text, image_bytes))
        try:
            return LoanTerms.model_validate(raw)
        except ValidationError:
            user_text = f"{user_text}\n\nLần trước trả sai schema. Trả lại đúng kiểu và ràng buộc JSON schema."
    raise AIUnavailable("Model không trả được điều khoản khoản vay hợp lệ sau 2 lần.")

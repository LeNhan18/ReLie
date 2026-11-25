"""VLM trích xuất điều khoản khoản vay → LoanTerms (kèm độ tin cậy)."""

from __future__ import annotations

import re

from pydantic import ValidationError

from antam.ai.bedrock_client import converse_json, load_prompt
from antam.config import settings
from antam.schemas.loan import LoanTerms


class InvalidSampleId(ValueError):
    pass


class SampleNotFound(ValueError):
    pass


def extract_terms(image_bytes: bytes | None = None, text: str | None = None, sample_id: str | None = None) -> LoanTerms:
    if settings.ai_mode == "mock" or sample_id:
        sid = sample_id or "xanhcash"
        if not re.fullmatch(r"[a-z0-9_-]{1,64}", sid):
            raise InvalidSampleId("Mã mẫu không hợp lệ")
        path = settings.samples_dir / f"{sid}.terms.json"
        try:
            sample = path.read_text(encoding="utf-8")
        except FileNotFoundError as exc:
            raise SampleNotFound("Không tìm thấy mẫu khoản vay") from exc
        return LoanTerms.model_validate_json(sample)

    system = load_prompt("extract_loan_terms")
    user_text = text or "Trích xuất điều khoản từ ảnh hợp đồng/màn hình app vay đính kèm."
    for _attempt in range(2):  # retry 1 lần nếu sai schema
        raw = converse_json(settings.bedrock_model_extract, system, user_text, image_bytes)
        try:
            return LoanTerms.model_validate(raw)
        except ValidationError as e:
            user_text = f"{user_text}\n\nLần trước trả sai schema: {e.errors()[:3]}. Trả lại đúng JSON schema."
    raise ValueError("VLM không trả được LoanTerms hợp lệ sau 2 lần")

"""Phân loại trạng thái bằng từ khóa, không gọi AI hay lưu nội dung đầu vào."""

import re
import unicodedata
from typing import Literal

UserState = Literal["chua_biet", "do_du", "quyet_tam_vay", "da_vay", "bi_doi_no"]

# Ưu tiên tình huống đang xảy ra trước ý định vay mới.
_RULES: tuple[tuple[UserState, tuple[str, ...]], ...] = (
    ("bi_doi_no", ("đòi nợ", "đòi tiền nợ", "đe dọa", "khủng bố", "ép trả nợ", "gọi người thân đòi tiền")),
    ("da_vay", ("đã vay", "vay rồi", "đang vay", "đã nhận tiền vay", "đã giải ngân", "đang trả góp",
                "đang trả nợ", "đã ký hợp đồng vay", "tiền vay đã về", "đã về tài khoản")),
    ("quyet_tam_vay", ("quyết tâm vay", "quyết định vay", "nhất định vay", "sẽ vay", "vẫn vay", "chốt vay")),
    ("do_du", ("do dự", "phân vân", "cân nhắc", "lưỡng lự", "có nên vay", "chưa chắc", "không chắc", "sợ lãi",
               "ngại phí cao", "lo không đủ tiền trả")),
)

_NEGATED_PREFIX = re.compile(
    r"\b(?:khong|chua|chua tung|khong he|chua chac|khong chac|so|lo|neu|gia su)(?: (?:bi|se|minh|toi|phai))* $"
)
_HYPOTHETICAL_PREFIX = re.compile(r"\b(?:neu|gia su)\b")
_REPORTED_PREFIX = re.compile(r"\b(?:nghe ke|nghe noi)\b")
_LOAN_CONTEXT = re.compile(r"\b(?:vay|giai ngan|tra no|tra gop)\b")


def _normalize(text: str) -> str:
    text = unicodedata.normalize("NFD", text.casefold()).replace("đ", "d")
    text = "".join(char for char in text if unicodedata.category(char) != "Mn")
    return re.sub(r"[^a-z0-9]+", " ", text).strip()


def classify_state(text: str) -> UserState:
    """Trả một trong năm trạng thái; thiếu tín hiệu thì `chua_biet`.

    Nhận cả tiếng Việt có dấu và không dấu. Bỏ qua từ khóa ngay sau
    phủ định/giả định đơn giản; đây là bộ quy tắc, không hiểu mọi ngữ cảnh.
    """
    clauses = [_normalize(clause) for clause in re.split(r"[.!?;,\n]+|\b(?:nhưng|nhung)\b", text.casefold())]
    for state, keywords in _RULES:
        for keyword in keywords:
            pattern = rf"\b{re.escape(_normalize(keyword))}\b"
            for clause in clauses:
                if keyword == "đã về tài khoản" and not _LOAN_CONTEXT.search(clause):
                    continue
                for match in re.finditer(pattern, clause):
                    prefix = clause[:match.start()]
                    if not any(rule.search(prefix) for rule in
                               (_NEGATED_PREFIX, _HYPOTHETICAL_PREFIX, _REPORTED_PREFIX)):
                        return state
    return "chua_biet"

"""Kiểm tra câu trả lời trước khi hiển thị. Phần kiểm tra số liệu làm bằng code, không bằng LLM."""

from __future__ import annotations

import re

_FORBIDDEN = ["vi phạm pháp luật", "chắc chắn được duyệt", "nên quỵt", "không cần trả"]


def numbers_in(text: str) -> set[int]:
    out = set()
    for m in re.findall(r"\d[\d.,]*", text):
        digits = re.sub(r"[.,]", "", m)
        if digits.isdigit():
            out.add(int(digits))
    return out


def check(text: str, allowed_numbers: set[int]) -> list[str]:
    """Trả danh sách lỗi; rỗng = đạt. allowed_numbers gồm mọi số do tool tính (đã làm tròn)."""
    problems = []
    stray = {n for n in numbers_in(text) if n > 31 and n not in allowed_numbers}
    if stray:
        problems.append(f"Số không có nguồn từ tool: {sorted(stray)}")
    low = text.lower()
    problems += [f"Cụm từ cấm: '{p}'" for p in _FORBIDDEN if p in low]
    return problems

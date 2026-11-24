"""Đối chiếu tên bên cho vay với danh sách tổ chức được cấp phép (data/seed/lenders.csv)."""

from __future__ import annotations

import difflib
import re
import unicodedata
from dataclasses import dataclass

_LEGAL_PREFIXES = [
    "cong ty tai chinh", "cong ty tnhh mtv", "cong ty tnhh", "cong ty co phan", "ctcp", "cong ty",
    "ngan hang tmcp", "ngan hang thuong mai co phan", "ngan hang", "tnhh mtv", "tnhh", "mtv",
    "to chuc tai chinh vi mo",
]


def normalize(name: str) -> str:
    s = unicodedata.normalize("NFD", name.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn").replace("đ", "d")
    s = re.sub(r"[^a-z0-9 ]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    changed = True
    while changed:  # bóc lần lượt mọi tiền tố pháp lý: "cong ty tai chinh tnhh mtv ..." → "..."
        changed = False
        for prefix in sorted(_LEGAL_PREFIXES, key=len, reverse=True):
            if s.startswith(prefix + " "):
                s = s[len(prefix) + 1:]
                changed = True
                break
    return s.strip()


@dataclass(frozen=True)
class Lender:
    name: str
    lender_type: str  # ngan_hang | cty_tai_chinh | vi_mo | quy_tin_dung
    source: str


@dataclass(frozen=True)
class LicenseResult:
    status: str  # "credit_institution" | "not_found" | "ambiguous"
    matched: Lender | None
    candidates: list[Lender]


def check_license(name: str, lenders: list[Lender], threshold: float = 0.9) -> LicenseResult:
    target = normalize(name)
    if not target:
        return LicenseResult("not_found", None, [])
    scored = []
    for lender in lenders:
        score = difflib.SequenceMatcher(None, target, normalize(lender.name)).ratio()
        if score >= threshold:
            scored.append((score, lender))
    scored.sort(key=lambda x: x[0], reverse=True)
    if not scored:
        return LicenseResult("not_found", None, [])
    if len(scored) > 1 and scored[0][0] - scored[1][0] < 0.02:
        return LicenseResult("ambiguous", None, [x for _, x in scored[:3]])
    return LicenseResult("credit_institution", scored[0][1], [])

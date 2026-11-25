"""Luồng "Tôi cần tiền gấp": phương án không cần vay trước, kênh vay hợp pháp sau."""

from __future__ import annotations

from antam.schemas.need import NeedOptions, NeedProfile, Option
from antam.seed import seed


def _truthy(v: str) -> bool:
    return str(v).strip().lower() in {"1", "true", "yes", "co", "có"}


def _fit(ch: dict, p: NeedProfile) -> str | None:
    """None = chắc chắn không đủ điều kiện (loại). Còn lại: cao / co_the / kho."""
    if _truthy(ch.get("needs_salary", "")) and p.has_salary is False:
        return None
    if _truthy(ch.get("needs_asset", "")) and p.has_asset is False:
        return None
    if p.bad_debt == "co" and not _truthy(ch.get("accepts_bad_debt", "")):
        return "kho"
    unknown = p.has_salary is None or p.has_asset is None or p.bad_debt in (None, "khong_biet")
    return "co_the" if unknown else "cao"


def options_for(p: NeedProfile) -> NeedOptions:
    s = seed()
    out: list[Option] = []
    for a in s["alternatives"]:
        if a["purpose"] not in (p.purpose, "any"):
            continue
        needs_salary = a.get("needs_salary", False)
        if needs_salary and p.has_salary is False:
            continue
        out.append(Option(kind="no_loan", option_id=a["alt_id"], title=a["title"],
                          cost_note=a.get("cost_note", "0đ"), speed=a["speed"],
                          fit="co_the" if needs_salary and p.has_salary is None else "cao"))
    ranked = []
    for ch in s["loan_channels"]:
        fit = _fit(ch, p)
        if fit is None:
            continue
        ranked.append((fit != "cao", float(ch.get("apr_min_pct") or 999), ch, fit))
    for _, _, ch, fit in sorted(ranked, key=lambda x: (x[0], x[1]))[:3]:
        out.append(Option(kind="loan_channel", option_id=ch["channel_id"], title=ch["name"],
                          cost_note=f"Khoảng {ch['apr_min_pct']}–{ch['apr_max_pct']}%/năm (theo biểu phí công khai)",
                          speed=ch["speed"], fit=fit, source_url=ch.get("url"), updated_at=ch.get("last_verified")))
    note = "Ước tính từ thông tin công khai. Kết quả duyệt do bên cho vay quyết định."
    return NeedOptions(options=out, note=note)

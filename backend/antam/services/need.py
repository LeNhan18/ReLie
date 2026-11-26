"""Luồng "Tôi cần tiền gấp": phương án không cần vay trước, kênh vay hợp pháp sau."""

from __future__ import annotations

from antam.schemas.need import NeedOptions, NeedProfile, Option
from antam.seed import seed
from antam.services.live_lending import discover_loan_options


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
    live = discover_loan_options(p)
    out.extend(live.options)
    note = live.note + " Kết quả duyệt và lãi suất cá nhân do bên cho vay quyết định."
    return NeedOptions(options=out, note=note)

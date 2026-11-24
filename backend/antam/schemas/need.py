from __future__ import annotations

from datetime import date
from typing import Literal

from pydantic import BaseModel


class NeedProfile(BaseModel):
    purpose: Literal["hoc_phi", "tien_nha", "vien_phi", "tra_no_cu", "khac"]
    amount_band: Literal["duoi_5tr", "5_20tr", "tren_20tr"]
    deadline: date | None = None
    has_salary: bool | None = None
    has_asset: bool | None = None
    bad_debt: Literal["co", "khong", "khong_biet"] | None = None


class Option(BaseModel):
    kind: Literal["no_loan", "loan_channel"]
    option_id: str
    title: str
    cost_note: str
    speed: str
    fit: Literal["cao", "co_the", "kho"]
    source_url: str | None = None
    updated_at: str | None = None


class NeedOptions(BaseModel):
    options: list[Option]
    note: str

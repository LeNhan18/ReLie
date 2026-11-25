"""Schema dữ liệu khoản vay. LoanTerms là đầu ra bắt buộc của VLM trích xuất."""

from __future__ import annotations

from datetime import date
from typing import Generic, Literal, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class Field_(BaseModel, Generic[T]):
    value: T | None = None
    confidence: float = Field(0.0, ge=0, le=1)


class Fee(BaseModel):
    name: str
    amount: int
    deducted_upfront: bool = False
    confidence: float = 0.0


class Installment(BaseModel):
    on: date
    amount: int


class LoanTerms(BaseModel):
    lender_name: Field_[str] = Field_()
    principal_stated: Field_[int] = Field_()
    amount_received: Field_[int] = Field_()
    disbursed_date: Field_[date] = Field_()
    repayment_type: Field_[Literal["one_time", "installment", "daily"]] = Field_()
    schedule: list[Installment] = []
    rate_stated_pct_year: Field_[float] = Field_()
    fees: list[Fee] = []
    extension_fee: Field_[int] = Field_()
    late_penalty_pct_per_day: Field_[float] = Field_()
    data_access_contacts: bool = False
    requires_upfront_payment: bool = False

    def low_confidence_fields(self, threshold: float = 0.8) -> list[str]:
        out = []
        for name, v in self:
            if isinstance(v, Field_) and v.value is not None and v.confidence < threshold:
                out.append(name)
        out += [f"fees.{f.name}" for f in self.fees if f.confidence < threshold]
        return out


class ConfirmedLoan(BaseModel):
    """Dữ liệu người dùng đã xác nhận trên form — đầu vào của /loan/assess."""

    lender_name: str
    amount_received: int = Field(gt=0)
    disbursed_date: date
    schedule: list[Installment] = Field(min_length=1)
    rate_stated_pct_year: float | None = None
    extension_fee: int | None = None
    late_penalty_pct_per_day: float | None = None
    data_access_contacts: bool = False
    requires_upfront_payment: bool = False
    third_party_collection: bool = False
    has_rate_and_method: bool = True


class Finding(BaseModel):
    rule_id: str
    severity: str
    message: str
    legal_ref: str


class Assessment(BaseModel):
    risk_level: Literal["green", "yellow", "red"]
    lender_status: str
    amount_received: int
    total_repaid: int
    total_cost: int
    apr_simple: float
    scenarios: dict[str, int] = {}
    findings: list[Finding]
    explanation: str


class ChecklistItem(BaseModel):
    id: str
    text: str


class AftercareResult(BaseModel):
    lender_status: str
    principal_received: int
    lawful_interest: int
    excess_charge: int
    total_demanded: int
    excess_applies: bool
    checklist: list[ChecklistItem]
    note: str

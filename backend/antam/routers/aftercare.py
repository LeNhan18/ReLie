"""Hỗ trợ sau vay bằng phép tính xác định, không gọi LLM."""

from collections.abc import Callable, Coroutine
from typing import Any

from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.routing import APIRoute

from antam.schemas.loan import AftercareResult, ChecklistItem, ConfirmedLoan
from antam.seed import seed
from antam.tools.check_license import check_license
from antam.tools.debt_split import summarize_debt
from antam.tools.rule_engine import params_at


class AftercareRoute(APIRoute):
    def get_route_handler(self) -> Callable[[Request], Coroutine[Any, Any, Response]]:
        original_handler = super().get_route_handler()

        async def handler(request: Request) -> Response:
            try:
                return await original_handler(request)
            except RequestValidationError as exc:
                raise HTTPException(
                    422, "Dữ liệu khoản vay không hợp lệ, vui lòng kiểm tra các trường và lịch trả nợ",
                ) from exc

        return handler


router = APIRouter(prefix="/aftercare", tags=["aftercare"], route_class=AftercareRoute)

_CHECKLIST = [
    ChecklistItem(id="luu_bang_chung", text="Chụp lưu hợp đồng, lịch trả nợ, tin nhắn báo tiền về"),
    ChecklistItem(id="tat_quyen", text="Tắt quyền Danh bạ, Ảnh, Tin nhắn của app"),
    ChecklistItem(id="bao_nguoi_than", text="Báo trước cho người thân nếu có số lạ gọi đòi nợ"),
    ChecklistItem(id="khong_vay_chong", text="Không vay app khác để trả app này"),
]


@router.post("/assess", response_model=AftercareResult)
def assess_aftercare(loan: ConfirmedLoan) -> AftercareResult:
    data = seed()
    license_result = check_license(loan.lender_name, data["lenders"])
    applies = license_result.status != "credit_institution"
    try:
        params = params_at(data["legal_params"], loan.disbursed_date)
        if applies and "cap_civil_pct" not in params:
            raise ValueError("Chưa có tham số trần lãi suất tại ngày giải ngân")
        total, lawful, excess = summarize_debt(
            loan.amount_received,
            [(item.on, item.amount) for item in loan.schedule],
            loan.disbursed_date,
            params.get("cap_civil_pct", 0),
            applies,
        )
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
    note = (
        "Ước tính theo mức trần lãi suất của luật dân sự tại ngày giải ngân. Không phải tư vấn pháp lý."
        if applies else
        "Bên cho vay là tổ chức tín dụng có giấy phép, không áp dụng trần lãi suất dân sự. "
        "Không phải tư vấn pháp lý."
    )
    return AftercareResult(
        lender_status=license_result.status,
        principal_received=loan.amount_received,
        lawful_interest=lawful,
        excess_charge=excess,
        total_demanded=total,
        excess_applies=applies,
        checklist=_CHECKLIST,
        note=note,
    )

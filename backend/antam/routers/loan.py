from __future__ import annotations

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from antam.ai.extract import extract_terms
from antam.schemas.loan import Assessment, ConfirmedLoan
from antam.services.assess import assess
from antam.tools.calc_true_cost import CashFlowError

router = APIRouter(prefix="/loan", tags=["loan"])
MAX_IMAGE_BYTES = 4_000_000  # ảnh đã resize phía client; xử lý trong bộ nhớ, KHÔNG lưu ảnh gốc


@router.post("/extract")
async def extract(file: UploadFile | None = File(None), text: str | None = Form(None),
                  sample_id: str | None = Form(None)) -> dict:
    image = await file.read() if file else None
    if image and len(image) > MAX_IMAGE_BYTES:
        raise HTTPException(413, "Ảnh quá lớn, vui lòng chụp lại hoặc giảm kích thước")
    terms = extract_terms(image_bytes=image, text=text, sample_id=sample_id)
    return {"terms": terms.model_dump(mode="json"), "low_confidence_fields": terms.low_confidence_fields()}


@router.post("/assess", response_model=Assessment)
def assess_loan(loan: ConfirmedLoan) -> Assessment:
    try:
        return assess(loan)
    except CashFlowError as e:
        raise HTTPException(422, str(e)) from e

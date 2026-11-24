from __future__ import annotations

from collections import defaultdict

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from antam.schemas.need import NeedOptions, NeedProfile
from antam.seed import seed
from antam.services.need import options_for

router = APIRouter(tags=["need"])


@router.post("/need/options", response_model=NeedOptions)
def need_options(p: NeedProfile) -> NeedOptions:
    return options_for(p)


class DraftRequest(BaseModel):
    alt_id: str
    values: dict[str, str] = {}


@router.post("/messages/draft")
def draft(req: DraftRequest) -> dict:
    alt = next((a for a in seed()["alternatives"] if a["alt_id"] == req.alt_id), None)
    if not alt:
        raise HTTPException(404, "Không có mẫu thư này")
    text = alt["template"].format_map(defaultdict(lambda: "...", req.values)).strip()
    return {"text": text}

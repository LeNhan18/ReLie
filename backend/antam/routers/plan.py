from __future__ import annotations

from datetime import date

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from antam.tools.cashflow import Debt, FixedExpense, forecast

router = APIRouter(prefix="/plan", tags=["plan"])


class DebtIn(BaseModel):
    label: str
    due: date
    amount: int


class TodayRequest(BaseModel):
    today: date
    cash_on_hand: int
    next_payday: date
    avg_daily_spend: int
    debts: list[DebtIn] = []
    fixed: list[DebtIn] = []
    buffer: int = 0


@router.post("/today")
def today(req: TodayRequest) -> dict:
    try:
        f = forecast(req.today, req.cash_on_hand, req.next_payday, req.avg_daily_spend,
                     [Debt(**d.model_dump()) for d in req.debts],
                     [FixedExpense(**x.model_dump()) for x in req.fixed], req.buffer)
    except ValueError as e:
        raise HTTPException(422, str(e)) from e
    return {"spendable_today": f.spendable_today, "days_until_payday": f.days_until_payday,
            "shortfalls": [s.__dict__ for s in f.shortfalls]}

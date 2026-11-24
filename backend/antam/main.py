"""FastAPI app. Chạy local: uvicorn antam.main:app --reload. Trên Lambda: handler = Mangum(app)."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from antam.routers import loan, need, plan

app = FastAPI(title="AnTâm API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.include_router(loan.router)
app.include_router(need.router)
app.include_router(plan.router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


try:
    from mangum import Mangum

    handler = Mangum(app)
except ImportError:  # local dev không cần mangum
    handler = None

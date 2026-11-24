"""Nạp dữ liệu seed (luật, quy tắc, bên cho vay, kênh vay, phương án) từ data/seed/."""

from __future__ import annotations

import csv
from datetime import date
from functools import lru_cache
from pathlib import Path

import yaml

from antam.config import settings
from antam.tools.check_license import Lender
from antam.tools.rule_engine import LegalParam, Rule


def _as_date(v) -> date | None:
    if v is None or isinstance(v, date):
        return v
    return date.fromisoformat(str(v))


def load_legal_params(seed_dir: Path) -> list[LegalParam]:
    rows = yaml.safe_load((seed_dir / "legal_params.yaml").read_text(encoding="utf-8")) or []
    return [
        LegalParam(r["name"], float(r["value"]), _as_date(r["effective_from"]),
                   _as_date(r.get("effective_to")), r["source_doc"])
        for r in rows
    ]


def load_rules(seed_dir: Path) -> list[Rule]:
    rows = yaml.safe_load((seed_dir / "rules.yaml").read_text(encoding="utf-8")) or []
    return [Rule(r["rule_id"], r["branch"], r["condition"], r["severity"], r["message_template"], r["legal_ref"])
            for r in rows]


def load_lenders(seed_dir: Path) -> list[Lender]:
    with (seed_dir / "lenders.csv").open(encoding="utf-8") as f:
        return [Lender(r["name"], r["lender_type"], r["source"]) for r in csv.DictReader(f)]


def load_alternatives(seed_dir: Path) -> list[dict]:
    return yaml.safe_load((seed_dir / "alternatives.yaml").read_text(encoding="utf-8")) or []


def load_loan_channels(seed_dir: Path) -> list[dict]:
    with (seed_dir / "loan_channels.csv").open(encoding="utf-8") as f:
        return list(csv.DictReader(f))


@lru_cache(maxsize=1)
def seed() -> dict:
    d = settings.seed_dir
    return {
        "legal_params": load_legal_params(d),
        "rules": load_rules(d),
        "lenders": load_lenders(d),
        "alternatives": load_alternatives(d),
        "loan_channels": load_loan_channels(d),
    }

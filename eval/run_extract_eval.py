"""Đo độ chính xác trích xuất từng trường trên eval/contracts/. Chạy từ thư mục backend/."""

from __future__ import annotations

import json
import sys
from collections import defaultdict
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from antam.ai.extract import extract_terms  # noqa: E402

CONTRACTS = Path(__file__).parent / "contracts"
FIELDS = ["lender_name", "principal_stated", "amount_received", "disbursed_date",
          "rate_stated_pct_year", "extension_fee", "late_penalty_pct_per_day"]


def main() -> None:
    hits: dict[str, list[bool]] = defaultdict(list)
    for label_path in sorted(CONTRACTS.glob("*.label.json")):
        img = label_path.with_name(label_path.name.replace(".label.json", ".jpg"))
        if not img.exists():
            continue
        label = json.loads(label_path.read_text(encoding="utf-8"))
        got = extract_terms(image_bytes=img.read_bytes()).model_dump(mode="json")
        for f in FIELDS:
            hits[f].append(got[f]["value"] == label[f]["value"])
        hits["data_access_contacts"].append(got["data_access_contacts"] == label["data_access_contacts"])
    report = {f: round(sum(v) / len(v), 3) for f, v in hits.items() if v}
    out = Path(__file__).parent / "results" / f"{date.today()}.json"
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    sys.stdout.write(json.dumps(report, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()

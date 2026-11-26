"""Đo độ chính xác trích xuất từng trường trên eval/contracts/. Chạy từ thư mục backend/."""

from __future__ import annotations

import json
import sys
from collections import defaultdict
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from antam.ai.extract import extract_terms  # noqa: E402
from antam.config import settings  # noqa: E402

CONTRACTS = Path(__file__).parent / "contracts"
FIELDS = ["lender_name", "principal_stated", "amount_received", "disbursed_date",
          "rate_stated_pct_year", "extension_fee", "late_penalty_pct_per_day"]


def main() -> None:
    if settings.ai_mode not in {"bedrock", "paddle_groq"}:
        raise SystemExit("Không chạy eval thật với mock hoặc AI_MODE không được hỗ trợ; chưa gọi model.")
    if settings.ai_mode == "bedrock" and not settings.bedrock_model_extract:
        raise SystemExit("Chưa cấu hình model trích xuất; chưa gọi model và chưa tạo báo cáo.")
    if settings.ai_mode == "paddle_groq" and not settings.groq_api_key:
        raise SystemExit("Chưa cấu hình GROQ_API_KEY; chưa gọi model và chưa tạo báo cáo.")
    labels = sorted(CONTRACTS.glob("*.label.json"))
    if not labels:
        raise SystemExit("Chưa có bộ mẫu có nhãn; không tạo báo cáo rỗng như kết quả đánh giá thật.")
    if any(not path.with_name(path.name.replace(".label.json", ".jpg")).is_file() for path in labels):
        raise SystemExit("Thiếu ảnh ứng với nhãn; dừng trước khi gọi model để không chấm thiếu mẫu.")
    hits: dict[str, list[bool]] = defaultdict(list)
    for label_path in labels:
        img = label_path.with_name(label_path.name.replace(".label.json", ".jpg"))
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

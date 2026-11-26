"""Smoke dịch vụ thật; không monkeypatch, không sample_id, không dùng fixture.

Chỉ xuất trạng thái và link công khai; không đọc .env hoặc dùng AWS credentials.
Exit 0 chỉ khi phạm vi được chọn đã xác minh thành công.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from antam.config import settings  # noqa: E402
from antam.schemas.need import NeedProfile  # noqa: E402
from antam.services.live_lending import VIETNAM  # noqa: E402
from antam.services.need import options_for  # noqa: E402


def run_checks(scope: str) -> dict:
    started = datetime.now(VIETNAM).isoformat()
    result = options_for(NeedProfile(purpose="khac", amount_band="duoi_5tr"))
    finished = datetime.now(VIETNAM)
    checked_dates = {datetime.fromisoformat(started).date().isoformat(), finished.date().isoformat()}
    loans = [option for option in result.options if option.kind == "loan_channel"]
    search_passed = bool(loans) and all(
        option.option_id.startswith("live_") and option.source_url and option.updated_at in checked_dates
        for option in loans
    )
    checks = [{
        "name": "live_loan_discovery", "status": "passed" if search_passed else "blocked",
        "provider": "tavily", "auth": "api_key" if settings.tavily_api_key else "keyless",
        "count": len(loans), "sources": [option.source_url for option in loans], "detail": result.note,
    }]
    if scope == "all":
        checks.append({
            "name": "live_ocr_llm", "status": "not_run", "ai_mode": settings.ai_mode,
            "detail": (
                "Chưa chạy kiểm thử end-to-end OCR/LLM trong lệnh này. "
                "Đã có mode paddle_groq: cần bộ cài/model PaddleOCR-VL 1.6 và GROQ_API_KEY. "
                "Kết quả mẫu hoặc template fallback không chứng minh model thật hoạt động."
            ),
        })
    return {
        "started_at": started, "finished_at": finished.isoformat(),
        "scope": scope, "status": "passed" if all(check["status"] == "passed" for check in checks) else "blocked",
        "checks": checks,
        "limitations": [
            "Đây là smoke service backend gọi nguồn thật, chưa kiểm tra trình duyệt/hosting.",
            "Không xác nhận báo giá cá nhân hoặc quyết định duyệt vay.",
        ],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--scope", choices=("search", "all"), default="all")
    parser.add_argument("--output", type=Path, help="Lưu báo cáo chỉ chứa trạng thái và nguồn công khai.")
    args = parser.parse_args()
    report = run_checks(args.scope)
    encoded = json.dumps(report, ensure_ascii=True, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(encoded, encoding="utf-8")
    sys.stdout.write(encoded)
    return 0 if report["status"] == "passed" else 1


if __name__ == "__main__":
    raise SystemExit(main())

"""Chạy model PaddleOCR-VL 1.6 thật; không cần LLM/key, không lưu ảnh gốc."""

import argparse
import json
import sys
from datetime import datetime
from io import BytesIO
from pathlib import Path
from time import monotonic

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from antam.ai.errors import AIUnavailable, OCRInputError  # noqa: E402
from antam.ai.paddle_local import MODEL_ID, read_image  # noqa: E402
from antam.config import settings  # noqa: E402
from antam.services.live_lending import VIETNAM  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--image", type=Path, help="Ảnh đã khử định danh; chỉ đọc vào bộ nhớ.")
    parser.add_argument("--output", type=Path, help="Chỉ lưu trạng thái, không lưu văn bản OCR.")
    args = parser.parse_args()
    started = monotonic()
    report = {
        "model": MODEL_ID, "device": settings.paddle_device,
        "checked_at": datetime.now(VIETNAM).isoformat(), "status": "blocked",
        "input_kind": "user_image" if args.image else "synthetic_in_memory",
        "limitations": "Smoke model thật; chưa đo độ chính xác hợp đồng hoặc gọi LLM.",
    }
    try:
        if args.image:
            with args.image.open("rb") as handle:
                raw = handle.read(4_000_001)
            if len(raw) > 4_000_000:
                raise OCRInputError("Ảnh vượt giới hạn 4MB.")
        else:
            from PIL import Image, ImageDraw, ImageFont

            image = Image.new("RGB", (900, 220), "white")
            draw = ImageDraw.Draw(image)
            draw.text((30, 60), "PADDLE OCR TEST 2026", fill="black", font=ImageFont.load_default(size=40))
            buffer = BytesIO()
            image.save(buffer, format="PNG")
            raw = buffer.getvalue()
        text = read_image(raw)
        matched = bool(text.strip()) if args.image else "2026" in text and "PADDLE" in text.upper()
        report.update(status="passed" if matched else "failed", characters=len(text))
    except (AIUnavailable, OCRInputError) as exc:
        report["detail"] = str(exc)
    except (ImportError, OSError):
        report["detail"] = "Thiếu bộ cài hoặc chưa đọc được ảnh đầu vào; không xuất chi tiết tài liệu."
    report["elapsed_seconds"] = round(monotonic() - started, 2)
    encoded = json.dumps(report, ensure_ascii=True, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(encoded, encoding="utf-8")
    sys.stdout.write(encoded)
    return 0 if report["status"] == "passed" else 1


if __name__ == "__main__":
    raise SystemExit(main())

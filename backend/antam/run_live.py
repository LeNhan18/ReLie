"""Khởi động backend local với PaddleOCR và vLLM thật, không đọc file .env."""

from __future__ import annotations

import argparse
import os
from pathlib import Path
from urllib.parse import urlsplit


def configure(base_url: str, model: str, device: str) -> None:
    """Kiểm tra tham số trước khi nạp Settings của ứng dụng."""
    base = base_url.rstrip("/")
    try:
        parts = urlsplit(base)
        valid = (
            parts.scheme in {"http", "https"} and bool(parts.hostname)
            and not parts.username and not parts.password and not parts.query and not parts.fragment
            and parts.path == "/v1" and not any(c.isspace() or c == "\\" for c in base)
            and (parts.port is None or 1 <= parts.port <= 65535)
        )
    except ValueError:
        valid = False
    if not valid or not model.strip() or not device.strip():
        raise ValueError("Cần URL http(s)://server:port/v1, tên model và thiết bị hợp lệ.")
    os.environ.update(
        AI_MODE="paddle_vllm", LLM_PROVIDER="vllm", LLM_BASE_URL=base,
        LLM_MODEL_NAME=model, PADDLE_DEVICE=device,
    )
    cache = Path(__file__).resolve().parents[1] / ".venv" / "model-cache"
    for variable, folder in (
        ("PADDLE_PDX_CACHE_HOME", "paddlex"), ("HF_HOME", "huggingface"), ("MODELSCOPE_CACHE", "modelscope"),
    ):
        os.environ.setdefault(variable, str(cache / folder))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default=os.getenv("LLM_BASE_URL", ""), help="URL vLLM kết thúc bằng /v1")
    parser.add_argument("--model", default=os.getenv("LLM_MODEL_NAME", "qwen2.5-7b"))
    parser.add_argument("--device", default=os.getenv("PADDLE_DEVICE", "gpu:0"))
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    if not 1 <= args.port <= 65535:
        parser.error("Cổng backend phải nằm trong khoảng 1–65535.")
    try:
        configure(args.base_url, args.model, args.device)
    except ValueError as exc:
        parser.error(str(exc))

    import uvicorn

    # Import ứng dụng sau configure; một worker để không nhân bản model trên GPU.
    uvicorn.run("antam.main:app", host=args.host, port=args.port, workers=1, access_log=False)


if __name__ == "__main__":
    main()

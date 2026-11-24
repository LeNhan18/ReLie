"""Cấu hình đọc từ biến môi trường. Không hard-code khoá hay tên tài nguyên."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
PKG_ROOT = Path(__file__).resolve().parents[1]  # backend/ (trên Lambda là /var/task)


def _default_data_dir(name: str) -> Path:
    """Local: <repo>/data/<name>. Lambda: backend/<name> do infra/prepare_build.py chép vào."""
    local = REPO_ROOT / "data" / name
    return local if local.exists() else PKG_ROOT / name


@dataclass(frozen=True)
class Settings:
    aws_region: str = os.getenv("AWS_REGION", "ap-southeast-1")
    bedrock_model_extract: str = os.getenv("BEDROCK_MODEL_EXTRACT", "")
    bedrock_model_write: str = os.getenv("BEDROCK_MODEL_WRITE", "")
    table_name: str = os.getenv("TABLE_NAME", "")
    uploads_bucket: str = os.getenv("UPLOADS_BUCKET", "")
    seed_dir: Path = Path(os.getenv("SEED_DIR", str(_default_data_dir("seed"))))
    samples_dir: Path = Path(os.getenv("SAMPLES_DIR", str(_default_data_dir("samples"))))
    # AI_MODE=mock: trả JSON mẫu, không gọi Bedrock (dùng khi dựng UI và chạy test)
    ai_mode: str = os.getenv("AI_MODE", "mock")


settings = Settings()

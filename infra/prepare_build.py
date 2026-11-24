"""Chép data/seed và data/samples vào backend/ trước `sam build` (Lambda chỉ đóng gói thư mục backend/).

Chạy từ gốc repo: python infra/prepare_build.py
"""

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
for name in ("seed", "samples"):
    dst = ROOT / "backend" / name
    if dst.exists():
        shutil.rmtree(dst)
    shutil.copytree(ROOT / "data" / name, dst)
print("Đã chép data/seed và data/samples vào backend/")  # noqa: T201

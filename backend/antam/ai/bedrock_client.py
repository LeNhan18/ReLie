"""Gọi Amazon Bedrock qua Converse API. Ở AI_MODE=mock không gọi mạng."""

from __future__ import annotations

import base64
import json
from pathlib import Path

from antam.config import settings

PROMPTS_DIR = Path(__file__).resolve().parents[1] / "prompts"


def load_prompt(name: str) -> str:
    return (PROMPTS_DIR / f"{name}.md").read_text(encoding="utf-8")


def converse_json(model_id: str, system: str, text: str, image_bytes: bytes | None = None,
                  image_format: str = "jpeg", max_tokens: int = 1500) -> dict:
    """Gửi một lượt Converse, yêu cầu trả JSON thuần. Ném ValueError nếu không parse được."""
    import boto3  # import muộn để test/mock không cần boto3

    client = boto3.client("bedrock-runtime", region_name=settings.aws_region)
    content: list[dict] = []
    if image_bytes is not None:
        content.append({"image": {"format": image_format, "source": {"bytes": image_bytes}}})
    content.append({"text": text})
    resp = client.converse(
        modelId=model_id,
        system=[{"text": system}],
        messages=[{"role": "user", "content": content}],
        inferenceConfig={"maxTokens": max_tokens, "temperature": 0},
    )
    out = "".join(b.get("text", "") for b in resp["output"]["message"]["content"])
    out = out.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    return json.loads(out)


def b64(data: bytes) -> str:
    return base64.b64encode(data).decode()

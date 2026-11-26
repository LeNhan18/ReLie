"""Đánh giá bộ phân loại trạng thái trên câu tiếng Việt có nhãn."""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path
from typing import get_args

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from antam.services.state import UserState, classify_state  # noqa: E402

DEFAULT_CASES = Path(__file__).with_name("state_cases.json")
STATES = get_args(UserState)


def evaluate(cases_path: Path) -> dict[str, object]:
    cases = json.loads(cases_path.read_text(encoding="utf-8"))
    if not isinstance(cases, list) or not cases:
        raise ValueError("Bộ câu đánh giá phải là một danh sách không rỗng.")

    seen: set[str] = set()
    counts: Counter[str] = Counter()
    hits: Counter[str] = Counter()
    mismatches: list[dict[str, str]] = []
    for index, case in enumerate(cases, start=1):
        if not isinstance(case, dict):
            raise ValueError(f"Mẫu thứ {index} phải là một đối tượng JSON.")
        case_id, sentence, expected = case.get("id"), case.get("text"), case.get("state")
        if not isinstance(case_id, str) or not case_id.strip() or case_id in seen:
            raise ValueError(f"Mẫu thứ {index} cần có ID không rỗng và không trùng.")
        if not isinstance(sentence, str) or not sentence.strip():
            raise ValueError(f"Mẫu thứ {index} cần có câu không rỗng.")
        if not isinstance(expected, str) or expected not in STATES:
            raise ValueError(f"Mẫu thứ {index} cần có nhãn trạng thái hợp lệ.")
        seen.add(case_id)

        predicted = classify_state(sentence)
        counts[expected] += 1
        if predicted == expected:
            hits[expected] += 1
        else:
            mismatches.append({"id": case_id, "expected": expected, "predicted": predicted})

    return {
        "total": len(cases),
        "correct": hits.total(),
        "accuracy": round(hits.total() / len(cases), 4),
        "by_state": {
            state: {
                "total": counts[state],
                "correct": hits[state],
                "recall": round(hits[state] / counts[state], 4) if counts[state] else None,
            }
            for state in STATES
        },
        "mismatches": mismatches,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cases", type=Path, default=DEFAULT_CASES, help="Đường dẫn bộ câu có nhãn.")
    parser.add_argument("--output", type=Path, help="Đường dẫn lưu báo cáo JSON UTF-8.")
    args = parser.parse_args()
    try:
        report = json.dumps(evaluate(args.cases), ensure_ascii=False, indent=2) + "\n"
        if args.output is not None:
            args.output.parent.mkdir(parents=True, exist_ok=True)
            args.output.write_text(report, encoding="utf-8")
    except (OSError, ValueError) as exc:
        parser.error(str(exc))
    sys.stdout.write(report)


if __name__ == "__main__":
    main()

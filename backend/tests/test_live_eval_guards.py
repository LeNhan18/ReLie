"""Các guard không cho bộ eval dùng mock để chứng minh tích hợp thật."""

import importlib.util
from dataclasses import replace
from datetime import datetime, timedelta
from pathlib import Path

import pytest

from antam.schemas.need import NeedOptions, Option

EVAL_DIR = Path(__file__).resolve().parents[2] / "eval"


def load_runner(filename):
    spec = importlib.util.spec_from_file_location("eval_under_test", EVAL_DIR / filename)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@pytest.mark.parametrize("mode", ["mock", "groq", "invalid"])
def test_extract_eval_refuses_mock_and_unknown_providers(monkeypatch, mode):
    runner = load_runner("run_extract_eval.py")
    monkeypatch.setattr(runner, "settings", replace(runner.settings, ai_mode=mode))
    with pytest.raises(SystemExit, match="chưa gọi model"):
        runner.main()


def test_extract_eval_refuses_empty_dataset_before_model_call(monkeypatch, tmp_path):
    runner = load_runner("run_extract_eval.py")
    monkeypatch.setattr(runner, "settings", replace(runner.settings, ai_mode="bedrock", bedrock_model_extract="test"))
    monkeypatch.setattr(runner, "CONTRACTS", tmp_path)
    with pytest.raises(SystemExit, match="Chưa có bộ mẫu"):
        runner.main()


def test_extract_eval_refuses_missing_images_before_model_call(monkeypatch, tmp_path):
    runner = load_runner("run_extract_eval.py")
    monkeypatch.setattr(runner, "settings", replace(runner.settings, ai_mode="bedrock", bedrock_model_extract="test"))
    monkeypatch.setattr(runner, "CONTRACTS", tmp_path)
    (tmp_path / "fictional.label.json").write_text("{}")
    with pytest.raises(SystemExit, match="Thiếu ảnh"):
        runner.main()


def test_live_smoke_does_not_pass_when_only_non_loan_options_exist():
    # Autouse offline provider trong unit test: chỉ kiểm tra tiêu chí pass,
    # không coi test này là bằng chứng dịch vụ thật hoạt động.
    runner = load_runner("run_live_checks.py")
    report = runner.run_checks("all")
    assert report["status"] == "blocked"
    assert report["checks"][0]["status"] == "blocked"
    assert report["checks"][1]["status"] == "not_run"


@pytest.mark.parametrize("offset, expected", [(-1, "blocked"), (1, "blocked"), (0, "passed")])
def test_live_smoke_requires_check_date_from_current_run(monkeypatch, offset, expected):
    runner = load_runner("run_live_checks.py")
    date_checked = (datetime.now(runner.VIETNAM).date() + timedelta(days=offset)).isoformat()
    fake = NeedOptions(options=[Option(
        kind="loan_channel", option_id="live_fixture", title="MẪU HƯ CẤU", cost_note="Chưa có báo giá",
        speed="Chưa rõ", fit="co_the", source_url="https://fixture.vn/vay", updated_at=date_checked,
    )], note="Fixture chỉ để kiểm tra guard, không phải kết quả tích hợp thật.")
    monkeypatch.setattr(runner, "options_for", lambda profile: fake)
    assert runner.run_checks("search")["status"] == expected

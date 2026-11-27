from types import SimpleNamespace
from urllib.error import URLError

import pytest

from antam.ai import extract, groq_client
from antam.ai import extraction_budget as budget
from antam.ai.errors import AIUnavailable


def test_retry_uses_remaining_budget_instead_of_reset(monkeypatch):
    clock = [100.0]
    monkeypatch.setattr(budget, "monotonic", lambda: clock[0])
    token = budget._deadline.set(0.0)
    try:
        assert budget.remaining_timeout(240) == 60
        clock[0] = 170
        assert budget.remaining_timeout(240) == 20
        clock[0] = 191
        with pytest.raises(AIUnavailable, match="quá lâu"):
            budget.remaining_timeout(240)
    finally:
        budget._deadline.reset(token)


def test_calls_outside_extraction_keep_their_timeout():
    assert budget.remaining_timeout(120) == 120


def test_budget_is_created_after_reading_document_and_reset_after_error(monkeypatch):
    def fail(**kwargs):
        assert budget._deadline.get() == 0.0
        raise AIUnavailable("fixture")
    monkeypatch.setattr(extract, "extract_terms", fail)
    with pytest.raises(AIUnavailable):
        budget.bounded_extract_terms(text="fictional")
    assert budget._deadline.get() is None
    assert not budget._request_lock.locked()


def test_parallel_extraction_is_rejected_before_entering_model(monkeypatch):
    monkeypatch.setattr(extract, "extract_terms", lambda **kwargs: pytest.fail("Must not call model"))
    budget._request_lock.acquire()
    try:
        with pytest.raises(AIUnavailable, match="tài liệu khác"):
            budget.bounded_extract_terms(text="fictional")
    finally:
        budget._request_lock.release()


@pytest.mark.parametrize("error", [TimeoutError("private"), URLError(TimeoutError("private"))])
def test_transport_reports_timeout_without_private_error(monkeypatch, error):
    def fail(*args, **kwargs):
        raise error
    monkeypatch.setattr(groq_client, "build_opener", lambda *args: SimpleNamespace(open=fail))
    with pytest.raises(AIUnavailable, match="quá lâu") as exc:
        groq_client.completion_json("JSON", "fictional", 10, endpoint="http://fixture/v1", model="fixture")
    assert "private" not in str(exc.value)


def test_late_response_is_rejected(monkeypatch):
    token = budget._deadline.set(100.0)
    monkeypatch.setattr(budget, "monotonic", lambda: 101.0)
    try:
        with pytest.raises(AIUnavailable, match="quá lâu"):
            budget.check_deadline()
    finally:
        budget._deadline.reset(token)

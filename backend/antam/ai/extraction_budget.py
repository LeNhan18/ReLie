"""Một lượt trích xuất tại mỗi worker; các lượt LLM dùng chung ngân sách chờ."""

from contextvars import ContextVar
from threading import Lock
from time import monotonic

from antam.ai.errors import AIUnavailable

LLM_TOTAL_SECONDS = 90.0
LLM_CALL_SECONDS = 60.0
TIMEOUT_MESSAGE = "AI đọc điều khoản quá lâu. Bạn có thể thử lại sau hoặc tự nhập số liệu."
_deadline: ContextVar[float | None] = ContextVar("loan_llm_deadline", default=None)
_request_lock = Lock()


def remaining_timeout(requested: float) -> float:
    """Lượt sửa schema không được bắt đầu lại ngân sách LLM của request."""
    deadline = _deadline.get()
    if deadline is None:
        return requested
    if deadline == 0.0:
        deadline = monotonic() + LLM_TOTAL_SECONDS
        _deadline.set(deadline)
    remaining = deadline - monotonic()
    if remaining <= 0:
        raise AIUnavailable(TIMEOUT_MESSAGE)
    return min(requested, LLM_CALL_SECONDS, remaining)


def check_deadline() -> None:
    deadline = _deadline.get()
    if deadline is not None and deadline > 0 and monotonic() >= deadline:
        raise AIUnavailable(TIMEOUT_MESSAGE)


def bounded_extract_terms(*args, **kwargs):
    # Import muộn: tránh vòng import với transport và giữ unit test không tải model.
    from antam.ai.extract import extract_terms

    if not _request_lock.acquire(blocking=False):
        raise AIUnavailable("Đang đọc một tài liệu khác. Vui lòng đợi kết quả trước khi thử lại.")
    token = _deadline.set(0.0)  # Chỉ bắt đầu tính ngân sách khi gọi LLM, sau bước PDF/OCR.
    try:
        return extract_terms(*args, **kwargs)
    finally:
        _deadline.reset(token)
        _request_lock.release()

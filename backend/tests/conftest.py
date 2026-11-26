"""Test không gọi dịch vụ thật, kể cả khi máy có cấu hình tìm kiếm hoặc AI."""

import pytest

from antam.services import need
from antam.services.live_lending import Discovery


@pytest.fixture(autouse=True)
def offline_loan_search(monkeypatch):
    monkeypatch.setattr(need, "discover_loan_options", lambda profile: Discovery([], "Tra cứu giả lập trong test."))

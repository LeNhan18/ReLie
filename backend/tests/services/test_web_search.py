import io
import json
from urllib.error import HTTPError, URLError

import pytest

from antam.services import web_search
from antam.services.web_search import MAX_RESPONSE_BYTES, SearchUnavailable, TavilySearch, _NoRedirect


class FakeOpener:
    def __init__(self, response=b'{"results": []}', error=None):
        self.response = response
        self.error = error
        self.requests = []

    def open(self, request, timeout):
        self.requests.append((request, timeout))
        if self.error:
            raise self.error
        return io.BytesIO(self.response)


@pytest.mark.parametrize("key", ["", "fake-secret-for-test"])
def test_search_auth_limits_and_no_generated_answer(monkeypatch, key):
    opener = FakeOpener()
    monkeypatch.setattr(web_search, "build_opener", lambda *args: opener)
    assert TavilySearch(key).search("câu hỏi công khai", ["sbv.gov.vn"]) == []
    request, timeout = opener.requests[0]
    assert request.full_url == "https://api.tavily.com/search"
    assert 0 < timeout <= 6
    headers = {k.lower(): v for k, v in request.header_items()}
    if key:
        assert headers["authorization"] == "Bearer " + key
        assert "x-tavily-access-mode" not in headers
    else:
        assert headers["x-tavily-access-mode"] == "keyless"
    body = json.loads(request.data)
    assert body["include_domains"] == ["sbv.gov.vn"]
    assert body["include_answer"] is False
    assert body["search_depth"] == "basic"


def test_extract_reports_only_successful_results(monkeypatch):
    opener = FakeOpener(b'{"results": [], "failed_results": [{"error":"private upstream detail"}]}')
    monkeypatch.setattr(web_search, "build_opener", lambda *args: opener)
    assert TavilySearch().extract(["https://sbv.gov.vn/"]) == []
    assert json.loads(opener.requests[0][0].data)["format"] == "markdown"


@pytest.mark.parametrize("status, reason", [(429, "rate_limit"), (432, "rate_limit"), (401, "upstream_error"),
                                          (500, "upstream_error"), (302, "upstream_error")])
def test_http_errors_do_not_leak_response_or_key(monkeypatch, status, reason):
    opener = FakeOpener(error=HTTPError("https://api.tavily.com/search", status, "secret", {}, io.BytesIO(b"secret")))
    monkeypatch.setattr(web_search, "build_opener", lambda *args: opener)
    with pytest.raises(SearchUnavailable, match=reason) as raised:
        TavilySearch("fake-secret").search("query", [])
    assert "secret" not in str(raised.value)


@pytest.mark.parametrize("payload", [b"not-json", b"[]", b'{"results": null}', b"x" * (MAX_RESPONSE_BYTES + 1)])
def test_malformed_or_oversized_payload_fails_closed(monkeypatch, payload):
    monkeypatch.setattr(web_search, "build_opener", lambda *args: FakeOpener(response=payload))
    with pytest.raises(SearchUnavailable):
        TavilySearch().search("query", [])


@pytest.mark.parametrize("error", [TimeoutError("secret"), URLError("secret")])
def test_timeouts_and_network_errors_are_safe(monkeypatch, error):
    monkeypatch.setattr(web_search, "build_opener", lambda *args: FakeOpener(error=error))
    with pytest.raises(SearchUnavailable, match="upstream_error"):
        TavilySearch().search("query", [])


def test_deadline_prevents_more_requests(monkeypatch):
    client = TavilySearch()
    monkeypatch.setattr(web_search, "monotonic", lambda: client._deadline + 1)
    with pytest.raises(SearchUnavailable):
        client.search("query", [])


def test_redirects_never_forward_credentials():
    assert _NoRedirect().redirect_request(None, None, 302, "", {}, "https://evil.vn") is None

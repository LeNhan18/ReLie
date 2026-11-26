"""Tìm và đọc web bằng Tavily; chỉ gửi câu hỏi công khai, không gửi hồ sơ vay."""

import json
from time import monotonic
from urllib.error import HTTPError, URLError
from urllib.request import HTTPRedirectHandler, Request, build_opener

MAX_RESPONSE_BYTES = 2_000_000


class SearchUnavailable(Exception):
    """Lỗi đã phân loại; không mang response body, URL hay khóa bí mật."""

    def __init__(self, reason: str) -> None:
        self.reason = reason
        super().__init__(reason)


class _NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None  # không chuyển Authorization sang host khác


class TavilySearch:
    def __init__(self, api_key: str = "") -> None:
        self._api_key = api_key
        self._deadline = monotonic() + 20

    def _post(self, endpoint: str, payload: dict) -> dict:
        remaining = self._deadline - monotonic()
        if remaining <= 0:
            raise SearchUnavailable("upstream_error")
        headers = {"Content-Type": "application/json", "Accept": "application/json"}
        if self._api_key:
            headers["Authorization"] = f"Bearer {self._api_key}"
        else:
            headers["X-Tavily-Access-Mode"] = "keyless"
        request = Request(
            f"https://api.tavily.com/{endpoint}", data=json.dumps(payload).encode(), headers=headers, method="POST",
        )
        try:
            with build_opener(_NoRedirect()).open(request, timeout=min(6, remaining)) as response:
                raw = response.read(MAX_RESPONSE_BYTES + 1)
            if monotonic() > self._deadline:
                raise SearchUnavailable("upstream_error")
            if len(raw) > MAX_RESPONSE_BYTES:
                raise SearchUnavailable("invalid_response")
            result = json.loads(raw)
            if not isinstance(result, dict) or not isinstance(result.get("results"), list):
                raise SearchUnavailable("invalid_response")
            return result
        except HTTPError as exc:
            reason = "rate_limit" if exc.code in (429, 432, 433) else "upstream_error"
            exc.close()
            raise SearchUnavailable(reason) from None
        except (URLError, TimeoutError, OSError, ValueError):
            raise SearchUnavailable("upstream_error") from None

    def search(self, query: str, domains: list[str], limit: int = 6) -> list[dict]:
        return self._post("search", {
            "query": query, "include_domains": domains, "max_results": limit,
            "include_answer": False, "include_raw_content": False,
            "search_depth": "basic", "max_age_hours": 1,
        })["results"]

    def extract(self, urls: list[str]) -> list[dict]:
        return self._post("extract", {
            "urls": urls, "format": "markdown", "extract_depth": "basic", "timeout": 5,
        })["results"]

from dataclasses import replace
from datetime import datetime

import pytest
from fastapi.testclient import TestClient

from antam.main import app
from antam.schemas.need import NeedProfile
from antam.services import live_lending, need
from antam.services.live_lending import VIETNAM, _registry_domains, _url, discover_loan_options
from antam.services.web_search import SearchUnavailable

# Toàn bộ tên, domain và giấy phép dưới đây là fixture hư cấu; không phải dữ liệu sản phẩm.
REGISTRY = "https://sbv.gov.vn/vi/w/danh-sach-ngan-hang"
PRODUCT = "https://bank-fixture.vn/ca-nhan/vay-tieu-dung"
REGISTRY_CONTENT = """# Danh sách các ngân hàng thương mại cổ phần
| Tên ngân hàng | Giấy phép | Website |
| --- | --- | --- |
| Ngân hàng MẪU HƯ CẤU | 999/GP-NHNN | https://bank-fixture.vn |
"""
PRODUCT_CONTENT = "# Vay tiêu dùng tín chấp\n" + (
    "Khách hàng liên hệ ngân hàng để nhận điều kiện áp dụng, thông tin lãi suất và các khoản phí. " * 3
)
PROFILE = NeedProfile(purpose="khac", amount_band="duoi_5tr")


class FakeSearch:
    def __init__(self):
        self.queries = []
        self.extract_calls = []
        self.registry = [{"url": REGISTRY, "raw_content": REGISTRY_CONTENT}]
        self.products = [{"url": PRODUCT, "raw_content": PRODUCT_CONTENT}]
        self.product_hits = [{"url": PRODUCT, "content": "Snippet không phải nguồn biểu phí"}]

    def search(self, query, domains, limit=6):
        self.queries.append((query, domains, limit))
        return [{"url": REGISTRY}] if domains == ["sbv.gov.vn"] else self.product_hits

    def extract(self, urls):
        self.extract_calls.append(urls)
        return self.registry if urls == [REGISTRY] else self.products


@pytest.fixture
def source(monkeypatch):
    fake = FakeSearch()
    monkeypatch.setattr(live_lending, "settings", replace(live_lending.settings, loan_search_mode="tavily"))
    monkeypatch.setattr(live_lending, "TavilySearch", lambda key: fake)
    return fake


def test_full_pipeline_rechecks_sources_each_time_and_does_not_send_profile(source):
    profile = PROFILE.model_copy(update={"bad_debt": "co", "has_salary": False, "deadline": "2026-12-04"})
    first = discover_loan_options(profile)
    second = discover_loan_options(profile)
    assert len(source.queries) == 4 and len(source.extract_calls) == 4
    option = first.options[0]
    assert option.source_url == PRODUCT
    assert option.option_id == second.options[0].option_id
    assert option.updated_at == datetime.now(VIETNAM).date().isoformat()
    assert option.fit == "kho"
    assert "báo giá cá nhân" in option.cost_note
    assert "Tra cứu lúc" in first.note and REGISTRY in first.note
    for query, _, _ in source.queries:
        assert "2026-12-04" not in query and "nợ xấu" not in query and "duoi_5tr" not in query


def test_existing_endpoint_uses_live_provider_and_keeps_schema(source, monkeypatch):
    monkeypatch.setattr(need, "discover_loan_options", discover_loan_options)
    response = TestClient(app).post("/need/options", json=PROFILE.model_dump())
    assert response.status_code == 200
    result = response.json()
    assert set(result) == {"options", "note"}
    assert result["options"][-1]["source_url"] == PRODUCT
    assert all(item["kind"] == "no_loan" for item in result["options"][:-1])


@pytest.mark.parametrize("url", [
    "http://bank-fixture.vn/vay", "https://bank-fixture.vn.evil.vn/vay", "https://evil-bank-fixture.vn/vay",
    "https://user@bank-fixture.vn/vay", "https://127.0.0.1/vay", "https://bank-fixture.vn:8443/vay",
])
def test_untrusted_product_never_extracted(source, url):
    source.product_hits = [{"url": url}]
    result = discover_loan_options(PROFILE)
    assert result.options == []
    assert source.extract_calls == [[REGISTRY]]


@pytest.mark.parametrize("content", ["", None, "# Bài hướng dẫn vay tiêu dùng\n" + "Nội dung " * 50])
def test_snippet_is_not_a_substitute_for_product_extraction(source, content):
    source.products = [{"url": PRODUCT, "raw_content": content}]
    assert discover_loan_options(PROFILE).options == []


def test_extract_redirect_or_unsolicited_url_is_not_accepted(source):
    source.products = [{"url": "https://evil.vn/vay", "raw_content": PRODUCT_CONTENT}]
    assert discover_loan_options(PROFILE).options == []


def test_http_success_with_no_extracted_pages(source):
    source.products = []
    assert discover_loan_options(PROFILE).options == []


def test_no_license_or_website_mapping_means_no_recommendation(source):
    source.registry = [{"url": REGISTRY, "raw_content": "# Danh sách ngân hàng\nNgân hàng MẪU HƯ CẤU"}]
    result = discover_loan_options(PROFILE)
    assert not result.options
    assert "chưa đủ dữ liệu" in result.note
    assert len(source.queries) == 1


def test_registry_requires_same_row_website_license_and_name():
    content = """# Danh sách ngân hàng thương mại
| Tên ngân hàng | Giấy phép | Website |
| --- | --- | --- |
| Ngân hàng MẪU HƯ CẤU | 999/GP-NHNN | |
| Không phải tổ chức tín dụng | | https://bank-fixture.vn |
"""
    assert _registry_domains([{"url": REGISTRY, "raw_content": content}]) == []


def test_registry_rejects_non_authority_and_multiple_domains():
    assert _registry_domains([{"url": "https://sbv.gov.vn.evil.vn/", "raw_content": REGISTRY_CONTENT}]) == []
    content = REGISTRY_CONTENT.replace("https://bank-fixture.vn", "https://bank-fixture.vn https://other.vn")
    assert _registry_domains([{"url": REGISTRY, "raw_content": content}]) == []


def test_revoked_and_ambiguous_registry_entries_are_not_recommended():
    revoked = REGISTRY_CONTENT.replace("999/GP-NHNN", "999/GP-NHNN (đã thu hồi)")
    assert _registry_domains([{"url": REGISTRY, "raw_content": revoked}]) == []
    duplicate = REGISTRY_CONTENT + "| Ngân hàng KHÁC HƯ CẤU | 888/GP-NHNN | https://bank-fixture.vn |\n"
    assert _registry_domains([{"url": REGISTRY, "raw_content": duplicate}]) == []


@pytest.mark.parametrize("reverse", [False, True])
@pytest.mark.parametrize("revocation", [
    REGISTRY_CONTENT.replace("999/GP-NHNN", "999/GP-NHNN (đã thu hồi)"),
    REGISTRY_CONTENT.replace("Danh sách các ngân hàng thương mại cổ phần", "Danh sách ngân hàng đã thu hồi giấy phép"),
    "# Danh sách ngân hàng đã thu hồi giấy phép\n| Tên ngân hàng |\n| --- |\n| Ngân hàng MẪU HƯ CẤU |\n",
])
def test_revocation_overrides_positive_records_in_any_order(reverse, revocation):
    pages = [{"url": REGISTRY, "raw_content": REGISTRY_CONTENT},
             {"url": REGISTRY + "-new", "raw_content": revocation}]
    assert _registry_domains(list(reversed(pages)) if reverse else pages) == []


def test_product_advertising_is_not_repeated_as_a_promise(source):
    source.products = [{"url": PRODUCT, "raw_content": PRODUCT_CONTENT.replace(
        "Vay tiêu dùng tín chấp", "Vay tín chấp 0% — chắc chắn được duyệt",
    )}]
    result = discover_loan_options(PROFILE)
    assert len(result.options) == 1
    assert "0%" not in result.options[0].title
    assert "chắc chắn" not in result.options[0].title


@pytest.mark.parametrize("heading, updates", [
    ("Vay tiêu dùng có tài sản bảo đảm", {"has_asset": False}),
    ("Vay tín chấp theo lương", {"has_salary": False}),
])
def test_explicit_incompatible_requirements_excluded(source, heading, updates):
    source.products = [{"url": PRODUCT, "raw_content": PRODUCT_CONTENT.replace("Vay tiêu dùng tín chấp", heading)}]
    assert discover_loan_options(PROFILE.model_copy(update=updates)).options == []


@pytest.mark.parametrize("reason, expected", [("rate_limit", "giới hạn"), ("upstream_error", "đang lỗi")])
def test_upstream_errors_are_visible_without_secrets_or_stale_data(source, reason, expected):
    def fail(*args, **kwargs):
        raise SearchUnavailable(reason)
    source.search = fail
    result = discover_loan_options(PROFILE)
    assert result.options == []
    assert expected in result.note and "Tra cứu lúc" in result.note


def test_existing_debt_does_not_trigger_search(source):
    result = discover_loan_options(PROFILE.model_copy(update={"purpose": "tra_no_cu"}))
    assert not source.queries and not result.options


def test_off_switch_does_not_trigger_search(source, monkeypatch):
    monkeypatch.setattr(live_lending, "settings", replace(live_lending.settings, loan_search_mode="off"))
    assert "đang tắt" in discover_loan_options(PROFILE).note
    assert not source.queries


@pytest.mark.parametrize("url", ["javascript:alert(1)", "https://localhost/a", "https://bank-fixture.vn\\@evil.vn"])
def test_url_rejects_unsafe_values(url):
    assert _url(url) is None

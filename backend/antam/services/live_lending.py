"""Tra cứu theo yêu cầu: danh sách NHNN → domain chính thức → trang sản phẩm.

Không lấy khoản vay từ CSV, không coi snippet hoặc câu trả lời AI là báo giá.
Thiếu bằng chứng ràng buộc pháp nhân/domain thì không đưa kênh vay ra giao diện.
"""

import hashlib
import ipaddress
import re
import unicodedata
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from urllib.parse import urlsplit, urlunsplit

from antam.config import settings
from antam.schemas.need import NeedProfile, Option
from antam.services.web_search import SearchUnavailable, TavilySearch

VIETNAM = timezone(timedelta(hours=7))
REGISTRY_HOSTS = {"sbv.gov.vn", "www.sbv.gov.vn"}


@dataclass(frozen=True)
class VerifiedDomain:
    name: str
    host: str
    registry_url: str


@dataclass
class Discovery:
    options: list[Option]
    note: str


def _plain(text: str) -> str:
    decomposed = unicodedata.normalize("NFD", text.casefold()).replace("đ", "d")
    return re.sub(r"\s+", " ", "".join(c for c in decomposed if unicodedata.category(c) != "Mn")).strip()


def _url(value: object, *, allow_http: bool = False) -> str | None:
    if not isinstance(value, str) or len(value) > 2000 or re.search(r"[\s\\\x00-\x1f]", value):
        return None
    try:
        parts = urlsplit(value)
        if parts.scheme not in ({"http", "https"} if allow_http else {"https"}):
            return None
        if parts.username or parts.password or parts.port not in (None, 443):
            return None
        host = parts.hostname or ""
        if not re.fullmatch(r"[a-z0-9]+(?:[a-z0-9.-]*[a-z0-9])?\.vn", host):
            return None
        try:
            ipaddress.ip_address(host)
            return None
        except ValueError:
            pass
        return urlunsplit((parts.scheme, host, parts.path or "/", parts.query, ""))
    except ValueError:
        return None


def _registry_domains(pages: list[dict]) -> list[VerifiedDomain]:
    verified: dict[str, VerifiedDomain] = {}
    ambiguous: set[str] = set()
    denied_hosts: set[str] = set()
    denied_names: set[str] = set()
    for page in pages:
        if not isinstance(page, dict):
            continue
        url = _url(page.get("url"))
        content = page.get("raw_content")
        if not url or urlsplit(url).hostname not in REGISTRY_HOSTS or not isinstance(content, str):
            continue
        heading = next((line.lstrip("# ") for line in content.splitlines() if line.startswith("# ")), "")
        revoked_page = any(term in _plain(heading) for term in ("thu hoi", "cham dut", "giai the"))
        if not revoked_page and not re.search(
            r"danh sach (?:cac )?(?:ngan hang|cong ty tai chinh)", _plain(heading),
        ):
            continue
        columns: tuple[int, int | None, int | None] | None = None
        for line in content.splitlines():
            if not line.strip().startswith("|"):
                columns = None
                continue
            cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
            normalized = [_plain(cell) for cell in cells]
            names = [i for i, cell in enumerate(normalized) if "ten" in cell and
                     any(word in cell for word in ("ngan hang", "to chuc", "cong ty"))]
            websites = [i for i, cell in enumerate(normalized) if "website" in cell or "trang thong tin" in cell]
            licenses = [i for i, cell in enumerate(normalized) if "giay phep" in cell]
            if names:
                columns = names[0], websites[0] if websites else None, licenses[0] if licenses else None
                continue
            if columns is None or len(cells) <= max(i for i in columns if i is not None):
                continue
            name = cells[columns[0]]
            website = cells[columns[1]] if columns[1] is not None else ""
            license_text = cells[columns[2]] if columns[2] is not None else ""
            if not any(word in _plain(name) for word in ("ngan hang", "cong ty tai chinh")):
                continue
            hosts = set()
            for link in re.findall(r"https?://[^\s<>)\]]+", website):
                candidate = _url(link, allow_http=True)
                if candidate and urlsplit(candidate).hostname not in REGISTRY_HOSTS:
                    hosts.add(urlsplit(candidate).hostname.removeprefix("www."))
            clean_name = re.sub(r"\[([^]]+)\]\([^)]+\)", r"\1", name).strip(" *")[:200]
            if revoked_page or any(term in _plain(line) for term in ("thu hoi", "cham dut hoat dong", "giai the")):
                denied_names.add(_plain(clean_name))
                denied_hosts.update(hosts)
                continue
            if not re.search(r"\d+.*(?:gp|nh)", _plain(license_text)):
                continue
            if len(hosts) == 1:
                host = hosts.pop()
                if host in verified and verified[host].name != clean_name:
                    ambiguous.add(host)
                verified[host] = VerifiedDomain(clean_name, host, url)
    return [entry for host, entry in verified.items() if host not in ambiguous | denied_hosts
            and _plain(entry.name) not in denied_names][:30]


def _product_title(content: str) -> str | None:
    title = next((line.lstrip("# ").strip() for line in content.splitlines() if line.startswith("# ")), "")
    normalized = _plain(title)
    if not any(term in normalized for term in ("vay tieu dung", "vay tin chap", "vay phuc vu doi song")):
        return None
    # Chỉ trang sản phẩm, không dùng bài tư vấn, tin ưu đãi cũ hoặc bài tổng hợp.
    if any(term in normalized for term in ("huong dan", "kinh nghiem", "top ", "la gi", "tin tuc")):
        return None
    return title[:200]


def _discover(profile: NeedProfile, client: TavilySearch, stamp: datetime) -> Discovery:
    registry_hits = client.search(
        "danh sách ngân hàng thương mại công ty tài chính giấy phép website", ["sbv.gov.vn"], limit=3,
    )
    registry_urls = []
    for hit in registry_hits[:3]:
        url = _url(hit.get("url")) if isinstance(hit, dict) else None
        if url and urlsplit(url).hostname in REGISTRY_HOSTS and url not in registry_urls:
            registry_urls.append(url)
    if not registry_urls:
        return Discovery([], "Chưa tìm được danh sách tổ chức tín dụng từ NHNN để đối chiếu.")
    pages = client.extract(registry_urls)
    allowed_pages = [page for page in pages if isinstance(page, dict) and _url(page.get("url")) in registry_urls]
    domains = _registry_domains(allowed_pages)
    if not domains:
        return Discovery([], "Nguồn NHNN chưa đủ dữ liệu đối chiếu pháp nhân, giấy phép và website chính thức.")
    hits = client.search("sản phẩm vay tiêu dùng vay tín chấp điều kiện lãi suất phí", [d.host for d in domains])
    candidates: dict[str, VerifiedDomain] = {}
    for hit in hits[:6]:
        url = _url(hit.get("url")) if isinstance(hit, dict) else None
        if not url:
            continue
        host = urlsplit(url).hostname.removeprefix("www.")
        match = next((d for d in domains if host == d.host), None)
        if match:
            candidates[url] = match
        if len(candidates) == 6:
            break
    if not candidates:
        return Discovery([], "Chưa tìm được trang sản phẩm thuộc website đã đối chiếu với NHNN.")
    product_pages = client.extract(list(candidates))
    options: list[Option] = []
    sources: set[str] = set()
    seen: set[str] = set()
    for page in product_pages:
        if not isinstance(page, dict):
            continue
        url = _url(page.get("url"))
        content = page.get("raw_content")
        if not url or url not in candidates or url in seen or not isinstance(content, str):
            continue
        title = _product_title(content)
        if title is None or len(content.strip()) < 150:
            continue
        normalized_title = _plain(title)
        if (profile.has_asset is False and "co tai san bao dam" in normalized_title
                and "khong co tai san bao dam" not in normalized_title):
            continue
        if profile.has_salary is False and "theo luong" in normalized_title:
            continue
        lender = candidates[url]
        options.append(Option(
            kind="loan_channel", option_id="live_" + hashlib.sha256(url.encode()).hexdigest()[:20],
            title=f"{lender.name} — Thông tin vay tiêu dùng",
            cost_note=("Xem lãi suất, phí và điều kiện tại trang chính thức; "
                       "chưa có báo giá cá nhân để tính chi phí thật."),
            speed="Cần bên cho vay thẩm định; chưa xác minh thời gian giải ngân",
            fit="kho" if profile.bad_debt == "co" else "co_the", source_url=url, updated_at=stamp.date().isoformat(),
        ))
        sources.add(lender.registry_url)
        seen.add(url)
        if len(options) == 3:
            break
    if not options:
        return Discovery([], "Chưa đọc được trang sản phẩm đủ căn cứ; không dùng đoạn trích tìm kiếm thay báo giá.")
    return Discovery(options, "Đối chiếu danh sách NHNN: " + ", ".join(sorted(sources)) +
                     ". Chưa xác nhận khoản vay phù hợp số tiền, điều kiện hoặc hạn cần tiền của bạn.")


def discover_loan_options(profile: NeedProfile) -> Discovery:
    """Mỗi lần gọi tra cứu lại; lỗi không fallback CSV hoặc giả kết quả thành công."""
    if settings.loan_search_mode == "off":
        return Discovery([], "Tra cứu kênh vay trực tuyến đang tắt.")
    stamp = datetime.now(VIETNAM)
    if profile.purpose == "tra_no_cu":
        return Discovery([], "Ưu tiên trao đổi lịch trả với bên cho vay; chưa tự đề xuất khoản vay mới để trả nợ cũ.")
    try:
        result = _discover(profile, TavilySearch(settings.tavily_api_key), stamp)
    except SearchUnavailable as exc:
        detail = ("Dịch vụ tìm kiếm đang giới hạn lượt truy cập." if exc.reason == "rate_limit"
                  else "Nguồn tra cứu đang lỗi.")
        result = Discovery([], "Chưa tra cứu được kênh vay trực tuyến. " + detail)
    checked = stamp.strftime("%d/%m/%Y %H:%M:%S")
    result.note += f" Tra cứu lúc {checked} (giờ Việt Nam); đây không phải ngày ngân hàng cập nhật biểu phí."
    return result

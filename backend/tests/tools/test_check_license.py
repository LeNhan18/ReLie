from antam.tools.check_license import Lender, check_license, normalize

LENDERS = [
    Lender("Công ty Tài chính TNHH MTV Ví dụ Một", "cty_tai_chinh", "test"),
    Lender("Ngân hàng TMCP Ví dụ Hai", "ngan_hang", "test"),
]


def test_normalize_strips_accents_and_legal_prefix():
    assert normalize("Công ty Tài chính TNHH MTV Ví dụ Một") == normalize("ví dụ một")


def test_found():
    assert check_license("Ví Dụ Một", LENDERS).status == "credit_institution"


def test_not_found():
    assert check_license("XanhCash", LENDERS).status == "not_found"
    assert check_license("", LENDERS).status == "not_found"

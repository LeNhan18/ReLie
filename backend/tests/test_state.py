import unicodedata

import pytest

from antam.services.state import classify_intent, classify_state


@pytest.mark.parametrize("text, expected", [
    ("Tôi đang thiếu tiền sinh hoạt, phải làm sao?", "chua_biet"),
    ("Có cách nào xoay tiền đóng học phí không?", "chua_biet"),
    ("Tôi chưa vay và chưa biết bắt đầu từ đâu.", "chua_biet"),
    ("Tôi phân vân có nên vay để trả tiền nhà.", "do_du"),
    ("Tôi sợ lãi cao nên còn do dự.", "do_du"),
    ("Tôi chưa chắc có nên ký hợp đồng vay.", "do_du"),
    ("Tôi quyết tâm vay để đóng học phí.", "quyet_tam_vay"),
    ("Tôi nhất định vay khoản này.", "quyet_tam_vay"),
    ("Tôi sẽ vay, giúp tôi xem hợp đồng.", "quyet_tam_vay"),
    ("Tôi đã vay ba triệu tuần trước.", "da_vay"),
    ("Tôi vay rồi, còn mười ngày nữa đến hạn.", "da_vay"),
    ("Tôi đang trả góp khoản vay mỗi tháng.", "da_vay"),
    ("App đang đòi nợ tôi liên tục.", "bi_doi_no"),
    ("Tôi bị đe dọa vì chưa trả được khoản vay.", "bi_doi_no"),
    ("Họ gọi người thân ép trả nợ.", "bi_doi_no"),
])
def test_fifteen_sample_sentences(text, expected):
    assert classify_state(text) == expected


@pytest.mark.parametrize("text, expected", [
    ("", "chua_biet"),
    ("  \n!? ", "chua_biet"),
    ("TOI BI DOI NO LIEN TUC!", "bi_doi_no"),
    ("TÔI ĐÃ VAY, giờ đang phân vân có nên vay tiếp.", "da_vay"),
    ("Tôi đã vay và đang bị đòi nợ, tôi sẽ vay tiếp.", "bi_doi_no"),
    ("Tôi còn do dự nhưng đã quyết định vay.", "quyet_tam_vay"),
    ("Tôi chưa bị đòi nợ nhưng đã vay.", "da_vay"),
    ("Tôi sợ bị đòi nợ nếu vay.", "chua_biet"),
    ("Nếu tôi vay rồi bị đòi nợ thì sao?", "chua_biet"),
    ("Tôi không quyết định vay.", "chua_biet"),
    ("Không có gì mới.", "chua_biet"),
    ("Tôi không hề bị đe dọa.", "chua_biet"),
    ("Tôi đang trả nợ, chưa bị đòi nợ.", "da_vay"),
    ("Tôi chưa chắc sẽ vay.", "do_du"),
    ("Tôi không chắc mình sẽ vay.", "do_du"),
    ("Tôi nghe nói có người bị đòi nợ.", "chua_biet"),
    ("Tiền hoàn hàng đã về tài khoản.", "chua_biet"),
    ("Khoản vay mới đã về tài khoản sáng nay.", "da_vay"),
    ("Tôi muốn vay mà ngại phí cao.", "do_du"),
])
def test_normalization_priority_and_negation(text, expected):
    assert classify_state(text) == expected


def test_decomposed_vietnamese():
    assert classify_state(unicodedata.normalize("NFD", "Tôi bị đe doạ")) == "bi_doi_no"


@pytest.mark.parametrize("text, expected", [
    ("Mua điện thoại trả góp có nên không?", "tra_gop"),
    ("TOI MUON MUA TRUOC TRA SAU", "tra_gop"),
    ("Báo giá góp 0% có phí gì?", "tra_gop"),
    ("Tôi phân vân mua xe trả góp", "tra_gop"),
    ("Tôi không muốn mua trả góp", None),
    ("Tôi không mua điện thoại trả góp", None),
    ("Tôi không muốn mua xe trả góp", None),
    ("Tôi chỉ góp 0 đồng", None),
    ("Tôi muốn xem báo giá góp 0 phần trăm", "tra_gop"),
    ("Tôi chưa cần trả góp", None),
    ("Tôi nghe nói mua trước trả sau", None),
    ("Tôi đang trả góp điện thoại", None),
    ("Tôi bị đòi nợ nhưng muốn mua trả góp", None),
    ("Tôi vay rồi và muốn mua trước trả sau", None),
    ("", None),
    ("Tôi muốn mua điện thoại bằng tiền dành dụm", None),
])
def test_installment_intent_preserves_existing_debt_priority(text, expected):
    assert classify_intent(text) == expected


def test_installment_intent_accepts_decomposed_vietnamese():
    assert classify_intent(unicodedata.normalize("NFD", "Mua trả góp")) == "tra_gop"

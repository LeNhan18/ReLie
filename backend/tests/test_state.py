import unicodedata

import pytest

from antam.services.state import classify_state


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
])
def test_normalization_priority_and_negation(text, expected):
    assert classify_state(text) == expected


def test_decomposed_vietnamese():
    assert classify_state(unicodedata.normalize("NFD", "Tôi bị đe doạ")) == "bi_doi_no"

---
paths:
  - data/**
  - eval/contracts/**
---

# Quy tắc cho dữ liệu seed và mẫu

- `legal_params.yaml`: luật đổi → thêm dòng mới với `effective_from` mới, đóng `effective_to` dòng cũ; KHÔNG sửa giá trị cũ (khoản vay cũ phải tính theo luật lúc giao kết). Bắt buộc `source_doc`, `last_verified`.
- `rules.yaml`: biến trong `condition` phải là fact do `backend/antam/services/assess.py::build_facts` tạo, hoặc `p_<tên tham số>`. Lời nhắn dùng "có dấu hiệu".
- `legal_snippets.yaml`: chỉ điền nguyên văn từ nguồn chính thức (CSDL quốc gia về văn bản pháp luật), kèm link. Không tự diễn đạt lại điều luật.
- `lenders.csv`, `loan_channels.csv`: chỉ dữ liệu từ nguồn công khai chính thức, mỗi dòng có URL/nguồn và `last_verified`. Không bịa số liệu cho tổ chức có thật.
- `data/samples/`, `eval/contracts/`: chỉ mẫu HƯ CẤU, ghi chú rõ "hư cấu". Không bao giờ đưa hợp đồng/ảnh thật của người dùng vào repo.

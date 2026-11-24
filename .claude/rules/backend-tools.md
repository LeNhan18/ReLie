---
paths:
  - backend/antam/tools/**
  - backend/tests/tools/**
---

# Quy tắc cho tool tính toán (phải đúng 100%)

- Dòng tiền: dương = người vay nhận, âm = người vay trả. Đơn vị: VND nguyên (int).
- `apr_simple` = lãi kỳ (từ IRR theo ngày) × số kỳ/năm, kỳ = khoảng cách phổ biến giữa các lần trả (trả một lần → cả kỳ hạn). Đây là con số dùng để so với trần %/năm của luật. `apr_effective` (lãi kép) chỉ để tham khảo.
- Không dùng thư viện tài chính ngoài nếu tự viết được và test được; IRR dùng chia đôi với cận dưới -50%/ngày (cận thấp hơn gây underflow khi kỳ hạn dài).
- Mọi hàm công khai mới cần test: ca thường, ca biên (đúng ngưỡng), ca lỗi (ném lỗi rõ nghĩa). Ca bắt buộc giữ nguyên: XanhCash (~1042.86%/năm), góp ngày (~1.37%/ngày), lãi phẳng 1%/tháng (~22%/năm), vay ngân hàng thường (~4%/năm).
- Không import từ `antam.ai` hay gọi mạng trong `tools/`.

---
description: Chạy bộ đánh giá trích xuất hợp đồng (độ chính xác từng trường) sau khi đổi prompt hoặc model. Tốn tiền Bedrock — chỉ chạy khi cần.
---

1. Kiểm tra `eval/contracts/` có cặp `<id>.jpg` + `<id>.label.json`; nếu trống, báo người dùng cần thêm mẫu hư cấu trước và dừng.
2. Nhắc người dùng lệnh này gọi Bedrock thật (tốn credits) và hỏi xác nhận trước khi chạy.
3. Chạy: `cd backend && AI_MODE=bedrock python ../eval/run_extract_eval.py` (cần `BEDROCK_MODEL_EXTRACT` và AWS credentials trong môi trường của người dùng — không đọc `.env`).
4. So sánh với file gần nhất trong `eval/results/`: trường nào giảm độ chính xác thì nêu rõ, gợi ý chỉnh prompt `backend/antam/prompts/extract_loan_terms.md`.
5. Tóm tắt 3 con số đưa lên slide: độ chính xác trường tiền, trường ngày, phát hiện điều khoản dữ liệu.

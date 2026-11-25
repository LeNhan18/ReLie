# Đề bài cho Codex — vòng 2 (thư mục `E:\ReLie\agents\codex`, nhánh `feat/backend-codex`)

Bước 0: `git pull origin main` (lấy hợp đồng v1.1 và code mới nhất). Chỉ mở và làm việc trong thư mục này.
Đọc: `AGENTS.md`, `docs/api-contract.md` (phần v1.1), `.claude/rules/backend-tools.md`, `.claude/rules/seed-data.md`.
Chỉ sửa: `backend/**`, `data/seed/**`, `data/samples/**`, `eval/**`.

## Việc (theo thứ tự, mỗi việc một commit, push lên `origin feat/backend-codex` sau mỗi việc)
1. **`/need/options` v1.1:** thêm `free_text` vào `NeedProfile`, `state` + `suggested_flow` vào `NeedOptions`, mục `harm_reduction` khi `quyet_tam_vay`. Dùng `classify_state`. Test: mỗi trạng thái → đúng `suggested_flow`; không có `free_text` → `chua_biet`; request cũ (không có `free_text`) vẫn chạy.
2. **Mẫu tin nhắn:** tạo `data/seed/message_templates.yaml` với 3 mẫu trong hợp đồng (giọng lịch sự, ngắn; đơn trình báo theo bố cục đơn trình báo thông thường: kính gửi cơ quan công an nơi cư trú, thông tin người trình báo, nội dung sự việc, đề nghị, ký tên — KHÔNG trích điều luật cụ thể). `/messages/draft` tìm trong cả `alternatives.yaml` và file mới. Thêm `GET /messages/templates?context=...` (trường `context` khai báo trong YAML). Test cho cả 3 mẫu và mẫu không tồn tại → 404.
3. **Kiểm tra đầu vào `/loan/extract`:** chỉ nhận `image/jpeg`, `image/png`, `image/webp` (415 nếu khác); `text` ≤ 5000 ký tự (413); `sample_id` chỉ chấp nhận tên có trong `data/samples/` (404, chặn `../`). Test cho từng ca.

## Không làm
Không nối Bedrock thật, không sửa `infra/`, `frontend/`, `docs/`, `.claude/`. Không tự điền `lenders.csv` / `loan_channels.csv` (cần nguồn chính thức — việc của Lê). Cần đổi hợp đồng → ghi `docs/tasks/codex-questions.md` và dừng phần đó.

## Xong khi
`cd backend && python -m pytest -q && ruff check .` sạch, đã push.

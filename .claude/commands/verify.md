---
description: Kiểm tra toàn bộ trước khi commit hoặc nộp bài — test, lint, kiểu, build, quét quy tắc miền. Trả về READY hoặc NOT-READY.
---

Chạy lần lượt, ghi lại kết quả từng bước (bỏ qua bước nào thiếu toolchain và ghi rõ "bỏ qua: chưa cài X"):

1. Backend test: `cd backend && python -m pytest -q`
2. Backend lint: `cd backend && ruff check .`
3. Frontend kiểu: `cd frontend && npx tsc --noEmit` (cần `npm install` trước)
4. Frontend build: `cd frontend && npm run build` (chỉ khi đổi cấu hình, phụ thuộc, hoặc trước khi nộp bài)
5. Quét quy tắc miền bằng Grep:
   - Có hàm công khai mới trong `backend/antam/tools/` mà không có test tương ứng trong `backend/tests/tools/`?
   - Có `print(` trong `backend/antam/` hoặc `console.log` trong `frontend/app`, `frontend/components`, `frontend/lib`?
   - Có `dangerouslySetInnerHTML` hoặc `localStorage` lưu thứ khác ngoài `anon_id`?
   - Có cụm "vi phạm pháp luật" trong `data/seed/rules.yaml` hoặc `backend/antam/prompts/`?
   - Mọi dòng `legal_params.yaml` có `source_doc` và `last_verified`?
6. Nếu diff chạm `backend/antam/tools/` hoặc `data/seed/rules.yaml`: gọi agent `correctness-reviewer` (truyền danh sách file đã đổi trong prompt).
7. Nếu diff chạm upload, `backend/antam/ai/`, `backend/antam/prompts/`, lưu trữ hoặc `infra/`: gọi agent `security-reviewer` (truyền danh sách file đã đổi).

Kết luận: **READY** chỉ khi bước 1–3 sạch, không có vi phạm ở bước 5, và mọi reviewer được gọi trả PASS. Ngược lại **NOT-READY** kèm danh sách việc cần sửa theo thứ tự ưu tiên.

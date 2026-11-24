---
paths:
  - frontend/**
---

# Quy tắc frontend

- App Router; trang có tương tác dùng `"use client"`. Gọi API chỉ qua `frontend/lib/api.ts`.
- Kiểu trong `lib/api.ts` khớp schema pydantic (`backend/antam/schemas/`), giữ tên trường snake_case.
- Giao diện cho người lớn tuổi và người đang hoảng: nút lớn, mỗi màn hình một việc, tiếng Việt đời thường, có trạng thái tải/lỗi/rỗng.
- Không tự tính hay làm tròn lại con số tiền/lãi — hiển thị đúng số backend trả.
- Không localStorage cho dữ liệu nhạy cảm (chỉ `anon_id`). Không `dangerouslySetInnerHTML` với đầu ra model.
- `next build` không kiểm tra kiểu đầy đủ trong mọi cấu hình — luôn chạy `npx tsc --noEmit`.

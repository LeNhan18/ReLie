# Đề xuất hợp đồng API từ Antigravity (`agy`)

## 1. Đề xuất thêm `POST /harassment/analyze` (OCR ảnh chụp màn hình tin nhắn/cuộc gọi)

- **Bối cảnh**: Người dùng muốn tải ảnh chụp màn hình tin nhắn/cuộc gọi quấy rối ở trang `/harassment` ("Sổ bằng chứng") để tự động trích xuất thông tin điền vào form, tránh phải gõ tay khi đang hoảng loạn.
- **Request**: `multipart/form-data` với trường `file` (ảnh JPEG/PNG ≤ 4MB, frontend đã resize ≤ 1600px trên trình duyệt, không lưu ảnh gốc).
- **Response** (`200 OK`):
```json
{
  "occurred_at": "2026-11-26T09:15",
  "channel": "zalo",
  "sender_info": "Zalo 'Hỗ Trợ Hồ Sơ Nhanh' (0909xxx412)",
  "summary": "Nhắn tin đe doạ gửi ảnh cắt ghép cho danh bạ nếu không chuyển phí gia hạn trước 12h00."
}
```
- **Ghi chú**:
  - `channel` thuộc một trong: `"call" | "sms" | "zalo" | "facebook" | "in_person"` (hoặc `null` nếu không chắc).
  - Các trường đều có thể `null` nếu ảnh không rõ; frontend luôn cho người dùng xem lại và sửa trước khi bấm thêm vào dòng thời gian.
  - Khi `AI_MODE=mock`, backend có thể trả mẫu cố định giống cơ chế `/loan/extract`.
  - Frontend (`frontend/lib/api.ts` và `frontend/app/harassment/EvidenceSection.tsx`) đã nối sẵn endpoint này và tự xử lý mềm khi backend trả `404`.

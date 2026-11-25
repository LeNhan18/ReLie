# Các điểm cần chốt trước khi mở rộng API v1

`docs/api-contract.md` hiện đã đóng băng. Các luồng dưới đây có trong kế hoạch kiến trúc, cần Lê chốt hợp đồng để Codex và AGY cùng triển khai.

| Luồng | Đề xuất để duyệt |
|---|---|
| Bị đòi nợ và trình báo | Chốt `POST /harassment/analyze` với đầu vào xử lý trong bộ nhớ, trả các sự kiện và mức độ chắc chắn. `POST /reports/pdf` có thể trả file trực tiếp. Chốt cách che dữ liệu cá nhân và bỏ S3 cho ảnh gốc theo quy tắc hiện tại. |
| Kế hoạch tiền và nợ | Giữ `POST /plan/today` để tính từ dữ liệu nhập. Chốt API lưu kế hoạch, ghi chi tiêu và xoá dữ liệu, cùng cơ chế xác thực quyền đọc/xoá (UUID ẩn danh là định danh, không tự xác thực). |
| Nhắc trả nợ | Chọn xuất `.ics` trực tiếp hay lưu lịch nhắc phía máy chủ. Chốt định dạng, múi giờ và vòng đời dữ liệu. |
| Phản hồi kết quả | Chốt có đưa `/feedback/outcome` vào v1 hay không. Nếu có, xác định mã lựa chọn, trạng thái và thời hạn lưu. |
| Kênh vay đã xác minh | Duyệt danh sách tổ chức và sản phẩm từ nguồn chính thức có ngày xác minh trước khi hiện gợi ý. |

Sau khi chốt API, AGY có thể nối các luồng mới và quyết định vị trí hiển thị ba mẫu bổ sung. Đánh giá trích xuất thật, duy trì bản triển khai và thu phản hồi người dùng cần phiên riêng có dữ liệu và quyền phù hợp.

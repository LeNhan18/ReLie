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

## Áp dụng `docs/antam-ai/assistants.md` — 2026-11-26

Đã chuẩn bị trong backend, không mở API mới:

- `tools.compare_loans.compare_loans`: so 2–4 `ConfirmedLoan` cùng tiền thực nhận, cùng ngày giải ngân; trả chi phí từng phương án và mọi chỉ số hòa tổng trả thấp nhất. APR trả riêng; kết quả không xác nhận giấy phép hoặc khuyến nghị vay. Chỉ tính lịch trả đã xác nhận, không cộng phí gia hạn chưa phát sinh.
- `services.state.classify_intent`: nhận `tra_gop` bằng từ khóa, giữ nguyên năm `UserState`; ưu tiên tình huống đang bị đòi nợ/đã vay. Chưa có endpoint định tuyến.
- Lời giải thích dùng tổng trả trong toàn kỳ hạn theo lịch đã xác nhận, không mô tả mọi kỳ góp như cùng đến hạn vào ngày cuối.

Các phần cần Lê chốt trong hợp đồng trước khi Codex mở API và AGY nối giao diện:

| Phần | Đề xuất / quyết định còn thiếu |
|---|---|
| `POST /loan/compare` | Request `{loans: ConfirmedLoan[]}` (2–4); response dự kiến `{options: [{index, amount_received, total_repaid, total_cost, apr_simple, term_days}], cheapest_indices: int[]}`. Giữ mọi phương án hòa; lỗi 422 tiếng Việt nếu số tiền hoặc ngày giải ngân khác nhau. Chưa triển khai route/schema công khai. |
| Mua thẳng và trả trước | Chốt `cash_price`, `down_payment`, phí bắt buộc trả ngày 0 và phần được tài trợ. Không coi giá hàng là tiền mặt thực nhận, không cộng trả trước hai lần. Cần mẫu có kết quả đúng được duyệt trước khi thêm `bao_gia_tra_gop` vào prompt/phân loại tài liệu. |
| Thử khoản góp mới | Chốt shape `new_installment` của `/plan/today`, nhãn phân biệt khoản mới với nợ cũ, response so sánh thiếu hụt trước/sau. Tool hiện chỉ dự báo đến ngày lương tiếp theo, chưa đủ dữ liệu để hứa cảnh báo mọi kỳ trước 7 ngày hay dự báo cả tháng. |
| PDF | `/loan/extract` hiện chỉ nhận ảnh/text/sample. Chốt hỗ trợ PDF, MIME, dung lượng, số trang, PDF mã hóa/lỗi và xử lý trong bộ nhớ trước khi thêm thư viện hoặc chuyển PDF thành ảnh. |
| Tách nợ trả góp | Công thức hiện tính trên toàn bộ gốc tới hạn cuối theo task đã duyệt. Lịch trả chỉ có tổng tiền mỗi kỳ, thiếu phần gốc/lãi. Cần chốt mô hình dư nợ và thứ tự phân bổ tiền trả cùng mẫu kiểm thử; không tự giả định trả lãi trước hay chia đều gốc để thay công thức pháp lý. |
| Vai cá nhân/thanh toán | AGY phụ trách IndexedDB, xóa toàn bộ, `.ics` Asia/Ho_Chi_Minh nhắc trước 3 và 1 ngày; không lưu ảnh hợp đồng gốc. Chỉ chuẩn bị và xác nhận từng hành động, không gửi thư/chuyển tiền thật. Chưa sửa frontend. |

Không sửa `docs/api-contract.md`, `infra/**`, `.claude/**` hoặc các thay đổi frontend của AGY. Chưa tích hợp LLM/OCR miễn phí trong đợt này: tài liệu assistants không chốt nhà cung cấp/model; kiểm tra vẫn chạy `AI_MODE=mock`.

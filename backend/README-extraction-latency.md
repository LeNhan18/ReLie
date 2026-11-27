# Giới hạn thời gian đọc điều khoản

Ngày 2026-11-27, hai PDF hư cấu sẵn có được đo trong bộ nhớ: lớp chữ đọc được khoảng 0,03–0,42 giây, không chạy OCR. Một lần đọc PDF 5.248 ký tự khác mất 0,156 giây nhưng gọi Qwen không hoàn tất trong 45 giây. Vì vậy chưa có căn cứ quy lỗi này cho Paddle; bước LLM cần được kiểm tra riêng.

`/loan/extract` nhận tối đa một lượt trích xuất đang chạy ở mỗi worker, tránh bấm thử lại tạo hàng đợi model ngay trong ứng dụng. Lượt thứ hai nhận thông báo bận; không gửi thêm tài liệu sang server. Lock luôn được nhả khi thành công hoặc lỗi.

Các lượt LLM của cùng request có chung ngân sách 90 giây, bắt đầu sau khi đọc PDF/OCR. Mỗi call có socket timeout tối đa 60 giây hoặc phần ngân sách còn lại. Lượt sửa schema không được reset ngân sách. Ngay cả khi caller đặt timeout PDF 240 giây, transport trong luồng API vẫn giới hạn như trên. Request timeout nhận thông báo riêng, không trả mẫu hoặc bỏ dữ liệu tài liệu.

Đây là giới hạn chờ và bảo vệ tải, không phải bằng chứng tăng tốc model. Socket timeout là giới hạn chờ I/O, không hủy cứng native OCR, không chắc hủy computation trên vLLM khi client ngừng đợi, và không phải wall-clock deadline tuyệt đối với upstream gửi dữ liệu nhỏ giọt. Kiểm tra deadline sau khi nhận để không chấp nhận kết quả quá hạn. Worker nhiều tiến trình có lock riêng; chạy một worker trên GPU hiện tại.

Không tăng tốc bằng cách cắt bỏ điều khoản, giảm chất lượng ảnh hoặc thay toàn bộ text bằng regex. Để cải thiện thời gian thật cần đo hàng đợi, tốc độ sinh token và tài nguyên server Qwen; không log prompt hoặc nội dung hợp đồng. PDF scan vẫn cần OCR từng trang và không được giới hạn bởi ngân sách chỉ dành cho LLM này.

Thay đổi không thêm endpoint, không đổi response schema, không thêm dependency và không sửa cấu hình server bên ngoài. Các phần hỗ trợ PDF đang được triển khai trong worktree khác được giữ nguyên, không đưa vào commit sửa timeout.

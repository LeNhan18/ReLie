# Tra cứu kênh vay trực tuyến

`POST /need/options` giữ nguyên request/response trong hợp đồng API. Phương án không cần vay đứng trước; các kênh vay được tra cứu khi có yêu cầu, không lấy sản phẩm hoặc biểu phí từ `loan_channels.csv` nữa.

## Cách hoạt động

1. Tavily Search tìm danh sách ngân hàng/công ty tài chính trên `sbv.gov.vn`.
2. Tavily Extract đọc trang danh sách. Chỉ chấp nhận bảng Markdown có tên tổ chức, giấy phép và website trong cùng một dòng. Bản ghi bị thu hồi hoặc domain gán cho nhiều tổ chức bị loại. Không suy tên miền từ thương hiệu.
3. Tìm sản phẩm trên đúng hostname đã đối chiếu, tối đa sáu URL. Không nhận domain tương tự, URL HTTP hoặc chuyển hướng sang domain khác.
4. Đọc lại các URL sản phẩm bằng Extract, tối đa ba lựa chọn. Không dùng snippet hay câu trả lời sinh bởi model thay nguồn sản phẩm.

V1 chỉ nhận trang có tiêu đề sản phẩm vay tiêu dùng/tín chấp/phục vụ đời sống. Nếu dữ liệu không có cấu trúc hỗ trợ, không đủ bằng chứng hoặc dịch vụ lỗi thì trả danh sách không vay kèm lý do. Không fallback sang bảng giá cũ.

`fit` của kênh trực tuyến không được gán `cao`: chưa có dữ liệu đủ để xác nhận hồ sơ được duyệt, hạn mức, thời gian giải ngân hay phù hợp hạn cần tiền. Loại sản phẩm có tiêu đề yêu cầu tài sản/lương khi người dùng nói không có. Nợ xấu chỉ gắn `kho`, không suy ra tổ chức nhận hồ sơ có nợ xấu. Nhu cầu trả nợ cũ không tự động tìm khoản vay mới.

Chưa trích xuất lãi suất/phí thành con số, chưa tính hoặc xếp hạng tổng chi phí từ quảng cáo. Khi có báo giá/lịch trả được xác nhận, dùng luồng `/loan/assess` và các tool tính toán hiện có. Đây là tìm nguồn sản phẩm để tìm hiểu thêm, không phải báo giá cá nhân hoặc so khớp đầy đủ điều kiện vay.

## Cấu hình triển khai

- `LOAN_SEARCH_MODE=tavily` là mặc định. `off` tắt việc tìm kiếm nhưng vẫn trả phương án không cần vay.
- Không có `TAVILY_API_KEY`: dùng header `X-Tavily-Access-Mode: keyless`.
- Có `TAVILY_API_KEY`: dùng Bearer, cấu hình bằng secret của hosting; không đưa key vào frontend hoặc commit. Agent không đọc/tạo `.env`.
- `AI_MODE=mock` vẫn giữ nguyên khi phát triển/kiểm thử. Tìm web là dịch vụ riêng, không bật Bedrock. Các test thay provider/transport bằng fixture và không gọi mạng.

Tối đa bốn API call cho một lần tìm: Search/Extract danh sách NHNN, Search/Extract sản phẩm. Có giới hạn response 2MB, timeout từng call tối đa 6 giây và deadline 20 giây cho chuỗi call; không retry 429. Deadline được kiểm tra giữa các call và sau khi đọc response, không phải cơ chế hủy cứng socket đang đọc chậm. Không cache kết quả trong ứng dụng. Tavily hoặc website nguồn có thể có cache; không cam kết dữ liệu vừa được ngân hàng cập nhật.

Trường `updated_at` là ngày backend kiểm tra nguồn theo giờ Việt Nam; `note` ghi thời điểm bắt đầu tra cứu và URL danh sách NHNN. Đây không phải thời điểm ngân hàng công bố/cập nhật biểu phí. AGY cần ghi nhãn phù hợp ở giao diện và hiển thị `note`, tránh diễn đạt là lãi suất được cập nhật tức thì.

Không gửi tên, định danh, nợ xấu, thu nhập, số tiền hoặc hạn cần tiền sang dịch vụ tìm kiếm; query chỉ có từ khóa sản phẩm công khai. Không đăng ký khoản vay hoặc gửi hồ sơ tới ngân hàng.

## Trạng thái xác minh

Ngày 2026-11-26: smoke Search keyless từ môi trường phát triển trả **HTTP 429**. Chưa xác minh được một luồng thật thành công qua danh sách NHNN tới trang sản phẩm. Các ca thành công trong unit test dùng tên, domain và giấy phép hư cấu. Bảng NHNN thực tế không có mapping website hoặc không ở dạng hỗ trợ sẽ trả không có kênh vay; cần kiểm tra cấu trúc nguồn thật khi kết nối dùng được trước khi coi là sẵn sàng chạy sản phẩm.

Chưa deploy. Cần cấu hình tài khoản/quota tìm kiếm hoạt động và kiểm tra end-to-end trên hosting; cài MCP cho công cụ lập trình không tự cấp quyền tìm kiếm cho backend của sản phẩm.

## Nguồn tích hợp

- [Tavily keyless](https://docs.tavily.com/documentation/keyless): Search/Extract miễn phí có giới hạn; keyless không dành cho tải production lớn.
- [Search API](https://docs.tavily.com/documentation/api-reference/endpoint/search) và [Extract API](https://docs.tavily.com/documentation/api-reference/endpoint/extract): format và chi phí phụ thuộc loại call.
- [Giá dịch vụ](https://www.tavily.com/pricing): tài khoản miễn phí có 1.000 credits/tháng, không cần thẻ; không đồng nghĩa 1.000 lượt tìm trong ứng dụng vì mỗi lượt gồm nhiều call.
- [Tavily MCP](https://docs.tavily.com/documentation/mcp): dùng cùng nhà cung cấp qua MCP nếu môi trường yêu cầu. Backend hiện gọi HTTP trực tiếp để không thêm SDK hoặc tiến trình MCP.

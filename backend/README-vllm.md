# PaddleOCR local + Qwen trên vLLM

Backend hỗ trợ `AI_MODE=paddle_vllm`. OCR dùng model PaddleOCR-VL 1.6 chính thức đã cài; văn bản được gửi tới server Qwen do người vận hành cấu hình. Không cần Groq hoặc AWS key. Các con số/cảnh báo vẫn do tools backend tính; JSON LLM phải qua schema và lời giải thích qua judge.

Cấu hình trong biến môi trường của tiến trình (không tạo/đọc `.env`):

```powershell
$env:AI_MODE = 'paddle_vllm'
$env:LLM_PROVIDER = 'vllm'
$env:LLM_BASE_URL = 'http://<server>:8000/v1'
$env:LLM_MODEL_NAME = 'qwen2.5-7b'
```

URL không chứa dấu backslash escape hoặc dấu backslash cuối dòng. `LLM_API_KEY` tùy chọn nếu server bật xác thực; secret chỉ ở backend. Không gửi key vào chat. Server phải truy cập được từ máy chạy backend; khi deploy phải có đường mạng tới server riêng. Endpoint không được nhận từ dữ liệu request của người dùng. HTTP phù hợp khi đã có lớp mạng riêng tin cậy; dùng HTTPS hoặc tunnel bảo vệ khi cần truyền qua mạng không tin cậy.

Giữ các biến cache/model `PADDLE_PDX_CACHE_HOME`, `HF_HOME`, `MODELSCOPE_CACHE` và `PADDLE_DEVICE` như `README-paddle.md`. Chạy một worker để không tải nhiều bản model vào GPU. Thời gian chờ vLLM 120 giây; không tự chuyển sang Groq/Bedrock khi lỗi. Server có thể ghi log prompt theo cấu hình riêng của bạn; chữ OCR chưa được tự khử định danh.

Backend gọi `/chat/completions`, `max_tokens`, `response_format={"type":"json_object"}`, temperature 0. Chỉ nhận `finish_reason=stop`; phản hồi bị cắt ngắn hoặc schema sai không được dùng như kết quả hợp lệ. Hướng dẫn protocol: https://docs.vllm.ai/en/stable/serving/online_serving/openai_compatible_server/.

Kiểm tra ngày 2026-11-26: endpoint server người dùng cung cấp trả `/models` có `qwen2.5-7b`; request JSON nhỏ đã trả thành công. Không lưu địa chỉ server cá nhân vào cấu hình mặc định trong repo. Smoke dữ liệu hư cấu không phải đo độ chính xác tài liệu khách hàng.

Lần kiểm tra trích xuất khoản vay hư cấu qua connector chưa đạt: quá thời gian chờ 120 giây. Metrics của server lúc kiểm tra có một request chạy và một request chờ; chưa đủ căn cứ kết luận hàng đợi là nguyên nhân duy nhất. Chưa xác nhận end-to-end Paddle → Qwen thành công. Unit test 265 ca và lint đạt, review connector PASS.

Tiến trình backend cổng 8000 đang chạy trước thay đổi này chưa được khởi động lại: thao tác dừng/khởi động lại bị bộ kiểm duyệt tự động từ chối với lý do chung `blocked by policy`. Người vận hành cần khởi động lại backend bằng cấu hình trên để app dùng connector mới. Không ghi cấu hình vào `.env` trong phiên agent.

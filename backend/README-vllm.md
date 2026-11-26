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

Kiểm tra ngày 26/11/2026: endpoint người dùng cung cấp trả `/models` có `qwen2.5-7b` và hoàn tất JSON qua connector. Backend local đã được khởi động lại bằng lệnh bên dưới: `/health` trả `ok`, `/loan/extract` gọi model thật và trả HTTP 200 với nội dung cấu hình người dùng đã cung cấp, không dùng `sample_id`. Đây là kiểm tra đường gọi API, không phải kiểm thử trên hợp đồng vay thật hoặc xác minh OCR. 272 unit test và Ruff đạt; review bảo mật PASS. Không lưu địa chỉ server cá nhân vào cấu hình mặc định trong repo.

## Khởi động dự án local bằng AI thật

Từ thư mục `backend/`, chạy bằng Python của môi trường đã cài Paddle:

```powershell
.\.venv\Scripts\python.exe -m antam.run_live --base-url http://<server>:8000/v1 --model qwen2.5-7b
```

Lệnh đặt `AI_MODE=paddle_vllm`, `LLM_PROVIDER=vllm` cho tiến trình trước khi nạp app; không đọc hoặc tạo `.env`. Có thể dùng `LLM_BASE_URL` đã đặt thay cho `--base-url`. Thiếu/sai URL thì dừng, không tự dùng mock/Groq/AWS. Backend lắng nghe `127.0.0.1:8000`, khớp địa chỉ API mặc định của frontend. Giữ một worker và tắt access log; cache model mặc định nằm trong `backend/.venv/model-cache`, biến cache tùy chỉnh có sẵn được giữ nguyên. Dùng `--port` khi cổng đã có tiến trình khác; cần cấu hình frontend tương ứng nếu đổi cổng.

Kiểm tra thực tế ngày 26/11/2026: server do người dùng cung cấp đã trả danh sách có `qwen2.5-7b` và hoàn tất một lượt JSON qua connector backend. Đây là kiểm tra kết nối/LLM dựa trên cấu hình thật, chưa xác nhận OCR → trích xuất → đánh giá hợp đồng thật. Endpoint cá nhân không được đặt làm mặc định trong repo. Lời giải thích vẫn qua judge và có thể dùng template an toàn nếu model lỗi hoặc trả sai; template không được tính là model thành công.

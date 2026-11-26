# PaddleOCR-VL 1.6 chính thức

Mode `AI_MODE=paddle_groq` dùng `PaddleOCRVL(pipeline_version="v1.6")` từ package PaddleOCR chính thức. Model tương ứng là `PaddlePaddle/PaddleOCR-VL-1.6`, không thay bằng OCR thường hoặc gọi dịch vụ OCR có model không rõ phiên bản.

Luồng ảnh: JPEG/PNG/WebP → ndarray BGR trong bộ nhớ → PaddleOCR-VL 1.6 → văn bản → Groq `openai/gpt-oss-120b` → kiểm tra schema `LoanTerms`. Luồng nhập chữ gọi Groq trực tiếp. Số tiền/lãi và cảnh báo vẫn do tool backend quyết định. Lời giải thích qua judge và fallback; fallback không được tính là LLM thật đã chạy thành công.

Ảnh không được ghi ra file, log hoặc truyền sang Groq. Markdown OCR không được lưu/log nhưng nội dung chữ được gửi sang Groq; hiện chưa tự khử định danh. Bộ kiểm thử thực tế phải dùng tài liệu đã khử định danh và cấu hình Data Controls của nhà cung cấp phù hợp. Không gọi các hàm `print`, `save_to_json`, `save_to_markdown` của Paddle. Model và cache thư viện được tải khi khởi tạo lần đầu; đây là tài nguyên model, không phải cache hợp đồng người dùng.

## Môi trường riêng

Tại gốc worktree Codex, dùng Python 3.12 và engine phù hợp máy:

```powershell
uv venv --python 3.12 backend/.venv
# NVIDIA GPU / CUDA 12.9, theo hướng dẫn Paddle chính thức:
uv pip install --python backend/.venv/Scripts/python.exe paddlepaddle-gpu==3.3.1 --index-url https://www.paddlepaddle.org.cn/packages/stable/cu129/
uv pip install --python backend/.venv/Scripts/python.exe -e 'backend[paddle,dev]'
```

Không cài đồng thời PaddlePaddle CPU và GPU trong cùng môi trường. Extra `paddle` là tùy chọn vì bộ model/engine lớn và không phù hợp gói Lambda hiện có. Chọn engine bằng lệnh cài riêng theo phần cứng; không đưa các gói GPU vào requirements Lambda. Không sửa hạ tầng hoặc deploy trong lượt này.

Extra ràng buộc Protobuf từ 7.36.1 vì tokenizer của model chính thức đã tải yêu cầu gencode 7.36.1; runtime 6.33.4 đi kèm engine đã gây lỗi khởi tạo thực tế. Đây là ràng buộc tương thích, không phải tính năng mới của ứng dụng.

`PADDLE_DEVICE` mặc định `gpu:0`; có thể đặt `cpu` khi đã cài engine CPU tương ứng. Không tự chuyển CPU hoặc đổi model nếu GPU lỗi; lỗi được báo rõ. Khả năng chạy/độ trễ phải được đo trên thiết bị và ảnh thực tế.

## Kiểm tra model thật độc lập LLM

```powershell
$env:PADDLE_DEVICE = 'gpu:0'
$env:PADDLE_PDX_CACHE_HOME = "$PWD\backend\.venv\model-cache\paddlex"
$env:HF_HOME = "$PWD\backend\.venv\model-cache\huggingface"
$env:MODELSCOPE_CACHE = "$PWD\backend\.venv\model-cache\modelscope"
& .\backend\.venv\Scripts\python.exe .\eval\run_paddle_smoke.py --output .\eval\results\paddle-smoke.json
```

Các biến cache ở trên chuyển weights/cache thư viện vào worktree trên ổ còn đủ chỗ; đặt chúng trước khi khởi động Python và giữ cho tiến trình backend. Không đổi biến HOME hoặc CODEX_HOME. Đây chỉ là model/cache, không lưu ảnh hợp đồng.

Mặc định lệnh tạo ảnh kiểm tra chữ trong bộ nhớ rồi gọi model thật, không lưu ảnh. Kết quả chỉ ghi trạng thái, số ký tự và thời gian; không ghi văn bản OCR. Đây là smoke model thật với dữ liệu tổng hợp, không phải độ chính xác trên hợp đồng thật. Có thể dùng `--image <ảnh đã khử định danh>` để kiểm tra ảnh sẵn có mà không tạo bản sao; chế độ này chỉ kiểm tra đọc ra chữ, chưa có đáp án để chấm chất lượng.

## Chạy backend với OCR và LLM thật

Người dùng tự cấu hình `GROQ_API_KEY` bằng secret của tiến trình/hosting, không gửi khóa vào chat hoặc commit. OCR local không cần `PADDLEOCR_ACCESS_TOKEN`. Sau đó:

```powershell
$env:AI_MODE = 'paddle_groq'
$env:PADDLE_DEVICE = 'gpu:0'
$env:GROQ_MODEL = 'openai/gpt-oss-120b'
& .\backend\.venv\Scripts\python.exe -m uvicorn antam.main:app --app-dir backend --port 8000
```

Thiếu Groq key thì luồng trích xuất báo lỗi trước khi tải OCR; vẫn có thể chạy smoke Paddle độc lập. Các mẫu chọn bằng `sample_id` vẫn là mẫu có sẵn, không dùng chúng để chứng minh gọi model thật. `AI_MODE=mock` chỉ giữ cho unit test hoặc phiên phát triển dùng mẫu; mode chưa hỗ trợ bị từ chối, không tự gọi AWS.

Giới hạn hiện tại: mỗi ảnh tối đa 4MB ở API, 16 triệu pixel khi giải mã, một ảnh/một lượt, văn bản OCR tối đa 50.000 ký tự; mỗi worker chỉ suy luận một lượt để hạn chế tràn VRAM. PDF/Word trong API vẫn chờ chốt hợp đồng, không âm thầm coi PDF là ảnh. Paddle native không tự tạo website trực tuyến; hosting cần máy đủ tài nguyên và cấu hình riêng.

Unit test dùng provider/transport giả để không tải model hoặc tiêu quota. Kết quả unit test không thay cho smoke Paddle, LLM thật hay end-to-end trên hosting.

## Xác minh ngày 2026-11-26

Đã cài trong môi trường riêng của worktree: PaddleOCR 3.7.0, PaddlePaddle GPU 3.3.1 từ index CUDA 12.9, cuDNN 9.9.0.52 và Protobuf 7.36.2. RTX 3050 Laptop 6GB đã chạy model chính thức trên ảnh tổng hợp trong bộ nhớ: smoke PASS, đọc 23 ký tự, khoảng 31 giây gồm khởi tạo. Lần chạy cuối không còn cảnh báo lệch cuDNN của bộ CUDA 12.6 ban đầu. `uv pip check`, 251 unit test và Ruff đạt.

Báo cáo tại `eval/results/paddle-smoke.json` được gitignore. Chưa đo độ chính xác hợp đồng tiếng Việt, chưa thử ảnh/PDF hợp đồng thực tế, chưa gọi Groq thật vì chưa cấu hình key; chưa deploy lên hosting GPU. Không dùng smoke này để tuyên bố toàn bộ luồng AI đã sẵn sàng.

Nguồn: [model chính thức](https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6), [hướng dẫn PaddleOCR](https://www.paddleocr.ai/latest/en/version3.x/pipeline_usage/PaddleOCR-VL.html), [Groq models](https://console.groq.com/docs/models).

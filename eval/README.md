# Bộ đánh giá

## Chuẩn bị kiểm thử tích hợp thật

Chạy từ worktree backend Codex, dùng Python đã cài dependencies:

```powershell
& E:\ReLie\backend\.venv\Scripts\python.exe .\eval\run_live_checks.py --scope all --output .\eval\results\live-readiness.json
```

Lệnh này gọi service tìm khoản vay và dịch vụ web thật, không dùng `sample_id` hoặc fixture. Đây là smoke backend, chưa phải kiểm tra trình duyệt/hosting. `--scope search` chỉ kiểm tra tìm nguồn vay. Exit code 0 chỉ khi phạm vi được chọn đạt; thiếu nguồn xác minh, lỗi quota hoặc phần OCR/LLM chưa chạy trả exit code 1. Các phương án không cần vay không được tính là tìm khoản vay thành công.

Ngày 2026-11-26: lần chạy thật bằng keyless vẫn bị giới hạn truy cập, không tìm được nguồn sản phẩm; OCR/LLM chưa chạy. Biến môi trường `TAVILY_API_KEY`, `GROQ_API_KEY`, `GEMINI_API_KEY` chưa được cấu hình trong môi trường đã kiểm tra. Không đọc `.env` để lấy khóa. Báo cáo nằm trong `eval/results/` đã được gitignore; không commit khóa, ảnh hoặc hợp đồng cá nhân.

Để tiếp tục, người dùng cấu hình `TAVILY_API_KEY` bằng secret của hosting hoặc biến môi trường của tiến trình rồi chạy lại. Không gửi key vào chat. Khi cần OCR/LLM miễn phí, phải triển khai provider tương ứng trước: code hiện chỉ tích hợp Bedrock. Đổi `AI_MODE` tùy ý hoặc thấy template trả lời không chứng minh model thật hoạt động. Phiên này không dùng AWS credentials.

Kiểm thử thật dùng nguồn sản phẩm công khai và, với trích xuất, tài liệu đã khử định danh cùng đáp án người kiểm tra xác nhận. Không lưu ảnh hợp đồng gốc vào repo hoặc báo cáo. File `HU_CAU.pdf` là dữ liệu hư cấu dù có thể gửi qua model thật; không gọi đó là dữ liệu khách hàng thật. Chỉ lưu chỉ số và kết quả đối chiếu tổng hợp, không nội dung hợp đồng hoặc định danh.

Unit test vẫn dùng mock để kiểm tra code mà không phát sinh chi phí; không dùng kết quả unit test làm bằng chứng tích hợp thật.

## Đánh giá trích xuất

- `contracts/`: mỗi mẫu là một cặp `<id>.jpg` (ảnh hợp đồng HƯ CẤU) + `<id>.label.json` (nhãn chuẩn theo schema LoanTerms).
- `run_extract_eval.py`: chạy trích xuất trên mọi mẫu, so từng trường với nhãn, in độ chính xác theo trường.

Chạy (cần AWS credentials và model ở region):
```
cd backend && AI_MODE=bedrock BEDROCK_MODEL_EXTRACT=<model-id> python ../eval/run_extract_eval.py
```
Chạy lại mỗi khi đổi prompt trong `backend/antam/prompts/` hoặc đổi model. Lưu kết quả vào `eval/results/<ngày>.json` để đưa số liệu lên slide.

Runner từ chối chạy với `AI_MODE=mock`/mode chưa hỗ trợ, model chưa cấu hình, bộ mẫu trống hoặc thiếu ảnh ứng với nhãn. Các trường hợp này dừng trước khi gọi model, không tạo báo cáo rỗng như thể đã đo thành công. Hướng dẫn Bedrock ở trên chỉ áp dụng cho phiên được phép dùng AWS; chưa chạy trong đợt chuẩn bị này.

## Phân loại trạng thái

`state_cases.json` có 50 câu tiếng Việt hư cấu, mỗi trạng thái có 10 câu. Bộ câu có ví dụ không dấu và cách diễn đạt gián tiếp để đo cả các trường hợp ngoài từ khóa trực tiếp.

Chạy từ thư mục gốc trong PowerShell:

```powershell
$env:AI_MODE = "mock"
& .\backend\.venv\Scripts\python.exe .\eval\run_state_eval.py --output .\eval\results\state.json
```

Runner gọi trực tiếp bộ phân loại bằng quy tắc. Báo cáo có tỷ lệ đúng tổng thể, tỷ lệ đúng theo từng trạng thái thực tế và ID của những mẫu dự đoán sai. Các tỷ lệ là số từ 0 đến 1. Có thể bỏ `--output` để xem báo cáo trên terminal, hoặc dùng `--cases` để chọn một bộ câu khác cùng định dạng. Điểm đo phản ánh bộ câu hư cấu này.

Bộ câu đã được dùng để phát hiện các trường hợp cần sửa trong bộ phân loại. Hãy dùng một bộ câu mới có nhãn nếu cần đo khả năng phân loại trên dữ liệu độc lập.

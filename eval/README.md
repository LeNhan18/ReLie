# Bộ đánh giá

- `contracts/`: mỗi mẫu là một cặp `<id>.jpg` (ảnh hợp đồng HƯ CẤU) + `<id>.label.json` (nhãn chuẩn theo schema LoanTerms).
- `run_extract_eval.py`: chạy trích xuất trên mọi mẫu, so từng trường với nhãn, in độ chính xác theo trường.

Chạy (cần AWS credentials và model ở region):
```
cd backend && AI_MODE=bedrock BEDROCK_MODEL_EXTRACT=<model-id> python ../eval/run_extract_eval.py
```
Chạy lại mỗi khi đổi prompt trong `backend/antam/prompts/` hoặc đổi model. Lưu kết quả vào `eval/results/<ngày>.json` để đưa số liệu lên slide.

## Phân loại trạng thái

`state_cases.json` có 50 câu tiếng Việt hư cấu, mỗi trạng thái có 10 câu. Bộ câu có ví dụ không dấu và cách diễn đạt gián tiếp để đo cả các trường hợp ngoài từ khóa trực tiếp.

Chạy từ thư mục gốc trong PowerShell:

```powershell
$env:AI_MODE = "mock"
& .\backend\.venv\Scripts\python.exe .\eval\run_state_eval.py --output .\eval\results\state.json
```

Runner gọi trực tiếp bộ phân loại bằng quy tắc. Báo cáo có tỷ lệ đúng tổng thể, tỷ lệ đúng theo từng trạng thái thực tế và ID của những mẫu dự đoán sai. Các tỷ lệ là số từ 0 đến 1. Có thể bỏ `--output` để xem báo cáo trên terminal, hoặc dùng `--cases` để chọn một bộ câu khác cùng định dạng. Điểm đo phản ánh bộ câu hư cấu này.

Bộ câu đã được dùng để phát hiện các trường hợp cần sửa trong bộ phân loại. Hãy dùng một bộ câu mới có nhãn nếu cần đo khả năng phân loại trên dữ liệu độc lập.

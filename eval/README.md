# Bộ đánh giá

- `contracts/`: mỗi mẫu là một cặp `<id>.jpg` (ảnh hợp đồng HƯ CẤU) + `<id>.label.json` (nhãn chuẩn theo schema LoanTerms).
- `run_extract_eval.py`: chạy trích xuất trên mọi mẫu, so từng trường với nhãn, in độ chính xác theo trường.

Chạy (cần AWS credentials và model ở region):
```
cd backend && AI_MODE=bedrock BEDROCK_MODEL_EXTRACT=<model-id> python ../eval/run_extract_eval.py
```
Chạy lại mỗi khi đổi prompt trong `backend/antam/prompts/` hoặc đổi model. Lưu kết quả vào `eval/results/<ngày>.json` để đưa số liệu lên slide.

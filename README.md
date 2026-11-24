# AnTâm

Trợ lý AI giúp người lao động vượt khó tài chính, tránh bẫy tín dụng đen. Dự thi MoMo Tech Contest 2026.

## Chạy local

Backend (Python 3.12):
```bash
cd backend
pip install -e ".[dev]"
python -m pytest -q
uvicorn antam.main:app --reload        # http://localhost:8000/docs
```
Mặc định `AI_MODE=mock`: không gọi Bedrock, dùng mẫu hư cấu trong `data/samples/`.

Frontend (Node 20+):
```bash
cd frontend
npm install
echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local
npm run dev                            # http://localhost:3000
```

## Deploy (AWS SAM)
```bash
python infra/prepare_build.py
sam build -t infra/template.yaml
sam deploy --guided                    # nhập model Bedrock và email nhận cảnh báo ngân sách
```

## Cấu trúc
```
backend/antam/
  tools/      tính toán cố định (IRR, rule engine, giấy phép, dòng tiền) — có unit test
  ai/         Bedrock: trích xuất hợp đồng, viết lời, judge
  prompts/    prompt có phiên bản
  services/   ghép pipeline
  routers/    FastAPI endpoints
  schemas/    pydantic
data/seed/    luật, quy tắc, bên cho vay, kênh vay, phương án không cần vay
data/samples/ mẫu HƯ CẤU cho demo
eval/         bộ đánh giá độ chính xác trích xuất
frontend/     Next.js PWA
infra/        AWS SAM
.claude/      harness cho Claude Code (agents, hooks, rules, commands)
```

## Khai báo theo thể lệ
- **Thư viện mã nguồn mở:** FastAPI, Mangum, Pydantic, PyYAML, python-multipart, boto3, Next.js, React, Tailwind CSS, TypeScript, pytest, ruff.
- **Dịch vụ:** Amazon Bedrock, AWS Lambda, API Gateway, DynamoDB, AWS Budgets, Vercel.
- **Công cụ AI dùng khi phát triển:** Claude Code, Kiro.
- **Nguồn dữ liệu:** cập nhật khi điền `data/seed/` (danh sách tổ chức tín dụng của NHNN, biểu phí công khai, văn bản pháp luật chính thức).
- **Mẫu hợp đồng:** toàn bộ là hư cấu, tạo cho kiểm thử.

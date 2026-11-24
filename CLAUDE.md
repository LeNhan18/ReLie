# CLAUDE.md — AnTâm

Harness này hoạt động theo ba cách:
- **Tự động** — hook chạy mà không cần gọi (in quy tắc cứng đầu phiên, chặn push/deploy, quét bí mật khi commit, chặn sửa `.env`/lockfile, nhắc kiểm tra sau khi sửa file, chạy test khi kết thúc lượt).
- **Theo lời nói** — người dùng nói bình thường, Claude chọn agent/lệnh theo bảng Intent Router.
- **Gọi tên** — người dùng gõ `/verify`, `/eval` hoặc nêu tên agent.

## Project Overview
**Project:** AnTâm — trợ lý AI giúp người lao động vượt khó tài chính, tránh bẫy tín dụng đen (MoMo Tech Contest 2026)
**Stack:** Backend Python 3.12 + FastAPI + Mangum trên AWS Lambda, Amazon Bedrock (VLM/LLM), DynamoDB · Frontend Next.js 15 + React 19 + TypeScript + Tailwind 3 (PWA) · Hạ tầng AWS SAM
**Deployed on:** chưa — local. Dự kiến: backend AWS Lambda + HTTP API (ap-southeast-1), frontend Vercel
**Hạn:** đóng băng tính năng 29/11/2026 · nộp bài trước 18:00 03/12/2026 · bản chấm phải chạy tới hết 11/12/2026
**Tài liệu sản phẩm:** `docs/AnTam_tong_quan.md`, `docs/AnTam_ke_hoach_kien_truc.md`

## Dev Commands

| Gói | Cài đặt | Chạy | Kiểm tra |
|---|---|---|---|
| `backend/` | `pip install -e ".[dev]"` | `uvicorn antam.main:app --reload` (port 8000, `AI_MODE=mock` mặc định) | `python -m pytest -q` · `ruff check .` |
| `frontend/` | `npm install` | `npm run dev` (port 3000, `NEXT_PUBLIC_API_URL` trong `.env.local`) | `npx tsc --noEmit` · `npm run build` |
| `infra/` | AWS SAM CLI | `python infra/prepare_build.py` rồi `sam build -t infra/template.yaml` | `sam validate -t infra/template.yaml` |
| `eval/` | như backend | `/eval` (gọi Bedrock thật, tốn credits) | — |

- `next build` không thay cho kiểm tra kiểu: luôn chạy `npx tsc --noEmit`.
- Lambda chỉ đóng gói `backend/`: phải chạy `infra/prepare_build.py` để chép `data/seed` + `data/samples` vào `backend/` trước `sam build`.
- Máy dev là Windows: trong PowerShell đặt biến bằng `$env:AI_MODE="mock"`, không dùng cú pháp `AI_MODE=mock cmd`.

## Kiến trúc cốt lõi (không được phá)
- `backend/antam/tools/` — code thuần tính tiền/lãi (IRR), rule engine, đối chiếu giấy phép, dự báo dòng tiền. **Mọi con số cho người dùng đến từ đây, có unit test bắt buộc.**
- `backend/antam/ai/` — chỉ đọc (VLM trích xuất → `LoanTerms`) và viết lời; lời LLM qua `judge.check`, trượt thì dùng template.
- `data/seed/rules.yaml` + `legal_params.yaml` — quyết định cảnh báo; tham số chọn theo **ngày giải ngân**. Hai nhánh: `credit_institution` (không dùng trần 20%) và `non_credit_institution`.
- `backend/antam/services/assess.py::build_facts` — nguồn duy nhất của tên biến mà `rules.yaml` được dùng.
- Ảnh xử lý trong bộ nhớ, không ghi đĩa/S3/log.

## Intent Router

| Nếu người dùng nói… | Gọi trước |
|---|---|
| "lên kế hoạch", "làm luồng X thế nào", tính năng mới chạm cả hai phía | `planner` → lưu vào `.claude/specs/<tính-năng>/PLAN.md` |
| sửa/thêm API, tool tính toán, prompt, seed | `backend-engineer` |
| sửa/thêm màn hình, component, gọi API | `frontend-engineer` |
| "lỗi", "sai số", "tính sai lãi", "bug" | đọc code + chạy test, rồi `backend-engineer`/`frontend-engineer`; review bằng `correctness-reviewer` |
| "review", "có bug không", trước khi commit thay đổi tool/rule | `correctness-reviewer` |
| "bảo mật", "quyền riêng tư", "prompt injection", sửa upload/AI/infra | `security-reviewer` |
| sửa luật, biểu phí, kênh vay, mẫu hư cấu, lưu trữ DynamoDB | `data-guard` |
| "đổi prompt", "đổi model", "đo độ chính xác" | `/eval` |
| "xong chưa", "sẵn sàng commit/nộp", "ship" | `/verify` → người dùng tự push |
| "X hoạt động thế nào" | đọc file và trả lời trực tiếp, không cần agent |

## Must-Do Automatics
- Sửa `backend/antam/tools/` → thêm/cập nhật test trong `backend/tests/tools/` cùng lượt.
- Sửa `rules.yaml` → kiểm tra tên biến khớp `build_facts`, chạy test rule engine.
- Sửa `legal_params.yaml` → không sửa giá trị cũ; thêm dòng mới với `effective_from`, có `source_doc`, `last_verified`.
- Sửa schema pydantic hoặc `frontend/lib/api.ts` → sửa phía còn lại cho khớp.
- Sửa prompt → tăng phiên bản ở dòng đầu, đề nghị chạy `/eval`.
- Trước khi báo "xong" một thay đổi đáng kể → `/verify`.

## Agents

| Agent | Vai trò | Model | Lý do model |
|---|---|---|---|
| `planner` | Kế hoạch tới từng file | sonnet | Dự án cỡ vừa, không cần Opus |
| `backend-engineer` | Python/FastAPI/Bedrock/seed | sonnet | Mặc định cho implementer |
| `frontend-engineer` | Next.js/TS/Tailwind | sonnet | Mặc định cho implementer |
| `correctness-reviewer` | Tính tiền, rule, khớp schema, lỗi Python/TS | sonnet | Cần phán đoán, không chỉ chạy tool |
| `security-reviewer` | Đầu vào không tin cậy, prompt injection, PII, guardrail, IAM | opus | Sai sót = lộ dữ liệu người dùng hoặc gợi ý app đen |
| `data-guard` | DynamoDB theo `anon_id`, seed pháp lý, mẫu hư cấu | sonnet | Dữ liệu tài chính của người dùng + căn cứ pháp lý |

Mọi reviewer: chỉ báo phát hiện >80% tin cậy kèm `file:dòng` và kịch bản lỗi; "không có phát hiện" là hợp lệ; kết thúc bằng PASS/FAIL (fail-closed). Khi gọi agent, truyền đủ đường dẫn file và quyết định trước đó trong prompt — agent không thấy hội thoại.

## Commands
- `/verify` — test, lint, kiểu, build, quét quy tắc miền, gọi reviewer theo phạm vi diff → READY / NOT-READY.
- `/eval` — đo độ chính xác trích xuất trên `eval/contracts/` (hỏi xác nhận vì tốn credits).

Có sẵn của Claude Code, dùng khi cần: agent `Explore` (tìm kiếm rộng), `Plan`, skill `/code-review`, lệnh `/goal`.

## Orchestration & Gates
- Hai cổng người duyệt: (1) duyệt `PLAN.md` trước khi code luồng mới; (2) người dùng tự `git push` / deploy sau `/verify` READY.
- Hook Stop chạy `pytest tests/tools` + `ruff` (backend) và `tsc --noEmit` (frontend) cho phần có thay đổi; lỗi thật thì chặn kết thúc lượt.

## Model Routing
Phiên chính: sonnet. Chỉ `security-reviewer` dùng opus. Không đổi model đắt hơn nếu người dùng không yêu cầu.

## Code Style
- Python: type hints đầy đủ, pydantic v2 cho mọi I/O API, ruff (line 120, cấm `print` — T20), không `eval/exec`, `yaml.safe_load`.
- TypeScript: `strict`, không `any`; component client có `"use client"`; gọi API chỉ qua `lib/api.ts`.
- Chữ hiển thị cho người dùng: tiếng Việt đời thường; cảnh báo pháp lý luôn "có dấu hiệu", không "vi phạm".

## Testing
- `pytest` (backend). Test luôn chạy ở `AI_MODE=mock`, không gọi Bedrock, không cần AWS.
- Ca bắt buộc giữ nguyên trong `tests/tools/test_calc_true_cost.py`: XanhCash ~1042.86%/năm, góp ngày ~1.37%/ngày, lãi phẳng 1%/tháng ~22%/năm, vay thường ~4%/năm.
- Frontend chưa có test runner — kiểm tra bằng `tsc --noEmit` + chạy thử luồng trên điện thoại.

## Security & Privacy
- Không đăng ký; chỉ `anon_id` (UUID ở trình duyệt). Dữ liệu người dùng trong DynamoDB có `ttl`, xoá được qua `/me`.
- Không lưu ảnh gốc; không log CCCD, số tài khoản, nội dung hợp đồng.
- Không gợi ý app/bên cho vay không giấy phép, không chỉ cách lách thẩm định, không khuyên quỵt nợ, không sinh kịch bản lừa đảo.
- App không tự truy vấn CIC.

## Environment Variables
Backend (`.env` không commit; xem `.env.example`): `AI_MODE` (`mock`|`bedrock`), `AWS_REGION`, `BEDROCK_MODEL_EXTRACT`, `BEDROCK_MODEL_WRITE`, `TABLE_NAME`, `SEED_DIR`, `SAMPLES_DIR`.
Frontend (`frontend/.env.local`): `NEXT_PUBLIC_API_URL`.
AWS credentials do người dùng cấu hình trên máy (AWS CLI profile) — Claude không đọc `~/.aws`.

## Deploy Health Check
Chưa deploy. Khi đã deploy (người dùng tự chạy `sam deploy`/Vercel): gọi `GET <ApiUrl>/health` phải trả `{"status":"ok"}`, rồi chạy thử `POST /loan/assess` với mẫu XanhCash và kiểm tra `risk_level == "red"`. Phiên này không có AWS credentials nên không tự kiểm tra log CloudWatch hay chi phí — nhắc người dùng xem AWS Budgets ($20, cảnh báo 25/50/75%).

## Escape hatches
`ALLOW_PUSH=1` · `ALLOW_DEPLOY=1` · `ALLOW_SECRET=1` · `ALLOW_PROTECTED_EDIT=1` · `SKIP_BUILD_GATE=1` — chỉ dùng khi người dùng yêu cầu rõ.

## Bug Tracking Log
Ghi lỗi thật vào `.claude/BUGS.md` (triệu chứng · nguyên nhân · sửa · test chặn tái phát).

## Project-Specific Notes / Gotchas
- Dự án dùng auto memory có sẵn của Claude Code (không có hệ memory tự xây); `/memory` để xem/sửa.
- `apr_simple` (lãi danh nghĩa theo kỳ trả) là số dùng so với trần luật; `apr_effective` (lãi kép) chỉ tham khảo.
- `data/seed/lenders.csv` và `loan_channels.csv` đang chỉ có tiêu đề — phải điền từ nguồn chính thức (danh sách NHNN, biểu phí công khai) có `last_verified`. Khi chưa có, `check_license` luôn trả `not_found` và luồng Cần tiền gấp chỉ hiện phương án không cần vay.
- `legal_snippets.yaml` để trống `excerpt` có chủ đích: chỉ điền nguyên văn từ nguồn chính thức.
- Các luồng `/aftercare`, `/harassment` và endpoint `/me`, lưu DynamoDB chưa làm — đúng theo kế hoạch gọn.
- Giả định: chọn ap-southeast-1; model Bedrock chưa chốt (kiểm tra model có vision và có sẵn ở region trước khi deploy).

## Pipeline Flow
```
yêu cầu → planner → (người dùng duyệt PLAN.md) → backend-engineer / frontend-engineer
        → correctness-reviewer (+ security-reviewer / data-guard theo phạm vi) → /verify → người dùng push/deploy
```

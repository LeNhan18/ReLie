# Đề bài cho Antigravity swarm — frontend (worktree `ReLie-agy`, nhánh `feat/frontend-agy`)

Đọc trước: `AGENTS.md`, `CLAUDE.md`, `docs/api-contract.md`, `.claude/rules/frontend.md`.
Chỉ sửa: `frontend/**`. Không đụng `backend/`, `data/`, `infra/`, `.claude/`.

## Chạy
- Backend để thử: trong worktree của bạn, `cd backend && pip install -e ".[dev]" && uvicorn antam.main:app --port 8000` (chỉ chạy, không sửa). `frontend/.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:8000`.
- `/aftercare/assess` chưa có ở backend: dùng mock JSON đúng ví dụ trong `docs/api-contract.md`, đặt ở `frontend/mocks/aftercare.json`, bật bằng `NEXT_PUBLIC_USE_MOCKS=1`. Khi backend xong sẽ tắt mock.

## Chia việc cho swarm (mỗi sub-agent một thư mục, không sửa chéo)
| Sub-agent | Thư mục | Việc |
|---|---|---|
| A — Cần tiền gấp | `frontend/app/need/**` | 4 câu hỏi dạng nút (mục đích, số tiền, hạn, có lương/tài sản/nợ xấu), danh sách lựa chọn với nhãn phù hợp, nút "Soạn thư" gọi `/messages/draft` → màn hình thư có nút Sao chép |
| B — Kiểm tra khoản vay | `frontend/app/loan/**` | Chọn ảnh → resize ≤1600px phía client → `/loan/extract`; nút thử 3 mẫu (`xanhcash`, `gop_ngay`, `cty_tai_chinh_a`); form xác nhận (ô trong `low_confidence_fields` tô vàng); `/loan/assess` → màn hình kết quả (màu theo `risk_level`, danh sách `findings` kèm `legal_ref`, kịch bản gia hạn) |
| C — Đã lỡ vay | `frontend/app/aftercare/**` | Dùng lại form xác nhận của B (import, không copy), gọi `/aftercare/assess`, hiện 3 con số tách nợ + checklist có ô tick |
| D — Nền tảng | `frontend/components/**`, `frontend/lib/**` | Component dùng chung (RiskCard, ConfirmForm, OptionCard, Checklist, LoadingState, ErrorState); bổ sung kiểu `LoanTerms`, `ConfirmedLoan`, `AftercareResult` vào `lib/api.ts` khớp `backend/antam/schemas/`; tạo `anon_id` |

Thứ tự: D làm `lib/api.ts` + component trước (A, B, C import từ đó). Chỉ D được sửa `components/` và `lib/`; A/B/C cần thêm thì nhờ D.

## UX bắt buộc
Mobile-first (375px), nút cao ≥48px, chữ ≥16px, tiếng Việt đời thường, mỗi màn hình một việc; có trạng thái đang tải / lỗi mạng / ảnh không đọc được / kết quả rỗng. Không tự tính số tiền. Không `console.log`, không `dangerouslySetInnerHTML`.

## Định nghĩa xong
`cd frontend && npx tsc --noEmit && npm run build` sạch; mỗi sub-agent commit riêng trên `feat/frontend-agy`.

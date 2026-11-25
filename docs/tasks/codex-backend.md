# Đề bài cho Codex — backend (worktree `ReLie-codex`, nhánh `feat/backend-codex`)

Đọc trước: `AGENTS.md`, `CLAUDE.md`, `docs/api-contract.md`, `.claude/rules/backend-tools.md`, `.claude/rules/ai-layer.md`.
Chỉ sửa: `backend/**`, `data/seed/**`, `data/samples/**`, `eval/**`. Không đụng `frontend/`, `infra/`, `.claude/`.

## Việc theo thứ tự ưu tiên (xong việc nào commit việc đó)
1. **Tool tách nợ** `backend/antam/tools/debt_split.py`: hàm `split_debt(received, total_demanded, disbursed, last_due, cap_pct, applies)` → (lawful_interest, excess_charge). Lãi đơn `received × cap% × ngày/365`, làm tròn về int. Test trong `backend/tests/tools/test_debt_split.py`: ca XanhCash (23014 / 1176986), ca tổng đòi thấp hơn lãi hợp pháp (excess = 0, không âm), ca tổ chức tín dụng (`applies=False`), ca ngày không hợp lệ.
2. **Endpoint** `POST /aftercare/assess` đúng shape trong `docs/api-contract.md`: router `backend/antam/routers/aftercare.py`, schema `AftercareResult` trong `backend/antam/schemas/loan.py`, đọc `cap_civil_pct` từ `legal_params` theo ngày giải ngân (dùng `rule_engine.params_at`), dùng `check_license` để quyết `excess_applies`. Test API trong `backend/tests/api/`.
3. **Thêm mẫu hư cấu** vào `data/samples/`: `gop_ngay.terms.json` (nhận 9.000.000, góp 250.000/ngày × 50 ngày) và `cty_tai_chinh_a.terms.json` (khoản vay hợp pháp 10.000.000, 12 kỳ lãi phẳng 1%/tháng). Ghi `"_note": "MẪU HƯ CẤU"`. Thêm test `/loan/extract` với `sample_id` cho cả hai.
4. **Phân loại trạng thái người dùng** `backend/antam/services/state.py`: rule từ khoá tiếng Việt (không gọi LLM) → một trong `chua_biet | do_du | quyet_tam_vay | da_vay | bi_doi_no`. Test 15 câu mẫu. Chưa cần endpoint.

## Không làm
- Không nối Bedrock thật, không thêm AWS credentials, không sửa `infra/`.
- Không đổi shape các endpoint đã có. Cần đổi → ghi vào `docs/tasks/codex-questions.md`.

## Định nghĩa xong
`cd backend && python -m pytest -q && ruff check .` sạch; mỗi việc một commit trên `feat/backend-codex`.

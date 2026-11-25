# Hợp đồng API v1.1 (đóng băng — chỉ Lê sửa)

Nguồn sự thật cho kiểu dữ liệu: `backend/antam/schemas/*.py`. `frontend/lib/api.ts` phải khớp, giữ tên trường snake_case.
Số tiền: VND nguyên (int). Ngày: `YYYY-MM-DD`. Lỗi: HTTP 4xx với `{"detail": "<thông báo tiếng Việt>"}`.

## Đã có
| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/health` | — | `{"status":"ok"}` |
| POST | `/need/options` | `NeedProfile` | `NeedOptions` |
| POST | `/messages/draft` | `{alt_id, values: {str:str}}` | `{text}` |
| POST | `/loan/extract` | multipart: `file` (ảnh ≤4MB) **hoặc** `text` **hoặc** `sample_id` | `{terms: LoanTerms, low_confidence_fields: string[]}` |
| POST | `/loan/assess` | `ConfirmedLoan` | `Assessment` |
| POST | `/plan/today` | `TodayRequest` | `{spendable_today, days_until_payday, shortfalls:[{debt_label, due, missing}]}` |

`fees.<tên phí>` trong `low_confidence_fields` nghĩa là phí đó cần người dùng xác nhận.

## Mới — Codex làm backend, agy làm frontend theo đúng shape này
### POST `/aftercare/assess`
Request: `ConfirmedLoan` (giống `/loan/assess`).
Response `AftercareResult`:
```json
{
  "lender_status": "not_found",
  "principal_received": 3000000,
  "lawful_interest": 23014,
  "excess_charge": 1176986,
  "total_demanded": 4200000,
  "excess_applies": true,
  "checklist": [
    {"id": "luu_bang_chung", "text": "Chụp lưu hợp đồng, lịch trả nợ, tin nhắn báo tiền về"},
    {"id": "tat_quyen", "text": "Tắt quyền Danh bạ, Ảnh, Tin nhắn của app"},
    {"id": "bao_nguoi_than", "text": "Báo trước cho người thân nếu có số lạ gọi đòi nợ"},
    {"id": "khong_vay_chong", "text": "Không vay app khác để trả app này"}
  ],
  "note": "Ước tính theo mức trần lãi suất của luật dân sự tại ngày giải ngân. Không phải tư vấn pháp lý."
}
```
- `excess_applies = false` khi bên cho vay là tổ chức tín dụng có giấy phép (không áp trần 20%): khi đó `lawful_interest = total_demanded - principal_received`, `excess_charge = 0`.
- Mẫu kiểm thử: XanhCash (nhận 3.000.000, trả 4.200.000 sau 14 ngày, giải ngân 2026-11-20) → `lawful_interest = 23014` (3.000.000 × 20% × 14/365, làm tròn), `excess_charge = 1176986`.

## v1.1 — vòng 2
### Đã xong ở vòng 1
`POST /aftercare/assess` đã có ở backend. Frontend tắt mock (`NEXT_PUBLIC_USE_MOCKS` mặc định tắt).

### Sửa `POST /need/options` (tương thích ngược)
Request `NeedProfile` thêm trường tuỳ chọn `free_text: string | null` (câu người dùng tự gõ/nói, ≤500 ký tự).
Response `NeedOptions` thêm `state`: `"chua_biet" | "do_du" | "quyet_tam_vay" | "da_vay" | "bi_doi_no"` (từ `services/state.py::classify_state(free_text)`, không có `free_text` → `"chua_biet"`), và `suggested_flow`: `"need" | "aftercare" | "harassment" | null`:
- `da_vay` → `"aftercare"`, `bi_doi_no` → `"harassment"`, còn lại → `null`.
- Khi `state == "quyet_tam_vay"`: thêm vào `options` (sau các phương án không cần vay) một mục `kind: "harm_reduction"`, `option_id: "vay_it_hai_nhat"`, `title: "Nếu vẫn vay: cách vay ít hại nhất"`, `cost_note: ""`, `speed: ""`, `fit: "cao"`. `kind` của `Option` mở rộng thành `"no_loan" | "loan_channel" | "harm_reduction"`.

### Sửa `POST /messages/draft`
`alt_id` nhận thêm các mẫu trong `data/seed/message_templates.yaml` (không xuất hiện trong `/need/options`):
| alt_id | Dùng cho | values |
|---|---|---|
| `bao_truoc_nguoi_than` | Bị đòi nợ / đã lỡ vay | `ten_nguoi_nhan` |
| `don_trinh_bao` | Bị đòi nợ | `ho_ten`, `dia_chi`, `so_dien_thoai`, `ten_ben_cho_vay`, `so_tien_vay`, `ngay_vay`, `mo_ta_hanh_vi` |
| `xin_lui_han_ben_cho_vay` | Kế hoạch nợ | `ten_ben_cho_vay`, `han_cu`, `han_moi` |

Giá trị thiếu hiển thị `...`. Đơn trình báo chỉ là bản nháp để người dùng tự điền, in và nộp; không gửi đi đâu.

### Mới `GET /messages/templates?context=harassment|aftercare|plan`
Response: `[{"alt_id": "...", "title": "...", "fields": ["ten_nguoi_nhan", ...]}]` — để frontend dựng form điền thông tin.

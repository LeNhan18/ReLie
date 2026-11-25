# Hợp đồng API v1 (đóng băng — chỉ Lê sửa)

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

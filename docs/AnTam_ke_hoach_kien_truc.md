# AnTâm – Kế hoạch và kiến trúc thực hiện

> Phạm vi: bản nộp v1.0 cho MoMo Tech Contest 2026
> Hạn nộp: 23:59:59 03/12/2026 (mục tiêu nộp trước 18:00) · Chung kết: 11/12/2026
> Tài liệu đi kèm: `AnTam_tong_quan.md` (ý tưởng, chức năng, luật)
> Dùng file này làm đầu vào cho spec trên Kiro.

---

## 1. Mục tiêu bản nộp

**Định nghĩa "xong":**
- [ ] Giám khảo mở 1 link trên điện thoại, dùng được ngay, không đăng ký
- [ ] 5 luồng chạy trọn từ đầu đến cuối: Cần tiền gấp · Kiểm tra khoản vay · Đã lỡ vay · Bị đòi nợ · Kế hoạch tiền và nợ
- [ ] 6 hợp đồng/tình huống mẫu bấm thử được ngay, phản hồi tức thì (cache)
- [ ] Mọi con số do tool tính; mọi cảnh báo pháp lý có trích điều luật
- [ ] Có số liệu đánh giá thật (độ chính xác trích xuất, phân loại trạng thái)
- [ ] Có feedback/clip của 5–10 người dùng thật
- [ ] Chạy ổn định đến hết 11/12, chi phí AWS ≤ $20

**Ngoài phạm vi (chỉ đưa vào slide lộ trình):** API MoMo/đối tác tín dụng, kiểm tra CIC trực tiếp, chatbot Zalo, người thân bảo hộ, dashboard đội rủi ro.

---

## 2. Kiến trúc tổng thể

```
                    ┌──────────────────────────────────────┐
  Điện thoại  ───▶  │  Frontend: Next.js PWA (Vercel/Amplify)│
  (giám khảo)       └───────────────┬──────────────────────┘
                                    │ HTTPS (JSON)
                    ┌───────────────▼──────────────────────┐
                    │  API Gateway (HTTP API, throttling)   │
                    └───────────────┬──────────────────────┘
                                    │
        ┌───────────────────────────▼───────────────────────────┐
        │  Lambda (Python 3.12)                                  │
        │  ┌──────────────┐   ┌───────────────────────────────┐  │
        │  │ Orchestrator │──▶│ Tools (code thuần, có test)    │  │
        │  │  (agent)     │   │ calc_true_cost · rule_engine   │  │
        │  └──────┬───────┘   │ check_license · find_options   │  │
        │         │           │ cashflow · legal_lookup · pdf  │  │
        │         ▼           └───────────────────────────────┘  │
        │  Amazon Bedrock: VLM trích xuất · LLM viết · Judge      │
        └───────┬──────────────────┬──────────────────┬──────────┘
                │                  │                  │
        ┌───────▼──────┐   ┌───────▼───────┐  ┌───────▼─────────┐
        │ S3 uploads   │   │ DynamoDB      │  │ EventBridge      │
        │ (tự xoá 1h)  │   │ dữ liệu + cache│  │ Scheduler (nhắc)│
        └──────────────┘   └───────────────┘  └─────────────────┘
                 CloudWatch (log, metric) · AWS Budgets ($5/$10/$15)
```

### Lựa chọn công nghệ

| Lớp | Chọn | Lý do |
|---|---|---|
| Frontend | Next.js (App Router) + Tailwind, PWA | Mobile-first, 1 link, deploy nhanh |
| Hosting FE | Vercel (miễn phí) hoặc Amplify | Giữ credits AWS cho model |
| API | API Gateway HTTP API | Rẻ, có throttling |
| Backend | Python 3.12 trên Lambda (1 hàm/nhóm luồng) | Trả theo lượt; Python mạnh cho tính toán, PDF |
| Agent | Code orchestration tự viết (state machine + tool calling), có thể chuyển sang Strands Agents / AgentCore nếu buổi training cho thấy phù hợp | Kiểm soát chặt, dễ test, ít chi phí |
| Model | Bedrock: model nhỏ có vision cho trích xuất; model nhỏ cho viết lời; Judge dùng rubric + kiểm tra bằng code | Chi phí thấp |
| Dữ liệu | DynamoDB on-demand | Không tốn tiền khi không dùng |
| File | S3 + lifecycle tự xoá | Đúng cam kết quyền riêng tư |
| Nhắc hạn | EventBridge Scheduler | Rẻ |
| PDF | WeasyPrint hoặc ReportLab trong Lambda layer | Đơn trình báo |
| IaC | AWS SAM (Kiro sinh) | Deploy lặp lại nhanh |
| Region | ap-southeast-1 (Singapore) – kiểm tra model có sẵn | Gần Việt Nam |

---

## 3. Thiết kế luồng xử lý

### 3.1. Kiểm tra khoản vay
```
FE upload ảnh ──▶ POST /uploads (presigned URL) ──▶ S3
FE ──▶ POST /loan/extract {s3_key | text}
        1. Tiền xử lý: resize ≤1600px, làm mờ CCCD (regex/vision)
        2. Cache: hash(file) có sẵn? → trả luôn
        3. VLM → JSON theo schema LoanTerms + confidence
        4. consistency_check → cờ "cần xác nhận"
        ◀── {terms, low_confidence_fields}
FE form xác nhận ──▶ POST /loan/assess {terms đã xác nhận}
        5. check_license(lender_name) → lender_type
        6. calc_true_cost(cashflows) → apr_simple, apr_effective, kịch bản gia hạn/quá hạn
        7. rule_engine(lender_type, terms, cost, sign_date) → rules_fired[]
        8. legal_lookup(rules_fired) → đoạn trích luật
        9. LLM viết lời từ template + số liệu
       10. judge: số trong văn bản == số tool? có trích dẫn? dùng "có dấu hiệu"?
        ◀── {risk_level, findings[], numbers, citations[], actions[]}
```

### 3.2. Tôi cần tiền gấp
```
FE câu hỏi bấm chọn ──▶ POST /need/options {purpose, amount_band, deadline,
                                            has_salary, has_asset, bad_debt, ...}
        1. classify_state (rule + LLM nếu có text tự do)
        2. find_options: phương án không cần vay → kênh vay (lọc điều kiện)
        3. calc_true_cost cho từng kênh (số tiền, kỳ hạn của người dùng)
        4. xếp hạng: chi phí → tốc độ → thủ tục; gắn nhãn phù hợp
        5. LLM giải thích ngắn
        ◀── {options[], sources[], updated_at}
FE ──▶ POST /messages/draft {template_id, context} ◀── {text}
FE ──▶ POST /feedback/outcome {option_id, approved|rejected, reason} (ẩn danh)
```

### 3.3. Đã lỡ vay
```
POST /aftercare/assess {terms | ảnh tin nhắn ngân hàng + lịch trả nợ}
  → tách nợ (gốc, lãi trong giới hạn, phần vượt luật) + checklist theo dòng máy + kế hoạch trả
POST /plan/reminders → EventBridge Scheduler / file .ics
```

### 3.4. Bị đòi nợ
```
POST /harassment/analyze {s3_keys[]} → VLM đọc ảnh → phân loại hành vi → timeline bằng chứng
POST /reports/pdf {timeline, user_info tuỳ chọn} → PDF (S3, link tạm 1h)
POST /messages/draft {template: "bao_truoc_nguoi_than"}
```

### 3.5. Kế hoạch tiền và nợ
```
POST /plan            tạo/cập nhật (thu nhập, chi cố định, khoản nợ) – lưu theo anon_id
POST /plan/expense    {text | audio | ảnh} → LLM trích {amount, category}
GET  /plan/today      → {spendable_today, upcoming_debts[], shortfall_alert?}
```

**Định danh:** không đăng ký. FE tạo `anon_id` (UUID) lưu ở trình duyệt; người dùng có nút xoá toàn bộ dữ liệu theo `anon_id`.

---

## 4. Mô hình dữ liệu (DynamoDB)

| Bảng | Khoá | Nội dung chính |
|---|---|---|
| `lenders` | `name_norm` | tên đầy đủ, loại (ngan_hang/cty_tai_chinh/vi_mo/quy_tin_dung), giấy phép, nguồn, ngày kiểm tra |
| `loan_channels` | `channel_id` | tổ chức, loại, apr_min/max, phí, hạn mức, kỳ hạn, điều kiện {can_luong, can_tai_san, nhan_no_xau, doi_tuong}, tốc độ, link, ngày kiểm tra |
| `alternatives` | `alt_id` | phương án không cần vay theo mục đích (học phí, viện phí, tiền nhà…), template thư |
| `legal_params` | `name` + `effective_from` | value, effective_to, source_doc, last_verified |
| `legal_snippets` | `rule_id` | đoạn trích điều luật, số hiệu, link nguồn |
| `rules` | `rule_id` | branch, condition (biểu thức), severity, message_template |
| `plans` | `anon_id` | thu nhập, chi cố định, khoản nợ, chi tiêu |
| `outcomes` | `channel_id` + `ts` | approved/rejected, reason (ẩn danh) |
| `cache` | `content_hash` | kết quả trích xuất/assess, TTL 30 ngày |

### Schema `LoanTerms` (đầu ra VLM)
```json
{
  "lender_name": {"value": "string", "confidence": 0.0},
  "principal_stated": {"value": 0, "confidence": 0.0},
  "fees": [{"name": "string", "amount": 0, "deducted_upfront": true, "confidence": 0.0}],
  "amount_received": {"value": 0, "confidence": 0.0},
  "disbursed_date": {"value": "YYYY-MM-DD", "confidence": 0.0},
  "repayment": {"type": "one_time|installment|daily",
                "schedule": [{"date": "YYYY-MM-DD", "amount": 0}], "confidence": 0.0},
  "rate_stated": {"value": 0, "unit": "%/year|%/month|%/day", "confidence": 0.0},
  "extension_fee": {"value": 0, "days": 0, "confidence": 0.0},
  "late_penalty": {"value": 0, "unit": "%/day|fixed", "confidence": 0.0},
  "data_access_clauses": [{"text": "string", "types": ["contacts","photos","relatives"]}]
}
```

### Ví dụ một dòng `rules`
```yaml
rule_id: R2
branch: non_credit_institution
condition: "apr_simple >= p.cap_civil * p.multiplier_criminal"
params: [cap_civil, multiplier_criminal]   # đọc legal_params theo disbursed_date
severity: red
message_template: "Chi phí thật khoảng {apr_simple}%/năm, gấp {ratio} lần mức trần luật dân sự. Có dấu hiệu cho vay lãi nặng."
legal_ref: "BLHS 2015, Điều 201"
```

---

## 5. Tool tính toán (phải đúng 100%)

### `calc_true_cost`
- **Đầu vào:** dòng tiền `[(ngày, +tiền nhận), (ngày, −tiền trả)…]`.
- **Đầu ra:**
  - `total_cost` = tổng trả − tiền thực nhận
  - `apr_simple` = (total_cost / tiền thực nhận) × 365 / số ngày (khoản trả 1 lần); với trả góp/góp ngày dùng lãi suất kỳ từ IRR × số kỳ/năm. Dùng để so với trần %/năm của luật.
  - `apr_effective` = (1 + r_kỳ)^(số kỳ/năm) − 1 (hiển thị tham khảo)
  - Kịch bản: gia hạn 1, 2 lần; quá hạn 7, 14 ngày.
- **Thư viện:** `numpy-financial` / tự viết XIRR (Newton + bisection fallback).
- **Test bắt buộc:** XanhCash (3tr nhận, 4,2tr trả 14 ngày → ~1.043%/năm), góp ngày (9tr nhận, 250k × 50 ngày), trả góp dư nợ ban đầu (10tr, 1%/tháng, 12 kỳ → ~22%/năm), khoản vay ngân hàng thường.

### `rule_engine`
- Đọc `rules` theo nhánh, `legal_params` theo ngày giải ngân.
- Đánh giá biểu thức an toàn (không `eval` tự do; dùng thư viện biểu thức giới hạn như `simpleeval`).
- **Test:** mỗi quy tắc có ít nhất 1 ca bật, 1 ca không bật; ca biên (đúng 20%, đúng 100%).

### `check_license`
- Chuẩn hoá tên (bỏ dấu, bỏ "Công ty TNHH", "CTCP"…), so khớp gần đúng (rapidfuzz, ngưỡng 90).
- Kết quả: `credit_institution | not_found | ambiguous` (ambiguous → hỏi người dùng).

### `cashflow_forecast`
- `spendable_today = (tiền hiện có + thu nhập trước kỳ lương sau − chi cố định − nợ đến hạn − dự phòng) / số ngày còn lại`
- `shortfall` theo từng khoản nợ: dự báo số dư tại ngày đến hạn với tốc độ chi trung bình 7 ngày.

---

## 6. Dùng AI ở đâu (và prompt)

| Tác vụ | Model | Cách kiểm soát |
|---|---|---|
| Trích xuất hợp đồng/ảnh | Bedrock, model có vision | JSON schema bắt buộc, retry 1 lần nếu sai schema |
| Phân loại trạng thái người dùng | Model nhỏ | 5 nhãn cố định, few-shot |
| Phân loại điều khoản dữ liệu, hành vi đòi nợ | Model nhỏ | Danh sách nhãn cố định |
| Trích chi tiêu từ câu nói | Model nhỏ | JSON {amount, category} |
| Viết cảnh báo, giải thích | Model nhỏ | Chỉ nhận số liệu + rule đã bật; template; cấm tự thêm số |
| Soạn thư, tin nhắn, đơn | Model nhỏ | Template + ngữ cảnh; giọng lịch sự |
| Judge | Code + model nhỏ | Code kiểm tra số khớp; model kiểm tra giọng, "có dấu hiệu", không gợi ý app đen |

**Guardrail cứng (system prompt + kiểm tra code):**
- Không gợi ý app cho vay không có giấy phép; không chỉ cách lách thẩm định.
- Không khẳng định "vi phạm pháp luật"; chỉ "có dấu hiệu".
- Không khuyên quỵt nợ.
- Không xuất kịch bản lừa đảo dù người dùng yêu cầu.

**Prompt lưu thành file có phiên bản** trong `backend/prompts/`, mỗi lần đổi prompt chạy lại bộ đánh giá.

---

## 7. API

| Method | Path | Mô tả |
|---|---|---|
| POST | `/uploads` | Tạo presigned URL S3 |
| POST | `/loan/extract` | Trích xuất điều khoản |
| POST | `/loan/assess` | Tính toán + rule + cảnh báo |
| POST | `/need/options` | Lựa chọn khi cần tiền |
| POST | `/messages/draft` | Soạn thư/tin nhắn |
| POST | `/feedback/outcome` | Kết quả vay (ẩn danh) |
| POST | `/aftercare/assess` | Tách nợ, checklist, kế hoạch |
| POST | `/harassment/analyze` | Phân tích tin đòi nợ, timeline |
| POST | `/reports/pdf` | Đơn trình báo PDF |
| POST/GET | `/plan`, `/plan/expense`, `/plan/today` | Kế hoạch tiền và nợ |
| POST | `/plan/reminders` | Tạo nhắc hạn |
| DELETE | `/me` | Xoá toàn bộ dữ liệu theo anon_id |
| GET/PUT | `/admin/*` | Sửa legal_params, rules, channels (API key) |

---

## 8. Cấu trúc repo

```
antam/
├── frontend/                 Next.js PWA
│   ├── app/                  home, need/, loan/, aftercare/, harassment/, plan/, privacy/, admin/
│   ├── components/           RiskCard, CostScale, ConfirmForm, OptionCard, Checklist…
│   └── mocks/                JSON mẫu để dựng UI không gọi model
├── backend/
│   ├── handlers/             loan.py, need.py, aftercare.py, harassment.py, plan.py, admin.py
│   ├── tools/                calc_true_cost.py, rule_engine.py, check_license.py, cashflow.py, pdf.py
│   ├── ai/                   bedrock_client.py, extract.py, classify.py, write.py, judge.py
│   ├── prompts/              *.md có phiên bản
│   ├── schemas/              pydantic: LoanTerms, NeedProfile, Assessment…
│   └── tests/                unit test tools (bắt buộc), test handler
├── data/
│   ├── seed/                 lenders.csv, loan_channels.csv, alternatives.yaml, legal_params.yaml, rules.yaml, legal_snippets.yaml
│   └── samples/              6 tình huống mẫu cho giám khảo
├── eval/
│   ├── contracts/            30–50 hợp đồng hư cấu + nhãn chuẩn
│   ├── run_extract_eval.py   độ chính xác từng trường
│   └── run_state_eval.py     độ chính xác phân loại trạng thái
├── infra/template.yaml       AWS SAM
└── README.md                 cách chạy, công nghệ, dịch vụ AWS, tài sản có sẵn, thư viện, công cụ AI, nguồn dữ liệu
```

---

## 9. Phân công (đội 3 người)

| Vai trò | Người | Phụ trách |
|---|---|---|
| **AI/Backend lead** | Lê | Orchestrator, prompt, VLM trích xuất, classify, judge, Bedrock, bộ đánh giá |
| **Frontend/UX** | Thành viên 2 | Toàn bộ màn hình, trạng thái lỗi, giao diện người lớn tuổi, PWA, quay video |
| **Data/Backend/QA** | Thành viên 3 | Tool tính toán + test, rule engine, seed data (kênh vay, luật, phương án), hợp đồng test, SAM/deploy, test người dùng, slide |

**Đội 2 người:** Lê nhận thêm tool tính toán và deploy; seed data chia đôi; giảm hợp đồng test xuống 30.

**Cách dùng Kiro:** mỗi mục trong §3 là một spec riêng (requirements → design → tasks). Kiro sinh khung handler, schema pydantic, component UI, test cho tools và template SAM. Người phụ trách review, không merge code chưa có test với `tools/`.

---

## 10. Kế hoạch theo ngày

| Ngày | AI/Backend (Lê) | Frontend | Data/QA | Mốc |
|---|---|---|---|---|
| **T4 25/11** | Repo, SAM skeleton, Bedrock client, test VLM trên 5 hợp đồng; dự training 13:30 | Khung app, trang chủ 4 nút, mock data | `calc_true_cost` + test; bắt đầu seed `loan_channels` | Deploy "hello world" end-to-end; Budgets alarm |
| **T5 26/11** | `/need/options` + classify + draft message | Luồng Cần tiền gấp (đủ màn hình) | `alternatives`, mẫu thư; `rules` + `legal_params` | 🚦 **Gate: Cần tiền gấp chạy đầu-cuối** |
| **T6 27/11** | `/loan/extract` + `/loan/assess` + judge | Upload, form xác nhận, màn hình kết quả, thang so sánh | `rule_engine` + test; `lenders`; 20 hợp đồng test | Gửi câu hỏi làm rõ đề cho BTC (hạn 27/11) |
| **T7 28/11** | `/aftercare`, `/harassment`, PDF | Màn hình Đã lỡ vay, Bị đòi nợ | `cashflow` + test; 30–50 hợp đồng test hoàn tất | Tất cả luồng chạy (chưa đẹp) |
| **CN 29/11** | `/plan`, ghi chi tiêu bằng giọng nói/chữ, nhắc hạn | Kế hoạch tiền và nợ, trang quyền riêng tư | Cache 6 tình huống mẫu; trang admin | 🚦 **Đóng băng tính năng** – luồng chưa trọn thì cắt |
| **T2 30/11** | Chạy eval, chỉnh prompt; guardrail test | Đánh bóng UX, trạng thái lỗi, tốc độ | Test người thật (5–10 người, có công nhân, người lớn tuổi) | Số liệu eval v1 |
| **T3 01/12** | Sửa lỗi từ test người dùng; throttling, model dự phòng | Sửa lỗi UI; kiểm tra trên máy tầm trung | Load test nhẹ; README; hướng dẫn 1 trang | Bản release candidate |
| **T4 02/12** | Hỗ trợ video, số liệu slide | Quay + dựng video 3 phút | Slide 10 trang | Bài nộp đủ 4 thành phần |
| **T5 03/12** | Kiểm tra lần cuối | Kiểm tra lần cuối | Kiểm tra lần cuối | **Nộp trước 18:00** |
| 04–11/12 | Theo dõi uptime, chi phí; không đổi code/slide | | | Chuẩn bị thuyết trình chung kết |

---

## 11. Đánh giá chất lượng

| Chỉ số | Cách đo | Mục tiêu |
|---|---|---|
| Độ chính xác trích xuất từng trường | `eval/run_extract_eval.py` trên 30–50 hợp đồng (thẳng, nghiêng, mờ) | ≥ 90% với trường tiền/ngày |
| Phát hiện bẫy "lãi 0%"/phí trừ trước | Tập con hợp đồng có bẫy | 100% |
| Tool tính toán | Unit test | 100% |
| Rule engine | Unit test mỗi quy tắc + ca biên | 100% |
| Phân loại trạng thái | 50 câu có nhãn | ≥ 85% |
| Judge chặn số sai | Tiêm lỗi số vào câu trả lời | 100% bị chặn |
| Guardrail | 20 câu cố lừa (xin app đen, xin kịch bản lừa đảo) | 0 lọt |
| Thời gian phản hồi | CloudWatch p90 | ≤ 10 giây (mẫu cache: ≤ 1 giây) |
| Người dùng thật | Hoàn thành tác vụ không cần hỗ trợ | ≥ 4/5 người |

---

## 12. Chi phí và vận hành

| Hạng mục | Ước tính | Kiểm soát |
|---|---|---|
| Bedrock (dev + eval + giám khảo) | Phần lớn ngân sách | Model nhỏ, resize ảnh, max_tokens, cache, mock khi dựng UI |
| Lambda, API Gateway, DynamoDB, S3, EventBridge | Gần như $0 ở quy mô thi | On-demand, lifecycle |
| Frontend | $0 | Vercel |

- AWS Budgets: cảnh báo $5 / $10 / $15; ở $15 bật chế độ "chỉ cache + giới hạn lượt".
- Throttling: theo IP và anon_id (ví dụ 20 lượt phân tích/giờ).
- Model dự phòng: nếu model chính lỗi hoặc chậm thì chuyển model khác; nếu cả hai lỗi thì hiện thông báo thân thiện, giữ được luồng không cần AI (phương án không cần vay, tính toán thủ công qua form).
- Health check định kỳ (CloudWatch Synthetics hoặc cron đơn giản) đến hết 11/12.

---

## 13. Rủi ro thực hiện

| Rủi ro | Dấu hiệu sớm | Xử lý |
|---|---|---|
| Luồng Cần tiền gấp thiếu thuyết phục | Gate 26/11 không đạt | Tăng chiều sâu phương án không cần vay + kênh cho người lao động; nếu vẫn yếu, đưa Kiểm tra khoản vay lên làm luồng chính trong demo |
| VLM đọc tiếng Việt kém | Eval 25/11 < 80% | Đổi model, thêm tiền xử lý, dựa nhiều hơn vào form xác nhận |
| Trễ tiến độ | Cuối 28/11 chưa đủ luồng | Cắt Kế hoạch tiền và nợ xuống mức "thêm nợ + nhắc hạn + cảnh báo thiếu tiền" |
| Hết credits | Budget alarm $10 trước 01/12 | Chế độ cache-only cho mẫu, giảm eval |
| Dữ liệu kênh vay/luật sai | Phát hiện khi test | Mỗi bản ghi có nguồn + ngày kiểm tra; hiện "ước tính, kiểm tra tại link chính thức" |
| Sập khi giám khảo chấm | Lỗi trong health check | Model dự phòng, cache, throttling, theo dõi hằng ngày |

---

## 14. Việc cần làm ngay hôm nay (25/11)
1. Tạo repo theo cấu trúc §8, mời đủ thành viên; bật Budgets alarm.
2. Thử VLM trên Bedrock với 5 hợp đồng hư cấu tiếng Việt, ghi lại độ chính xác.
3. Viết spec Kiro cho `calc_true_cost` và luồng Cần tiền gấp.
4. Bắt đầu seed `loan_channels` (ưu tiên kênh cho người lao động) và `alternatives`.
5. Dự training AWS & Kiro lúc 13:30; hỏi: credits, model vision tiếng Việt, AgentCore vs Lambda về chi phí, region.

# Đề bài cho Antigravity — vòng 2 (thư mục `E:\ReLie\agents\agy`, nhánh `feat/frontend-agy`)

Bước 0: `git pull origin main`. **Chỉ mở và làm việc trong thư mục `E:\ReLie\agents\agy`** — không mở `E:\ReLie`.
Đọc: `AGENTS.md`, `docs/api-contract.md` (phần v1.1), `.claude/rules/frontend.md`.
Chỉ sửa: `frontend/**`. Mỗi sub-agent commit riêng, push lên `origin feat/frontend-agy` sau mỗi phần.

Backend để thử: `cd backend && pip install -e ".[dev]" && uvicorn antam.main:app --port 8000` (chỉ chạy, không sửa). Các trường v1.1 có thể chưa có khi bạn bắt đầu — viết code chịu được trường thiếu (`state`, `suggested_flow` tuỳ chọn).

## Việc
| Sub-agent | Thư mục | Việc |
|---|---|---|
| **A — Cần tiền gấp (ưu tiên số 1, hạn 26/11)** | `app/need/**` | 4 bước, mỗi màn hình một câu: (1) mục đích, (2) số tiền (3 khoảng), (3) hạn (hôm nay / trong 3 ngày / trong 1 tuần / chưa gấp → gửi `deadline`), (4) có lương chuyển khoản? có tài sản (xe, vàng)? có nợ xấu? (Có/Không/Không biết). Ô tuỳ chọn "Kể thêm hoàn cảnh" → `free_text`. Màn kết quả: `OptionCard` cho từng lựa chọn; `no_loan` có nút "Soạn thư" → `DraftScreen` (đã có) gọi `/messages/draft` + nút Sao chép; `harm_reduction` mở checklist vay ít hại nhất (nội dung tĩnh từ `docs/AnTam_tong_quan.md` mục 5.1); nếu `suggested_flow` có giá trị → banner "Có vẻ bạn đã vay / đang bị đòi nợ" dẫn sang `/aftercare` hoặc `/harassment`. Có nút Quay lại ở mỗi bước. |
| **C — Đã lỡ vay** | `app/aftercare/**` | Tắt mock, gọi `/aftercare/assess` thật; thêm nút "Báo trước cho người thân" → mẫu `bao_truoc_nguoi_than` |
| **E — Bị đòi nợ (mới)** | `app/harassment/**` | Checklist an toàn (không chuyển thêm tiền theo yêu cầu đe doạ, chụp lưu bằng chứng, chặn số, báo người thân, trình báo công an); gọi `GET /messages/templates?context=harassment` dựng form điền → `/messages/draft` → màn hình đơn có nút Sao chép và In (window.print, CSS in gọn). Không gửi dữ liệu đi đâu khác. |
| **D — Nền tảng** | `components/**`, `lib/**` | Cập nhật kiểu `NeedProfile.free_text`, `NeedOptions.state/suggested_flow`, `Option.kind` thêm `harm_reduction`, `TemplateInfo`; hàm `api.templates(context)`; xoá cờ mock aftercare. Làm trước A, C, E. |

B (kiểm tra khoản vay) đã xong — chỉ sửa nếu D đổi kiểu làm hỏng.

## UX bắt buộc
Mobile-first 375px, nút ≥48px, chữ ≥16px, mỗi màn hình một việc, có trạng thái tải / lỗi / rỗng. Không tự tính tiền, không `console.log`, không `dangerouslySetInnerHTML`, localStorage chỉ `anon_id`. Dữ liệu trong form đơn trình báo chỉ giữ trong state của trang.

## Xong khi
`cd frontend && npx tsc --noEmit && npm run build` sạch, đã push.

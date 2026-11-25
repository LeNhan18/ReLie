# AGENTS.md — luật chung cho mọi agent (Codex, Antigravity, Claude Code)

Đọc thêm `CLAUDE.md` (kiến trúc, lệnh) và `docs/api-contract.md` (hợp đồng API).

## Phân vùng — chỉ sửa trong vùng của mình
| Vùng | Chủ | Ghi chú |
|---|---|---|
| `backend/**`, `data/seed/**`, `data/samples/**`, `eval/**` | Codex | |
| `frontend/**` | Antigravity (agy) | |
| `docs/api-contract.md`, `AGENTS.md`, `CLAUDE.md`, `.claude/**`, `infra/**` | Lê (người) | Agent KHÔNG sửa. Cần đổi hợp đồng → ghi đề xuất vào `docs/tasks/<agent>-questions.md` rồi dừng phần đó |

## Luật cứng
1. Làm việc trong worktree/nhánh của mình, không commit vào `bootstrap`/`main`, không `git push`, không deploy.
2. Không đọc hoặc tạo `.env`, không dùng AWS credentials. Luôn chạy với `AI_MODE=mock`.
3. Mọi con số tiền/lãi do `backend/antam/tools/` tính và có unit test. Frontend chỉ hiển thị số backend trả, không tự tính.
4. Cảnh báo pháp lý: chỉ "có dấu hiệu", không "vi phạm pháp luật". Không gợi ý app cho vay cụ thể không có giấy phép, không khuyên quỵt nợ.
5. Không lưu ảnh gốc, không log CCCD/số tài khoản. Frontend chỉ lưu `anon_id` ở localStorage.
6. Không thêm thư viện mới nếu không thật cần; nếu thêm, ghi lý do trong mô tả commit.
7. Trước khi báo xong phải sạch:
   - backend: `cd backend && python -m pytest -q && ruff check .`
   - frontend: `cd frontend && npx tsc --noEmit && npm run build`
8. Commit nhỏ, mô tả tiếng Việt, mỗi commit một việc.

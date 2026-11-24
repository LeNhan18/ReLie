// PostToolUse(Edit|Write): cảnh báo print/console.log và nhắc kiểm tra theo miền.
// Không chặn: trả additionalContext qua stdout JSON để Claude đọc, luôn exit 0.
const fs = require("fs");
let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  const notes = [];
  try {
    const ti = JSON.parse(raw || "{}").tool_input || {};
    const fp = String(ti.file_path || ti.path || "").replace(/\\/g, "/");
    if (!fp) process.exit(0);
    let text = "";
    try { text = fs.readFileSync(fp, "utf8"); } catch (_) {}
    if (/\/backend\/antam\/.*\.py$/.test(fp) && /^\s*print\(/m.test(text)) notes.push("Có print() trong backend/antam — dùng logging, không log CCCD/số tài khoản.");
    if (/\/frontend\/(app|components|lib)\/.*\.(ts|tsx)$/.test(fp) && /console\.log\(/.test(text)) notes.push("Có console.log trong frontend — xoá trước khi commit.");
    if (/\/backend\/antam\/tools\//.test(fp)) notes.push("Đã sửa tool tính toán: thêm/cập nhật test trong backend/tests/tools/ và chạy `cd backend && python -m pytest -q tests/tools`.");
    if (/\/backend\/antam\/prompts\//.test(fp)) notes.push("Đã sửa prompt: tăng số phiên bản ở dòng đầu và chạy /eval khi có mẫu.");
    if (/\/data\/seed\/legal_params\.yaml$/.test(fp)) notes.push("legal_params: không sửa giá trị cũ — thêm dòng mới với effective_from mới; cần source_doc và last_verified.");
    if (/\/data\/seed\/rules\.yaml$/.test(fp)) notes.push("rules.yaml: tên biến trong condition phải khớp build_facts() trong backend/antam/services/assess.py; chạy test rule_engine.");
    if (/\/backend\/antam\/schemas\/|\/frontend\/lib\/api\.ts$/.test(fp)) notes.push("Đã đổi schema/kiểu API: giữ frontend/lib/api.ts và backend/antam/schemas/ khớp nhau.");
    if (notes.length) {
      process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: notes.join("\n") } }));
    }
  } catch (_) {}
  process.exit(0);
});

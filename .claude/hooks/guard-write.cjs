// PreToolUse(Edit|Write): chặn sửa file bí mật, lockfile, và tài liệu tạm ở gốc repo.
const path = require("path");
let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  try {
    if (process.env.ALLOW_PROTECTED_EDIT === "1") process.exit(0);
    const ti = JSON.parse(raw || "{}").tool_input || {};
    const fp = String(ti.file_path || ti.path || "").replace(/\\/g, "/");
    if (!fp) process.exit(0);
    const base = path.posix.basename(fp);
    const rel = path.relative(process.cwd(), fp).replace(/\\/g, "/");
    let reason = "";
    if (/^\.env(\..+)?$/.test(base) && base !== ".env.example") reason = "file bí mật .env";
    else if (["package-lock.json", "yarn.lock", "pnpm-lock.yaml", "poetry.lock", "uv.lock"].includes(base)) reason = "lockfile (dùng npm/pip để cập nhật)";
    else if (!rel.includes("/") && /^(FINDINGS|REPORT|NOTES|SUMMARY|TODO)[^/]*\.md$/i.test(base)) reason = "tài liệu tạm ở gốc repo (ghi vào .claude/specs/<tính năng>/ thay vào đó)";
    if (reason) {
      process.stderr.write(`Đã chặn ghi ${fp}: ${reason}. Đặt ALLOW_PROTECTED_EDIT=1 nếu người dùng yêu cầu rõ.\n`);
      process.exit(2);
    }
  } catch (_) {}
  process.exit(0);
});

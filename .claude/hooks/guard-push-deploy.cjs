// PreToolUse(Bash): chặn git push và lệnh deploy/publish trừ khi có biến môi trường cho phép.
// Fail-open: lỗi nội bộ không bao giờ khoá phiên.
let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  try {
    const cmd = String((JSON.parse(raw || "{}").tool_input || {}).command || "");
    const push = /\bgit\s+push\b/.test(cmd);
    const deploy = /\bsam\s+deploy\b|\bvercel\b[^\n]*(--prod|\bdeploy\b)|\bamplify\s+publish\b|\bnpm\s+publish\b|\baws\s+cloudformation\s+(deploy|create-stack|update-stack)\b/.test(cmd);
    if (push && process.env.ALLOW_PUSH !== "1") {
      process.stderr.write("Đã chặn git push. Người dùng tự push, hoặc chạy lại với ALLOW_PUSH=1 nếu họ yêu cầu rõ.\n");
      process.exit(2);
    }
    if (deploy && process.env.ALLOW_DEPLOY !== "1") {
      process.stderr.write("Đã chặn lệnh deploy/publish (tốn credits AWS, ảnh hưởng bản giám khảo đang dùng). Đặt ALLOW_DEPLOY=1 nếu người dùng yêu cầu rõ.\n");
      process.exit(2);
    }
  } catch (_) {}
  process.exit(0);
});

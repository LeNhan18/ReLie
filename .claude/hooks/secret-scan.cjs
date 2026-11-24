// PreToolUse(Bash): khi lệnh là git commit, quét staged diff tìm khoá/bí mật. Chặn nếu thấy.
const { spawnSync } = require("child_process");
let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  try {
    const cmd = String((JSON.parse(raw || "{}").tool_input || {}).command || "");
    if (!/\bgit\s+commit\b/.test(cmd) || process.env.ALLOW_SECRET === "1") process.exit(0);
    const r = spawnSync("git", ["diff", "--cached", "-U0"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], shell: false });
    if (r.status !== 0 || !r.stdout) process.exit(0);
    const added = r.stdout.split("\n").filter((l) => l.startsWith("+") && !l.startsWith("+++")).join("\n");
    const patterns = [
      [/AKIA[0-9A-Z]{16}/, "AWS access key"],
      [/aws_secret_access_key\s*[=:]\s*\S{20,}/i, "AWS secret key"],
      [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "private key"],
      [/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, "JWT"],
      [/sk-[A-Za-z0-9]{20,}|xox[bpa]-[A-Za-z0-9-]{10,}|ghp_[A-Za-z0-9]{30,}/, "API token"],
      [/\b\d{12}\b(?=[^\n]*(cccd|cmnd|căn cước))/i, "số CCCD"],
    ];
    const hits = patterns.filter(([re]) => re.test(added)).map(([, n]) => n);
    const files = (spawnSync("git", ["diff", "--cached", "--name-only"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).stdout || "")
      .split("\n").filter((f) => /(^|\/)\.env($|\.)/.test(f) && !f.endsWith(".env.example"));
    if (files.length) hits.push(`file .env (${files.join(", ")})`);
    if (hits.length) {
      process.stderr.write(`Đã chặn commit: staged diff có vẻ chứa ${hits.join(", ")}. Gỡ ra khỏi commit, hoặc đặt ALLOW_SECRET=1 nếu chắc chắn là dữ liệu giả.\n`);
      process.exit(2);
    }
  } catch (_) {}
  process.exit(0);
});

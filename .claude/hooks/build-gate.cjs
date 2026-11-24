// Stop: chạy test tool + ruff (backend) và tsc (frontend) cho phần có thay đổi. Chặn (exit 2) khi kiểm tra
// thật sự thất bại; fail-open khi thiếu toolchain hoặc lỗi nội bộ. Dò toolchain TRƯỚC (không suy từ lỗi).
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const isWin = process.platform === "win32";
const root = process.cwd();
const run = (cmd, args, cwd) =>
  spawnSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], shell: isWin, timeout: 50000 });
const has = (cmd) => {
  const r = isWin ? run("where", [cmd], root) : run("sh", ["-c", `command -v ${cmd}`], root);
  return r.status === 0 && Boolean((r.stdout || "").trim());
};
const tail = (s, n = 25) => String(s || "").trim().split("\n").slice(-n).join("\n");

function changedAreas() {
  if (!has("git")) return { backend: true, frontend: true };
  const r = run("git", ["status", "--porcelain"], root);
  if (r.status !== 0) return { backend: true, frontend: true };
  const out = r.stdout || "";
  return { backend: /\s(backend|data)\//.test(out), frontend: /\sfrontend\//.test(out) };
}

let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  try {
    if (process.env.SKIP_BUILD_GATE === "1") process.exit(0);
    const failures = [];
    const warnings = [];
    const areas = changedAreas();

    const backend = path.join(root, "backend");
    if (areas.backend && fs.existsSync(path.join(backend, "pyproject.toml"))) {
      const py = ["python", "python3", "py"].find(has);
      if (!py) warnings.push("Bỏ qua kiểm tra backend: chưa có Python trên PATH.");
      else {
        const probe = run(py, ["-c", "import pytest"], backend);
        if (probe.status !== 0) warnings.push("Bỏ qua pytest: chưa cài (pip install -e \"backend[dev]\").");
        else {
          const t = run(py, ["-m", "pytest", "-q", "-x", "tests/tools"], backend);
          if (t.status !== 0 && t.status !== 5) failures.push("pytest tests/tools thất bại:\n" + tail(t.stdout + t.stderr));
        }
        if (has("ruff")) {
          const l = run("ruff", ["check", "."], backend);
          if (l.status !== 0) failures.push("ruff check thất bại:\n" + tail(l.stdout + l.stderr));
        }
      }
    }

    const frontend = path.join(root, "frontend");
    if (areas.frontend && fs.existsSync(path.join(frontend, "tsconfig.json"))) {
      if (!fs.existsSync(path.join(frontend, "node_modules", "typescript"))) warnings.push("Bỏ qua tsc: chưa chạy npm install trong frontend/.");
      else if (has("npx")) {
        const t = run("npx", ["tsc", "--noEmit"], frontend);
        if (t.status !== 0) failures.push("tsc --noEmit thất bại:\n" + tail(t.stdout + t.stderr));
      }
    }

    if (warnings.length) process.stdout.write(warnings.join("\n") + "\n");
    if (failures.length) {
      process.stderr.write("Build gate: sửa các lỗi sau trước khi kết thúc lượt (SKIP_BUILD_GATE=1 để bỏ qua):\n\n" + failures.join("\n\n") + "\n");
      process.exit(2);
    }
  } catch (_) {}
  process.exit(0);
});

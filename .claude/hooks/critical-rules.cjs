// SessionStart: in các quy tắc không bao giờ được quên. Luôn exit 0.
const rules = [
  "AnTâm — quy tắc cứng:",
  "1. Mọi con số tiền/lãi cho người dùng do backend/antam/tools/ tính (có unit test). LLM chỉ đọc và viết lời.",
  "2. Cảnh báo do rule_engine + data/seed/rules.yaml quyết định; tham số luật đọc theo ngày giải ngân. Luôn nói 'có dấu hiệu', không kết luận 'vi phạm'.",
  "3. Không lưu ảnh gốc, không log CCCD/số tài khoản, không xin quyền danh bạ/ảnh/tin nhắn, không cần đăng ký.",
  "4. Không gợi ý app cho vay không giấy phép, không chỉ cách lách thẩm định, không khuyên quỵt nợ.",
  "5. Ngân sách AWS $20: dùng AI_MODE=mock khi dựng UI và test; /eval mới gọi Bedrock thật.",
  "6. Đóng băng tính năng 29/11/2026, nộp bài trước 18:00 03/12/2026 — thà ít luồng mà chạy trọn.",
  "7. Không push/deploy khi chưa được yêu cầu (ALLOW_PUSH=1 / ALLOW_DEPLOY=1 để vượt guard).",
];
try { process.stdout.write(rules.join("\n") + "\n"); } catch (_) {}
process.exit(0);

import { formatIsoDateVi, formatVnd, type Installment } from "@/lib/api";

function escapeIcsText(raw: string): string {
  return raw
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function toCompactDate(isoDate: string): string | null {
  const compact = isoDate.split("-").join("");
  if (!/^\d{8}$/.test(compact)) {
    return null;
  }
  return compact;
}

function makeUtcTimestamp(): string {
  return new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

export function buildScheduleIcsContent(
  lenderName: string,
  schedule: readonly Installment[],
): string {
  const cleanLender = lenderName.trim() || "Khoản vay cần theo dõi";
  const dtStamp = makeUtcTimestamp();
  const hasMultipleInstallments = schedule.length > 1;

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AnTam//Lich Nhac Han Tra//VI",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(`Nhắc hạn trả - ${cleanLender}`)}`,
  ];

  schedule.forEach((item, idx) => {
    const compactDate = toCompactDate(item.on);
    if (!compactDate) {
      return;
    }

    const periodNumber = idx + 1;
    const amountLabel = formatVnd(item.amount);
    const dueDateLabel = formatIsoDateVi(item.on);

    const summaryRaw = hasMultipleInstallments
      ? `Nhắc hạn trả kỳ ${periodNumber} (${cleanLender}): ${amountLabel}`
      : `Nhắc hạn trả (${cleanLender}): ${amountLabel}`;

    const descriptionRaw = [
      `Hạn thanh toán ngày ${dueDateLabel} cho ${cleanLender}.`,
      `Số tiền theo lịch: ${amountLabel}.`,
      "Lưu ý từ AnTâm: Khi thanh toán nhớ chụp màn hình biên lai chuyển khoản để lưu bằng chứng.",
      "Đóng phí gia hạn thường không làm giảm tiền gốc — tuyệt đối không vay app mới để trả phí gia hạn cho app cũ.",
    ].join(" ");

    lines.push(
      "BEGIN:VEVENT",
      `UID:antam-due-${compactDate}-${periodNumber}@antam.local`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${compactDate}T080000`,
      `DTEND:${compactDate}T083000`,
      `SUMMARY:${escapeIcsText(summaryRaw)}`,
      `DESCRIPTION:${escapeIcsText(descriptionRaw)}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "TRIGGER:-P1D",
      `DESCRIPTION:${escapeIcsText(`Ngày mai đến hạn trả (${cleanLender}): ${amountLabel}`)}`,
      "END:VALARM",
      "END:VEVENT",
    );
  });

  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}

export function downloadScheduleIcs(
  lenderName: string,
  schedule: readonly Installment[],
): boolean {
  if (typeof window === "undefined" || schedule.length === 0) {
    return false;
  }

  const icsContent = buildScheduleIcsContent(lenderName, schedule);
  const blob = new Blob([icsContent], {
    type: "text/calendar;charset=utf-8",
  });
  const objectUrl = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = "antam-lich-nhac-han-tra.ics";
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 1000);

  return true;
}

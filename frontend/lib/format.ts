export function formatVnd(amount: number): string {
  return `${amount.toLocaleString("vi-VN")} đ`;
}

export function formatPct(pct: number): string {
  return `${pct.toLocaleString("vi-VN")}%`;
}

export function formatIsoDateVi(isoDate: string): string {
  const parts = isoDate.split("-");
  if (parts.length !== 3) {
    return isoDate;
  }
  const [yyyy, mm, dd] = parts;
  if (!yyyy || !mm || !dd) {
    return isoDate;
  }
  return `${dd}/${mm}/${yyyy}`;
}

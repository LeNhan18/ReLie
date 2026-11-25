export function formatVnd(amount: number): string {
  return `${amount.toLocaleString("vi-VN")} đ`;
}

export function formatPct(pct: number): string {
  return `${pct.toLocaleString("vi-VN")}%`;
}

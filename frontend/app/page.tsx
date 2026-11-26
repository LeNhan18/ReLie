import Link from "next/link";
import type { ReactNode } from "react";

type FeatureTile = {
  href: string;
  title: string;
  shortDesc: string;
  iconBg: string;
  icon: ReactNode;
};

const FEATURE_TILES: readonly FeatureTile[] = [
  {
    href: "/loan",
    title: "Kiểm tra khoản vay",
    shortDesc: "Tính lãi thật từ ảnh, PDF",
    iconBg: "bg-teal-50 text-teal-700",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <circle cx="11.5" cy="14.5" r="2.5" />
        <path d="m13.3 16.3 1.7 1.7" />
      </svg>
    ),
  },
  {
    href: "/aftercare",
    title: "Tôi đã lỡ vay",
    shortDesc: "Tách gốc, lãi & khoá quyền",
    iconBg: "bg-amber-50 text-amber-700",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M12 3v18" />
        <path d="m5 7 7-3 7 3" />
        <path d="m3 13 3-6 3 6a3 3 0 0 1-6 0Z" />
        <path d="m15 13 3-6 3 6a3 3 0 0 1-6 0Z" />
      </svg>
    ),
  },
  {
    href: "/harassment",
    title: "Tôi bị đòi nợ",
    shortDesc: "Lưu bằng chứng & mẫu tin",
    iconBg: "bg-rose-50 text-rose-700",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </svg>
    ),
  },
  {
    href: "/plan",
    title: "Hôm nay tiêu gì",
    shortDesc: "Dự báo tiền tới kỳ lương",
    iconBg: "bg-emerald-50 text-emerald-700",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <rect x="3" y="5" width="18" height="15" rx="2.5" />
        <path d="M16 3v4M8 3v4M3 10h18" />
        <path d="M8 15h4" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div className="space-y-4">
      {/* Thẻ chính chuẩn app tài chính: gọn, rõ, có nút hành động ngay */}
      <section className="relative overflow-hidden rounded-2xl bg-[#0D5C57] p-5 text-white shadow-sm">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/[0.06]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-12 right-12 h-28 w-28 rounded-full bg-emerald-400/[0.08]"
        />

        <div className="relative">
          <p className="text-xs font-medium text-teal-100/90">
            Không đăng ký · Không đọc danh bạ · Miễn phí
          </p>
          <h1 className="mt-1.5 text-xl font-bold leading-snug tracking-tight text-white">
            Tìm lối ra an toàn khi kẹt tiền
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-teal-50/85">
            Ưu tiên cách xoay xở 0đ, tính rõ lãi thật trước khi vay.
          </p>

          <Link
            href="/need"
            className="mt-4 flex min-h-[50px] w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-base font-bold text-teal-900 shadow-sm transition hover:bg-teal-50 active:scale-[0.99]"
          >
            <span className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-teal-800"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
              <span>Tôi cần tiền gấp</span>
            </span>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-teal-700"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Lưới 2x2 chuẩn app ngân hàng — icon vector sắc nét, 0 ảnh giả */}
      <section aria-label="Các công cụ chính" className="grid grid-cols-2 gap-3">
        {FEATURE_TILES.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex min-h-[124px] flex-col justify-between rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/80 transition hover:ring-teal-500/60 hover:shadow-sm active:scale-[0.98]"
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.iconBg}`}
            >
              {item.icon}
            </span>

            <div className="mt-3">
              <div className="text-[15px] font-bold leading-snug text-slate-900">
                {item.title}
              </div>
              <div className="mt-0.5 text-xs leading-snug text-slate-500">
                {item.shortDesc}
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* Lối tắt dùng thử nhanh */}
      <Link
        href="/loan"
        className="flex min-h-[56px] items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/80 transition hover:ring-slate-300 active:scale-[0.99]"
      >
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">
            Có sẵn hợp đồng PDF, Word hoặc ảnh chụp?
          </div>
          <div className="text-xs text-slate-500">
            Tải lên để kiểm tra chi phí thật ngay
          </div>
        </div>
        <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-teal-800">
          Mở ngay
        </span>
      </Link>

      {/* Cam kết 1 dòng tinh gọn */}
      <div className="pt-1 text-center">
        <Link
          href="/privacy"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-xs font-medium text-slate-500 transition hover:text-teal-700"
        >
          <span>Không cho vay · Không nhận hoa hồng · Xem quyền riêng tư →</span>
        </Link>
      </div>
    </div>
  );
}

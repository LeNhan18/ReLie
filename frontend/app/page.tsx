import Link from "next/link";

const FEATURE_TILES = [
  {
    href: "/loan",
    title: "Kiểm tra khoản vay",
    shortDesc: "Tính lãi thật từ ảnh, PDF",
    iconSrc: "/icons/03-kiem-tra-khoan-vay.png",
    iconAlt: "Kiểm tra khoản vay",
  },
  {
    href: "/aftercare",
    title: "Tôi đã lỡ vay",
    shortDesc: "Tách gốc, lãi & khoá quyền",
    iconSrc: "/icons/04-toi-da-lo-vay.png",
    iconAlt: "Tôi đã lỡ vay",
  },
  {
    href: "/harassment",
    title: "Tôi bị đòi nợ",
    shortDesc: "Lưu bằng chứng & mẫu tin",
    iconSrc: "/icons/05-toi-bi-doi-no.png",
    iconAlt: "Tôi bị đòi nợ",
  },
  {
    href: "/plan",
    title: "Hôm nay tiêu gì",
    shortDesc: "Dự báo tiền tới kỳ lương",
    iconSrc: "/icons/06-hom-nay-tieu-gi.png",
    iconAlt: "Hôm nay tiêu gì",
  },
] as const;

export default function Home() {
  return (
    <div className="space-y-4">
      {/* Thẻ Hero màu thương hiệu #C61F2B tích hợp nút hành động chính */}
      <section className="relative overflow-hidden rounded-2xl bg-[#C61F2B] p-5 text-white shadow-sm">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/[0.08]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-12 right-12 h-28 w-28 rounded-full bg-black/[0.08]"
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
            className="mt-4 flex min-h-[54px] w-full items-center justify-between rounded-xl bg-white px-3.5 py-2.5 text-base font-bold text-teal-950 shadow-sm transition hover:bg-teal-50 active:scale-[0.99]"
          >
            <span className="flex items-center gap-3">
              <img
                src="/icons/02-can-tien-gap.png"
                alt="Tôi cần tiền gấp"
                className="h-9 w-9 shrink-0 object-contain"
              />
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

      {/* Lưới 2x2 với bộ icon 3D nền trắng tiệp hoàn toàn */}
      <section aria-label="Các công cụ chính" className="grid grid-cols-2 gap-3">
        {FEATURE_TILES.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex min-h-[132px] flex-col justify-between rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/80 transition hover:ring-teal-600/50 hover:shadow-sm active:scale-[0.98]"
          >
            <img
              src={item.iconSrc}
              alt={item.iconAlt}
              className="h-12 w-12 object-contain transition duration-200 group-hover:scale-105"
            />

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

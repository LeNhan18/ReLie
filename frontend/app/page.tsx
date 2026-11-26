import Link from "next/link";
import type { ReactNode } from "react";
import {
  AftercareLockIcon,
  HarassmentGuardIcon,
  LoanScanIcon,
  MascotShieldIcon,
  NeedWalletIcon,
  PlanPiggyIcon,
} from "@/components/AnimatedIcons";

type FeatureTile = {
  href: string;
  title: string;
  shortDesc: string;
  icon: ReactNode;
};

const FEATURE_TILES: readonly FeatureTile[] = [
  {
    href: "/loan",
    title: "Kiểm tra khoản vay",
    shortDesc: "Soi lãi thật từ ảnh, PDF",
    icon: <LoanScanIcon className="h-12 w-12" />,
  },
  {
    href: "/aftercare",
    title: "Tôi đã lỡ vay",
    shortDesc: "Tách gốc, lãi & khoá quyền",
    icon: <AftercareLockIcon className="h-12 w-12" />,
  },
  {
    href: "/harassment",
    title: "Tôi bị đòi nợ",
    shortDesc: "Lưu bằng chứng & mẫu tin",
    icon: <HarassmentGuardIcon className="h-12 w-12" />,
  },
  {
    href: "/plan",
    title: "Hôm nay tiêu gì",
    shortDesc: "Dự báo tiền tới kỳ lương",
    icon: <PlanPiggyIcon className="h-12 w-12" />,
  },
];

export default function Home() {
  return (
    <div className="space-y-4">
      {/* Khối chính sắc hồng MoMo gọn gàng, mascot hoạt hình thân thiện */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#D82D8B] to-[#A50064] p-5 text-white shadow-sm">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10"
        />

        <div className="relative flex items-center gap-3.5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/95 p-1.5 shadow-sm">
            <MascotShieldIcon className="h-11 w-11" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-extrabold leading-snug tracking-tight text-white">
              An tâm khi kẹt tiền
            </h1>
            <p className="mt-0.5 text-xs font-medium text-pink-100">
              Không đăng ký · Không đọc danh bạ · Miễn phí
            </p>
          </div>
        </div>

        <Link
          href="/need"
          className="relative mt-4 flex min-h-[56px] w-full items-center justify-between rounded-2xl bg-white px-3.5 py-2 text-base font-bold text-teal-800 shadow-sm transition hover:bg-teal-50 active:scale-[0.99]"
        >
          <span className="flex items-center gap-3">
            <NeedWalletIcon className="h-10 w-10 shrink-0" />
            <span>Tôi cần tiền gấp</span>
          </span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-teal-700"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      </section>

      {/* Lưới 2x2 với icon hoạt hình dễ thương */}
      <section aria-label="Các công cụ chính" className="grid grid-cols-2 gap-3">
        {FEATURE_TILES.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex min-h-[136px] flex-col justify-between rounded-2xl bg-white p-4 shadow-[0_2px_8px_rgba(165,0,100,0.06)] ring-1 ring-pink-100 transition hover:ring-teal-500/60 hover:shadow-md active:scale-[0.98]"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50/90 p-1">
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

      {/* Lối tắt kiểm tra file hợp đồng */}
      <Link
        href="/loan"
        className="flex min-h-[56px] items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_2px_8px_rgba(165,0,100,0.05)] ring-1 ring-pink-100 transition hover:ring-teal-400 active:scale-[0.99]"
      >
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">
            Có sẵn hợp đồng PDF, Word hoặc ảnh?
          </div>
          <div className="text-xs text-slate-500">
            Tải lên để xem lãi thực ngay
          </div>
        </div>
        <span className="shrink-0 rounded-xl bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700">
          Soi ngay
        </span>
      </Link>

      {/* Cam kết 1 dòng tinh gọn */}
      <div className="pt-1 text-center">
        <Link
          href="/privacy"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-xs font-medium text-slate-500 transition hover:text-teal-700"
        >
          <span>Không cho vay · Không hoa hồng · Quyền riêng tư →</span>
        </Link>
      </div>
    </div>
  );
}

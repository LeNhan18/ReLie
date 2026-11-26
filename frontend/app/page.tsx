import Link from "next/link";
import { BigButton } from "@/components/BigButton";

const FEATURE_TILES = [
  {
    href: "/loan",
    title: "Kiểm tra khoản vay",
    shortDesc: "Tính lãi thật từ ảnh, PDF",
    imageSrc: "/images/card-loan.jpg",
    imageAlt: "Kiểm tra hợp đồng vay",
  },
  {
    href: "/aftercare",
    title: "Tôi đã lỡ vay",
    shortDesc: "Tách gốc, lãi & khoá quyền",
    imageSrc: "/images/card-aftercare.jpg",
    imageAlt: "Hỗ trợ sau khi đã vay",
  },
  {
    href: "/harassment",
    title: "Tôi bị đòi nợ",
    shortDesc: "Lưu bằng chứng & mẫu tin",
    imageSrc: "/images/card-harassment.jpg",
    imageAlt: "Bảo vệ khi bị đòi nợ",
  },
  {
    href: "/plan",
    title: "Hôm nay tiêu gì",
    shortDesc: "Dự báo tiền tới kỳ lương",
    imageSrc: "/images/card-plan.jpg",
    imageAlt: "Kế hoạch chi tiêu hàng ngày",
  },
] as const;

export default function Home() {
  return (
    <div className="space-y-4">
      {/* Banner hình ảnh gọn gàng, trực quan */}
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
        <div className="relative">
          <img
            src="/images/hero-antam.jpg"
            alt="AnTâm — Vững tâm trước khó khăn tài chính"
            className="aspect-[16/9] w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 via-slate-950/35 to-transparent px-4 pb-3.5 pt-10 text-white">
            <h1 className="text-xl font-bold leading-tight tracking-tight">
              Vững tâm trước khó khăn tài chính
            </h1>
            <p className="mt-0.5 text-sm text-white/90">
              Không đăng ký · Không đọc danh bạ · Miễn phí
            </p>
          </div>
        </div>
      </section>

      {/* Nút ưu tiên số 1 */}
      <BigButton
        href="/need"
        featured
        title="Tôi cần tiền gấp"
        hint="Tìm cách xoay tiền an toàn hoặc xin giãn chi"
        imageSrc="/images/card-need.jpg"
        imageAlt="Cần tiền gấp"
      />

      {/* Lưới hình ảnh 2x2: nhìn 1 lần thấy ngay toàn bộ tính năng */}
      <section aria-label="Các công cụ chính" className="grid grid-cols-2 gap-3">
        {FEATURE_TILES.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex flex-col overflow-hidden rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200/80 transition hover:shadow-md hover:ring-teal-500/60 active:scale-[0.98]"
          >
            <div className="overflow-hidden rounded-xl bg-slate-50">
              <img
                src={item.imageSrc}
                alt={item.imageAlt}
                className="aspect-[4/3] w-full object-cover transition duration-200 group-hover:scale-[1.03]"
              />
            </div>
            <div className="mt-2.5 px-0.5">
              <div className="text-base font-bold leading-snug text-slate-900">
                {item.title}
              </div>
              <div className="mt-0.5 text-xs leading-snug text-slate-500">
                {item.shortDesc}
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* Thanh cam kết 1 dòng tinh gọn */}
      <div className="pt-1 text-center">
        <Link
          href="/privacy"
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm font-medium text-slate-500 transition hover:text-teal-700"
        >
          <span>Không cho vay · Không hoa hồng · Xem quyền riêng tư →</span>
        </Link>
      </div>
    </div>
  );
}

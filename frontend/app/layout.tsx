import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "AnTâm — Bảo vệ bạn trước bẫy tín dụng đen",
  description:
    "Trợ lý AI đồng hành cùng người lao động tìm lối ra an toàn khi kẹt tiền, tính chi phí vay thật và bảo vệ quyền riêng tư.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f766e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="flex min-h-screen flex-col bg-slate-50 pb-24 text-slate-900 antialiased">
        <AppHeader />
        <main className="mx-auto w-full max-w-lg flex-1 px-4 py-5 sm:py-6">
          {children}
        </main>
        <footer className="mt-auto border-t border-slate-200/80 bg-white/90">
          <div className="mx-auto flex max-w-lg flex-col gap-2 px-4 py-4 text-sm text-slate-600">
            <p className="leading-relaxed">
              AnTâm không cho vay, không nhận hoa hồng giới thiệu và không lưu ảnh hợp đồng của bạn.
            </p>
            <div>
              <Link
                href="/privacy"
                className="inline-flex min-h-[48px] items-center gap-1.5 rounded-xl px-2 -ml-2 font-semibold text-teal-800 underline decoration-teal-300 underline-offset-4 hover:bg-teal-50 hover:text-teal-950"
              >
                <span>Cam kết quyền riêng tư &amp; Xoá dữ liệu phiên</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </footer>
        <BottomNav />
      </body>
    </html>
  );
}

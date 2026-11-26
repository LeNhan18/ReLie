import type { Metadata, Viewport } from "next";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "AnTâm — Trợ lý tài chính an toàn",
  description:
    "Tìm lối ra an toàn khi kẹt tiền, tính chi phí vay thật và tránh bẫy tín dụng đen.",
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
      <body className="flex min-h-screen flex-col pb-24 text-slate-900 antialiased">
        <AppHeader />
        <main className="mx-auto w-full max-w-lg flex-1 px-4 py-4 sm:py-5">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <Link
          href="/"
          aria-current={isHome ? "page" : undefined}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          <img
            src="/icons/01-logo-antam.png"
            alt="Logo AnTâm"
            className="h-9 w-9 shrink-0 object-contain"
          />
          <span className="text-lg font-bold tracking-tight text-slate-900">AnTâm</span>
        </Link>

        <Link
          href="/privacy"
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200/80"
        >
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Ẩn danh</span>
        </Link>
      </div>
    </header>
  );
}

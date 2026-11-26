"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MascotShieldIcon } from "./AnimatedIcons";

export function AppHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-30 border-b border-pink-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <Link
          href="/"
          aria-current={isHome ? "page" : undefined}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          <MascotShieldIcon className="h-9 w-9 shrink-0" />
          <span className="text-lg font-extrabold tracking-tight text-teal-700">AnTâm</span>
        </Link>

        <Link
          href="/privacy"
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-800 transition hover:bg-teal-100"
        >
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Ẩn danh</span>
        </Link>
      </div>
    </header>
  );
}

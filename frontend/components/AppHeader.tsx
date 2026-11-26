"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isPlan = pathname === "/plan" || pathname.startsWith("/plan/");
  const isPrivacy = pathname === "/privacy" || pathname.startsWith("/privacy/");

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-2 px-4 py-1.5">
        <Link
          href="/"
          aria-current={isHome ? "page" : undefined}
          className="group inline-flex min-h-[48px] items-center gap-2.5 rounded-xl px-1.5 py-1 text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-800 text-white shadow-sm transition group-hover:from-teal-700 group-hover:to-emerald-900"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight text-teal-900">AnTâm</span>
            <span className="mt-0.5 hidden text-xs font-medium text-slate-500 min-[355px]:block">
              Ẩn danh · Không hoa hồng
            </span>
          </span>
        </Link>

        <nav aria-label="Điều hướng nhanh" className="flex items-center gap-1">
          <Link
            href="/plan"
            aria-current={isPlan ? "page" : undefined}
            className={`inline-flex min-h-[48px] items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-semibold transition ${
              isPlan
                ? "bg-teal-50 text-teal-900 ring-1 ring-inset ring-teal-300"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
            }`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 shrink-0 text-teal-700"
            >
              <rect x="3" y="5" width="18" height="15" rx="2.5" />
              <path d="M16 3v4M8 3v4M3 10h18" />
            </svg>
            <span>Chi tiêu</span>
          </Link>

          <Link
            href="/privacy"
            aria-current={isPrivacy ? "page" : undefined}
            className={`inline-flex min-h-[48px] items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-semibold transition ${
              isPrivacy
                ? "bg-teal-50 text-teal-900 ring-1 ring-inset ring-teal-300"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
            }`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 shrink-0 text-teal-700"
            >
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            <span>Riêng tư</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

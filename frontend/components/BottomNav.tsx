"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
  icon: (active: boolean) => ReactNode;
};

const NAV_ITEMS: readonly NavItem[] = [
  {
    href: "/",
    label: "Trang chủ",
    match: (p) => p === "/",
    icon: (active) => (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.3 : 1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
        <path d="M9.5 21v-6h5v6" />
      </svg>
    ),
  },
  {
    href: "/need",
    label: "Cần tiền",
    match: (p) => p === "/need" || p.startsWith("/need/"),
    icon: (active) => (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.3 : 1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
        <path d="m5.6 5.6 3.5 3.5M14.9 14.9l3.5 3.5M18.4 5.6l-3.5 3.5M9.1 14.9l-3.5 3.5" />
      </svg>
    ),
  },
  {
    href: "/loan",
    label: "Soi vay",
    match: (p) => p === "/loan" || p.startsWith("/loan/"),
    icon: (active) => (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.3 : 1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <circle cx="11.5" cy="14.5" r="2.2" />
        <path d="m13.2 16.2 1.8 1.8" />
      </svg>
    ),
  },
  {
    href: "/plan",
    label: "Chi tiêu",
    match: (p) => p === "/plan" || p.startsWith("/plan/"),
    icon: (active) => (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.3 : 1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <rect x="3" y="5" width="18" height="15" rx="2.5" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </svg>
    ),
  },
  {
    href: "/privacy",
    label: "Riêng tư",
    match: (p) => p === "/privacy" || p.startsWith("/privacy/"),
    icon: (active) => (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2.3 : 1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label="Thanh điều hướng nhanh"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(15,23,42,0.06)] backdrop-blur-md"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 px-1.5 py-1">
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                active
                  ? "bg-teal-50/90 text-teal-800"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span
                className={`flex h-7 w-10 items-center justify-center rounded-full transition ${
                  active ? "bg-teal-700 text-white shadow-sm" : "text-slate-500"
                }`}
              >
                {item.icon(active)}
              </span>
              <span
                className={`text-[11px] leading-tight sm:text-xs ${
                  active ? "font-bold text-teal-900" : "font-medium"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

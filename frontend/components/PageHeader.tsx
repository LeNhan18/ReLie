"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export type PageHeaderProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  backHref?: string;
  backLabel?: string;
  rightSlot?: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
};

function getRouteIcon(pathname: string | null): { bg: string; svg: ReactNode } | null {
  if (!pathname) return null;
  if (pathname === "/need" || pathname.startsWith("/need/")) {
    return {
      bg: "bg-teal-50 text-teal-700",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      ),
    };
  }
  if (pathname === "/loan" || pathname.startsWith("/loan/")) {
    return {
      bg: "bg-teal-50 text-teal-700",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <circle cx="11.5" cy="14.5" r="2.5" />
          <path d="m13.3 16.3 1.7 1.7" />
        </svg>
      ),
    };
  }
  if (pathname === "/aftercare" || pathname.startsWith("/aftercare/")) {
    return {
      bg: "bg-amber-50 text-amber-700",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M12 3v18" />
          <path d="m5 7 7-3 7 3" />
          <path d="m3 13 3-6 3 6a3 3 0 0 1-6 0Z" />
          <path d="m15 13 3-6 3 6a3 3 0 0 1-6 0Z" />
        </svg>
      ),
    };
  }
  if (pathname === "/harassment" || pathname.startsWith("/harassment/")) {
    return {
      bg: "bg-rose-50 text-rose-700",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      ),
    };
  }
  if (pathname === "/plan" || pathname.startsWith("/plan/")) {
    return {
      bg: "bg-emerald-50 text-emerald-700",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <rect x="3" y="5" width="18" height="15" rx="2.5" />
          <path d="M16 3v4M8 3v4M3 10h18" />
          <path d="M8 15h4" />
        </svg>
      ),
    };
  }
  if (pathname === "/privacy" || pathname.startsWith("/privacy/")) {
    return {
      bg: "bg-slate-100 text-slate-700",
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      ),
    };
  }
  return null;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  backHref,
  backLabel = "Trang chủ",
  rightSlot,
}: PageHeaderProps) {
  const pathname = usePathname();
  const routeIcon = getRouteIcon(pathname);

  return (
    <header className="space-y-2.5">
      {(backHref || rightSlot) ? (
        <div className="flex items-center justify-between gap-2">
          {backHref ? (
            <Link
              href={backHref}
              className="-ml-2 inline-flex min-h-[40px] items-center gap-1 rounded-xl px-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200/60 hover:text-slate-900"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 shrink-0"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span>{backLabel}</span>
            </Link>
          ) : (
            <span />
          )}

          {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        {routeIcon ? (
          <span
            aria-hidden="true"
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${routeIcon.bg}`}
          >
            {routeIcon.svg}
          </span>
        ) : null}

        <div className="min-w-0 flex-1">
          {badge ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              {badge}
            </p>
          ) : null}
          <h1 className="text-xl font-bold leading-snug tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-0.5 text-sm leading-snug text-slate-500">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  );
}

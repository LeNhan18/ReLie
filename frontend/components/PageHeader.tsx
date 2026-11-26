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

function getRouteImage(pathname: string | null): string | undefined {
  if (!pathname) {
    return undefined;
  }
  if (pathname === "/need" || pathname.startsWith("/need/")) {
    return "/images/card-need.jpg";
  }
  if (pathname === "/loan" || pathname.startsWith("/loan/")) {
    return "/images/card-loan.jpg";
  }
  if (pathname === "/aftercare" || pathname.startsWith("/aftercare/")) {
    return "/images/card-aftercare.jpg";
  }
  if (pathname === "/harassment" || pathname.startsWith("/harassment/")) {
    return "/images/card-harassment.jpg";
  }
  if (pathname === "/plan" || pathname.startsWith("/plan/")) {
    return "/images/card-plan.jpg";
  }
  if (pathname === "/privacy" || pathname.startsWith("/privacy/")) {
    return "/images/hero-antam.jpg";
  }
  return undefined;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  backHref,
  backLabel = "Về trang chủ",
  rightSlot,
  imageSrc,
  imageAlt,
}: PageHeaderProps) {
  const pathname = usePathname();
  const resolvedImageSrc = imageSrc ?? getRouteImage(pathname);

  return (
    <header className="space-y-3">
      {(backHref || rightSlot) ? (
        <div className="flex items-center justify-between gap-2">
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex min-h-[48px] items-center gap-1.5 rounded-xl px-2.5 py-2 -ml-2 text-base font-semibold text-teal-800 transition hover:bg-teal-50 hover:text-teal-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-100"
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

      <div className="rounded-3xl border border-teal-200/70 bg-gradient-to-br from-white via-white to-teal-50/70 p-4 sm:p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3.5">
          <div className="min-w-0 flex-1 space-y-2">
            {badge ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-900">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                {badge}
              </span>
            ) : null}

            <h1 className="text-2xl font-bold leading-snug tracking-tight text-slate-900">
              {title}
            </h1>

            {subtitle ? (
              <p className="text-base leading-relaxed text-slate-600">{subtitle}</p>
            ) : null}
          </div>

          {resolvedImageSrc ? (
            <img
              src={resolvedImageSrc}
              alt={imageAlt ?? title}
              className="h-20 w-20 shrink-0 rounded-2xl object-cover shadow-sm ring-1 ring-black/5 sm:h-24 sm:w-24"
            />
          ) : null}
        </div>
      </div>
    </header>
  );
}

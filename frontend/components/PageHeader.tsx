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
  if (!pathname) return undefined;
  if (pathname === "/need" || pathname.startsWith("/need/")) return "/images/card-need.jpg";
  if (pathname === "/loan" || pathname.startsWith("/loan/")) return "/images/card-loan.jpg";
  if (pathname === "/aftercare" || pathname.startsWith("/aftercare/")) return "/images/card-aftercare.jpg";
  if (pathname === "/harassment" || pathname.startsWith("/harassment/")) return "/images/card-harassment.jpg";
  if (pathname === "/plan" || pathname.startsWith("/plan/")) return "/images/card-plan.jpg";
  if (pathname === "/privacy" || pathname.startsWith("/privacy/")) return "/images/hero-antam.jpg";
  return undefined;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  backHref,
  backLabel = "Trang chủ",
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
              className="-ml-2 inline-flex min-h-[44px] items-center gap-1 rounded-xl px-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200/60 hover:text-slate-900"
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

      <div className="flex items-center gap-3.5">
        {resolvedImageSrc ? (
          <img
            src={resolvedImageSrc}
            alt={imageAlt ?? title}
            className="h-14 w-14 shrink-0 rounded-2xl object-cover shadow-sm ring-1 ring-black/5"
          />
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
            <p className="mt-0.5 line-clamp-2 text-sm leading-relaxed text-slate-500">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  );
}

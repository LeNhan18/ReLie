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

function getRouteIconSrc(pathname: string | null): string | undefined {
  if (!pathname) return undefined;
  if (pathname === "/need" || pathname.startsWith("/need/")) return "/icons/02-can-tien-gap.png";
  if (pathname === "/loan" || pathname.startsWith("/loan/")) return "/icons/03-kiem-tra-khoan-vay.png";
  if (pathname === "/aftercare" || pathname.startsWith("/aftercare/")) return "/icons/04-toi-da-lo-vay.png";
  if (pathname === "/harassment" || pathname.startsWith("/harassment/")) return "/icons/05-toi-bi-doi-no.png";
  if (pathname === "/plan" || pathname.startsWith("/plan/")) return "/icons/06-hom-nay-tieu-gi.png";
  if (pathname === "/privacy" || pathname.startsWith("/privacy/")) return "/icons/01-logo-antam.png";
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
  const resolvedIconSrc = imageSrc ?? getRouteIconSrc(pathname);

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
        {resolvedIconSrc ? (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200/80">
            <img
              src={resolvedIconSrc}
              alt={imageAlt ?? title}
              className="h-full w-full object-contain"
            />
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

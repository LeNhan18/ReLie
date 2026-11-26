"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  AftercareLockIcon,
  HarassmentGuardIcon,
  LoanScanIcon,
  MascotShieldIcon,
  NeedWalletIcon,
  PlanPiggyIcon,
} from "./AnimatedIcons";

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

function renderRouteCuteIcon(pathname: string | null): ReactNode {
  if (!pathname) return null;
  if (pathname === "/need" || pathname.startsWith("/need/")) {
    return <NeedWalletIcon className="h-11 w-11" />;
  }
  if (pathname === "/loan" || pathname.startsWith("/loan/")) {
    return <LoanScanIcon className="h-11 w-11" />;
  }
  if (pathname === "/aftercare" || pathname.startsWith("/aftercare/")) {
    return <AftercareLockIcon className="h-11 w-11" />;
  }
  if (pathname === "/harassment" || pathname.startsWith("/harassment/")) {
    return <HarassmentGuardIcon className="h-11 w-11" />;
  }
  if (pathname === "/plan" || pathname.startsWith("/plan/")) {
    return <PlanPiggyIcon className="h-11 w-11" />;
  }
  if (pathname === "/privacy" || pathname.startsWith("/privacy/")) {
    return <MascotShieldIcon className="h-11 w-11" />;
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
  const cuteIcon = renderRouteCuteIcon(pathname);

  return (
    <header className="space-y-2.5">
      {(backHref || rightSlot) ? (
        <div className="flex items-center justify-between gap-2">
          {backHref ? (
            <Link
              href={backHref}
              className="-ml-2 inline-flex min-h-[40px] items-center gap-1 rounded-xl px-2 text-sm font-semibold text-slate-600 transition hover:bg-teal-50 hover:text-teal-800"
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
        {cuteIcon ? (
          <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-teal-50 p-1 ring-1 ring-teal-200/70">
            {cuteIcon}
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

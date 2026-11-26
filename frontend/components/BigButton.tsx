import Link from "next/link";
import type { ReactNode } from "react";

export type BigButtonProps = {
  href: string;
  title: string;
  hint: string;
  icon?: ReactNode;
  badge?: string;
  featured?: boolean;
  imageSrc?: string;
  imageAlt?: string;
};

export function BigButton({
  href,
  title,
  hint,
  icon,
  badge,
  featured = false,
  imageSrc,
  imageAlt,
}: BigButtonProps) {
  if (featured) {
    return (
      <Link
        href={href}
        className="group relative flex min-h-[76px] w-full items-center justify-between gap-3.5 overflow-hidden rounded-2xl border-2 border-teal-600 bg-gradient-to-br from-teal-700 via-teal-800 to-emerald-900 p-4 sm:p-5 text-white shadow-md transition hover:from-teal-800 hover:to-emerald-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 active:scale-[0.99]"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3.5">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={imageAlt ?? title}
              className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-md ring-2 ring-white/30 sm:h-[72px] sm:w-[72px]"
            />
          ) : icon ? (
            <span
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-emerald-100 ring-1 ring-inset ring-white/25"
            >
              {icon}
            </span>
          ) : null}

          <div className="min-w-0 flex-1">
            {badge ? (
              <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-emerald-50 ring-1 ring-inset ring-white/25">
                {badge}
              </span>
            ) : null}
            <div className="text-xl font-bold leading-snug text-white">{title}</div>
            <div className="mt-1 text-base leading-relaxed text-teal-50/95">{hint}</div>
          </div>
        </div>

        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-teal-800 shadow-sm transition group-hover:translate-x-0.5"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group flex min-h-[72px] w-full items-center justify-between gap-3.5 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-sm transition hover:border-teal-500 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:scale-[0.99] active:bg-slate-50"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={imageAlt ?? title}
            loading="lazy"
            className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-sm ring-1 ring-black/5 transition group-hover:scale-[1.02] sm:h-[72px] sm:w-[72px]"
          />
        ) : icon ? (
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-teal-100 bg-teal-50/80 text-teal-700 transition group-hover:border-teal-200 group-hover:bg-teal-100/80"
          >
            {icon}
          </span>
        ) : null}

        <div className="min-w-0 flex-1">
          {badge ? (
            <span className="mb-1 inline-block rounded-full border border-teal-200/80 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-900">
              {badge}
            </span>
          ) : null}
          <div className="text-lg font-bold leading-snug text-slate-900">{title}</div>
          <div className="mt-1 text-base leading-relaxed text-slate-600">{hint}</div>
        </div>
      </div>

      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-teal-700 transition group-hover:bg-teal-700 group-hover:text-white"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </span>
    </Link>
  );
}

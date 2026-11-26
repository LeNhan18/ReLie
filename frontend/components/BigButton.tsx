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
        className="group flex min-h-[76px] w-full items-center gap-3.5 rounded-2xl bg-teal-700 p-4 text-white shadow-sm transition hover:bg-teal-800 active:scale-[0.99]"
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={imageAlt ?? title}
            className="h-14 w-14 shrink-0 rounded-xl object-cover ring-2 ring-white/25"
          />
        ) : icon ? (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
            {icon}
          </span>
        ) : null}

        <div className="min-w-0 flex-1">
          {badge ? (
            <span className="text-xs font-semibold uppercase tracking-wide text-teal-100">
              {badge}
            </span>
          ) : null}
          <div className="text-lg font-bold leading-snug text-white">{title}</div>
          <div className="mt-0.5 text-sm text-teal-100">{hint}</div>
        </div>

        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 shrink-0 text-white/90 transition group-hover:translate-x-0.5"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group flex min-h-[68px] w-full items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition hover:border-slate-300 hover:shadow active:scale-[0.99]"
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={imageAlt ?? title}
          loading="lazy"
          className="h-14 w-14 shrink-0 rounded-xl object-cover ring-1 ring-black/5"
        />
      ) : icon ? (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-teal-700">
          {icon}
        </span>
      ) : null}

      <div className="min-w-0 flex-1">
        {badge ? (
          <span className="text-xs font-semibold text-teal-700">{badge}</span>
        ) : null}
        <div className="text-base font-bold leading-snug text-slate-900">{title}</div>
        <div className="mt-0.5 text-sm text-slate-500">{hint}</div>
      </div>

      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-teal-700"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </Link>
  );
}

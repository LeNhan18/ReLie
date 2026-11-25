import Link from "next/link";

export type BigButtonProps = {
  href: string;
  title: string;
  hint: string;
};

export function BigButton({ href, title, hint }: BigButtonProps) {
  return (
    <Link
      href={href}
      className="flex min-h-[56px] w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:scale-[0.99] active:bg-slate-50"
    >
      <div className="min-w-0 flex-1">
        <div className="text-lg font-semibold leading-snug text-slate-900">{title}</div>
        <div className="mt-1 text-base leading-relaxed text-slate-600">{hint}</div>
      </div>
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-lg font-bold text-teal-700"
      >
        ›
      </span>
    </Link>
  );
}

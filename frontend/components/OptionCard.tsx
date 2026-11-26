"use client";

import type { ReactNode } from "react";
import type { Option } from "@/lib/api";

export type OptionCardProps = {
  option: Option;
  onDraft?: (option: Option) => void;
  icon?: ReactNode;
};

function getFitStyle(fit: Option["fit"]): { label: string; className: string } {
  switch (fit) {
    case "cao":
      return { label: "Phù hợp cao", className: "bg-emerald-50 text-emerald-800" };
    case "co_the":
      return { label: "Có thể", className: "bg-amber-50 text-amber-800" };
    case "kho":
      return { label: "Khó duyệt", className: "bg-slate-100 text-slate-600" };
  }
}

export function OptionCard({ option, onDraft }: OptionCardProps) {
  const fit = getFitStyle(option.fit);
  const isNoLoan = option.kind === "no_loan";

  return (
    <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
        <span
          className={`rounded-full px-2.5 py-0.5 ${
            isNoLoan ? "bg-teal-50 text-teal-800" : "bg-sky-50 text-sky-800"
          }`}
        >
          {isNoLoan ? "Không cần vay" : "Có giấy phép"}
        </span>
        <span className={`rounded-full px-2.5 py-0.5 ${fit.className}`}>
          {fit.label}
        </span>
      </div>

      <h3 className="mt-2 text-base font-bold leading-snug text-slate-900">
        {option.title}
      </h3>

      <p className="mt-1 text-sm text-slate-600">
        {option.cost_note} · {option.speed}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {isNoLoan && onDraft ? (
          <button
            type="button"
            onClick={() => onDraft(option)}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 active:bg-teal-900"
          >
            Soạn thư mẫu
          </button>
        ) : null}

        {option.source_url ? (
          <a
            href={option.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center rounded-xl px-3 text-sm font-semibold text-teal-700 hover:bg-teal-50"
          >
            Xem nguồn ↗
          </a>
        ) : null}
      </div>
    </article>
  );
}

"use client";

import type { ReactNode } from "react";
import type { Option } from "@/lib/api";

export type OptionCardProps = {
  option: Option;
  onDraft?: (option: Option) => void;
  icon?: ReactNode;
};

function getFitBadge(fit: Option["fit"]): {
  label: string;
  className: string;
  dotClass: string;
} {
  switch (fit) {
    case "cao":
      return {
        label: "Phù hợp cao",
        className: "border border-emerald-300 bg-emerald-50 text-emerald-950",
        dotClass: "bg-emerald-600",
      };
    case "co_the":
      return {
        label: "Có thể phù hợp",
        className: "border border-amber-300 bg-amber-50 text-amber-950",
        dotClass: "bg-amber-500",
      };
    case "kho":
      return {
        label: "Khó duyệt",
        className: "border border-slate-300 bg-slate-100 text-slate-800",
        dotClass: "bg-slate-500",
      };
  }
}

export function OptionCard({ option, onDraft, icon }: OptionCardProps) {
  const fitBadge = getFitBadge(option.fit);
  const isNoLoan = option.kind === "no_loan";
  const kindLabel = isNoLoan ? "Không cần vay" : "Kênh vay có giấy phép";
  const kindClass = isNoLoan
    ? "border border-teal-200 bg-teal-50 text-teal-950"
    : "border border-sky-200 bg-sky-50 text-sky-950";
  const cardBorderClass = isNoLoan
    ? "border-teal-200/90"
    : "border-slate-200/90";

  return (
    <article
      className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${cardBorderClass}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${kindClass}`}
        >
          {icon ?? (
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 shrink-0"
            >
              {isNoLoan ? (
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M9.661 2.237a.531.531 0 0 1 .678 0 11.947 11.947 0 0 0 7.078 2.749.5.5 0 0 1 .479.425c.069.52.104 1.05.104 1.59 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 0 1-.332 0C5.26 16.564 2 12.163 2 7c0-.538.035-1.069.104-1.589a.5.5 0 0 1 .48-.425 11.947 11.947 0 0 0 7.077-2.75Z"
                  clipRule="evenodd"
                />
              )}
            </svg>
          )}
          <span>{kindLabel}</span>
        </span>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${fitBadge.className}`}
        >
          <span aria-hidden="true" className={`h-2 w-2 rounded-full ${fitBadge.dotClass}`} />
          <span>{fitBadge.label}</span>
        </span>
      </div>

      <h3 className="mt-3.5 text-lg font-bold leading-snug text-slate-900">
        {option.title}
      </h3>

      <dl className="mt-3.5 space-y-2.5 rounded-xl border border-slate-100 bg-slate-50/90 p-3.5 text-base text-slate-800">
        <div className="flex items-start gap-2.5">
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="mt-1 h-4 w-4 shrink-0 text-teal-700"
          >
            <circle cx="10" cy="10" r="7.5" />
            <path strokeLinecap="round" d="M10 6.5v7M7.75 8.75h3.25a1.25 1.25 0 1 1 0 2.5H9a1.25 1.25 0 1 0 0 2.5h3.25" />
          </svg>
          <div>
            <dt className="inline font-semibold text-slate-700">Chi phí: </dt>
            <dd className="inline">{option.cost_note}</dd>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="mt-1 h-4 w-4 shrink-0 text-teal-700"
          >
            <circle cx="10" cy="10" r="7.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6v4l2.5 1.5" />
          </svg>
          <div>
            <dt className="inline font-semibold text-slate-700">Thời gian: </dt>
            <dd className="inline">{option.speed}</dd>
          </div>
        </div>
      </dl>

      {(option.source_url || option.updated_at) ? (
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-slate-100 pt-3 text-sm text-slate-600">
          {option.source_url ? (
            <a
              href={option.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center gap-1.5 rounded-lg px-1 font-semibold text-teal-700 underline underline-offset-2 hover:text-teal-950"
            >
              <span>Xem nguồn tham khảo</span>
              <span aria-hidden="true">↗</span>
            </a>
          ) : null}
          {option.updated_at ? (
            <span className="tabular-nums text-slate-500">Cập nhật: {option.updated_at}</span>
          ) : null}
        </div>
      ) : null}

      {isNoLoan && onDraft ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => onDraft(option)}
            className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-900"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 shrink-0"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="M8 9h8M8 13h5" />
            </svg>
            <span>Soạn thư xin hỗ trợ</span>
          </button>
        </div>
      ) : null}
    </article>
  );
}

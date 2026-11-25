"use client";

import type { Option } from "@/lib/api";

export type OptionCardProps = {
  option: Option;
  onDraft?: (option: Option) => void;
};

function getFitBadge(fit: Option["fit"]): { label: string; className: string } {
  switch (fit) {
    case "cao":
      return {
        label: "Phù hợp cao",
        className: "border border-emerald-300 bg-emerald-100 text-emerald-900",
      };
    case "co_the":
      return {
        label: "Có thể phù hợp",
        className: "border border-amber-300 bg-amber-100 text-amber-900",
      };
    case "kho":
      return {
        label: "Khó duyệt",
        className: "border border-slate-300 bg-slate-200 text-slate-800",
      };
  }
}

export function OptionCard({ option, onDraft }: OptionCardProps) {
  const fitBadge = getFitBadge(option.fit);
  const kindLabel = option.kind === "no_loan" ? "Không cần vay" : "Kênh vay có giấy phép";
  const kindClass =
    option.kind === "no_loan"
      ? "border border-teal-200 bg-teal-50 text-teal-900"
      : "border border-sky-200 bg-sky-50 text-sky-900";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${kindClass}`}>
          {kindLabel}
        </span>
        <span
          className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${fitBadge.className}`}
        >
          {fitBadge.label}
        </span>
      </div>

      <h3 className="mt-3 text-lg font-semibold leading-snug text-slate-900">{option.title}</h3>

      <dl className="mt-3 space-y-2 text-base text-slate-800">
        <div>
          <dt className="inline font-semibold text-slate-700">Chi phí: </dt>
          <dd className="inline">{option.cost_note}</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-slate-700">Thời gian: </dt>
          <dd className="inline">{option.speed}</dd>
        </div>
      </dl>

      {(option.source_url || option.updated_at) ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-3 text-sm text-slate-600">
          {option.source_url ? (
            <a
              href={option.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center font-medium text-teal-700 underline underline-offset-2 hover:text-teal-900"
            >
              Xem nguồn tham khảo ↗
            </a>
          ) : null}
          {option.updated_at ? <span>Cập nhật: {option.updated_at}</span> : null}
        </div>
      ) : null}

      {option.kind === "no_loan" && onDraft ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => onDraft(option)}
            className="min-h-[48px] w-full rounded-xl bg-teal-700 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-900"
          >
            Soạn thư
          </button>
        </div>
      ) : null}
    </article>
  );
}

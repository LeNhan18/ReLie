"use client";

export type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  onBack?: () => void;
  backLabel?: string;
};

export function ErrorState({
  title = "Chưa thực hiện được lúc này",
  message,
  onRetry,
  retryLabel = "Thử lại",
  onBack,
  backLabel = "Quay lại",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-amber-300 bg-amber-50/90 p-5 text-slate-900 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-200/80 text-amber-950"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold leading-snug text-amber-950">{title}</h2>
          <p className="mt-1.5 text-base leading-relaxed text-amber-950/95">{message}</p>
        </div>
      </div>

      {(onRetry || onBack) ? (
        <div className="mt-4 flex flex-col gap-2.5">
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-900"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 shrink-0"
              >
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
              <span>{retryLabel}</span>
            </button>
          ) : null}
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 active:bg-slate-100"
            >
              {backLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

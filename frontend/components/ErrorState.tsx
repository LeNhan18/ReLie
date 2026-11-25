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
  title = "Chưa thực hiện được",
  message,
  onRetry,
  retryLabel = "Thử lại",
  onBack,
  backLabel = "Quay lại",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-slate-900 shadow-sm"
    >
      <h2 className="text-lg font-semibold leading-snug text-amber-950">{title}</h2>
      <p className="mt-2 text-base leading-relaxed text-amber-950">{message}</p>
      {(onRetry || onBack) ? (
        <div className="mt-4 flex flex-col gap-3">
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="min-h-[48px] w-full rounded-xl bg-teal-700 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-900"
            >
              {retryLabel}
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

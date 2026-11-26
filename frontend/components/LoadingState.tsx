export type LoadingStateProps = {
  title?: string;
  hint?: string;
};

export function LoadingState({
  title = "Đang xử lý, bạn đợi chút nhé...",
  hint,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center rounded-2xl border border-teal-200/80 bg-white px-5 py-8 text-center shadow-sm"
    >
      <div aria-hidden="true" className="relative flex h-12 w-12 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-4 border-teal-100" />
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-teal-700 border-r-teal-500" />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 text-teal-700"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>

      <p className="mt-4 text-base font-semibold leading-relaxed text-slate-900">{title}</p>
      {hint ? (
        <p className="mt-1.5 max-w-sm text-base leading-relaxed text-slate-600">{hint}</p>
      ) : null}
    </div>
  );
}

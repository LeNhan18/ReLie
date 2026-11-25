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
      className="flex flex-col items-center justify-center rounded-2xl border border-teal-100 bg-white px-5 py-8 text-center shadow-sm"
    >
      <div
        aria-hidden="true"
        className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-700"
      />
      <p className="mt-4 text-base font-medium leading-relaxed text-slate-900">{title}</p>
      {hint ? (
        <p className="mt-1.5 text-base leading-relaxed text-slate-600">{hint}</p>
      ) : null}
    </div>
  );
}

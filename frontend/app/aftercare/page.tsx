"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { ConfirmForm } from "@/components/ConfirmForm";
import { Checklist } from "@/components/Checklist";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import {
  api,
  ApiError,
  type AftercareResult,
  type ConfirmedLoan,
  type LoanTerms,
} from "@/lib/api";
import { DataLockGuide } from "./DataLockGuide";
import { DebtBreakdownSection } from "./DebtBreakdownSection";
import { IcsReminderCard } from "./IcsReminderCard";
import {
  getSamplePreset,
  SAMPLE_PRESETS,
  type SampleId,
} from "./sampleLoans";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "1";

type Step = "form" | "result";
type LoadingKind = "sample" | "assess" | null;
type RetryAction =
  | { kind: "sample"; sampleId: SampleId }
  | { kind: "assess"; loan: ConfirmedLoan }
  | null;

function cloneTerms(terms: LoanTerms): LoanTerms {
  return {
    ...terms,
    schedule: terms.schedule.map((item) => ({ ...item })),
    fees: terms.fees.map((fee) => ({ ...fee })),
  };
}

function scrollToTopSmooth(): void {
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

export default function AftercarePage() {
  const [step, setStep] = useState<Step>("form");
  const [prefillTerms, setPrefillTerms] = useState<LoanTerms | null>(null);
  const [lowFields, setLowFields] = useState<string[]>([]);
  const [activeSampleId, setActiveSampleId] = useState<SampleId | null>(null);
  const [loadingSampleId, setLoadingSampleId] = useState<SampleId | null>(null);
  const [formResetKey, setFormResetKey] = useState<number>(0);
  const [showQuickLockOnForm, setShowQuickLockOnForm] = useState<boolean>(false);

  const [loadingKind, setLoadingKind] = useState<LoadingKind>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryAction, setRetryAction] = useState<RetryAction>(null);

  const [lastLoan, setLastLoan] = useState<ConfirmedLoan | null>(null);
  const [result, setResult] = useState<AftercareResult | null>(null);
  const [resultRunKey, setResultRunKey] = useState<number>(0);

  const handleLoadSample = async (sampleId: SampleId): Promise<void> => {
    const preset = getSamplePreset(sampleId);
    setError(null);
    setRetryAction(null);
    setLoadingSampleId(sampleId);
    setLoadingKind("sample");

    try {
      const response = await api.extract({ sample_id: sampleId });
      setPrefillTerms(cloneTerms(response.terms));
      setLowFields([...response.low_confidence_fields]);
      setActiveSampleId(sampleId);
      setFormResetKey((prev) => prev + 1);
    } catch (err: unknown) {
      if (USE_MOCKS) {
        setPrefillTerms(cloneTerms(preset.fallback.terms));
        setLowFields([...preset.fallback.low_confidence_fields]);
        setActiveSampleId(sampleId);
        setFormResetKey((prev) => prev + 1);
      } else {
        const message =
          err instanceof ApiError
            ? err.message
            : `Chưa tải được ${preset.title.toLowerCase()} lúc này. Bạn thử lại hoặc tự nhập thông tin bên dưới nhé.`;
        setError(message);
        setRetryAction({ kind: "sample", sampleId });
      }
    } finally {
      setLoadingKind(null);
      setLoadingSampleId(null);
    }
  };

  const handleClearForm = (): void => {
    setPrefillTerms(null);
    setLowFields([]);
    setActiveSampleId(null);
    setError(null);
    setRetryAction(null);
    setFormResetKey((prev) => prev + 1);
  };

  const handleAssess = async (loan: ConfirmedLoan): Promise<void> => {
    setLastLoan(loan);
    setError(null);
    setRetryAction(null);
    setLoadingKind("assess");

    try {
      const assessed = await api.aftercareAssess(loan);
      setResult(assessed);
      setResultRunKey((prev) => prev + 1);
      setStep("result");
      scrollToTopSmooth();
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Chưa tách được khoản nợ lúc này. Bạn kiểm tra kết nối mạng rồi thử lại nhé.";
      setError(message);
      setRetryAction({ kind: "assess", loan });
      scrollToTopSmooth();
    } finally {
      setLoadingKind(null);
    }
  };

  const handleRetry = (): void => {
    if (retryAction?.kind === "sample") {
      void handleLoadSample(retryAction.sampleId);
      return;
    }
    if (retryAction?.kind === "assess") {
      void handleAssess(retryAction.loan);
      return;
    }
    setError(null);
    setRetryAction(null);
  };

  const handleBackToForm = (): void => {
    setError(null);
    setRetryAction(null);
    setStep("form");
    scrollToTopSmooth();
  };

  const isBusy = loadingKind !== null;
  const showFormContent = step === "form" && !isBusy && error === null;
  const activePreset =
    activeSampleId !== null ? getSamplePreset(activeSampleId) : null;
  const loadingPreset =
    loadingSampleId !== null ? getSamplePreset(loadingSampleId) : null;

  return (
    <div className="space-y-5 pb-6">
      {step === "form" ? (
        <PageHeader
          backHref="/"
          backLabel="Về trang chủ"
          badge="Gỡ rối sau giải ngân · Không lưu thông tin cá nhân"
          title="Tôi đã lỡ vay"
          subtitle="Bạn cứ bình tĩnh, mọi chuyện đều có hướng tháo gỡ từng bước. Hãy điền thông tin khoản vay đã nhận để biết rõ phần gốc thực nhận, phần lãi trong mức trần và cách tự bảo vệ dữ liệu ngay lúc này."
        />
      ) : (
        <PageHeader
          backHref="/"
          backLabel="Về trang chủ"
          badge="Đã tách rõ khoản nợ · Hướng dẫn bảo vệ thực tế"
          title="Kết quả tách khoản nợ"
          subtitle="Dưới đây là 3 con số tách bạch dựa trên thông tin bạn vừa xác nhận, kèm hướng dẫn khoá quyền điện thoại và tải lịch nhắc hạn trả."
        />
      )}

      {step === "form" && loadingKind === "assess" ? (
        <LoadingState
          title="Đang tách khoản nợ và chuẩn bị hướng dẫn..."
          hint="AnTâm đang đối chiếu giấy phép và mức trần lãi suất theo ngày giải ngân, bạn đợi chút nhé."
        />
      ) : null}

      {step === "form" && loadingKind === "sample" ? (
        <LoadingState
          title={
            loadingPreset
              ? `Đang điền ${loadingPreset.title.toLowerCase()}...`
              : "Đang điền thông tin ví dụ mẫu..."
          }
          hint="Các ô bên dưới sẽ được điền sẵn để bạn đối chiếu ngay."
        />
      ) : null}

      {step === "form" && !isBusy && error !== null ? (
        <ErrorState
          message={error}
          onRetry={handleRetry}
          onBack={() => {
            setError(null);
            setRetryAction(null);
          }}
          backLabel="Quay lại kiểm tra thông tin"
        />
      ) : null}

      {/* BƯỚC 1: FORM NHẬP / ĐIỀN MẪU */}
      <div className={showFormContent ? "space-y-5" : "hidden"}>
        {/* Mẹo đọc 2 nguồn bằng chứng chuẩn xác */}
        <section
          aria-label="Mẹo xem đúng con số thực tế"
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-200"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </span>
            <p className="min-w-0 flex-1 text-base leading-relaxed text-slate-700">
              <span className="font-bold text-slate-900">Mẹo lấy số chính xác:</span>{" "}
              Bạn mở <span className="font-semibold text-slate-900">tin nhắn ngân hàng</span>{" "}
              để xem số tiền thực sự đã về tài khoản, và mở{" "}
              <span className="font-semibold text-slate-900">màn hình lịch trả trong app</span>{" "}
              để xem ngày hẹn cùng số tiền họ yêu cầu đóng.
            </p>
          </div>
        </section>

        {/* Nút mở nhanh hướng dẫn khoá quyền nếu người dùng đang lo lắng ngay */}
        <div className="space-y-3">
          <button
            type="button"
            aria-expanded={showQuickLockOnForm}
            onClick={() => setShowQuickLockOnForm((prev) => !prev)}
            className="flex min-h-[52px] w-full items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50/85 px-4 py-3 text-left text-base font-semibold text-amber-950 shadow-sm transition hover:bg-amber-100/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            <span>
              Đang lo app đọc Danh bạ hoặc Ảnh? Xem ngay cách khoá quyền trên máy
            </span>
            <span aria-hidden="true" className="shrink-0 font-bold">
              {showQuickLockOnForm ? "Ẩn ↑" : "Mở ↓"}
            </span>
          </button>

          {showQuickLockOnForm ? <DataLockGuide /> : null}
        </div>

        {/* Khu vực chọn nhanh 3 mẫu thử đối chứng */}
        <section
          aria-labelledby="sample-presets-heading"
          className="space-y-3.5 rounded-2xl border border-teal-200 bg-teal-50/70 p-4 sm:p-5"
        >
          <div className="space-y-1">
            <h2
              id="sample-presets-heading"
              className="text-lg font-bold leading-snug text-slate-900"
            >
              Điền nhanh tình huống mẫu để xem thử
            </h2>
            <p className="text-base leading-relaxed text-slate-700">
              Chạm vào 1 trong 3 mẫu dưới đây để đối chiếu cả trường hợp vay ngoài
              áp trần dân sự lẫn khoản vay tại tổ chức tín dụng có giấy phép:
            </p>
          </div>

          <div className="space-y-2.5">
            {SAMPLE_PRESETS.map((preset) => {
              const isSelected = activeSampleId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  disabled={isBusy}
                  onClick={() => void handleLoadSample(preset.id)}
                  className={`flex min-h-[56px] w-full flex-col items-start gap-1.5 rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:opacity-60 ${
                    isSelected
                      ? "border-2 border-teal-700 bg-white shadow-sm"
                      : "border-teal-200/90 bg-white/95 hover:border-teal-500 hover:bg-white"
                  }`}
                >
                  <div className="flex w-full flex-wrap items-center justify-between gap-2">
                    <span className="text-base font-bold text-slate-900">
                      {preset.title}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-base font-semibold ${
                        preset.badgeTone === "licensed"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                          : "border-amber-300 bg-amber-50 text-amber-950"
                      }`}
                    >
                      {preset.badge}
                    </span>
                  </div>
                  <span className="text-base leading-relaxed text-slate-700">
                    {preset.summary}
                  </span>
                </button>
              );
            })}
          </div>

          {activePreset !== null ? (
            <div
              role="status"
              aria-live="polite"
              className="space-y-2.5 rounded-xl border border-teal-300 bg-white p-3.5"
            >
              <p className="text-base font-medium leading-relaxed text-teal-950">
                Đã điền sẵn <span className="font-bold">{activePreset.title}</span>.
                Bạn kiểm tra các ô bên dưới rồi bấm nút{" "}
                <span className="font-bold">
                  &ldquo;Tách khoản nợ &amp; xem việc cần làm&rdquo;
                </span>{" "}
                ở cuối trang nhé.
              </p>
              <button
                type="button"
                onClick={handleClearForm}
                className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-base font-semibold text-slate-800 transition hover:bg-slate-100 active:bg-slate-200"
              >
                Xoá mẫu để tự nhập khoản vay của tôi
              </button>
            </div>
          ) : null}
        </section>

        <ConfirmForm
          key={formResetKey}
          initialTerms={prefillTerms}
          lowConfidenceFields={lowFields}
          submitLabel="Tách khoản nợ & xem việc cần làm"
          loading={loadingKind === "assess"}
          onSubmit={(loan) => void handleAssess(loan)}
        />
      </div>

      {/* BƯỚC 2: KẾT QUẢ TÁCH NỢ, CHECKLIST, KHOÁ DỮ LIỆU & NHẮC LỊCH .ICS */}
      {step === "result" && result !== null ? (
        <div className="space-y-5">
          <DebtBreakdownSection result={result} lastLoan={lastLoan} />

          <Checklist
            key={resultRunKey}
            items={result.checklist}
            title="Việc bạn nên làm ngay lúc này"
            subtitle="Chạm đánh dấu từng việc bạn đã thực hiện để bảo vệ bản thân và người nhà."
          />

          <DataLockGuide />

          {lastLoan !== null ? <IcsReminderCard loan={lastLoan} /> : null}

          <section
            aria-labelledby="next-actions-heading"
            className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2
              id="next-actions-heading"
              className="text-lg font-bold leading-snug text-slate-900"
            >
              Bước hỗ trợ tiếp theo dành cho bạn
            </h2>
            <p className="text-base leading-relaxed text-slate-600">
              Tuỳ tình huống hiện tại, bạn chọn tiếp hướng xử lý phù hợp nhất:
            </p>

            <div className="flex flex-col gap-3 pt-1">
              <Link
                href="/harassment"
                className="flex min-h-[52px] w-full items-center justify-center rounded-xl border-2 border-rose-300 bg-rose-50 px-5 py-3 text-center text-base font-bold text-rose-950 shadow-sm transition hover:bg-rose-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700 active:bg-rose-200"
              >
                Tôi đang bị gọi điện, nhắn tin đòi nợ →
              </Link>

              <Link
                href="/plan"
                className="flex min-h-[52px] w-full items-center justify-center rounded-xl bg-teal-700 px-5 py-3 text-center text-base font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-900"
              >
                Lập kế hoạch chi tiêu &amp; trả nợ →
              </Link>

              <Link
                href="/need"
                className="flex min-h-[52px] w-full items-center justify-center rounded-xl border border-teal-700 bg-teal-50/70 px-5 py-3 text-center text-base font-semibold text-teal-950 transition hover:bg-teal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-200"
              >
                Tìm cách xoay xở tiền an toàn →
              </Link>

              <button
                type="button"
                onClick={handleBackToForm}
                className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 active:bg-slate-100"
              >
                Nhập / kiểm tra lại khoản vay khác
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

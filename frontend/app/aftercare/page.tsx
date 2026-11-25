"use client";

import { useState } from "react";
import Link from "next/link";
import { ConfirmForm } from "@/components/ConfirmForm";
import { Checklist } from "@/components/Checklist";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import {
  api,
  ApiError,
  formatVnd,
  type AftercareResult,
  type ConfirmedLoan,
  type LoanTerms,
} from "@/lib/api";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "1";

// Dữ liệu mẫu hư cấu XanhCash đồng bộ với data/samples/xanhcash.terms.json
// Dùng khi chạy thử độc lập giao diện với NEXT_PUBLIC_USE_MOCKS=1 mà backend đang tắt
const XANHCASH_FALLBACK_TERMS: LoanTerms = {
  lender_name: {
    value: "Công ty TNHH Công nghệ Tài chính XanhCash",
    confidence: 0.96,
  },
  principal_stated: { value: 4_000_000, confidence: 0.98 },
  amount_received: { value: 3_000_000, confidence: 0.91 },
  disbursed_date: { value: "2026-11-20", confidence: 0.95 },
  repayment_type: { value: "one_time", confidence: 0.9 },
  schedule: [{ on: "2026-12-04", amount: 4_200_000 }],
  rate_stated_pct_year: { value: 0, confidence: 0.97 },
  fees: [
    {
      name: "Phí thẩm định hồ sơ",
      amount: 1_000_000,
      deducted_upfront: true,
      confidence: 0.93,
    },
    {
      name: "Phí dịch vụ",
      amount: 200_000,
      deducted_upfront: false,
      confidence: 0.61,
    },
  ],
  extension_fee: { value: 800_000, confidence: 0.9 },
  late_penalty_pct_per_day: { value: 5, confidence: 0.88 },
  data_access_contacts: true,
  requires_upfront_payment: false,
};

const XANHCASH_FALLBACK_LOW_FIELDS: string[] = ["fees.Phí dịch vụ"];

type Step = "form" | "result";
type LoadingKind = "sample" | "assess" | null;
type RetryKind = "sample" | "assess" | null;

function getLenderStatusDisplay(status: string): {
  label: string;
  badgeClass: string;
} {
  if (status === "credit_institution") {
    return {
      label: "Có trong danh sách tổ chức tín dụng được cấp phép",
      badgeClass: "border-emerald-300 bg-emerald-50 text-emerald-950",
    };
  }
  if (status === "ambiguous") {
    return {
      label: "Tên gần giống nhiều tổ chức — cần kiểm tra kỹ pháp nhân",
      badgeClass: "border-amber-300 bg-amber-50 text-amber-950",
    };
  }
  return {
    label: "Chưa tìm thấy trong danh sách tổ chức tín dụng được cấp phép",
    badgeClass: "border-amber-300 bg-amber-50 text-amber-950",
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
  const [sampleLoaded, setSampleLoaded] = useState<boolean>(false);
  const [formResetKey, setFormResetKey] = useState<number>(0);

  const [loadingKind, setLoadingKind] = useState<LoadingKind>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryKind, setRetryKind] = useState<RetryKind>(null);

  const [lastLoan, setLastLoan] = useState<ConfirmedLoan | null>(null);
  const [result, setResult] = useState<AftercareResult | null>(null);
  const [resultRunKey, setResultRunKey] = useState<number>(0);

  const handleLoadSample = async (): Promise<void> => {
    setError(null);
    setRetryKind(null);
    setLoadingKind("sample");

    try {
      const response = await api.extract({ sample_id: "xanhcash" });
      setPrefillTerms({
        ...response.terms,
        schedule: response.terms.schedule.map((item) => ({ ...item })),
        fees: response.terms.fees.map((fee) => ({ ...fee })),
      });
      setLowFields([...response.low_confidence_fields]);
      setSampleLoaded(true);
    } catch (err: unknown) {
      if (USE_MOCKS) {
        setPrefillTerms({
          ...XANHCASH_FALLBACK_TERMS,
          schedule: XANHCASH_FALLBACK_TERMS.schedule.map((item) => ({ ...item })),
          fees: XANHCASH_FALLBACK_TERMS.fees.map((fee) => ({ ...fee })),
        });
        setLowFields([...XANHCASH_FALLBACK_LOW_FIELDS]);
        setSampleLoaded(true);
      } else {
        const message =
          err instanceof ApiError
            ? err.message
            : "Chưa tải được ví dụ mẫu lúc này. Bạn thử lại hoặc tự nhập thông tin bên dưới nhé.";
        setError(message);
        setRetryKind("sample");
      }
    } finally {
      setLoadingKind(null);
    }
  };

  const handleClearForm = (): void => {
    setPrefillTerms(null);
    setLowFields([]);
    setSampleLoaded(false);
    setError(null);
    setRetryKind(null);
    setFormResetKey((prev) => prev + 1);
  };

  const handleAssess = async (loan: ConfirmedLoan): Promise<void> => {
    setLastLoan(loan);
    setError(null);
    setRetryKind(null);
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
      setRetryKind("assess");
      scrollToTopSmooth();
    } finally {
      setLoadingKind(null);
    }
  };

  const handleRetry = (): void => {
    if (retryKind === "sample") {
      void handleLoadSample();
      return;
    }
    if (retryKind === "assess" && lastLoan !== null) {
      void handleAssess(lastLoan);
      return;
    }
    setError(null);
    setRetryKind(null);
  };

  const handleBackToForm = (): void => {
    setError(null);
    setRetryKind(null);
    setStep("form");
    scrollToTopSmooth();
  };

  const isBusy = loadingKind !== null;
  const showFormContent = step === "form" && !isBusy && error === null;

  return (
    <div className="space-y-5 pb-6">
      <nav aria-label="Điều hướng đầu trang">
        <Link
          href="/"
          className="inline-flex min-h-[48px] items-center gap-1.5 rounded-xl px-2.5 py-2 text-base font-semibold text-teal-800 transition hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-100"
        >
          <span aria-hidden="true">←</span>
          <span>Về trang chủ</span>
        </Link>
      </nav>

      {step === "form" ? (
        <header className="space-y-2">
          <h1 className="text-2xl font-bold leading-tight text-slate-900">
            Tôi đã lỡ vay
          </h1>
          <p className="text-base leading-relaxed text-slate-700">
            Bạn cứ bình tĩnh. Nhập thông tin khoản vay bên dưới để biết rõ phần gốc
            thực nhận, phần lãi trong trần và những việc nên làm ngay để tự bảo vệ
            mình.
          </p>
        </header>
      ) : null}

      {step === "form" && loadingKind === "assess" ? (
        <LoadingState
          title="Đang tách khoản nợ và chuẩn bị hướng dẫn..."
          hint="AnTâm đang đối chiếu thông tin khoản vay, bạn đợi một chút nhé."
        />
      ) : null}

      {step === "form" && loadingKind === "sample" ? (
        <LoadingState title="Đang điền ví dụ mẫu XanhCash..." />
      ) : null}

      {step === "form" && !isBusy && error !== null ? (
        <ErrorState
          message={error}
          onRetry={handleRetry}
          onBack={() => {
            setError(null);
            setRetryKind(null);
          }}
          backLabel="Quay lại kiểm tra thông tin"
        />
      ) : null}

      <div className={showFormContent ? "space-y-5" : "hidden"}>
        <section
          aria-label="Chọn nhanh ví dụ mẫu"
          className="space-y-3 rounded-2xl border border-teal-200 bg-teal-50/70 p-4"
        >
          <p className="text-base leading-relaxed text-slate-800">
            Nếu bạn muốn xem thử cách tách nợ trước khi nhập khoản vay thật, hãy bấm
            nút bên dưới:
          </p>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => void handleLoadSample()}
            className="min-h-[48px] w-full rounded-xl border border-teal-700 bg-white px-4 py-3 text-base font-semibold text-teal-800 shadow-sm transition hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-100 disabled:opacity-60"
          >
            Điền thử ví dụ mẫu XanhCash
          </button>

          {sampleLoaded ? (
            <div className="space-y-2 pt-1">
              <p className="text-base font-medium leading-relaxed text-teal-950">
                Đã điền sẵn ví dụ mẫu hư cấu XanhCash. Bạn xem các ô bên dưới rồi bấm
                nút cuối trang nhé.
              </p>
              <button
                type="button"
                onClick={handleClearForm}
                className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
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

      {step === "result" && result !== null ? (
        <div className="space-y-5">
          <header className="space-y-2">
            <h1 className="text-2xl font-bold leading-tight text-slate-900">
              Kết quả tách khoản nợ
            </h1>
            <p className="text-base leading-relaxed text-slate-700">
              Dưới đây là 3 phần tách rõ dựa trên thông tin bạn vừa xác nhận để bạn
              nắm đúng thực tế và bình tĩnh xử lý.
            </p>
          </header>

          <section
            aria-label="Ba con số tách nợ"
            className="space-y-3.5"
          >
            <div className="rounded-2xl border border-teal-200 bg-white p-4 shadow-sm">
              <p className="text-base font-semibold text-slate-700">
                1. Tiền gốc thực nhận
              </p>
              <p className="mt-1 break-words text-2xl font-bold text-teal-900">
                {formatVnd(result.principal_received)}
              </p>
              <p className="mt-1.5 text-base leading-relaxed text-slate-700">
                Số tiền thực tế bạn đã nhận về tay.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-base font-semibold text-slate-700">
                2. Lãi ước tính trong mức trần
              </p>
              <p className="mt-1 break-words text-2xl font-bold text-slate-900">
                {formatVnd(result.lawful_interest)}
              </p>
              <p className="mt-1.5 text-base leading-relaxed text-slate-700">
                {result.excess_applies
                  ? "Lãi ước tính theo trần luật dân sự"
                  : "Lãi và phí theo hợp đồng (tổ chức tín dụng có giấy phép)"}
              </p>
            </div>

            <div
              className={
                result.excess_applies && result.excess_charge > 0
                  ? "rounded-2xl border-2 border-amber-400 bg-rose-50 p-4 shadow-sm"
                  : "rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm"
              }
            >
              <p
                className={
                  result.excess_applies && result.excess_charge > 0
                    ? "text-base font-semibold text-rose-950"
                    : "text-base font-semibold text-slate-700"
                }
              >
                3. Khoản thu vượt mức trần
              </p>
              <p
                className={
                  result.excess_applies && result.excess_charge > 0
                    ? "mt-1 break-words text-2xl font-bold text-rose-900"
                    : "mt-1 break-words text-2xl font-bold text-slate-900"
                }
              >
                {formatVnd(result.excess_charge)}
              </p>
              <p
                className={
                  result.excess_applies && result.excess_charge > 0
                    ? "mt-1.5 text-base leading-relaxed text-rose-950"
                    : "mt-1.5 text-base leading-relaxed text-slate-700"
                }
              >
                {!result.excess_applies
                  ? "Tổ chức tín dụng được cấp phép hoạt động theo quy định chuyên ngành nên không áp mức trần 20%/năm của luật dân sự."
                  : result.excess_charge > 0
                    ? "Khoản thu này có dấu hiệu vượt mức trần lãi suất của luật dân sự. Bạn nên lưu giữ đầy đủ chứng từ nhận tiền và lịch trả để bảo vệ quyền lợi hợp pháp."
                    : "Chưa ghi nhận khoản thu vượt mức trần lãi suất của luật dân sự."}
              </p>
            </div>
          </section>

          <section
            aria-label="Đối chiếu tổng đòi và giấy phép"
            className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            {lastLoan?.lender_name ? (
              <div>
                <p className="text-base text-slate-600">Bên cho vay</p>
                <p className="mt-0.5 break-words text-base font-semibold text-slate-900">
                  {lastLoan.lender_name}
                </p>
              </div>
            ) : null}

            <div className="border-t border-slate-100 pt-3 first:border-t-0 first:pt-0">
              <p className="text-base text-slate-600">
                Tổng số tiền bên cho vay đang đòi
              </p>
              <p className="mt-0.5 break-words text-xl font-bold text-slate-900">
                {formatVnd(result.total_demanded)}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <p className="text-base text-slate-600">Trạng thái giấy phép</p>
              <div
                className={`mt-1.5 rounded-xl border px-3.5 py-2.5 text-base font-medium leading-relaxed ${
                  getLenderStatusDisplay(result.lender_status).badgeClass
                }`}
              >
                {getLenderStatusDisplay(result.lender_status).label}
              </div>
            </div>
          </section>

          {result.note.trim().length > 0 ? (
            <section
              aria-label="Ghi chú ước tính"
              className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-base leading-relaxed text-teal-950"
            >
              <p className="font-semibold">Ghi chú</p>
              <p className="mt-1">{result.note}</p>
            </section>
          ) : null}

          <Checklist
            key={resultRunKey}
            items={result.checklist}
            title="Việc bạn nên làm ngay lúc này"
          />

          <div className="flex flex-col gap-3 pt-1">
            <Link
              href="/need"
              className="flex min-h-[52px] w-full items-center justify-center rounded-xl bg-teal-700 px-5 py-3 text-center text-base font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-900"
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
        </div>
      ) : null}
    </div>
  );
}

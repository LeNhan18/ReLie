"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ConfirmForm } from "@/components/ConfirmForm";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { RiskCard } from "@/components/RiskCard";
import {
  api,
  type Assessment,
  type ConfirmedLoan,
  type ExtractResponse,
  type LoanTerms,
} from "@/lib/api";
import { PermissionGuide } from "./PermissionGuide";
import { resizeImageToJpegBlob } from "./resizeImage";

type Step = "choose" | "confirm" | "result";
type InputMode = "image" | "text";
type SampleId = "xanhcash" | "gop_ngay" | "cty_tai_chinh_a";

type RetryExtractTarget =
  | { kind: "sample"; sampleId: SampleId }
  | { kind: "blob"; blob: Blob }
  | { kind: "text"; text: string }
  | { kind: "pick_file" };

type UnreadableSource = "image" | "text" | null;

type SampleScenario = {
  id: SampleId;
  title: string;
  description: string;
  tag: string;
  tagClass: string;
};

const SAMPLES: ReadonlyArray<SampleScenario> = [
  {
    id: "xanhcash",
    title: "Mẫu 1: App vay ngắn ngày (XanhCash) — bẫy phí thẩm định & lãi 0%",
    description:
      "Quảng cáo lãi 0% nhưng trừ phí lớn ngay trước khi giải ngân, kỳ hạn ngắn và đòi quyền Danh bạ.",
    tag: "Bẫy phí ẩn",
    tagClass: "border-rose-200 bg-rose-50 text-rose-900",
  },
  {
    id: "gop_ngay",
    title: "Mẫu 2: Vay góp ngày — trả góp mỗi ngày",
    description:
      "Chia nhỏ tiền đóng liên tục từng ngày dễ làm người vay nhầm chi phí thấp nhưng lãi thực quy năm rất cao.",
    tag: "Đóng mỗi ngày",
    tagClass: "border-amber-200 bg-amber-50 text-amber-950",
  },
  {
    id: "cty_tai_chinh_a",
    title: "Mẫu 3: Công ty tài chính A — khoản vay trả góp đối chứng",
    description:
      "Khoản vay trả góp hằng tháng có ghi rõ lãi suất tại tổ chức tín dụng để đối chiếu minh bạch.",
    tag: "Đối chứng",
    tagClass: "border-emerald-200 bg-emerald-50 text-emerald-950",
  },
];

const SAMPLE_AD_TEXT =
  "Hỗ trợ vay nhanh XanhCash: Hạn mức hợp đồng 4.000.000đ, ưu đãi lãi suất 0%/năm. Phí thẩm định hồ sơ 1.000.000đ trừ trực tiếp khi giải ngân, thực nhận về tài khoản 3.000.000đ ngày 20/11/2026. Kỳ hạn 14 ngày, tổng thanh toán 4.200.000đ vào ngày 04/12/2026 (gồm phí dịch vụ 200.000đ). Phí gia hạn 800.000đ/lần, yêu cầu cấp quyền Danh bạ.";

const STEP_ITEMS: ReadonlyArray<{ id: Step; label: string }> = [
  { id: "choose", label: "1. Đưa thông tin" },
  { id: "confirm", label: "2. Kiểm tra số liệu" },
  { id: "result", label: "3. Kết quả phân tích" },
];

function getStepIndex(step: Step): number {
  if (step === "choose") {
    return 0;
  }
  if (step === "confirm") {
    return 1;
  }
  return 2;
}

function getHeaderMeta(step: Step): {
  badge: string;
  title: string;
  subtitle: string;
} {
  if (step === "choose") {
    return {
      badge: "Bước 1 / 3 · Kiểm tra an toàn trước khi vay",
      title: "Kiểm tra khoản vay trước khi ký",
      subtitle:
        "Gửi ảnh chụp hợp đồng, dán tin nhắn mời vay hoặc nhập số liệu để biết chi phí thật. Ảnh chỉ xử lý ngay để đọc chữ, không lưu ảnh gốc.",
    };
  }
  if (step === "confirm") {
    return {
      badge: "Bước 2 / 3 · Đối chiếu con số thực tế",
      title: "Kiểm tra lại các con số trước khi tính",
      subtitle:
        "Bạn đối chiếu kỹ tiền thực nhận về tay và lịch phải đóng với hợp đồng hoặc lời người tư vấn, sửa lại nếu chưa khớp nhé.",
    };
  }
  return {
    badge: "Bước 3 / 3 · Chi phí thật & đối chiếu quy định",
    title: "Kết quả kiểm tra khoản vay",
    subtitle:
      "Bạn xem kỹ chi phí thực tế quy năm, kịch bản gia hạn và các dấu hiệu dưới đây trước khi đưa ra quyết định nhé.",
  };
}

function isTermsCompletelyEmpty(terms: LoanTerms): boolean {
  const hasLender =
    typeof terms.lender_name.value === "string" &&
    terms.lender_name.value.trim().length > 0;
  const hasAmountReceived = terms.amount_received.value !== null;
  const hasPrincipalStated = terms.principal_stated.value !== null;
  const hasSchedule = terms.schedule.length > 0;

  return !hasLender && !hasAmountReceived && !hasPrincipalStated && !hasSchedule;
}

function scrollToTop(): void {
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function LoanStepProgress({ currentStep }: { currentStep: Step }) {
  const activeIdx = getStepIndex(currentStep);

  return (
    <nav
      aria-label="Các bước kiểm tra khoản vay"
      className="rounded-2xl border border-teal-200/80 bg-white p-4 shadow-sm"
    >
      <div aria-hidden="true" className="grid grid-cols-3 gap-2">
        {STEP_ITEMS.map((item, idx) => {
          const isReached = idx <= activeIdx;
          return (
            <span
              key={item.id}
              className={`h-2 rounded-full transition-colors ${
                isReached ? "bg-teal-700" : "bg-slate-200"
              }`}
            />
          );
        })}
      </div>

      <ol className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {STEP_ITEMS.map((item, idx) => {
          const isCurrent = idx === activeIdx;
          const isDone = idx < activeIdx;

          return (
            <li
              key={item.id}
              aria-current={isCurrent ? "step" : undefined}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-base transition ${
                isCurrent
                  ? "border border-teal-300 bg-teal-50/90 font-bold text-teal-950"
                  : isDone
                    ? "border border-emerald-200 bg-emerald-50/60 font-semibold text-emerald-950"
                    : "border border-transparent bg-slate-50/80 font-medium text-slate-600"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-base font-bold ${
                  isCurrent
                    ? "bg-teal-700 text-white"
                    : isDone
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-700"
                }`}
              >
                {isDone ? (
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.3a1 1 0 0 1-1.42 0l-3.75-3.775a1 1 0 1 1 1.42-1.41l3.04 3.06 6.54-6.585a1 1 0 0 1 1.414-.004Z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  idx + 1
                )}
              </span>
              <span className="leading-snug">{item.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default function LoanPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const requestSeqRef = useRef(0);

  const [step, setStep] = useState<Step>("choose");
  const [inputMode, setInputMode] = useState<InputMode>("image");
  const [contractText, setContractText] = useState<string>("");
  const [textInputError, setTextInputError] = useState<string | null>(null);
  const [formSessionKey, setFormSessionKey] = useState<number>(0);

  const [extractLoading, setExtractLoading] = useState<boolean>(false);
  const [extractLoadingTitle, setExtractLoadingTitle] = useState<string>(
    "Đang đọc thông tin trên hợp đồng...",
  );
  const [extractLoadingHint, setExtractLoadingHint] = useState<string>(
    "Bạn đợi một chút nhé, dữ liệu đang được xử lý ngay.",
  );
  const [extractError, setExtractError] = useState<string | null>(null);
  const [unreadableSource, setUnreadableSource] = useState<UnreadableSource>(null);
  const [retryExtractTarget, setRetryExtractTarget] =
    useState<RetryExtractTarget | null>(null);

  const [extracted, setExtracted] = useState<ExtractResponse | null>(null);
  const [lastLoan, setLastLoan] = useState<ConfirmedLoan | null>(null);

  const [assessLoading, setAssessLoading] = useState<boolean>(false);
  const [assessError, setAssessError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);

  const headerMeta = getHeaderMeta(step);

  const openFilePicker = (): void => {
    setUnreadableSource(null);
    setExtractError(null);
    setTextInputError(null);
    fileInputRef.current?.click();
  };

  const enterConfirmStep = (nextExtracted: ExtractResponse | null): void => {
    setExtracted(nextExtracted);
    setLastLoan(null);
    setAssessment(null);
    setAssessError(null);
    setAssessLoading(false);
    setFormSessionKey((prev) => prev + 1);
    setStep("confirm");
    scrollToTop();
  };

  const startManualEntry = (): void => {
    requestSeqRef.current += 1;
    setExtractLoading(false);
    setExtractError(null);
    setTextInputError(null);
    setUnreadableSource(null);
    setRetryExtractTarget(null);
    enterConfirmStep(null);
  };

  const resetToChoose = (): void => {
    requestSeqRef.current += 1;
    setExtractLoading(false);
    setExtractError(null);
    setTextInputError(null);
    setUnreadableSource(null);
    setRetryExtractTarget(null);
    setExtracted(null);
    setLastLoan(null);
    setAssessLoading(false);
    setAssessError(null);
    setAssessment(null);
    setStep("choose");
    scrollToTop();
  };

  const runBlobExtract = async (blob: Blob): Promise<void> => {
    const reqId = requestSeqRef.current + 1;
    requestSeqRef.current = reqId;

    setExtractLoadingTitle("Đang đọc thông tin trên ảnh hợp đồng...");
    setExtractLoadingHint(
      "Bạn đợi một chút nhé, ảnh chỉ xử lý tạm thời để đọc chữ và không lưu ảnh gốc.",
    );
    setExtractLoading(true);
    setExtractError(null);
    setUnreadableSource(null);
    setRetryExtractTarget({ kind: "blob", blob });
    scrollToTop();

    try {
      const response = await api.extract({ file: blob, filename: "contract.jpg" });
      if (reqId !== requestSeqRef.current) {
        return;
      }
      setRetryExtractTarget(null);

      if (isTermsCompletelyEmpty(response.terms)) {
        setUnreadableSource("image");
        return;
      }

      enterConfirmStep(response);
    } catch (err) {
      if (reqId !== requestSeqRef.current) {
        return;
      }
      setExtractError(
        err instanceof Error
          ? err.message
          : "Chưa đọc được ảnh hợp đồng lúc này. Bạn thử lại nhé.",
      );
    } finally {
      if (reqId === requestSeqRef.current) {
        setExtractLoading(false);
      }
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const selectedFile = e.target.files?.[0];
    e.target.value = "";
    if (!selectedFile) {
      return;
    }

    const reqId = requestSeqRef.current + 1;
    requestSeqRef.current = reqId;

    setExtractLoadingTitle("Đang thu gọn và làm rõ ảnh trên trình duyệt...");
    setExtractLoadingHint(
      "Ảnh được thu nhỏ ≤1600px ngay trên thiết bị của bạn, không lưu ảnh gốc.",
    );
    setExtractLoading(true);
    setExtractError(null);
    setTextInputError(null);
    setUnreadableSource(null);
    setRetryExtractTarget(null);
    scrollToTop();

    let resizedBlob: Blob;
    try {
      resizedBlob = await resizeImageToJpegBlob(selectedFile);
    } catch (err) {
      if (reqId !== requestSeqRef.current) {
        return;
      }
      setExtractLoading(false);
      setRetryExtractTarget({ kind: "pick_file" });
      setExtractError(
        err instanceof Error
          ? err.message
          : "Ảnh không hợp lệ hoặc không đọc được. Bạn chọn lại ảnh khác nhé.",
      );
      return;
    }

    if (reqId !== requestSeqRef.current) {
      return;
    }

    await runBlobExtract(resizedBlob);
  };

  const runTextExtract = async (rawText: string): Promise<void> => {
    const trimmed = rawText.trim();
    if (!trimmed) {
      setTextInputError(
        "Bạn dán hoặc gõ nội dung tin nhắn mời vay, điều khoản hợp đồng trước khi bấm đọc nhé.",
      );
      return;
    }

    const reqId = requestSeqRef.current + 1;
    requestSeqRef.current = reqId;

    setTextInputError(null);
    setExtractLoadingTitle("Đang đọc điều khoản từ đoạn chữ...");
    setExtractLoadingHint(
      "AnTâm đang tách số tiền thực nhận, các loại phí và lịch trả nợ để bạn kiểm tra.",
    );
    setExtractLoading(true);
    setExtractError(null);
    setUnreadableSource(null);
    setRetryExtractTarget({ kind: "text", text: trimmed });
    scrollToTop();

    try {
      const response = await api.extract({ text: trimmed });
      if (reqId !== requestSeqRef.current) {
        return;
      }
      setRetryExtractTarget(null);

      if (isTermsCompletelyEmpty(response.terms)) {
        setUnreadableSource("text");
        return;
      }

      enterConfirmStep(response);
    } catch (err) {
      if (reqId !== requestSeqRef.current) {
        return;
      }
      setExtractError(
        err instanceof Error
          ? err.message
          : "Chưa đọc được đoạn chữ lúc này. Bạn thử lại nhé.",
      );
    } finally {
      if (reqId === requestSeqRef.current) {
        setExtractLoading(false);
      }
    }
  };

  const handleSampleSelect = async (sampleId: SampleId): Promise<void> => {
    const reqId = requestSeqRef.current + 1;
    requestSeqRef.current = reqId;

    setExtractLoadingTitle("Đang tải kịch bản mẫu...");
    setExtractLoadingHint(
      "Các con số của hợp đồng mẫu sẽ hiện ra ở Bước 2 để bạn đối chiếu trước khi phân tích.",
    );
    setExtractLoading(true);
    setExtractError(null);
    setTextInputError(null);
    setUnreadableSource(null);
    setRetryExtractTarget({ kind: "sample", sampleId });
    scrollToTop();

    try {
      const response = await api.extract({ sample_id: sampleId });
      if (reqId !== requestSeqRef.current) {
        return;
      }
      setRetryExtractTarget(null);
      enterConfirmStep(response);
    } catch (err) {
      if (reqId !== requestSeqRef.current) {
        return;
      }
      setExtractError(
        err instanceof Error
          ? err.message
          : "Chưa tải được mẫu hợp đồng lúc này. Bạn thử lại nhé.",
      );
    } finally {
      if (reqId === requestSeqRef.current) {
        setExtractLoading(false);
      }
    }
  };

  const handleRetryExtract = (): void => {
    if (!retryExtractTarget) {
      if (inputMode === "text") {
        void runTextExtract(contractText);
      } else {
        openFilePicker();
      }
      return;
    }
    if (retryExtractTarget.kind === "sample") {
      void handleSampleSelect(retryExtractTarget.sampleId);
      return;
    }
    if (retryExtractTarget.kind === "blob") {
      void runBlobExtract(retryExtractTarget.blob);
      return;
    }
    if (retryExtractTarget.kind === "text") {
      void runTextExtract(retryExtractTarget.text);
      return;
    }
    openFilePicker();
  };

  const runAssess = async (loan: ConfirmedLoan): Promise<void> => {
    const reqId = requestSeqRef.current + 1;
    requestSeqRef.current = reqId;

    setLastLoan(loan);
    setAssessLoading(true);
    setAssessError(null);
    scrollToTop();

    try {
      const result = await api.assess(loan);
      if (reqId !== requestSeqRef.current) {
        return;
      }
      setAssessment(result);
      setStep("result");
      scrollToTop();
    } catch (err) {
      if (reqId !== requestSeqRef.current) {
        return;
      }
      setAssessError(
        err instanceof Error
          ? err.message
          : "Chưa tính được kết quả lúc này. Bạn thử lại nhé.",
      );
    } finally {
      if (reqId === requestSeqRef.current) {
        setAssessLoading(false);
      }
    }
  };

  const handleConfirmSubmit = (loan: ConfirmedLoan): void => {
    void runAssess(loan);
  };

  const handleBackToConfirm = (): void => {
    setAssessError(null);
    setStep("confirm");
    scrollToTop();
  };

  return (
    <div className="space-y-5 pb-6">
      <PageHeader
        backHref="/"
        backLabel="Về trang chủ"
        badge={headerMeta.badge}
        title={headerMeta.title}
        subtitle={headerMeta.subtitle}
      />

      <LoanStepProgress currentStep={step} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          void handleFileChange(e);
        }}
        className="sr-only"
        aria-label="Chụp hoặc chọn ảnh hợp đồng hoặc màn hình app vay"
      />

      {step === "choose" ? (
        <div className="space-y-5">
          {extractLoading ? (
            <LoadingState title={extractLoadingTitle} hint={extractLoadingHint} />
          ) : unreadableSource !== null ? (
            <div className="space-y-3">
              {unreadableSource === "image" ? (
                <ErrorState
                  title="Ảnh mờ hoặc chưa đọc được chữ"
                  message="AnTâm chưa nhận diện được con số trên ảnh này. Bạn thử chụp lại gần hơn, đủ sáng, dán chữ điều khoản hoặc tự nhập số liệu nhé."
                  onRetry={openFilePicker}
                  retryLabel="Chọn hoặc chụp lại ảnh khác"
                  onBack={startManualEntry}
                  backLabel="Tự nhập số liệu (khi chỉ nghe tư vấn miệng)"
                />
              ) : (
                <ErrorState
                  title="Chưa nhận diện được điều khoản từ đoạn chữ"
                  message="Đoạn chữ vừa gửi chưa có rõ số tiền hoặc lịch trả nợ. Bạn kiểm tra lại nội dung vừa dán hoặc chuyển sang tự nhập số liệu nhé."
                  onRetry={() => {
                    setUnreadableSource(null);
                    setInputMode("text");
                  }}
                  retryLabel="Quay lại sửa đoạn chữ"
                  onBack={startManualEntry}
                  backLabel="Tự nhập số liệu (khi chỉ nghe tư vấn miệng)"
                />
              )}

              <button
                type="button"
                onClick={() => setUnreadableSource(null)}
                className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 active:bg-slate-100"
              >
                Quay lại chọn mẫu thử hoặc cách nhập khác
              </button>
            </div>
          ) : extractError !== null ? (
            <ErrorState
              message={extractError}
              onRetry={handleRetryExtract}
              retryLabel="Thử lại"
              onBack={() => {
                requestSeqRef.current += 1;
                setExtractError(null);
                setRetryExtractTarget(null);
              }}
              backLabel="Quay lại"
            />
          ) : (
            <div className="space-y-5">
              {/* Khối đầu vào đa phương thức: Ảnh hoặc Dán chữ */}
              <section
                aria-labelledby="multimodal-input-heading"
                className="space-y-4 rounded-2xl border border-teal-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div>
                  <h2
                    id="multimodal-input-heading"
                    className="text-lg font-bold text-slate-900"
                  >
                    Đưa hợp đồng hoặc lời mời vay vào kiểm tra
                  </h2>
                  <p className="mt-1 text-base leading-relaxed text-slate-600">
                    Chọn 1 trong 2 cách bên dưới tuỳ theo thông tin bạn đang có trên tay.
                  </p>
                </div>

                {/* Bộ chuyển đổi 2 phương thức */}
                <div
                  role="tablist"
                  aria-label="Chọn cách đưa thông tin hợp đồng"
                  className="grid grid-cols-1 gap-2 rounded-2xl bg-slate-100 p-1.5 min-[360px]:grid-cols-2"
                >
                  <button
                    id="tab-input-image"
                    type="button"
                    role="tab"
                    aria-selected={inputMode === "image"}
                    aria-controls="panel-input-image"
                    onClick={() => {
                      setInputMode("image");
                      setTextInputError(null);
                    }}
                    className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-base font-semibold transition ${
                      inputMode === "image"
                        ? "bg-teal-700 text-white shadow-sm"
                        : "bg-transparent text-slate-700 hover:bg-white/70 hover:text-slate-900"
                    }`}
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
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                      <circle cx="12" cy="13" r="3" />
                    </svg>
                    <span>Ảnh hợp đồng / app</span>
                  </button>

                  <button
                    id="tab-input-text"
                    type="button"
                    role="tab"
                    aria-selected={inputMode === "text"}
                    aria-controls="panel-input-text"
                    onClick={() => {
                      setInputMode("text");
                      setTextInputError(null);
                    }}
                    className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-base font-semibold transition ${
                      inputMode === "text"
                        ? "bg-teal-700 text-white shadow-sm"
                        : "bg-transparent text-slate-700 hover:bg-white/70 hover:text-slate-900"
                    }`}
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
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6M8 13h8M8 17h5" />
                    </svg>
                    <span>Dán tin nhắn / chữ</span>
                  </button>
                </div>

                {inputMode === "image" ? (
                  <div
                    id="panel-input-image"
                    role="tabpanel"
                    aria-labelledby="tab-input-image"
                    className="space-y-4 pt-1"
                  >
                    <button
                      type="button"
                      onClick={openFilePicker}
                      className="inline-flex min-h-[56px] w-full items-center justify-center gap-2.5 rounded-xl bg-teal-700 px-5 py-3.5 text-center text-base font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-900"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.1}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 shrink-0"
                      >
                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                        <circle cx="12" cy="13" r="3" />
                      </svg>
                      <span>Chụp hoặc chọn ảnh hợp đồng / màn hình app</span>
                    </button>

                    <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-3.5 text-base leading-relaxed text-slate-700">
                      <p className="font-semibold text-teal-950">
                        Mẹo chụp để đọc chuẩn ngay lần đầu:
                      </p>
                      <ul className="mt-1.5 list-disc space-y-1 pl-5">
                        <li>
                          Chụp rõ phần <strong>tiền thực nhận</strong>,{" "}
                          <strong>tổng phải trả</strong>, lịch đóng và các khoản phí.
                        </li>
                        <li>
                          Bạn có thể lấy ngón tay hoặc mảnh giấy che số CCCD cá nhân trước khi chụp.
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div
                    id="panel-input-text"
                    role="tabpanel"
                    aria-labelledby="tab-input-text"
                    className="space-y-3.5 pt-1"
                  >
                    <div>
                      <label
                        htmlFor="loan-contract-textarea"
                        className="mb-1.5 block text-base font-semibold text-slate-900"
                      >
                        Dán nội dung tin nhắn Zalo/SMS hoặc điều khoản mời vay
                      </label>
                      <textarea
                        id="loan-contract-textarea"
                        rows={5}
                        value={contractText}
                        onChange={(e) => {
                          setContractText(e.target.value);
                          if (textInputError) {
                            setTextInputError(null);
                          }
                        }}
                        placeholder="Ví dụ: Vay 4.000.000đ lãi suất 0%, phí thẩm định 1.000.000đ trừ trước, thực nhận 3.000.000đ, sau 14 ngày đóng 4.200.000đ..."
                        className="min-h-[140px] w-full rounded-xl border border-slate-300 bg-slate-50/60 p-3.5 text-base leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                      />
                    </div>

                    {textInputError ? (
                      <div
                        role="alert"
                        className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-base font-medium leading-relaxed text-amber-950"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mt-0.5 h-5 w-5 shrink-0 text-amber-800"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 8v4" />
                          <path d="M12 16h.01" />
                        </svg>
                        <span>{textInputError}</span>
                      </div>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setContractText(SAMPLE_AD_TEXT);
                          setTextInputError(null);
                        }}
                        className="min-h-[48px] flex-1 rounded-xl border border-teal-200 bg-teal-50/80 px-3.5 py-2.5 text-base font-semibold text-teal-950 transition hover:bg-teal-100 active:bg-teal-200"
                      >
                        Điền thử tin nhắn quảng cáo mẫu
                      </button>

                      {contractText.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setContractText("");
                            setTextInputError(null);
                          }}
                          className="min-h-[48px] rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
                        >
                          Xoá chữ
                        </button>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        void runTextExtract(contractText);
                      }}
                      className="inline-flex min-h-[56px] w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3.5 text-center text-base font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-900"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.1}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 shrink-0"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6" />
                        <circle cx="11.5" cy="14.5" r="2.5" />
                        <path d="m13.5 16.5 2 2" />
                      </svg>
                      <span>Đọc điều khoản từ đoạn chữ</span>
                    </button>
                  </div>
                )}
              </section>

              {/* 3 thẻ mẫu thử nhanh chuyên nghiệp */}
              <section
                aria-labelledby="sample-scenarios-heading"
                className="space-y-3.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div>
                  <h2
                    id="sample-scenarios-heading"
                    className="text-lg font-bold text-slate-900"
                  >
                    Hoặc thử nhanh 3 kịch bản hợp đồng mẫu
                  </h2>
                  <p className="mt-1 text-base leading-relaxed text-slate-600">
                    Bấm 1 chạm để xem cách AnTâm tính chi phí thật và đối chiếu từng nhánh quy định.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {SAMPLES.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => {
                        void handleSampleSelect(sample.id);
                      }}
                      className="group flex min-h-[64px] w-full items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-left transition hover:border-teal-500 hover:bg-teal-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-100/60"
                    >
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <span
                          className={`inline-block rounded-lg border px-2.5 py-0.5 text-base font-semibold ${sample.tagClass}`}
                        >
                          {sample.tag}
                        </span>
                        <div className="text-base font-bold leading-snug text-slate-900 group-hover:text-teal-950">
                          {sample.title}
                        </div>
                        <p className="text-base leading-relaxed text-slate-600">
                          {sample.description}
                        </p>
                      </div>

                      <span
                        aria-hidden="true"
                        className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-teal-800 ring-1 ring-slate-200 transition group-hover:bg-teal-700 group-hover:text-white group-hover:ring-teal-700"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Tự nhập số liệu khi nghe tư vấn miệng / vay cá nhân */}
              <section
                aria-labelledby="manual-entry-heading"
                className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <h2 id="manual-entry-heading" className="text-lg font-bold text-slate-900">
                  Chưa có giấy tờ hay ảnh chụp?
                </h2>
                <p className="text-base leading-relaxed text-slate-600">
                  Dùng khi bạn mới nghe người tư vấn báo miệng, vay cá nhân hoặc vay họ/góp bên ngoài.{" "}
                  <strong className="font-semibold text-rose-900">
                    Cảnh giác: nếu bên cho vay đòi nộp phí hồ sơ, bảo hiểm hay tiền cọc trước mới giải ngân thì đó là dấu hiệu lừa đảo.
                  </strong>
                </p>
                <button
                  type="button"
                  onClick={startManualEntry}
                  className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border-2 border-teal-700 bg-white px-4 py-3 text-center text-base font-semibold text-teal-900 shadow-sm transition hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-100"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 shrink-0 text-teal-800"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                  <span>Tự nhập số liệu (khi chỉ nghe tư vấn miệng)</span>
                </button>
              </section>

              {/* Soi các quyền nguy hiểm mà app vay hay đòi */}
              <PermissionGuide />
            </div>
          )}
        </div>
      ) : null}

      {step === "confirm" ? (
        <div className="space-y-4">
          {assessLoading ? (
            <LoadingState
              title="Đang tính chi phí thật và đối chiếu quy định..."
              hint="Mọi con số tiền và lãi suất đều do công cụ tính toán chính xác từ dòng tiền thực nhận."
            />
          ) : null}

          {!assessLoading && assessError !== null ? (
            <ErrorState
              message={assessError}
              onRetry={
                lastLoan
                  ? () => {
                      void runAssess(lastLoan);
                    }
                  : undefined
              }
              retryLabel="Thử lại"
              onBack={() => setAssessError(null)}
              backLabel="Quay lại sửa thông tin"
            />
          ) : null}
        </div>
      ) : null}

      {step !== "choose" ? (
        <div
          className={
            step === "confirm" && !assessLoading && assessError === null
              ? "block"
              : "hidden"
          }
        >
          <ConfirmForm
            key={formSessionKey}
            initialTerms={extracted?.terms ?? null}
            lowConfidenceFields={extracted?.low_confidence_fields ?? []}
            submitLabel="Xem kết quả kiểm tra"
            loading={assessLoading}
            onSubmit={handleConfirmSubmit}
            onBack={resetToChoose}
            backLabel="Quay lại bước đưa thông tin"
          />
        </div>
      ) : null}

      {step === "result" && assessment !== null ? (
        <div className="space-y-5">
          <RiskCard assessment={assessment} />

          <section
            aria-labelledby="next-actions-heading"
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div>
              <h2 id="next-actions-heading" className="text-lg font-bold text-slate-900">
                Bước tiếp theo dành cho bạn
              </h2>
              <p className="mt-1 text-base leading-relaxed text-slate-600">
                {assessment.risk_level !== "green"
                  ? "Nếu chưa ký nhận tiền, bạn nên dừng lại và xem các hướng xoay xở 0đ an toàn hơn. Nếu đã lỡ nhận tiền, hãy xem ngay cách khoá quyền dữ liệu và tách gốc — lãi."
                  : "Trước khi đặt bút ký, bạn vẫn nên kiểm tra xem có thể xin giãn khoản chi 0đ mà không phải gánh thêm nợ mới hay không."}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/need"
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-center text-base font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-900"
              >
                <span>Chưa ký? Tìm phương án 0đ thay thế</span>
                <span aria-hidden="true">→</span>
              </Link>

              <Link
                href="/aftercare"
                className={`inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-center text-base font-semibold shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  assessment.risk_level !== "green"
                    ? "border-2 border-amber-500 bg-amber-50 text-amber-950 hover:bg-amber-100 focus-visible:outline-amber-700 active:bg-amber-200"
                    : "border border-teal-300 bg-teal-50/70 text-teal-950 hover:bg-teal-100 focus-visible:outline-teal-700 active:bg-teal-200"
                }`}
              >
                <span>Tôi đã lỡ nhận tiền khoản vay này</span>
                <span aria-hidden="true">→</span>
              </Link>

              <button
                type="button"
                onClick={handleBackToConfirm}
                className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 active:bg-slate-100"
              >
                Sửa lại số liệu khoản vay vừa nhập
              </button>

              <button
                type="button"
                onClick={resetToChoose}
                className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-slate-50 px-5 py-3 text-base font-semibold text-slate-800 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 active:bg-slate-200"
              >
                Kiểm tra một khoản vay khác
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

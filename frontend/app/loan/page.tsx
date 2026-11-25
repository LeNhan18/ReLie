"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ConfirmForm } from "@/components/ConfirmForm";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { RiskCard } from "@/components/RiskCard";
import {
  api,
  type Assessment,
  type ConfirmedLoan,
  type ExtractResponse,
  type LoanTerms,
} from "@/lib/api";
import { resizeImageToJpegBlob } from "./resizeImage";

type Step = "choose" | "confirm" | "result";
type SampleId = "xanhcash" | "gop_ngay" | "cty_tai_chinh_a";

type RetryExtractTarget =
  | { kind: "sample"; sampleId: SampleId }
  | { kind: "blob"; blob: Blob }
  | { kind: "pick_file" };

const SAMPLES: ReadonlyArray<{ id: SampleId; label: string }> = [
  { id: "xanhcash", label: "Thử mẫu 1: App vay ngắn ngày (XanhCash)" },
  { id: "gop_ngay", label: "Thử mẫu 2: Vay góp ngày" },
  { id: "cty_tai_chinh_a", label: "Thử mẫu 3: Công ty tài chính A" },
];

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

export default function LoanPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const requestSeqRef = useRef(0);

  const [step, setStep] = useState<Step>("choose");
  const [formSessionKey, setFormSessionKey] = useState<number>(0);

  const [extractLoading, setExtractLoading] = useState<boolean>(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [unreadableImage, setUnreadableImage] = useState<boolean>(false);
  const [retryExtractTarget, setRetryExtractTarget] =
    useState<RetryExtractTarget | null>(null);

  const [extracted, setExtracted] = useState<ExtractResponse | null>(null);
  const [lastLoan, setLastLoan] = useState<ConfirmedLoan | null>(null);

  const [assessLoading, setAssessLoading] = useState<boolean>(false);
  const [assessError, setAssessError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);

  const openFilePicker = (): void => {
    setUnreadableImage(false);
    setExtractError(null);
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
    setUnreadableImage(false);
    setRetryExtractTarget(null);
    enterConfirmStep(null);
  };

  const resetToChoose = (): void => {
    requestSeqRef.current += 1;
    setExtractLoading(false);
    setExtractError(null);
    setUnreadableImage(false);
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

    setExtractLoading(true);
    setExtractError(null);
    setUnreadableImage(false);
    setRetryExtractTarget({ kind: "blob", blob });
    scrollToTop();

    try {
      const response = await api.extract({ file: blob, filename: "contract.jpg" });
      if (reqId !== requestSeqRef.current) {
        return;
      }
      setRetryExtractTarget(null);

      if (isTermsCompletelyEmpty(response.terms)) {
        setUnreadableImage(true);
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

    setExtractLoading(true);
    setExtractError(null);
    setUnreadableImage(false);
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

  const handleSampleSelect = async (sampleId: SampleId): Promise<void> => {
    const reqId = requestSeqRef.current + 1;
    requestSeqRef.current = reqId;

    setExtractLoading(true);
    setExtractError(null);
    setUnreadableImage(false);
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
      openFilePicker();
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
      <nav aria-label="Điều hướng">
        <Link
          href="/"
          className="inline-flex min-h-[48px] items-center rounded-xl px-2 text-base font-medium text-teal-800 transition hover:bg-teal-50 hover:text-teal-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
        >
          ← Về trang chủ
        </Link>
      </nav>

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
          <header className="space-y-2">
            <h1 className="text-2xl font-bold leading-snug text-slate-900">
              Kiểm tra khoản vay trước khi ký
            </h1>
            <p className="text-base leading-relaxed text-slate-700">
              Ảnh chỉ xử lý ngay để đọc chữ, không lưu ảnh gốc.
            </p>
          </header>

          {extractLoading ? (
            <LoadingState
              title="Đang đọc thông tin trên hợp đồng..."
              hint="Bạn đợi một chút nhé, ảnh đang được xử lý ngay trên máy."
            />
          ) : unreadableImage ? (
            <div className="space-y-3">
              <ErrorState
                title="Ảnh mờ hoặc chưa đọc được chữ"
                message="AnTâm chưa nhận diện được con số trên ảnh này. Bạn thử chụp lại gần hơn, đủ sáng, hoặc tự nhập tay thông tin nhé."
                onRetry={openFilePicker}
                retryLabel="Chọn ảnh khác"
                onBack={startManualEntry}
                backLabel="Tự nhập thông tin bằng tay"
              />
              <button
                type="button"
                onClick={() => setUnreadableImage(false)}
                className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 active:bg-slate-100"
              >
                Quay lại chọn mẫu thử
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
            <div className="space-y-4">
              <div className="rounded-2xl border border-teal-200 bg-white p-4 shadow-sm">
                <button
                  type="button"
                  onClick={openFilePicker}
                  className="flex min-h-[56px] w-full items-center justify-center rounded-xl bg-teal-700 px-5 py-3.5 text-center text-base font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-900"
                >
                  Chụp hoặc chọn ảnh hợp đồng / app vay
                </button>
                <p className="mt-2.5 text-center text-base leading-relaxed text-slate-600">
                  Chụp rõ phần số tiền nhận về, lịch trả và các khoản phí để đọc chính xác hơn.
                </p>
              </div>

              <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">
                  Hoặc xem thử trên 3 mẫu có sẵn
                </h2>
                <div className="flex flex-col gap-2.5">
                  {SAMPLES.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => {
                        void handleSampleSelect(sample.id);
                      }}
                      className="min-h-[48px] w-full rounded-xl border border-teal-200 bg-teal-50/70 px-4 py-3 text-left text-base font-medium text-teal-950 transition hover:border-teal-400 hover:bg-teal-100/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-100"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </section>

              <button
                type="button"
                onClick={startManualEntry}
                className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 active:bg-slate-100"
              >
                Tự nhập thông tin khoản vay (không cần ảnh)
              </button>
            </div>
          )}
        </div>
      ) : null}

      {step === "confirm" ? (
        <div className="space-y-4">
          <header className="space-y-1.5">
            <h1 className="text-2xl font-bold leading-snug text-slate-900">
              Kiểm tra lại các con số trước khi tính
            </h1>
            <p className="text-base leading-relaxed text-slate-700">
              Bạn đối chiếu lại với hợp đồng hoặc lời người tư vấn, sửa lại nếu chưa khớp nhé.
            </p>
          </header>

          {assessLoading ? (
            <LoadingState title="Đang tính chi phí thật và đối chiếu quy định..." />
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
            backLabel="Chọn ảnh hoặc mẫu khác"
          />
        </div>
      ) : null}

      {step === "result" && assessment !== null ? (
        <div className="space-y-5">
          <header className="space-y-1.5">
            <h1 className="text-2xl font-bold leading-snug text-slate-900">
              Kết quả kiểm tra khoản vay
            </h1>
            <p className="text-base leading-relaxed text-slate-700">
              Bạn xem kỹ chi phí thực tế và các dấu hiệu dưới đây trước khi quyết định nhé.
            </p>
          </header>

          <RiskCard assessment={assessment} />

          <div className="flex flex-col gap-3 pt-1">
            {assessment.risk_level !== "green" ? (
              <Link
                href="/aftercare"
                className="flex min-h-[52px] w-full items-center justify-center rounded-xl bg-teal-700 px-5 py-3 text-center text-base font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-900"
              >
                Tôi đã lỡ nhận tiền khoản vay này →
              </Link>
            ) : null}

            <button
              type="button"
              onClick={handleBackToConfirm}
              className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 active:bg-slate-100"
            >
              Sửa lại thông tin khoản vay
            </button>

            <button
              type="button"
              onClick={resetToChoose}
              className="min-h-[48px] w-full rounded-xl border border-teal-300 bg-teal-50 px-5 py-3 text-base font-semibold text-teal-900 transition hover:bg-teal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-200"
            >
              Kiểm tra một khoản vay khác
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

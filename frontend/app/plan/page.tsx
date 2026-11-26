"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import {
  api,
  ApiError,
  formatIsoDateVi,
  formatVnd,
  type DebtIn,
  type TodayRequest,
  type TodayResult,
} from "@/lib/api";
import { LOAN_FILE_ACCEPT, prepareLoanUpload } from "@/app/loan/uploadFile";

type ObligationRow = {
  id: string;
  label: string;
  due: string;
  amount: string;
};

const PRIORITY_STEPS = [
  {
    step: "1",
    title: "Ăn uống, thuốc men thiết yếu của gia đình",
    detail:
      "Giữ bữa ăn hằng ngày, thuốc men và xăng xe đi làm trước tiên để bảo đảm sức khoẻ và duy trì thu nhập.",
  },
  {
    step: "2",
    title: "Tiền nhà, điện nước, học phí — xin khất/chia nhỏ sớm bằng thư mẫu",
    detail:
      "Chủ động nhắn chủ trọ hoặc nhà trường trước hạn vài ngày để xin đóng thành nhiều đợt nhẹ nhàng hơn.",
  },
  {
    step: "3",
    title: "Khoản vay tổ chức hợp pháp — liên hệ xin cơ cấu lại kỳ hạn",
    detail:
      "Gọi tổng đài chính thức của ngân hàng hoặc công ty tài chính được cấp phép để xin giãn kỳ trả, hạn chế phát sinh phí trễ hạn.",
  },
  {
    step: "4",
    title: "Tuyệt đối không vay app mới để đắp khoản thiếu",
    detail:
      "Tránh xa các app giải ngân nhanh có dấu hiệu thu phí ẩn hoặc đòi danh bạ, vì vay khoản mới đắp khoản cũ rất dễ dẫn tới nợ chồng nợ.",
  },
] as const;

function sanitizeDigits(raw: string): string {
  return raw.replace(/[^\d]/g, "");
}

function parseVndDigits(raw: string): number | null {
  const digits = sanitizeDigits(raw);
  if (!digits) {
    return null;
  }
  const num = Number(digits);
  if (!Number.isSafeInteger(num) || num < 0) {
    return null;
  }
  return num;
}

function toLocalIsoDate(date: Date): string {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getLocalTodayIso(): string {
  return toLocalIsoDate(new Date());
}

function addDaysToIso(baseIso: string, offsetDays: number): string {
  const parts = baseIso.split("-");
  if (parts.length !== 3) {
    return baseIso;
  }
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  const next = new Date(y, m - 1, d + offsetDays);
  return toLocalIsoDate(next);
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [yStr, mStr, dStr] = value.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

export default function PlanPage() {
  const nextRowIdRef = useRef(1);
  const formTopRef = useRef<HTMLDivElement | null>(null);
  const resultSectionRef = useRef<HTMLDivElement | null>(null);
  const debtFileInputRef = useRef<HTMLInputElement | null>(null);

  const makeRowId = (prefix: string): string => {
    const id = `${prefix}-${nextRowIdRef.current}`;
    nextRowIdRef.current += 1;
    return id;
  };

  const [todayIso, setTodayIso] = useState<string>("");
  const [cashOnHand, setCashOnHand] = useState<string>("");
  const [nextPayday, setNextPayday] = useState<string>("");
  const [avgDailySpend, setAvgDailySpend] = useState<string>("100000");
  const [buffer, setBuffer] = useState<string>("0");
  const [fixedRows, setFixedRows] = useState<ObligationRow[]>([]);
  const [debtRows, setDebtRows] = useState<ObligationRow[]>([]);

  const [presetNotice, setPresetNotice] = useState<string | null>(null);
  const [debtUploadLoading, setDebtUploadLoading] = useState<boolean>(false);
  const [debtUploadError, setDebtUploadError] = useState<string | null>(null);
  const [debtUploadNotice, setDebtUploadNotice] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [result, setResult] = useState<TodayResult | null>(null);
  const [lastPayload, setLastPayload] = useState<TodayRequest | null>(null);
  const [isDirtyAfterResult, setIsDirtyAfterResult] = useState<boolean>(false);

  useEffect(() => {
    setTodayIso(getLocalTodayIso());
  }, []);

  const markEdited = () => {
    if (result !== null) {
      setIsDirtyAfterResult(true);
    }
    if (validationError !== null) {
      setValidationError(null);
    }
  };

  const handleFillSample = () => {
    const currentToday = getLocalTodayIso();
    setTodayIso(currentToday);
    setCashOnHand("2500000");
    setNextPayday(addDaysToIso(currentToday, 10));
    setAvgDailySpend("120000");
    setBuffer("200000");
    setFixedRows([
      {
        id: makeRowId("fixed"),
        label: "Tiền nhà trọ",
        due: addDaysToIso(currentToday, 5),
        amount: "1500000",
      },
    ]);
    setDebtRows([
      {
        id: makeRowId("debt"),
        label: "Trả góp xe máy",
        due: addDaysToIso(currentToday, 7),
        amount: "900000",
      },
    ]);
    setValidationError(null);
    setApiError(null);
    setResult(null);
    setLastPayload(null);
    setIsDirtyAfterResult(false);
    setPresetNotice(
      "Đã điền sẵn ví dụ của chị Hoa. Bạn kéo xuống kiểm tra hoặc bấm ngay nút tính bên dưới để xem dự báo nhé.",
    );
  };

  const handleClearForm = () => {
    const currentToday = getLocalTodayIso();
    setTodayIso(currentToday);
    setCashOnHand("");
    setNextPayday("");
    setAvgDailySpend("100000");
    setBuffer("0");
    setFixedRows([]);
    setDebtRows([]);
    setPresetNotice(null);
    setValidationError(null);
    setApiError(null);
    setResult(null);
    setLastPayload(null);
    setIsDirtyAfterResult(false);
  };

  const handleAddFixedRow = () => {
    markEdited();
    setFixedRows((prev) => [
      ...prev,
      { id: makeRowId("fixed"), label: "", due: "", amount: "" },
    ]);
  };

  const handleRemoveFixedRow = (id: string) => {
    markEdited();
    setFixedRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleChangeFixedRow = (
    id: string,
    field: "label" | "due" | "amount",
    value: string,
  ) => {
    markEdited();
    setFixedRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: field === "amount" ? sanitizeDigits(value) : value,
            }
          : row,
      ),
    );
  };

  const handleAddDebtRow = () => {
    markEdited();
    setDebtRows((prev) => [
      ...prev,
      { id: makeRowId("debt"), label: "", due: "", amount: "" },
    ]);
  };

  const handleRemoveDebtRow = (id: string) => {
    markEdited();
    setDebtRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleChangeDebtRow = (
    id: string,
    field: "label" | "due" | "amount",
    value: string,
  ) => {
    markEdited();
    setDebtRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: field === "amount" ? sanitizeDigits(value) : value,
            }
          : row,
      ),
    );
  };

  const handleDebtContractUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const selectedFile = e.target.files?.[0];
    e.target.value = "";
    if (!selectedFile) {
      return;
    }

    setDebtUploadLoading(true);
    setDebtUploadError(null);
    setDebtUploadNotice(null);

    try {
      const prepared = await prepareLoanUpload(selectedFile);
      const response = await api.extract({
        file: prepared.file,
        filename: prepared.filename,
      });
      const terms = response.terms;
      const lenderLabel =
        terms.lender_name.value?.trim() || "Khoản vay từ hợp đồng";

      const extractedRows: ObligationRow[] =
        terms.schedule.length > 0
          ? terms.schedule.map((item, idx) => ({
              id: makeRowId("debt"),
              label:
                terms.schedule.length > 1
                  ? `${lenderLabel} (Kỳ ${idx + 1})`
                  : lenderLabel,
              due: item.on,
              amount: String(item.amount),
            }))
          : [
              {
                id: makeRowId("debt"),
                label: lenderLabel,
                due: "",
                amount: "",
              },
            ];

      markEdited();
      setDebtRows((prev) => {
        const nonEmpty = prev.filter(
          (r) => r.label.trim() !== "" || r.due !== "" || r.amount !== "",
        );
        return [...nonEmpty, ...extractedRows];
      });
      setDebtUploadNotice(
        terms.schedule.length > 0
          ? `Đã tự điền ${terms.schedule.length} kỳ trả nợ từ "${selectedFile.name}". Bạn kiểm tra lại các ô bên dưới nhé.`
          : `Đã đọc tên bên cho vay từ "${selectedFile.name}", bạn điền thêm hạn trả và số tiền nhé.`,
      );
    } catch (err: unknown) {
      setDebtUploadError(
        err instanceof Error
          ? err.message
          : "Chưa đọc được tệp hợp đồng này. Bạn thử chọn tệp khác hoặc tự nhập nhé.",
      );
    } finally {
      setDebtUploadLoading(false);
    }
  };

  const submitPlanRequest = async (payload: TodayRequest) => {
    setLoading(true);
    setApiError(null);
    setLastPayload(payload);

    requestAnimationFrame(() => {
      resultSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    try {
      const response = await api.planToday(payload);
      setResult(response);
      setIsDirtyAfterResult(false);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
        setApiError(
          "Không tính được kế hoạch lúc này. Dữ liệu bạn nhập vẫn còn nguyên, bạn bấm Thử lại nhé.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const buildValidatedPayload = (): TodayRequest | null => {
    const effectiveToday = todayIso || getLocalTodayIso();
    if (!todayIso) {
      setTodayIso(effectiveToday);
    }

    const parsedCash = parseVndDigits(cashOnHand);
    if (parsedCash === null) {
      setValidationError(
        "Bạn nhập số tiền mặt hoặc trong thẻ hiện có (nhập 0 nếu hiện không còn tiền mặt) nhé.",
      );
      return null;
    }

    if (!isValidIsoDate(nextPayday)) {
      setValidationError("Bạn chọn ngày nhận lương tiếp theo giúp AnTâm nhé.");
      return null;
    }

    if (nextPayday <= effectiveToday) {
      setValidationError(
        `Ngày nhận lương tiếp theo phải sau ngày hôm nay (${formatIsoDateVi(effectiveToday)}).`,
      );
      return null;
    }

    const parsedDaily = parseVndDigits(avgDailySpend) ?? 100_000;

    const trimmedBuffer = buffer.trim();
    const parsedBuffer = trimmedBuffer === "" ? 0 : parseVndDigits(trimmedBuffer);
    if (parsedBuffer === null) {
      setValidationError("Khoản dự phòng khẩn cấp chưa hợp lệ, bạn kiểm tra lại nhé.");
      return null;
    }

    const parsedFixed: DebtIn[] = [];
    for (let i = 0; i < fixedRows.length; i += 1) {
      const row = fixedRows[i];
      const idxLabel = `khoản chi cố định số ${i + 1}`;
      const trimmedLabel = row.label.trim();
      if (!trimmedLabel) {
        setValidationError(`Bạn điền tên cho ${idxLabel} (ví dụ: Tiền nhà trọ) nhé.`);
        return null;
      }
      if (!isValidIsoDate(row.due)) {
        setValidationError(`Bạn chọn hạn đóng hợp lệ cho "${trimmedLabel}" nhé.`);
        return null;
      }
      const amt = parseVndDigits(row.amount);
      if (amt === null || amt <= 0) {
        setValidationError(
          `Bạn nhập số tiền lớn hơn 0 đ cho khoản chi "${trimmedLabel}" nhé.`,
        );
        return null;
      }
      parsedFixed.push({
        label: trimmedLabel,
        due: row.due,
        amount: amt,
      });
    }

    const parsedDebts: DebtIn[] = [];
    for (let i = 0; i < debtRows.length; i += 1) {
      const row = debtRows[i];
      const idxLabel = `khoản nợ số ${i + 1}`;
      const trimmedLabel = row.label.trim();
      if (!trimmedLabel) {
        setValidationError(`Bạn điền tên cho ${idxLabel} (ví dụ: Trả góp xe máy) nhé.`);
        return null;
      }
      if (!isValidIsoDate(row.due)) {
        setValidationError(`Bạn chọn hạn trả hợp lệ cho "${trimmedLabel}" nhé.`);
        return null;
      }
      const amt = parseVndDigits(row.amount);
      if (amt === null || amt <= 0) {
        setValidationError(
          `Bạn nhập số tiền lớn hơn 0 đ cho khoản nợ "${trimmedLabel}" nhé.`,
        );
        return null;
      }
      parsedDebts.push({
        label: trimmedLabel,
        due: row.due,
        amount: amt,
      });
    }

    return {
      today: effectiveToday,
      cash_on_hand: parsedCash,
      next_payday: nextPayday,
      avg_daily_spend: parsedDaily,
      fixed: parsedFixed,
      debts: parsedDebts,
      buffer: parsedBuffer,
    };
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError(null);
    const payload = buildValidatedPayload();
    if (!payload) {
      return;
    }
    void submitPlanRequest(payload);
  };

  const handleRetry = () => {
    const freshPayload = buildValidatedPayload();
    if (freshPayload) {
      void submitPlanRequest(freshPayload);
      return;
    }
    if (lastPayload) {
      void submitPlanRequest(lastPayload);
    }
  };

  const inputBaseClass =
    "min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20";

  const previewCash = parseVndDigits(cashOnHand);
  const previewDaily = parseVndDigits(avgDailySpend);
  const previewBuffer = parseVndDigits(buffer);
  const hasAnyInput =
    cashOnHand !== "" ||
    nextPayday !== "" ||
    avgDailySpend !== "" ||
    (buffer !== "" && buffer !== "0") ||
    fixedRows.length > 0 ||
    debtRows.length > 0;

  const minNextPayday = todayIso ? addDaysToIso(todayIso, 1) : undefined;

  return (
    <div ref={formTopRef} className="space-y-6 pb-6">
      <PageHeader
        backHref="/"
        badge="Dự báo dòng tiền an toàn"
        title="Kế hoạch tiền & nợ"
        subtitle="Biết rõ hôm nay bạn được tiêu tối đa bao nhiêu để trụ vững tới ngày nhận lương và thấy sớm khoản nợ có nguy cơ hụt tiền."
      />

      {/* Khối điền nhanh tình huống mẫu */}
      <section
        aria-labelledby="sample-preset-heading"
        className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/90 via-white to-amber-50/50 p-4 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm"
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
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </span>

          <div className="min-w-0 flex-1">
            <h2
              id="sample-preset-heading"
              className="text-base font-bold leading-snug text-slate-900"
            >
              Muốn xem thử cách tính ngay?
            </h2>
            <p className="mt-1 text-base leading-relaxed text-slate-600">
              Bấm nút dưới đây để điền sẵn tình huống mẫu, không cần gõ từng con số.
            </p>
          </div>
        </div>

        <div className="mt-3.5 flex flex-col gap-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={handleFillSample}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-teal-600 bg-white px-4 py-3 text-base font-semibold text-teal-900 shadow-sm transition hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-100 disabled:opacity-60"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 shrink-0 text-teal-700"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            <span>Điền thử ví dụ chị Hoa (công nhân chờ lương)</span>
          </button>

          {hasAnyInput ? (
            <button
              type="button"
              disabled={loading}
              onClick={handleClearForm}
              className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white/90 px-4 py-2.5 text-base font-semibold text-slate-700 transition hover:bg-slate-100 active:bg-slate-200 disabled:opacity-60"
            >
              Xoá trắng để tự nhập số của bạn
            </button>
          ) : null}
        </div>

        {presetNotice ? (
          <p
            role="status"
            aria-live="polite"
            className="mt-3 rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-2.5 text-base font-medium leading-relaxed text-teal-950"
          >
            {presetNotice}
          </p>
        ) : null}
      </section>

      {/* Form nhập liệu dòng tiền */}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <section
          aria-labelledby="plan-basics-heading"
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2
                id="plan-basics-heading"
                className="text-lg font-bold text-slate-900"
              >
                Tiền hiện có &amp; kỳ lương tới
              </h2>
              {todayIso ? (
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-base font-medium text-slate-700 tabular-nums">
                  Hôm nay: {formatIsoDateVi(todayIso)}
                </span>
              ) : null}
            </div>
            <p className="text-base leading-relaxed text-slate-600">
              AnTâm không lưu các con số này trên trình duyệt của bạn.
            </p>
          </div>

          <div>
            <label
              htmlFor="plan-cash-on-hand"
              className="mb-1.5 block text-base font-semibold text-slate-900"
            >
              1. Tiền mặt hoặc trong thẻ hiện có (VND){" "}
              <span className="text-red-600">*</span>
            </label>
            <input
              id="plan-cash-on-hand"
              type="text"
              inputMode="numeric"
              disabled={loading}
              value={cashOnHand}
              onChange={(e) => {
                markEdited();
                setCashOnHand(sanitizeDigits(e.target.value));
              }}
              placeholder="Ví dụ: 2500000"
              className={`${inputBaseClass} tabular-nums`}
            />
            {previewCash !== null ? (
              <p className="mt-1.5 text-base text-teal-800">
                Đang nhập:{" "}
                <span className="font-bold tabular-nums">
                  {formatVnd(previewCash)}
                </span>
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="plan-next-payday"
              className="mb-1.5 block text-base font-semibold text-slate-900"
            >
              2. Ngày nhận lương tiếp theo <span className="text-red-600">*</span>
            </label>
            <input
              id="plan-next-payday"
              type="date"
              min={minNextPayday}
              disabled={loading}
              value={nextPayday}
              onChange={(e) => {
                markEdited();
                setNextPayday(e.target.value);
              }}
              className={`${inputBaseClass} tabular-nums`}
            />
            <p className="mt-1.5 text-base leading-relaxed text-slate-600">
              Chọn ngày sau hôm nay (ngày công ty trả lương hoặc ngày có khoản thu chắc chắn).
            </p>
          </div>

          <details className="rounded-xl bg-slate-50 px-3.5 py-2.5">
            <summary className="cursor-pointer select-none text-sm font-semibold text-slate-700">
              Tuỳ chỉnh mức sinh hoạt &amp; dự phòng (mặc định {formatVnd(previewDaily ?? 100_000)}/ngày)
            </summary>

            <div className="mt-3 space-y-3.5">
              <div>
                <p className="text-xs font-semibold text-slate-600">
                  Mức ăn uống, xăng xe trung bình / ngày (dùng để cảnh báo hụt tiền)
                </p>
                <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                  {[
                    { label: "Tiết kiệm · 80k", value: "80000" },
                    { label: "Phổ thông · 100k", value: "100000" },
                    { label: "Gia đình · 180k", value: "180000" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        markEdited();
                        setAvgDailySpend(opt.value);
                      }}
                      className={`min-h-[40px] rounded-lg px-2 text-xs font-semibold transition ${
                        avgDailySpend === opt.value
                          ? "bg-teal-700 text-white"
                          : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <input
                  id="plan-avg-daily"
                  type="text"
                  inputMode="numeric"
                  disabled={loading}
                  value={avgDailySpend}
                  onChange={(e) => {
                    markEdited();
                    setAvgDailySpend(sanitizeDigits(e.target.value));
                  }}
                  placeholder="Hoặc nhập số khác (VND/ngày)"
                  className={`mt-2 ${inputBaseClass} tabular-nums`}
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-600">
                  Khoản dự phòng khẩn cấp muốn cất riêng (tuỳ chọn)
                </p>
                <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                  {[
                    { label: "Không giữ (0đ)", value: "0" },
                    { label: "200.000 đ", value: "200000" },
                    { label: "500.000 đ", value: "500000" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        markEdited();
                        setBuffer(opt.value);
                      }}
                      className={`min-h-[40px] rounded-lg px-2 text-xs font-semibold transition ${
                        buffer === opt.value
                          ? "bg-teal-700 text-white"
                          : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <input
                  id="plan-buffer"
                  type="text"
                  inputMode="numeric"
                  disabled={loading}
                  value={buffer}
                  onChange={(e) => {
                    markEdited();
                    setBuffer(sanitizeDigits(e.target.value));
                  }}
                  placeholder="Mặc định: 0"
                  className={`mt-2 ${inputBaseClass} tabular-nums`}
                />
              </div>
            </div>
          </details>
        </section>

        {/* Danh sách chi cố định sắp đóng */}
        <section
          aria-labelledby="plan-fixed-heading"
          className="space-y-3.5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div>
            <h2
              id="plan-fixed-heading"
              className="text-lg font-bold text-slate-900"
            >
              Chi cố định sắp đóng ({fixedRows.length})
            </h2>
            <p className="mt-1 text-base leading-relaxed text-slate-600">
              Tiền nhà trọ, điện nước, học phí của con... phải đóng trước ngày nhận lương.
            </p>
          </div>

          {fixedRows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-4 text-base leading-relaxed text-slate-600">
              Chưa có khoản chi cố định nào. Nếu sắp tới hạn đóng tiền trọ hoặc điện nước, bạn bấm nút bên dưới để thêm vào nhé.
            </div>
          ) : (
            <div className="space-y-3">
              {fixedRows.map((row, idx) => {
                const rowAmt = parseVndDigits(row.amount);
                const outsideWindow =
                  Boolean(todayIso) &&
                  isValidIsoDate(row.due) &&
                  (row.due < todayIso ||
                    (isValidIsoDate(nextPayday) && row.due >= nextPayday));

                return (
                  <div
                    key={row.id}
                    className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/90 p-3.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-lg bg-white px-3 py-1 text-base font-bold text-slate-800 ring-1 ring-inset ring-slate-200">
                        Khoản chi {idx + 1}
                      </span>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleRemoveFixedRow(row.id)}
                        className="min-h-[48px] rounded-xl border border-red-200 bg-white px-3.5 py-2 text-base font-semibold text-red-700 transition hover:bg-red-50 active:bg-red-100 disabled:opacity-60"
                      >
                        Xoá khoản này
                      </button>
                    </div>

                    <div>
                      <label
                        htmlFor={`fixed-label-${row.id}`}
                        className="mb-1 block text-base font-medium text-slate-800"
                      >
                        Tên khoản chi
                      </label>
                      <input
                        id={`fixed-label-${row.id}`}
                        type="text"
                        disabled={loading}
                        value={row.label}
                        onChange={(e) =>
                          handleChangeFixedRow(row.id, "label", e.target.value)
                        }
                        placeholder="Ví dụ: Tiền nhà trọ"
                        className={inputBaseClass}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`fixed-due-${row.id}`}
                        className="mb-1 block text-base font-medium text-slate-800"
                      >
                        Hạn đóng
                      </label>
                      <input
                        id={`fixed-due-${row.id}`}
                        type="date"
                        disabled={loading}
                        value={row.due}
                        onChange={(e) =>
                          handleChangeFixedRow(row.id, "due", e.target.value)
                        }
                        className={`${inputBaseClass} tabular-nums`}
                      />
                      {outsideWindow ? (
                        <p className="mt-1.5 text-base leading-relaxed text-amber-900">
                          Lưu ý: Ngày này nằm ngoài khoảng từ hôm nay đến trước kỳ lương nên sẽ chưa trừ vào kỳ lương này.
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label
                        htmlFor={`fixed-amt-${row.id}`}
                        className="mb-1 block text-base font-medium text-slate-800"
                      >
                        Số tiền cần đóng (VND)
                      </label>
                      <input
                        id={`fixed-amt-${row.id}`}
                        type="text"
                        inputMode="numeric"
                        disabled={loading}
                        value={row.amount}
                        onChange={(e) =>
                          handleChangeFixedRow(row.id, "amount", e.target.value)
                        }
                        placeholder="Ví dụ: 1500000"
                        className={`${inputBaseClass} tabular-nums`}
                      />
                      {rowAmt !== null && rowAmt > 0 ? (
                        <p className="mt-1.5 text-base text-teal-800">
                          Đang nhập:{" "}
                          <span className="font-bold tabular-nums">
                            {formatVnd(rowAmt)}
                          </span>
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={handleAddFixedRow}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-teal-600 bg-teal-50/70 px-4 py-2.5 text-base font-semibold text-teal-900 transition hover:bg-teal-100 active:bg-teal-200 disabled:opacity-60"
          >
            <span aria-hidden="true" className="text-lg leading-none">
              +
            </span>
            <span>Thêm khoản chi cố định</span>
          </button>
        </section>

        {/* Danh sách khoản nợ sắp đến hạn */}
        <section
          aria-labelledby="plan-debts-heading"
          className="space-y-3.5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div>
            <h2
              id="plan-debts-heading"
              className="text-lg font-bold text-slate-900"
            >
              Khoản nợ sắp đến hạn ({debtRows.length})
            </h2>
            <p className="mt-1 text-base leading-relaxed text-slate-600">
              Các kỳ trả góp, nợ người thân hoặc khoản vay sắp tới ngày hẹn trả.
            </p>
          </div>

          {debtRows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-4 text-base leading-relaxed text-slate-600">
              Chưa có khoản nợ nào trong danh sách. Bạn bấm nút bên dưới để thêm từng khoản nợ cần theo dõi hạn trả nhé.
            </div>
          ) : (
            <div className="space-y-3">
              {debtRows.map((row, idx) => {
                const rowAmt = parseVndDigits(row.amount);
                const outsideWindow =
                  Boolean(todayIso) &&
                  isValidIsoDate(row.due) &&
                  (row.due < todayIso ||
                    (isValidIsoDate(nextPayday) && row.due >= nextPayday));

                return (
                  <div
                    key={row.id}
                    className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/90 p-3.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-lg bg-white px-3 py-1 text-base font-bold text-slate-800 ring-1 ring-inset ring-slate-200">
                        Khoản nợ {idx + 1}
                      </span>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleRemoveDebtRow(row.id)}
                        className="min-h-[48px] rounded-xl border border-red-200 bg-white px-3.5 py-2 text-base font-semibold text-red-700 transition hover:bg-red-50 active:bg-red-100 disabled:opacity-60"
                      >
                        Xoá khoản này
                      </button>
                    </div>

                    <div>
                      <label
                        htmlFor={`debt-label-${row.id}`}
                        className="mb-1 block text-base font-medium text-slate-800"
                      >
                        Tên khoản nợ
                      </label>
                      <input
                        id={`debt-label-${row.id}`}
                        type="text"
                        disabled={loading}
                        value={row.label}
                        onChange={(e) =>
                          handleChangeDebtRow(row.id, "label", e.target.value)
                        }
                        placeholder="Ví dụ: Trả góp xe máy"
                        className={inputBaseClass}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`debt-due-${row.id}`}
                        className="mb-1 block text-base font-medium text-slate-800"
                      >
                        Hạn trả
                      </label>
                      <input
                        id={`debt-due-${row.id}`}
                        type="date"
                        disabled={loading}
                        value={row.due}
                        onChange={(e) =>
                          handleChangeDebtRow(row.id, "due", e.target.value)
                        }
                        className={`${inputBaseClass} tabular-nums`}
                      />
                      {outsideWindow ? (
                        <p className="mt-1.5 text-base leading-relaxed text-amber-900">
                          Lưu ý: Hạn trả này nằm ngoài khoảng từ hôm nay đến trước kỳ lương nên sẽ chưa tính vào kỳ lương này.
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label
                        htmlFor={`debt-amt-${row.id}`}
                        className="mb-1 block text-base font-medium text-slate-800"
                      >
                        Số tiền phải trả (VND)
                      </label>
                      <input
                        id={`debt-amt-${row.id}`}
                        type="text"
                        inputMode="numeric"
                        disabled={loading}
                        value={row.amount}
                        onChange={(e) =>
                          handleChangeDebtRow(row.id, "amount", e.target.value)
                        }
                        placeholder="Ví dụ: 900000"
                        className={`${inputBaseClass} tabular-nums`}
                      />
                      {rowAmt !== null && rowAmt > 0 ? (
                        <p className="mt-1.5 text-base text-teal-800">
                          Đang nhập:{" "}
                          <span className="font-bold tabular-nums">
                            {formatVnd(rowAmt)}
                          </span>
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <input
            ref={debtFileInputRef}
            type="file"
            accept={LOAN_FILE_ACCEPT}
            onChange={(e) => {
              void handleDebtContractUpload(e);
            }}
            className="sr-only"
            aria-label="Tải ảnh, PDF hoặc Word hợp đồng vay để tự điền khoản nợ"
          />

          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={loading || debtUploadLoading}
              onClick={() => debtFileInputRef.current?.click()}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 active:bg-teal-900 disabled:opacity-60"
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
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>
                {debtUploadLoading
                  ? "Đang đọc hợp đồng để điền tự động..."
                  : "Tải hợp đồng (ảnh / PDF / Word) để tự điền"}
              </span>
            </button>

            <button
              type="button"
              disabled={loading || debtUploadLoading}
              onClick={handleAddDebtRow}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-teal-600 bg-teal-50/70 px-4 py-2.5 text-sm font-semibold text-teal-900 transition hover:bg-teal-100 active:bg-teal-200 disabled:opacity-60"
            >
              <span aria-hidden="true" className="text-lg leading-none">
                +
              </span>
              <span>Hoặc tự thêm khoản nợ thủ công</span>
            </button>
          </div>

          {debtUploadNotice ? (
            <p
              role="status"
              aria-live="polite"
              className="rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-2.5 text-sm font-medium text-teal-950"
            >
              {debtUploadNotice}
            </p>
          ) : null}

          {debtUploadError ? (
            <p
              role="alert"
              className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-sm font-medium text-amber-950"
            >
              {debtUploadError}
            </p>
          ) : null}
        </section>

        {validationError ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-base font-medium leading-relaxed text-red-900"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 h-5 w-5 shrink-0 text-red-700"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
            <span>{validationError}</span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <span
                aria-hidden="true"
                className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
              />
              <span>Đang tính kế hoạch cho bạn...</span>
            </>
          ) : (
            <span>Tính mức chi tiêu an toàn hôm nay</span>
          )}
        </button>
      </form>

      {/* Vùng hiển thị Loading / Lỗi / Kết quả dự báo */}
      <div ref={resultSectionRef} className="scroll-mt-20 space-y-5">
        {loading ? (
          <LoadingState
            title="Đang tính mức chi tiêu an toàn hôm nay..."
            hint="AnTâm đang đối chiếu tiền hiện có, các khoản sắp tới hạn và số ngày còn lại tới kỳ lương của bạn."
          />
        ) : null}

        {!loading && apiError ? (
          <ErrorState
            title="Chưa tính được kế hoạch lúc này"
            message={apiError}
            onRetry={handleRetry}
            retryLabel="Thử tính lại ngay"
          />
        ) : null}

        {!loading && !apiError && result ? (
          <div className="space-y-5">
            {isDirtyAfterResult ? (
              <div
                role="status"
                aria-live="polite"
                className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-base font-medium leading-relaxed text-amber-950"
              >
                Bạn vừa chỉnh lại số liệu ở trên. Bấm lại nút{" "}
                <strong>&ldquo;Tính mức chi tiêu an toàn hôm nay&rdquo;</strong>{" "}
                để cập nhật kết quả mới nhé.
              </div>
            ) : null}

            {/* Thẻ nổi bật nhất: Hôm nay bạn được tiêu an toàn */}
            {result.spendable_today > 0 ? (
              <section
                aria-labelledby="spendable-heading"
                className="rounded-3xl border-2 border-teal-500 bg-gradient-to-br from-teal-50 via-white to-emerald-50/80 p-5 shadow-sm"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-300 bg-white px-3 py-1 text-base font-semibold text-teal-900">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 rounded-full bg-teal-600"
                  />
                  <span className="tabular-nums">
                    Còn {result.days_until_payday} ngày tới kỳ nhận lương
                  </span>
                </div>

                <h2
                  id="spendable-heading"
                  className="mt-3 text-lg font-bold text-slate-800"
                >
                  Hôm nay bạn được tiêu an toàn
                </h2>

                <p className="mt-1.5 text-3xl font-extrabold tracking-tight text-teal-900 tabular-nums sm:text-4xl">
                  {formatVnd(result.spendable_today)}
                </p>

                <p className="mt-2.5 text-base leading-relaxed text-slate-700">
                  Đây là mức chi tiêu tối đa trong ngày hôm nay sau khi đã chừa riêng tiền cho các khoản cố định, nợ đến hạn và quỹ dự phòng trước ngày lương.
                </p>
              </section>
            ) : (
              <section
                aria-labelledby="spendable-warning-heading"
                className="rounded-3xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 via-orange-50/80 to-rose-50/80 p-5 shadow-sm"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-white px-3 py-1 text-base font-semibold text-amber-950">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 rounded-full bg-amber-600"
                  />
                  <span className="tabular-nums">
                    Còn {result.days_until_payday} ngày tới kỳ nhận lương
                  </span>
                </div>

                <h2
                  id="spendable-warning-heading"
                  className="mt-3 text-lg font-bold text-amber-950"
                >
                  Hôm nay bạn được tiêu an toàn
                </h2>

                <p className="mt-1.5 text-3xl font-extrabold tracking-tight text-rose-900 tabular-nums sm:text-4xl">
                  {formatVnd(result.spendable_today)}
                </p>

                <p className="mt-2.5 text-base leading-relaxed text-amber-950">
                  Tiền hiện có chưa đủ bù hết các khoản sắp phải đóng và quỹ dự phòng trước ngày lương. Hôm nay bạn nên giữ chặt tiền mặt cho nhu cầu ăn uống, thuốc men tối cần thiết và chủ động thương lượng xin lùi hạn đóng sớm nhé.
                </p>
              </section>
            )}

            {/* Khối Cảnh báo thiếu tiền trước hạn */}
            {result.shortfalls.length === 0 ? (
              <section
                aria-labelledby="shortfalls-safe-heading"
                className="rounded-2xl border border-emerald-300 bg-emerald-50/90 p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white"
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
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2
                      id="shortfalls-safe-heading"
                      className="text-lg font-bold text-emerald-950"
                    >
                      Chưa thấy khoản nợ nào bị hụt trước hạn
                    </h2>
                    <p className="mt-1.5 text-base leading-relaxed text-emerald-950/90">
                      Với tốc độ chi sinh hoạt hiện tại, số tiền trong tay bạn vẫn kịp trang trải các khoản nợ đã liệt kê trước ngày hẹn.
                    </p>
                  </div>
                </div>
              </section>
            ) : (
              <section
                aria-labelledby="shortfalls-alert-heading"
                className="space-y-4 rounded-2xl border border-amber-400 bg-amber-50/90 p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white"
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
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                      <path d="M12 9v4" />
                      <path d="M12 17h.01" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2
                      id="shortfalls-alert-heading"
                      className="text-lg font-bold text-amber-950"
                    >
                      Cảnh báo thiếu tiền trước hạn trả nợ
                    </h2>
                    <p className="mt-1 text-base leading-relaxed text-amber-950/90">
                      Theo mức chi hằng ngày và các khoản cố định phải đóng trước đó, dự kiến bạn sẽ bị thiếu tiền ở các mốc sau:
                    </p>
                  </div>
                </div>

                <ul className="space-y-3">
                  {result.shortfalls.map((shortfall, idx) => (
                    <li
                      key={`${shortfall.debt_label}-${shortfall.due}-${idx}`}
                      className="rounded-xl border border-amber-300 bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-base font-bold text-slate-900">
                          {shortfall.debt_label}
                        </span>
                        <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-base font-semibold text-amber-950 tabular-nums">
                          Hạn: {formatIsoDateVi(shortfall.due)}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2 border-t border-slate-100 pt-2">
                        <span className="text-base text-slate-700">
                          Dự kiến còn thiếu:
                        </span>
                        <span className="text-lg font-extrabold text-rose-800 tabular-nums">
                          {formatVnd(shortfall.missing)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/need"
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-center text-base font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-900"
                >
                  <span>Tìm cách lùi hạn hoặc xoay xở an toàn →</span>
                </Link>
              </section>
            )}

            {/* Khối Hướng dẫn thứ tự ưu tiên khi tiền không đủ (§5.3) */}
            <section
              aria-labelledby="priority-guide-heading"
              className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div>
                <h2
                  id="priority-guide-heading"
                  className="text-lg font-bold text-slate-900"
                >
                  Thứ tự ưu tiên khi tiền trong tay chưa đủ
                </h2>
                <p className="mt-1 text-base leading-relaxed text-slate-600">
                  Khi nhiều khoản dồn cùng lúc, bạn bình tĩnh giữ theo 4 bước ưu tiên này để bảo vệ gia đình mình:
                </p>
              </div>

              <ol className="space-y-3">
                {PRIORITY_STEPS.map((item) => (
                  <li
                    key={item.step}
                    className="flex items-start gap-3.5 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-700 text-base font-bold text-white tabular-nums"
                    >
                      {item.step}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold leading-snug text-slate-900">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-base leading-relaxed text-slate-700">
                        {item.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="flex flex-col gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    formTopRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                  className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-800 transition hover:bg-slate-50 active:bg-slate-100"
                >
                  Chỉnh lại các con số bên trên
                </button>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}

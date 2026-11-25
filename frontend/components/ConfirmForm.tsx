"use client";

import { useEffect, useRef, useState } from "react";
import type { ConfirmedLoan, Installment, LoanTerms } from "@/lib/api";
import { formatVnd } from "@/lib/format";

export type ConfirmFormProps = {
  initialTerms?: LoanTerms | null;
  lowConfidenceFields?: string[];
  submitLabel?: string;
  loading?: boolean;
  onSubmit: (loan: ConfirmedLoan) => void;
  onBack?: () => void;
  backLabel?: string;
};

type ScheduleRow = {
  id: string;
  on: string;
  amount: string;
};

function sanitizeDigits(raw: string): string {
  return raw.replace(/[^\d]/g, "");
}

function parseVndDigits(raw: string): number | null {
  const digits = sanitizeDigits(raw);
  if (!digits) {
    return null;
  }
  const num = Number(digits);
  if (!Number.isSafeInteger(num)) {
    return null;
  }
  return num;
}

function parseNonNegativeDecimal(raw: string): number | null {
  const normalized = raw.trim().replace(",", ".");
  if (!normalized) {
    return null;
  }
  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return Number.NaN;
  }
  const num = Number(normalized);
  if (!Number.isFinite(num) || num < 0) {
    return Number.NaN;
  }
  return num;
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

export function ConfirmForm({
  initialTerms,
  lowConfidenceFields = [],
  submitLabel = "Xem kết quả kiểm tra",
  loading = false,
  onSubmit,
  onBack,
  backLabel = "Quay lại",
}: ConfirmFormProps) {
  const nextRowId = useRef(1);

  const makeRowId = (): string => {
    const id = `row-${nextRowId.current}`;
    nextRowId.current += 1;
    return id;
  };

  const [lenderName, setLenderName] = useState<string>(
    () => initialTerms?.lender_name?.value ?? "",
  );
  const [amountReceived, setAmountReceived] = useState<string>(() =>
    initialTerms?.amount_received?.value != null
      ? String(initialTerms.amount_received.value)
      : "",
  );
  const [disbursedDate, setDisbursedDate] = useState<string>(
    () => initialTerms?.disbursed_date?.value ?? "",
  );
  const [schedule, setSchedule] = useState<ScheduleRow[]>(() => {
    if (initialTerms?.schedule && initialTerms.schedule.length > 0) {
      return initialTerms.schedule.map((item, idx) => ({
        id: `init-${idx}`,
        on: item.on,
        amount: String(item.amount),
      }));
    }
    return [{ id: "init-0", on: "", amount: "" }];
  });

  const [rateStatedPctYear, setRateStatedPctYear] = useState<string>(() =>
    initialTerms?.rate_stated_pct_year?.value != null
      ? String(initialTerms.rate_stated_pct_year.value)
      : "",
  );
  const [extensionFee, setExtensionFee] = useState<string>(() =>
    initialTerms?.extension_fee?.value != null
      ? String(initialTerms.extension_fee.value)
      : "",
  );
  const [latePenaltyPctPerDay, setLatePenaltyPctPerDay] = useState<string>(() =>
    initialTerms?.late_penalty_pct_per_day?.value != null
      ? String(initialTerms.late_penalty_pct_per_day.value)
      : "",
  );

  const [dataAccessContacts, setDataAccessContacts] = useState<boolean>(
    () => initialTerms?.data_access_contacts ?? false,
  );
  const [requiresUpfrontPayment, setRequiresUpfrontPayment] = useState<boolean>(
    () => initialTerms?.requires_upfront_payment ?? false,
  );
  const [thirdPartyCollection, setThirdPartyCollection] = useState<boolean>(false);
  const [hasRateAndMethod, setHasRateAndMethod] = useState<boolean>(true);

  const [validationError, setValidationError] = useState<string | null>(null);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setLenderName(initialTerms?.lender_name?.value ?? "");
    setAmountReceived(
      initialTerms?.amount_received?.value != null
        ? String(initialTerms.amount_received.value)
        : "",
    );
    setDisbursedDate(initialTerms?.disbursed_date?.value ?? "");
    if (initialTerms?.schedule && initialTerms.schedule.length > 0) {
      setSchedule(
        initialTerms.schedule.map((item) => ({
          id: makeRowId(),
          on: item.on,
          amount: String(item.amount),
        })),
      );
    } else {
      setSchedule([{ id: makeRowId(), on: "", amount: "" }]);
    }
    setRateStatedPctYear(
      initialTerms?.rate_stated_pct_year?.value != null
        ? String(initialTerms.rate_stated_pct_year.value)
        : "",
    );
    setExtensionFee(
      initialTerms?.extension_fee?.value != null
        ? String(initialTerms.extension_fee.value)
        : "",
    );
    setLatePenaltyPctPerDay(
      initialTerms?.late_penalty_pct_per_day?.value != null
        ? String(initialTerms.late_penalty_pct_per_day.value)
        : "",
    );
    setDataAccessContacts(initialTerms?.data_access_contacts ?? false);
    setRequiresUpfrontPayment(initialTerms?.requires_upfront_payment ?? false);
    setThirdPartyCollection(false);
    setHasRateAndMethod(true);
    setValidationError(null);
  }, [initialTerms]);

  const lowSet = new Set(lowConfidenceFields);
  const isLow = (field: string): boolean => lowSet.has(field);

  const inputClass = (low: boolean): string =>
    low
      ? "min-h-[48px] w-full rounded-xl border-2 border-amber-500 bg-amber-50 px-3.5 py-2.5 text-base text-slate-900 focus:border-amber-600 focus:outline-none"
      : "min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 focus:border-teal-700 focus:outline-none";

  const handleAddRow = () => {
    setSchedule((prev) => [...prev, { id: makeRowId(), on: "", amount: "" }]);
  };

  const handleRemoveRow = (id: string) => {
    setSchedule((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  };

  const handleRowChange = (id: string, field: "on" | "amount", value: string) => {
    setSchedule((prev) =>
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedLender = lenderName.trim();
    if (!trimmedLender) {
      setValidationError("Bạn điền tên app hoặc bên cho vay giúp AnTâm nhé.");
      return;
    }

    const parsedReceived = parseVndDigits(amountReceived);
    if (parsedReceived === null || parsedReceived <= 0) {
      setValidationError("Bạn nhập số tiền thực nhận về tay lớn hơn 0 đ nhé.");
      return;
    }

    if (!isValidIsoDate(disbursedDate)) {
      setValidationError("Bạn chọn ngày nhận tiền hợp lệ nhé.");
      return;
    }

    if (schedule.length === 0) {
      setValidationError("Cần có ít nhất 1 kỳ trả tiền.");
      return;
    }

    const parsedSchedule: Installment[] = [];
    for (let i = 0; i < schedule.length; i += 1) {
      const row = schedule[i];
      const labelIdx = schedule.length > 1 ? ` (kỳ ${i + 1})` : "";
      if (!isValidIsoDate(row.on)) {
        setValidationError(`Bạn chọn ngày phải trả hợp lệ${labelIdx} nhé.`);
        return;
      }
      if (row.on <= disbursedDate) {
        setValidationError(
          `Ngày phải trả${labelIdx} cần sau ngày nhận tiền (${disbursedDate}).`,
        );
        return;
      }
      const amt = parseVndDigits(row.amount);
      if (amt === null || amt <= 0) {
        setValidationError(`Bạn nhập số tiền phải trả lớn hơn 0 đ${labelIdx} nhé.`);
        return;
      }
      parsedSchedule.push({ on: row.on, amount: amt });
    }

    const parsedRate = parseNonNegativeDecimal(rateStatedPctYear);
    if (parsedRate !== null && Number.isNaN(parsedRate)) {
      setValidationError(
        "Lãi suất ghi trên hợp đồng chưa đúng định dạng số (ví dụ: 20 hoặc 18,5).",
      );
      return;
    }

    let parsedExtFee: number | null = null;
    if (extensionFee.trim().length > 0) {
      const extVal = parseVndDigits(extensionFee);
      if (extVal === null || extVal < 0) {
        setValidationError("Phí mỗi lần gia hạn chưa hợp lệ.");
        return;
      }
      parsedExtFee = extVal;
    }

    const parsedLatePenalty = parseNonNegativeDecimal(latePenaltyPctPerDay);
    if (parsedLatePenalty !== null && Number.isNaN(parsedLatePenalty)) {
      setValidationError(
        "Mức phạt quá hạn mỗi ngày chưa đúng định dạng số (ví dụ: 1 hoặc 0,5).",
      );
      return;
    }

    const payload: ConfirmedLoan = {
      lender_name: trimmedLender,
      amount_received: parsedReceived,
      disbursed_date: disbursedDate,
      schedule: parsedSchedule,
      rate_stated_pct_year: parsedRate,
      extension_fee: parsedExtFee,
      late_penalty_pct_per_day: parsedLatePenalty,
      data_access_contacts: dataAccessContacts,
      requires_upfront_payment: requiresUpfrontPayment,
      third_party_collection: thirdPartyCollection,
      has_rate_and_method: hasRateAndMethod,
    };

    onSubmit(payload);
  };

  const principalStated = initialTerms?.principal_stated?.value;
  const fees = initialTerms?.fees ?? [];
  const previewReceived = parseVndDigits(amountReceived);
  const previewExtFee = parseVndDigits(extensionFee);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {lowConfidenceFields.length > 0 ? (
        <div className="rounded-2xl border border-amber-400 bg-amber-50 p-4 text-base leading-relaxed text-amber-950">
          Có vài chỗ trên ảnh hơi mờ nên đã được tô vàng. Bạn đối chiếu và sửa lại nếu chưa đúng nhé.
        </div>
      ) : null}

      {principalStated != null ? (
        <div
          className={`rounded-2xl p-4 text-base ${
            isLow("principal_stated")
              ? "border-2 border-amber-500 bg-amber-50 text-amber-950"
              : "border border-slate-200 bg-slate-100 text-slate-800"
          }`}
        >
          <div className="font-semibold">
            Số tiền ghi trên hợp đồng: {formatVnd(principalStated)}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">
            Thông tin này để bạn đối chiếu. Ở ô bên dưới, bạn nhớ nhập đúng số tiền thực tế nhận về tay nhé.
          </p>
          {isLow("principal_stated") ? (
            <p className="mt-1.5 text-sm font-medium text-amber-900">
              Chữ hơi mờ — bạn kiểm tra kỹ ô này nhé
            </p>
          ) : null}
        </div>
      ) : null}

      {fees.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">
            Các khoản phí đọc được trên hợp đồng
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Chỉ dùng để bạn đối chiếu, hệ thống không tự cộng hay trừ vào số tiền bên dưới.
          </p>
          <ul className="mt-3 space-y-2">
            {fees.map((fee, idx) => {
              const feeLow = isLow(`fees.${fee.name}`);
              return (
                <li
                  key={`${fee.name}-${idx}`}
                  className={`rounded-xl p-3 text-base ${
                    feeLow
                      ? "border-2 border-amber-500 bg-amber-50 text-amber-950"
                      : "border border-slate-200 bg-slate-50 text-slate-800"
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium">{fee.name}</span>
                    <span className="font-semibold">{formatVnd(fee.amount)}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
                    <span>
                      {fee.deducted_upfront
                        ? "Trừ trước khi nhận tiền"
                        : "Thu sau / tính vào kỳ trả"}
                    </span>
                    {feeLow ? (
                      <span className="rounded-full bg-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-950">
                        Cần kiểm tra lại
                      </span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Thông tin khoản vay</h3>

        <div>
          <label
            htmlFor="cf-lender-name"
            className="mb-1.5 block text-base font-medium text-slate-900"
          >
            1. Tên app hoặc bên cho vay <span className="text-red-600">*</span>
          </label>
          <input
            id="cf-lender-name"
            type="text"
            value={lenderName}
            onChange={(e) => setLenderName(e.target.value)}
            placeholder="Ví dụ: XanhCash, Công ty tài chính..."
            className={inputClass(isLow("lender_name"))}
          />
          {isLow("lender_name") ? (
            <p className="mt-1.5 text-sm font-medium text-amber-900">
              Chữ hơi mờ — bạn kiểm tra kỹ ô này nhé
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="cf-amount-received"
            className="mb-1.5 block text-base font-medium text-slate-900"
          >
            2. Số tiền thực nhận về tay (VND) <span className="text-red-600">*</span>
          </label>
          <input
            id="cf-amount-received"
            type="text"
            inputMode="numeric"
            value={amountReceived}
            onChange={(e) => setAmountReceived(sanitizeDigits(e.target.value))}
            placeholder="Ví dụ: 3000000"
            className={inputClass(isLow("amount_received"))}
          />
          {previewReceived !== null && previewReceived > 0 ? (
            <p className="mt-1 text-sm text-teal-800">
              Số tiền đang nhập: <span className="font-semibold">{formatVnd(previewReceived)}</span>
            </p>
          ) : null}
          {isLow("amount_received") ? (
            <p className="mt-1.5 text-sm font-medium text-amber-900">
              Chữ hơi mờ — bạn kiểm tra kỹ ô này nhé
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="cf-disbursed-date"
            className="mb-1.5 block text-base font-medium text-slate-900"
          >
            3. Ngày nhận tiền <span className="text-red-600">*</span>
          </label>
          <input
            id="cf-disbursed-date"
            type="date"
            value={disbursedDate}
            onChange={(e) => setDisbursedDate(e.target.value)}
            className={inputClass(isLow("disbursed_date"))}
          />
          {isLow("disbursed_date") ? (
            <p className="mt-1.5 text-sm font-medium text-amber-900">
              Chữ hơi mờ — bạn kiểm tra kỹ ô này nhé
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            4. Lịch phải trả tiền <span className="text-red-600">*</span>
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Ghi từng lần phải đóng tiền (cả gốc lẫn lãi/phí mà bên cho vay yêu cầu).
          </p>
          {isLow("schedule") ? (
            <p className="mt-1.5 text-sm font-medium text-amber-900">
              Chữ hơi mờ — bạn kiểm tra kỹ ô này nhé
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          {schedule.map((row, idx) => {
            const rowPreview = parseVndDigits(row.amount);
            return (
              <div
                key={row.id}
                className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base font-semibold text-slate-800">
                    Kỳ trả {idx + 1}
                  </span>
                  {schedule.length >= 2 ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(row.id)}
                      className="min-h-[48px] rounded-xl border border-red-200 bg-white px-3.5 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 active:bg-red-100"
                    >
                      Xoá
                    </button>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor={`cf-sched-date-${row.id}`}
                    className="mb-1 block text-base font-medium text-slate-800"
                  >
                    Ngày phải trả
                  </label>
                  <input
                    id={`cf-sched-date-${row.id}`}
                    type="date"
                    value={row.on}
                    onChange={(e) => handleRowChange(row.id, "on", e.target.value)}
                    className={inputClass(isLow("schedule"))}
                  />
                </div>

                <div>
                  <label
                    htmlFor={`cf-sched-amt-${row.id}`}
                    className="mb-1 block text-base font-medium text-slate-800"
                  >
                    Số tiền phải trả (VND)
                  </label>
                  <input
                    id={`cf-sched-amt-${row.id}`}
                    type="text"
                    inputMode="numeric"
                    value={row.amount}
                    onChange={(e) => handleRowChange(row.id, "amount", e.target.value)}
                    placeholder="Ví dụ: 4200000"
                    className={inputClass(isLow("schedule"))}
                  />
                  {rowPreview !== null && rowPreview > 0 ? (
                    <p className="mt-1 text-sm text-teal-800">
                      Số tiền đang nhập:{" "}
                      <span className="font-semibold">{formatVnd(rowPreview)}</span>
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleAddRow}
          className="min-h-[48px] w-full rounded-xl border border-dashed border-teal-600 bg-teal-50 px-4 py-2.5 text-base font-semibold text-teal-800 transition hover:bg-teal-100 active:bg-teal-200"
        >
          + Thêm kỳ trả
        </button>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            5. Thông tin thêm (nếu bạn biết)
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Không bắt buộc — nếu không rõ bạn có thể để trống.
          </p>
        </div>

        <div>
          <label
            htmlFor="cf-rate-year"
            className="mb-1.5 block text-base font-medium text-slate-900"
          >
            Lãi suất ghi trên hợp đồng (%/năm)
          </label>
          <input
            id="cf-rate-year"
            type="text"
            inputMode="decimal"
            value={rateStatedPctYear}
            onChange={(e) => setRateStatedPctYear(e.target.value)}
            placeholder="Để trống nếu không rõ (nhập 0 nếu ghi 0%)"
            className={inputClass(isLow("rate_stated_pct_year"))}
          />
          {isLow("rate_stated_pct_year") ? (
            <p className="mt-1.5 text-sm font-medium text-amber-900">
              Chữ hơi mờ — bạn kiểm tra kỹ ô này nhé
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="cf-extension-fee"
            className="mb-1.5 block text-base font-medium text-slate-900"
          >
            Phí mỗi lần gia hạn (VND)
          </label>
          <input
            id="cf-extension-fee"
            type="text"
            inputMode="numeric"
            value={extensionFee}
            onChange={(e) => setExtensionFee(sanitizeDigits(e.target.value))}
            placeholder="Để trống nếu không có"
            className={inputClass(isLow("extension_fee"))}
          />
          {previewExtFee !== null && previewExtFee > 0 ? (
            <p className="mt-1 text-sm text-teal-800">
              Số tiền đang nhập:{" "}
              <span className="font-semibold">{formatVnd(previewExtFee)}</span>
            </p>
          ) : null}
          {isLow("extension_fee") ? (
            <p className="mt-1.5 text-sm font-medium text-amber-900">
              Chữ hơi mờ — bạn kiểm tra kỹ ô này nhé
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="cf-late-penalty"
            className="mb-1.5 block text-base font-medium text-slate-900"
          >
            Phạt quá hạn mỗi ngày (%/ngày)
          </label>
          <input
            id="cf-late-penalty"
            type="text"
            inputMode="decimal"
            value={latePenaltyPctPerDay}
            onChange={(e) => setLatePenaltyPctPerDay(e.target.value)}
            placeholder="Ví dụ: 1 hoặc 0,5"
            className={inputClass(isLow("late_penalty_pct_per_day"))}
          />
          {isLow("late_penalty_pct_per_day") ? (
            <p className="mt-1.5 text-sm font-medium text-amber-900">
              Chữ hơi mờ — bạn kiểm tra kỹ ô này nhé
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          6. Dấu hiệu đi kèm (chạm để đánh dấu nếu có)
        </h3>

        <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 text-base text-slate-900 hover:bg-slate-50">
          <input
            type="checkbox"
            checked={dataAccessContacts}
            onChange={(e) => setDataAccessContacts(e.target.checked)}
            className="h-5 w-5 shrink-0 accent-teal-700"
          />
          <span>App đòi quyền truy cập Danh bạ hoặc số người thân</span>
        </label>

        <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 text-base text-slate-900 hover:bg-slate-50">
          <input
            type="checkbox"
            checked={requiresUpfrontPayment}
            onChange={(e) => setRequiresUpfrontPayment(e.target.checked)}
            className="h-5 w-5 shrink-0 accent-teal-700"
          />
          <span>Đòi nộp tiền phí hoặc đặt cọc trước mới giải ngân</span>
        </label>

        <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 text-base text-slate-900 hover:bg-slate-50">
          <input
            type="checkbox"
            checked={thirdPartyCollection}
            onChange={(e) => setThirdPartyCollection(e.target.checked)}
            className="h-5 w-5 shrink-0 accent-teal-700"
          />
          <span>Có bên thứ ba gọi đòi nợ hoặc đe doạ</span>
        </label>

        <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 text-base text-slate-900 hover:bg-slate-50">
          <input
            type="checkbox"
            checked={hasRateAndMethod}
            onChange={(e) => setHasRateAndMethod(e.target.checked)}
            className="h-5 w-5 shrink-0 accent-teal-700"
          />
          <span>Hợp đồng có ghi rõ lãi suất và cách tính lãi</span>
        </label>
      </div>

      {validationError ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-300 bg-red-50 p-4 text-base font-medium leading-relaxed text-red-900"
        >
          {validationError}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="min-h-[52px] w-full rounded-xl bg-teal-700 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Đang xử lý, bạn đợi chút nhé..." : submitLabel}
        </button>

        {onBack ? (
          <button
            type="button"
            disabled={loading}
            onClick={onBack}
            className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 active:bg-slate-100 disabled:opacity-60"
          >
            {backLabel}
          </button>
        ) : null}
      </div>
    </form>
  );
}

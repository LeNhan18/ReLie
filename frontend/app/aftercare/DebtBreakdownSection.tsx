import {
  formatIsoDateVi,
  formatVnd,
  type AftercareResult,
  type ConfirmedLoan,
} from "@/lib/api";

export type DebtBreakdownSectionProps = {
  result: AftercareResult;
  lastLoan: ConfirmedLoan | null;
};

function getLicenseShortLabel(status: string): string {
  if (status === "credit_institution") return "Tổ chức tín dụng có giấy phép";
  if (status === "ambiguous") return "Cần đối chiếu kỹ tên pháp nhân";
  return "Chưa có trong danh sách cấp phép NHNN";
}

export function DebtBreakdownSection({
  result,
  lastLoan,
}: DebtBreakdownSectionProps) {
  const hasExcessAlert = result.excess_applies && result.excess_charge > 0;

  return (
    <div className="space-y-3.5">
      {/* Bảng 3 con số tách nợ gọn trong 1 thẻ sạch */}
      <section
        aria-label="Ba con số tách nợ"
        className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-slate-900">
              {lastLoan?.lender_name || "Khoản vay đã nhận"}
            </div>
            <div className="text-xs text-slate-500">
              {getLicenseShortLabel(result.lender_status)}
              {lastLoan?.disbursed_date
                ? ` · Giải ngân ${formatIsoDateVi(lastLoan.disbursed_date)}`
                : ""}
            </div>
          </div>
        </div>

        <dl className="divide-y divide-slate-100 px-4">
          <div className="flex items-baseline justify-between gap-3 py-3">
            <div>
              <dt className="text-sm font-semibold text-slate-800">1. Gốc thực nhận</dt>
              <p className="text-xs text-slate-500">Số tiền thực tế vào tay</p>
            </div>
            <dd data-numeric="true" className="text-lg font-bold text-teal-800 tabular-nums">
              {formatVnd(result.principal_received)}
            </dd>
          </div>

          <div className="flex items-baseline justify-between gap-3 py-3">
            <div>
              <dt className="text-sm font-semibold text-slate-800">
                2. {result.excess_applies ? "Lãi trong trần dân sự" : "Lãi & phí hợp đồng"}
              </dt>
              <p className="text-xs text-slate-500">
                {result.excess_applies ? "Ước tính trần 20%/năm (BLDS)" : "Không áp trần 20%/năm"}
              </p>
            </div>
            <dd data-numeric="true" className="text-lg font-bold text-slate-900 tabular-nums">
              {formatVnd(result.lawful_interest)}
            </dd>
          </div>

          <div className="flex items-baseline justify-between gap-3 py-3">
            <div>
              <dt className={`text-sm font-semibold ${hasExcessAlert ? "text-rose-800" : "text-slate-800"}`}>
                3. Khoản thu vượt trần
              </dt>
              <p className="text-xs text-slate-500">
                {hasExcessAlert
                  ? "Có dấu hiệu vượt trần (BLDS 2015, Điều 468)"
                  : "Không có phần vượt trần dân sự"}
              </p>
            </div>
            <dd
              data-numeric="true"
              className={`text-lg font-extrabold tabular-nums ${
                hasExcessAlert ? "text-rose-700" : "text-slate-900"
              }`}
            >
              {formatVnd(result.excess_charge)}
            </dd>
          </div>
        </dl>

        <div className="flex items-baseline justify-between bg-slate-50 px-4 py-3 text-sm">
          <span className="font-medium text-slate-600">Tổng bên cho vay đang đòi</span>
          <span data-numeric="true" className="text-base font-bold text-slate-900 tabular-nums">
            {formatVnd(result.total_demanded)}
          </span>
        </div>
      </section>

      {/* Nguyên tắc thoát vòng xoáy gia hạn — 1 dòng rõ trọng tâm */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm leading-snug text-amber-950">
        <strong className="font-semibold">Lưu ý quan trọng:</strong> Phí gia hạn không trừ vào gốc — tuyệt đối không vay app mới để trả app cũ.
      </div>

      {result.note.trim().length > 0 ? (
        <p className="px-1 text-xs leading-relaxed text-slate-500">{result.note}</p>
      ) : null}
    </div>
  );
}

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

function getLenderStatusDisplay(status: string): {
  label: string;
  detail: string;
  badgeClass: string;
  tone: "licensed" | "unverified";
} {
  if (status === "credit_institution") {
    return {
      label: "Có trong danh sách tổ chức tín dụng được cấp phép",
      detail:
        "Hoạt động theo quy định của Ngân hàng Nhà nước và Luật Các tổ chức tín dụng.",
      badgeClass: "border-emerald-300 bg-emerald-50 text-emerald-950",
      tone: "licensed",
    };
  }
  if (status === "ambiguous") {
    return {
      label: "Tên gần giống nhiều đơn vị — cần kiểm tra kỹ pháp nhân",
      detail:
        "Nhiều app tự đặt tên gần giống ngân hàng hoặc công ty tài chính. Bạn nên đối chiếu mã số thuế và tên đầy đủ trên hợp đồng.",
      badgeClass: "border-amber-300 bg-amber-50 text-amber-950",
      tone: "unverified",
    };
  }
  return {
    label: "Chưa tìm thấy trong danh sách tổ chức tín dụng được cấp phép",
    detail:
      "Giao dịch vay ngoài tổ chức tín dụng chịu sự điều chỉnh về mức trần lãi suất của Bộ luật Dân sự.",
    badgeClass: "border-amber-300 bg-amber-50 text-amber-950",
    tone: "unverified",
  };
}

export function DebtBreakdownSection({
  result,
  lastLoan,
}: DebtBreakdownSectionProps) {
  const hasExcessAlert = result.excess_applies && result.excess_charge > 0;
  const statusInfo = getLenderStatusDisplay(result.lender_status);
  const confirmedExtFee =
    lastLoan?.extension_fee != null && lastLoan.extension_fee > 0
      ? lastLoan.extension_fee
      : null;

  return (
    <div className="space-y-5">
      {/* Ba con số tách nợ */}
      <section aria-label="Ba con số tách nợ" className="space-y-3.5">
        {/* 1. Tiền gốc thực nhận */}
        <article className="rounded-2xl border border-teal-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3.5">
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-200"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <circle cx="12" cy="12" r="2.5" />
                <path d="M6 12h.01M18 12h.01" />
              </svg>
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-slate-700">
                1. Tiền gốc thực nhận
              </p>
              <p
                data-numeric="true"
                className="mt-1 break-words text-2xl font-bold text-teal-900 tabular-nums"
              >
                {formatVnd(result.principal_received)}
              </p>
              <p className="mt-1.5 text-base leading-relaxed text-slate-700">
                Số tiền thực tế đã chuyển vào tài khoản của bạn sau khi trừ các
                khoản thu trước (nếu có).
              </p>
            </div>
          </div>
        </article>

        {/* 2. Lãi ước tính trong mức trần */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3.5">
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-800 ring-1 ring-inset ring-slate-200"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M12 3v18" />
                <path d="m5 7 7-3 7 3" />
                <path d="m3 13 3-6 3 6a3 3 0 0 1-6 0Z" />
                <path d="m15 13 3-6 3 6a3 3 0 0 1-6 0Z" />
              </svg>
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-slate-700">
                2.{" "}
                {result.excess_applies
                  ? "Lãi ước tính trong mức trần"
                  : "Lãi và phí theo hợp đồng"}
              </p>
              <p
                data-numeric="true"
                className="mt-1 break-words text-2xl font-bold text-slate-900 tabular-nums"
              >
                {formatVnd(result.lawful_interest)}
              </p>
              <p className="mt-1.5 text-base leading-relaxed text-slate-700">
                {result.excess_applies
                  ? "Phần tiền lãi ước tính theo mức trần 20%/năm của Bộ luật Dân sự từ ngày nhận tiền đến ngày hẹn trả."
                  : "Phần chênh lệch lãi và phí theo thoả thuận hợp đồng tại tổ chức tín dụng có giấy phép."}
              </p>
            </div>
          </div>
        </article>

        {/* 3. Khoản thu vượt mức trần */}
        <article
          className={
            hasExcessAlert
              ? "rounded-2xl border-2 border-amber-400 bg-rose-50/90 p-5 shadow-sm"
              : "rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
          }
        >
          <div className="flex items-start gap-3.5">
            <span
              aria-hidden="true"
              className={
                hasExcessAlert
                  ? "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-800 ring-1 ring-inset ring-rose-300"
                  : "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-200"
              }
            >
              {hasExcessAlert ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              )}
            </span>

            <div className="min-w-0 flex-1">
              <p
                className={
                  hasExcessAlert
                    ? "text-base font-semibold text-rose-950"
                    : "text-base font-semibold text-slate-700"
                }
              >
                3. Khoản thu vượt mức trần
              </p>
              <p
                data-numeric="true"
                className={
                  hasExcessAlert
                    ? "mt-1 break-words text-2xl font-bold text-rose-900 tabular-nums"
                    : "mt-1 break-words text-2xl font-bold text-slate-900 tabular-nums"
                }
              >
                {formatVnd(result.excess_charge)}
              </p>
              <p
                className={
                  hasExcessAlert
                    ? "mt-1.5 text-base leading-relaxed text-rose-950"
                    : "mt-1.5 text-base leading-relaxed text-slate-700"
                }
              >
                {!result.excess_applies
                  ? "Tổ chức tín dụng được cấp phép hoạt động theo quy định chuyên ngành nên không áp mức trần 20%/năm của luật dân sự."
                  : result.excess_charge > 0
                    ? "Khoản chênh lệch này có dấu hiệu vượt mức trần lãi suất của luật dân sự (Bộ luật Dân sự 2015, Điều 468). Bạn hãy giữ kỹ sao kê nhận tiền và màn hình lịch trả để bảo vệ quyền lợi hợp pháp khi trao đổi hoặc trình báo."
                    : "Chưa ghi nhận khoản thu có dấu hiệu vượt mức trần lãi suất của luật dân sự."}
              </p>
            </div>
          </div>
        </article>
      </section>

      {/* Đối chiếu tổng đòi, pháp nhân và ghi chú backend */}
      <section
        aria-label="Đối chiếu tổng đòi và giấy phép"
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-base text-slate-600">Bên cho vay bạn vừa nhập</p>
            <p className="mt-0.5 break-words text-lg font-bold text-slate-900">
              {lastLoan?.lender_name || "Chưa ghi tên đơn vị"}
            </p>
          </div>
          {lastLoan?.disbursed_date ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-base text-slate-700">
              <span>Giải ngân: </span>
              <span
                data-numeric="true"
                className="font-semibold text-slate-900 tabular-nums"
              >
                {formatIsoDateVi(lastLoan.disbursed_date)}
              </span>
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-base text-slate-700">
            Tổng số tiền bên cho vay đang yêu cầu đóng
          </p>
          <p
            data-numeric="true"
            className="mt-1 break-words text-2xl font-bold text-slate-900 tabular-nums"
          >
            {formatVnd(result.total_demanded)}
          </p>
        </div>

        <div className="space-y-2 border-t border-slate-100 pt-3.5">
          <p className="text-base font-semibold text-slate-800">
            Đối chiếu danh sách giấy phép tổ chức tín dụng
          </p>
          <div
            className={`rounded-xl border p-3.5 text-base leading-relaxed ${statusInfo.badgeClass}`}
          >
            <p className="font-bold">{statusInfo.label}</p>
            <p className="mt-1 opacity-95">{statusInfo.detail}</p>
          </div>
        </div>

        {result.note.trim().length > 0 ? (
          <div
            aria-label="Ghi chú ước tính"
            className="rounded-xl border border-teal-200 bg-teal-50/80 p-4 text-base leading-relaxed text-teal-950"
          >
            <p className="font-bold">Ghi chú từ hệ thống</p>
            <p className="mt-1">{result.note}</p>
          </div>
        ) : null}
      </section>

      {/* Cảnh báo thoát vòng xoáy gia hạn */}
      <section
        aria-labelledby="anti-rollover-heading"
        className="space-y-3.5 rounded-2xl border-2 border-amber-400 bg-amber-50/95 p-5 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-200 text-amber-950"
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
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
          </span>

          <div className="min-w-0 flex-1">
            <h2
              id="anti-rollover-heading"
              className="text-lg font-bold leading-snug text-amber-950"
            >
              Nguyên tắc sống còn để thoát vòng xoáy gia hạn
            </h2>
            <p className="mt-1.5 rounded-xl border border-amber-300 bg-white px-4 py-3 text-base font-bold leading-relaxed text-slate-900">
              &ldquo;Đóng phí gia hạn thường không làm giảm tiền gốc — tuyệt đối
              không vay app mới để trả phí gia hạn cho app cũ.&rdquo;
            </p>
          </div>
        </div>

        {confirmedExtFee !== null ? (
          <p className="rounded-xl border border-amber-300 bg-amber-100/70 px-4 py-3 text-base leading-relaxed text-amber-950">
            Khoản vay này có ghi phí mỗi lần gia hạn là{" "}
            <span data-numeric="true" className="font-bold tabular-nums">
              {formatVnd(confirmedExtFee)}
            </span>
            . Nếu đóng khoản phí này để lùi ngày, số tiền đó thường mất đi mà phần
            gốc thực nhận{" "}
            <span data-numeric="true" className="font-bold tabular-nums">
              {formatVnd(result.principal_received)}
            </span>{" "}
            vẫn còn nguyên.
          </p>
        ) : null}

        <ul className="space-y-2 text-base leading-relaxed text-amber-950">
          <li className="flex items-start gap-2.5">
            <span
              aria-hidden="true"
              className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-700"
            />
            <span>
              Không bấm vào các đường link &ldquo;hỗ trợ tất toán / giới thiệu app
              mới giải ngân trong 5 phút&rdquo; do nhân viên thu hồi nợ gửi sang, vì
              đó thường là các app cùng một nhóm dẫn tới nợ chồng nợ.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span
              aria-hidden="true"
              className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-700"
            />
            <span>
              Giữ thiện chí thanh toán nghĩa vụ hợp pháp theo khả năng thực tế; mỗi
              lần chuyển trả nhớ ghi rõ nội dung chuyển khoản trả tiền gốc và chụp
              lại biên lai.
            </span>
          </li>
          {statusInfo.tone === "licensed" ? (
            <li className="flex items-start gap-2.5">
              <span
                aria-hidden="true"
                className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-700"
              />
              <span>
                Với tổ chức tín dụng có giấy phép, nếu đang hụt tiền tạm thời, bạn
                nên chủ động gọi tổng đài chính thức sớm để xin cơ cấu lại lịch trả
                thay vì vay nóng bên ngoài đắp vào.
              </span>
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}

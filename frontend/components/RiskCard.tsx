import type { Assessment } from "@/lib/api";
import { formatPct, formatVnd } from "@/lib/format";

export type RiskCardProps = {
  assessment: Assessment;
};

function getRiskMeta(level: Assessment["risk_level"]): {
  label: string;
  headerBg: string;
  aprText: string;
} {
  switch (level) {
    case "red":
      return {
        label: "Rủi ro cao — Cần hết sức thận trọng",
        headerBg: "bg-red-600 text-white",
        aprText: "text-red-700",
      };
    case "yellow":
      return {
        label: "Cần lưu ý kỹ trước khi ký",
        headerBg: "bg-amber-500 text-white",
        aprText: "text-amber-700",
      };
    case "green":
      return {
        label: "Chưa thấy dấu hiệu bất thường",
        headerBg: "bg-emerald-600 text-white",
        aprText: "text-emerald-700",
      };
  }
}

function getLicenseText(status: string): string {
  if (status === "credit_institution") {
    return "Có trong danh sách NHNN cấp phép";
  }
  if (status === "ambiguous") {
    return "Tên gần giống nhiều đơn vị — cần kiểm tra kỹ";
  }
  return "Chưa có trong danh sách tổ chức được cấp phép";
}

function getScenarioShortLabel(key: string): string {
  if (key === "gia_han_0_lan") return "Đúng hạn";
  if (key === "gia_han_1_lan") return "Gia hạn 1 lần";
  if (key === "gia_han_2_lan") return "Gia hạn 2 lần";
  const match = /^gia_han_(\d+)_lan$/.exec(key);
  return match ? `Gia hạn ${match[1]} lần` : key;
}

export function RiskCard({ assessment }: RiskCardProps) {
  const meta = getRiskMeta(assessment.risk_level);
  const scenarioEntries = Object.entries(assessment.scenarios);

  return (
    <div className="space-y-3.5">
      {/* 1. Thẻ kết luận + 4 con số cốt lõi */}
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
        <div className={`px-4 py-3 ${meta.headerBg}`}>
          <div className="text-base font-bold leading-snug">{meta.label}</div>
          <div className="mt-0.5 text-xs opacity-95">
            Giấy phép: {getLicenseText(assessment.lender_status)}
          </div>
        </div>

        <div className="space-y-3.5 p-4">
          <dl className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-slate-50 px-3 py-2.5">
              <dt className="text-xs font-medium text-slate-500">Thực nhận</dt>
              <dd className="mt-0.5 text-base font-bold text-slate-900 tabular-nums">
                {formatVnd(assessment.amount_received)}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2.5">
              <dt className="text-xs font-medium text-slate-500">Tổng phải trả</dt>
              <dd className="mt-0.5 text-base font-bold text-slate-900 tabular-nums">
                {formatVnd(assessment.total_repaid)}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2.5">
              <dt className="text-xs font-medium text-slate-500">Tổng lãi + phí</dt>
              <dd className="mt-0.5 text-base font-bold text-slate-900 tabular-nums">
                {formatVnd(assessment.total_cost)}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2.5">
              <dt className="text-xs font-medium text-slate-500">Lãi thực / năm</dt>
              <dd className={`mt-0.5 text-base font-extrabold tabular-nums ${meta.aprText}`}>
                {`${formatPct(assessment.apr_simple)}/năm`}
              </dd>
            </div>
          </dl>

          {assessment.explanation ? (
            <p className="border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-700">
              {assessment.explanation}
            </p>
          ) : null}
        </div>
      </section>

      {/* 2. Các dấu hiệu chính kèm căn cứ luật */}
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Dấu hiệu cần lưu ý ({assessment.findings.length})
        </h3>

        {assessment.findings.length === 0 ? (
          <p className="mt-2 text-sm text-emerald-800">
            Chưa ghi nhận dấu hiệu bất thường từ các điều khoản vừa nhập.
          </p>
        ) : (
          <ul className="mt-2.5 divide-y divide-slate-100">
            {assessment.findings.map((f, idx) => {
              const dotClass =
                f.severity === "red"
                  ? "bg-red-600"
                  : f.severity === "yellow"
                    ? "bg-amber-500"
                    : "bg-slate-400";
              return (
                <li key={`${f.rule_id}-${idx}`} className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0">
                  <span aria-hidden="true" className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotClass}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug text-slate-900">
                      {f.message}
                    </p>
                    {f.legal_ref ? (
                      <p className="mt-1 text-xs text-slate-500">
                        Căn cứ: {f.legal_ref}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* 3. Kịch bản gia hạn gọn 1 hàng */}
      {scenarioEntries.length > 0 ? (
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Nếu gia hạn (tổng phải đóng)
          </h3>
          <dl className="mt-2.5 grid grid-cols-3 gap-2">
            {scenarioEntries.map(([key, amount], idx) => (
              <div
                key={key}
                className={`rounded-xl px-2.5 py-2 text-center ${
                  idx >= 1 ? "bg-rose-50 text-rose-900" : "bg-slate-50 text-slate-900"
                }`}
              >
                <dt className="text-xs font-medium opacity-80">
                  {getScenarioShortLabel(key)}
                </dt>
                <dd className="mt-0.5 text-sm font-bold tabular-nums">
                  {formatVnd(amount)}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </div>
  );
}

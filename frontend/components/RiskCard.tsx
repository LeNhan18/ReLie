import type { Assessment } from "@/lib/api";
import { formatPct, formatVnd } from "@/lib/format";

export type RiskCardProps = {
  assessment: Assessment;
};

function getRiskBanner(level: Assessment["risk_level"]): {
  title: string;
  containerClass: string;
  badgeClass: string;
} {
  switch (level) {
    case "red":
      return {
        title: "Cần rất thận trọng — Có nhiều dấu hiệu rủi ro cao",
        containerClass: "border-2 border-red-400 bg-red-50 text-red-950",
        badgeClass: "bg-red-700 text-white",
      };
    case "yellow":
      return {
        title: "Cần lưu ý kỹ trước khi quyết định",
        containerClass: "border-2 border-amber-400 bg-amber-50 text-amber-950",
        badgeClass: "bg-amber-600 text-white",
      };
    case "green":
      return {
        title: "Chưa ghi nhận dấu hiệu bất thường lớn",
        containerClass: "border-2 border-emerald-400 bg-emerald-50 text-emerald-950",
        badgeClass: "bg-emerald-700 text-white",
      };
  }
}

function getLenderStatusLabel(status: string): string {
  if (status === "credit_institution") {
    return "Có trong danh sách tổ chức tín dụng được NHNN cấp phép";
  }
  if (status === "ambiguous") {
    return "Tên gần giống nhiều tổ chức — cần kiểm tra kỹ tên pháp nhân";
  }
  return "Chưa tìm thấy trong danh sách tổ chức tín dụng được cấp phép";
}

function getScenarioLabel(key: string): string {
  if (key === "gia_han_0_lan") {
    return "Không gia hạn (trả đúng hạn)";
  }
  if (key === "gia_han_1_lan") {
    return "Nếu gia hạn 1 lần";
  }
  if (key === "gia_han_2_lan") {
    return "Nếu gia hạn 2 lần";
  }
  const match = /^gia_han_(\d+)_lan$/.exec(key);
  if (match) {
    return `Nếu gia hạn ${match[1]} lần`;
  }
  return key;
}

function getFindingStyle(severity: string): {
  boxClass: string;
  badgeLabel: string;
  badgeClass: string;
} {
  if (severity === "red") {
    return {
      boxClass: "border border-red-300 bg-red-50 text-red-950",
      badgeLabel: "Cảnh báo cao",
      badgeClass: "bg-red-700 text-white",
    };
  }
  if (severity === "yellow") {
    return {
      boxClass: "border border-amber-300 bg-amber-50 text-amber-950",
      badgeLabel: "Cần lưu ý",
      badgeClass: "bg-amber-600 text-white",
    };
  }
  return {
    boxClass: "border border-slate-200 bg-slate-50 text-slate-900",
    badgeLabel: "Thông tin",
    badgeClass: "bg-slate-700 text-white",
  };
}

export function RiskCard({ assessment }: RiskCardProps) {
  const banner = getRiskBanner(assessment.risk_level);
  const scenarioEntries = Object.entries(assessment.scenarios);

  return (
    <div className="space-y-5">
      <section className={`rounded-2xl p-5 shadow-sm ${banner.containerClass}`}>
        <span
          className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${banner.badgeClass}`}
        >
          Kết quả đánh giá
        </span>
        <h2 className="mt-2.5 text-xl font-bold leading-snug">{banner.title}</h2>
        <p className="mt-2 text-base font-medium leading-relaxed">
          Giấy phép: {getLenderStatusLabel(assessment.lender_status)}
        </p>
        {assessment.explanation ? (
          <p className="mt-3 whitespace-pre-line border-t border-current/15 pt-3 text-base leading-relaxed">
            {assessment.explanation}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Con số thực tế của khoản vay</h3>
        <dl className="mt-3 divide-y divide-slate-100 text-base">
          <div className="flex items-baseline justify-between gap-3 py-2.5">
            <dt className="text-slate-700">Tiền thực nhận</dt>
            <dd className="font-semibold text-slate-900">
              {formatVnd(assessment.amount_received)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 py-2.5">
            <dt className="text-slate-700">Tổng phải trả</dt>
            <dd className="font-semibold text-slate-900">
              {formatVnd(assessment.total_repaid)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 py-2.5">
            <dt className="text-slate-700">Tổng chi phí (lãi + phí)</dt>
            <dd className="font-semibold text-slate-900">
              {formatVnd(assessment.total_cost)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 pt-2.5">
            <dt className="text-slate-700">Chi phí thật quy năm</dt>
            <dd className="text-lg font-bold text-teal-800">
              {`${formatPct(assessment.apr_simple)}/năm`}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Các dấu hiệu cần lưu ý</h3>
        {assessment.findings.length === 0 ? (
          <p className="mt-2 text-base leading-relaxed text-slate-700">
            Chưa ghi nhận dấu hiệu bất thường từ các thông tin vừa kiểm tra.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {assessment.findings.map((finding, idx) => {
              const style = getFindingStyle(finding.severity);
              return (
                <li
                  key={`${finding.rule_id}-${idx}`}
                  className={`rounded-xl p-4 ${style.boxClass}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.badgeClass}`}
                    >
                      {style.badgeLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-base leading-relaxed">{finding.message}</p>
                  {finding.legal_ref ? (
                    <p className="mt-2 text-sm font-medium opacity-90">
                      Căn cứ tham chiếu: {finding.legal_ref}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {scenarioEntries.length > 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            Nếu gia hạn thì tổng tiền phải trả sẽ là
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Phí gia hạn thường không trừ vào tiền gốc nên nợ rất dễ đội lên nhanh.
          </p>
          <dl className="mt-3 divide-y divide-slate-100 text-base">
            {scenarioEntries.map(([key, amount]) => (
              <div
                key={key}
                className="flex flex-wrap items-baseline justify-between gap-2 py-2.5"
              >
                <dt className="text-slate-800">{getScenarioLabel(key)}</dt>
                <dd className="font-semibold text-slate-900">{formatVnd(amount)}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </div>
  );
}

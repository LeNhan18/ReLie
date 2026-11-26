import type { Assessment } from "@/lib/api";
import { formatPct, formatVnd } from "@/lib/format";

export type RiskCardProps = {
  assessment: Assessment;
};

type MarketBenchmark = {
  id: string;
  label: string;
  rangeText: string;
  note: string;
  activeCardClass: string;
  activeBadgeClass: string;
  dotClass: string;
};

const MARKET_BENCHMARKS: readonly MarketBenchmark[] = [
  {
    id: "bank",
    label: "Vay ngân hàng",
    rangeText: "~8–15%/năm",
    note: "Mức phổ biến của khoản vay tiêu dùng tại ngân hàng thương mại",
    activeCardClass: "border-2 border-emerald-500 bg-emerald-50/90 text-emerald-950",
    activeBadgeClass: "bg-emerald-700 text-white",
    dotClass: "bg-emerald-600",
  },
  {
    id: "civil_cap",
    label: "Trần luật dân sự",
    rangeText: "20%/năm",
    note: "Mốc trần lãi suất cho vay dân sự ngoài tổ chức tín dụng",
    activeCardClass: "border-2 border-teal-500 bg-teal-50/90 text-teal-950",
    activeBadgeClass: "bg-teal-700 text-white",
    dotClass: "bg-teal-600",
  },
  {
    id: "finance_co",
    label: "Công ty tài chính",
    rangeText: "~25–60%/năm",
    note: "Vay tín chấp tại công ty tài chính được NHNN cấp phép",
    activeCardClass: "border-2 border-amber-500 bg-amber-50/90 text-amber-950",
    activeBadgeClass: "bg-amber-700 text-white",
    dotClass: "bg-amber-500",
  },
  {
    id: "very_high",
    label: "Rủi ro rất cao",
    rangeText: "≥100%/năm",
    note: "Chi phí đội lên rất nhanh, thường gặp ở bẫy phí ẩn / app vay ngắn ngày",
    activeCardClass: "border-2 border-red-500 bg-red-50/90 text-red-950",
    activeBadgeClass: "bg-red-700 text-white",
    dotClass: "bg-red-600",
  },
];

function getMarketBenchmarkIndex(aprSimple: number): 0 | 1 | 2 | 3 {
  if (aprSimple < 16) {
    return 0;
  }
  if (aprSimple < 21) {
    return 1;
  }
  if (aprSimple < 100) {
    return 2;
  }
  return 3;
}

function getRiskBanner(level: Assessment["risk_level"]): {
  badgeText: string;
  title: string;
  containerClass: string;
  badgeClass: string;
  iconBoxClass: string;
  aprTileClass: string;
} {
  switch (level) {
    case "red":
      return {
        badgeText: "Mức cảnh báo cao",
        title: "Cần rất thận trọng — Có nhiều dấu hiệu rủi ro cao",
        containerClass: "border-2 border-red-400 bg-gradient-to-br from-red-50 via-rose-50 to-white text-red-950",
        badgeClass: "bg-red-700 text-white",
        iconBoxClass: "bg-red-100 text-red-800 ring-1 ring-inset ring-red-300",
        aprTileClass: "border-red-300 bg-red-50/80 text-red-950",
      };
    case "yellow":
      return {
        badgeText: "Cần cân nhắc kỹ",
        title: "Cần lưu ý kỹ các khoản phí và điều khoản trước khi ký",
        containerClass: "border-2 border-amber-400 bg-gradient-to-br from-amber-50 via-yellow-50/60 to-white text-amber-950",
        badgeClass: "bg-amber-700 text-white",
        iconBoxClass: "bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-300",
        aprTileClass: "border-amber-300 bg-amber-50/80 text-amber-950",
      };
    case "green":
      return {
        badgeText: "Tương đối an toàn",
        title: "Chưa ghi nhận dấu hiệu bất thường lớn",
        containerClass: "border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white text-emerald-950",
        badgeClass: "bg-emerald-700 text-white",
        iconBoxClass: "bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-300",
        aprTileClass: "border-teal-300 bg-teal-50/80 text-teal-950",
      };
  }
}

function getLenderStatusBadge(status: string): {
  label: string;
  pillClass: string;
} {
  if (status === "credit_institution") {
    return {
      label: "Có trong danh sách tổ chức tín dụng được NHNN cấp phép",
      pillClass: "border-emerald-300 bg-white/90 text-emerald-950",
    };
  }
  if (status === "ambiguous") {
    return {
      label: "Tên gần giống nhiều tổ chức — cần kiểm tra kỹ tên pháp nhân",
      pillClass: "border-amber-300 bg-white/90 text-amber-950",
    };
  }
  return {
    label: "Chưa tìm thấy trong danh sách tổ chức tín dụng được cấp phép",
    pillClass: "border-amber-300 bg-white/90 text-slate-900",
  };
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
  legalTagClass: string;
} {
  if (severity === "red") {
    return {
      boxClass: "border border-red-300 bg-red-50/85 text-red-950",
      badgeLabel: "Cảnh báo cao",
      badgeClass: "bg-red-700 text-white",
      legalTagClass: "border-red-200 bg-white/90 text-red-900",
    };
  }
  if (severity === "yellow") {
    return {
      boxClass: "border border-amber-300 bg-amber-50/85 text-amber-950",
      badgeLabel: "Cần lưu ý",
      badgeClass: "bg-amber-700 text-white",
      legalTagClass: "border-amber-200 bg-white/90 text-amber-950",
    };
  }
  return {
    boxClass: "border border-slate-200 bg-slate-50 text-slate-900",
    badgeLabel: "Thông tin",
    badgeClass: "bg-slate-700 text-white",
    legalTagClass: "border-slate-200 bg-white text-slate-800",
  };
}

function RiskLevelIcon({ level }: { level: Assessment["risk_level"] }) {
  if (level === "red") {
    return (
      <svg
        aria-hidden="true"
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
    );
  }
  if (level === "yellow") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden="true"
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
  );
}

export function RiskCard({ assessment }: RiskCardProps) {
  const banner = getRiskBanner(assessment.risk_level);
  const licenseBadge = getLenderStatusBadge(assessment.lender_status);
  const activeBenchmarkIdx = getMarketBenchmarkIndex(assessment.apr_simple);
  const scenarioEntries = Object.entries(assessment.scenarios);

  return (
    <div className="space-y-5">
      {/* 1. Banner cảnh báo + huy hiệu giấy phép */}
      <section className={`rounded-2xl p-5 shadow-sm ${banner.containerClass}`}>
        <div className="flex items-start gap-3.5">
          <span
            className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${banner.iconBoxClass}`}
          >
            <RiskLevelIcon level={assessment.risk_level} />
          </span>

          <div className="min-w-0 flex-1">
            <span
              className={`inline-block rounded-full px-3 py-0.5 text-xs font-bold tracking-wide uppercase ${banner.badgeClass}`}
            >
              {banner.badgeText}
            </span>
            <h2 className="mt-2 text-xl font-bold leading-snug">{banner.title}</h2>
          </div>
        </div>

        <div
          className={`mt-4 flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-medium leading-relaxed ${licenseBadge.pillClass}`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="mt-0.5 h-4 w-4 shrink-0 text-teal-700"
          >
            <path
              fillRule="evenodd"
              d="M9.661 2.237a.531.531 0 0 1 .678 0 11.947 11.947 0 0 0 7.078 2.749.5.5 0 0 1 .479.425c.069.52.104 1.05.104 1.59 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 0 1-.332 0C5.26 16.564 2 12.163 2 7c0-.538.035-1.069.104-1.589a.5.5 0 0 1 .48-.425 11.947 11.947 0 0 0 7.077-2.75Z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <span className="font-semibold">Giấy phép: </span>
            <span>{licenseBadge.label}</span>
          </div>
        </div>

        {assessment.explanation ? (
          <p className="mt-3.5 whitespace-pre-line border-t border-current/15 pt-3.5 text-base leading-relaxed">
            {assessment.explanation}
          </p>
        ) : null}
      </section>

      {/* 2. Lưới 2x2 hiển thị 4 con số thực tế */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Con số thực tế của khoản vay</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Tính trực tiếp từ số tiền bạn thực nhận về tay và toàn bộ lịch phải trả.
        </p>

        <dl className="mt-3.5 grid grid-cols-2 gap-3">
          <div className="min-w-0 rounded-xl border border-teal-200/80 bg-teal-50/50 p-3.5">
            <dt className="text-sm font-medium text-slate-600">Tiền thực nhận</dt>
            <dd className="mt-1 break-words text-base font-bold text-teal-950 tabular-nums sm:text-lg">
              {formatVnd(assessment.amount_received)}
            </dd>
          </div>

          <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
            <dt className="text-sm font-medium text-slate-600">Tổng phải trả</dt>
            <dd className="mt-1 break-words text-base font-bold text-slate-900 tabular-nums sm:text-lg">
              {formatVnd(assessment.total_repaid)}
            </dd>
          </div>

          <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
            <dt className="text-sm font-medium text-slate-600">Tổng chi phí (lãi + phí)</dt>
            <dd className="mt-1 break-words text-base font-bold text-slate-900 tabular-nums sm:text-lg">
              {formatVnd(assessment.total_cost)}
            </dd>
          </div>

          <div className={`min-w-0 rounded-xl border p-3.5 ${banner.aprTileClass}`}>
            <dt className="text-sm font-semibold opacity-90">Chi phí thật quy năm</dt>
            <dd className="mt-1 break-words text-base font-extrabold tabular-nums sm:text-lg">
              {`${formatPct(assessment.apr_simple)}/năm`}
            </dd>
          </div>
        </dl>
      </section>

      {/* 3. Đối chiếu mức lãi suất trên thị trường */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">
          Đối chiếu mức lãi suất trên thị trường
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Đặt chi phí thật quy năm của khoản vay này cạnh các mốc phổ biến để bạn dễ hình dung.
        </p>

        <ul className="mt-3.5 space-y-2.5">
          {MARKET_BENCHMARKS.map((tier, idx) => {
            const isCurrent = idx === activeBenchmarkIdx;
            return (
              <li
                key={tier.id}
                className={`rounded-xl p-3.5 transition ${
                  isCurrent
                    ? tier.activeCardClass
                    : "border border-slate-200 bg-slate-50/60 text-slate-700"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                        isCurrent ? tier.dotClass : "bg-slate-300"
                      }`}
                    />
                    <span className="text-base font-semibold">
                      {tier.label} {tier.rangeText}
                    </span>
                  </div>

                  {isCurrent ? (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums ${tier.activeBadgeClass}`}
                    >
                      <span>Khoản vay này:</span>
                      <span>{`${formatPct(assessment.apr_simple)}/năm`}</span>
                    </span>
                  ) : null}
                </div>

                <p className="mt-1 pl-4 text-sm leading-relaxed opacity-85">
                  {tier.note}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 4. Các dấu hiệu cần lưu ý */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Các dấu hiệu cần lưu ý</h3>
        {assessment.findings.length === 0 ? (
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-base leading-relaxed text-emerald-950">
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="mt-1 h-5 w-5 shrink-0 text-emerald-700"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                clipRule="evenodd"
              />
            </svg>
            <p>Chưa ghi nhận dấu hiệu bất thường từ các thông tin vừa kiểm tra.</p>
          </div>
        ) : (
          <ul className="mt-3.5 space-y-3">
            {assessment.findings.map((finding, idx) => {
              const style = getFindingStyle(finding.severity);
              return (
                <li
                  key={`${finding.rule_id}-${idx}`}
                  className={`rounded-xl p-4 ${style.boxClass}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${style.badgeClass}`}
                    >
                      {style.badgeLabel}
                    </span>
                  </div>

                  <p className="mt-2 text-base leading-relaxed">{finding.message}</p>

                  {finding.legal_ref ? (
                    <div className="mt-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${style.legalTagClass}`}
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.8}
                          className="h-3.5 w-3.5 shrink-0"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 4.5A1.5 1.5 0 0 1 5.5 3h9A1.5 1.5 0 0 1 16 4.5v11a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 4 15.5v-11ZM7.5 7h5M7.5 10h5M7.5 13h3"
                          />
                        </svg>
                        <span>Căn cứ tham chiếu: {finding.legal_ref}</span>
                      </span>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* 5. Bảng kịch bản gia hạn */}
      {scenarioEntries.length > 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">
            Kịch bản tổng tiền phải trả nếu gia hạn
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Phí gia hạn thường không được trừ vào nợ gốc nên càng gia hạn tổng tiền phải đóng càng phình to.
          </p>

          <div className="mt-3.5 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full border-collapse text-left text-base">
              <thead className="bg-slate-50 text-sm font-semibold text-slate-700">
                <tr>
                  <th scope="col" className="px-3.5 py-2.5">
                    Trường hợp
                  </th>
                  <th scope="col" className="px-3.5 py-2.5 text-right">
                    Tổng phải đóng
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {scenarioEntries.map(([key, amount], idx) => {
                  const isExtended = idx >= 1;
                  return (
                    <tr
                      key={key}
                      className={isExtended ? "bg-amber-50/40" : undefined}
                    >
                      <td className="px-3.5 py-3 text-slate-800">
                        {getScenarioLabel(key)}
                      </td>
                      <td
                        className={`px-3.5 py-3 text-right font-bold tabular-nums ${
                          isExtended ? "text-rose-900" : "text-slate-900"
                        }`}
                      >
                        {formatVnd(amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}

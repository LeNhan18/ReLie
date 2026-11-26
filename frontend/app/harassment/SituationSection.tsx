"use client";

import { Checklist } from "@/components/Checklist";
import {
  HARASSMENT_SITUATIONS,
  SAFETY_CHECKLIST_ITEMS,
  type SituationId,
} from "./harassmentData";

type SituationSectionProps = {
  selectedIds: readonly SituationId[];
  onToggleSituation: (id: SituationId) => void;
  onSelectSampleSituations: () => void;
  onGoToEvidence: () => void;
};

export function SituationSection({
  selectedIds,
  onToggleSituation,
  onSelectSampleSituations,
  onGoToEvidence,
}: SituationSectionProps) {
  const selectedSituations = HARASSMENT_SITUATIONS.filter((item) =>
    selectedIds.includes(item.id),
  );

  return (
    <div className="space-y-5">
      <section
        aria-labelledby="situation-picker-heading"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2
              id="situation-picker-heading"
              className="text-xl font-bold leading-snug text-slate-900"
            >
              Bạn đang gặp tình huống nào dưới đây?
            </h2>
            <p className="mt-1.5 text-base leading-relaxed text-slate-600">
              Chạm chọn một hoặc nhiều tình huống đang xảy ra để xem phân tích căn cứ pháp luật tham khảo và cách giữ an toàn ngay lúc này.
            </p>
          </div>
        </div>

        <div className="mt-3">
          <button
            type="button"
            onClick={onSelectSampleSituations}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-teal-300 bg-teal-50/80 px-4 py-2.5 text-base font-semibold text-teal-900 hover:bg-teal-100/80 active:scale-[0.99] sm:w-auto"
          >
            <span>Xem nhanh 2 tình huống phổ biến nhất</span>
          </button>
        </div>

        <div className="mt-4 space-y-3" role="group" aria-label="Danh sách tình huống đòi nợ">
          {HARASSMENT_SITUATIONS.map((situation) => {
            const isSelected = selectedIds.includes(situation.id);
            return (
              <button
                key={situation.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onToggleSituation(situation.id)}
                className={`flex min-h-[56px] w-full items-start gap-3.5 rounded-2xl border p-4 text-left transition active:scale-[0.99] ${
                  isSelected
                    ? "border-teal-600 bg-teal-50/70 ring-1 ring-teal-600"
                    : "border-slate-200 bg-white hover:border-teal-400 hover:bg-slate-50/70"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition ${
                    isSelected
                      ? "border-teal-700 bg-teal-700 text-white"
                      : "border-slate-300 bg-white text-transparent"
                  }`}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.3a1 1 0 0 1-1.42 0l-3.75-3.775a1 1 0 1 1 1.42-1.41l3.04 3.06 6.54-6.585a1 1 0 0 1 1.414-.004Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>

                <span className="min-w-0 flex-1 space-y-1.5">
                  <span className="block text-base font-bold leading-snug text-slate-900">
                    {situation.title}
                  </span>
                  <span className="block text-base leading-relaxed text-slate-600">
                    Căn cứ tham chiếu: {situation.legalRefs.join(" · ")}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {selectedSituations.length === 0 ? (
        <section
          aria-live="polite"
          className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-slate-800"
        >
          <p className="text-base font-semibold text-amber-950">
            Hãy chạm vào ít nhất một ô tình huống phía trên
          </p>
          <p className="mt-1 text-base leading-relaxed text-slate-700">
            AnTâm sẽ giải thích rõ vì sao hành vi đó có dấu hiệu vượt quá ranh giới pháp luật cho phép, trích dẫn văn bản tham khảo và hướng dẫn bạn cách ứng xử an toàn ngay lập tức.
          </p>
        </section>
      ) : (
        <section
          aria-labelledby="situation-analysis-heading"
          aria-live="polite"
          className="space-y-4"
        >
          <div className="px-0.5">
            <h2
              id="situation-analysis-heading"
              className="text-xl font-bold leading-snug text-slate-900"
            >
              Phân tích bình tĩnh &amp; Quyền tự bảo vệ của bạn ({selectedSituations.length} tình huống đã chọn)
            </h2>
            <p className="mt-1 text-base leading-relaxed text-slate-600">
              Các nhận định dưới đây cũng được tự động đưa vào Bản tóm tắt sự việc ở Phần 2 để bạn tiện lưu giữ.
            </p>
          </div>

          {selectedSituations.map((situation) => (
            <article
              key={situation.id}
              className="rounded-2xl border border-teal-200 bg-white p-5 shadow-sm"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-base font-semibold text-amber-950">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-amber-600" />
                <span>{situation.shortTag}</span>
              </div>

              <h3 className="mt-2.5 text-lg font-bold leading-snug text-slate-900">
                {situation.signSummary}
              </h3>

              <p className="mt-2 text-base leading-relaxed text-slate-700">
                {situation.calmExplanation}
              </p>

              <div className="mt-3.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <p className="text-base font-semibold text-slate-900">
                  Văn bản pháp luật tham chiếu:
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {situation.legalRefs.map((refText) => (
                    <li
                      key={refText}
                      className="rounded-lg border border-teal-200 bg-white px-3 py-1.5 text-base font-medium text-teal-950"
                    >
                      {refText}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <p className="text-base font-bold text-slate-900">
                  Cách ứng xử an toàn ngay lúc này:
                </p>
                <ul className="mt-2 space-y-2">
                  {situation.safeActions.map((stepText) => (
                    <li
                      key={stepText}
                      className="flex items-start gap-2.5 text-base leading-relaxed text-slate-800"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 h-2 w-2 shrink-0 rounded-full bg-teal-700"
                      />
                      <span>{stepText}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </section>
      )}

      <Checklist
        title="5 bước giữ an toàn ngay lập tức"
        subtitle="Bạn có thể đánh dấu từng việc đã làm để giữ đầu óc tỉnh táo, không bỏ sót bước quan trọng."
        items={SAFETY_CHECKLIST_ITEMS}
      />

      <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-4">
        <p className="text-base leading-relaxed text-slate-800">
          Sau khi nắm rõ quyền tự bảo vệ, bạn hãy ghi lại thời gian và lời lẽ đối phương vừa dùng để có sẵn bản tóm tắt rõ ràng khi cần trình báo.
        </p>
        <button
          type="button"
          onClick={onGoToEvidence}
          className="mt-3 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-base font-bold text-white shadow-sm hover:bg-teal-800 active:scale-[0.99]"
        >
          <span>Sang Phần 2: Ghi sổ bằng chứng &amp; Lập bản trình báo</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

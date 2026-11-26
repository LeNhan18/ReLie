"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { EvidenceSection } from "./EvidenceSection";
import {
  buildReportText,
  SAMPLE_EVIDENCE_EVENTS,
  type EvidenceEvent,
  type HarassmentTab,
  type SituationId,
} from "./harassmentData";
import { MessageTemplatesSection } from "./MessageTemplatesSection";
import { SituationSection } from "./SituationSection";

type TabDefinition = {
  id: HarassmentTab;
  stepNumber: string;
  shortTitle: string;
  fullTitle: string;
};

const TABS: readonly TabDefinition[] = [
  {
    id: "identify",
    stepNumber: "Phần 1",
    shortTitle: "Nhận diện",
    fullTitle: "Nhận diện hành vi & Biết quyền tự bảo vệ",
  },
  {
    id: "evidence",
    stepNumber: "Phần 2",
    shortTitle: "Bằng chứng",
    fullTitle: "Sổ bằng chứng & Bản tổng hợp trình báo",
  },
  {
    id: "messages",
    stepNumber: "Phần 3",
    shortTitle: "Tin nhắn",
    fullTitle: "Tin nhắn báo trước cho người thân & đồng nghiệp",
  },
] as const;

export default function HarassmentPage() {
  const [activeTab, setActiveTab] = useState<HarassmentTab>("identify");
  const [selectedSituations, setSelectedSituations] = useState<SituationId[]>([
    "contacts_spam",
  ]);
  const [events, setEvents] = useState<EvidenceEvent[]>([]);
  const [customReportText, setCustomReportText] = useState<string | null>(null);
  const [nextEventSeq, setNextEventSeq] = useState<number>(1);

  const generatedReport = buildReportText(events, selectedSituations);
  const effectiveReportText = customReportText ?? generatedReport;

  const handleToggleSituation = (id: SituationId) => {
    setSelectedSituations((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectSampleSituations = () => {
    setSelectedSituations(["defame_photo", "contacts_spam"]);
  };

  const handleAddEvent = (newEvent: Omit<EvidenceEvent, "id">) => {
    const created: EvidenceEvent = {
      ...newEvent,
      id: `ev-${nextEventSeq}`,
    };
    setNextEventSeq((n) => n + 1);
    setEvents((prev) => [...prev, created]);
  };

  const handleRemoveEvent = (id: string) => {
    setEvents((prev) => prev.filter((item) => item.id !== id));
  };

  const handleLoadSampleEvents = () => {
    setEvents([...SAMPLE_EVIDENCE_EVENTS]);
    setCustomReportText(null);
  };

  const handleClearAllEvents = () => {
    setEvents([]);
    setCustomReportText(null);
  };

  const switchTabAndScroll = (tab: HarassmentTab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const activeTabMeta = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        backHref="/"
        badge="Giữ bình tĩnh · Bảo vệ an toàn đúng luật"
        title="Tôi bị đòi nợ, khủng bố tinh thần"
        subtitle="Dù đang nợ, danh dự, dữ liệu cá nhân và sự an toàn của bạn cùng gia đình vẫn được pháp luật bảo vệ. Hãy làm lần lượt từng phần dưới đây."
      />

      {/* Thanh chuyển 3 phần rõ ràng, dễ bấm cho người đang hoảng loạn */}
      <nav aria-label="Ba phần hỗ trợ khi bị đòi nợ" className="space-y-2.5">
        <div className="grid grid-cols-3 gap-2">
          {TABS.map((tab) => {
            const isCurrent = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                aria-current={isCurrent ? "step" : undefined}
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-h-[56px] flex-col items-center justify-center rounded-2xl border px-2 py-2.5 text-center transition active:scale-[0.99] ${
                  isCurrent
                    ? "border-teal-700 bg-teal-700 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-800 hover:border-teal-400 hover:bg-teal-50/40"
                }`}
              >
                <span
                  className={`text-base font-semibold leading-tight ${
                    isCurrent ? "text-teal-100" : "text-teal-800"
                  }`}
                >
                  {tab.stepNumber}
                </span>
                <span className="mt-0.5 text-base font-bold leading-tight">
                  {tab.shortTitle}
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-teal-200/80 bg-teal-50/70 px-3.5 py-2.5 text-base font-semibold text-teal-950">
          Đang mở — {activeTabMeta.stepNumber}: {activeTabMeta.fullTitle}
        </div>
      </nav>

      {/* Nội dung phần đang chọn (mỗi lúc tập trung 1 việc) */}
      {activeTab === "identify" ? (
        <SituationSection
          selectedIds={selectedSituations}
          onToggleSituation={handleToggleSituation}
          onSelectSampleSituations={handleSelectSampleSituations}
          onGoToEvidence={() => switchTabAndScroll("evidence")}
        />
      ) : null}

      {activeTab === "evidence" ? (
        <EvidenceSection
          events={events}
          reportText={effectiveReportText}
          isReportCustomized={customReportText !== null}
          onAddEvent={handleAddEvent}
          onRemoveEvent={handleRemoveEvent}
          onLoadSampleEvents={handleLoadSampleEvents}
          onClearAllEvents={handleClearAllEvents}
          onReportTextChange={(nextText) => setCustomReportText(nextText)}
          onRegenerateReport={() => setCustomReportText(null)}
          onGoToMessages={() => switchTabAndScroll("messages")}
        />
      ) : null}

      {activeTab === "messages" ? <MessageTemplatesSection /> : null}

      {/* Khối Liên hệ khẩn cấp & Điều hướng cuối trang */}
      <section
        aria-labelledby="emergency-contact-heading"
        className="rounded-3xl border-2 border-rose-200 bg-rose-50/70 p-5 shadow-sm"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-300 bg-white px-3 py-1 text-base font-bold text-rose-900">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-rose-600" />
          <span>Liên hệ khẩn cấp khi cần bảo vệ</span>
        </div>

        <h2
          id="emergency-contact-heading"
          className="mt-3 text-xl font-bold leading-snug text-slate-900"
        >
          Khi nào bạn cần báo ngay cho Cơ quan Công an?
        </h2>

        <div className="mt-3 space-y-3 text-base leading-relaxed text-slate-800">
          <div className="rounded-2xl border border-rose-200 bg-white p-4">
            <p className="font-bold text-rose-950">
              1. Nguy cơ mất an toàn thân thể ngay trước mắt — Gọi 113:
            </p>
            <p className="mt-1 text-slate-700">
              Gọi ngay <strong>113</strong> nếu có người lạ tìm đến tận nhà trọ, nhà riêng hoặc nơi làm việc để đe doạ an toàn thân thể, giữ người trái ý muốn, tạt chất bẩn hoặc gây mất an ninh trật tự.
            </p>
            <div className="mt-3">
              <a
                href="tel:113"
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-3 text-base font-bold text-white shadow-sm hover:bg-rose-800 active:scale-[0.99]"
              >
                <span>Gọi khẩn cấp Cảnh sát 113</span>
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="font-bold text-slate-900">
              2. Bị khủng bố điện thoại, ghép ảnh bêu riếu:
            </p>
            <p className="mt-1 text-slate-700">
              Hãy mang theo điện thoại có lưu tin nhắn, ghi âm và <strong>Bản tóm tắt sự việc</strong> (ở Phần 2) liên hệ trực tiếp <strong>Công an xã/phường nơi bạn đang tạm trú hoặc thường trú</strong> để được tiếp nhận và hướng dẫn bảo vệ.
            </p>
          </div>
        </div>
      </section>

      {/* Điều hướng hỗ trợ xử lý gốc rễ khoản nợ */}
      <section
        aria-labelledby="harassment-next-flows-heading"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2
          id="harassment-next-flows-heading"
          className="text-lg font-bold leading-snug text-slate-900"
        >
          Bước tiếp theo để giải quyết khoản vay êm thấm, đúng luật
        </h2>
        <p className="mt-1 text-base leading-relaxed text-slate-600">
          Hiểu rõ số tiền gốc thực nhận và phần lãi trong giới hạn pháp luật sẽ giúp bạn tự tin làm việc văn minh, dứt điểm.
        </p>

        <div className="mt-4 space-y-3">
          <Link
            href="/aftercare"
            className="flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl bg-teal-700 px-4 py-3 text-base font-bold text-white shadow-sm hover:bg-teal-800 active:scale-[0.99]"
          >
            <span>Tách khoản nợ gốc &amp; lãi trong trần →</span>
          </Link>

          <Link
            href="/need"
            className="flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl border border-teal-300 bg-teal-50/70 px-4 py-3 text-base font-bold text-teal-950 hover:bg-teal-100 active:scale-[0.99]"
          >
            <span>Tôi cần tiền gấp — Tìm phương án xoay xở an toàn →</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

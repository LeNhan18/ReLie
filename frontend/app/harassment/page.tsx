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

const TABS: readonly { id: HarassmentTab; label: string }[] = [
  { id: "identify", label: "1. Quyền của bạn" },
  { id: "evidence", label: "2. Sổ bằng chứng" },
  { id: "messages", label: "3. Tin nhắn mẫu" },
];

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
    const created: EvidenceEvent = { ...newEvent, id: `ev-${nextEventSeq}` };
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

  return (
    <div className="space-y-4">
      <PageHeader
        backHref="/"
        title="Tôi bị đòi nợ"
        subtitle="Biết quyền bảo vệ, lưu bằng chứng chuẩn A4 và báo trước người thân."
      />

      {/* Thanh chuyển 3 mục gọn gàng */}
      <nav aria-label="Ba phần hỗ trợ" className="grid grid-cols-3 gap-1.5 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200/80">
        {TABS.map((tab) => {
          const isCurrent = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              aria-current={isCurrent ? "step" : undefined}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[44px] rounded-xl px-2 py-2 text-xs font-bold transition sm:text-sm ${
                isCurrent
                  ? "bg-teal-700 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

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

      {/* Liên hệ khẩn cấp gọn, rõ trọng tâm */}
      <section className="space-y-2.5 rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-rose-950">
              Bị đe doạ trực tiếp tại nhà / nơi làm việc?
            </p>
            <p className="text-xs text-rose-900/80">
              Hoặc mang bản A4 tới Công an xã/phường nơi cư trú.
            </p>
          </div>
          <a
            href="tel:113"
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl bg-rose-700 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-rose-800"
          >
            Gọi 113
          </a>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/aftercare"
          className="flex min-h-[48px] items-center justify-center rounded-xl bg-white px-3 py-2 text-center text-sm font-semibold text-teal-800 shadow-sm ring-1 ring-slate-200 hover:bg-teal-50"
        >
          Tách gốc &amp; lãi →
        </Link>
        <Link
          href="/need"
          className="flex min-h-[48px] items-center justify-center rounded-xl bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
        >
          Tìm hướng 0đ →
        </Link>
      </div>
    </div>
  );
}

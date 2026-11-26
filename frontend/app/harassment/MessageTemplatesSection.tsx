"use client";

import { useState } from "react";
import {
  copyTextSafely,
  MESSAGE_TEMPLATES,
  type MessageTemplateId,
} from "./harassmentData";

export function MessageTemplatesSection() {
  const [activeId, setActiveId] = useState<MessageTemplateId>("family");
  const [draftByTemplate, setDraftByTemplate] = useState<
    Record<MessageTemplateId, string>
  >(() => ({
    family: MESSAGE_TEMPLATES[0].defaultBody,
    colleague: MESSAGE_TEMPLATES[1].defaultBody,
    collector: MESSAGE_TEMPLATES[2].defaultBody,
  }));
  const [copyFeedback, setCopyFeedback] = useState<string>("");

  const currentTemplate =
    MESSAGE_TEMPLATES.find((item) => item.id === activeId) ??
    MESSAGE_TEMPLATES[0];
  const currentText = draftByTemplate[activeId];
  const isModified = currentText !== currentTemplate.defaultBody;

  const handleSelectTemplate = (id: MessageTemplateId) => {
    setActiveId(id);
    setCopyFeedback("");
  };

  const handleTextChange = (value: string) => {
    setDraftByTemplate((prev) => ({
      ...prev,
      [activeId]: value,
    }));
    if (copyFeedback) {
      setCopyFeedback("");
    }
  };

  const handleResetCurrent = () => {
    setDraftByTemplate((prev) => ({
      ...prev,
      [activeId]: currentTemplate.defaultBody,
    }));
    setCopyFeedback("Đã khôi phục nội dung tin nhắn mẫu ban đầu.");
  };

  const handleCopyMessage = async () => {
    const ok = await copyTextSafely(currentText);
    if (ok) {
      setCopyFeedback(
        "Đã sao chép tin nhắn! Bạn chỉ cần mở Zalo hoặc Tin nhắn SMS và dán gửi đi.",
      );
    } else {
      setCopyFeedback(
        "Trình duyệt chưa cho phép sao chép tự động. Bạn hãy chạm giữ vào khung tin nhắn để chọn tất cả và sao chép nhé.",
      );
    }
  };

  return (
    <div className="space-y-5">
      <section
        aria-labelledby="message-templates-heading"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2
          id="message-templates-heading"
          className="text-xl font-bold leading-snug text-slate-900"
        >
          Tin nhắn soạn sẵn lịch sự &amp; chân thành
        </h2>
        <p className="mt-1.5 text-base leading-relaxed text-slate-600">
          Chủ động báo trước 1 câu giúp người nhà, quản lý hiểu rõ tình hình — làm mất hoàn toàn tác dụng đòn tâm lý của bên đòi nợ.
        </p>

        <div
          role="group"
          aria-label="Chọn đối tượng nhận tin nhắn"
          className="mt-4 space-y-2.5"
        >
          {MESSAGE_TEMPLATES.map((tpl) => {
            const selected = tpl.id === activeId;
            return (
              <button
                key={tpl.id}
                type="button"
                aria-pressed={selected}
                onClick={() => handleSelectTemplate(tpl.id)}
                className={`flex min-h-[52px] w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-base font-bold transition active:scale-[0.99] ${
                  selected
                    ? "border-teal-700 bg-teal-700 text-white shadow-sm"
                    : "border-slate-200 bg-slate-50/70 text-slate-900 hover:border-teal-400 hover:bg-white"
                }`}
              >
                <span>{tpl.buttonLabel}</span>
                {selected ? (
                  <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-0.5 text-base font-semibold text-white">
                    Đang chọn
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-2xl border border-teal-200 bg-teal-50/60 p-4">
          <h3 className="text-lg font-bold leading-snug text-slate-900">
            {currentTemplate.audienceTitle}
          </h3>
          <p className="mt-1 text-base leading-relaxed text-slate-700">
            {currentTemplate.guidanceNote}
          </p>
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="template-message-editor"
              className="text-base font-semibold text-slate-900"
            >
              Nội dung tin nhắn (bạn có thể sửa xưng hô cho phù hợp):
            </label>

            {isModified ? (
              <button
                type="button"
                onClick={handleResetCurrent}
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-base font-semibold text-slate-700 hover:bg-slate-100"
              >
                Khôi phục mẫu gốc
              </button>
            ) : null}
          </div>

          <textarea
            id="template-message-editor"
            rows={8}
            value={currentText}
            onChange={(e) => handleTextChange(e.target.value)}
            className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white p-4 text-base leading-relaxed text-slate-900 focus:border-teal-700"
          />

          <p className="mt-2 text-base leading-relaxed text-slate-600">
            Mẹo nhỏ: Không đính kèm ảnh chụp CCCD hay số tài khoản cá nhân của bạn trong tin nhắn gửi bên nhắc nợ.
          </p>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => void handleCopyMessage()}
            className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-base font-bold text-white shadow-sm hover:bg-teal-800 active:scale-[0.99]"
          >
            <span>Sao chép tin nhắn</span>
          </button>
        </div>

        {copyFeedback ? (
          <p
            role="status"
            aria-live="polite"
            className="mt-3.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-base font-medium leading-relaxed text-emerald-950"
          >
            {copyFeedback}
          </p>
        ) : null}
      </section>
    </div>
  );
}

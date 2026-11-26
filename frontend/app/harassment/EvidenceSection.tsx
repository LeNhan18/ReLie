"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { api, ApiError } from "@/lib/api";
import { resizeImageToJpegBlob } from "@/app/loan/resizeImage";
import {
  CONTACT_CHANNELS,
  copyTextSafely,
  downloadTextFile,
  formatDateTimeVi,
  getChannelLabel,
  getCurrentLocalDateTimeInput,
  sortEventsChronologically,
  type ContactChannelId,
  type EvidenceEvent,
} from "./harassmentData";

function toLocalDateTimeInput(timestampMs: number): string {
  const date = new Date(timestampMs);
  if (Number.isNaN(date.getTime())) {
    return getCurrentLocalDateTimeInput();
  }
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function isContactChannelId(value: unknown): value is ContactChannelId {
  return CONTACT_CHANNELS.some((item) => item.id === value);
}

type EvidenceSectionProps = {
  events: readonly EvidenceEvent[];
  reportText: string;
  isReportCustomized: boolean;
  onAddEvent: (event: Omit<EvidenceEvent, "id">) => void;
  onRemoveEvent: (id: string) => void;
  onLoadSampleEvents: () => void;
  onClearAllEvents: () => void;
  onReportTextChange: (nextText: string) => void;
  onRegenerateReport: () => void;
  onGoToMessages: () => void;
};

export function EvidenceSection({
  events,
  reportText,
  isReportCustomized,
  onAddEvent,
  onRemoveEvent,
  onLoadSampleEvents,
  onClearAllEvents,
  onReportTextChange,
  onRegenerateReport,
  onGoToMessages,
}: EvidenceSectionProps) {
  const [occurredAt, setOccurredAt] = useState<string>("");

  useEffect(() => {
    setOccurredAt((prev) => prev || getCurrentLocalDateTimeInput());
  }, []);
  const [channel, setChannel] = useState<ContactChannelId>("sms");
  const [senderInfo, setSenderInfo] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [formNotice, setFormNotice] = useState<string>("");
  const [exportStatus, setExportStatus] = useState<string>("");
  const [reportViewMode, setReportViewMode] = useState<"pdf" | "edit">("pdf");

  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [ocrNotice, setOcrNotice] = useState<string>("");
  const [ocrNeedsFallback, setOcrNeedsFallback] = useState<boolean>(false);
  const [ocrFileName, setOcrFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sortedEvents = sortEventsChronologically(events);

  const handleApplySampleOcr = () => {
    setChannel("zalo");
    setSenderInfo("Zalo 'Hỗ Trợ Hồ Sơ Nhanh' (0909xxx412)");
    setSummary(
      "Nhắn tin đe doạ gửi ảnh cắt ghép cho danh bạ nếu trước 12h00 không chuyển 1.800.000 đ phí gia hạn.",
    );
    setOcrNeedsFallback(false);
    setOcrNotice("Đã điền thử mẫu OCR — kiểm tra lại rồi bấm Thêm mốc sự việc.");
  };

  const handleScreenshotChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) {
      return;
    }

    setOcrLoading(true);
    setOcrNotice("");
    setOcrNeedsFallback(false);
    setOcrFileName(file.name);

    if (file.lastModified > 0) {
      setOccurredAt(toLocalDateTimeInput(file.lastModified));
    }

    try {
      const resizedBlob = await resizeImageToJpegBlob(file);
      const res = await api.harassmentAnalyze(resizedBlob, "evidence.jpg");

      if (res.occurred_at && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(res.occurred_at)) {
        setOccurredAt(res.occurred_at.slice(0, 16));
      }
      if (isContactChannelId(res.channel)) {
        setChannel(res.channel);
      }
      if (res.sender_info?.trim()) {
        setSenderInfo(res.sender_info.trim());
      }
      if (res.summary?.trim()) {
        setSummary(res.summary.trim());
      }

      setOcrNotice("Đã đọc xong ảnh chụp màn hình — xem lại rồi bấm Thêm mốc sự việc.");
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.isNetworkError)) {
        setOcrNeedsFallback(true);
        setOcrNotice(
          "Máy chủ chưa bật API đọc ảnh tin nhắn (/harassment/analyze). Đã lấy sẵn giờ chụp ảnh — bạn có thể điền thử mẫu OCR hoặc nhập nhanh bên dưới.",
        );
      } else {
        setOcrNotice(
          err instanceof Error
            ? err.message
            : "Chưa đọc được ảnh này. Bạn thử chụp rõ chữ hơn hoặc nhập nhanh bên dưới nhé.",
        );
      }
    } finally {
      setOcrLoading(false);
    }
  };

  const handlePrintPdf = () => {
    setReportViewMode("pdf");
    setExportStatus(
      "Đang mở bản in chuẩn A4 — chọn 'Lưu dưới dạng PDF' (Save as PDF) để tải về máy.",
    );
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.print();
      }, 60);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanSender = senderInfo.trim();
    const cleanSummary = summary.trim();

    if (!cleanSender || !cleanSummary) {
      setFormNotice("Vui lòng điền tên/số đối phương và nội dung sự việc.");
      return;
    }

    onAddEvent({
      occurredAt: occurredAt || getCurrentLocalDateTimeInput(),
      channel,
      senderInfo: cleanSender,
      summary: cleanSummary,
    });

    setSenderInfo("");
    setSummary("");
    setOcrNotice("");
    setOcrNeedsFallback(false);
    setOcrFileName("");
    setFormNotice("Đã thêm vào dòng thời gian bên dưới.");
  };

  const handleCopyReport = async () => {
    const ok = await copyTextSafely(reportText);
    setExportStatus(
      ok
        ? "Đã sao chép bản trình bày."
        : "Chưa sao chép tự động được — bạn chạm giữ vào văn bản để sao chép nhé.",
    );
  };

  const handleDownloadTxt = () => {
    const ok = downloadTextFile("ban-tom-tat-su-viec-antam.txt", reportText);
    setExportStatus(
      ok
        ? "Đã tải tệp ban-tom-tat-su-viec-antam.txt về máy."
        : "Chưa tải được tệp — bạn dùng nút Sao chép chữ nhé.",
    );
  };

  return (
    <div className="space-y-4">
      {/* Nhắc bảo mật gọn 1 dòng */}
      <div
        aria-label="Bảo mật sổ bằng chứng"
        className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3.5 py-2.5 text-sm font-medium text-emerald-950"
      >
        <span aria-hidden="true">🔒</span>
        <span>Chỉ lưu tạm trên màn hình đang mở · Ảnh chụp không lưu lên máy chủ.</span>
      </div>

      {/* Khối ghi sổ bằng chứng */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-900">
            Thêm bằng chứng
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onLoadSampleEvents();
                setFormNotice("Đã thêm 2 mốc mẫu để xem trước.");
              }}
              className="inline-flex min-h-[38px] items-center justify-center rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-900 hover:bg-teal-100"
            >
              Điền 2 mốc mẫu
            </button>
            {sortedEvents.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  onClearAllEvents();
                  setFormNotice("Đã xoá hết các mốc.");
                }}
                className="inline-flex min-h-[38px] items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Xoá hết ({sortedEvents.length})
              </button>
            ) : null}
          </div>
        </div>

        {/* Tải ảnh chụp màn hình tin nhắn để tự OCR điền form */}
        <div className="mt-3.5 rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50/50 p-3.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => void handleScreenshotChange(e)}
            className="sr-only"
            aria-label="Chọn ảnh chụp màn hình tin nhắn hoặc cuộc gọi"
          />

          <button
            type="button"
            disabled={ocrLoading}
            onClick={() => fileInputRef.current?.click()}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-teal-800 shadow-sm ring-1 ring-teal-200 transition hover:bg-teal-50 active:scale-[0.99] disabled:opacity-60"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 shrink-0"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span>
              {ocrLoading
                ? "Đang đọc ảnh chụp màn hình..."
                : "Chụp / tải ảnh tin nhắn để tự điền (OCR)"}
            </span>
          </button>

          <p className="mt-1.5 text-center text-xs text-slate-600">
            {ocrFileName
              ? `Ảnh vừa chọn: ${ocrFileName}`
              : "Tự điền thời gian, kênh, tên/số gọi tới & nội dung từ ảnh chụp màn hình."}
          </p>

          {ocrNotice ? (
            <div
              role="status"
              aria-live="polite"
              className="mt-2.5 rounded-xl bg-white/90 px-3 py-2 text-xs leading-relaxed text-slate-800 ring-1 ring-teal-200"
            >
              <p>{ocrNotice}</p>
              {ocrNeedsFallback ? (
                <button
                  type="button"
                  onClick={handleApplySampleOcr}
                  className="mt-2 inline-flex min-h-[36px] items-center justify-center rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-800"
                >
                  Điền thử mẫu OCR ngay
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 border-t border-slate-100 pt-4">
          <div>
            <label
              htmlFor="ev-occurred-at"
              className="block text-sm font-semibold text-slate-900"
            >
              Thời gian
            </label>
            <input
              id="ev-occurred-at"
              type="datetime-local"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              className="mt-1 block min-h-[46px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-base text-slate-900 focus:border-teal-700"
            />
          </div>

          <div>
            <span className="block text-sm font-semibold text-slate-900">
              Kênh liên hệ
            </span>
            <div
              role="group"
              aria-label="Chọn kênh liên hệ"
              className="mt-1.5 flex flex-wrap gap-2"
            >
              {CONTACT_CHANNELS.map((option) => {
                const active = channel === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setChannel(option.id)}
                    className={`min-h-[42px] rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${
                      active
                        ? "border-teal-700 bg-teal-700 text-white shadow-sm"
                        : "border-slate-300 bg-white text-slate-800 hover:border-teal-400 hover:bg-slate-50"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="ev-sender-info"
              className="block text-sm font-semibold text-slate-900"
            >
              Tên tài khoản / số gọi tới
            </label>
            <input
              id="ev-sender-info"
              type="text"
              value={senderInfo}
              onChange={(e) => setSenderInfo(e.target.value)}
              placeholder="VD: 0909xxx412 hoặc Zalo 'Thu Hồi Nợ'"
              className="mt-1 block min-h-[46px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-base text-slate-900 placeholder:text-slate-400 focus:border-teal-700"
            />
            <p className="mt-1 text-xs text-amber-800">
              Chỉ ghi thông tin đối phương — không nhập CCCD/STK của bạn.
            </p>
          </div>

          <div>
            <label
              htmlFor="ev-summary"
              className="block text-sm font-semibold text-slate-900"
            >
              Nội dung sự việc
            </label>
            <textarea
              id="ev-summary"
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="VD: Gọi 6 cuộc liên tiếp, doạ gửi ảnh ghép cho người thân nếu không đóng phí gia hạn..."
              className="mt-1 block w-full rounded-xl border border-slate-300 bg-white p-3 text-base leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-teal-700"
            />
          </div>

          <button
            type="submit"
            className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-base font-bold text-white shadow-sm hover:bg-teal-800 active:scale-[0.99]"
          >
            <span>+ Thêm mốc sự việc</span>
          </button>

          {formNotice ? (
            <p
              role="status"
              aria-live="polite"
              className="rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-2 text-sm font-medium text-teal-950"
            >
              {formNotice}
            </p>
          ) : null}
        </form>
      </section>

      {/* Dòng thời gian các mốc đã ghi */}
      <section
        aria-labelledby="evidence-timeline-heading"
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3
            id="evidence-timeline-heading"
            className="text-lg font-bold leading-snug text-slate-900"
          >
            Dòng thời gian
          </h3>
          <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-0.5 text-sm font-semibold tabular-nums text-teal-950">
            {sortedEvents.length} mốc
          </span>
        </div>

        {sortedEvents.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3.5 text-sm text-slate-600">
            Chưa có mốc nào. Tải ảnh tin nhắn hoặc bấm <strong>Điền 2 mốc mẫu</strong> ở trên.
          </p>
        ) : (
          <ol className="mt-3 space-y-3">
            {sortedEvents.map((ev, index) => (
              <li
                key={ev.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-teal-900">
                      <span className="tabular-nums">#{index + 1}</span>
                      <span aria-hidden="true">·</span>
                      <span>{getChannelLabel(ev.channel)}</span>
                    </span>
                    <p className="pt-0.5 text-sm font-bold tabular-nums text-slate-900">
                      {formatDateTimeVi(ev.occurredAt)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveEvent(ev.id)}
                    className="inline-flex min-h-[36px] items-center justify-center rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                  >
                    Xoá
                  </button>
                </div>

                <p className="mt-1.5 text-sm font-semibold text-slate-800">
                  {ev.senderInfo}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">
                  {ev.summary}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Khối Bản tóm tắt sự việc & danh mục bằng chứng — Bản xem trước PDF chuẩn A4 */}
      <section
        aria-labelledby="report-draft-heading"
        className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 sm:p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3
              id="report-draft-heading"
              className="text-lg font-bold leading-snug text-slate-900"
            >
              Bản trình bày &amp; bằng chứng (Chuẩn A4)
            </h3>
            <p className="mt-0.5 text-sm text-slate-500">
              Trình bày theo thể thức văn bản hành chính, sẵn sàng xuất PDF hoặc in trực tiếp.
            </p>
          </div>
        </div>

        {/* Bộ chuyển đổi Xem bản PDF A4 / Chỉnh sửa chữ */}
        <div
          role="tablist"
          aria-label="Chế độ xem bản trình bày"
          className="mt-3.5 grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={reportViewMode === "pdf"}
            onClick={() => setReportViewMode("pdf")}
            className={`min-h-[42px] rounded-lg px-3 text-sm font-semibold transition ${
              reportViewMode === "pdf"
                ? "bg-white text-teal-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Xem bản PDF chuẩn A4
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={reportViewMode === "edit"}
            onClick={() => setReportViewMode("edit")}
            className={`min-h-[42px] rounded-lg px-3 text-sm font-semibold transition ${
              reportViewMode === "edit"
                ? "bg-white text-teal-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Chỉnh sửa văn bản thô
          </button>
        </div>

        {reportViewMode === "pdf" ? (
          <div className="mt-4 rounded-2xl bg-slate-100/90 p-2.5 sm:p-4">
            {/* Trang giấy A4 chuẩn thể thức hành chính Việt Nam */}
            <article
              style={{ fontFamily: '"Times New Roman", Times, Georgia, serif' }}
              className="antam-pdf-sheet mx-auto rounded-lg bg-white px-5 py-6 text-[13.5px] leading-[1.6] text-slate-950 shadow-md ring-1 ring-slate-200/90 sm:px-8 sm:py-8 sm:text-[14.5px]"
            >
              {/* Quốc hiệu & Tiêu ngữ */}
              <div className="text-center">
                <p className="font-bold uppercase tracking-wide text-slate-950">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </p>
                <p className="mt-0.5 font-bold text-slate-950">
                  Độc lập - Tự do - Hạnh phúc
                </p>
                <div className="mx-auto mt-1.5 h-[1px] w-36 bg-slate-900" />
              </div>

              <p className="mt-3 text-right italic text-slate-700">
                ..............., ngày ...... tháng ...... năm 20......
              </p>

              {/* Tên văn bản */}
              <div className="mt-5 text-center">
                <h4 className="text-[15px] font-bold uppercase tracking-wide text-slate-950 sm:text-[16px]">
                  BẢN TÓM TẮT SỰ VIỆC &amp; DANH MỤC BẰNG CHỨNG
                </h4>
                <p className="mt-1 italic text-slate-700">
                  (Về việc bị gọi điện, nhắn tin quấy rối liên quan đến khoản vay)
                </p>
              </div>

              {/* Kính gửi */}
              <p className="mt-5">
                <span className="font-bold">Kính gửi:</span> Công an xã/phường{" "}
                <span className="tracking-wider text-slate-500">
                  ........................................................................
                </span>
              </p>

              {/* Mục I */}
              <div className="mt-4 space-y-1">
                <p className="font-bold uppercase">I. Thông tin người trình bày</p>
                <p>
                  Họ và tên:{" "}
                  <span className="text-slate-500">
                    ......................................................................................
                  </span>
                </p>
                <p>
                  Nơi cư trú / tạm trú:{" "}
                  <span className="text-slate-500">
                    .......................................................................
                  </span>
                </p>
                <p>
                  Số điện thoại liên hệ:{" "}
                  <span className="text-slate-500">
                    ......................................................................
                  </span>
                </p>
                <p className="text-[12px] italic text-slate-500">
                  (Tự điền bằng bút mực trên bản in để bảo vệ thông tin cá nhân)
                </p>
              </div>

              {/* Mục II — Bảng diễn biến bằng chứng */}
              <div className="mt-4 space-y-2">
                <p className="font-bold uppercase">
                  II. Diễn biến sự việc &amp; Danh mục bằng chứng ({sortedEvents.length} mốc)
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-800 text-left text-[12.5px] sm:text-[13.5px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-950">
                        <th className="w-9 border border-slate-800 px-2 py-1.5 text-center font-bold">
                          STT
                        </th>
                        <th className="w-28 border border-slate-800 px-2 py-1.5 font-bold">
                          Thời gian
                        </th>
                        <th className="w-32 border border-slate-800 px-2 py-1.5 font-bold">
                          Kênh &amp; Đối phương
                        </th>
                        <th className="border border-slate-800 px-2 py-1.5 font-bold">
                          Nội dung sự việc
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedEvents.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="border border-slate-800 px-3 py-3 text-center italic text-slate-500"
                          >
                            Chưa có mốc sự việc — hãy thêm sự việc hoặc bấm &ldquo;Điền thử 2 mốc sự việc mẫu&rdquo; ở trên để bảng tự cập nhật.
                          </td>
                        </tr>
                      ) : (
                        sortedEvents.map((ev, idx) => (
                          <tr key={ev.id} className="align-top">
                            <td className="border border-slate-800 px-2 py-1.5 text-center font-semibold">
                              {idx + 1}
                            </td>
                            <td className="border border-slate-800 px-2 py-1.5 tabular-nums">
                              {formatDateTimeVi(ev.occurredAt)}
                            </td>
                            <td className="border border-slate-800 px-2 py-1.5">
                              <span className="font-semibold">
                                {getChannelLabel(ev.channel)}:
                              </span>{" "}
                              {ev.senderInfo}
                            </td>
                            <td className="border border-slate-800 px-2 py-1.5">
                              {ev.summary}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mục III */}
              <div className="mt-4 space-y-1.5">
                <p className="font-bold uppercase">III. Đề nghị của người trình bày</p>
                <p className="text-justify">
                  Các hành vi nêu trên có dấu hiệu xâm phạm dữ liệu cá nhân, xúc phạm danh dự và gây ảnh hưởng đến an toàn của tôi cùng gia đình (tham chiếu Luật Đầu tư 2020 Điều 6; Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15; Nghị định 356/2025/NĐ-CP).
                </p>
                <p className="text-justify">
                  Tôi làm bản tóm tắt này kính đề nghị quý Cơ quan ghi nhận sự việc, hướng dẫn biện pháp bảo vệ an toàn và xử lý theo đúng quy định của pháp luật. Tôi xin cam đoan nội dung trình bày là đúng sự thật và sẵn sàng cung cấp thêm ảnh chụp màn hình, file ghi âm gốc khi được yêu cầu.
                </p>
              </div>

              {/* Chữ ký */}
              <div className="mt-6 flex justify-end">
                <div className="w-48 text-center">
                  <p className="font-bold uppercase">NGƯỜI TRÌNH BÀY</p>
                  <p className="text-[12px] italic text-slate-600">
                    (Ký và ghi rõ họ tên)
                  </p>
                  <div className="h-14" />
                </div>
              </div>
            </article>
          </div>
        ) : (
          <div className="mt-3.5 space-y-2.5">
            {isReportCustomized ? (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm text-amber-950">
                  Bạn đang chỉnh sửa tay văn bản.
                </p>
                <button
                  type="button"
                  onClick={onRegenerateReport}
                  className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-100"
                >
                  Cập nhật lại theo dòng thời gian
                </button>
              </div>
            ) : null}

            <label htmlFor="report-textarea" className="sr-only">
              Nội dung Bản tóm tắt sự việc và danh mục bằng chứng
            </label>
            <textarea
              id="report-textarea"
              rows={12}
              value={reportText}
              onChange={(e) => onReportTextChange(e.target.value)}
              className="block w-full rounded-xl border border-slate-300 bg-slate-50/70 p-3.5 text-sm leading-relaxed text-slate-900 focus:border-teal-700 focus:bg-white"
            />
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handlePrintPdf}
            className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-base font-bold text-white shadow-sm transition hover:bg-teal-800 active:scale-[0.99]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 shrink-0"
            >
              <path d="M6 9V2h12v7" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            <span>Xuất / In bản PDF chuẩn A4</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => void handleCopyReport()}
              className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Sao chép chữ
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Tải bản .txt
            </button>
          </div>
        </div>

        {exportStatus ? (
          <p
            role="status"
            aria-live="polite"
            className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-medium leading-relaxed text-emerald-950"
          >
            {exportStatus}
          </p>
        ) : null}
      </section>

      <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-4">
        <p className="text-base leading-relaxed text-slate-800">
          Bước rất quan trọng tiếp theo: Nhắn báo trước cho gia đình và đồng nghiệp để không ai bị bất ngờ hay chuyển tiền trả thay khi đối phương gọi quấy rối.
        </p>
        <button
          type="button"
          onClick={onGoToMessages}
          className="mt-3 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-base font-bold text-white shadow-sm hover:bg-slate-800 active:scale-[0.99]"
        >
          <span>Sang Phần 3: Lấy tin nhắn báo trước cho người thân</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

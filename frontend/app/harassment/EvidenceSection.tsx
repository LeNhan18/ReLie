"use client";

import { useState, type FormEvent } from "react";
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
  const [occurredAt, setOccurredAt] = useState<string>(() =>
    getCurrentLocalDateTimeInput(),
  );
  const [channel, setChannel] = useState<ContactChannelId>("call");
  const [senderInfo, setSenderInfo] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [formNotice, setFormNotice] = useState<string>("");
  const [exportStatus, setExportStatus] = useState<string>("");

  const sortedEvents = sortEventsChronologically(events);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanSender = senderInfo.trim();
    const cleanSummary = summary.trim();

    if (!cleanSender || !cleanSummary) {
      setFormNotice(
        "Bạn vui lòng điền tên/đầu số đối phương và tóm tắt ngắn gọn sự việc trước khi bấm thêm nhé.",
      );
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
    setFormNotice("Đã thêm mốc sự việc vào dòng thời gian bên dưới.");
  };

  const handleCopyReport = async () => {
    const ok = await copyTextSafely(reportText);
    if (ok) {
      setExportStatus(
        "Đã sao chép Bản tóm tắt sự việc. Bạn có thể dán vào ứng dụng Ghi chú trên máy hoặc gửi in khi cần.",
      );
    } else {
      setExportStatus(
        "Trình duyệt chưa cho phép sao chép tự động. Bạn hãy chạm giữ vào ô văn bản phía trên để chọn tất cả và sao chép nhé.",
      );
    }
  };

  const handleDownloadTxt = () => {
    const ok = downloadTextFile("ban-tom-tat-su-viec-antam.txt", reportText);
    if (ok) {
      setExportStatus(
        "Đã tải tệp 'ban-tom-tat-su-viec-antam.txt' trực tiếp về thiết bị của bạn (không gửi qua máy chủ nào).",
      );
    } else {
      setExportStatus(
        "Chưa tạo được tệp tải về trên trình duyệt này. Bạn hãy dùng nút 'Sao chép bản trình bày' để lưu lại nhé.",
      );
    }
  };

  return (
    <div className="space-y-5">
      {/* Cam kết chỉ lưu trong phiên hiện tại */}
      <section
        aria-label="Bảo mật sổ bằng chứng"
        className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-slate-800"
      >
        <p className="text-base font-bold text-emerald-950">
          Quyền riêng tư: Chỉ nằm trong phiên mở trang hiện tại
        </p>
        <p className="mt-1 text-base leading-relaxed text-slate-700">
          Mọi nội dung bạn ghi ở đây chỉ lưu tạm trong bộ nhớ màn hình đang mở, không lưu vào bộ nhớ trình duyệt và không gửi đi đâu. Hãy bấm <strong>Sao chép</strong> hoặc <strong>Tải tệp (.txt)</strong> trước khi đóng trang.
        </p>
      </section>

      {/* Nút điền thử 2 mốc sự việc mẫu */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold leading-snug text-slate-900">
              Ghi sổ bằng chứng theo dòng thời gian
            </h2>
            <p className="text-base leading-relaxed text-slate-600">
              Ghi lại từng cuộc gọi, tin nhắn theo thứ tự giờ giấc giúp cơ quan chức năng nắm bắt sự việc nhanh và chính xác nhất.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => {
              onLoadSampleEvents();
              setFormNotice(
                "Đã điền thử 2 mốc sự việc mẫu để bạn xem ngay cách hệ thống sắp xếp và kết xuất bản trình báo.",
              );
            }}
            className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl border border-teal-300 bg-teal-50 px-4 py-3 text-base font-bold text-teal-950 hover:bg-teal-100 active:scale-[0.99]"
          >
            <span>Điền thử 2 mốc sự việc mẫu</span>
          </button>

          {sortedEvents.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                onClearAllEvents();
                setFormNotice("Đã xoá toàn bộ các mốc sự việc trong phiên hiện tại.");
              }}
              className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-100 active:scale-[0.99]"
            >
              <span>Xoá hết ({sortedEvents.length})</span>
            </button>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 border-t border-slate-200 pt-5">
          <div>
            <label
              htmlFor="ev-occurred-at"
              className="block text-base font-semibold text-slate-900"
            >
              1. Thời điểm xảy ra (ngày &amp; giờ)
            </label>
            <input
              id="ev-occurred-at"
              type="datetime-local"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              className="mt-1.5 block min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 focus:border-teal-700"
            />
          </div>

          <div>
            <span className="block text-base font-semibold text-slate-900">
              2. Kênh liên hệ của đối phương
            </span>
            <div
              role="group"
              aria-label="Chọn kênh liên hệ"
              className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3"
            >
              {CONTACT_CHANNELS.map((option) => {
                const active = channel === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setChannel(option.id)}
                    className={`min-h-[48px] rounded-xl border px-3 py-2.5 text-base font-semibold transition ${
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
              className="block text-base font-semibold text-slate-900"
            >
              3. Tên tài khoản hoặc đầu số gọi tới
            </label>
            <p className="mt-1 text-base leading-relaxed text-amber-900">
              Lưu ý an toàn: Chỉ ghi thông tin phía đối phương — <strong>tuyệt đối không nhập số CCCD hay số tài khoản ngân hàng của bạn</strong>.
            </p>
            <input
              id="ev-sender-info"
              type="text"
              value={senderInfo}
              onChange={(e) => setSenderInfo(e.target.value)}
              placeholder="Ví dụ: Số lạ 0909xxx412 hoặc Zalo 'Thu Hồi Nợ'"
              className="mt-2 block min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-teal-700"
            />
          </div>

          <div>
            <label
              htmlFor="ev-summary"
              className="block text-base font-semibold text-slate-900"
            >
              4. Tóm tắt lời lẽ / hành vi xảy ra
            </label>
            <textarea
              id="ev-summary"
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Ví dụ: Gọi liên tục 6 cuộc trong 15 phút, doạ cắt ghép ảnh gửi cho tổ trưởng nơi tôi làm việc nếu trước 17h không đóng phí gia hạn..."
              className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white p-3.5 text-base leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-teal-700"
            />
          </div>

          <button
            type="submit"
            className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-base font-bold text-white shadow-sm hover:bg-teal-800 active:scale-[0.99]"
          >
            <span>+ Thêm mốc sự việc vào dòng thời gian</span>
          </button>

          {formNotice ? (
            <p
              role="status"
              aria-live="polite"
              className="rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-2.5 text-base font-medium leading-relaxed text-teal-950"
            >
              {formNotice}
            </p>
          ) : null}
        </form>
      </section>

      {/* Dòng thời gian các mốc đã ghi */}
      <section
        aria-labelledby="evidence-timeline-heading"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3
            id="evidence-timeline-heading"
            className="text-lg font-bold leading-snug text-slate-900"
          >
            Dòng thời gian bằng chứng đã ghi
          </h3>
          <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-base font-semibold tabular-nums text-teal-950">
            {sortedEvents.length} mốc
          </span>
        </div>

        {sortedEvents.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-base leading-relaxed text-slate-600">
            Chưa có mốc sự việc nào. Bạn có thể bấm nút <strong>&ldquo;Điền thử 2 mốc sự việc mẫu&rdquo;</strong> ở trên để xem ví dụ trực quan hoặc tự thêm sự việc vừa gặp.
          </p>
        ) : (
          <ol className="mt-4 space-y-3.5">
            {sortedEvents.map((ev, index) => (
              <li
                key={ev.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-3 py-1 text-base font-semibold text-teal-900">
                      <span className="tabular-nums">Mốc #{index + 1}</span>
                      <span aria-hidden="true">·</span>
                      <span>{getChannelLabel(ev.channel)}</span>
                    </span>
                    <p className="pt-1 text-base font-bold tabular-nums text-slate-900">
                      {formatDateTimeVi(ev.occurredAt)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveEvent(ev.id)}
                    className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-base font-semibold text-rose-800 hover:bg-rose-50 active:scale-[0.99]"
                  >
                    Xoá mốc này
                  </button>
                </div>

                <p className="mt-2 text-base font-semibold text-slate-800">
                  Đối phương: <span className="font-normal">{ev.senderInfo}</span>
                </p>
                <p className="mt-1.5 text-base leading-relaxed text-slate-700">
                  {ev.summary}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Khối Bản tóm tắt sự việc & danh mục bằng chứng */}
      <section
        aria-labelledby="report-draft-heading"
        className="rounded-2xl border border-teal-300 bg-white p-5 shadow-sm"
      >
        <div className="space-y-1.5">
          <span className="inline-block rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-base font-semibold text-teal-900">
            Tự động tổng hợp trang trọng
          </span>
          <h3
            id="report-draft-heading"
            className="text-xl font-bold leading-snug text-slate-900"
          >
            Bản tóm tắt sự việc &amp; danh mục bằng chứng
          </h3>
          <p className="text-base leading-relaxed text-slate-600">
            Bạn có thể chỉnh sửa trực tiếp câu chữ bên dưới trước khi sao chép hoặc tải tệp <code>.txt</code> về máy để mang ra Công an xã/phường nơi cư trú.
          </p>
        </div>

        {isReportCustomized ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-base text-amber-950">
              Bạn đang chỉnh sửa tay nội dung văn bản.
            </p>
            <button
              type="button"
              onClick={onRegenerateReport}
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-amber-400 bg-white px-3.5 py-2 text-base font-semibold text-amber-950 hover:bg-amber-100"
            >
              Cập nhật lại theo dòng thời gian
            </button>
          </div>
        ) : null}

        <div className="mt-4">
          <label htmlFor="report-textarea" className="sr-only">
            Nội dung Bản tóm tắt sự việc và danh mục bằng chứng
          </label>
          <textarea
            id="report-textarea"
            rows={14}
            value={reportText}
            onChange={(e) => onReportTextChange(e.target.value)}
            className="block w-full rounded-2xl border border-slate-300 bg-slate-50/70 p-4 text-base leading-relaxed text-slate-900 focus:border-teal-700 focus:bg-white"
          />
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => void handleCopyReport()}
            className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-base font-bold text-white shadow-sm hover:bg-teal-800 active:scale-[0.99]"
          >
            <span>Sao chép bản trình bày</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTxt}
            className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border-2 border-teal-700 bg-white px-5 py-3 text-base font-bold text-teal-900 hover:bg-teal-50 active:scale-[0.99]"
          >
            <span>Tải tệp văn bản (.txt) về máy</span>
          </button>
        </div>

        {exportStatus ? (
          <p
            role="status"
            aria-live="polite"
            className="mt-3.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-base font-medium leading-relaxed text-emerald-950"
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

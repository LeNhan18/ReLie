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
  const [reportViewMode, setReportViewMode] = useState<"pdf" | "edit">("pdf");

  const sortedEvents = sortEventsChronologically(events);

  const handlePrintPdf = () => {
    setReportViewMode("pdf");
    setExportStatus(
      "Đang mở bản in chuẩn A4 — bạn chọn đích là 'Lưu dưới dạng PDF' (Save as PDF) để lưu tệp PDF đẹp về máy nhé.",
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

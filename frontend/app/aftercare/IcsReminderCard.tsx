"use client";

import { useState } from "react";
import {
  formatIsoDateVi,
  formatVnd,
  type ConfirmedLoan,
} from "@/lib/api";
import { downloadScheduleIcs } from "./icsBuilder";

export type IcsReminderCardProps = {
  loan: ConfirmedLoan;
};

const COLLAPSED_LIMIT = 4;

export function IcsReminderCard({ loan }: IcsReminderCardProps) {
  const [downloaded, setDownloaded] = useState<boolean>(false);
  const [showAllRows, setShowAllRows] = useState<boolean>(false);

  const schedule = loan.schedule;
  if (schedule.length === 0) {
    return null;
  }

  const hasManyRows = schedule.length > COLLAPSED_LIMIT;
  const visibleRows =
    hasManyRows && !showAllRows
      ? schedule.slice(0, COLLAPSED_LIMIT)
      : schedule;

  const handleDownload = (): void => {
    const ok = downloadScheduleIcs(loan.lender_name, schedule);
    if (ok) {
      setDownloaded(true);
    }
  };

  return (
    <section
      aria-labelledby="ics-reminder-heading"
      className="space-y-4 rounded-2xl border border-teal-200 bg-gradient-to-b from-white to-teal-50/50 p-5 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
            <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
          </svg>
        </span>

        <div className="min-w-0 flex-1">
          <h2
            id="ics-reminder-heading"
            className="text-lg font-bold leading-snug text-slate-900"
          >
            Lịch nhắc hạn trả riêng trên điện thoại
          </h2>
          <p className="mt-1 text-base leading-relaxed text-slate-700">
            Lưu lịch hẹn trả vào ứng dụng Lịch có sẵn trên máy để được nhắc trước 1
            ngày, chủ động chuẩn bị tiền và tránh phát sinh phí phạt trễ hạn.
          </p>
        </div>
      </div>

      <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-base font-semibold text-slate-900">
            Lịch trả bạn đã xác nhận
          </p>
          <span
            data-numeric="true"
            className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-base font-semibold text-teal-900 tabular-nums"
          >
            {schedule.length} kỳ hẹn trả
          </span>
        </div>

        <ul className="divide-y divide-slate-100 pt-1">
          {visibleRows.map((item, idx) => (
            <li
              key={`${item.on}-${idx}`}
              className="flex flex-wrap items-baseline justify-between gap-2 py-2.5 text-base"
            >
              <span className="text-slate-700">
                <span className="font-semibold text-slate-900">
                  Kỳ {idx + 1}:
                </span>{" "}
                <span data-numeric="true" className="tabular-nums">
                  {formatIsoDateVi(item.on)}
                </span>
              </span>
              <span
                data-numeric="true"
                className="font-bold text-slate-900 tabular-nums"
              >
                {formatVnd(item.amount)}
              </span>
            </li>
          ))}
        </ul>

        {hasManyRows ? (
          <button
            type="button"
            onClick={() => setShowAllRows((prev) => !prev)}
            className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-base font-semibold text-slate-800 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            {showAllRows
              ? "Thu gọn danh sách kỳ trả"
              : `Xem đầy đủ cả ${schedule.length} kỳ hẹn trả`}
          </button>
        ) : null}
      </div>

      <button
        type="button"
        onClick={handleDownload}
        className="inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl border-2 border-teal-700 bg-white px-5 py-3 text-center text-base font-bold text-teal-900 shadow-sm transition hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-100"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 shrink-0 text-teal-800"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span>Tải lịch nhắc hạn trả về điện thoại (.ics)</span>
      </button>

      <p className="text-base leading-relaxed text-slate-600">
        Tệp <span className="font-semibold text-slate-800">.ics</span> được tạo ngay
        trong bộ nhớ trình duyệt của bạn, AnTâm không lưu lịch hẹn lên máy chủ.
      </p>

      {downloaded ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-base font-medium leading-relaxed text-emerald-950"
        >
          Đã tạo xong tệp lịch nhắc hạn. Khi điện thoại mở tệp vừa tải về, bạn chọn{" "}
          <span className="font-bold">Thêm tất cả</span> hoặc{" "}
          <span className="font-bold">Lưu vào Lịch</span> để máy tự động báo nhắc
          trước ngày hẹn nhé.
        </div>
      ) : null}
    </section>
  );
}

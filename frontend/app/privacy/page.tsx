"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { clearAnonId, peekAnonId, resetAnonId } from "@/lib/api";

const PLEDGES = [
  "Không cần đăng ký, không hỏi tên, SĐT hay CCCD.",
  "Không xin quyền Danh bạ, Tin nhắn, Vị trí, Cuộc gọi.",
  "Ảnh & tệp hợp đồng chỉ đọc trong bộ nhớ rồi huỷ, không lưu gốc.",
  "Không lưu số tiền vay hay lịch sử nợ trên trình duyệt.",
  "Độc lập 100%: không cho vay, không bán dữ liệu, không hoa hồng.",
] as const;

export default function PrivacyPage() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [anonId, setAnonId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setAnonId(peekAnonId());
    setIsMounted(true);
  }, []);

  const handleClearAnon = () => {
    clearAnonId();
    setAnonId(peekAnonId());
    setStatusMessage("Đã xoá mã phiên ẩn danh khỏi thiết bị này.");
  };

  const handleResetAnon = () => {
    const created = resetAnonId();
    setAnonId(created || peekAnonId());
    setStatusMessage("Đã tạo mã phiên ẩn danh mới.");
  };

  return (
    <div className="space-y-4">
      <PageHeader
        backHref="/"
        title="Quyền riêng tư"
        subtitle="AnTâm không cần biết bạn là ai mà vẫn giúp được."
      />

      {/* 5 cam kết gọn 1 dòng mỗi ý */}
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Cam kết bảo vệ dữ liệu
        </h2>
        <ul className="mt-2.5 divide-y divide-slate-100">
          {PLEDGES.map((text) => (
            <li key={text} className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                  <path
                    fillRule="evenodd"
                    d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.3a1 1 0 0 1-1.42 0l-3.75-3.775a1 1 0 1 1 1.42-1.41l3.04 3.06 6.54-6.585a1 1 0 0 1 1.414-.004Z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <span className="text-sm font-medium leading-snug text-slate-800">{text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Quản lý mã phiên ẩn danh (anon_id) */}
      <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Mã phiên ẩn danh (anon_id)
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Dữ liệu duy nhất lưu trên trình duyệt, không gắn với danh tính cá nhân.
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 px-3.5 py-2.5">
          {!isMounted ? (
            <p className="text-sm text-slate-500">Đang kiểm tra...</p>
          ) : anonId ? (
            <p className="break-all font-mono text-sm font-semibold text-slate-900 tabular-nums">
              {anonId}
            </p>
          ) : (
            <p className="text-sm font-medium text-emerald-800">
              Chưa có mã phiên nào trên thiết bị này.
            </p>
          )}
        </div>

        {statusMessage ? (
          <p
            role="status"
            aria-live="polite"
            className="rounded-xl bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-900"
          >
            {statusMessage}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleClearAnon}
            className="min-h-[46px] rounded-xl border border-red-200 bg-red-50/70 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            Xoá mã phiên
          </button>
          <button
            type="button"
            onClick={handleResetAnon}
            className="min-h-[46px] rounded-xl bg-teal-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            Tạo mã mới
          </button>
        </div>
      </section>
    </div>
  );
}

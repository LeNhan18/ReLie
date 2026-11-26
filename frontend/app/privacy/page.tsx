"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { clearAnonId, peekAnonId, resetAnonId } from "@/lib/api";

type PledgeItem = {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
};

const PRIVACY_PLEDGES: readonly PledgeItem[] = [
  {
    id: "no-identity",
    title: "Không cần đăng ký tên, số điện thoại hay CCCD",
    description:
      "Mở trang là dùng ngay. AnTâm không yêu cầu tạo tài khoản, không hỏi họ tên, giấy tờ tuỳ thân hay số tài khoản ngân hàng của bạn.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="m17 8 5 5" />
        <path d="m22 8-5 5" />
      </svg>
    ),
  },
  {
    id: "no-permissions",
    title: "Không xin quyền Danh bạ, Tin nhắn, Vị trí, Cuộc gọi",
    description:
      "Chạy gọn ngay trên trình duyệt web, tuyệt đối không đụng tới danh bạ người thân, tin nhắn riêng tư hay vị trí đi lại của bạn.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <path d="M12 18h.01" />
        <path d="m9 9 6 6" />
        <path d="m15 9-6 6" />
      </svg>
    ),
  },
  {
    id: "no-raw-image",
    title: "Ảnh chụp hợp đồng chỉ đọc ngay rồi huỷ, không lưu ảnh gốc",
    description:
      "Khi bạn gửi ảnh màn hình khoản vay để kiểm tra chi phí thật, hệ thống chỉ trích xuất thông tin cần tính ngay lúc đó rồi bỏ ảnh gốc.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
        <path d="M3 3l18 18" />
      </svg>
    ),
  },
  {
    id: "no-debt-storage",
    title: "Không lưu số tiền vay hay lịch sử nợ trên trình duyệt",
    description:
      "Số tiền mặt, khoản nợ hay thu nhập bạn nhập để tính toán không được lưu vào bộ nhớ máy — người khác cầm điện thoại cũng không xem lại được.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    id: "independent",
    title: "Độc lập 100%: không bán thông tin, không nhận hoa hồng giới thiệu vay",
    description:
      "AnTâm đứng hoàn toàn về phía người lao động: không môi giới cho vay, không chia sẻ dữ liệu cho bên thứ ba và không chèn quảng cáo vay tiền.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="M12 3v18" />
        <path d="m5 7 7-3 7 3" />
        <path d="m3 13 3-6 3 6a3 3 0 0 1-6 0Z" />
        <path d="m15 13 3-6 3 6a3 3 0 0 1-6 0Z" />
      </svg>
    ),
  },
];

export default function PrivacyPage() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [anonId, setAnonId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setAnonId(peekAnonId());
    setIsMounted(true);
  }, []);

  const handleClearAnon = () => {
    const hadAnon = Boolean(anonId);
    clearAnonId();
    setAnonId(peekAnonId());
    setStatusMessage(
      hadAnon
        ? "Đã xoá mã phiên ẩn danh khỏi trình duyệt trên thiết bị này."
        : "Thiết bị này hiện không có mã phiên nào được lưu — trình duyệt của bạn hoàn toàn sạch dữ liệu phiên.",
    );
  };

  const handleResetAnon = () => {
    const created = resetAnonId();
    setAnonId(created || peekAnonId());
    setStatusMessage(
      "Đã xoá mã cũ và tạo một mã phiên ẩn danh hoàn toàn mới trên thiết bị này.",
    );
  };

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        backHref="/"
        badge="Minh bạch dữ liệu 100%"
        title="Quyền riêng tư của bạn"
        subtitle="App vay đen đòi danh bạ của bạn. AnTâm không cần biết bạn là ai mà vẫn giúp được."
      />

      {/* Thông điệp định vị nổi bật */}
      <section
        aria-label="Thông điệp bảo vệ người dùng"
        className="rounded-3xl border border-teal-200 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 p-5 text-white shadow-sm"
      >
        <div className="flex items-start gap-3.5">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-300 ring-1 ring-inset ring-teal-400/30"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              <circle cx="12" cy="16" r="1" />
            </svg>
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold leading-relaxed text-white">
              &ldquo;App vay đen đòi danh bạ của bạn. AnTâm không cần biết bạn là ai mà vẫn giúp được.&rdquo;
            </p>
            <p className="mt-2 text-base leading-relaxed text-slate-300">
              Khi đang lo lắng vì tiền nong, điều bạn cần nhất là sự an toàn cho gia đình và người thân — không phải nỗi sợ lộ thông tin cá nhân.
            </p>
          </div>
        </div>
      </section>

      {/* 5 cam kết bảo vệ dữ liệu của AnTâm */}
      <section aria-labelledby="five-pledges-heading" className="space-y-3.5">
        <div className="px-0.5">
          <h2 id="five-pledges-heading" className="text-lg font-bold text-slate-900">
            5 cam kết bảo vệ dữ liệu của AnTâm
          </h2>
          <p className="mt-1 text-base leading-relaxed text-slate-600">
            Rõ ràng, dễ kiểm chứng ngay trên chính điện thoại bạn đang cầm.
          </p>
        </div>

        <ul className="space-y-3">
          {PRIVACY_PLEDGES.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3.5">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-200"
                >
                  {item.icon}
                </span>

                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold leading-snug text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-base leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Thẻ quản lý Mã phiên ẩn danh (anon_id) */}
      <section
        aria-labelledby="anon-session-heading"
        className="space-y-4 rounded-2xl border border-teal-200 bg-white p-5 shadow-sm"
      >
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-base font-semibold text-emerald-950">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-600" />
            <span>Dữ liệu duy nhất trên trình duyệt</span>
          </span>
          <h2 id="anon-session-heading" className="text-lg font-bold text-slate-900">
            Quản lý mã phiên ẩn danh của bạn
          </h2>
          <p className="text-base leading-relaxed text-slate-600">
            Khi bạn bấm tính toán, trình duyệt chỉ sinh ra một dãy ký tự ngẫu nhiên (gọi là{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-base text-slate-800">
              anon_id
            </code>
            ) để phân biệt lượt yêu cầu kỹ thuật — hoàn toàn không gắn với tên hay số điện thoại của bạn. Bạn có thể xoá hoặc đổi mới bất cứ lúc nào:
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-4">
          <div className="text-base font-semibold text-slate-700">
            Trạng thái hiện tại trên thiết bị này:
          </div>

          {!isMounted ? (
            <p className="mt-2 text-base text-slate-600">
              Đang kiểm tra bộ nhớ trình duyệt...
            </p>
          ) : anonId ? (
            <div className="mt-2 space-y-1.5">
              <div className="rounded-lg border border-teal-200 bg-white px-3 py-2.5 font-mono text-base font-semibold text-teal-950 break-all tabular-nums">
                {anonId}
              </div>
              <p className="text-base text-slate-600">
                Mã ngẫu nhiên đang lưu tạm trên trình duyệt này.
              </p>
            </div>
          ) : (
            <p className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50/80 px-3.5 py-2.5 text-base font-medium text-emerald-950">
              Chưa có mã phiên nào được lưu trên thiết bị này
            </p>
          )}
        </div>

        {statusMessage ? (
          <div
            role="status"
            aria-live="polite"
            className="flex items-start gap-2.5 rounded-xl border border-teal-300 bg-teal-50 px-4 py-3 text-base font-medium leading-relaxed text-teal-950"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 h-5 w-5 shrink-0 text-teal-700"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>{statusMessage}</span>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 pt-1">
          <button
            type="button"
            onClick={handleClearAnon}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50/80 px-4 py-3 text-base font-semibold text-red-800 transition hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 active:bg-red-200"
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
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
            <span>Xoá mã phiên khỏi thiết bị này</span>
          </button>

          <button
            type="button"
            onClick={handleResetAnon}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-900"
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
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
            <span>Tạo mã ẩn danh mới</span>
          </button>
        </div>
      </section>

      {/* Điều hướng quay lại công cụ */}
      <div className="pt-1">
        <Link
          href="/"
          className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-slate-100"
        >
          <span>Quay về trang chủ AnTâm</span>
        </Link>
      </div>
    </div>
  );
}

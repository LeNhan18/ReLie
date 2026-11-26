"use client";

import Link from "next/link";
import { useState } from "react";

type DangerousPermission = {
  id: string;
  title: string;
  tag: string;
  whyDangerous: string;
  safeAction: string;
  icon: "contacts" | "sms" | "photos" | "location";
};

const DANGEROUS_PERMISSIONS: ReadonlyArray<DangerousPermission> = [
  {
    id: "contacts",
    title: "1. Danh bạ điện thoại",
    tag: "Rủi ro bị gọi làm phiền người thân",
    whyDangerous:
      "Ngay khi bạn bấm \"Cho phép\", ứng dụng có thể sao chép toàn bộ số của cha mẹ, vợ chồng, đồng nghiệp và tổ trưởng. Nếu chậm đóng dù chỉ vài giờ, bên đòi nợ có dấu hiệu dùng danh sách này để gọi điện gây sức ép lên gia đình và nơi làm việc.",
    safeAction:
      "Luôn chọn \"Không cho phép\" khi app vay tiền đòi xem Danh bạ.",
    icon: "contacts",
  },
  {
    id: "sms",
    title: "2. Tin nhắn SMS",
    tag: "Nguy cơ lộ biến động số dư & mã xác thực",
    whyDangerous:
      "Cho phép ứng dụng đọc tin nhắn ngân hàng, biết ngày lương về, số dư tài khoản và có nguy cơ lộ mã xác thực giao dịch hoặc nội dung trao đổi riêng tư.",
    safeAction:
      "Từ chối quyền đọc SMS; không cài đặt ứng dụng qua tệp lạ (.apk) gửi trong Zalo hoặc tin nhắn.",
    icon: "sms",
  },
  {
    id: "photos",
    title: "3. Thư viện ảnh / Camera",
    tag: "Nguy cơ bị lấy ảnh cá nhân, gia đình",
    whyDangerous:
      "Nếu cấp quyền truy cập toàn bộ thư viện ảnh, ứng dụng có thể tải ảnh riêng tư của bạn và con cái về máy chủ. Thực tế nhiều trường hợp bên đòi nợ có dấu hiệu cắt ghép ảnh cá nhân để bôi nhọ trên mạng xã hội.",
    safeAction:
      "Không cấp quyền xem \"Tất cả ảnh\"; chỉ mở Camera lúc thật sự cần chụp giấy tờ tại tổ chức được cấp phép.",
    icon: "photos",
  },
  {
    id: "location",
    title: "4. Vị trí liên tục",
    tag: "Nguy cơ bị theo dõi nơi ở và chỗ làm",
    whyDangerous:
      "Cấp quyền vị trí mọi lúc giúp bên cho vay nắm được địa chỉ phòng trọ, nhà máy, trường học của con ngay cả khi bạn đã tắt màn hình, từ đó nhắn tin gây hoang mang tâm lý.",
    safeAction:
      "Chọn \"Không cho phép\" quyền Vị trí đối với các ứng dụng mời vay tiền.",
    icon: "location",
  },
];

function PermissionIcon({ kind }: { kind: DangerousPermission["icon"] }) {
  if (kind === "contacts") {
    return (
      <svg
        aria-hidden="true"
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
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  if (kind === "sms") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 9h8" />
        <path d="M8 13h5" />
      </svg>
    );
  }
  if (kind === "photos") {
    return (
      <svg
        aria-hidden="true"
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
      </svg>
    );
  }
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function PermissionGuide() {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <section
      aria-labelledby="permission-guide-heading"
      className="rounded-2xl border border-amber-300/90 bg-gradient-to-br from-amber-50/90 via-white to-orange-50/50 shadow-sm"
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls="permission-guide-panel"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex min-h-[56px] w-full items-start justify-between gap-3 rounded-2xl p-4 text-left transition hover:bg-amber-50/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:p-5"
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-200/80 text-amber-950 ring-1 ring-inset ring-amber-300"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.1}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          </span>

          <div className="min-w-0 flex-1">
            <h2
              id="permission-guide-heading"
              className="text-lg font-bold leading-snug text-slate-900"
            >
              Soi các quyền nguy hiểm mà app vay hay đòi
            </h2>
            <p className="mt-1 text-base leading-relaxed text-slate-700">
              {expanded
                ? "Xem rõ lý do không nên cấp 4 quyền nhạy cảm trên điện thoại khi cài app vay tiền."
                : "Chạm để xem vì sao không nên bấm \"Cho phép\" Danh bạ, Tin nhắn SMS, Ảnh và Vị trí."}
            </p>
          </div>
        </div>

        <span
          aria-hidden="true"
          className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-amber-950 ring-1 ring-amber-300 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      {expanded ? (
        <div
          id="permission-guide-panel"
          className="space-y-4 border-t border-amber-200/80 px-4 pb-5 pt-4 sm:px-5"
        >
          <p className="text-base leading-relaxed text-slate-800">
            Tổ chức tín dụng hợp pháp không bao giờ buộc bạn giao toàn bộ danh bạ người thân hay kho ảnh riêng tư mới duyệt vay. Trước khi bấm{" "}
            <strong className="font-semibold text-slate-950">&ldquo;Cho phép&rdquo;</strong>{" "}
            trên màn hình điện thoại, bạn kiểm tra kỹ 4 quyền sau:
          </p>

          <ul className="space-y-3">
            {DANGEROUS_PERMISSIONS.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-800 ring-1 ring-inset ring-rose-200"
                  >
                    <PermissionIcon kind={item.icon} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold leading-snug text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-1 inline-block rounded-lg border border-rose-200 bg-rose-50/80 px-2.5 py-1 text-base font-semibold text-rose-900">
                      {item.tag}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-base leading-relaxed text-slate-700">
                  {item.whyDangerous}
                </p>

                <div className="mt-3 rounded-xl border border-teal-200 bg-teal-50/70 px-3.5 py-2.5 text-base leading-relaxed text-teal-950">
                  <span className="font-bold">Cách tự bảo vệ: </span>
                  <span>{item.safeAction}</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-900 p-4 text-slate-100">
            <p className="text-base font-semibold text-teal-300">
              Nếu bạn đã lỡ cài app và bấm &ldquo;Cho phép&rdquo;:
            </p>
            <p className="text-base leading-relaxed text-slate-100">
              Hãy chụp màn hình hợp đồng và lịch trả nợ để lưu bằng chứng trước, sau đó mở{" "}
              <strong className="font-semibold text-white">
                Cài đặt điện thoại → Ứng dụng → chọn tên app → Quyền
              </strong>{" "}
              rồi tắt ngay cả 4 quyền trên.
            </p>
            <Link
              href="/aftercare"
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-center text-base font-semibold text-white transition hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
            >
              <span>Xem hướng dẫn khi đã lỡ cài app &amp; nhận tiền</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}

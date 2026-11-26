"use client";

import { useState } from "react";

type DevicePlatform = "android" | "ios";

type GuideStep = {
  stepBadge: string;
  title: string;
  urgentNote?: string;
  detail: string;
  tip: string;
};

const ANDROID_STEPS: readonly GuideStep[] = [
  {
    stepBadge: "Bước 1 · Làm trước tiên",
    title: "Chụp màn hình lưu bằng chứng TRƯỚC khi tắt quyền hoặc xoá app",
    urgentNote:
      "Nếu bạn tắt quyền hoặc gỡ app quá sớm, nhiều app sẽ khoá màn hình khiến bạn không mở lại được hợp đồng và lịch trả cũ.",
    detail:
      "Hãy mở app vay và chụp rõ: (1) Màn hình số tiền vay và lịch hẹn trả; (2) Tên app và số tài khoản nhận tiền trả; (3) Tin nhắn SMS hoặc thông báo ngân hàng lúc tiền thực sự chuyển vào tài khoản của bạn.",
    tip: "Mẹo chụp màn hình trên Android: Nhấn cùng lúc nút Giảm âm lượng và nút Nguồn (hoặc vuốt 3 ngón tay từ trên xuống trên máy OPPO, Xiaomi, Vivo, Realme).",
  },
  {
    stepBadge: "Bước 2 · Ngắt truy cập máy",
    title: "Vào Cài đặt → Ứng dụng → tắt quyền Danh bạ, Ảnh, Tin nhắn, Vị trí",
    detail:
      "Mở Cài đặt trên điện thoại → chọn Ứng dụng (hoặc Quản lý ứng dụng) → tìm đúng tên app vay tiền → chạm vào mục Quyền (Permissions). Tại đây, bạn bấm vào từng mục Danh bạ, Ảnh và video, Tin nhắn SMS, Nhật ký cuộc gọi, Vị trí, Micro rồi chọn Không cho phép.",
    tip: "Sau khi đã kiểm tra kỹ ảnh chụp bằng chứng ở Bước 1 nằm an toàn trong Bộ sưu tập ảnh, bạn có thể bấm Buộc dừng hoặc Gỡ cài đặt app vay không rõ nguồn gốc.",
  },
  {
    stepBadge: "Bước 3 · Bảo vệ người thân",
    title: "Khoá tìm kiếm bằng số điện thoại trên Zalo và Facebook",
    detail:
      "Trên Zalo: Vào Cá nhân (góc dưới phải) → Quyền riêng tư → Nguồn tìm kiếm → tắt Cho phép tìm kiếm qua số điện thoại; đồng thời đổi mục Nhận tin nhắn và cuộc gọi sang Chỉ từ bạn bè. Trên Facebook: Vào Menu → Cài đặt & quyền riêng tư → Cài đặt → Cách mọi người tìm và liên hệ với bạn → chuyển mục tìm bằng số điện thoại và Danh sách bạn bè sang Chỉ mình tôi.",
    tip: "Việc này ngăn người lạ dùng số điện thoại của bạn để dò ra tài khoản mạng xã hội của người nhà, tổ trưởng và đồng nghiệp.",
  },
];

const IOS_STEPS: readonly GuideStep[] = [
  {
    stepBadge: "Bước 1 · Làm trước tiên",
    title: "Chụp màn hình lưu bằng chứng TRƯỚC khi tắt quyền hoặc xoá app",
    urgentNote:
      "Đừng vội xoá app hoặc đăng xuất ngay — hãy giữ nguyên bằng chứng số tiền thực nhận và lịch trả trước đã.",
    detail:
      "Mở màn hình khoản vay (hoặc trang web vay nếu vay qua trình duyệt Safari) để chụp lại: (1) Hợp đồng / chi tiết khoản vay và ngày hẹn trả; (2) Thông tin tài khoản bên cho vay yêu cầu chuyển tiền; (3) Biến động số dư ngân hàng báo số tiền thực tế đã về tay.",
    tip: "Mẹo chụp màn hình trên iPhone: Nhấn đồng thời nút Sườn bên phải và nút Tăng âm lượng (hoặc nút Nguồn + nút Home tròn trên iPhone đời cũ).",
  },
  {
    stepBadge: "Bước 2 · Ngắt truy cập máy",
    title: "Vào Cài đặt → Ứng dụng / Quyền riêng tư → tắt Danh bạ, Ảnh, Vị trí",
    detail:
      "Mở Cài đặt (Settings) trên iPhone → kéo xuống danh sách ứng dụng ở dưới cùng và chạm vào tên app vay → gạt tắt toàn bộ các mục Danh bạ, Ảnh (chọn Không có), Vị trí (chọn Không), Micro, Camera. Tiếp theo, kiểm tra Cài đặt → Cài đặt chung → Quản lý VPN & Thiết bị: nếu thấy Cấu hình lạ do web vay cài vào, hãy chọn Xoá cấu hình.",
    tip: "Nếu bạn vay qua đường link trên Safari, hãy vào Cài đặt → Safari → Xoá lịch sử và dữ liệu trang web sau khi đã chụp đủ màn hình ở Bước 1.",
  },
  {
    stepBadge: "Bước 3 · Bảo vệ người thân",
    title: "Khoá tìm kiếm bằng số điện thoại trên Zalo và Facebook",
    detail:
      "Trên Zalo: Chạm Cá nhân → Quyền riêng tư → Nguồn tìm kiếm → gạt tắt Cho phép tìm kiếm qua số điện thoại, và ẩn Nhật ký với người lạ. Trên Facebook: Vào Menu → Cài đặt & quyền riêng tư → Cài đặt → Cách mọi người tìm và liên hệ với bạn → đổi mục tìm kiếm bằng số điện thoại và Danh sách bạn bè thành Chỉ mình tôi.",
    tip: "Bạn cũng có thể bật tính năng Tắt tiếng cuộc gọi không xác định trong Cài đặt → Điện thoại nếu bị nháy máy liên tục bởi đầu số lạ.",
  },
];

export function DataLockGuide() {
  const [platform, setPlatform] = useState<DevicePlatform>("android");

  const activeSteps = platform === "android" ? ANDROID_STEPS : IOS_STEPS;

  return (
    <section
      aria-labelledby="data-lock-heading"
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-200"
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
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            <circle cx="12" cy="16" r="1" />
          </svg>
        </span>

        <div className="min-w-0 flex-1">
          <h2
            id="data-lock-heading"
            className="text-lg font-bold leading-snug text-slate-900"
          >
            Khoá rò rỉ dữ liệu theo dòng máy
          </h2>
          <p className="mt-1 text-base leading-relaxed text-slate-600">
            Chọn đúng loại điện thoại bạn đang cầm trên tay để làm lần lượt 3 bước
            ngắt quyền truy cập an toàn.
          </p>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Chọn dòng điện thoại để xem hướng dẫn tắt quyền"
        className="grid grid-cols-2 gap-2.5 rounded-2xl bg-slate-100 p-1.5"
      >
        <button
          id="tab-device-android"
          type="button"
          role="tab"
          aria-selected={platform === "android"}
          aria-controls="panel-device-guide"
          onClick={() => setPlatform("android")}
          className={`flex min-h-[52px] items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-center text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
            platform === "android"
              ? "bg-teal-700 text-white shadow-sm"
              : "bg-transparent text-slate-700 hover:bg-white/70 hover:text-slate-900"
          }`}
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
            <rect x="6" y="3" width="12" height="18" rx="2" />
            <path d="M10 18h4" />
          </svg>
          <span>Điện thoại Android</span>
        </button>

        <button
          id="tab-device-ios"
          type="button"
          role="tab"
          aria-selected={platform === "ios"}
          aria-controls="panel-device-guide"
          onClick={() => setPlatform("ios")}
          className={`flex min-h-[52px] items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-center text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
            platform === "ios"
              ? "bg-teal-700 text-white shadow-sm"
              : "bg-transparent text-slate-700 hover:bg-white/70 hover:text-slate-900"
          }`}
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
            <rect x="6" y="2" width="12" height="20" rx="3" />
            <path d="M10 5h4" />
            <path d="M11 19h2" />
          </svg>
          <span>iPhone (iOS)</span>
        </button>
      </div>

      <div
        id="panel-device-guide"
        role="tabpanel"
        aria-labelledby={
          platform === "android" ? "tab-device-android" : "tab-device-ios"
        }
        className="space-y-3.5"
      >
        {activeSteps.map((step) => (
          <article
            key={`${platform}-${step.stepBadge}`}
            className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
          >
            <span className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-base font-semibold text-teal-900">
              {step.stepBadge}
            </span>

            <h3 className="text-base font-bold leading-snug text-slate-900">
              {step.title}
            </h3>

            {step.urgentNote ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-base font-medium leading-relaxed text-amber-950">
                {step.urgentNote}
              </div>
            ) : null}

            <p className="text-base leading-relaxed text-slate-700">
              {step.detail}
            </p>

            <p className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base leading-relaxed text-slate-700">
              {step.tip}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

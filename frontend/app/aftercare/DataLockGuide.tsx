"use client";

import { useState } from "react";

type DevicePlatform = "android" | "ios";

const STEPS: Record<DevicePlatform, readonly { title: string; detail: string }[]> = {
  android: [
    {
      title: "1. Chụp lưu bằng chứng TRƯỚC khi gỡ app",
      detail: "Chụp màn hình hợp đồng, lịch trả nợ và tin nhắn ngân hàng báo tiền thực nhận.",
    },
    {
      title: "2. Tắt quyền truy cập của app vay",
      detail: "Cài đặt → Ứng dụng → chọn app vay → Quyền → tắt Danh bạ, Ảnh, Tin nhắn, Vị trí rồi gỡ app.",
    },
    {
      title: "3. Khoá tìm kiếm bằng SĐT trên Zalo & Facebook",
      detail: "Zalo: Quyền riêng tư → tắt tìm qua SĐT. Facebook: ẩn SĐT & danh sách bạn bè sang Chỉ mình tôi.",
    },
  ],
  ios: [
    {
      title: "1. Chụp lưu bằng chứng TRƯỚC khi gỡ app",
      detail: "Chụp màn hình hợp đồng, lịch trả nợ và tin nhắn ngân hàng báo tiền thực nhận.",
    },
    {
      title: "2. Tắt quyền & xoá cấu hình lạ",
      detail: "Cài đặt → chọn app vay → tắt Danh bạ, Ảnh, Vị trí. Kiểm tra Cài đặt chung → VPN & Thiết bị để xoá cấu hình lạ.",
    },
    {
      title: "3. Khoá tìm kiếm SĐT trên Zalo & Facebook",
      detail: "Tắt tìm bằng SĐT trên Zalo/Facebook và bật Tắt tiếng cuộc gọi lạ trong Cài đặt → Điện thoại.",
    },
  ],
};

export function DataLockGuide() {
  const [platform, setPlatform] = useState<DevicePlatform>("android");
  const activeSteps = STEPS[platform];

  return (
    <section
      aria-labelledby="data-lock-heading"
      className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="data-lock-heading" className="text-base font-bold text-slate-900">
          Khoá quyền Danh bạ &amp; Ảnh
        </h2>
        <div
          role="tablist"
          aria-label="Chọn dòng máy"
          className="inline-flex rounded-xl bg-slate-100 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={platform === "android"}
            onClick={() => setPlatform("android")}
            className={`min-h-[36px] rounded-lg px-3 text-xs font-bold transition ${
              platform === "android"
                ? "bg-teal-700 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Android
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={platform === "ios"}
            onClick={() => setPlatform("ios")}
            className={`min-h-[36px] rounded-lg px-3 text-xs font-bold transition ${
              platform === "ios"
                ? "bg-teal-700 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            iPhone
          </button>
        </div>
      </div>

      <ol className="divide-y divide-slate-100">
        {activeSteps.map((step) => (
          <li key={`${platform}-${step.title}`} className="py-2.5 first:pt-0 last:pb-0">
            <p className="text-sm font-bold text-slate-900">{step.title}</p>
            <p className="mt-0.5 text-sm leading-snug text-slate-600">{step.detail}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

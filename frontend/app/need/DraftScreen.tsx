"use client";

import { useState } from "react";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { formatIsoDateVi, type Option } from "@/lib/api";

export type DraftFieldKey =
  | "ten_nguoi_nhan"
  | "han_moi"
  | "ten_hoc_sinh"
  | "khoa"
  | "so_tien";

export type DraftFieldValues = Partial<Record<DraftFieldKey, string>>;

type FieldConfig = {
  key: DraftFieldKey;
  label: string;
  placeholder: string;
  suggestions?: readonly string[];
};

function addDaysLocalIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const FIELDS_BY_OPTION_ID: Record<string, FieldConfig[]> = {
  hoc_phi_xin_lui: [
    {
      key: "ten_nguoi_nhan",
      label: "Người nhận",
      placeholder: "Ví dụ: cô Lan chủ nhiệm",
      suggestions: ["cô giáo chủ nhiệm", "thầy chủ nhiệm", "Ban Giám hiệu nhà trường"],
    },
    {
      key: "ten_hoc_sinh",
      label: "Tên học sinh / sinh viên",
      placeholder: "Ví dụ: cháu Nguyễn Văn An (lớp 4A)",
      suggestions: ["cháu Nguyễn Minh An", "em Trần Thị Mai"],
    },
    {
      key: "han_moi",
      label: "Ngày xin đóng",
      placeholder: "Ví dụ: 05/12/2026",
    },
  ],
  hoc_phi_hoi_ho_tro: [
    {
      key: "ten_nguoi_nhan",
      label: "Người nhận / Bộ phận nhà trường",
      placeholder: "Ví dụ: Phòng Công tác học sinh - sinh viên",
      suggestions: ["Phòng Công tác học sinh", "thầy/cô giáo chủ nhiệm"],
    },
    {
      key: "han_moi",
      label: "Ngày mong nhận hướng dẫn",
      placeholder: "Ví dụ: 05/12/2026",
    },
  ],
  tien_nha_xin_lui: [
    {
      key: "ten_nguoi_nhan",
      label: "Người nhận",
      placeholder: "Ví dụ: cô Bảy chủ nhà",
      suggestions: ["cô/chú chủ nhà", "anh/chị chủ trọ"],
    },
    {
      key: "han_moi",
      label: "Ngày hẹn đóng",
      placeholder: "Ví dụ: 05/12/2026",
    },
  ],
  tien_nha_chia_nho: [
    {
      key: "ten_nguoi_nhan",
      label: "Người nhận",
      placeholder: "Ví dụ: chú Tư chủ trọ",
      suggestions: ["cô/chú chủ nhà", "anh/chị chủ phòng"],
    },
    {
      key: "han_moi",
      label: "Ngày hẹn đóng phần còn lại",
      placeholder: "Ví dụ: 10/12/2026",
    },
  ],
  vien_phi_chia_nho: [
    {
      key: "khoa",
      label: "Tên khoa đang điều trị",
      placeholder: "Ví dụ: Khoa Nội tổng hợp",
      suggestions: ["Khoa Nội tổng hợp", "Khoa Nhi", "Khoa Cấp cứu"],
    },
  ],
  vien_phi_hoi_bao_hiem: [
    {
      key: "ten_nguoi_nhan",
      label: "Bộ phận tiếp nhận",
      placeholder: "Ví dụ: Bộ phận Viện phí / Bảo hiểm y tế",
      suggestions: ["Bộ phận Viện phí", "Quầy hướng dẫn BHYT"],
    },
    {
      key: "han_moi",
      label: "Ngày cần hoàn tất thủ tục",
      placeholder: "Ví dụ: 05/12/2026",
    },
  ],
  ung_luong: [
    {
      key: "ten_nguoi_nhan",
      label: "Người nhận",
      placeholder: "Ví dụ: anh Minh tổ trưởng / Phòng Nhân sự",
      suggestions: ["anh/chị tổ trưởng", "Phòng Nhân sự", "Ban chấp hành Công đoàn"],
    },
    {
      key: "so_tien",
      label: "Số tiền xin ứng",
      placeholder: "Ví dụ: 3 triệu đồng",
      suggestions: ["2 triệu đồng", "3 triệu đồng", "4 triệu đồng"],
    },
  ],
  tra_no_cu_hoi_lich_tra: [
    {
      key: "ten_nguoi_nhan",
      label: "Đơn vị / Bộ phận hỗ trợ khách hàng",
      placeholder: "Ví dụ: Bộ phận Hỗ trợ khách hàng",
      suggestions: ["Bộ phận Chăm sóc khách hàng", "Quý Ngân hàng / Công ty tài chính"],
    },
    {
      key: "han_moi",
      label: "Ngày mong nhận phản hồi",
      placeholder: "Ví dụ: 05/12/2026",
    },
  ],
  ho_tro_khan_cap_dia_phuong: [
    {
      key: "ten_nguoi_nhan",
      label: "Cơ quan / Đoàn thể tại địa phương",
      placeholder: "Ví dụ: Ủy ban MTTQ / Hội Phụ nữ phường",
      suggestions: ["Ủy ban MTTQ phường/xã", "Hội Liên hiệp Phụ nữ phường"],
    },
    {
      key: "han_moi",
      label: "Ngày mong nhận hướng dẫn",
      placeholder: "Ví dụ: 05/12/2026",
    },
  ],
  nho_nguoi_than_ho_tro: [
    {
      key: "ten_nguoi_nhan",
      label: "Người thân bạn muốn mở lời",
      placeholder: "Ví dụ: anh Hai / chị Ba",
      suggestions: ["anh/chị", "cô/chú trong gia đình"],
    },
    {
      key: "han_moi",
      label: "Ngày thuận tiện trao đổi",
      placeholder: "Ví dụ: tối mai hoặc cuối tuần này",
    },
  ],
};

const DEFAULT_FIELDS: FieldConfig[] = [
  {
    key: "ten_nguoi_nhan",
    label: "Người nhận",
    placeholder: "Ví dụ: anh/chị...",
    suggestions: ["anh/chị", "cô/chú"],
  },
  {
    key: "han_moi",
    label: "Ngày hẹn mới",
    placeholder: "Ví dụ: 05/12/2026",
  },
];

export function getFieldsForOption(optionId: string): FieldConfig[] {
  return FIELDS_BY_OPTION_ID[optionId] ?? DEFAULT_FIELDS;
}

export function getSampleValuesForOption(optionId: string, fallbackDateVi: string): DraftFieldValues {
  switch (optionId) {
    case "hoc_phi_xin_lui":
      return {
        ten_nguoi_nhan: "cô Lan chủ nhiệm",
        ten_hoc_sinh: "cháu Nguyễn Minh An",
        han_moi: fallbackDateVi,
      };
    case "hoc_phi_hoi_ho_tro":
      return {
        ten_nguoi_nhan: "Phòng Công tác học sinh",
        han_moi: fallbackDateVi,
      };
    case "tien_nha_xin_lui":
      return {
        ten_nguoi_nhan: "cô Bảy chủ nhà",
        han_moi: fallbackDateVi,
      };
    case "tien_nha_chia_nho":
      return {
        ten_nguoi_nhan: "chú Tư chủ trọ",
        han_moi: fallbackDateVi,
      };
    case "vien_phi_chia_nho":
      return {
        khoa: "Khoa Nội tổng hợp",
      };
    case "vien_phi_hoi_bao_hiem":
      return {
        ten_nguoi_nhan: "Bộ phận Viện phí",
        han_moi: fallbackDateVi,
      };
    case "ung_luong":
      return {
        ten_nguoi_nhan: "anh Minh tổ trưởng",
        so_tien: "3 triệu đồng",
      };
    case "tra_no_cu_hoi_lich_tra":
      return {
        ten_nguoi_nhan: "Bộ phận Hỗ trợ khách hàng",
        han_moi: fallbackDateVi,
      };
    case "ho_tro_khan_cap_dia_phuong":
      return {
        ten_nguoi_nhan: "Ủy ban MTTQ phường",
        han_moi: fallbackDateVi,
      };
    case "nho_nguoi_than_ho_tro":
      return {
        ten_nguoi_nhan: "anh Hai",
        han_moi: fallbackDateVi,
      };
    default:
      return {
        ten_nguoi_nhan: "anh/chị",
        han_moi: fallbackDateVi,
      };
  }
}

export function buildCleanDraftValues(fields: DraftFieldValues): Record<string, string> {
  const clean: Record<string, string> = {};
  const entries = Object.entries(fields) as [DraftFieldKey, string | undefined][];
  for (const [key, val] of entries) {
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (trimmed.length > 0) {
        clean[key] = trimmed;
      }
    }
  }
  return clean;
}

async function copyTextSafe(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Chuyển sang cách sao chép dự phòng bên dưới
    }
  }

  if (typeof document === "undefined") {
    return false;
  }

  try {
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.left = "-9999px";
    helper.style.top = "0";
    document.body.appendChild(helper);
    helper.focus();
    helper.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(helper);
    return copied;
  } catch {
    return false;
  }
}

const SENDING_TIPS: readonly { title: string; detail: string }[] = [
  {
    title: "Gửi sớm trước hạn 1–2 ngày, vào giờ hành chính",
    detail:
      "Nhắn vào khoảng 8h–11h sáng hoặc 14h–17h chiều giúp người nhận thoải mái xem và dễ thông cảm hơn nhiều so với lúc sát giờ đóng.",
  },
  {
    title: "Hẹn đúng một ngày cụ thể bạn chắc chắn xoay được",
    detail:
      "Nêu rõ ngày nhận lương hoặc ngày đóng đợt đầu giúp thầy cô, chủ nhà hay tổ trưởng thấy sự đàng hoàng và giữ trọn chữ tín.",
  },
  {
    title: "Kiểm tra không còn dấu «...» trước khi bấm gửi",
    detail:
      "Đọc lướt lại tên người nhận và ngày hẹn một lần cuối trong khung thư, sau đó dán vào Zalo hoặc Tin nhắn SMS.",
  },
];

export type DraftScreenProps = {
  option: Option;
  draftText: string;
  onDraftTextChange: (nextText: string) => void;
  fields: DraftFieldValues;
  onFieldChange: (key: DraftFieldKey, value: string) => void;
  onApplyPresetFields: (nextFields: DraftFieldValues) => void;
  isLoading: boolean;
  error: string;
  onRegenerate: () => void;
  onBack: () => void;
};

export function DraftScreen({
  option,
  draftText,
  onDraftTextChange,
  fields,
  onFieldChange,
  onApplyPresetFields,
  isLoading,
  error,
  onRegenerate,
  onBack,
}: DraftScreenProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const fieldConfigs = getFieldsForOption(option.option_id);

  const dateChip5Days = formatIsoDateVi(addDaysLocalIso(5));
  const dateChip10Days = formatIsoDateVi(addDaysLocalIso(10));
  const hasPlaceholderDots = draftText.includes("...");

  async function handleCopy() {
    if (!draftText.trim()) return;
    const ok = await copyTextSafe(draftText);
    setCopyState(ok ? "copied" : "failed");
  }

  function handleTextEdit(value: string) {
    if (copyState !== "idle") {
      setCopyState("idle");
    }
    onDraftTextChange(value);
  }

  function handleRegenerateClick() {
    setCopyState("idle");
    onRegenerate();
  }

  function handleQuickFillSample() {
    setCopyState("idle");
    const sample = getSampleValuesForOption(option.option_id, dateChip10Days);
    onApplyPresetFields(sample);
  }

  function handlePickSuggestion(key: DraftFieldKey, suggestion: string) {
    setCopyState("idle");
    const merged: DraftFieldValues = { ...fields, [key]: suggestion };
    onApplyPresetFields(merged);
  }

  return (
    <section aria-label="Soạn tin nhắn xin hỗ trợ" className="space-y-5">
      <PageHeader
        backHref="/"
        backLabel="Về trang chủ"
        badge="Soạn lời nhắn lịch sự · 0đ"
        title={option.title}
        subtitle="Lời nhắn chân thành, rõ ngày hẹn giúp bạn dễ mở lời qua Zalo hoặc SMS mà không ngại ngùng."
        rightSlot={
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-[48px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-base font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            <span aria-hidden="true">←</span>
            <span>Các gợi ý</span>
          </button>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          <LoadingState
            title="Đang soạn sẵn lời nhắn lịch sự cho bạn..."
            hint="Bạn đợi một chút nhé, nội dung sẽ hiện ngay bên dưới."
          />
          <button
            type="button"
            onClick={onBack}
            className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 active:bg-slate-100"
          >
            ← Quay lại danh sách phương án
          </button>
        </div>
      ) : error ? (
        <ErrorState
          title="Chưa tạo được mẫu tin nhắn"
          message={error}
          onRetry={handleRegenerateClick}
          retryLabel="Thử soạn lại"
          onBack={onBack}
          backLabel="← Quay lại danh sách phương án"
        />
      ) : (
        <>
          {/* Khối 1: Điền nhanh biến mẫu */}
          <div className="rounded-2xl border border-teal-200/90 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  1. Điền nhanh thông tin của bạn
                </h2>
                <p className="mt-0.5 text-base text-slate-600">
                  Chạm gợi ý mẫu hoặc tự gõ để ghép thẳng vào bức thư.
                </p>
              </div>

              <button
                type="button"
                onClick={handleQuickFillSample}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-teal-300 bg-teal-50 px-3.5 py-2 text-base font-semibold text-teal-950 transition hover:bg-teal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-200"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 shrink-0 text-teal-700"
                >
                  <path d="m12 3 1.9 4.6L18.5 9l-4.6 1.9L12 15.5l-1.9-4.6L5.5 9l4.6-1.4L12 3Z" />
                </svg>
                <span>Điền nhanh biến mẫu</span>
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {fieldConfigs.map((field) => {
                const inputId = `draft-field-${field.key}`;
                const quickChips =
                  field.key === "han_moi"
                    ? [dateChip5Days, dateChip10Days]
                    : (field.suggestions ?? []);

                return (
                  <div key={field.key} className="space-y-2">
                    <label
                      htmlFor={inputId}
                      className="block text-base font-semibold text-slate-800"
                    >
                      {field.label}
                    </label>
                    <input
                      id={inputId}
                      type="text"
                      value={fields[field.key] ?? ""}
                      onChange={(e) => onFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                    />

                    {quickChips.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {quickChips.map((chip) => {
                          const selected = (fields[field.key] ?? "").trim() === chip;
                          return (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => handlePickSuggestion(field.key, chip)}
                              className={`min-h-[48px] rounded-xl px-3.5 py-2 text-base font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                                selected
                                  ? "border-2 border-teal-700 bg-teal-50 font-semibold text-teal-950"
                                  : "border border-slate-200 bg-slate-50 text-slate-700 hover:border-teal-500 hover:bg-teal-50/50"
                              }`}
                            >
                              + {chip}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleRegenerateClick}
              className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border-2 border-teal-700 bg-white px-4 py-3 text-base font-semibold text-teal-900 transition hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-100"
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
              <span>Cập nhật nội dung thư theo thông tin trên</span>
            </button>
          </div>

          {/* Khối 2: Thẻ thư sang trọng & nút Sao chép nổi bật */}
          <div className="overflow-hidden rounded-3xl border-2 border-teal-200 bg-gradient-to-b from-teal-50/70 via-white to-amber-50/30 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-100 bg-white/80 px-4 py-3.5 sm:px-5">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white"
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
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    2. Thư soạn sẵn gửi qua Zalo / SMS
                  </h2>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-base font-semibold ${
                  hasPlaceholderDots
                    ? "border border-amber-300 bg-amber-50 text-amber-950"
                    : "border border-emerald-300 bg-emerald-50 text-emerald-950"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 rounded-full ${
                    hasPlaceholderDots ? "bg-amber-500" : "bg-emerald-600"
                  }`}
                />
                <span>{hasPlaceholderDots ? "Còn chỗ «...» cần điền" : "Sẵn sàng gửi"}</span>
              </span>
            </div>

            <div className="p-4 sm:p-5">
              <label htmlFor="draft-textarea" className="block text-base font-medium text-slate-700">
                Bạn có thể chạm trực tiếp vào tờ thư dưới đây để sửa câu chữ cho gần gũi nhất:
              </label>

              <textarea
                id="draft-textarea"
                rows={6}
                value={draftText}
                onChange={(e) => handleTextEdit(e.target.value)}
                className="mt-3 w-full rounded-2xl border border-teal-200 bg-white p-4 text-base leading-relaxed text-slate-900 shadow-inner focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
              />

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => void handleCopy()}
                  className={`inline-flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-2xl px-5 py-3.5 text-base font-bold text-white shadow-md transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                    copyState === "copied"
                      ? "bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900"
                      : "bg-teal-700 hover:bg-teal-800 active:bg-teal-900"
                  }`}
                >
                  {copyState === "copied" ? (
                    <>
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 shrink-0"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span>Đã sao chép — Chạm để sao chép lại</span>
                    </>
                  ) : (
                    <>
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 shrink-0"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      <span>Sao chép tin nhắn</span>
                    </>
                  )}
                </button>
              </div>

              {copyState === "copied" ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="mt-3.5 flex items-start gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-base font-medium leading-relaxed text-emerald-950"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white"
                  >
                    ✓
                  </span>
                  <span>
                    Đã lưu tin nhắn vào bộ nhớ tạm! Giờ bạn mở <strong>Zalo</strong> hoặc ứng dụng{" "}
                    <strong>Tin nhắn (SMS)</strong>, chạm giữ vào ô chat rồi chọn <strong>Dán</strong> để gửi nhé.
                  </span>
                </div>
              ) : null}

              {copyState === "failed" ? (
                <div
                  role="alert"
                  className="mt-3.5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-base leading-relaxed text-amber-950"
                >
                  Trình duyệt chưa cho phép sao chép tự động. Bạn chạm giữ vào khung chữ bên trên, chọn{" "}
                  <strong>Chọn tất cả</strong> rồi bấm <strong>Sao chép</strong> nhé.
                </div>
              ) : null}
            </div>
          </div>

          {/* Khối 3: Hướng dẫn gửi qua Zalo / SMS lịch sự */}
          <section
            aria-labelledby="sending-etiquette-heading"
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <h2
              id="sending-etiquette-heading"
              className="text-lg font-bold leading-snug text-slate-900"
            >
              Cách gửi qua Zalo / SMS lịch sự, dễ được thông cảm
            </h2>
            <ul className="mt-3 space-y-3">
              {SENDING_TIPS.map((tip, idx) => (
                <li
                  key={tip.title}
                  className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-100 text-base font-bold text-teal-900 tabular-nums"
                  >
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-slate-900">{tip.title}</p>
                    <p className="mt-0.5 text-base leading-relaxed text-slate-700">{tip.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <button
            type="button"
            onClick={onBack}
            className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 active:bg-slate-100"
          >
            ← Quay lại danh sách phương án
          </button>
        </>
      )}
    </section>
  );
}

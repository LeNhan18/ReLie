"use client";

import { useState } from "react";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import type { Option } from "@/lib/api";

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
};

const FIELDS_BY_OPTION_ID: Record<string, FieldConfig[]> = {
  hoc_phi_xin_lui: [
    {
      key: "ten_nguoi_nhan",
      label: "Người nhận",
      placeholder: "Ví dụ: cô Lan chủ nhiệm",
    },
    {
      key: "ten_hoc_sinh",
      label: "Tên học sinh / sinh viên",
      placeholder: "Ví dụ: cháu Nguyễn Văn An",
    },
    {
      key: "han_moi",
      label: "Ngày xin đóng",
      placeholder: "Ví dụ: 05/12/2026",
    },
  ],
  tien_nha_xin_lui: [
    {
      key: "ten_nguoi_nhan",
      label: "Người nhận",
      placeholder: "Ví dụ: cô Bảy chủ nhà",
    },
    {
      key: "han_moi",
      label: "Ngày hẹn đóng",
      placeholder: "Ví dụ: 05/12/2026",
    },
  ],
  vien_phi_chia_nho: [
    {
      key: "khoa",
      label: "Tên khoa đang điều trị",
      placeholder: "Ví dụ: Khoa Nội tổng hợp",
    },
  ],
  ung_luong: [
    {
      key: "ten_nguoi_nhan",
      label: "Người nhận",
      placeholder: "Ví dụ: anh Minh tổ trưởng / Phòng Nhân sự",
    },
    {
      key: "so_tien",
      label: "Số tiền xin ứng",
      placeholder: "Ví dụ: 3 triệu đồng",
    },
  ],
};

const DEFAULT_FIELDS: FieldConfig[] = [
  {
    key: "ten_nguoi_nhan",
    label: "Người nhận",
    placeholder: "Ví dụ: anh/chị...",
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

export type DraftScreenProps = {
  option: Option;
  draftText: string;
  onDraftTextChange: (nextText: string) => void;
  fields: DraftFieldValues;
  onFieldChange: (key: DraftFieldKey, value: string) => void;
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
  isLoading,
  error,
  onRegenerate,
  onBack,
}: DraftScreenProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const fieldConfigs = getFieldsForOption(option.option_id);

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

  return (
    <section aria-labelledby="draft-heading" className="space-y-5">
      <div>
        <span className="inline-block rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-base font-semibold text-teal-900">
          Soạn tin nhắn
        </span>
        <h1 id="draft-heading" className="mt-2 text-xl font-bold leading-snug text-slate-900">
          {option.title}
        </h1>
        <p className="mt-1.5 text-base leading-relaxed text-slate-600">
          Tin nhắn lịch sự, rõ ràng giúp bạn dễ mở lời hơn. Bạn có thể điền thêm thông tin hoặc sửa trực tiếp nội dung.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <LoadingState
            title="Đang soạn sẵn lời nhắn cho bạn..."
            hint="Bạn đợi một chút nhé."
          />
          <button
            type="button"
            onClick={onBack}
            className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 active:bg-slate-100"
          >
            ← Quay lại danh sách lựa chọn
          </button>
        </div>
      ) : error ? (
        <ErrorState
          title="Chưa tạo được mẫu tin nhắn"
          message={error}
          onRetry={handleRegenerateClick}
          retryLabel="Thử lại"
          onBack={onBack}
          backLabel="← Quay lại danh sách lựa chọn"
        />
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <label
              htmlFor="draft-textarea"
              className="block text-base font-semibold text-slate-900"
            >
              Nội dung tin nhắn
            </label>
            <p className="mt-1 text-base text-slate-600">
              Bạn có thể chạm vào khung dưới đây để sửa lại chữ hoặc thay dấu &ldquo;...&rdquo; cho đúng ý.
            </p>
            <textarea
              id="draft-textarea"
              rows={6}
              value={draftText}
              onChange={(e) => handleTextEdit(e.target.value)}
              className="mt-3 w-full rounded-xl border border-slate-300 bg-slate-50 p-3.5 text-base leading-relaxed text-slate-900 focus:border-teal-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20"
            />

            <div className="mt-4">
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="min-h-[52px] w-full rounded-xl bg-teal-700 px-4 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-900"
              >
                Sao chép tin nhắn
              </button>
            </div>

            {copyState === "copied" ? (
              <div
                role="status"
                aria-live="polite"
                className="mt-3 rounded-xl border border-emerald-300 bg-emerald-50 p-3.5 text-base font-medium leading-relaxed text-emerald-950"
              >
                Đã sao chép! Bạn mở Zalo hoặc Tin nhắn để dán gửi nhé.
              </div>
            ) : null}

            {copyState === "failed" ? (
              <div
                role="alert"
                className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-base leading-relaxed text-amber-950"
              >
                Thiết bị chưa tự sao chép được. Bạn chạm giữ vào khung tin nhắn bên trên rồi chọn Sao chép nhé.
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Điền nhanh thông tin vào mẫu thư (tuỳ chọn)
            </h2>
            <div className="mt-3 space-y-3">
              {fieldConfigs.map((field) => {
                const inputId = `draft-field-${field.key}`;
                return (
                  <div key={field.key}>
                    <label
                      htmlFor={inputId}
                      className="block text-base font-medium text-slate-800"
                    >
                      {field.label}
                    </label>
                    <input
                      id={inputId}
                      type="text"
                      value={fields[field.key] ?? ""}
                      onChange={(e) => onFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="mt-1.5 min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                    />
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={handleRegenerateClick}
              className="mt-4 min-h-[48px] w-full rounded-xl border-2 border-teal-700 bg-teal-50 px-4 py-3 text-base font-semibold text-teal-900 transition hover:bg-teal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-200"
            >
              Soạn lại theo thông tin trên
            </button>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 active:bg-slate-100"
          >
            ← Quay lại danh sách lựa chọn
          </button>
        </>
      )}
    </section>
  );
}

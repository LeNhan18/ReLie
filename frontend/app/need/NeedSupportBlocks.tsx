"use client";

import Link from "next/link";
import { useState } from "react";
import type { AmountBand, NeedPurpose, Option } from "@/lib/api";

export type DeadlineIconKey = "1d" | "3d" | "7d" | "14d" | "none";

export function PurposeIcon({ purpose }: { purpose: NeedPurpose }) {
  switch (purpose) {
    case "hoc_phi":
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
          <path d="M22 10 12 5 2 10l10 5 10-5Z" />
          <path d="M6 12.5V17c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4.5" />
          <path d="M22 10v6" />
        </svg>
      );
    case "tien_nha":
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
          <path d="m3 10.5 9-7.5 9 7.5" />
          <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
          <path d="M9.5 21v-6h5v6" />
        </svg>
      );
    case "vien_phi":
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
          <rect x="3" y="5" width="18" height="15" rx="2.5" />
          <path d="M8.5 5V3.8A1.8 1.8 0 0 1 10.3 2h3.4a1.8 1.8 0 0 1 1.8 1.8V5" />
          <path d="M12 9.5v6" />
          <path d="M9 12.5h6" />
        </svg>
      );
    case "tra_no_cu":
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
          <rect x="3" y="4" width="18" height="17" rx="2.5" />
          <path d="M8 2.5v3M16 2.5v3M3 9h18" />
          <circle cx="12" cy="15" r="3" />
          <path d="M12 13.8V15l1 0.8" />
        </svg>
      );
    case "khac":
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
          <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          <path d="M21 12h-7a2 2 0 0 0 0 4h7v-4Z" />
        </svg>
      );
  }
}

export function AmountIcon({ band }: { band: AmountBand }) {
  switch (band) {
    case "duoi_5tr":
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
          <rect x="3" y="6" width="18" height="12" rx="2.5" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M6.5 12h.01M17.5 12h.01" />
        </svg>
      );
    case "5_20tr":
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
          <rect x="2.5" y="7.5" width="17" height="11" rx="2" />
          <path d="M6 7.5V6a2 2 0 0 1 2-2h11.5a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2" />
          <circle cx="11" cy="13" r="2.2" />
        </svg>
      );
    case "tren_20tr":
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
          <path d="m3 9 9-6 9 6" />
          <path d="M4 10h16M6 10v8M10 10v8M14 10v8M18 10v8M3 20h18" />
        </svg>
      );
  }
}

export function DeadlineIcon({ deadlineKey }: { deadlineKey: DeadlineIconKey }) {
  switch (deadlineKey) {
    case "1d":
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
          <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
        </svg>
      );
    case "3d":
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
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l2.5 1.5" />
          <path d="M9 2.5h6" />
        </svg>
      );
    case "7d":
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
          <rect x="3" y="4" width="18" height="17" rx="2.5" />
          <path d="M8 2.5v3M16 2.5v3M3 9.5h18" />
          <path d="M8 14h8" />
        </svg>
      );
    case "14d":
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
          <rect x="3" y="4" width="18" height="17" rx="2.5" />
          <path d="M8 2.5v3M16 2.5v3M3 9.5h18" />
          <path d="M8 13.5h3M13 13.5h3M8 17h3M13 17h3" />
        </svg>
      );
    case "none":
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
          <circle cx="12" cy="12" r="9" />
          <path d="M8.5 12h7" />
        </svg>
      );
  }
}

type RejectionReasonKey = "thieu_bang_luong" | "no_qua_han" | "can_gap_trong_ngay";

const REJECTION_REASONS: readonly {
  key: RejectionReasonKey;
  label: string;
  headline: string;
  steps: readonly string[];
}[] = [
  {
    key: "thieu_bang_luong",
    label: "Thiếu bảng lương / làm tự do",
    headline: "Hướng xoay xở khi không có bảng lương chuyển khoản",
    steps: [
      "Ưu tiên thương lượng xin lùi hạn hoặc chia làm 2 đợt đóng bằng mẫu thư lịch sự ở trên — nhà trường, chủ trọ hay bệnh viện không đòi chứng minh thu nhập.",
      "Nếu làm công nhật, thời vụ hoặc theo ca, hãy hỏi trực tiếp tổ trưởng hoặc chủ cơ sở để xin tạm ứng phần công đã làm trong tháng.",
      "Nếu vẫn cần nguồn vốn nhỏ hợp pháp: hỏi Tổ chức tài chính vi mô (như CEP, TYM), Hội Phụ nữ / Đoàn Thanh niên phường xã, hoặc tiệm cầm đồ có giấy phép kinh doanh rõ ràng.",
    ],
  },
  {
    key: "no_qua_han",
    label: "Đang vướng nợ quá hạn",
    headline: "Cách gỡ rối an toàn khi đang có khoản quá hạn",
    steps: [
      "Đừng cố nộp thêm đơn vay mới ở ngân hàng hay công ty tài chính lúc này vì hệ thống thường tự động từ chối ngay.",
      "Dùng ngay mẫu thư soạn sẵn bên trên để xin giãn khoản chi cấp bách (học phí, tiền nhà, viện phí) hoặc nhắn bên cho vay cũ xin cơ cấu lại lịch trả phù hợp sức mình.",
      "Hỏi công đoàn cơ sở hoặc phòng nhân sự về quỹ tương trợ đoàn viên / tạm ứng lương — các kênh nội bộ xét theo hoàn cảnh thực tế, không xét lịch sử tín dụng.",
    ],
  },
  {
    key: "can_gap_trong_ngay",
    label: "Cần gấp trong ngày chưa kịp duyệt",
    headline: "Xử lý việc gấp trong ngày mà không sập bẫy lãi cao",
    steps: [
      "Kênh vay hợp pháp luôn cần thời gian thẩm định minh bạch; lời mời 'giải ngân tự động 5 phút không điều kiện' thường có dấu hiệu phí ẩn và lãi nặng.",
      "Cách giải quyết nhanh nhất ngay trong hôm nay là gửi tin nhắn lịch sự xin hẹn ngày đóng cụ thể (ví dụ ngay ngày nhận lương) bằng mẫu thư bên trên.",
      "Kết hợp hỏi ứng trước một phần lương qua tổ trưởng/nhân sự hoặc nhờ người thân hỗ trợ tạm đúng phần thiết yếu nhất trong vài ngày.",
    ],
  },
];

export type RejectedSupportBlockProps = {
  firstNoLoanOption: Option | null;
  onOpenDraft: (option: Option) => void;
};

export function RejectedSupportBlock({
  firstNoLoanOption,
  onOpenDraft,
}: RejectedSupportBlockProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedReason, setSelectedReason] = useState<RejectionReasonKey>("thieu_bang_luong");

  const activeGuidance =
    REJECTION_REASONS.find((item) => item.key === selectedReason) ?? REJECTION_REASONS[0];

  return (
    <section
      aria-labelledby="rejected-support-heading"
      className="rounded-2xl border border-amber-300/90 bg-gradient-to-b from-amber-50/80 via-white to-white p-4 shadow-sm sm:p-5"
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="rejected-support-panel"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-200/80 text-amber-950"
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
              <circle cx="12" cy="12" r="9" />
              <path d="M9.5 9.5a2.5 2.5 0 0 1 4.8 0.8c0 1.6-2.3 2-2.3 3.2" />
              <path d="M12 17h.01" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id="rejected-support-heading"
              className="text-lg font-bold leading-snug text-slate-900"
            >
              Tôi vừa bị từ chối hồ sơ thì làm sao?
            </h2>
            <p className="mt-1 text-base leading-relaxed text-slate-700">
              Chạm để chọn lý do bị từ chối và xem bước xoay xở thực tế tiếp theo.
            </p>
          </div>
        </div>

        <span
          aria-hidden="true"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-300 bg-white text-amber-950 transition-transform ${
            isOpen ? "rotate-180" : ""
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

      {isOpen ? (
        <div id="rejected-support-panel" className="mt-4 space-y-4 border-t border-amber-200/80 pt-4">
          <div>
            <p className="text-base font-semibold text-slate-900">
              Bạn vừa gặp vướng mắc nào khi hỏi vay?
            </p>
            <div className="mt-2.5 space-y-2.5">
              {REJECTION_REASONS.map((reason) => {
                const active = selectedReason === reason.key;
                return (
                  <button
                    key={reason.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedReason(reason.key)}
                    className={`flex min-h-[48px] w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                      active
                        ? "border-2 border-teal-700 bg-teal-50 text-teal-950 shadow-sm"
                        : "border border-slate-300 bg-white text-slate-800 hover:border-teal-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{reason.label}</span>
                    <span
                      aria-hidden="true"
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-base ${
                        active ? "bg-teal-700 text-white" : "border border-slate-300 bg-slate-50 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            role="region"
            aria-label={activeGuidance.headline}
            className="space-y-3.5 rounded-2xl border border-teal-200 bg-teal-50/60 p-4"
          >
            <h3 className="text-base font-bold leading-snug text-teal-950">
              {activeGuidance.headline}
            </h3>

            <ul className="space-y-2.5 text-base leading-relaxed text-slate-800">
              {activeGuidance.steps.map((step) => (
                <li key={step} className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal-700"
                  />
                  <span>{step}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-base leading-relaxed text-amber-950">
              <strong className="font-bold">Lưu ý quan trọng: </strong>
              Tuyệt đối không nộp hồ sơ dồn dập nhiều nơi cùng lúc. Đăng ký hàng loạt trong thời gian ngắn dễ làm giảm khả năng được duyệt ở kênh chính thống và khiến số điện thoại của bạn bị các bên cho vay không giấy phép chèo kéo.
            </div>

            {firstNoLoanOption ? (
              <button
                type="button"
                onClick={() => onOpenDraft(firstNoLoanOption)}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-900"
              >
                <span>Soạn ngay thư xin lùi hạn / hỗ trợ (0đ)</span>
                <span aria-hidden="true">→</span>
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

const HARM_REDUCTION_PRINCIPLES: readonly {
  number: string;
  title: string;
  detail: string;
}[] = [
  {
    number: "1",
    title: "Chỉ vay đúng phần còn thiếu",
    detail:
      "Trừ hết phần tiền bạn sẵn có hoặc xin đóng chậm được. Vay càng gọn trong khả năng trả, áp lực gốc và lãi kỳ sau càng nhẹ.",
  },
  {
    number: "2",
    title: "Kiểm tra hợp đồng tại mục Kiểm tra khoản vay trước khi nhận tiền",
    detail:
      "Chụp màn hình app hoặc hợp đồng để tính chi phí thật và nhận diện sớm các điều khoản có dấu hiệu bất thường như 'lãi 0%' kèm phí ẩn hay đòi chuyển phí trước.",
  },
  {
    number: "3",
    title: "Không giao quyền Danh bạ/Ảnh",
    detail:
      "Tổ chức tài chính minh bạch không bao giờ buộc bạn mở quyền truy cập Danh bạ người thân hay Thư viện ảnh cá nhân để giải ngân.",
  },
  {
    number: "4",
    title: "Lập lịch trả để không vay chồng",
    detail:
      "Tính rõ tiền ăn ở thiết yếu tới kỳ lương để trả dứt điểm đúng hạn; tuyệt đối không vay thêm nơi mới để đắp cho khoản cũ.",
  },
];

export function HarmReductionBlock() {
  return (
    <section
      aria-labelledby="harm-reduction-heading"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
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
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-teal-800">
            Chế độ giảm thiểu tác hại
          </p>
          <h2
            id="harm-reduction-heading"
            className="mt-0.5 text-lg font-bold leading-snug text-slate-900"
          >
            Nguyên tắc tự bảo vệ nếu bạn vẫn quyết định vay
          </h2>
        </div>
      </div>

      <ol className="mt-4 space-y-3">
        {HARM_REDUCTION_PRINCIPLES.map((item) => (
          <li
            key={item.number}
            className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/90 p-3.5"
          >
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-700 text-base font-bold text-white tabular-nums"
            >
              {item.number}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold leading-snug text-slate-900">
                {item.title}
              </h3>
              <p className="mt-1 text-base leading-relaxed text-slate-700">
                {item.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <Link
          href="/loan"
          className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-center text-base font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-900"
        >
          <span>Kiểm tra khoản vay</span>
          <span aria-hidden="true">→</span>
        </Link>

        <Link
          href="/plan"
          className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl border-2 border-teal-700 bg-teal-50/70 px-4 py-3 text-center text-base font-semibold text-teal-950 transition hover:bg-teal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:bg-teal-200"
        >
          <span>Lập lịch trả &amp; chi tiêu</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

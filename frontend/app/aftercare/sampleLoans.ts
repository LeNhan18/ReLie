import type { ExtractResponse, Installment } from "@/lib/api";

export type SampleId = "xanhcash" | "gop_ngay" | "cty_tai_chinh_a";

export type SamplePreset = {
  id: SampleId;
  title: string;
  badge: string;
  badgeTone: "warning" | "licensed";
  summary: string;
  fallback: ExtractResponse;
};

const GOP_NGAY_DATES: readonly string[] = [
  "2026-11-21",
  "2026-11-22",
  "2026-11-23",
  "2026-11-24",
  "2026-11-25",
  "2026-11-26",
  "2026-11-27",
  "2026-11-28",
  "2026-11-29",
  "2026-11-30",
  "2026-12-01",
  "2026-12-02",
  "2026-12-03",
  "2026-12-04",
  "2026-12-05",
  "2026-12-06",
  "2026-12-07",
  "2026-12-08",
  "2026-12-09",
  "2026-12-10",
  "2026-12-11",
  "2026-12-12",
  "2026-12-13",
  "2026-12-14",
  "2026-12-15",
  "2026-12-16",
  "2026-12-17",
  "2026-12-18",
  "2026-12-19",
  "2026-12-20",
  "2026-12-21",
  "2026-12-22",
  "2026-12-23",
  "2026-12-24",
  "2026-12-25",
  "2026-12-26",
  "2026-12-27",
  "2026-12-28",
  "2026-12-29",
  "2026-12-30",
  "2026-12-31",
  "2027-01-01",
  "2027-01-02",
  "2027-01-03",
  "2027-01-04",
  "2027-01-05",
  "2027-01-06",
  "2027-01-07",
  "2027-01-08",
  "2027-01-09",
];

const GOP_NGAY_SCHEDULE: Installment[] = GOP_NGAY_DATES.map((on) => ({
  on,
  amount: 250_000,
}));

const CTY_TAI_CHINH_A_DATES: readonly string[] = [
  "2026-12-20",
  "2027-01-19",
  "2027-02-18",
  "2027-03-20",
  "2027-04-19",
  "2027-05-19",
  "2027-06-18",
  "2027-07-18",
  "2027-08-17",
  "2027-09-16",
  "2027-10-16",
  "2027-11-15",
];

const CTY_TAI_CHINH_A_SCHEDULE: Installment[] = CTY_TAI_CHINH_A_DATES.map(
  (on) => ({
    on,
    amount: 933_333,
  }),
);

// Dữ liệu mẫu hư cấu đồng bộ 100% với data/samples/*.terms.json
// Dùng làm phương án dự phòng an toàn khi bật NEXT_PUBLIC_USE_MOCKS=1 mà backend đang tắt
export const SAMPLE_PRESETS: readonly SamplePreset[] = [
  {
    id: "xanhcash",
    title: "Mẫu 1: App ngắn ngày XanhCash",
    badge: "Áp trần dân sự · Chưa có giấy phép",
    badgeTone: "warning",
    summary:
      "Nhận thực tế 3.000.000 đ, hẹn trả 4.200.000 đ sau 14 ngày (trừ phí trước 1.000.000 đ).",
    fallback: {
      terms: {
        lender_name: {
          value: "Công ty TNHH Công nghệ Tài chính XanhCash",
          confidence: 0.96,
        },
        principal_stated: { value: 4_000_000, confidence: 0.98 },
        amount_received: { value: 3_000_000, confidence: 0.91 },
        disbursed_date: { value: "2026-11-20", confidence: 0.95 },
        repayment_type: { value: "one_time", confidence: 0.9 },
        schedule: [{ on: "2026-12-04", amount: 4_200_000 }],
        rate_stated_pct_year: { value: 0, confidence: 0.97 },
        fees: [
          {
            name: "Phí thẩm định hồ sơ",
            amount: 1_000_000,
            deducted_upfront: true,
            confidence: 0.93,
          },
          {
            name: "Phí dịch vụ",
            amount: 200_000,
            deducted_upfront: false,
            confidence: 0.61,
          },
        ],
        extension_fee: { value: 800_000, confidence: 0.9 },
        late_penalty_pct_per_day: { value: 5, confidence: 0.88 },
        data_access_contacts: true,
        requires_upfront_payment: false,
      },
      low_confidence_fields: ["fees.Phí dịch vụ"],
    },
  },
  {
    id: "gop_ngay",
    title: "Mẫu 2: Khoản vay góp ngày (50 kỳ)",
    badge: "Áp trần dân sự · Lịch góp mỗi ngày",
    badgeTone: "warning",
    summary:
      "Nhận 9.000.000 đ, đóng góp đều đặn 250.000 đ mỗi ngày trong suốt 50 ngày liên tiếp.",
    fallback: {
      terms: {
        lender_name: {
          value: "MẪU HƯ CẤU Góp ngày",
          confidence: 1.0,
        },
        principal_stated: { value: 9_000_000, confidence: 1.0 },
        amount_received: { value: 9_000_000, confidence: 1.0 },
        disbursed_date: { value: "2026-11-20", confidence: 1.0 },
        repayment_type: { value: "daily", confidence: 1.0 },
        schedule: GOP_NGAY_SCHEDULE,
        rate_stated_pct_year: { value: null, confidence: 0 },
        fees: [],
        extension_fee: { value: null, confidence: 0 },
        late_penalty_pct_per_day: { value: null, confidence: 0 },
        data_access_contacts: false,
        requires_upfront_payment: false,
      },
      low_confidence_fields: [],
    },
  },
  {
    id: "cty_tai_chinh_a",
    title: "Mẫu 3: Công ty tài chính A",
    badge: "Tổ chức tín dụng có giấy phép",
    badgeTone: "licensed",
    summary:
      "Nhận 10.000.000 đ, trả góp 12 tháng (933.333 đ/tháng) tại tổ chức tín dụng được cấp phép.",
    fallback: {
      terms: {
        lender_name: {
          value: "Công ty tài chính A (MẪU HƯ CẤU)",
          confidence: 1.0,
        },
        principal_stated: { value: 10_000_000, confidence: 1.0 },
        amount_received: { value: 10_000_000, confidence: 1.0 },
        disbursed_date: { value: "2026-11-20", confidence: 1.0 },
        repayment_type: { value: "installment", confidence: 1.0 },
        schedule: CTY_TAI_CHINH_A_SCHEDULE,
        rate_stated_pct_year: { value: 12, confidence: 1.0 },
        fees: [],
        extension_fee: { value: null, confidence: 0 },
        late_penalty_pct_per_day: { value: null, confidence: 0 },
        data_access_contacts: false,
        requires_upfront_payment: false,
      },
      low_confidence_fields: [],
    },
  },
];

export function getSamplePreset(sampleId: SampleId): SamplePreset {
  const found = SAMPLE_PRESETS.find((item) => item.id === sampleId);
  return found ?? SAMPLE_PRESETS[0];
}

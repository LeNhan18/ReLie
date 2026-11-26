import aftercareMock from "@/mocks/aftercare.json";
import planTodayMock from "@/mocks/plan_today.json";
import { getAnonId } from "./anon";

export { getAnonId, peekAnonId, clearAnonId, resetAnonId } from "./anon";
export { formatVnd, formatPct, formatIsoDateVi } from "./format";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "1";

export type NeedPurpose = "hoc_phi" | "tien_nha" | "vien_phi" | "tra_no_cu" | "khac";
export type AmountBand = "duoi_5tr" | "5_20tr" | "tren_20tr";
export type BadDebtStatus = "co" | "khong" | "khong_biet";

export type NeedProfile = {
  purpose: NeedPurpose;
  amount_band: AmountBand;
  deadline?: string | null;
  has_salary?: boolean | null;
  has_asset?: boolean | null;
  bad_debt?: BadDebtStatus | null;
};

export type Option = {
  kind: "no_loan" | "loan_channel";
  option_id: string;
  title: string;
  cost_note: string;
  speed: string;
  fit: "cao" | "co_the" | "kho";
  source_url?: string | null;
  updated_at?: string | null;
};

export type NeedOptions = {
  options: Option[];
  note: string;
};

export type ExtractedField<T> = {
  value: T | null;
  confidence: number;
};

export type Fee = {
  name: string;
  amount: number;
  deducted_upfront: boolean;
  confidence: number;
};

export type Installment = {
  on: string;
  amount: number;
};

export type RepaymentType = "one_time" | "installment" | "daily";

export type LoanTerms = {
  lender_name: ExtractedField<string>;
  principal_stated: ExtractedField<number>;
  amount_received: ExtractedField<number>;
  disbursed_date: ExtractedField<string>;
  repayment_type: ExtractedField<RepaymentType>;
  schedule: Installment[];
  rate_stated_pct_year: ExtractedField<number>;
  fees: Fee[];
  extension_fee: ExtractedField<number>;
  late_penalty_pct_per_day: ExtractedField<number>;
  data_access_contacts: boolean;
  requires_upfront_payment: boolean;
};

export type ExtractResponse = {
  terms: LoanTerms;
  low_confidence_fields: string[];
};

export type ConfirmedLoan = {
  lender_name: string;
  amount_received: number;
  disbursed_date: string;
  schedule: Installment[];
  rate_stated_pct_year?: number | null;
  extension_fee?: number | null;
  late_penalty_pct_per_day?: number | null;
  data_access_contacts?: boolean;
  requires_upfront_payment?: boolean;
  third_party_collection?: boolean;
  has_rate_and_method?: boolean;
};

export type Finding = {
  rule_id: string;
  severity: "red" | "yellow" | string;
  message: string;
  legal_ref: string;
};

export type RiskLevel = "green" | "yellow" | "red";

export type Assessment = {
  risk_level: RiskLevel;
  lender_status: string;
  amount_received: number;
  total_repaid: number;
  total_cost: number;
  apr_simple: number;
  scenarios: Record<string, number>;
  findings: Finding[];
  explanation: string;
};

export type ChecklistItem = {
  id: string;
  text: string;
};

export type AftercareResult = {
  lender_status: string;
  principal_received: number;
  lawful_interest: number;
  excess_charge: number;
  total_demanded: number;
  excess_applies: boolean;
  checklist: ChecklistItem[];
  note: string;
};

export type DebtIn = {
  label: string;
  due: string;
  amount: number;
};

export type TodayRequest = {
  today: string;
  cash_on_hand: number;
  next_payday: string;
  avg_daily_spend: number;
  debts?: DebtIn[];
  fixed?: DebtIn[];
  buffer?: number;
};

export type Shortfall = {
  debt_label: string;
  due: string;
  missing: number;
};

export type TodayResult = {
  spendable_today: number;
  days_until_payday: number;
  shortfalls: Shortfall[];
};

export type ExtractInput = {
  file?: Blob | File;
  filename?: string;
  text?: string;
  sample_id?: string;
};

export class ApiError extends Error {
  readonly status?: number;
  readonly isNetworkError: boolean;

  constructor(message: string, status?: number, isNetworkError = false) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.isNetworkError = isNetworkError;
  }
}

function buildAnonHeaders(): Record<string, string> {
  const anonId = getAnonId();
  if (anonId) {
    return { "X-Anon-Id": anonId };
  }
  return {};
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, init);
  } catch {
    throw new ApiError(
      "Không kết nối được máy chủ. Bạn kiểm tra mạng hoặc thử lại sau ít phút nhé.",
      undefined,
      true,
    );
  }

  if (!res.ok) {
    let msg = `Máy chủ tạm thời chưa phản hồi được (mã ${res.status}). Bạn thử lại sau ít phút nhé.`;
    try {
      const data: unknown = await res.json();
      if (typeof data === "object" && data !== null && "detail" in data) {
        const detail = (data as { detail: unknown }).detail;
        if (typeof detail === "string" && detail.trim().length > 0) {
          msg = detail;
        } else if (Array.isArray(detail)) {
          msg = "Thông tin chưa hợp lệ, bạn kiểm tra lại các ô vừa nhập nhé.";
        }
      }
    } catch {
      // Giữ thông báo mặc định tiếng Việt nếu phản hồi không phải JSON
    }
    throw new ApiError(msg, res.status, false);
  }

  return (await res.json()) as T;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAnonHeaders(),
    },
    body: JSON.stringify(body),
  });
}

async function postForm<T>(path: string, form: FormData): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: {
      ...buildAnonHeaders(),
    },
    body: form,
  });
}

export const api = {
  needOptions: (p: NeedProfile): Promise<NeedOptions> =>
    postJson<NeedOptions>("/need/options", p),

  draft: (alt_id: string, values: Record<string, string>): Promise<{ text: string }> =>
    postJson<{ text: string }>("/messages/draft", { alt_id, values }),

  extract: (input: ExtractInput): Promise<ExtractResponse> => {
    const form = new FormData();
    if (input.file) {
      form.append("file", input.file, input.filename ?? "contract.jpg");
    }
    if (input.text) {
      form.append("text", input.text);
    }
    if (input.sample_id) {
      form.append("sample_id", input.sample_id);
    }
    return postForm<ExtractResponse>("/loan/extract", form);
  },

  assess: (loan: ConfirmedLoan): Promise<Assessment> =>
    postJson<Assessment>("/loan/assess", loan),

  aftercareAssess: async (loan: ConfirmedLoan): Promise<AftercareResult> => {
    if (USE_MOCKS) {
      return aftercareMock as AftercareResult;
    }
    return postJson<AftercareResult>("/aftercare/assess", loan);
  },

  planToday: async (req: TodayRequest): Promise<TodayResult> => {
    if (USE_MOCKS) {
      return planTodayMock as TodayResult;
    }
    return postJson<TodayResult>("/plan/today", req);
  },
};

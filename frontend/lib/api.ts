const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type NeedProfile = {
  purpose: "hoc_phi" | "tien_nha" | "vien_phi" | "tra_no_cu" | "khac";
  amount_band: "duoi_5tr" | "5_20tr" | "tren_20tr";
  deadline?: string;
  has_salary?: boolean;
  has_asset?: boolean;
  bad_debt?: "co" | "khong" | "khong_biet";
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

export type Finding = { rule_id: string; severity: "red" | "yellow"; message: string; legal_ref: string };

export type Assessment = {
  risk_level: "green" | "yellow" | "red";
  lender_status: string;
  amount_received: number;
  total_repaid: number;
  total_cost: number;
  apr_simple: number;
  scenarios: Record<string, number>;
  findings: Finding[];
  explanation: string;
};

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Lỗi ${res.status}: ${await res.text()}`);
  return (await res.json()) as T;
}

export const api = {
  needOptions: (p: NeedProfile) => post<{ options: Option[]; note: string }>("/need/options", p),
  draft: (alt_id: string, values: Record<string, string>) => post<{ text: string }>("/messages/draft", { alt_id, values }),
  assess: (loan: unknown) => post<Assessment>("/loan/assess", loan),
};

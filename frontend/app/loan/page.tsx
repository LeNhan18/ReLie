"use client";

import { useState } from "react";
import { api, type Assessment } from "@/lib/api";

// Mẫu hư cấu để demo khi chưa nối luồng upload ảnh → /loan/extract → form xác nhận
const SAMPLE_XANHCASH = {
  lender_name: "Công ty TNHH Công nghệ Tài chính XanhCash",
  amount_received: 3_000_000,
  disbursed_date: "2026-11-20",
  schedule: [{ on: "2026-12-04", amount: 4_200_000 }],
  rate_stated_pct_year: 0,
  extension_fee: 800_000,
  late_penalty_pct_per_day: 5,
  data_access_contacts: true,
};

const RISK_STYLE = {
  red: "border-red-300 bg-red-50 text-red-800",
  yellow: "border-amber-300 bg-amber-50 text-amber-800",
  green: "border-emerald-300 bg-emerald-50 text-emerald-800",
};

export default function LoanPage() {
  const [result, setResult] = useState<Assessment | null>(null);
  const [error, setError] = useState("");

  async function runSample() {
    setError("");
    try {
      setResult(await api.assess(SAMPLE_XANHCASH));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi, bạn thử lại nhé");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Kiểm tra khoản vay</h1>
      <button onClick={runSample} className="w-full rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white">
        Thử với hợp đồng mẫu XanhCash
      </button>
      {error && <p className="text-red-700">{error}</p>}
      {result && (
        <div className={`rounded-xl border p-4 ${RISK_STYLE[result.risk_level]}`}>
          <p className="font-semibold">{result.explanation}</p>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {result.findings.map((f) => (
              <li key={f.rule_id}>
                {f.message} <span className="opacity-70">({f.legal_ref})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

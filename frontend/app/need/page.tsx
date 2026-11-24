"use client";

import { useState } from "react";
import { api, type NeedProfile, type Option } from "@/lib/api";

const PURPOSES: [NeedProfile["purpose"], string][] = [
  ["hoc_phi", "Học phí"], ["tien_nha", "Tiền nhà"], ["vien_phi", "Viện phí"], ["tra_no_cu", "Trả nợ cũ"], ["khac", "Khác"],
];
const FIT_LABEL: Record<Option["fit"], string> = { cao: "Phù hợp cao", co_the: "Có thể", kho: "Khó" };

export default function NeedPage() {
  const [purpose, setPurpose] = useState<NeedProfile["purpose"] | null>(null);
  const [options, setOptions] = useState<Option[] | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  async function choose(p: NeedProfile["purpose"]) {
    setPurpose(p);
    setError("");
    try {
      const r = await api.needOptions({ purpose: p, amount_band: "duoi_5tr" });
      setOptions(r.options);
      setNote(r.note);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi, bạn thử lại nhé");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Bạn đang cần tiền cho việc gì?</h1>
      <div className="flex flex-wrap gap-2">
        {PURPOSES.map(([k, label]) => (
          <button
            key={k}
            onClick={() => choose(k)}
            className={`rounded-full border px-4 py-2 ${purpose === k ? "border-teal-600 bg-teal-50" : "border-slate-300"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {error && <p className="text-red-700">{error}</p>}
      {options && (
        <ul className="space-y-3">
          {options.map((o) => (
            <li key={o.option_id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="font-semibold">{o.title}</div>
              <div className="text-sm text-slate-600">
                {o.cost_note} · {o.speed} · {FIT_LABEL[o.fit]}
              </div>
            </li>
          ))}
          <p className="text-xs text-slate-500">{note}</p>
        </ul>
      )}
    </div>
  );
}

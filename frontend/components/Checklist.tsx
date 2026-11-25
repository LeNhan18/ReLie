"use client";

import { useState } from "react";
import type { ChecklistItem } from "@/lib/api";

export type ChecklistProps = {
  items: ChecklistItem[];
  title?: string;
};

export function Checklist({
  items,
  title = "Những việc bạn nên làm ngay",
}: ChecklistProps) {
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setCheckedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>

      {items.length === 0 ? (
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          Hiện chưa có mục hướng dẫn nào cần đánh dấu.
        </p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {items.map((item) => {
            const checked = Boolean(checkedMap[item.id]);
            return (
              <li key={item.id}>
                <label
                  className={`flex min-h-[52px] w-full cursor-pointer items-center gap-3.5 rounded-xl border p-3.5 text-base leading-relaxed transition ${
                    checked
                      ? "border-emerald-300 bg-emerald-50 text-slate-600"
                      : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleItem(item.id)}
                    className="h-5 w-5 shrink-0 accent-teal-700"
                  />
                  <span className={checked ? "line-through" : "font-medium"}>
                    {item.text}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

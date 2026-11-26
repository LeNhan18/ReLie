"use client";

import { useState } from "react";
import type { ChecklistItem } from "@/lib/api";

export type ChecklistProps = {
  items: ChecklistItem[];
  title?: string;
  subtitle?: string;
};

export function Checklist({
  items,
  title = "Việc nên làm ngay",
  subtitle,
}: ChecklistProps) {
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setCheckedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const totalCount = items.length;
  const checkedCount = items.reduce(
    (acc, item) => (checkedMap[item.id] ? acc + 1 : acc),
    0,
  );

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        {totalCount > 0 ? (
          <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-800 tabular-nums">
            {checkedCount}/{totalCount}
          </span>
        ) : null}
      </div>

      {totalCount === 0 ? (
        <p className="mt-2 text-sm text-slate-500">Không có mục nào cần đánh dấu.</p>
      ) : (
        <ul className="mt-2.5 divide-y divide-slate-100">
          {items.map((item) => {
            const checked = Boolean(checkedMap[item.id]);
            return (
              <li key={item.id}>
                <label className="flex min-h-[48px] cursor-pointer items-center gap-3 py-2.5 text-sm leading-snug">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleItem(item.id)}
                    className="h-5 w-5 shrink-0 rounded accent-teal-700"
                  />
                  <span className={checked ? "text-slate-400 line-through" : "font-medium text-slate-800"}>
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

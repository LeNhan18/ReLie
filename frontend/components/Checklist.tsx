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
  title = "Những việc bạn nên làm ngay",
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
  const allCompleted = totalCount > 0 && checkedCount === totalCount;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold leading-snug text-slate-900">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-base leading-relaxed text-slate-600">{subtitle}</p>
          ) : null}
        </div>

        {totalCount > 0 ? (
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold tabular-nums ${
              allCompleted
                ? "border border-emerald-300 bg-emerald-50 text-emerald-900"
                : "border border-teal-200 bg-teal-50 text-teal-900"
            }`}
          >
            <span>Đã đánh dấu</span>
            <span>
              {checkedCount} / {totalCount}
            </span>
          </span>
        ) : null}
      </div>

      {totalCount > 0 ? (
        <div
          aria-hidden="true"
          className="mt-3 flex gap-1.5"
        >
          {items.map((item, idx) => (
            <div
              key={`bar-${item.id}`}
              className={`h-2 flex-1 rounded-full transition-colors ${
                idx < checkedCount ? "bg-teal-600" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      ) : null}

      {totalCount === 0 ? (
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          Hiện chưa có mục hướng dẫn nào cần đánh dấu.
        </p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {items.map((item) => {
            const checked = Boolean(checkedMap[item.id]);
            return (
              <li key={item.id}>
                <label
                  className={`flex min-h-[52px] w-full cursor-pointer items-center gap-3.5 rounded-xl border p-3.5 text-base leading-relaxed transition ${
                    checked
                      ? "border-emerald-300 bg-emerald-50/80 text-slate-600"
                      : "border-slate-200 bg-white text-slate-900 hover:border-teal-400 hover:bg-slate-50/80"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleItem(item.id)}
                    className="h-5 w-5 shrink-0 rounded accent-teal-700"
                  />
                  <span className={`flex-1 ${checked ? "line-through" : "font-medium"}`}>
                    {item.text}
                  </span>
                  {checked ? (
                    <span
                      aria-hidden="true"
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.3a1 1 0 0 1-1.42 0l-3.75-3.775a1 1 0 1 1 1.42-1.41l3.04 3.06 6.54-6.585a1 1 0 0 1 1.414-.004Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  ) : null}
                </label>
              </li>
            );
          })}
        </ul>
      )}

      {allCompleted ? (
        <p
          role="status"
          aria-live="polite"
          className="mt-3.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-medium leading-relaxed text-emerald-950"
        >
          Bạn đã nắm đủ các bước quan trọng. Cứ bình tĩnh thực hiện lần lượt nhé.
        </p>
      ) : null}
    </section>
  );
}

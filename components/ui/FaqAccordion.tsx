"use client";

import { useState } from "react";

export type FaqEntry = { question: string; answer: string };

// Screen 30's FAQ accordion — single-open-at-a-time, matching the
// mockup's toggleFaq() (opening one closes any other that was open).
export function FaqAccordion({ items }: { items: FaqEntry[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-neutral-200 overflow-hidden rounded-2xl border-[1.5px] border-neutral-200 bg-white lg:mx-0">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left text-[0.88rem] font-bold text-neutral-900 hover:bg-neutral-50"
            >
              {item.question}
              <span
                className={`shrink-0 text-[0.8rem] text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`}
              >
                ▾
              </span>
            </button>
            {open && (
              <div className="px-4 pb-3.5 text-[0.82rem] leading-relaxed text-neutral-700">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useState } from "react";

export function SydneyPpiFaqAccordion({
  items,
}: {
  items: readonly { q: string; a: string }[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <ul className="w-full divide-y divide-white/10">
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <li key={item.q}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : index)}
              className="flex w-full items-center justify-between gap-6 py-5 text-left sm:py-6"
            >
              <span className="text-base font-semibold text-white sm:text-lg">
                {item.q}
              </span>
              <span className="text-xl font-light text-accent-400" aria-hidden>
                {open ? "×" : "+"}
              </span>
            </button>
            {open ? (
              <p className="max-w-4xl pb-5 text-sm leading-relaxed text-slate-400 sm:pb-6 sm:text-base">
                {item.a}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
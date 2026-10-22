"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

export type AccordionItem = { id: string; title: React.ReactNode; body: React.ReactNode };

/** Disclosure list: each question is a button controlling its own answer panel. */
export function Accordion({ items, headingLevel = 3 }: { items: AccordionItem[]; headingLevel?: 2 | 3 }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const H = `h${headingLevel}` as "h2" | "h3";
  return (
    <ul data-accordion className="divide-y divide-line rounded-2xl border border-line bg-white">
      {items.map((item) => {
        const isOpen = !!open[item.id];
        return (
          <li key={item.id}>
            <H className="m-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`acc-${item.id}`}
                onClick={() => setOpen((o) => ({ ...o, [item.id]: !o[item.id] }))}
                className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left font-semibold text-ink hover:text-green-700 sm:px-6"
              >
                <span>{item.title}</span>
                <Icon name="chevron" className={`mt-0.5 h-5 w-5 shrink-0 text-gold-600 transition ${isOpen ? "rotate-180" : ""}`} />
              </button>
            </H>
            <div id={`acc-${item.id}`} hidden={!isOpen} className="px-5 pb-5 text-ink/80 sm:px-6">
              {item.body}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

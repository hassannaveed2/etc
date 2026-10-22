"use client";

import { useRef, useState } from "react";

// The 13-step test development workflow (mockup quality.html inline script).
const STEPS: [string, string, "In-house" | "External"][] = [
  ["Test blueprint", "The purpose, content areas, number of items and thinking levels are fixed in a Table of Specifications.", "In-house"],
  ["Item development", "Trained subject experts write new items to match the blueprint.", "External"],
  ["Data entry", "Items are entered in the standard ETC format with their tags (subject, topic, level).", "In-house"],
  ["Web tracking", "Each item is tracked online, so its status and history are always known.", "In-house"],
  ["Blind peer review", "Independent experts review items without knowing who wrote them.", "External"],
  ["1st editorial review", "Language, grammar, clarity and format are checked and corrected.", "In-house"],
  ["Pre-test assembly", "Reviewed items are assembled into pilot papers.", "In-house"],
  ["Pre-testing", "Pilot papers are taken by real students at partner institutions.", "External"],
  ["2nd editorial review", "Items are revised using the pilot statistics and reviewer comments.", "In-house"],
  ["Final assembly & proofreading", "The live paper is assembled from approved items and carefully proofread.", "In-house"],
  ["Answer key", "The answer key is developed and independently verified.", "In-house"],
  ["Post-hoc analysis", "After the live test, every item and the whole test are analysed again.", "In-house"],
  ["Databank placement", "Items that meet the standards are stored in the calibrated bank with their statistics.", "In-house"],
];

/** Vertical tabs on large screens, a numbered grid on small ones; arrow keys, Home and End move between steps. */
export function Workflow() {
  const [sel, setSel] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const select = (i: number) => {
    const n = (i + STEPS.length) % STEPS.length;
    setSel(n);
    refs.current[n]?.focus();
  };
  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-12">
      <div role="tablist" aria-label="Workflow steps" aria-orientation="vertical" className="grid grid-cols-4 gap-2 sm:grid-cols-7 lg:col-span-5 lg:grid-cols-1">
        {STEPS.map(([title], i) => (
          <button
            key={title}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`wf-tab-${i + 1}`}
            aria-controls={`wf-panel-${i + 1}`}
            aria-selected={i === sel}
            aria-label={`${i + 1}. ${title}`}
            tabIndex={i === sel ? 0 : -1}
            onClick={() => setSel(i)}
            onKeyDown={(e) => {
              const k = e.key;
              const next =
                k === "ArrowDown" || k === "ArrowRight" ? sel + 1 : k === "ArrowUp" || k === "ArrowLeft" ? sel - 1 : k === "Home" ? 0 : k === "End" ? STEPS.length - 1 : null;
              if (next === null) return;
              e.preventDefault();
              select(next);
            }}
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ring-1 ring-line hover:ring-green-700 aria-selected:bg-green-700 aria-selected:text-white aria-selected:ring-green-700"
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-mint-50 font-serif text-green-700 group-aria-selected:bg-gold-500 group-aria-selected:text-green-950">
              {i + 1}
            </span>
            <span className="hidden font-medium lg:inline">{title}</span>
          </button>
        ))}
      </div>
      <div className="lg:col-span-7">
        {STEPS.map(([title, text, who], i) => {
          const ext = who === "External";
          return (
            <div
              key={title}
              role="tabpanel"
              id={`wf-panel-${i + 1}`}
              aria-labelledby={`wf-tab-${i + 1}`}
              tabIndex={0}
              hidden={i !== sel}
              className="on-dark rounded-2xl bg-green-900 p-8 text-white sm:p-10 lg:sticky lg:top-48"
            >
              <p className="font-serif text-7xl font-semibold text-gold-300">
                {String(i + 1).padStart(2, "0")}
                <span className="text-2xl text-white/40"> / 13</span>
              </p>
              <h3 className="mt-4 font-serif text-3xl font-semibold">{title}</h3>
              <p className="mt-4 text-lg text-white/85">{text}</p>
              <p
                className={`mt-8 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                  ext ? "bg-gold-500 text-green-950" : "bg-white/10 text-white"
                }`}
              >
                {ext ? "Involves external experts" : "Carried out in-house by ETC"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const BANKS: [string, number][] = [
  ["Verbal Reasoning", 32976],
  ["Quantitative Reasoning", 29276],
  ["Physical & Biological Sciences", 22596],
  ["Business, Commerce & Economics", 22046],
  ["Pakistan Studies & General Knowledge", 14911],
  ["Analytical Reasoning", 14483],
  ["IQ", 13947],
  ["Computer Science & IT", 11460],
  ["Social Sciences, Humanities & Education", 8667],
  ["Medical & Health (academic)", 8090],
  ["Languages", 5543],
  ["Islamic Studies & Ethics", 4315],
];

export function BankBars() {
  const max = BANKS[0][1];
  return (
    <ul className="mt-5 space-y-3">
      {BANKS.map(([name, n]) => (
        <li key={name} className="grid grid-cols-12 items-center gap-3 text-sm">
          <span className="col-span-5 text-ink/80 sm:col-span-4">{name}</span>
          <span className="col-span-5 h-3 rounded-full bg-mint-50 sm:col-span-6" aria-hidden="true">
            <span className="block h-full rounded-full bg-green-600" style={{ width: `${((n / max) * 100).toFixed(1)}%` }} />
          </span>
          <span className="col-span-2 text-right font-semibold tabular-nums">{n.toLocaleString("en-US")}</span>
        </li>
      ))}
    </ul>
  );
}

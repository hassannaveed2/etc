"use client";

import type { UsatCategory } from "@/lib/content/types";
import { Tabs } from "../Tabs";

const LEVEL_NAMES = ["Knowledge", "Understanding", "Application", "Analysis", "Evaluation", "Create"];
const LEVEL_COLORS = ["#DCEBE2", "#9CC7AE", "#2E7D5B", "#1F5E45", "#B8913A", "#7A5C1E"];

function BloomBar({ levels }: { levels: number[] }) {
  const total = levels.reduce((a, b) => a + b, 0) || 1;
  return (
    <>
      <div
        className="mt-4 flex h-4 overflow-hidden rounded-full ring-1 ring-line"
        role="img"
        aria-label={`Thinking-level profile: ${levels.map((v, k) => `${LEVEL_NAMES[k]} ${v}`).join(", ")}`}
      >
        {levels.map((v, k) =>
          v ? (
            <span
              key={k}
              title={`${LEVEL_NAMES[k]}: ${v}`}
              className="h-full"
              style={{ width: `${((v / total) * 100).toFixed(2)}%`, background: LEVEL_COLORS[k] }}
            />
          ) : null,
        )}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted" aria-hidden="true">
        {levels.map((v, k) => (
          <li key={k} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm ring-1 ring-black/5" style={{ background: LEVEL_COLORS[k] }} />
            {LEVEL_NAMES[k]} <span className="font-semibold text-ink">{v}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

/** USAT streams as tabs, each with its subjects and Bloom's thinking-level profile (mockup render.js usatExtras). */
export function UsatCategories({ categories }: { categories: UsatCategory[] }) {
  return (
    <div className="mt-5">
      <Tabs
        label="USAT categories"
        tabs={categories.map((c) => ({
          id: c.code,
          label: c.code,
          panel: (
            <div className="rounded-xl border border-line bg-white p-6">
              <p className="text-sm text-muted">{c.stream}</p>
              <p className="mt-1 font-serif text-2xl text-green-700">{c.code}</p>
              <p className="mt-4 text-sm">
                <span className="font-semibold">Discipline-specific subjects (30 MCQs):</span> {c.subjects}
              </p>
              <p className="mt-6 text-sm font-semibold">Thinking-level profile of all 75 MCQs</p>
              <BloomBar levels={c.levels} />
            </div>
          ),
        }))}
      />
    </div>
  );
}

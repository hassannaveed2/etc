"use client";

import { useRef, useState } from "react";

export type TabItem = { id: string; label: React.ReactNode; panel: React.ReactNode };

/** WAI-ARIA tabs: arrow keys move (wrapping), Home/End jump, inactive panels stay in the DOM but hidden. */
export function Tabs({
  label,
  tabs,
  onChange,
  tabClassName = "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold text-muted ring-1 ring-line hover:text-green-700 aria-selected:bg-green-700 aria-selected:text-white aria-selected:ring-green-700",
  listClassName = "no-scrollbar flex gap-2 overflow-x-auto pb-1",
  panelsClassName = "mt-4",
}: {
  label: string;
  tabs: TabItem[];
  onChange?: (id: string) => void;
  tabClassName?: string;
  listClassName?: string;
  panelsClassName?: string;
}) {
  const [selected, setSelected] = useState(tabs[0]?.id);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function select(id: string, focus = false) {
    setSelected(id);
    onChange?.(id);
    if (focus) refs.current[id]?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent, k: number) {
    const last = tabs.length - 1;
    const next =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? k + 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? k - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : null;
    if (next === null) return;
    e.preventDefault();
    select(tabs[(next + tabs.length) % tabs.length].id, true);
  }

  return (
    <div>
      <div role="tablist" aria-label={label} className={listClassName}>
        {tabs.map((t, k) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[t.id] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-controls={`panel-${t.id}`}
            aria-selected={t.id === selected}
            tabIndex={t.id === selected ? 0 : -1}
            onClick={() => select(t.id)}
            onKeyDown={(e) => onKeyDown(e, k)}
            className={tabClassName}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className={panelsClassName}>
        {tabs.map((t) => (
          <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} tabIndex={0} hidden={t.id !== selected}>
            {t.panel}
          </div>
        ))}
      </div>
    </div>
  );
}

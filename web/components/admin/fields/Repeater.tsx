"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useFieldError } from "./Field";

/**
 * Repeatable rows (test sections, syllabus items, attachments…). Each row's inputs are named `${name}.${index}.…`
 * so formDataToObject rebuilds the array in on-screen order. Rows keep stable keys, so typed values survive moves.
 */
export function Repeater<T>({
  name,
  legend,
  itemLabel,
  initial,
  blank,
  render,
  min = 0,
  max = 100,
  hint,
}: {
  name: string;
  legend: string;
  itemLabel: string;
  initial: T[];
  blank: T;
  render: (item: T, prefix: string, index: number) => React.ReactNode;
  min?: number;
  max?: number;
  hint?: string;
}) {
  const next = useRef(0);
  const keyed = (item: T) => ({ key: next.current++, item });
  const [rows, setRows] = useState(() => initial.map(keyed));
  const error = useFieldError(name);

  const move = (i: number, d: -1 | 1) =>
    setRows((r) => {
      const copy = [...r];
      [copy[i], copy[i + d]] = [copy[i + d], copy[i]];
      return copy;
    });

  const iconBtn = "grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-mint-50 hover:text-green-700 disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <fieldset id={`field-${name}`} tabIndex={-1} className="rounded-lg border border-line p-4">
      <legend className="px-1 text-sm font-semibold text-ink">{legend}</legend>
      {hint && <p className="mb-3 text-xs text-muted">{hint}</p>}
      {error && <p className="mb-3 text-sm font-medium text-red-700">{error}</p>}
      <ol className="space-y-3">
        {rows.map(({ key, item }, i) => (
          <li key={key} className="flex gap-3 rounded-md bg-mint-50/50 p-3 ring-1 ring-line">
            <span className="mt-2 w-6 shrink-0 text-right font-serif text-sm text-muted" aria-hidden="true">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">{render(item, `${name}.${i}`, i)}</div>
            <div className="flex shrink-0 flex-col gap-1">
              <button type="button" className={iconBtn} disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move ${itemLabel} ${i + 1} up`}>
                <Icon name="chevron" className="h-4 w-4 rotate-180" />
              </button>
              <button
                type="button"
                className={iconBtn}
                disabled={i === rows.length - 1}
                onClick={() => move(i, 1)}
                aria-label={`Move ${itemLabel} ${i + 1} down`}
              >
                <Icon name="chevron" className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={`${iconBtn} hover:text-red-700`}
                disabled={rows.length <= min}
                onClick={() => setRows((r) => r.filter((_, k) => k !== i))}
                aria-label={`Remove ${itemLabel} ${i + 1}`}
              >
                <Icon name="trash" className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ol>
      {rows.length < max && (
        <button
          type="button"
          onClick={() => setRows((r) => [...r, keyed(blank)])}
          className="mt-3 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold text-green-700 ring-1 ring-green-700/30 hover:bg-mint-50"
        >
          <Icon name="plus" className="h-4 w-4" />
          Add {itemLabel}
        </button>
      )}
    </fieldset>
  );
}

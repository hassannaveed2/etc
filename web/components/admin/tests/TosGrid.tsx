"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useFieldError } from "@/components/admin/fields/Field";
import type { Tos } from "@/lib/content/types";

type Row = { key: number; area: string; v: string[]; subtotal: boolean };

const BLANK_LEVELS = ["K", "U", "Ap", "An", "E", "C"];

/**
 * Table of Specifications editor: one number per content area and thinking level. Row totals update live here and
 * are recomputed on the server when saving. Inputs are named tos.rows.<r>.v.<c> for formDataToObject.
 */
export function TosGrid({ value }: { value: Tos | null }) {
  const next = useRef(0);
  const [levels, setLevels] = useState<string[]>(value?.levels ?? BLANK_LEVELS);
  const [rows, setRows] = useState<Row[]>(() =>
    (value?.rows ?? []).map((r) => ({ key: next.current++, area: r.area, v: r.v.map(String), subtotal: !!r.subtotal })),
  );
  const error = useFieldError("tos");

  const total = (r: Row) => r.v.reduce((a, x) => a + (Number(x) || 0), 0);
  const update = (i: number, change: Partial<Row>) => setRows((rs) => rs.map((r, k) => (k === i ? { ...r, ...change } : r)));
  const addRow = () => setRows((rs) => [...rs, { key: next.current++, area: "", v: levels.map(() => "0"), subtotal: false }]);

  if (!rows.length) {
    return (
      <div className="rounded-lg border border-dashed border-line p-5 text-center">
        <p className="text-sm text-muted">This test has no table of specifications.</p>
        <button type="button" onClick={addRow} className="mt-3 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold text-green-700 ring-1 ring-green-700/30 hover:bg-mint-50">
          <Icon name="plus" className="h-4 w-4" /> Add a table of specifications
        </button>
      </div>
    );
  }

  const cell = "w-14 rounded border border-line px-1.5 py-1 text-center text-sm tabular-nums focus:border-green-700 focus:outline-none";
  return (
    <div id="field-tos" tabIndex={-1}>
      {error && <p className="mb-2 text-sm font-medium text-red-700">{error}</p>}
      <div className="overflow-x-auto rounded-lg border border-line" role="region" aria-label="Table of specifications editor" tabIndex={0}>
        <table className="w-full text-sm">
          <thead className="bg-mint-50/70 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th scope="col" className="px-2 py-2 text-left">Content area</th>
              {levels.map((l, c) => (
                <th key={c} scope="col" className="px-1 py-2">
                  <label className="sr-only" htmlFor={`tos-level-${c}`}>
                    Level {c + 1} heading
                  </label>
                  <input
                    id={`tos-level-${c}`}
                    name={`tos.levels.${c}`}
                    value={l}
                    onChange={(e) => setLevels((ls) => ls.map((x, k) => (k === c ? e.target.value : x)))}
                    className={`${cell} font-semibold uppercase`}
                  />
                </th>
              ))}
              <th scope="col" className="px-2 py-2">Total</th>
              <th scope="col" className="px-2 py-2">Subtotal row</th>
              <th scope="col" className="px-2 py-2">
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r, i) => (
              <tr key={r.key} className={r.subtotal ? "bg-cream-50 font-semibold" : undefined}>
                <td className="px-2 py-1.5">
                  <input
                    name={`tos.rows.${i}.area`}
                    aria-label={`Row ${i + 1} content area`}
                    value={r.area}
                    onChange={(e) => update(i, { area: e.target.value })}
                    className="w-full min-w-[12rem] rounded border border-line px-2 py-1 text-sm focus:border-green-700 focus:outline-none"
                  />
                </td>
                {levels.map((l, c) => (
                  <td key={c} className="px-1 py-1.5 text-center">
                    <input
                      name={`tos.rows.${i}.v.${c}`}
                      aria-label={`${r.area || `Row ${i + 1}`}, ${l}`}
                      inputMode="numeric"
                      value={r.v[c] ?? "0"}
                      onChange={(e) => update(i, { v: levels.map((_, k) => (k === c ? e.target.value.replace(/[^\d]/g, "") : (r.v[k] ?? "0"))) })}
                      className={cell}
                    />
                  </td>
                ))}
                <td className="px-2 py-1.5 text-center font-semibold tabular-nums" data-testid={`tos-total-${i}`} aria-live="polite">
                  {total(r)}
                </td>
                <td className="px-2 py-1.5 text-center">
                  <input
                    type="checkbox"
                    name={`tos.rows.${i}.subtotal`}
                    aria-label={`${r.area || `Row ${i + 1}`} is a subtotal row`}
                    checked={r.subtotal}
                    onChange={(e) => update(i, { subtotal: e.target.checked })}
                    className="h-4 w-4 accent-green-700"
                  />
                </td>
                <td className="px-2 py-1.5 text-center">
                  <button
                    type="button"
                    onClick={() => setRows((rs) => rs.filter((_, k) => k !== i))}
                    aria-label={`Remove row ${r.area || i + 1}`}
                    className="grid h-7 w-7 place-items-center rounded text-muted hover:bg-red-50 hover:text-red-700"
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold text-green-700 ring-1 ring-green-700/30 hover:bg-mint-50">
          <Icon name="plus" className="h-4 w-4" /> Add row
        </button>
        <button
          type="button"
          onClick={() => window.confirm("Remove the whole table of specifications from this test?") && setRows([])}
          className="rounded-md px-3 py-1.5 text-sm font-semibold text-red-700 ring-1 ring-red-700/30 hover:bg-red-50"
        >
          Remove table
        </button>
      </div>
      <p className="mt-2 text-xs text-muted">Totals are worked out automatically. Tick “Subtotal row” for rows like “Verbal Reasoning subtotal”.</p>
    </div>
  );
}

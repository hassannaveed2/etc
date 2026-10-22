import type { Tos } from "@/lib/content/types";

/** Each row's total is the sum of its cells — recomputed on save, never taken from the browser. */
export function computeTosTotals(tos: Tos): Tos {
  return { ...tos, rows: tos.rows.map((r) => ({ ...r, total: r.v.reduce((a, b) => a + b, 0) })) };
}

type RawRow = { area?: unknown; v?: unknown[]; subtotal?: unknown };

/** Form strings → a TOS (numbers, booleans, computed totals), or null when the table has no rows. */
export function normalizeTos(raw: unknown): Tos | null {
  const t = raw as { levels?: unknown[]; rows?: RawRow[] } | null | undefined;
  if (!t || !Array.isArray(t.rows) || t.rows.length === 0) return null;
  const levels = (t.levels ?? []).map((l) => String(l ?? "").trim());
  return computeTosTotals({
    levels,
    rows: t.rows.map((r) => ({
      area: String(r.area ?? "").trim(),
      v: levels.map((_, k) => {
        const n = Number(r.v?.[k] ?? 0);
        return Number.isFinite(n) ? n : NaN;
      }),
      total: 0,
      subtotal: r.subtotal === "on" || r.subtotal === true,
    })),
  });
}

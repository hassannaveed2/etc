import type { TableParams } from "@/components/admin/DataTable";
import { first, parsePage, type SP } from "@/lib/filters";

export const ADMIN_PER_PAGE = 20;

/** Reads ?q, ?sort, ?dir, ?page and the named filter params for an admin list. Unknown sort keys fall back. */
export function tableParams(sp: SP, sortable: string[], fallback: { sort: string; dir: "asc" | "desc" }, filters: string[] = []): TableParams {
  const sort = first(sp.sort);
  const dir = first(sp.dir);
  const valid = sort && sortable.includes(sort);
  return {
    q: first(sp.q)?.trim().slice(0, 100) || undefined,
    sort: valid ? sort : fallback.sort,
    dir: valid ? (dir === "desc" ? "desc" : "asc") : fallback.dir,
    page: parsePage(sp.page),
    extra: Object.fromEntries(filters.map((f) => [f, first(sp[f]) || undefined])),
  };
}

/** Clamps the page for a total and returns skip/take. */
export function pageWindow(total: number, page: number, per = ADMIN_PER_PAGE) {
  const pages = Math.max(1, Math.ceil(total / per));
  const p = Math.min(Math.max(1, page), pages);
  return { pages, page: p, skip: (p - 1) * per, take: per };
}

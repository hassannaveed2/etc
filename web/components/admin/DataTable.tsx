import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { FilterForm } from "@/components/site/FilterForm";
import { Pagination } from "@/components/site/Pagination";

export type Column = { key: string; label: string; sortable?: boolean; className?: string };
export type Row = { id: number | string; cells: Record<string, React.ReactNode>; actions?: React.ReactNode };
export type TableParams = { q?: string; sort?: string; dir?: "asc" | "desc"; page: number; extra?: Record<string, string | undefined> };

function buildHref(basePath: string, p: TableParams, change: Partial<TableParams>) {
  const merged = { ...p, ...change };
  const sp = new URLSearchParams();
  if (merged.q) sp.set("q", merged.q);
  for (const [k, v] of Object.entries(merged.extra ?? {})) if (v) sp.set(k, v);
  if (merged.sort) sp.set("sort", merged.sort);
  if (merged.dir) sp.set("dir", merged.dir);
  if (merged.page > 1) sp.set("page", String(merged.page));
  const q = sp.toString();
  return q ? `${basePath}?${q}` : basePath;
}

/**
 * Admin list: search + filters (URL state), sortable headers, row actions, paging and an empty state that explains
 * the next step. Server-rendered; the search box updates the URL as you type.
 */
export function DataTable({
  caption,
  basePath,
  columns,
  rows,
  params,
  total,
  pages,
  filters,
  searchLabel = "Search",
  empty,
}: {
  caption: string;
  basePath: string;
  columns: Column[];
  rows: Row[];
  params: TableParams;
  total: number;
  pages: number;
  filters?: React.ReactNode;
  searchLabel?: string;
  empty: { title: string; text: string; action?: React.ReactNode };
}) {
  const filtered = !!params.q || Object.values(params.extra ?? {}).some(Boolean);
  return (
    <div className="rounded-xl border border-line bg-white shadow-sm">
      <FilterForm label={`Filter ${caption.toLowerCase()}`} className="flex flex-wrap items-end gap-3 border-b border-line p-4">
        <div className="min-w-[14rem] flex-1">
          <label htmlFor="table-q" className="block text-xs font-semibold uppercase tracking-wider text-muted">
            {searchLabel}
          </label>
          <div className="relative mt-1">
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              id="table-q"
              name="q"
              type="search"
              defaultValue={params.q ?? ""}
              className="block w-full rounded-md border border-line py-2 pl-9 pr-3 text-sm focus:border-green-700 focus:outline-none"
            />
          </div>
        </div>
        {filters}
        {params.sort && <input type="hidden" name="sort" value={params.sort} />}
        {params.dir && <input type="hidden" name="dir" value={params.dir} />}
        <button type="submit" className="rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800">
          Apply
        </button>
        {filtered && (
          <Link href={basePath} className="rounded-md px-3 py-2 text-sm font-semibold text-green-700 hover:bg-mint-50">
            Clear
          </Link>
        )}
      </FilterForm>

      {rows.length ? (
        <div className="overflow-x-auto" role="region" aria-label={caption} tabIndex={0}>
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              {caption} — {total} {total === 1 ? "item" : "items"}
            </caption>
            <thead className="border-b border-line bg-mint-50/60 text-xs uppercase tracking-wider text-muted">
              <tr>
                {columns.map((c) => {
                  const active = params.sort === c.key;
                  const nextDir = active && params.dir === "asc" ? "desc" : "asc";
                  return (
                    <th
                      key={c.key}
                      scope="col"
                      className={`px-4 py-3 font-semibold ${c.className ?? ""}`}
                      aria-sort={active ? (params.dir === "desc" ? "descending" : "ascending") : undefined}
                    >
                      {c.sortable ? (
                        <Link href={buildHref(basePath, params, { sort: c.key, dir: nextDir, page: 1 })} className="inline-flex items-center gap-1 hover:text-green-700">
                          {c.label}
                          <Icon name="chevron" className={`h-3.5 w-3.5 ${active ? "text-green-700" : "opacity-30"} ${active && params.dir === "asc" ? "rotate-180" : ""}`} />
                        </Link>
                      ) : (
                        c.label
                      )}
                    </th>
                  );
                })}
                <th scope="col" className="w-12 px-2 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-mint-50/40">
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-3 align-top ${c.className ?? ""}`}>
                      {r.cells[c.key]}
                    </td>
                  ))}
                  <td className="px-2 py-2 text-right align-top">{r.actions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-10 text-center">
          <p className="font-serif text-xl text-green-700">{filtered ? "Nothing matches these filters." : empty.title}</p>
          <p className="mt-1 text-sm text-muted">{filtered ? "Try a different search, or clear the filters." : empty.text}</p>
          {!filtered && empty.action && <div className="mt-5 flex justify-center">{empty.action}</div>}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm text-muted">
        <span>
          {total} {total === 1 ? "item" : "items"}
        </span>
        <div className="-mt-8">
          <Pagination page={params.page} hrefs={Array.from({ length: pages }, (_, k) => buildHref(basePath, params, { page: k + 1 }))} />
        </div>
      </div>
    </div>
  );
}

/** A compact select for DataTable filters (submits with the search form). */
export function TableFilter({ name, label, value, options }: { name: string; label: string; value?: string; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label htmlFor={`filter-${name}`} className="block text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </label>
      <select
        id={`filter-${name}`}
        name={name}
        defaultValue={value ?? ""}
        className="mt-1 block rounded-md border border-line py-2 pl-3 pr-8 text-sm focus:border-green-700 focus:outline-none"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}


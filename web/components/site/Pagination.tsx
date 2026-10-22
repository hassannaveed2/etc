"use client";

import Link from "next/link";
import { FOCUS_RESULTS_KEY } from "./ResultCount";

const CLS =
  "grid h-10 min-w-10 place-items-center rounded-md px-3 text-sm font-semibold ring-1 ring-line hover:ring-green-700 aria-[current=page]:bg-green-700 aria-[current=page]:text-white aria-[current=page]:ring-green-700";
const DISABLED = "grid h-10 min-w-10 place-items-center rounded-md px-3 text-sm font-semibold opacity-40 ring-1 ring-line";

/** Page links. After navigating, focus moves to the result count (see ResultCount). */
export function Pagination({ page, pages, makeHref }: { page: number; pages: number; makeHref: (n: number) => string }) {
  if (pages <= 1) return null;
  const mark = () => {
    try {
      sessionStorage.setItem(FOCUS_RESULTS_KEY, "1");
    } catch {}
  };
  const step = (n: number, label: string, glyph: string, disabled: boolean) =>
    disabled ? (
      <span className={DISABLED} aria-hidden="true">
        {glyph}
      </span>
    ) : (
      <Link href={makeHref(n)} onClick={mark} scroll={false} className={CLS} aria-label={label}>
        <span aria-hidden="true">{glyph}</span>
      </Link>
    );
  return (
    <nav aria-label="Pagination" className="mt-8">
      <ul className="flex flex-wrap items-center gap-2">
        <li>{step(page - 1, "Previous page", "‹", page === 1)}</li>
        {Array.from({ length: pages }, (_, k) => k + 1).map((n) => (
          <li key={n}>
            <Link
              href={makeHref(n)}
              onClick={mark}
              scroll={false}
              aria-current={n === page ? "page" : undefined}
              aria-label={`Page ${n}`}
              className={CLS}
            >
              {n}
            </Link>
          </li>
        ))}
        <li>{step(page + 1, "Next page", "›", page === pages)}</li>
      </ul>
    </nav>
  );
}

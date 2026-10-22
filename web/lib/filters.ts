// URL search params → typed filters → Prisma where clauses for the public lists.
// Unknown or malformed values are dropped, never errors (Review Focus 4).
import type { FaqCategory, NoticeType, Prisma, ResourceType } from "@prisma/client";
import { fromParam, NOTICE_TYPE, RESOURCE_TYPE } from "./labels";

export type SP = Record<string, string | string[] | undefined>;

export const NEWS_PER_PAGE = 8;
export const RESOURCES_PER_PAGE = 12;

const PERIODS = ["30", "90", "year"] as const;
export type Period = (typeof PERIODS)[number];

export type NoticeFilters = { type?: NoticeType; test?: string; period?: Period; q?: string; page: number };
export type ResourceFilters = { type?: ResourceType; test?: string; q?: string; page: number };

export function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export function parsePage(raw: string | string[] | undefined): number {
  const v = first(raw);
  return v && /^\d+$/.test(v) && Number(v) >= 1 ? Number(v) : 1;
}

export function paginate(total: number, page: number, perPage: number) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  const p = Math.min(Math.max(1, page), pages);
  return { page: p, pages, skip: (p - 1) * perPage, take: perPage };
}

function parseTest(raw: string | string[] | undefined, testSlugs: string[]): string | undefined {
  const v = first(raw);
  return v === "general" || (v && testSlugs.includes(v)) ? v : undefined;
}

function parseQuery(raw: string | string[] | undefined): string | undefined {
  const q = first(raw)?.trim().slice(0, 100);
  return q || undefined;
}

/** Drops undefined keys so filters compare and serialise cleanly. */
function compact<T extends object>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;
}

export function parseNoticeFilters(sp: SP, testSlugs: string[]): NoticeFilters {
  const period = first(sp.period);
  return compact({
    type: fromParam(NOTICE_TYPE, first(sp.type)),
    test: parseTest(sp.test, testSlugs),
    period: (PERIODS as readonly string[]).includes(period ?? "") ? (period as Period) : undefined,
    q: parseQuery(sp.q),
    page: parsePage(sp.page),
  });
}

export function sinceDate(period: Period | undefined, today: Date): Date | null {
  if (!period) return null;
  if (period === "year") return new Date(Date.UTC(today.getUTCFullYear(), 0, 1));
  return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - Number(period)));
}

function testClause(test: string | undefined) {
  if (!test) return {};
  return test === "general" ? { testId: null } : { test: { slug: test } };
}

export function noticeWhere(f: NoticeFilters, today: Date): Prisma.NoticeWhereInput {
  const since = sinceDate(f.period, today);
  return compact({
    published: true,
    type: f.type,
    ...testClause(f.test),
    publishedAt: since ? { gte: since } : undefined,
    OR: f.q ? [{ title: { contains: f.q } }, { summary: { contains: f.q } }] : undefined,
  });
}

export function parseResourceFilters(sp: SP, testSlugs: string[]): ResourceFilters {
  return compact({
    type: fromParam(RESOURCE_TYPE, first(sp.type)),
    test: parseTest(sp.test, testSlugs),
    q: parseQuery(sp.q),
    page: parsePage(sp.page),
  });
}

export function resourceWhere(f: ResourceFilters): Prisma.ResourceWhereInput {
  return compact({
    published: true,
    type: f.type,
    ...testClause(f.test),
    title: f.q ? { contains: f.q } : undefined,
  });
}

/** Client-side FAQ search (live as the user types): question or answer text, optionally within a category. */
export function searchFaqs<T extends { question: string; answer: string; category: FaqCategory }>(
  list: T[],
  q: string,
  category?: FaqCategory,
): T[] {
  const needle = q.trim().toLowerCase();
  return list.filter(
    (f) =>
      (!category || f.category === category) &&
      (!needle || `${f.question} ${f.answer}`.toLowerCase().includes(needle)),
  );
}

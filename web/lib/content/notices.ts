import { prisma } from "@/lib/db";
import { cached, TAGS } from "@/lib/cache";
import { formatBytes } from "@/lib/format";
import { NEWS_PER_PAGE, noticeWhere, paginate, type NoticeFilters } from "@/lib/filters";
import { noticeInclude, noticeRow } from "./shape";
import type { NoticeDetail, NoticeRow, Paged } from "./types";

const newestFirst = [{ publishedAt: "desc" as const }, { id: "desc" as const }];

export async function _getLatestNotices(n: number): Promise<NoticeRow[]> {
  const rows = await prisma.notice.findMany({ where: { published: true }, orderBy: newestFirst, take: n, include: noticeInclude });
  return rows.map(noticeRow);
}

export async function _searchNotices(f: NoticeFilters, today: Date): Promise<Paged<NoticeRow>> {
  const where = noticeWhere(f, today);
  const total = await prisma.notice.count({ where });
  const { page, pages, skip, take } = paginate(total, f.page, NEWS_PER_PAGE);
  const rows = await prisma.notice.findMany({ where, orderBy: newestFirst, skip, take, include: noticeInclude });
  return { items: rows.map(noticeRow), total, page, pages };
}

export async function _getNoticeBySlug(slug: string): Promise<NoticeDetail | null> {
  const n = await prisma.notice.findFirst({
    where: { slug, published: true },
    include: { ...noticeInclude, attachments: { orderBy: { order: "asc" }, include: { media: true } } },
  });
  if (!n) return null;
  const related = await prisma.notice.findMany({
    where: { published: true, testId: n.testId, NOT: { id: n.id } },
    orderBy: newestFirst,
    take: 3,
    include: noticeInclude,
  });
  return {
    ...noticeRow(n),
    bodyHtml: n.bodyHtml,
    attachments: n.attachments.map((a) => ({ label: a.label, url: a.media.url, sizeLabel: formatBytes(a.media.size) })),
    related: related.map(noticeRow),
    seoTitle: n.seoTitle,
    seoDescription: n.seoDescription,
    updatedAt: n.updatedAt.toISOString(),
  };
}

/** Published notices whose deadline falls within `days` of today (admin dashboard). */
export async function _getClosingSoon(today: Date, days: number): Promise<NoticeRow[]> {
  const until = new Date(today.getTime() + days * 86_400_000);
  const rows = await prisma.notice.findMany({
    where: { published: true, deadline: { gte: today, lte: until } },
    orderBy: { deadline: "asc" },
    include: noticeInclude,
  });
  return rows.map(noticeRow);
}

const tags = [TAGS.notices, TAGS.tests, TAGS.media];
export const getLatestNotices = cached(_getLatestNotices, "notices:latest", tags);
export const searchNotices = cached(_searchNotices, "notices:search", tags);
export const getNoticeBySlug = cached(_getNoticeBySlug, "notices:detail", tags);

// Prisma rows → content DTOs. Shared by the content modules.
import type { Media, Notice, Resource, ScheduleEntry, Test } from "@prisma/client";
import { formatBytes, toIsoDate } from "@/lib/format";
import type { MediaRef, NoticeRow, ResourceCard, ScheduleItem, TestCard } from "./types";

export const mediaRef = (m: Media | null): MediaRef | null =>
  m ? { url: m.url, alt: m.alt, width: m.width, height: m.height } : null;

export const testCard = (t: Test & { image: Media | null }): TestCard => ({
  slug: t.slug,
  code: t.code,
  name: t.name,
  short: t.short,
  category: t.category,
  level: t.level,
  fee: t.fee,
  frequency: t.frequency,
  image: mediaRef(t.image),
});

export const noticeInclude = { test: { select: { slug: true, code: true } } } as const;

export const noticeRow = (n: Notice & { test: { slug: string; code: string } | null }): NoticeRow => ({
  slug: n.slug,
  title: n.title,
  type: n.type,
  testSlug: n.test?.slug ?? null,
  testCode: n.test?.code ?? "General",
  status: n.status,
  summary: n.summary,
  publishedAt: toIsoDate(n.publishedAt),
  deadline: n.deadline ? toIsoDate(n.deadline) : null,
  isSample: n.isSample,
});

export const resourceInclude = { test: { select: { code: true } }, media: true } as const;

export const resourceCard = (r: Resource & { test: { code: string } | null; media: Media }): ResourceCard => ({
  id: r.id,
  title: r.title,
  type: r.type,
  testCode: r.test?.code ?? "General",
  fileUrl: r.media.url,
  sizeLabel: formatBytes(r.media.size),
  date: toIsoDate(r.date),
  isSample: r.isSample,
});

export const scheduleItem = (s: ScheduleEntry & { test: { slug: string; code: string } }): ScheduleItem => ({
  session: s.session,
  testSlug: s.test.slug,
  testCode: s.test.code,
  regCloses: toIsoDate(s.regCloses),
  testDate: toIsoDate(s.testDate),
  status: s.status,
});

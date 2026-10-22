import { prisma } from "@/lib/db";
import { cached, TAGS } from "@/lib/cache";
import { mediaRef, noticeInclude, noticeRow, resourceCard, resourceInclude, scheduleItem, testCard } from "./shape";
import type { TestCard, TestDetail, Tos, UsatCategory } from "./types";

export async function _getPublishedTests(): Promise<TestCard[]> {
  const rows = await prisma.test.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" }, include: { image: true } });
  return rows.map(testCard);
}

export async function _getTestOptions(): Promise<{ slug: string; code: string }[]> {
  return prisma.test.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" }, select: { slug: true, code: true } });
}

export async function _getTestBySlug(slug: string): Promise<TestDetail | null> {
  const t = await prisma.test.findFirst({
    where: { slug, published: true },
    include: {
      image: true,
      sections: { orderBy: { order: "asc" } },
      notices: { where: { published: true }, orderBy: { publishedAt: "desc" }, take: 3, include: noticeInclude },
      resources: { where: { published: true }, orderBy: { date: "desc" }, include: resourceInclude },
      schedule: { where: { published: true }, orderBy: { testDate: "asc" }, take: 1, include: { test: true } },
    },
  });
  if (!t) return null;
  return {
    ...testCard(t),
    image: mediaRef(t.image),
    audience: t.audience,
    purpose: t.purpose,
    eligibility: t.eligibility,
    measures: t.measures,
    frequencyNote: t.frequencyNote,
    resultsUse: t.resultsUse,
    patternNote: t.patternNote,
    reliability: t.reliability,
    syllabus: t.syllabus as string[],
    categories: (t.categories as UsatCategory[] | null) ?? null,
    tos: (t.tos as Tos | null) ?? null,
    sections: t.sections.map((s) => ({ name: s.name, items: s.items, detail: s.detail })),
    seoTitle: t.seoTitle,
    seoDescription: t.seoDescription,
    updatedAt: t.updatedAt.toISOString(),
    notices: t.notices.map(noticeRow),
    resources: t.resources.map(resourceCard),
    schedule: t.schedule[0] ? scheduleItem(t.schedule[0]) : null,
  };
}

const testTags = [TAGS.tests, TAGS.media];
export const getPublishedTests = cached(_getPublishedTests, "tests:published", testTags);
export const getTestOptions = cached(_getTestOptions, "tests:options", [TAGS.tests]);
export const getTestBySlug = cached(_getTestBySlug, "tests:detail", [...testTags, TAGS.notices, TAGS.resources, TAGS.schedule]);

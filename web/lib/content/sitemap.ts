import { prisma } from "@/lib/db";

/** Published tests and notices for sitemap.xml, with their last change. */
export async function getSitemapEntries(): Promise<{ path: string; updatedAt: Date }[]> {
  const [tests, notices] = await Promise.all([
    prisma.test.findMany({ where: { published: true }, select: { slug: true, updatedAt: true }, orderBy: { sortOrder: "asc" } }),
    prisma.notice.findMany({ where: { published: true }, select: { slug: true, updatedAt: true }, orderBy: { publishedAt: "desc" } }),
  ]);
  return [
    ...tests.map((t) => ({ path: `/tests/${t.slug}`, updatedAt: t.updatedAt })),
    ...notices.map((n) => ({ path: `/news/${n.slug}`, updatedAt: n.updatedAt })),
  ];
}

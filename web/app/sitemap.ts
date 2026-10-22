import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/content/sitemap";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

const STATIC = ["/", "/about", "/tests", "/candidate-services", "/institutions", "/quality", "/news", "/resources", "/faqs", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl().replace(/\/$/, "");
  const entries = await getSitemapEntries();
  return [
    ...STATIC.map((p) => ({ url: `${base}${p === "/" ? "" : p}` || base, changeFrequency: "weekly" as const })),
    ...entries.map((e) => ({ url: `${base}${e.path}`, lastModified: e.updatedAt })),
  ];
}

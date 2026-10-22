import { unstable_cache } from "next/cache";

/** One cache tag per content type; every admin mutation revalidates the tags it touches (spec §2). */
export const TAGS = {
  tests: "tests",
  notices: "notices",
  resources: "resources",
  faqs: "faqs",
  hero: "hero",
  schedule: "schedule",
  stats: "stats",
  clients: "clients",
  leaders: "leaders",
  settings: "settings",
  media: "media",
} as const;

export type Tag = (typeof TAGS)[keyof typeof TAGS];

/** Wraps a query in the Next data cache. Results must be plain JSON (dates as ISO strings). */
export function cached<A extends unknown[], R>(fn: (...a: A) => Promise<R>, key: string, tags: Tag[]): (...a: A) => Promise<R> {
  // revalidate is only a safety net; publishes revalidate by tag immediately
  return unstable_cache(fn, [key], { tags, revalidate: 3600 });
}

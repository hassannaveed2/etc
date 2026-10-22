import { prisma } from "@/lib/db";
import { cached, TAGS } from "@/lib/cache";
import type { MediaRef } from "./types";

/**
 * Fixed decorative images used by static page sections (not editable content), looked up by Media key so
 * alt-text edits in the media library still apply. Missing keys return null.
 */
export async function _getMediaByKeys(keys: string[]): Promise<Record<string, MediaRef | null>> {
  const rows = await prisma.media.findMany({ where: { key: { in: keys } } });
  const byKey = new Map(rows.map((m) => [m.key, m]));
  return Object.fromEntries(
    keys.map((k) => {
      const m = byKey.get(k);
      return [k, m ? { url: m.url, alt: m.alt, width: m.width, height: m.height } : null];
    }),
  );
}

export const getMediaByKeys = cached(_getMediaByKeys, "media:keys", [TAGS.media]);

/** Image keys of the mockup's fixed section imagery. */
export const SECTION_IMAGES = {
  institutions: "mockup/images/institutions.jpg",
  qualityOmr: "mockup/images/quality-omr.jpg",
  qualitySealed: "mockup/images/quality-sealed.jpg",
  candidateCentre: "mockup/images/candidate-centre.jpg",
  aboutBuilding: "mockup/images/about-building.jpg",
  noticeDefault: "mockup/images/notice-default.jpg",
} as const;

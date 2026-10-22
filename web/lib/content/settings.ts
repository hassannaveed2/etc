import { prisma } from "@/lib/db";
import { cached, TAGS } from "@/lib/cache";
import { SETTINGS_KEYS, type SiteSettings } from "@/lib/validation/content";
import { settingsDefaults } from "@/prisma/seed-data/settings";

/** All site settings; keys missing from the database fall back to the seed defaults. */
export async function _getSettings(): Promise<SiteSettings> {
  const rows = await prisma.setting.findMany({ where: { key: { in: [...SETTINGS_KEYS] } } });
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...settingsDefaults, ...stored } as SiteSettings;
}

export const getSettings = cached(_getSettings, "settings:all", [TAGS.settings]);

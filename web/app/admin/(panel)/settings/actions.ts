"use server";

import { defineAction } from "@/lib/admin/action";
import { assertListUnchanged, listVersion } from "@/lib/admin/lock";
import type { SaveData } from "@/lib/admin/result";
import { prisma } from "@/lib/db";
import { settingsForm } from "@/lib/validation/admin";
import { SETTINGS_KEYS } from "@/lib/validation/content";

/** Admin only. Saves every setting at once; refused if someone else saved settings in the meantime. */
export const saveSettings = defineAction({
  permission: "settings:manage",
  schema: settingsForm,
  entity: "Setting",
  action: "UPDATE",
  tags: ["settings"],
  async run({ updatedAt, ...values }): Promise<SaveData> {
    await prisma.$transaction(async (tx) => {
      assertListUnchanged(await tx.setting.findMany({ select: { updatedAt: true } }), updatedAt);
      for (const key of SETTINGS_KEYS) {
        await tx.setting.upsert({ where: { key }, update: { value: values[key] }, create: { key, value: values[key] } });
      }
    });
    const rows = await prisma.setting.findMany({ select: { updatedAt: true } });
    return { id: 0, viewHref: "/contact", updatedAt: listVersion(rows) };
  },
  summary: () => "Updated site settings",
  paths: () => ["/", "/contact"],
});

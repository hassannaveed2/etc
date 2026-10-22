"use server";

import { defineAction } from "@/lib/admin/action";
import { assertListUnchanged, listVersion } from "@/lib/admin/lock";
import type { SaveData } from "@/lib/admin/result";
import { prisma } from "@/lib/db";
import { statsForm } from "@/lib/validation/admin";

/** Replaces the whole "ETC in numbers" list in screen order. */
export const saveStats = defineAction({
  permission: "content:write",
  schema: statsForm,
  entity: "Stat",
  action: "UPDATE",
  tags: ["stats"],
  async run({ updatedAt, items }): Promise<SaveData & { count: number }> {
    await prisma.$transaction(async (tx) => {
      assertListUnchanged(await tx.stat.findMany({ select: { updatedAt: true } }), updatedAt);
      await tx.stat.deleteMany();
      await tx.stat.createMany({ data: items.map((s, order) => ({ value: s.value, label: s.label, note: s.note, order })) });
    });
    const rows = await prisma.stat.findMany({ select: { updatedAt: true } });
    return { id: 0, count: items.length, viewHref: "/", updatedAt: listVersion(rows) };
  },
  summary: (d) => `Saved ${d.count} homepage numbers`,
  paths: () => ["/"],
});

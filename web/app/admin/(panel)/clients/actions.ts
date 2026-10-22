"use server";

import { defineAction } from "@/lib/admin/action";
import { assertListUnchanged, listVersion } from "@/lib/admin/lock";
import type { SaveData } from "@/lib/admin/result";
import { prisma } from "@/lib/db";
import { clientsForm } from "@/lib/validation/admin";

/** Replaces the client list in screen order (homepage marquee and Institutions › Clients). */
export const saveClients = defineAction({
  permission: "content:write",
  schema: clientsForm,
  entity: "Client",
  action: "UPDATE",
  tags: ["clients"],
  async run({ updatedAt, items }): Promise<SaveData & { count: number }> {
    await prisma.$transaction(async (tx) => {
      assertListUnchanged(await tx.client.findMany({ select: { updatedAt: true } }), updatedAt);
      await tx.client.deleteMany();
      await tx.client.createMany({ data: items.map((c, order) => ({ name: c.name, sector: c.sector, order })) });
    });
    const rows = await prisma.client.findMany({ select: { updatedAt: true } });
    return { id: 0, count: items.length, viewHref: "/institutions#clients", updatedAt: listVersion(rows) };
  },
  summary: (d) => `Saved ${d.count} clients`,
  paths: () => ["/", "/institutions"],
});

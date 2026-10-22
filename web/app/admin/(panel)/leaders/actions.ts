"use server";

import { defineAction } from "@/lib/admin/action";
import { updateLocked } from "@/lib/admin/lock";
import type { SaveData } from "@/lib/admin/result";
import { prisma } from "@/lib/db";
import { sanitizeRichText } from "@/lib/sanitize";
import { leaderForm } from "@/lib/validation/admin";

/** The three leadership roles are fixed: they are edited, never created or deleted. */
export const saveLeader = defineAction({
  permission: "content:write",
  schema: leaderForm,
  entity: "Leader",
  action: "UPDATE",
  tags: ["leaders"],
  async run(input): Promise<SaveData & { title: string }> {
    const l = await prisma.leader.findUniqueOrThrow({ where: { role: input.role } });
    await updateLocked(prisma.leader, l.id, input.updatedAt, {
      name: input.name,
      title: input.title,
      quote: input.quote,
      messageHtml: sanitizeRichText(input.messageHtml),
      photoId: input.photoId,
    });
    const after = await prisma.leader.findUniqueOrThrow({ where: { id: l.id }, select: { updatedAt: true } });
    return { id: l.id, title: input.title, viewHref: "/about#leadership", updatedAt: after.updatedAt.toISOString() };
  },
  entityId: (d) => String(d.id),
  summary: (d) => `Updated leadership message (${d.title})`,
  paths: () => ["/", "/about"],
});

"use server";

import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { defineAction, UserFacingError } from "@/lib/admin/action";
import { toMediaItem, type MediaItem } from "@/lib/admin/media";
import { findMediaUsage, mediaInUseMessage } from "@/lib/admin/media-usage";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { can } from "@/lib/rbac";
import { deleteObject } from "@/lib/spaces";

export const updateMediaAlt = defineAction({
  permission: "media:upload",
  schema: z.object({ id: z.coerce.number().int(), alt: z.string().trim().max(500) }),
  entity: "Media",
  action: "UPDATE",
  tags: ["media"],
  async run({ id, alt }) {
    const m = await prisma.media.findUniqueOrThrow({ where: { id } });
    if (m.mime.startsWith("image/") && !alt) throw new UserFacingError("Describe the image for people who can’t see it (alt text).");
    await prisma.media.update({ where: { id }, data: { alt } });
    return { id, name: toMediaItem(m).name };
  },
  entityId: (d) => String(d.id),
  summary: (d) => `Updated alt text for ${d.name}`,
  paths: () => ["/"],
  message: "Alt text saved",
});

/** Admin only. Refused while the file is used anywhere (Review Focus 2); only ETC/uploads objects leave storage. */
export const deleteMedia = defineAction({
  permission: "media:delete",
  schema: z.object({ id: z.number().int() }),
  entity: "Media",
  action: "DELETE",
  tags: ["media"],
  async run({ id }) {
    const m = await prisma.media.findUniqueOrThrow({ where: { id } });
    const usage = await findMediaUsage(id);
    if (usage.length) throw new UserFacingError(mediaInUseMessage(usage));
    await prisma.media.delete({ where: { id } });
    if (m.key.startsWith("ETC/uploads/")) await deleteObject(m.key);
    return { id, name: toMediaItem(m).name };
  },
  entityId: (d) => String(d.id),
  summary: (d) => `Deleted ${d.name}`,
});

const PAGE = 24;

/** Library listing for the picker dialog (read-only; any signed-in editor). */
export async function listMedia(input: { q?: string; kind?: "image" | "pdf"; page?: number }): Promise<{ items: MediaItem[]; total: number; pages: number }> {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "content:write")) return { items: [], total: 0, pages: 1 };
  const where: Prisma.MediaWhereInput = {
    ...(input.kind === "image" ? { mime: { startsWith: "image/" } } : input.kind === "pdf" ? { mime: "application/pdf" } : {}),
    ...(input.q ? { OR: [{ key: { contains: input.q } }, { alt: { contains: input.q } }] } : {}),
    NOT: { key: { startsWith: "local/brand/" } },
  };
  const total = await prisma.media.count({ where });
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const page = Math.min(Math.max(1, input.page ?? 1), pages);
  const rows = await prisma.media.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE });
  return { items: rows.map(toMediaItem), total, pages };
}

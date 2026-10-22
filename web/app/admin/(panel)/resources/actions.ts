"use server";

import { defineAction } from "@/lib/admin/action";
import { updateLocked } from "@/lib/admin/lock";
import type { SaveData } from "@/lib/admin/result";
import { prisma } from "@/lib/db";
import { idInput, publishInput, resourceForm } from "@/lib/validation/admin";

const date = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
const PATHS = ["/resources", "/tests"];

export const saveResource = defineAction({
  permission: "content:write",
  schema: resourceForm,
  entity: "Resource",
  action: (i) => (i.id ? "UPDATE" : "CREATE"),
  tags: ["resources", "tests"],
  async run(input): Promise<SaveData & { title: string }> {
    const data = {
      title: input.title,
      type: input.type,
      testId: input.testId,
      mediaId: input.mediaId,
      date: date(input.date),
      published: input.published,
      isSample: input.isSample,
    };
    if (input.id) {
      await updateLocked(prisma.resource, input.id, input.updatedAt, data);
      const r = await prisma.resource.findUniqueOrThrow({ where: { id: input.id }, select: { updatedAt: true } });
      return { id: input.id, title: input.title, viewHref: input.published ? "/resources" : null, updatedAt: r.updatedAt.toISOString() };
    }
    const r = await prisma.resource.create({ data });
    return { id: r.id, title: r.title, redirect: `/admin/resources/${r.id}?saved=1`, viewHref: r.published ? "/resources" : null, updatedAt: r.updatedAt.toISOString() };
  },
  entityId: (d) => String(d.id),
  summary: (d, i) => `${i.id ? "Updated" : "Created"} resource “${d.title}”`,
  paths: () => PATHS,
});

export const setResourcePublished = defineAction({
  permission: "content:write",
  schema: publishInput,
  entity: "Resource",
  action: (i) => (i.published ? "PUBLISH" : "UNPUBLISH"),
  tags: ["resources", "tests"],
  async run({ id, published }) {
    const r = await prisma.resource.update({ where: { id }, data: { published } });
    return { id, title: r.title };
  },
  entityId: (d) => String(d.id),
  summary: (d, i) => `${i.published ? "Published" : "Unpublished"} resource “${d.title}”`,
  paths: () => PATHS,
});

export const deleteResource = defineAction({
  permission: "content:delete",
  schema: idInput,
  entity: "Resource",
  action: "DELETE",
  tags: ["resources", "tests"],
  async run({ id }) {
    const r = await prisma.resource.delete({ where: { id } });
    return { id, title: r.title };
  },
  entityId: (d) => String(d.id),
  summary: (d) => `Deleted resource “${d.title}”`,
  paths: () => PATHS,
});

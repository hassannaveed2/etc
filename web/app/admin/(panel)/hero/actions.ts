"use server";

import { defineAction, UserFacingError } from "@/lib/admin/action";
import { updateLocked } from "@/lib/admin/lock";
import type { SaveData } from "@/lib/admin/result";
import { prisma } from "@/lib/db";
import { heroForm, idInput, publishInput } from "@/lib/validation/admin";

/** The homepage needs a hero: refuse anything that would leave no published slide. */
async function assertAnotherPublished(id: number) {
  const others = await prisma.heroSlide.count({ where: { published: true, NOT: { id } } });
  if (others === 0) throw new UserFacingError("Keep at least one hero slide published.");
}

export const saveHero = defineAction({
  permission: "content:write",
  schema: heroForm,
  entity: "HeroSlide",
  action: (i) => (i.id ? "UPDATE" : "CREATE"),
  tags: ["hero"],
  async run(input): Promise<SaveData & { title: string }> {
    const data = {
      eyebrow: input.eyebrow,
      title: input.title,
      body: input.body,
      imageId: input.imageId,
      cta1Label: input.cta1Label,
      cta1Href: input.cta1Href,
      cta2Label: input.cta2Label,
      cta2Href: input.cta2Href,
      order: input.order,
      published: input.published,
    };
    if (input.id) {
      if (!input.published) await assertAnotherPublished(input.id);
      await updateLocked(prisma.heroSlide, input.id, input.updatedAt, data);
      const h = await prisma.heroSlide.findUniqueOrThrow({ where: { id: input.id }, select: { updatedAt: true } });
      return { id: input.id, title: input.title, viewHref: "/", updatedAt: h.updatedAt.toISOString() };
    }
    const h = await prisma.heroSlide.create({ data });
    return { id: h.id, title: h.title, redirect: `/admin/hero/${h.id}?saved=1`, viewHref: "/", updatedAt: h.updatedAt.toISOString() };
  },
  entityId: (d) => String(d.id),
  summary: (d, i) => `${i.id ? "Updated" : "Created"} hero slide “${d.title}”`,
  paths: () => ["/"],
});

export const setHeroPublished = defineAction({
  permission: "content:write",
  schema: publishInput,
  entity: "HeroSlide",
  action: (i) => (i.published ? "PUBLISH" : "UNPUBLISH"),
  tags: ["hero"],
  async run({ id, published }) {
    if (!published) await assertAnotherPublished(id);
    const h = await prisma.heroSlide.update({ where: { id }, data: { published } });
    return { id, title: h.title };
  },
  entityId: (d) => String(d.id),
  summary: (d, i) => `${i.published ? "Published" : "Unpublished"} hero slide “${d.title}”`,
  paths: () => ["/"],
});

export const deleteHero = defineAction({
  permission: "content:delete",
  schema: idInput,
  entity: "HeroSlide",
  action: "DELETE",
  tags: ["hero"],
  async run({ id }) {
    const h = await prisma.heroSlide.findUniqueOrThrow({ where: { id } });
    if (h.published) await assertAnotherPublished(id);
    await prisma.heroSlide.delete({ where: { id } });
    return { id, title: h.title };
  },
  entityId: (d) => String(d.id),
  summary: (d) => `Deleted hero slide “${d.title}”`,
  paths: () => ["/"],
});

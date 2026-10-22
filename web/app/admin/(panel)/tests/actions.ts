"use server";

import { Prisma } from "@prisma/client";
import { defineAction, UserFacingError } from "@/lib/admin/action";
import { updateLocked } from "@/lib/admin/lock";
import type { SaveData } from "@/lib/admin/result";
import { prisma } from "@/lib/db";
import { idInput, publishInput, testForm } from "@/lib/validation/admin";

const TAGS = ["tests", "schedule", "notices", "resources"] as const;

export const saveTest = defineAction({
  permission: "content:write",
  schema: testForm,
  entity: "Test",
  action: (i) => (i.id ? "UPDATE" : "CREATE"),
  tags: [...TAGS],
  async run(input): Promise<SaveData & { slug: string; oldSlug?: string; code: string }> {
    const data = {
      slug: input.slug,
      code: input.code,
      name: input.name,
      short: input.short,
      category: input.category,
      level: input.level,
      audience: input.audience,
      purpose: input.purpose,
      eligibility: input.eligibility,
      measures: input.measures,
      frequency: input.frequency,
      frequencyNote: input.frequencyNote,
      fee: input.fee,
      resultsUse: input.resultsUse,
      patternNote: input.patternNote,
      reliability: input.reliability,
      syllabus: input.syllabus,
      categories: input.categories ?? Prisma.DbNull,
      tos: input.tos ?? Prisma.DbNull,
      imageId: input.imageId,
      sortOrder: input.sortOrder,
      published: input.published,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
    };
    const sections = input.sections.map((s, order) => ({ name: s.name, items: s.items, detail: s.detail, order }));

    if (input.id) {
      const id = input.id;
      const before = await prisma.test.findUniqueOrThrow({ where: { id }, select: { slug: true } });
      await prisma.$transaction(async (tx) => {
        await updateLocked(tx.test, id, input.updatedAt, data);
        await tx.testSection.deleteMany({ where: { testId: id } });
        await tx.testSection.createMany({ data: sections.map((s) => ({ ...s, testId: id })) });
      });
      const after = await prisma.test.findUniqueOrThrow({ where: { id }, select: { updatedAt: true } });
      return {
        id,
        slug: input.slug,
        code: input.code,
        oldSlug: before.slug !== input.slug ? before.slug : undefined,
        viewHref: input.published ? `/tests/${input.slug}` : null,
        updatedAt: after.updatedAt.toISOString(),
      };
    }
    const t = await prisma.test.create({ data: { ...data, sections: { create: sections } } });
    return {
      id: t.id,
      slug: t.slug,
      code: t.code,
      redirect: `/admin/tests/${t.id}?saved=1`,
      viewHref: t.published ? `/tests/${t.slug}` : null,
      updatedAt: t.updatedAt.toISOString(),
    };
  },
  entityId: (d) => String(d.id),
  summary: (d, i) => `${i.id ? "Updated" : "Created"} test ${d.code}`,
  paths: (d) => ["/tests", `/tests/${d.slug}`, "/", "/candidate-services", ...(d.oldSlug ? [`/tests/${d.oldSlug}`] : [])],
});

export const setTestPublished = defineAction({
  permission: "content:write",
  schema: publishInput,
  entity: "Test",
  action: (i) => (i.published ? "PUBLISH" : "UNPUBLISH"),
  tags: [...TAGS],
  async run({ id, published }) {
    const t = await prisma.test.update({ where: { id }, data: { published } });
    return { id, slug: t.slug, code: t.code };
  },
  entityId: (d) => String(d.id),
  summary: (d, i) => `${i.published ? "Published" : "Unpublished"} test ${d.code}`,
  paths: (d) => ["/tests", `/tests/${d.slug}`, "/"],
});

/** Admin only. Refused while notices, resources or schedule entries still point at the test. */
export const deleteTest = defineAction({
  permission: "content:delete",
  schema: idInput,
  entity: "Test",
  action: "DELETE",
  tags: [...TAGS],
  async run({ id }) {
    const [notices, resources, schedule] = await Promise.all([
      prisma.notice.count({ where: { testId: id } }),
      prisma.resource.count({ where: { testId: id } }),
      prisma.scheduleEntry.count({ where: { testId: id } }),
    ]);
    if (notices + resources + schedule > 0) {
      const parts = [
        notices && `${notices} notice${notices === 1 ? "" : "s"}`,
        resources && `${resources} resource${resources === 1 ? "" : "s"}`,
        schedule && `${schedule} schedule entr${schedule === 1 ? "y" : "ies"}`,
      ].filter(Boolean);
      throw new UserFacingError(`This test still has ${parts.join(", ")}. Move or delete them first, or unpublish the test instead.`);
    }
    const t = await prisma.test.delete({ where: { id } });
    return { id, slug: t.slug, code: t.code };
  },
  entityId: (d) => String(d.id),
  summary: (d) => `Deleted test ${d.code}`,
  paths: (d) => ["/tests", `/tests/${d.slug}`, "/"],
});

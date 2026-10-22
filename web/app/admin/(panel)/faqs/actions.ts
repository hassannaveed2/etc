"use server";

import { defineAction } from "@/lib/admin/action";
import { updateLocked } from "@/lib/admin/lock";
import type { SaveData } from "@/lib/admin/result";
import { prisma } from "@/lib/db";
import { faqForm, idInput, moveInput, publishInput } from "@/lib/validation/admin";

export const saveFaq = defineAction({
  permission: "content:write",
  schema: faqForm,
  entity: "Faq",
  action: (i) => (i.id ? "UPDATE" : "CREATE"),
  tags: ["faqs"],
  async run(input): Promise<SaveData & { question: string }> {
    const data = { category: input.category, question: input.question, answer: input.answer, published: input.published };
    if (input.id) {
      await updateLocked(prisma.faq, input.id, input.updatedAt, data);
      const f = await prisma.faq.findUniqueOrThrow({ where: { id: input.id }, select: { updatedAt: true } });
      return { id: input.id, question: input.question, viewHref: input.published ? "/faqs" : null, updatedAt: f.updatedAt.toISOString() };
    }
    // new questions go to the end of their topic
    const last = await prisma.faq.aggregate({ where: { category: input.category }, _max: { order: true } });
    const f = await prisma.faq.create({ data: { ...data, order: (last._max.order ?? -1) + 1 } });
    return { id: f.id, question: f.question, redirect: `/admin/faqs/${f.id}?saved=1`, viewHref: f.published ? "/faqs" : null, updatedAt: f.updatedAt.toISOString() };
  },
  entityId: (d) => String(d.id),
  summary: (d, i) => `${i.id ? "Updated" : "Created"} FAQ “${d.question}”`,
  paths: () => ["/faqs"],
});

export const setFaqPublished = defineAction({
  permission: "content:write",
  schema: publishInput,
  entity: "Faq",
  action: (i) => (i.published ? "PUBLISH" : "UNPUBLISH"),
  tags: ["faqs"],
  async run({ id, published }) {
    const f = await prisma.faq.update({ where: { id }, data: { published } });
    return { id, question: f.question };
  },
  entityId: (d) => String(d.id),
  summary: (d, i) => `${i.published ? "Published" : "Unpublished"} FAQ “${d.question}”`,
  paths: () => ["/faqs"],
});

/** Swaps a question with its neighbour inside the same topic. */
export const moveFaq = defineAction({
  permission: "content:write",
  schema: moveInput,
  entity: "Faq",
  action: "UPDATE",
  tags: ["faqs"],
  async run({ id, dir }) {
    const f = await prisma.faq.findUniqueOrThrow({ where: { id } });
    const siblings = await prisma.faq.findMany({ where: { category: f.category }, orderBy: [{ order: "asc" }, { id: "asc" }] });
    const i = siblings.findIndex((s) => s.id === id);
    const j = dir === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= siblings.length) return { id, question: f.question };
    const reordered = [...siblings];
    [reordered[i], reordered[j]] = [reordered[j], reordered[i]];
    await prisma.$transaction(reordered.map((s, k) => prisma.faq.update({ where: { id: s.id }, data: { order: k } })));
    return { id, question: f.question };
  },
  entityId: (d) => String(d.id),
  summary: (d, i) => `Moved FAQ “${d.question}” ${i.dir}`,
  paths: () => ["/faqs"],
});

export const deleteFaq = defineAction({
  permission: "content:delete",
  schema: idInput,
  entity: "Faq",
  action: "DELETE",
  tags: ["faqs"],
  async run({ id }) {
    const f = await prisma.faq.delete({ where: { id } });
    return { id, question: f.question };
  },
  entityId: (d) => String(d.id),
  summary: (d) => `Deleted FAQ “${d.question}”`,
  paths: () => ["/faqs"],
});

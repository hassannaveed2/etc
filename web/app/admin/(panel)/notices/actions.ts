"use server";

import { defineAction, UserFacingError } from "@/lib/admin/action";
import { updateLocked } from "@/lib/admin/lock";
import type { SaveData } from "@/lib/admin/result";
import { prisma } from "@/lib/db";
import { sanitizeRichText } from "@/lib/sanitize";
import { idInput, noticeForm, publishInput } from "@/lib/validation/admin";

const date = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

export const saveNotice = defineAction({
  permission: "content:write",
  schema: noticeForm,
  entity: "Notice",
  action: (i) => (i.id ? "UPDATE" : "CREATE"),
  tags: ["notices", "tests"],
  async run(input): Promise<SaveData & { slug: string; oldSlug?: string; title: string }> {
    const bodyHtml = sanitizeRichText(input.bodyHtml);
    if (!bodyHtml) throw new UserFacingError("Body is required.");
    const data = {
      slug: input.slug,
      title: input.title,
      type: input.type,
      testId: input.testId,
      publishedAt: date(input.publishedAt),
      deadline: input.deadline ? date(input.deadline) : null,
      status: input.status,
      summary: input.summary,
      bodyHtml,
      published: input.published,
      isSample: input.isSample,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
    };
    const attachments = input.attachments.map((a, order) => ({ mediaId: a.mediaId, label: a.label, order }));

    if (input.id) {
      const id = input.id;
      const before = await prisma.notice.findUniqueOrThrow({ where: { id }, select: { slug: true } });
      await prisma.$transaction(async (tx) => {
        await updateLocked(tx.notice, id, input.updatedAt, data);
        await tx.noticeAttachment.deleteMany({ where: { noticeId: id } });
        if (attachments.length) await tx.noticeAttachment.createMany({ data: attachments.map((a) => ({ ...a, noticeId: id })) });
      });
      const after = await prisma.notice.findUniqueOrThrow({ where: { id }, select: { updatedAt: true } });
      return {
        id,
        slug: input.slug,
        oldSlug: before.slug !== input.slug ? before.slug : undefined,
        title: input.title,
        viewHref: input.published ? `/news/${input.slug}` : null,
        updatedAt: after.updatedAt.toISOString(),
      };
    }
    const created = await prisma.notice.create({ data: { ...data, attachments: { create: attachments } } });
    return {
      id: created.id,
      slug: created.slug,
      title: created.title,
      redirect: `/admin/notices/${created.id}?saved=1`,
      viewHref: created.published ? `/news/${created.slug}` : null,
      updatedAt: created.updatedAt.toISOString(),
    };
  },
  entityId: (d) => String(d.id),
  summary: (d, i) => `${i.id ? "Updated" : "Created"} notice “${d.title}”`,
  paths: (d) => ["/news", `/news/${d.slug}`, "/", ...(d.oldSlug ? [`/news/${d.oldSlug}`] : [])],
});

export const setNoticePublished = defineAction({
  permission: "content:write",
  schema: publishInput,
  entity: "Notice",
  action: (i) => (i.published ? "PUBLISH" : "UNPUBLISH"),
  tags: ["notices", "tests"],
  async run({ id, published }) {
    const n = await prisma.notice.update({ where: { id }, data: { published } });
    return { id, slug: n.slug, title: n.title };
  },
  entityId: (d) => String(d.id),
  summary: (d, i) => `${i.published ? "Published" : "Unpublished"} notice “${d.title}”`,
  paths: (d) => ["/news", `/news/${d.slug}`, "/"],
});

export const duplicateNotice = defineAction({
  permission: "content:write",
  schema: idInput,
  entity: "Notice",
  action: "CREATE",
  tags: ["notices"],
  async run({ id }) {
    const n = await prisma.notice.findUniqueOrThrow({ where: { id }, include: { attachments: true } });
    let slug = `${n.slug}-copy`.slice(0, 80);
    for (let k = 2; await prisma.notice.findUnique({ where: { slug } }); k++) slug = `${n.slug}-copy-${k}`.slice(0, 80);
    const { id: _id, createdAt: _c, updatedAt: _u, attachments, ...rest } = n;
    const copy = await prisma.notice.create({
      data: {
        ...rest,
        slug,
        title: `Copy of ${n.title}`.slice(0, 191),
        published: false,
        attachments: { create: attachments.map((a) => ({ mediaId: a.mediaId, label: a.label, order: a.order })) },
      },
    });
    return { id: copy.id, title: copy.title };
  },
  entityId: (d) => String(d.id),
  summary: (d) => `Created “${d.title}”`,
});

export const deleteNotice = defineAction({
  permission: "content:delete",
  schema: idInput,
  entity: "Notice",
  action: "DELETE",
  tags: ["notices", "tests"],
  async run({ id }) {
    const n = await prisma.notice.delete({ where: { id } });
    return { id, slug: n.slug, title: n.title };
  },
  entityId: (d) => String(d.id),
  summary: (d) => `Deleted notice “${d.title}”`,
  paths: (d) => ["/news", `/news/${d.slug}`, "/"],
});

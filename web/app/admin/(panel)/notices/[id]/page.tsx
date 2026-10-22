import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NoticeForm } from "@/components/admin/notices/NoticeForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { formDataToObject } from "@/lib/admin/form-data";
import { toMediaItem } from "@/lib/admin/media";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { toIsoDate } from "@/lib/format";
import { saveNotice } from "../actions";

export const metadata: Metadata = { title: "Edit notice" };

export default async function EditNoticePage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("content:write");
  const id = Number((await params).id);
  const [n, tests] = await Promise.all([
    Number.isInteger(id) ? prisma.notice.findUnique({ where: { id }, include: { attachments: { orderBy: { order: "asc" }, include: { media: true } } } }) : null,
    prisma.test.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, code: true } }),
  ]);
  if (!n) notFound();

  async function save(_prev: unknown, fd: FormData) {
    "use server";
    return saveNotice({ ...formDataToObject(fd), id });
  }

  return (
    <>
      <PageHeader title={n.title} description={`Notice · /news/${n.slug}`} back={{ href: "/admin/notices", label: "Notices" }} />
      <NoticeForm
        action={save}
        tests={tests}
        notice={{
          id: n.id,
          slug: n.slug,
          title: n.title,
          type: n.type,
          testId: n.testId,
          status: n.status,
          publishedAt: toIsoDate(n.publishedAt),
          deadline: n.deadline ? toIsoDate(n.deadline) : null,
          summary: n.summary,
          bodyHtml: n.bodyHtml,
          published: n.published,
          isSample: n.isSample,
          seoTitle: n.seoTitle,
          seoDescription: n.seoDescription,
          attachments: n.attachments.map((a) => ({ label: a.label, media: toMediaItem(a.media) })),
          updatedAt: n.updatedAt.toISOString(),
        }}
      />
    </>
  );
}

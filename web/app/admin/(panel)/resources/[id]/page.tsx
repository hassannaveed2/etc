import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceForm } from "@/components/admin/resources/ResourceForm";
import { formDataToObject } from "@/lib/admin/form-data";
import { toMediaItem } from "@/lib/admin/media";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { toIsoDate } from "@/lib/format";
import { saveResource } from "../actions";

export const metadata: Metadata = { title: "Edit resource" };

export default async function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("content:write");
  const id = Number((await params).id);
  const [r, tests] = await Promise.all([
    Number.isInteger(id) ? prisma.resource.findUnique({ where: { id }, include: { media: true } }) : null,
    prisma.test.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, code: true } }),
  ]);
  if (!r) notFound();

  async function save(_prev: unknown, fd: FormData) {
    "use server";
    return saveResource({ ...formDataToObject(fd), id });
  }

  return (
    <>
      <PageHeader title={r.title} back={{ href: "/admin/resources", label: "Resources" }} />
      <ResourceForm
        action={save}
        tests={tests}
        resource={{
          id: r.id,
          title: r.title,
          type: r.type,
          testId: r.testId,
          date: toIsoDate(r.date),
          media: toMediaItem(r.media),
          published: r.published,
          isSample: r.isSample,
          updatedAt: r.updatedAt.toISOString(),
        }}
      />
    </>
  );
}

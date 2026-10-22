import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ScheduleForm } from "@/components/admin/home/HomeEditors";
import { PageHeader } from "@/components/admin/PageHeader";
import { formDataToObject } from "@/lib/admin/form-data";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { toIsoDate } from "@/lib/format";
import { saveSchedule } from "../actions";

export const metadata: Metadata = { title: "Edit session" };

export default async function EditSchedulePage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("content:write");
  const id = Number((await params).id);
  const [e, tests] = await Promise.all([
    Number.isInteger(id) ? prisma.scheduleEntry.findUnique({ where: { id } }) : null,
    prisma.test.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, code: true } }),
  ]);
  if (!e) notFound();

  async function save(_prev: unknown, fd: FormData) {
    "use server";
    return saveSchedule({ ...formDataToObject(fd), id });
  }

  return (
    <>
      <PageHeader title={e.session} back={{ href: "/admin/schedule", label: "Schedule" }} />
      <ScheduleForm
        action={save}
        tests={tests}
        entry={{
          id: e.id,
          testId: e.testId,
          session: e.session,
          regCloses: toIsoDate(e.regCloses),
          testDate: toIsoDate(e.testDate),
          status: e.status,
          published: e.published,
          updatedAt: e.updatedAt.toISOString(),
        }}
      />
    </>
  );
}

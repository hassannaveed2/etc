import type { Metadata } from "next";
import { ScheduleForm } from "@/components/admin/home/HomeEditors";
import { PageHeader } from "@/components/admin/PageHeader";
import { formDataToObject } from "@/lib/admin/form-data";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { saveSchedule } from "../actions";

export const metadata: Metadata = { title: "New session" };

export default async function NewSchedulePage() {
  await requireUser("content:write");
  const tests = await prisma.test.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, code: true } });

  async function save(_prev: unknown, fd: FormData) {
    "use server";
    return saveSchedule(formDataToObject(fd));
  }

  return (
    <>
      <PageHeader title="New session" back={{ href: "/admin/schedule", label: "Schedule" }} />
      <ScheduleForm action={save} tests={tests} entry={{ testId: null, session: "", regCloses: "", testDate: "", status: "OPEN", published: false }} />
    </>
  );
}

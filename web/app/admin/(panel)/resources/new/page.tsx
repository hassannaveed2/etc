import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceForm } from "@/components/admin/resources/ResourceForm";
import { formDataToObject } from "@/lib/admin/form-data";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { todayInKarachi, toIsoDate } from "@/lib/format";
import { saveResource } from "../actions";

export const metadata: Metadata = { title: "New resource" };

export default async function NewResourcePage() {
  await requireUser("content:write");
  const tests = await prisma.test.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, code: true } });

  async function save(_prev: unknown, fd: FormData) {
    "use server";
    return saveResource(formDataToObject(fd));
  }

  return (
    <>
      <PageHeader title="New resource" back={{ href: "/admin/resources", label: "Resources" }} />
      <ResourceForm
        action={save}
        tests={tests}
        resource={{ title: "", type: "", testId: null, date: toIsoDate(todayInKarachi()), media: null, published: false, isSample: false }}
      />
    </>
  );
}

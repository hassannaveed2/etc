import type { Metadata } from "next";
import { NoticeForm } from "@/components/admin/notices/NoticeForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { formDataToObject } from "@/lib/admin/form-data";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { todayInKarachi, toIsoDate } from "@/lib/format";
import { saveNotice } from "../actions";

export const metadata: Metadata = { title: "New notice" };

export default async function NewNoticePage() {
  await requireUser("content:write");
  const tests = await prisma.test.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, code: true } });

  async function save(_prev: unknown, fd: FormData) {
    "use server";
    return saveNotice(formDataToObject(fd));
  }

  return (
    <>
      <PageHeader title="New notice" back={{ href: "/admin/notices", label: "Notices" }} />
      <NoticeForm
        action={save}
        tests={tests}
        notice={{
          slug: "",
          title: "",
          type: "",
          testId: null,
          status: "OPEN",
          publishedAt: toIsoDate(todayInKarachi()),
          deadline: null,
          summary: "",
          bodyHtml: "",
          published: false,
          isSample: false,
          seoTitle: null,
          seoDescription: null,
          attachments: [],
        }}
      />
    </>
  );
}

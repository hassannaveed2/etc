import type { LeaderRole } from "@prisma/client";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LeaderForm } from "@/components/admin/LeaderSettingsForms";
import { PageHeader } from "@/components/admin/PageHeader";
import { formDataToObject } from "@/lib/admin/form-data";
import { toMediaItem } from "@/lib/admin/media";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { saveLeader } from "../actions";

export const metadata: Metadata = { title: "Edit leader" };

const FROM_SLUG: Record<string, LeaderRole> = { chairman: "CHAIRMAN", "executive-director": "EXECUTIVE_DIRECTOR", ceo: "CEO" };

export default async function EditLeaderPage({ params }: { params: Promise<{ role: string }> }) {
  await requireUser("content:write");
  const role = FROM_SLUG[(await params).role];
  const l = role ? await prisma.leader.findUnique({ where: { role }, include: { photo: true } }) : null;
  if (!l) notFound();

  async function save(_prev: unknown, fd: FormData) {
    "use server";
    return saveLeader(formDataToObject(fd));
  }

  return (
    <>
      <PageHeader title={l.title} description={l.name} back={{ href: "/admin/leaders", label: "Leaders" }} />
      <LeaderForm
        action={save}
        leader={{
          role: l.role,
          name: l.name,
          title: l.title,
          quote: l.quote,
          messageHtml: l.messageHtml,
          photo: l.photo ? toMediaItem(l.photo) : null,
          updatedAt: l.updatedAt.toISOString(),
        }}
      />
    </>
  );
}

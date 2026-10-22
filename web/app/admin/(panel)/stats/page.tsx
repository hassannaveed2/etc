import type { Metadata } from "next";
import { StatsEditor } from "@/components/admin/home/HomeEditors";
import { PageHeader } from "@/components/admin/PageHeader";
import { formDataToObject } from "@/lib/admin/form-data";
import { listVersion } from "@/lib/admin/lock";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { saveStats } from "./actions";

export const metadata: Metadata = { title: "Homepage numbers" };

export default async function StatsPage() {
  await requireUser("content:write");
  const rows = await prisma.stat.findMany({ orderBy: [{ order: "asc" }, { id: "asc" }] });

  async function save(_prev: unknown, fd: FormData) {
    "use server";
    return saveStats(formDataToObject(fd));
  }

  return (
    <>
      <PageHeader title="Homepage numbers" description="The “Our record in numbers” band on the homepage." />
      <StatsEditor action={save} version={listVersion(rows)} items={rows.map((s) => ({ value: s.value, label: s.label, note: s.note }))} />
    </>
  );
}

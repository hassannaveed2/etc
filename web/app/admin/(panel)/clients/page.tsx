import type { Metadata } from "next";
import { ClientsEditor } from "@/components/admin/home/HomeEditors";
import { PageHeader } from "@/components/admin/PageHeader";
import { formDataToObject } from "@/lib/admin/form-data";
import { listVersion } from "@/lib/admin/lock";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { saveClients } from "./actions";

export const metadata: Metadata = { title: "Clients" };

export default async function ClientsPage() {
  await requireUser("content:write");
  const rows = await prisma.client.findMany({ orderBy: [{ order: "asc" }, { id: "asc" }] });

  async function save(_prev: unknown, fd: FormData) {
    "use server";
    return saveClients(formDataToObject(fd));
  }

  return (
    <>
      <PageHeader title="Clients" description="Institutions shown in the homepage marquee and on Institutions › Clients." />
      <ClientsEditor action={save} version={listVersion(rows)} items={rows.map((c) => ({ name: c.name, sector: c.sector }))} />
    </>
  );
}

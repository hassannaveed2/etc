import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { UserForm } from "@/components/admin/users/UserForm";
import { formDataToObject } from "@/lib/admin/form-data";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { saveUser } from "../actions";

export const metadata: Metadata = { title: "Edit user" };

const when = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" });

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("users:manage");
  const id = Number((await params).id);
  const u = Number.isInteger(id) ? await prisma.user.findUnique({ where: { id } }) : null;
  if (!u) notFound();

  async function save(_prev: unknown, fd: FormData) {
    "use server";
    return saveUser({ ...formDataToObject(fd), id, active: fd.get("active") === "on" });
  }

  return (
    <>
      <PageHeader title={u.name} description={u.email} back={{ href: "/admin/users", label: "Users" }} />
      <UserForm
        action={save}
        user={{
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          active: u.active,
          lastLoginAt: u.lastLoginAt ? when.format(u.lastLoginAt) : null,
          updatedAt: u.updatedAt.toISOString(),
        }}
      />
    </>
  );
}

import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { UserForm } from "@/components/admin/users/UserForm";
import { formDataToObject } from "@/lib/admin/form-data";
import { requireUser } from "@/lib/auth/session";
import { saveUser } from "../actions";

export const metadata: Metadata = { title: "New user" };

export default async function NewUserPage() {
  await requireUser("users:manage");

  async function save(_prev: unknown, fd: FormData) {
    "use server";
    return saveUser(formDataToObject(fd));
  }

  return (
    <>
      <PageHeader title="New user" back={{ href: "/admin/users", label: "Users" }} />
      <UserForm action={save} user={{ name: "", email: "", role: "EDITOR", active: true }} />
    </>
  );
}

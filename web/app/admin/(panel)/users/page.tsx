import type { Metadata } from "next";
import Link from "next/link";
import { DataTable } from "@/components/admin/DataTable";
import { PageHeader, PrimaryLink } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { tableParams } from "@/lib/admin/list";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import type { SP } from "@/lib/filters";

export const metadata: Metadata = { title: "Users" };

const when = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" });

export default async function UsersPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireUser("users:manage");
  const params = tableParams(await searchParams, ["name", "email", "lastLoginAt"], { sort: "name", dir: "asc" });
  const where = params.q ? { OR: [{ name: { contains: params.q } }, { email: { contains: params.q } }] } : {};
  const rows = await prisma.user.findMany({ where, orderBy: [{ [params.sort!]: params.dir }, { id: "asc" }] });

  return (
    <>
      <PageHeader title="Users" description="People who can sign in to the admin panel." actions={<PrimaryLink href="/admin/users/new">New user</PrimaryLink>} />
      <DataTable
        caption="Users"
        basePath="/admin/users"
        params={params}
        total={rows.length}
        pages={1}
        searchLabel="Search name or email"
        columns={[
          { key: "name", label: "Name", sortable: true },
          { key: "email", label: "Email", sortable: true },
          { key: "role", label: "Role" },
          { key: "lastLoginAt", label: "Last sign-in", sortable: true, className: "whitespace-nowrap" },
          { key: "active", label: "Status" },
        ]}
        rows={rows.map((u) => ({
          id: u.id,
          cells: {
            name: u.name,
            email: (
              <Link href={`/admin/users/${u.id}`} className="font-semibold text-ink hover:text-green-700 hover:underline">
                {u.email}
              </Link>
            ),
            role: u.role === "ADMIN" ? "Admin" : "Editor",
            lastLoginAt: u.lastLoginAt ? when.format(u.lastLoginAt) : <span className="text-muted">Never</span>,
            active: u.active ? <StatusBadge tone="published">Active</StatusBadge> : <StatusBadge tone="closed">Inactive</StatusBadge>,
          },
        }))}
        empty={{ title: "No users.", text: "Add the first editor." }}
      />
    </>
  );
}

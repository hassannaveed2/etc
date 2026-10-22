import { AuditAction, type Prisma } from "@prisma/client";
import type { Metadata } from "next";
import { DataTable, TableFilter } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { pageWindow, tableParams } from "@/lib/admin/list";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import type { SP } from "@/lib/filters";

export const metadata: Metadata = { title: "Audit log" };

const when = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "medium" });
const ENTITIES = ["Test", "Notice", "Resource", "Faq", "HeroSlide", "ScheduleEntry", "Stat", "Client", "Leader", "Setting", "Media", "Inbox", "User"];

export default async function AuditPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireUser("audit:read");
  const params = tableParams(await searchParams, ["createdAt"], { sort: "createdAt", dir: "desc" }, ["user", "entity", "action"]);
  const { user, entity, action } = params.extra ?? {};
  const where: Prisma.AuditLogWhereInput = {
    ...(params.q ? { summary: { contains: params.q } } : {}),
    ...(user ? { userId: Number(user) || -1 } : {}),
    ...(entity && ENTITIES.includes(entity) ? { entity } : {}),
    ...(action && action in AuditAction ? { action: action as AuditAction } : {}),
  };
  const total = await prisma.auditLog.count({ where });
  const win = pageWindow(total, params.page, 50);
  const [rows, users] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: [{ createdAt: params.dir }, { id: "desc" }], skip: win.skip, take: win.take, include: { user: { select: { name: true } } } }),
    prisma.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <>
      <PageHeader title="Audit log" description="Every change made in the admin panel, and every sign-in." />
      <DataTable
        caption="Audit log"
        basePath="/admin/audit"
        params={{ ...params, page: win.page }}
        total={total}
        pages={win.pages}
        searchLabel="Search descriptions"
        filters={
          <>
            <TableFilter name="user" label="User" value={user} options={users.map((u) => ({ value: String(u.id), label: u.name }))} />
            <TableFilter name="entity" label="Item type" value={entity} options={ENTITIES.map((e) => ({ value: e, label: e }))} />
            <TableFilter name="action" label="Action" value={action} options={Object.keys(AuditAction).map((a) => ({ value: a, label: a.charAt(0) + a.slice(1).toLowerCase() }))} />
          </>
        }
        columns={[
          { key: "createdAt", label: "When", sortable: true, className: "whitespace-nowrap" },
          { key: "user", label: "Who" },
          { key: "action", label: "Action" },
          { key: "summary", label: "What" },
        ]}
        rows={rows.map((r) => ({
          id: r.id,
          cells: {
            createdAt: when.format(r.createdAt),
            user: r.user?.name ?? <span className="text-muted">Removed user</span>,
            action: <span className="text-xs font-semibold uppercase tracking-wider text-muted">{r.action}</span>,
            summary: r.summary,
          },
        }))}
        empty={{ title: "Nothing logged yet.", text: "Changes and sign-ins will appear here." }}
      />
    </>
  );
}

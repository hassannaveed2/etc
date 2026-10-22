import type { Metadata } from "next";
import Link from "next/link";
import { DataTable, TableFilter } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Icon } from "@/components/ui/icon";
import { INBOX_STATUS, inboxStatusFromParam, messageWhere } from "@/lib/admin/inbox";
import { pageWindow, tableParams } from "@/lib/admin/list";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import type { SP } from "@/lib/filters";

export const metadata: Metadata = { title: "Messages" };

const when = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default async function MessagesPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireUser("inbox:work");
  const params = tableParams(await searchParams, ["createdAt", "name"], { sort: "createdAt", dir: "desc" }, ["status"]);
  const where = messageWhere(params.q, inboxStatusFromParam(params.extra?.status));
  const total = await prisma.contactMessage.count({ where });
  const win = pageWindow(total, params.page);
  const rows = await prisma.contactMessage.findMany({ where, orderBy: [{ [params.sort!]: params.dir }, { id: "desc" }], skip: win.skip, take: win.take });
  const exportQs = new URLSearchParams({ ...(params.q ? { q: params.q } : {}), ...(params.extra?.status ? { status: params.extra.status } : {}) });

  return (
    <>
      <PageHeader
        title="Messages"
        description="Messages from the Contact page form."
        actions={
          <a href={`/admin/messages/export${exportQs.size ? `?${exportQs}` : ""}`} className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold text-green-700 ring-1 ring-green-700/30 hover:bg-mint-50">
            <Icon name="download" className="h-4 w-4" /> Export CSV
          </a>
        }
      />
      <DataTable
        caption="Messages"
        basePath="/admin/messages"
        params={{ ...params, page: win.page }}
        total={total}
        pages={win.pages}
        searchLabel="Search name, email or subject"
        filters={<TableFilter name="status" label="Status" value={params.extra?.status} options={Object.values(INBOX_STATUS).map((s) => ({ value: s.param, label: s.label }))} />}
        columns={[
          { key: "name", label: "From", sortable: true },
          { key: "subject", label: "Subject" },
          { key: "createdAt", label: "Received", sortable: true, className: "whitespace-nowrap" },
          { key: "status", label: "Status" },
        ]}
        rows={rows.map((m) => ({
          id: m.id,
          cells: {
            name: (
              <div>
                <Link href={`/admin/messages/${m.id}`} className="font-semibold text-ink hover:text-green-700 hover:underline">
                  {m.name}
                </Link>
                <span className="block text-xs text-muted">{m.email}</span>
              </div>
            ),
            subject: m.subject,
            createdAt: when.format(m.createdAt),
            status: <StatusBadge tone={INBOX_STATUS[m.status].tone}>{INBOX_STATUS[m.status].label}</StatusBadge>,
          },
        }))}
        empty={{ title: "No messages yet.", text: "Messages from the Contact page will appear here." }}
      />
    </>
  );
}

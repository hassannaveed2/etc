import type { Metadata } from "next";
import Link from "next/link";
import { DataTable, TableFilter } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Icon } from "@/components/ui/icon";
import { enquiryWhere, INBOX_STATUS, inboxStatusFromParam } from "@/lib/admin/inbox";
import { pageWindow, tableParams } from "@/lib/admin/list";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import type { SP } from "@/lib/filters";

export const metadata: Metadata = { title: "Enquiries" };

const when = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireUser("inbox:work");
  const params = tableParams(await searchParams, ["createdAt", "organization"], { sort: "createdAt", dir: "desc" }, ["status"]);
  const status = inboxStatusFromParam(params.extra?.status);
  const where = enquiryWhere(params.q, status);
  const total = await prisma.enquiry.count({ where });
  const win = pageWindow(total, params.page);
  const rows = await prisma.enquiry.findMany({ where, orderBy: [{ [params.sort!]: params.dir }, { id: "desc" }], skip: win.skip, take: win.take });
  const exportQs = new URLSearchParams({ ...(params.q ? { q: params.q } : {}), ...(params.extra?.status ? { status: params.extra.status } : {}) });

  return (
    <>
      <PageHeader
        title="Enquiries"
        description="Institutional enquiries from the form on Institutional Solutions."
        actions={
          <a href={`/admin/enquiries/export${exportQs.size ? `?${exportQs}` : ""}`} className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold text-green-700 ring-1 ring-green-700/30 hover:bg-mint-50">
            <Icon name="download" className="h-4 w-4" /> Export CSV
          </a>
        }
      />
      <DataTable
        caption="Enquiries"
        basePath="/admin/enquiries"
        params={{ ...params, page: win.page }}
        total={total}
        pages={win.pages}
        searchLabel="Search organisation, name or email"
        filters={<TableFilter name="status" label="Status" value={params.extra?.status} options={Object.values(INBOX_STATUS).map((s) => ({ value: s.param, label: s.label }))} />}
        columns={[
          { key: "organization", label: "Organisation", sortable: true },
          { key: "service", label: "Service" },
          { key: "candidates", label: "Candidates", className: "tabular-nums" },
          { key: "createdAt", label: "Received", sortable: true, className: "whitespace-nowrap" },
          { key: "status", label: "Status" },
        ]}
        rows={rows.map((e) => ({
          id: e.id,
          cells: {
            organization: (
              <div>
                <Link href={`/admin/enquiries/${e.id}`} className="font-semibold text-ink hover:text-green-700 hover:underline">
                  {e.organization}
                </Link>
                <span className="block text-xs text-muted">{e.contactPerson}</span>
              </div>
            ),
            service: e.service,
            candidates: e.candidates.toLocaleString("en-US"),
            createdAt: when.format(e.createdAt),
            status: <StatusBadge tone={INBOX_STATUS[e.status].tone}>{INBOX_STATUS[e.status].label}</StatusBadge>,
          },
        }))}
        empty={{ title: "No enquiries yet.", text: "Enquiries from the Institutional Solutions page will appear here." }}
      />
    </>
  );
}

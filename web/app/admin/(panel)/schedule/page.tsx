import type { Metadata } from "next";
import Link from "next/link";
import { ActionItem, ConfirmAction } from "@/components/admin/ActionButtons";
import { DataTable } from "@/components/admin/DataTable";
import { PageHeader, PrimaryLink } from "@/components/admin/PageHeader";
import { RowActions } from "@/components/admin/RowActions";
import { PublishedBadge } from "@/components/admin/StatusBadge";
import { StatusChip } from "@/components/site/StatusChip";
import { pageWindow, tableParams } from "@/lib/admin/list";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import type { SP } from "@/lib/filters";
import { formatDate, toIsoDate } from "@/lib/format";
import { can } from "@/lib/rbac";
import { deleteSchedule, setSchedulePublished } from "./actions";

export const metadata: Metadata = { title: "Schedule" };

export default async function ScheduleAdminPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireUser("content:write");
  const params = tableParams(await searchParams, ["regCloses", "testDate", "session"], { sort: "regCloses", dir: "asc" });
  const where = params.q ? { session: { contains: params.q } } : {};
  const total = await prisma.scheduleEntry.count({ where });
  const win = pageWindow(total, params.page);
  const rows = await prisma.scheduleEntry.findMany({
    where,
    orderBy: [{ [params.sort!]: params.dir }, { id: "asc" }],
    skip: win.skip,
    take: win.take,
    include: { test: { select: { code: true } } },
  });
  const canDelete = can(user.role, "content:delete");

  return (
    <>
      <PageHeader
        title="Schedule"
        description="Upcoming test sessions shown on the homepage, Candidate Services and each test page."
        actions={<PrimaryLink href="/admin/schedule/new">New session</PrimaryLink>}
      />
      <DataTable
        caption="Schedule"
        basePath="/admin/schedule"
        params={{ ...params, page: win.page }}
        total={total}
        pages={win.pages}
        searchLabel="Search sessions"
        columns={[
          { key: "session", label: "Session", sortable: true },
          { key: "test", label: "Test" },
          { key: "regCloses", label: "Registration closes", sortable: true, className: "whitespace-nowrap" },
          { key: "testDate", label: "Test date", sortable: true, className: "whitespace-nowrap" },
          { key: "status", label: "Status" },
          { key: "state", label: "State" },
        ]}
        rows={rows.map((s) => ({
          id: s.id,
          cells: {
            session: (
              <Link href={`/admin/schedule/${s.id}`} className="font-semibold text-ink hover:text-green-700 hover:underline">
                {s.session}
              </Link>
            ),
            test: s.test.code,
            regCloses: formatDate(toIsoDate(s.regCloses)),
            testDate: formatDate(toIsoDate(s.testDate)),
            status: <StatusChip status={s.status} />,
            state: <PublishedBadge published={s.published} />,
          },
          actions: (
            <RowActions label={s.session}>
              <Link href={`/admin/schedule/${s.id}`} className="block rounded px-3 py-2 text-sm hover:bg-mint-50">
                Edit
              </Link>
              <ActionItem run={setSchedulePublished.bind(null, { id: s.id, published: !s.published })}>{s.published ? "Unpublish" : "Publish"}</ActionItem>
              {canDelete && <ConfirmAction run={deleteSchedule.bind(null, { id: s.id })} label="Delete…" title={`Delete “${s.session}”?`} body="The session is removed from every schedule on the site." />}
            </RowActions>
          ),
        }))}
        empty={{ title: "No sessions yet.", text: "Add the next test session.", action: <PrimaryLink href="/admin/schedule/new">New session</PrimaryLink> }}
      />
    </>
  );
}

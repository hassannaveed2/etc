import type { Metadata } from "next";
import Link from "next/link";
import { ActionItem, ConfirmAction } from "@/components/admin/ActionButtons";
import { DataTable } from "@/components/admin/DataTable";
import { PageHeader, PrimaryLink } from "@/components/admin/PageHeader";
import { RowActions } from "@/components/admin/RowActions";
import { PublishedBadge } from "@/components/admin/StatusBadge";
import { tableParams } from "@/lib/admin/list";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import type { SP } from "@/lib/filters";
import { formatFee } from "@/lib/format";
import { TEST_CATEGORY } from "@/lib/labels";
import { can } from "@/lib/rbac";
import { deleteTest, setTestPublished } from "./actions";

export const metadata: Metadata = { title: "Tests" };

export default async function TestsAdminPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireUser("content:write");
  const params = tableParams(await searchParams, ["sortOrder", "name", "code"], { sort: "sortOrder", dir: "asc" });
  const where = params.q ? { OR: [{ name: { contains: params.q } }, { code: { contains: params.q } }] } : {};
  const rows = await prisma.test.findMany({
    where,
    orderBy: [{ [params.sort!]: params.dir }, { id: "asc" }],
    include: { _count: { select: { notices: true, resources: true } } },
  });
  const canDelete = can(user.role, "content:delete");

  return (
    <>
      <PageHeader
        title="Tests"
        description="Test profiles shown in the directory and on each test page: pattern, syllabus, streams, fee and the table of specifications."
        actions={<PrimaryLink href="/admin/tests/new">New test</PrimaryLink>}
      />
      <DataTable
        caption="Tests"
        basePath="/admin/tests"
        params={params}
        total={rows.length}
        pages={1}
        searchLabel="Search tests"
        columns={[
          { key: "sortOrder", label: "#", sortable: true, className: "w-12 tabular-nums" },
          { key: "name", label: "Test", sortable: true },
          { key: "category", label: "Purpose" },
          { key: "fee", label: "Fee" },
          { key: "linked", label: "Notices / resources" },
          { key: "state", label: "State" },
        ]}
        rows={rows.map((t) => ({
          id: t.id,
          cells: {
            sortOrder: t.sortOrder,
            name: (
              <div className="min-w-[14rem]">
                <Link href={`/admin/tests/${t.id}`} className="font-semibold text-ink hover:text-green-700 hover:underline">
                  {t.name}
                </Link>
                <span className="block text-xs text-muted">
                  {t.code} · /tests/{t.slug}
                </span>
              </div>
            ),
            category: TEST_CATEGORY[t.category].label,
            fee: <span className="whitespace-nowrap">{formatFee(t.fee)}</span>,
            linked: `${t._count.notices} / ${t._count.resources}`,
            state: <PublishedBadge published={t.published} />,
          },
          actions: (
            <RowActions label={t.name}>
              <Link href={`/admin/tests/${t.id}`} className="block rounded px-3 py-2 text-sm hover:bg-mint-50">
                Edit
              </Link>
              <ActionItem run={setTestPublished.bind(null, { id: t.id, published: !t.published })}>{t.published ? "Unpublish" : "Publish"}</ActionItem>
              {t.published && (
                <a href={`/tests/${t.slug}`} target="_blank" rel="noopener" className="block rounded px-3 py-2 text-sm hover:bg-mint-50">
                  View on site
                </a>
              )}
              {canDelete && (
                <ConfirmAction
                  run={deleteTest.bind(null, { id: t.id })}
                  label="Delete…"
                  title={`Delete ${t.code}?`}
                  body="The test profile is removed from the site. Tests that still have notices, resources or schedule entries can’t be deleted."
                />
              )}
            </RowActions>
          ),
        }))}
        empty={{ title: "No tests yet.", text: "Add the first test profile.", action: <PrimaryLink href="/admin/tests/new">New test</PrimaryLink> }}
      />
    </>
  );
}

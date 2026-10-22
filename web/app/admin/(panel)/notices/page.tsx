import type { NoticeType, Prisma } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";
import { ActionItem, ConfirmAction } from "@/components/admin/ActionButtons";
import { DataTable, TableFilter } from "@/components/admin/DataTable";
import { PageHeader, PrimaryLink } from "@/components/admin/PageHeader";
import { RowActions } from "@/components/admin/RowActions";
import { PublishedBadge } from "@/components/admin/StatusBadge";
import { StatusChip } from "@/components/site/StatusChip";
import { pageWindow, tableParams } from "@/lib/admin/list";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import type { SP } from "@/lib/filters";
import { formatDate, toIsoDate } from "@/lib/format";
import { NOTICE_TYPE } from "@/lib/labels";
import { can } from "@/lib/rbac";
import { deleteNotice, duplicateNotice, setNoticePublished } from "./actions";

export const metadata: Metadata = { title: "Notices" };

export default async function NoticesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireUser("content:write");
  const params = tableParams(await searchParams, ["title", "publishedAt", "deadline"], { sort: "publishedAt", dir: "desc" }, ["type", "test", "state"]);
  const { type, test, state } = params.extra ?? {};
  const where: Prisma.NoticeWhereInput = {
    ...(params.q ? { OR: [{ title: { contains: params.q } }, { slug: { contains: params.q } }] } : {}),
    ...(type && type in NOTICE_TYPE ? { type: type as NoticeType } : {}),
    ...(test === "general" ? { testId: null } : test ? { testId: Number(test) || -1 } : {}),
    ...(state === "published" ? { published: true } : state === "draft" ? { published: false } : {}),
  };
  const total = await prisma.notice.count({ where });
  const win = pageWindow(total, params.page);
  const [rows, tests] = await Promise.all([
    prisma.notice.findMany({
      where,
      orderBy: [{ [params.sort!]: params.dir }, { id: "desc" }],
      skip: win.skip,
      take: win.take,
      include: { test: { select: { code: true } } },
    }),
    prisma.test.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, code: true } }),
  ]);
  const canDelete = can(user.role, "content:delete");

  return (
    <>
      <PageHeader
        title="Notices"
        description="Official announcements shown on News & Notices, the homepage and test pages."
        actions={<PrimaryLink href="/admin/notices/new">New notice</PrimaryLink>}
      />
      <DataTable
        caption="Notices"
        basePath="/admin/notices"
        params={{ ...params, page: win.page }}
        total={total}
        pages={win.pages}
        searchLabel="Search titles"
        filters={
          <>
            <TableFilter name="type" label="Type" value={type} options={Object.entries(NOTICE_TYPE).map(([value, t]) => ({ value, label: t.label }))} />
            <TableFilter name="test" label="Test" value={test} options={[...tests.map((t) => ({ value: String(t.id), label: t.code })), { value: "general", label: "General" }]} />
            <TableFilter name="state" label="State" value={state} options={[{ value: "published", label: "Published" }, { value: "draft", label: "Draft" }]} />
          </>
        }
        columns={[
          { key: "title", label: "Title", sortable: true },
          { key: "type", label: "Type" },
          { key: "test", label: "Test" },
          { key: "status", label: "Status" },
          { key: "publishedAt", label: "Published", sortable: true, className: "whitespace-nowrap" },
          { key: "deadline", label: "Deadline", sortable: true, className: "whitespace-nowrap" },
          { key: "state", label: "State" },
        ]}
        rows={rows.map((n) => ({
          id: n.id,
          cells: {
            title: (
              <div className="min-w-[16rem]">
                <Link href={`/admin/notices/${n.id}`} className="font-semibold text-ink hover:text-green-700 hover:underline">
                  {n.title}
                </Link>
                <span className="block text-xs text-muted">/news/{n.slug}</span>
              </div>
            ),
            type: NOTICE_TYPE[n.type].label,
            test: n.test?.code ?? <span className="text-muted">General</span>,
            status: <StatusChip status={n.status} />,
            publishedAt: formatDate(toIsoDate(n.publishedAt)),
            deadline: n.deadline ? formatDate(toIsoDate(n.deadline)) : <span className="text-muted">—</span>,
            state: <PublishedBadge published={n.published} />,
          },
          actions: (
            <RowActions label={n.title}>
              <Link href={`/admin/notices/${n.id}`} className="block rounded px-3 py-2 text-sm hover:bg-mint-50">
                Edit
              </Link>
              <ActionItem run={setNoticePublished.bind(null, { id: n.id, published: !n.published })}>{n.published ? "Unpublish" : "Publish"}</ActionItem>
              <ActionItem run={duplicateNotice.bind(null, { id: n.id })}>Duplicate</ActionItem>
              {n.published && (
                <a href={`/news/${n.slug}`} target="_blank" rel="noopener" className="block rounded px-3 py-2 text-sm hover:bg-mint-50">
                  View on site
                </a>
              )}
              {canDelete && (
                <ConfirmAction
                  run={deleteNotice.bind(null, { id: n.id })}
                  label="Delete…"
                  title={`Delete “${n.title}”?`}
                  body="The notice and its attachment links are removed from the site. The PDF files stay in the media library."
                />
              )}
            </RowActions>
          ),
        }))}
        empty={{ title: "No notices yet.", text: "Create the first official announcement.", action: <PrimaryLink href="/admin/notices/new">New notice</PrimaryLink> }}
      />
    </>
  );
}

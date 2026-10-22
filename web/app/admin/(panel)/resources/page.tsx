import type { Prisma, ResourceType } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";
import { ActionItem, ConfirmAction } from "@/components/admin/ActionButtons";
import { DataTable, TableFilter } from "@/components/admin/DataTable";
import { PageHeader, PrimaryLink } from "@/components/admin/PageHeader";
import { RowActions } from "@/components/admin/RowActions";
import { PublishedBadge } from "@/components/admin/StatusBadge";
import { pageWindow, tableParams } from "@/lib/admin/list";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import type { SP } from "@/lib/filters";
import { formatBytes, formatDate, toIsoDate } from "@/lib/format";
import { RESOURCE_TYPE } from "@/lib/labels";
import { can } from "@/lib/rbac";
import { deleteResource, setResourcePublished } from "./actions";

export const metadata: Metadata = { title: "Resources" };

export default async function ResourcesAdminPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireUser("content:write");
  const params = tableParams(await searchParams, ["title", "date"], { sort: "date", dir: "desc" }, ["type", "test", "state"]);
  const { type, test, state } = params.extra ?? {};
  const where: Prisma.ResourceWhereInput = {
    ...(params.q ? { title: { contains: params.q } } : {}),
    ...(type && type in RESOURCE_TYPE ? { type: type as ResourceType } : {}),
    ...(test === "general" ? { testId: null } : test ? { testId: Number(test) || -1 } : {}),
    ...(state === "published" ? { published: true } : state === "draft" ? { published: false } : {}),
  };
  const total = await prisma.resource.count({ where });
  const win = pageWindow(total, params.page);
  const [rows, tests] = await Promise.all([
    prisma.resource.findMany({
      where,
      orderBy: [{ [params.sort!]: params.dir }, { id: "desc" }],
      skip: win.skip,
      take: win.take,
      include: { test: { select: { code: true } }, media: { select: { size: true, url: true } } },
    }),
    prisma.test.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, code: true } }),
  ]);
  const canDelete = can(user.role, "content:delete");

  return (
    <>
      <PageHeader
        title="Resources"
        description="Syllabi, sample papers, guides and policies in the public resource library."
        actions={<PrimaryLink href="/admin/resources/new" icon="upload">New resource</PrimaryLink>}
      />
      <DataTable
        caption="Resources"
        basePath="/admin/resources"
        params={{ ...params, page: win.page }}
        total={total}
        pages={win.pages}
        searchLabel="Search titles"
        filters={
          <>
            <TableFilter name="type" label="Type" value={type} options={Object.entries(RESOURCE_TYPE).map(([value, t]) => ({ value, label: t.label }))} />
            <TableFilter name="test" label="Test" value={test} options={[...tests.map((t) => ({ value: String(t.id), label: t.code })), { value: "general", label: "General" }]} />
            <TableFilter name="state" label="State" value={state} options={[{ value: "published", label: "Published" }, { value: "draft", label: "Draft" }]} />
          </>
        }
        columns={[
          { key: "title", label: "Title", sortable: true },
          { key: "type", label: "Type" },
          { key: "test", label: "Test" },
          { key: "file", label: "File" },
          { key: "date", label: "Date", sortable: true, className: "whitespace-nowrap" },
          { key: "state", label: "State" },
        ]}
        rows={rows.map((r) => ({
          id: r.id,
          cells: {
            title: (
              <Link href={`/admin/resources/${r.id}`} className="font-semibold text-ink hover:text-green-700 hover:underline">
                {r.title}
              </Link>
            ),
            type: RESOURCE_TYPE[r.type].label,
            test: r.test?.code ?? <span className="text-muted">General</span>,
            file: (
              <a href={r.media.url} target="_blank" rel="noopener" className="whitespace-nowrap text-green-700 hover:underline">
                PDF · {formatBytes(r.media.size)}
              </a>
            ),
            date: formatDate(toIsoDate(r.date)),
            state: <PublishedBadge published={r.published} />,
          },
          actions: (
            <RowActions label={r.title}>
              <Link href={`/admin/resources/${r.id}`} className="block rounded px-3 py-2 text-sm hover:bg-mint-50">
                Edit
              </Link>
              <ActionItem run={setResourcePublished.bind(null, { id: r.id, published: !r.published })}>{r.published ? "Unpublish" : "Publish"}</ActionItem>
              {canDelete && (
                <ConfirmAction
                  run={deleteResource.bind(null, { id: r.id })}
                  label="Delete…"
                  title={`Delete “${r.title}”?`}
                  body="The resource is removed from the library. The PDF itself stays in the media library."
                />
              )}
            </RowActions>
          ),
        }))}
        empty={{ title: "No resources yet.", text: "Add a syllabus, sample paper, guide or policy.", action: <PrimaryLink href="/admin/resources/new">New resource</PrimaryLink> }}
      />
    </>
  );
}

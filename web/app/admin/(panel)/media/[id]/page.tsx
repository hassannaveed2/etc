import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminForm, Panel } from "@/components/admin/AdminForm";
import { ConfirmAction } from "@/components/admin/ActionButtons";
import { TextArea } from "@/components/admin/fields/TextField";
import { PageHeader } from "@/components/admin/PageHeader";
import { Icon } from "@/components/ui/icon";
import { isImage, toMediaItem } from "@/lib/admin/media";
import { findMediaUsage } from "@/lib/admin/media-usage";
import { formDataToObject } from "@/lib/admin/form-data";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatBytes, formatDate } from "@/lib/format";
import { can } from "@/lib/rbac";
import { deleteMedia, updateMediaAlt } from "../actions";

export const metadata: Metadata = { title: "Media item" };

export default async function MediaItemPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("media:upload");
  const id = Number((await params).id);
  const row = Number.isInteger(id) ? await prisma.media.findUnique({ where: { id }, include: { uploadedBy: { select: { name: true } } } }) : null;
  if (!row) notFound();
  const m = toMediaItem(row);
  const usage = await findMediaUsage(id);

  async function save(_prev: unknown, fd: FormData) {
    "use server";
    const r = await updateMediaAlt({ ...formDataToObject(fd), id });
    return r.ok ? { ok: true as const, data: { id }, message: r.message } : r;
  }

  return (
    <>
      <PageHeader title={m.name} back={{ href: "/admin/media", label: "Media library" }} />
      <AdminForm
        action={save}
        cancelHref="/admin/media"
        submitLabel="Save alt text"
        aside={
          <>
            <Panel title="Details">
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-xs text-muted">Type</dt>
                  <dd>{m.mime}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Size</dt>
                  <dd>
                    {formatBytes(m.size)}
                    {m.width ? ` · ${m.width}×${m.height}px` : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Added</dt>
                  <dd>
                    {formatDate(m.createdAt.slice(0, 10))}
                    {row.uploadedBy ? ` by ${row.uploadedBy.name}` : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Address</dt>
                  <dd className="break-all">
                    <a href={m.url} target="_blank" rel="noopener" className="text-green-700 underline">
                      {m.url}
                    </a>
                  </dd>
                </div>
              </dl>
            </Panel>
            <Panel title="Used by">
              {usage.length ? (
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {usage.map((u) => (
                    <li key={u}>{u}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">Not used anywhere yet.</p>
              )}
            </Panel>
            {can(user.role, "media:delete") && (
              <Panel title="Delete">
                <p className="text-sm text-muted">
                  {usage.length ? "This file is in use and can’t be deleted until it is removed from the items above." : "Permanently delete this file."}
                </p>
                <ConfirmAction
                  variant="button"
                  label="Delete file…"
                  title={`Delete ${m.name}?`}
                  body="The file is removed from the library and from storage. This can’t be undone."
                  run={deleteMedia.bind(null, { id })}
                  after="/admin/media"
                />
              </Panel>
            )}
          </>
        }
      >
        <Panel>
          {isImage(m.mime) ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin preview
            <img src={m.url} alt={m.alt} className="max-h-[28rem] w-full rounded-md bg-mint-50 object-contain" />
          ) : (
            <a href={m.url} target="_blank" rel="noopener" className="flex items-center gap-3 rounded-md bg-mint-50 p-6 text-green-700 hover:underline">
              <Icon name="file" className="h-8 w-8" /> Open PDF
            </a>
          )}
          <TextArea
            name="alt"
            label="Alt text"
            rows={2}
            maxLength={500}
            defaultValue={m.alt}
            required={isImage(m.mime)}
            hint={isImage(m.mime) ? "Describe what the image shows. Used wherever this image appears." : "Optional for PDFs."}
          />
        </Panel>
      </AdminForm>
    </>
  );
}

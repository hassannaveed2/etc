import type { Prisma } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";
import { FilterForm } from "@/components/site/FilterForm";
import { Pagination } from "@/components/site/Pagination";
import { Icon } from "@/components/ui/icon";
import { LibraryUpload } from "@/components/admin/media/LibraryUpload";
import { PageHeader } from "@/components/admin/PageHeader";
import { isImage, toMediaItem } from "@/lib/admin/media";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { first, parsePage, type SP } from "@/lib/filters";
import { formatBytes, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Media library" };

const PER = 24;

export default async function MediaLibraryPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireUser("media:upload");
  const sp = await searchParams;
  const q = first(sp.q)?.trim() || undefined;
  const kind = first(sp.kind) === "image" || first(sp.kind) === "pdf" ? first(sp.kind) : undefined;
  const where: Prisma.MediaWhereInput = {
    ...(kind === "image" ? { mime: { startsWith: "image/" } } : kind === "pdf" ? { mime: "application/pdf" } : {}),
    ...(q ? { OR: [{ key: { contains: q } }, { alt: { contains: q } }] } : {}),
  };
  const total = await prisma.media.count({ where });
  const pages = Math.max(1, Math.ceil(total / PER));
  const page = Math.min(parsePage(sp.page), pages);
  const items = (await prisma.media.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER, take: PER })).map(toMediaItem);
  const href = (n: number) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (kind) p.set("kind", kind);
    if (n > 1) p.set("page", String(n));
    return `/admin/media${p.size ? `?${p}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Media library" description="Images and PDFs used across the site. Files are stored on DigitalOcean Spaces under ETC/uploads." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 rounded-xl border border-line bg-white shadow-sm">
          <FilterForm label="Filter media" className="flex flex-wrap items-end gap-3 border-b border-line p-4">
            <div className="min-w-[14rem] flex-1">
              <label htmlFor="media-q" className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Search
              </label>
              <input
                id="media-q"
                name="q"
                type="search"
                defaultValue={q ?? ""}
                placeholder="File name or alt text"
                className="mt-1 block w-full rounded-md border border-line px-3 py-2 text-sm focus:border-green-700 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="media-kind" className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Type
              </label>
              <select id="media-kind" name="kind" defaultValue={kind ?? ""} className="mt-1 block rounded-md border border-line py-2 pl-3 pr-8 text-sm">
                <option value="">All</option>
                <option value="image">Images</option>
                <option value="pdf">PDFs</option>
              </select>
            </div>
            <button type="submit" className="rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800">
              Apply
            </button>
          </FilterForm>
          {items.length ? (
            <ul className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 xl:grid-cols-4">
              {items.map((m) => (
                <li key={m.id}>
                  <Link href={`/admin/media/${m.id}`} className="group block rounded-lg p-2 ring-1 ring-line hover:ring-green-700">
                    {isImage(m.mime) ? (
                      // eslint-disable-next-line @next/next/no-img-element -- admin thumbnails
                      <img src={m.url} alt="" className="aspect-[4/3] w-full rounded-md object-cover" />
                    ) : (
                      <span className="grid aspect-[4/3] w-full place-items-center rounded-md bg-mint-50 text-green-700">
                        <Icon name="file" className="h-8 w-8" />
                      </span>
                    )}
                    <span className="mt-2 block truncate text-sm font-semibold text-ink group-hover:text-green-700">{m.name}</span>
                    <span className="block text-xs text-muted">
                      {formatBytes(m.size)} · {formatDate(m.createdAt.slice(0, 10))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-10 text-center">
              <p className="font-serif text-xl text-green-700">{q || kind ? "Nothing matches these filters." : "No files yet."}</p>
              <p className="mt-1 text-sm text-muted">Upload images and PDFs with the panel on the right.</p>
            </div>
          )}
          <div className="border-t border-line px-4 pb-4 text-sm text-muted">
            <Pagination page={page} hrefs={Array.from({ length: pages }, (_, k) => href(k + 1))} />
            <p className="mt-3">{total} files</p>
          </div>
        </div>
        <aside className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-600">Upload</h2>
          <LibraryUpload />
        </aside>
      </div>
    </>
  );
}

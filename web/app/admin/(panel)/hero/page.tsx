import type { Metadata } from "next";
import Link from "next/link";
import { ActionItem, ConfirmAction } from "@/components/admin/ActionButtons";
import { PageHeader, PrimaryLink } from "@/components/admin/PageHeader";
import { RowActions } from "@/components/admin/RowActions";
import { PublishedBadge } from "@/components/admin/StatusBadge";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { can } from "@/lib/rbac";
import { deleteHero, setHeroPublished } from "./actions";

export const metadata: Metadata = { title: "Hero" };

export default async function HeroAdminPage() {
  const user = await requireUser("content:write");
  const slides = await prisma.heroSlide.findMany({ orderBy: [{ order: "asc" }, { id: "asc" }], include: { image: true } });
  const canDelete = can(user.role, "content:delete");

  return (
    <>
      <PageHeader
        title="Hero"
        description="The homepage carousel. Published slides rotate in order; at least one must stay published."
        actions={<PrimaryLink href="/admin/hero/new">New slide</PrimaryLink>}
      />
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {slides.map((s) => (
          <li key={s.id} className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
            <div className="relative aspect-[16/7] bg-green-950">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
              <img src={s.image.url} alt="" className="h-full w-full object-cover opacity-70" />
              <span className="absolute left-3 top-3 rounded bg-white/90 px-2 py-0.5 font-serif text-sm font-semibold text-green-700">#{s.order + 1}</span>
            </div>
            <div className="flex items-start gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">{s.eyebrow}</p>
                <Link href={`/admin/hero/${s.id}`} className="mt-1 block font-serif text-lg font-semibold leading-snug text-ink hover:text-green-700 hover:underline">
                  {s.title}
                </Link>
                <div className="mt-2">
                  <PublishedBadge published={s.published} />
                </div>
              </div>
              <RowActions label={s.title}>
                <Link href={`/admin/hero/${s.id}`} className="block rounded px-3 py-2 text-sm hover:bg-mint-50">
                  Edit
                </Link>
                <ActionItem run={setHeroPublished.bind(null, { id: s.id, published: !s.published })}>{s.published ? "Unpublish" : "Publish"}</ActionItem>
                {canDelete && <ConfirmAction run={deleteHero.bind(null, { id: s.id })} label="Delete…" title="Delete this slide?" body={s.title} />}
              </RowActions>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

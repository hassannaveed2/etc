import type { FaqCategory } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";
import { ActionItem, ConfirmAction } from "@/components/admin/ActionButtons";
import { PageHeader, PrimaryLink } from "@/components/admin/PageHeader";
import { RowActions } from "@/components/admin/RowActions";
import { PublishedBadge } from "@/components/admin/StatusBadge";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { FAQ_CATEGORY } from "@/lib/labels";
import { can } from "@/lib/rbac";
import { deleteFaq, moveFaq, setFaqPublished } from "./actions";

export const metadata: Metadata = { title: "FAQs" };

/** FAQs grouped by topic in the order they appear on Help & FAQs, with move up/down inside each topic. */
export default async function FaqsAdminPage() {
  const user = await requireUser("content:write");
  const faqs = await prisma.faq.findMany({ orderBy: [{ order: "asc" }, { id: "asc" }] });
  const canDelete = can(user.role, "content:delete");
  const groups = (Object.keys(FAQ_CATEGORY) as FaqCategory[]).map((c) => ({ category: c, items: faqs.filter((f) => f.category === c) }));

  return (
    <>
      <PageHeader
        title="FAQs"
        description="Questions on Help & FAQs, grouped by topic. Use the menu to reorder within a topic."
        actions={<PrimaryLink href="/admin/faqs/new">New question</PrimaryLink>}
      />
      <div className="space-y-6">
        {groups.map(({ category, items }) => (
          <section key={category} aria-labelledby={`faq-group-${category}`} className="rounded-xl border border-line bg-white shadow-sm">
            <h2 id={`faq-group-${category}`} className="flex items-center justify-between border-b border-line px-4 py-3 text-sm font-semibold uppercase tracking-wider text-gold-600">
              {FAQ_CATEGORY[category].label}
              <span className="text-xs font-medium normal-case tracking-normal text-muted">{items.length} questions</span>
            </h2>
            {items.length ? (
              <ol className="divide-y divide-line">
                {items.map((f, i) => (
                  <li key={f.id} className="flex items-start gap-3 px-4 py-3">
                    <span className="mt-0.5 w-6 shrink-0 text-right font-serif text-sm text-muted">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <Link href={`/admin/faqs/${f.id}`} className="font-semibold text-ink hover:text-green-700 hover:underline">
                        {f.question}
                      </Link>
                      <p className="mt-0.5 line-clamp-1 text-sm text-muted">{f.answer}</p>
                    </div>
                    <PublishedBadge published={f.published} />
                    <RowActions label={f.question}>
                      <Link href={`/admin/faqs/${f.id}`} className="block rounded px-3 py-2 text-sm hover:bg-mint-50">
                        Edit
                      </Link>
                      <ActionItem run={setFaqPublished.bind(null, { id: f.id, published: !f.published })}>{f.published ? "Unpublish" : "Publish"}</ActionItem>
                      {i > 0 && <ActionItem run={moveFaq.bind(null, { id: f.id, dir: "up" })}>Move up</ActionItem>}
                      {i < items.length - 1 && <ActionItem run={moveFaq.bind(null, { id: f.id, dir: "down" })}>Move down</ActionItem>}
                      {canDelete && (
                        <ConfirmAction run={deleteFaq.bind(null, { id: f.id })} label="Delete…" title="Delete this question?" body={f.question} />
                      )}
                    </RowActions>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="px-4 py-6 text-sm text-muted">No questions in this topic yet.</p>
            )}
          </section>
        ))}
      </div>
    </>
  );
}

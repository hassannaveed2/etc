import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InboxStatusButtons } from "@/components/admin/inbox/InboxStatusButtons";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Icon } from "@/components/ui/icon";
import { INBOX_STATUS } from "@/lib/admin/inbox";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Message" };

const when = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", dateStyle: "long", timeStyle: "short" });

export default async function MessagePage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("inbox:work");
  const id = Number((await params).id);
  const m = Number.isInteger(id) ? await prisma.contactMessage.findUnique({ where: { id } }) : null;
  if (!m) notFound();
  const mailto = `mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject} — Education Testing Council`)}`;

  return (
    <>
      <PageHeader title={m.name} description={m.subject} back={{ href: "/admin/messages", label: "Messages" }} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-600">Message</h2>
          <p className="mt-3 whitespace-pre-wrap leading-relaxed text-ink">{m.message}</p>
          <dl className="mt-6 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Email</dt>
              <dd className="mt-1 text-sm">
                <a href={`mailto:${m.email}`} className="text-green-700 underline">
                  {m.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Received</dt>
              <dd className="mt-1 text-sm">{when.format(m.createdAt)}</dd>
            </div>
          </dl>
        </section>
        <aside className="space-y-4">
          <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-600">Status</h2>
            <div className="mt-3">
              <StatusBadge tone={INBOX_STATUS[m.status].tone}>{INBOX_STATUS[m.status].label}</StatusBadge>
            </div>
            <div className="mt-4">
              <InboxStatusButtons kind="message" id={m.id} status={m.status} />
            </div>
          </section>
          <a href={mailto} className="flex items-center justify-center gap-2 rounded-md bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800">
            <Icon name="mail" className="h-4 w-4" /> Reply by email
          </a>
        </aside>
      </div>
    </>
  );
}

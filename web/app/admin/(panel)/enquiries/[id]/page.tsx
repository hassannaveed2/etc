import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InboxStatusButtons } from "@/components/admin/inbox/InboxStatusButtons";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Icon } from "@/components/ui/icon";
import { INBOX_STATUS } from "@/lib/admin/inbox";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Enquiry" };

const when = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", dateStyle: "long", timeStyle: "short" });

export default async function EnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("inbox:work");
  const id = Number((await params).id);
  const e = Number.isInteger(id) ? await prisma.enquiry.findUnique({ where: { id } }) : null;
  if (!e) notFound();
  const mailto = `mailto:${e.email}?subject=${encodeURIComponent(`Re: ${e.service} — Education Testing Council`)}`;
  const facts: [string, React.ReactNode][] = [
    ["Contact person", e.contactPerson],
    ["Email", <a key="e" href={`mailto:${e.email}`} className="text-green-700 underline">{e.email}</a>],
    ["Phone", e.phone || "—"],
    ["Service", e.service],
    ["Estimated candidates", e.candidates.toLocaleString("en-US")],
    ["Timeline", e.timeline],
    ["Received", when.format(e.createdAt)],
  ];

  return (
    <>
      <PageHeader title={e.organization} description="Institutional enquiry" back={{ href: "/admin/enquiries", label: "Enquiries" }} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-600">Message</h2>
          <p className="mt-3 whitespace-pre-wrap leading-relaxed text-ink">{e.message}</p>
          <dl className="mt-6 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{k}</dt>
                <dd className="mt-1 text-sm text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
        <aside className="space-y-4">
          <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-600">Status</h2>
            <div className="mt-3">
              <StatusBadge tone={INBOX_STATUS[e.status].tone}>{INBOX_STATUS[e.status].label}</StatusBadge>
            </div>
            <div className="mt-4">
              <InboxStatusButtons kind="enquiry" id={e.id} status={e.status} />
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

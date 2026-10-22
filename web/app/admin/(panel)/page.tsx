import type { Metadata } from "next";
import Link from "next/link";
import { PrimaryLink } from "@/components/admin/PageHeader";
import { StatusChip } from "@/components/site/StatusChip";
import { Icon } from "@/components/ui/icon";
import { getDashboard } from "@/lib/admin/dashboard";
import { requireUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

const when = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function DashboardPage() {
  const user = await requireUser();
  const d = await getDashboard();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-green-700">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Welcome, {user.name}.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PrimaryLink href="/admin/notices/new">New notice</PrimaryLink>
          <Link
            href="/admin/resources/new"
            className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold text-green-700 ring-1 ring-green-700/30 hover:bg-white"
          >
            <Icon name="upload" className="h-4 w-4" /> Upload resource
          </Link>
          <Link href="/admin/hero" className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold text-green-700 ring-1 ring-green-700/30 hover:bg-white">
            <Icon name="edit" className="h-4 w-4" /> Edit hero
          </Link>
        </div>
      </div>

      <section aria-labelledby="inbox-h" className="grid gap-4 sm:grid-cols-2">
        <h2 id="inbox-h" className="sr-only">
          Inbox
        </h2>
        {[
          { label: "New enquiries", n: d.inbox.enquiries, href: "/admin/enquiries?status=new", icon: "inbox" as const },
          { label: "New messages", n: d.inbox.messages, href: "/admin/messages?status=new", icon: "mail" as const },
        ].map((c) => (
          <Link key={c.label} href={c.href} className="flex items-center gap-4 rounded-xl border border-line bg-white p-5 shadow-sm hover:border-green-700">
            <span className={`grid h-12 w-12 place-items-center rounded-full ${c.n ? "bg-gold-500 text-green-950" : "bg-mint-50 text-green-700"}`}>
              <Icon name={c.icon} />
            </span>
            <span>
              <span className="block font-serif text-3xl font-semibold text-ink">{c.n}</span>
              <span className="text-sm text-muted">{c.label}</span>
            </span>
          </Link>
        ))}
      </section>

      <section aria-labelledby="content-h">
        <h2 id="content-h" className="text-sm font-semibold uppercase tracking-wider text-gold-600">
          Content
        </h2>
        <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {d.counts.map((c) => (
            <li key={c.key}>
              <Link href={c.href} className="block rounded-xl border border-line bg-white p-5 shadow-sm hover:border-green-700">
                <span className="block text-sm font-semibold text-ink">{c.label}</span>
                <span className="mt-2 block font-serif text-2xl text-green-700">{c.published} published</span>
                <span className="text-sm text-muted">{c.draft} draft</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="closing-h" className="rounded-xl border border-line bg-white p-5 shadow-sm">
          <h2 id="closing-h" className="font-serif text-xl font-semibold text-ink">
            Closing soon
          </h2>
          <p className="text-sm text-muted">Published notices with a deadline in the next 14 days.</p>
          {d.closingSoon.length ? (
            <ul className="mt-4 divide-y divide-line">
              {d.closingSoon.map((n) => (
                <li key={n.slug} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{n.title}</p>
                    <p className="text-xs text-muted">Deadline {formatDate(n.deadline!)}</p>
                  </div>
                  <StatusChip status={n.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">Nothing closing in the next two weeks.</p>
          )}
        </section>
        <section aria-labelledby="recent-h" className="rounded-xl border border-line bg-white p-5 shadow-sm">
          <h2 id="recent-h" className="font-serif text-xl font-semibold text-ink">
            Recent activity
          </h2>
          <ul className="mt-4 divide-y divide-line">
            {d.recent.map((r) => (
              <li key={r.id} className="py-2.5 text-sm">
                <span className="text-ink">{r.summary}</span>
                <span className="block text-xs text-muted">
                  {r.who} · {when.format(r.when)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

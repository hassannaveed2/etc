import type { LeaderRole } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Leaders" };

const ROLE_SLUG: Record<LeaderRole, string> = { CHAIRMAN: "chairman", EXECUTIVE_DIRECTOR: "executive-director", CEO: "ceo" };
const ROLE_LABEL: Record<LeaderRole, string> = { CHAIRMAN: "Chairman", EXECUTIVE_DIRECTOR: "Executive Director", CEO: "CEO" };
const ORDER: LeaderRole[] = ["CHAIRMAN", "EXECUTIVE_DIRECTOR", "CEO"];

export default async function LeadersPage() {
  await requireUser("content:write");
  const leaders = (await prisma.leader.findMany({ include: { photo: true } })).sort((a, b) => ORDER.indexOf(a.role) - ORDER.indexOf(b.role));

  return (
    <>
      <PageHeader title="Leaders" description="Leadership messages on About ETC. The Chairman’s quote also appears on the homepage." />
      <ul className="grid gap-4 md:grid-cols-3">
        {leaders.map((l) => (
          <li key={l.role}>
            <Link href={`/admin/leaders/${ROLE_SLUG[l.role]}`} className="group block h-full rounded-xl border border-line bg-white p-5 shadow-sm hover:border-green-700">
              <div className="flex items-center gap-4">
                {l.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin preview
                  <img src={l.photo.url} alt="" className="h-14 w-14 rounded-full object-cover ring-1 ring-line" />
                ) : (
                  <span className="h-14 w-14 rounded-full bg-mint-50 ring-1 ring-line" />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">{ROLE_LABEL[l.role]}</p>
                  <p className="font-semibold text-ink group-hover:text-green-700">{l.name}</p>
                  <p className="truncate text-sm text-muted">{l.title}</p>
                </div>
              </div>
              <p className="mt-4 line-clamp-3 font-serif text-green-800">“{l.quote}”</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

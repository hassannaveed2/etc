import { _getClosingSoon } from "@/lib/content/notices";
import type { NoticeRow } from "@/lib/content/types";
import { prisma } from "@/lib/db";
import { todayInKarachi } from "@/lib/format";
import { getInboxCounts } from "./inbox";

export type CountCard = { key: string; label: string; href: string; published: number; draft: number };

export type Dashboard = {
  counts: CountCard[];
  inbox: { enquiries: number; messages: number };
  closingSoon: NoticeRow[];
  recent: { id: number; when: Date; who: string; summary: string }[];
};

const split = async (count: (published: boolean) => Promise<number>) => ({ published: await count(true), draft: await count(false) });

export async function getDashboard(): Promise<Dashboard> {
  const [tests, notices, resources, faqs, hero, schedule, inbox, closingSoon, recent] = await Promise.all([
    split((p) => prisma.test.count({ where: { published: p } })),
    split((p) => prisma.notice.count({ where: { published: p } })),
    split((p) => prisma.resource.count({ where: { published: p } })),
    split((p) => prisma.faq.count({ where: { published: p } })),
    split((p) => prisma.heroSlide.count({ where: { published: p } })),
    split((p) => prisma.scheduleEntry.count({ where: { published: p } })),
    getInboxCounts(),
    _getClosingSoon(todayInKarachi(), 14),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { user: { select: { name: true } } } }),
  ]);
  return {
    counts: [
      { key: "tests", label: "Tests", href: "/admin/tests", ...tests },
      { key: "notices", label: "Notices", href: "/admin/notices", ...notices },
      { key: "resources", label: "Resources", href: "/admin/resources", ...resources },
      { key: "faqs", label: "FAQs", href: "/admin/faqs", ...faqs },
      { key: "hero", label: "Hero slides", href: "/admin/hero", ...hero },
      { key: "schedule", label: "Schedule", href: "/admin/schedule", ...schedule },
    ],
    inbox,
    closingSoon,
    recent: recent.map((r) => ({ id: r.id, when: r.createdAt, who: r.user?.name ?? "Removed user", summary: r.summary })),
  };
}

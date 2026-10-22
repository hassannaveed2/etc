import type { InboxStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { BadgeTone } from "@/components/admin/StatusBadge";

export const INBOX_STATUS: Record<InboxStatus, { label: string; tone: BadgeTone; param: string }> = {
  NEW: { label: "New", tone: "new", param: "new" },
  IN_PROGRESS: { label: "In progress", tone: "progress", param: "in-progress" },
  CLOSED: { label: "Closed", tone: "closed", param: "closed" },
};

export function inboxStatusFromParam(p: string | undefined): InboxStatus | undefined {
  return (Object.keys(INBOX_STATUS) as InboxStatus[]).find((k) => INBOX_STATUS[k].param === p);
}

/** New-item counts for the sidebar badges. */
export async function getInboxCounts(): Promise<{ enquiries: number; messages: number }> {
  const [enquiries, messages] = await Promise.all([
    prisma.enquiry.count({ where: { status: "NEW" } }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
  ]);
  return { enquiries, messages };
}

export function enquiryWhere(q: string | undefined, status: InboxStatus | undefined): Prisma.EnquiryWhereInput {
  return {
    ...(status ? { status } : {}),
    ...(q ? { OR: [{ organization: { contains: q } }, { contactPerson: { contains: q } }, { email: { contains: q } }] } : {}),
  };
}

export function messageWhere(q: string | undefined, status: InboxStatus | undefined): Prisma.ContactMessageWhereInput {
  return {
    ...(status ? { status } : {}),
    ...(q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }, { subject: { contains: q } }] } : {}),
  };
}

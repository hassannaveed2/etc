"use server";

import { InboxStatus } from "@prisma/client";
import { z } from "zod";
import { defineAction } from "@/lib/admin/action";
import { INBOX_STATUS } from "@/lib/admin/inbox";
import { prisma } from "@/lib/db";

/** Moves an enquiry or contact message through New → In progress → Closed. */
export const setInboxStatus = defineAction({
  permission: "inbox:work",
  schema: z.object({ kind: z.enum(["enquiry", "message"]), id: z.number().int().positive(), status: z.enum(InboxStatus) }),
  entity: "Inbox",
  action: "STATUS",
  tags: [],
  async run({ kind, id, status }) {
    if (kind === "enquiry") await prisma.enquiry.update({ where: { id }, data: { status } });
    else await prisma.contactMessage.update({ where: { id }, data: { status } });
    return { id, kind, status };
  },
  entityId: (d) => `${d.kind}:${d.id}`,
  summary: (d) => `Marked ${d.kind} #${d.id} ${INBOX_STATUS[d.status].label.toLowerCase()}`,
});

import { NextResponse } from "next/server";
import { toCsv } from "@/lib/admin/csv";
import { INBOX_STATUS, inboxStatusFromParam, messageWhere } from "@/lib/admin/inbox";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { todayInKarachi, toIsoDate } from "@/lib/format";
import { can } from "@/lib/rbac";

/** CSV of contact messages matching the list's current search and status filter. IP hashes are never exported. */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "inbox:work")) return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  const sp = new URL(req.url).searchParams;
  const rows = await prisma.contactMessage.findMany({
    where: messageWhere(sp.get("q")?.trim() || undefined, inboxStatusFromParam(sp.get("status") ?? undefined)),
    orderBy: { createdAt: "desc" },
  });
  const csv = toCsv(
    rows.map((m) => ({ ...m, status: INBOX_STATUS[m.status].label })),
    [
      { key: "createdAt", header: "Received" },
      { key: "name", header: "Name" },
      { key: "email", header: "Email" },
      { key: "subject", header: "Subject" },
      { key: "message", header: "Message" },
      { key: "status", header: "Status" },
    ],
  );
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="messages-${toIsoDate(todayInKarachi())}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

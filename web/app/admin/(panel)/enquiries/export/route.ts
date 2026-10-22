import { NextResponse } from "next/server";
import { toCsv } from "@/lib/admin/csv";
import { enquiryWhere, INBOX_STATUS, inboxStatusFromParam } from "@/lib/admin/inbox";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { todayInKarachi, toIsoDate } from "@/lib/format";
import { can } from "@/lib/rbac";

/** CSV of enquiries matching the list's current search and status filter. IP hashes are never exported. */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "inbox:work")) return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  const sp = new URL(req.url).searchParams;
  const rows = await prisma.enquiry.findMany({
    where: enquiryWhere(sp.get("q")?.trim() || undefined, inboxStatusFromParam(sp.get("status") ?? undefined)),
    orderBy: { createdAt: "desc" },
  });
  const csv = toCsv(
    rows.map((e) => ({ ...e, status: INBOX_STATUS[e.status].label })),
    [
      { key: "createdAt", header: "Received" },
      { key: "organization", header: "Organisation" },
      { key: "contactPerson", header: "Contact person" },
      { key: "email", header: "Email" },
      { key: "phone", header: "Phone" },
      { key: "service", header: "Service" },
      { key: "candidates", header: "Estimated candidates" },
      { key: "timeline", header: "Timeline" },
      { key: "message", header: "Message" },
      { key: "status", header: "Status" },
    ],
  );
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="enquiries-${toIsoDate(todayInKarachi())}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

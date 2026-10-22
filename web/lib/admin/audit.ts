import { prisma } from "@/lib/db";
import type { AuditEntry } from "./audit-types";

export type { AuditEntry };

/** Every admin mutation and login writes one row (spec §5). Summaries never contain form values beyond titles. */
export async function writeAudit(e: AuditEntry): Promise<void> {
  await prisma.auditLog.create({ data: { ...e, summary: e.summary.slice(0, 1000) } });
}

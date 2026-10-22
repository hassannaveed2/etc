import type { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/db";

export type AuditEntry = { userId: number; action: AuditAction; entity: string; entityId?: string; summary: string };

/** Every admin mutation and login writes one row (spec §5). Summaries never contain form values beyond titles. */
export async function writeAudit(e: AuditEntry): Promise<void> {
  await prisma.auditLog.create({ data: { ...e, summary: e.summary.slice(0, 1000) } });
}

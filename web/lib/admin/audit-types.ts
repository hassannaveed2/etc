import type { AuditAction } from "@prisma/client";

export type AuditEntry = { userId: number; action: AuditAction; entity: string; entityId?: string; summary: string };

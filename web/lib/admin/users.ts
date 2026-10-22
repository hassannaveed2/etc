import type { Role } from "@prisma/client";

/**
 * Admin access must never disappear by accident: you can't demote or deactivate yourself, and the last active admin
 * can't be demoted or deactivated by anyone. Returns the message to show, or null when the change is fine.
 */
export function adminAccessProblem({
  actorId,
  target,
  next,
  otherActiveAdmins,
}: {
  actorId: number;
  target: { id: number; role: Role; active: boolean };
  next: { role: Role; active: boolean };
  otherActiveAdmins: number;
}): string | null {
  const losesAdmin = target.role === "ADMIN" && target.active && (next.role !== "ADMIN" || !next.active);
  if (!losesAdmin) return null;
  if (target.id === actorId) return "You can't remove your own admin access.";
  if (otherActiveAdmins === 0) return "At least one active admin is required.";
  return null;
}

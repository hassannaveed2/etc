import type { Role } from "@prisma/client";

export type Permission =
  | "content:write"
  | "content:delete"
  | "media:upload"
  | "media:delete"
  | "inbox:work"
  | "settings:manage"
  | "users:manage"
  | "audit:read";

const EDITOR: ReadonlySet<Permission> = new Set(["content:write", "media:upload", "inbox:work"]);

/** Spec §5: editors create, edit, publish, upload and work the inbox; admins can do everything. */
export function can(role: Role, p: Permission): boolean {
  return role === "ADMIN" || EDITOR.has(p);
}

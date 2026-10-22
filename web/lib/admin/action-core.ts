// The admin mutation pipeline, with its side effects injected so it can be unit-tested:
// session check → role check → zod validation → run → audit → cache revalidation, with user-facing error copy.
import { Prisma, type AuditAction } from "@prisma/client";
import { z } from "zod";
import type { SessionUser } from "@/lib/auth/credentials";
import type { Tag } from "@/lib/cache";
import { can, type Permission } from "@/lib/rbac";
import type { AuditEntry } from "./audit-types";
import { StaleError } from "./lock";
import type { ActionResult } from "./result";

export type ActionDeps = {
  getUser(): Promise<SessionUser | null>;
  audit(e: AuditEntry): Promise<void>;
  revalidateTag(t: string): void;
  revalidatePath(p: string): void;
};

export type ActionDef<S extends z.ZodType, T> = {
  permission: Permission;
  schema: S;
  entity: string;
  action: AuditAction;
  tags: Tag[];
  run(input: z.infer<S>, ctx: { user: SessionUser }): Promise<T>;
  entityId?(data: T, input: z.infer<S>): string;
  summary?(data: T, input: z.infer<S>): string;
  paths?(data: T, input: z.infer<S>): string[];
  message?: string;
};

export const MESSAGES = {
  session: "Your session has expired. Sign in again.",
  forbidden: "You don't have permission to do that.",
  stale: "Someone else saved this item while you were editing. Reload to see their changes.",
  linked: "This item is still linked to other content.",
  generic: "Something went wrong. Your changes were not saved.",
} as const;

/** Field named by a P2002 unique-constraint target, e.g. "Notice_slug_key" → "slug". */
function uniqueField(meta: Record<string, unknown> | undefined): string {
  const target = meta?.target;
  if (Array.isArray(target) && target.length) return String(target[0]);
  if (typeof target === "string") return target.match(/^[A-Za-z]+_(.+)_key$/)?.[1]?.split("_")[0] ?? target;
  return "value";
}

export function createActionFactory(deps: ActionDeps) {
  return function defineAction<S extends z.ZodType, T>(def: ActionDef<S, T>) {
    return async function (input: unknown): Promise<ActionResult<T>> {
      const user = await deps.getUser();
      if (!user) return { ok: false, formError: MESSAGES.session };
      if (!can(user.role, def.permission)) return { ok: false, formError: MESSAGES.forbidden };

      const parsed = def.schema.safeParse(input);
      if (!parsed.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
          const key = issue.path.join(".") || "form";
          fieldErrors[key] ??= issue.message;
        }
        return { ok: false, fieldErrors };
      }

      let data: T;
      try {
        data = await def.run(parsed.data, { user });
      } catch (e) {
        if (e instanceof StaleError) return { ok: false, formError: MESSAGES.stale };
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002") {
            const field = uniqueField(e.meta);
            return { ok: false, fieldErrors: { [field]: `This ${field} is already used.` } };
          }
          if (e.code === "P2003" || e.code === "P2014") return { ok: false, formError: MESSAGES.linked };
        }
        if (e instanceof UserFacingError) return { ok: false, formError: e.message };
        // Log the entity and error only — never the submitted values (spec §6: no personal data in logs).
        console.error(`[admin] ${def.entity} ${def.action} failed:`, e instanceof Error ? e.name + ": " + e.message : "unknown error");
        return { ok: false, formError: MESSAGES.generic };
      }

      await deps.audit({
        userId: user.id,
        action: def.action,
        entity: def.entity,
        entityId: def.entityId?.(data, parsed.data),
        summary: def.summary?.(data, parsed.data) ?? `${def.action} ${def.entity}`,
      });
      for (const t of def.tags) deps.revalidateTag(t);
      for (const p of def.paths?.(data, parsed.data) ?? []) deps.revalidatePath(p);
      return { ok: true, data, ...(def.message ? { message: def.message } : {}) };
    };
  };
}

/** Throw inside `run` to refuse with a specific, user-facing message (e.g. "Keep at least one hero slide published."). */
export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserFacingError";
  }
}

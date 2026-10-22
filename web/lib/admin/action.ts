import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { createActionFactory } from "./action-core";
import { writeAudit } from "./audit";

export { MESSAGES, UserFacingError } from "./action-core";
export type { ActionResult, SaveData } from "./result";

/** defineAction bound to the real session, audit log and Next cache. Use inside "use server" modules. */
export const defineAction = createActionFactory({
  getUser: getCurrentUser,
  audit: writeAudit,
  revalidateTag,
  revalidatePath,
});

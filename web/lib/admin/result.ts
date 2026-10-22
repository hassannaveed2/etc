/** What every admin server action returns. Errors are user-facing copy; never raw exception text. */
export type ActionResult<T = undefined> =
  | { ok: true; data: T; message?: string }
  | { ok: false; formError?: string; fieldErrors?: Record<string, string> };

/** Data returned by save actions so the form can show "View on site" and move to the edit URL after a create. */
export type SaveData = { id: number; redirect?: string; viewHref?: string | null; updatedAt?: string };

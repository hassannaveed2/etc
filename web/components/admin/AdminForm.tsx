"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { ActionResult, SaveData } from "@/lib/admin/result";
import { ErrorSummary } from "./fields/ErrorSummary";
import { FormErrorsProvider } from "./fields/Field";
import { useUnsavedGuard } from "./useUnsavedGuard";

export type FormAction = (prev: ActionResult<SaveData> | null, fd: FormData) => Promise<ActionResult<SaveData> | null>;

/**
 * Admin edit form: two-column layout (fields | aside), sticky save bar with unsaved-changes state, focused error
 * summary, inline field errors, a polite "Saved" announcement and a "View on site" link after publishing.
 * Pass `version` (the record's updatedAt) so saves are refused if someone else saved first.
 */
export function AdminForm({
  action,
  children,
  aside,
  cancelHref,
  submitLabel = "Save",
  viewHref,
  version,
}: {
  action: FormAction;
  children: React.ReactNode;
  aside?: React.ReactNode;
  cancelHref: string;
  submitLabel?: string;
  viewHref?: string | null;
  version?: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, null);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  useUnsavedGuard(dirty && !pending);
  const search = useSearchParams();
  const pathname = usePathname();

  // A create redirects to the new item's edit page with ?saved=1: confirm the save there and tidy the URL.
  useEffect(() => {
    if (search.get("saved") !== "1") return;
    setSaved("Saved");
    router.replace(pathname, { scroll: false });
    const t = setTimeout(() => setSaved(""), 4000);
    return () => clearTimeout(t);
  }, [search, pathname, router]);

  useEffect(() => {
    if (!state?.ok) return;
    setDirty(false);
    setSaved(state.message ?? "Saved");
    if (state.data.redirect) router.replace(state.data.redirect);
    else router.refresh();
    const t = setTimeout(() => setSaved(""), 4000);
    return () => clearTimeout(t);
  }, [state, router]);

  const errors = state && !state.ok ? state.fieldErrors : undefined;
  const currentView = state?.ok ? (state.data.viewHref ?? viewHref) : viewHref;
  const currentVersion = state?.ok && state.data.updatedAt ? state.data.updatedAt : version;

  return (
    <form ref={formRef} action={formAction} noValidate onInput={() => setDirty(true)} onChange={() => setDirty(true)}>
      {currentVersion && <input type="hidden" name="updatedAt" value={currentVersion} />}
      <FormErrorsProvider errors={errors}>
        {state && !state.ok && (
          <div className="mb-6">
            <ErrorSummary errors={state.fieldErrors} formError={state.formError} />
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0 space-y-6">{children}</div>
          {aside && <aside className="space-y-6">{aside}</aside>}
        </div>
      </FormErrorsProvider>

      <div className="sticky bottom-0 z-20 -mx-4 mt-8 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <p role="status" className="mr-auto flex items-center gap-2 text-sm">
            {pending ? (
              <span className="text-muted">Saving…</span>
            ) : saved ? (
              <span className="flex items-center gap-1.5 font-semibold text-status-open">
                <Icon name="check" className="h-4 w-4" />
                {saved}
              </span>
            ) : dirty ? (
              <span className="flex items-center gap-1.5 font-medium text-status-closing">
                <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
                Unsaved changes
              </span>
            ) : (
              <span className="text-muted">No unsaved changes</span>
            )}
          </p>
          {currentView && (
            <a href={currentView} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:underline">
              View on site <Icon name="external" className="h-4 w-4" />
              <span className="sr-only">(opens in new tab)</span>
            </a>
          )}
          <Link href={cancelHref} className="rounded-md px-4 py-2 text-sm font-semibold text-ink ring-1 ring-line hover:bg-mint-50">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-green-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-800 disabled:opacity-60"
          >
            {pending ? "Saving…" : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}

/** A titled white card used to group fields in the main column or the aside. */
export function Panel({ title, description, children }: { title?: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
      {title && <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-600">{title}</h2>}
      {description && <p className="mt-1 text-xs text-muted">{description}</p>}
      <div className={`${title ? "mt-4" : ""} space-y-4`}>{children}</div>
    </section>
  );
}

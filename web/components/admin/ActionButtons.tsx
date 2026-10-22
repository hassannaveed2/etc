"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import type { ActionResult } from "@/lib/admin/result";

type Run = () => Promise<ActionResult<unknown>>;

function useRun(run: Run, after?: string) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const go = (onOk?: () => void) =>
    start(async () => {
      setError("");
      const r = await run();
      if (!r.ok) return setError(r.formError ?? "Something went wrong.");
      onOk?.();
      if (after) router.push(after);
      else router.refresh();
    });
  return { pending, error, go };
}

const ITEM = "block w-full rounded px-3 py-2 text-left text-sm hover:bg-mint-50 disabled:opacity-50";

/** A row-menu item that runs a server action immediately (publish, unpublish, duplicate). */
export function ActionItem({ run, children, after }: { run: Run; children: React.ReactNode; after?: string }) {
  const { pending, error, go } = useRun(run, after);
  return (
    <>
      <button type="button" disabled={pending} onClick={() => go()} className={ITEM}>
        {pending ? "Working…" : children}
      </button>
      {error && (
        <p role="alert" className="px-3 pb-2 text-xs text-red-700">
          {error}
        </p>
      )}
    </>
  );
}

/** A destructive action behind a confirmation dialog. Focus starts on Cancel; Escape closes. */
export function ConfirmAction({
  run,
  label,
  title,
  body,
  confirmLabel = "Delete",
  after,
  variant = "item",
}: {
  run: Run;
  label: string;
  title: string;
  body: React.ReactNode;
  confirmLabel?: string;
  after?: string;
  variant?: "item" | "button";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { pending, error, go } = useRun(run, after);
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className={
          variant === "item"
            ? `${ITEM} text-red-700`
            : "rounded-md px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-700/30 hover:bg-red-50"
        }
      >
        {label}
      </button>
      <dialog
        ref={ref}
        aria-labelledby="confirm-title"
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-xl p-0 shadow-lift backdrop:bg-green-950/50"
      >
        <div className="p-6">
          <h2 id="confirm-title" className="font-serif text-xl font-semibold text-ink">
            {title}
          </h2>
          <div className="mt-2 text-sm text-muted">{body}</div>
          {error && (
            <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <button autoFocus type="button" onClick={() => ref.current?.close()} className="rounded-md px-4 py-2 text-sm font-semibold ring-1 ring-line hover:bg-mint-50">
              Cancel
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => go(() => ref.current?.close())}
              className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
            >
              {pending ? "Working…" : confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

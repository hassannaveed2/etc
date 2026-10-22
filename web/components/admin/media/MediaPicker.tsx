"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { listMedia } from "@/app/admin/(panel)/media/actions";
import { Icon } from "@/components/ui/icon";
import { fieldId, useFieldError } from "@/components/admin/fields/Field";
import { isImage, type MediaItem } from "@/lib/admin/media";
import { formatBytes } from "@/lib/format";
import { UploadDropzone } from "./UploadDropzone";

function Thumb({ m, className = "h-16 w-16" }: { m: MediaItem; className?: string }) {
  return isImage(m.mime) ? (
    // eslint-disable-next-line @next/next/no-img-element -- admin thumbnails of arbitrary uploads; next/image adds nothing here
    <img src={m.url} alt="" className={`${className} rounded-md object-cover ring-1 ring-line`} />
  ) : (
    <span className={`${className} grid place-items-center rounded-md bg-mint-50 text-green-700 ring-1 ring-line`}>
      <Icon name="file" className="h-6 w-6" />
    </span>
  );
}

/**
 * Chooses one media item for a form field (submits its id). The dialog shows the library (searchable, newest first)
 * and an upload area; a fresh upload is selected automatically.
 */
export function MediaPicker({
  name,
  label,
  accept,
  value,
  required,
  hint,
}: {
  name: string;
  label: string;
  accept: "image" | "pdf";
  value?: MediaItem | null;
  required?: boolean;
  hint?: string;
}) {
  const [selected, setSelected] = useState<MediaItem | null>(value ?? null);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, start] = useTransition();
  const dialog = useRef<HTMLDialogElement>(null);
  const hidden = useRef<HTMLInputElement>(null);
  const error = useFieldError(name);
  const id = fieldId(name);

  const load = (query: string) => start(async () => setItems((await listMedia({ q: query, kind: accept })).items));

  useEffect(() => {
    const t = setTimeout(() => dialog.current?.open && load(q), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function choose(m: MediaItem | null) {
    setSelected(m);
    dialog.current?.close();
    // let the surrounding AdminForm know something changed
    queueMicrotask(() => hidden.current?.form?.dispatchEvent(new Event("input", { bubbles: true })));
  }

  return (
    <div>
      <p id={`${id}-label`} className="block text-sm font-semibold text-ink">
        {label}
        {required && (
          <span className="text-red-700" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </p>
      <input ref={hidden} type="hidden" name={name} value={selected?.id ?? ""} />
      <div id={id} tabIndex={-1} className={`mt-1.5 flex items-center gap-3 rounded-md border bg-white p-3 ${error ? "border-red-600" : "border-line"}`}>
        {selected ? (
          <>
            <Thumb m={selected} />
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-semibold text-ink">{selected.name}</p>
              <p className="text-xs text-muted">
                {formatBytes(selected.size)}
                {selected.width ? ` · ${selected.width}×${selected.height}` : ""}
              </p>
              {isImage(selected.mime) && <p className="truncate text-xs text-muted">Alt: {selected.alt || "—"}</p>}
            </div>
          </>
        ) : (
          <p className="flex-1 text-sm text-muted">No {accept === "image" ? "image" : "file"} chosen.</p>
        )}
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            aria-describedby={`${id}-label`}
            onClick={() => {
              dialog.current?.showModal();
              load(q);
            }}
            className="rounded-md px-3 py-1.5 text-sm font-semibold text-green-700 ring-1 ring-green-700/30 hover:bg-mint-50"
          >
            {selected ? "Change…" : "Choose…"}
          </button>
          {selected && !required && (
            <button type="button" onClick={() => choose(null)} className="rounded-md px-3 py-1.5 text-sm font-semibold text-muted ring-1 ring-line hover:bg-mint-50">
              Remove
            </button>
          )}
        </div>
      </div>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1 text-sm font-medium text-red-700">{error}</p>}

      <dialog ref={dialog} aria-label={`Choose ${label.toLowerCase()}`} className="m-auto w-[min(56rem,calc(100vw-2rem))] rounded-xl p-0 shadow-lift backdrop:bg-green-950/50">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="font-serif text-lg font-semibold text-ink">Choose {accept === "image" ? "an image" : "a PDF"}</h2>
          <button type="button" onClick={() => dialog.current?.close()} className="grid h-8 w-8 place-items-center rounded-md hover:bg-mint-50" aria-label="Close">
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        <div className="grid max-h-[70vh] gap-5 overflow-y-auto p-5 md:grid-cols-[1fr_16rem]">
          <div>
            <label htmlFor={`${id}-search`} className="sr-only">
              Search the library
            </label>
            <input
              id={`${id}-search`}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by file name or alt text"
              className="block w-full rounded-md border border-line px-3 py-2 text-sm focus:border-green-700 focus:outline-none"
            />
            <p className="mt-2 text-xs text-muted" role="status">
              {loading ? "Loading…" : `${items.length} shown`}
            </p>
            <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {items.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => choose(m)}
                    aria-pressed={selected?.id === m.id}
                    className="flex w-full flex-col items-start gap-2 rounded-lg p-2 text-left ring-1 ring-line hover:ring-green-700 aria-pressed:ring-2 aria-pressed:ring-green-700"
                  >
                    <Thumb m={m} className="aspect-[4/3] h-auto w-full" />
                    <span className="w-full truncate text-xs font-medium text-ink">{m.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">Upload new</h3>
            <div className="mt-2">
              <UploadDropzone accept={accept} onUploaded={(m) => choose(m)} />
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}

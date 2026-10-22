"use client";

import { useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { MediaItem } from "@/lib/admin/media";
import { uploadFile } from "@/lib/admin/upload-client";
import { checkUpload } from "@/lib/upload-rules";

const ACCEPT = { image: "image/jpeg,image/png,image/webp", pdf: "application/pdf", any: "application/pdf,image/jpeg,image/png,image/webp" } as const;

/**
 * Drag-and-drop (or browse) upload with progress. Images ask for alt text before uploading — it is required (spec §5).
 * Calls onUploaded with the new media item.
 */
export function UploadDropzone({ accept = "any", onUploaded }: { accept?: keyof typeof ACCEPT; onUploaded: (m: MediaItem) => void }) {
  const inputId = useId();
  const altId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [over, setOver] = useState(false);

  function pick(f: File | undefined) {
    setError("");
    if (!f) return;
    const check = checkUpload({ mime: f.type, size: f.size, filename: f.name });
    if (!check.ok) return setError(check.error);
    if (accept === "image" && !f.type.startsWith("image/")) return setError("Choose a JPG, PNG or WebP image.");
    if (accept === "pdf" && f.type !== "application/pdf") return setError("Choose a PDF file.");
    setFile(f);
    setAlt("");
    if (!f.type.startsWith("image/")) void start(f, "");
  }

  async function start(f: File, altText: string) {
    setProgress(0);
    const r = await uploadFile(f, altText, setProgress);
    setProgress(null);
    if (!r.ok) {
      setError(r.formError ?? Object.values(r.fieldErrors ?? {})[0] ?? "Upload failed.");
      return;
    }
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
    onUploaded(r.data);
  }

  const busy = progress !== null;
  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          pick(e.dataTransfer.files[0]);
        }}
        className={`rounded-xl border-2 border-dashed p-6 text-center transition ${over ? "border-green-700 bg-mint-50" : "border-line bg-white"}`}
      >
        <Icon name="upload" className="mx-auto h-8 w-8 text-green-700" />
        <p className="mt-2 text-sm text-ink">
          Drag a file here, or{" "}
          <label htmlFor={inputId} className="cursor-pointer font-semibold text-green-700 underline">
            browse
          </label>
        </p>
        <p className="mt-1 text-xs text-muted">
          {accept === "image" ? "JPG, PNG or WebP up to 5 MB" : accept === "pdf" ? "PDF up to 15 MB" : "PDF up to 15 MB; JPG, PNG or WebP up to 5 MB"}
        </p>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPT[accept]}
          className="sr-only"
          disabled={busy}
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </div>

      {file && file.type.startsWith("image/") && !busy && (
        <div className="mt-3 rounded-lg border border-line bg-mint-50/60 p-4">
          <p className="text-sm font-semibold text-ink">{file.name}</p>
          <label htmlFor={altId} className="mt-3 block text-sm font-semibold">
            Alt text <span className="text-red-700" aria-hidden="true">*</span>
          </label>
          <input
            id={altId}
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            maxLength={500}
            placeholder="e.g. Candidates writing a test in an examination hall"
            className="mt-1.5 block w-full rounded-md border border-line bg-white px-3 py-2 text-sm focus:border-green-700 focus:outline-none"
          />
          <p className="mt-1 text-xs text-muted">Describe what the image shows for people using screen readers.</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={!alt.trim()}
              onClick={() => start(file, alt.trim())}
              className="rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
            >
              Upload image
            </button>
            <button type="button" onClick={() => setFile(null)} className="rounded-md px-4 py-2 text-sm font-semibold ring-1 ring-line hover:bg-white">
              Cancel
            </button>
          </div>
        </div>
      )}

      {busy && (
        <div className="mt-3" role="status" aria-live="polite">
          <p className="text-sm text-ink">
            Uploading {file?.name}… {progress}%
          </p>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-mint-50" aria-hidden="true">
            <div className="h-full bg-green-700 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}

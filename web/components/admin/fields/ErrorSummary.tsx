"use client";

import { useEffect, useRef } from "react";

/** Takes focus when a save fails and links every field error to its control (#field-<name>). */
export function ErrorSummary({
  errors,
  formError,
  labels = {},
}: {
  errors?: Record<string, string>;
  formError?: string;
  labels?: Record<string, string>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const entries = Object.entries(errors ?? {});
  const signature = formError + JSON.stringify(errors);

  useEffect(() => {
    ref.current?.focus();
  }, [signature]);

  if (!formError && !entries.length) return null;
  return (
    <div ref={ref} tabIndex={-1} role="alert" className="rounded-lg border border-red-700/30 bg-red-50 px-4 py-3 text-sm text-red-800">
      <p className="font-semibold">
        {formError ?? `Please correct ${entries.length} ${entries.length === 1 ? "field" : "fields"} before saving.`}
      </p>
      {entries.length > 0 && (
        <ul className="mt-2 list-disc space-y-0.5 pl-5">
          {entries.map(([name, msg]) => (
            <li key={name}>
              <a href={`#field-${name}`} className="underline" title={labels[name]}>
                {msg}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

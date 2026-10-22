"use client";

import { useActionState, useEffect, useRef } from "react";
import { Icon } from "@/components/ui/icon";

export type FormState = {
  status: "idle" | "error" | "success";
  fieldErrors?: Record<string, string>;
  formError?: string;
  values?: Record<string, string>;
};

export type FormAction = (prev: FormState, fd: FormData) => Promise<FormState>;

export type FieldSpec = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "number" | "textarea" | "select";
  options?: string[];
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  wide?: boolean;
  rows?: number;
  idPrefix?: string;
};

const INPUT = "mt-1.5 w-full rounded-md border px-4 py-3 focus:border-green-700 focus:outline-none";

/**
 * Accessible public form (enquiry, contact): inline errors linked by aria-describedby, an error summary that takes
 * focus, a hidden honeypot field, values echoed back after a failed submit, and a focused success panel.
 */
export function FormShell({
  action,
  fields,
  submitLabel,
  successTitle,
  successText,
  footnote,
  className,
}: {
  action: FormAction;
  fields: FieldSpec[];
  submitLabel: string;
  successTitle: string;
  successText: string;
  footnote?: React.ReactNode;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" });
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const errors = state.fieldErrors ?? {};
  const errorCount = Object.keys(errors).length;

  useEffect(() => {
    if (state.status === "error") summaryRef.current?.focus();
    if (state.status === "success") successRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div ref={successRef} role="status" tabIndex={-1} className={`rounded-2xl border border-green-700/30 bg-mint-50 p-8 ${className ?? ""}`}>
        <span className="grid h-12 w-12 place-items-center rounded-full bg-green-700 text-white">
          <Icon name="check" className="h-6 w-6" />
        </span>
        <h3 className="mt-4 font-serif text-2xl font-semibold text-green-700">{successTitle}</h3>
        <p className="mt-2 text-ink/80">{successText}</p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className={className}>
      {state.status === "error" && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {state.formError ??
            `Please correct ${errorCount} ${errorCount === 1 ? "field" : "fields"} below.`}
          {errorCount > 0 && (
            <ul className="mt-2 list-disc pl-5 font-normal">
              {fields
                .filter((f) => errors[f.name])
                .map((f) => (
                  <li key={f.name}>
                    <a href={`#${f.idPrefix ?? ""}${f.name}`} className="underline">
                      {errors[f.name]}
                    </a>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
      {/* Honeypot: hidden from people and assistive tech; bots that fill it are silently dropped. */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((f) => {
          const id = `${f.idPrefix ?? ""}${f.name}`;
          const err = errors[f.name];
          const common = {
            id,
            name: f.name,
            required: f.required,
            "aria-invalid": err ? true : undefined,
            "aria-describedby": err ? `${id}-error` : undefined,
            defaultValue: state.values?.[f.name] ?? "",
            className: `${INPUT} ${err ? "border-red-600" : "border-line"}`,
          };
          return (
            <div key={f.name} className={f.wide ? "sm:col-span-2" : undefined}>
              <label htmlFor={id} className="block text-sm font-semibold">
                {f.label}{" "}
                {f.required ? (
                  <span className="text-red-700" aria-hidden="true">
                    *
                  </span>
                ) : (
                  <span className="font-normal text-muted">(optional)</span>
                )}
              </label>
              {f.type === "textarea" ? (
                <textarea {...common} rows={f.rows ?? 5} placeholder={f.placeholder} />
              ) : f.type === "select" ? (
                <select {...common} key={state.values?.[f.name] ?? ""}>
                  <option value="">{f.placeholder ?? "Choose an option"}</option>
                  {f.options!.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input
                  {...common}
                  type={f.type ?? "text"}
                  autoComplete={f.autoComplete}
                  {...(f.type === "number" ? { min: 1, inputMode: "numeric" as const } : {})}
                />
              )}
              {err && (
                <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-red-700">
                  {err}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-muted">
          <span className="text-red-700">*</span> Required.{footnote ? <> {footnote}</> : null}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-70"
        >
          {pending ? "Sending…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

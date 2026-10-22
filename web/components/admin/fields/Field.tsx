"use client";

import { createContext, useContext } from "react";

const ErrorsContext = createContext<Record<string, string>>({});

/** Supplies server-side field errors (keyed by dotted field name) to every field inside an admin form. */
export function FormErrorsProvider({ errors, children }: { errors?: Record<string, string>; children: React.ReactNode }) {
  return <ErrorsContext.Provider value={errors ?? {}}>{children}</ErrorsContext.Provider>;
}

export function useFieldError(name: string): string | undefined {
  return useContext(ErrorsContext)[name];
}

export const fieldId = (name: string) => `field-${name}`;

export const INPUT_CLS =
  "mt-1.5 block w-full rounded-md border bg-white px-3 py-2 text-sm text-ink shadow-sm placeholder:text-muted/70 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/15 disabled:bg-mint-50";

export type FieldProps = {
  name: string;
  label: string;
  hint?: React.ReactNode;
  required?: boolean;
  className?: string;
};

/** Label, hint and inline error around one control. The control gets id field-<name> and aria-describedby. */
export function Field({
  name,
  label,
  hint,
  required,
  className,
  children,
}: FieldProps & { children: (a11y: { id: string; "aria-invalid"?: true; "aria-describedby"?: string; className: string }) => React.ReactNode }) {
  const error = useFieldError(name);
  const id = fieldId(name);
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
        {required ? (
          <span className="text-red-700" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
        className: `${INPUT_CLS} ${error ? "border-red-600" : "border-line"}`,
      })}
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

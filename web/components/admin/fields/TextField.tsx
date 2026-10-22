"use client";

import { Field, type FieldProps } from "./Field";

type Props = FieldProps & {
  defaultValue?: string | number | null;
  type?: "text" | "email" | "url" | "password" | "date" | "number";
  placeholder?: string;
  maxLength?: number;
  min?: number;
  step?: number;
  autoComplete?: string;
};

export function TextField({ defaultValue, type = "text", placeholder, maxLength, min, step, autoComplete, ...field }: Props) {
  return (
    <Field {...field}>
      {(a11y) => (
        <input
          {...a11y}
          name={field.name}
          type={type}
          required={field.required}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          maxLength={maxLength}
          min={min}
          step={step}
          autoComplete={autoComplete}
        />
      )}
    </Field>
  );
}

export function DateField(props: Omit<Props, "type">) {
  return <TextField {...props} type="date" />;
}

export function NumberField(props: Omit<Props, "type">) {
  return <TextField {...props} type="number" />;
}

export function TextArea({
  defaultValue,
  rows = 4,
  maxLength,
  placeholder,
  ...field
}: FieldProps & { defaultValue?: string | null; rows?: number; maxLength?: number; placeholder?: string }) {
  return (
    <Field {...field}>
      {(a11y) => (
        <textarea
          {...a11y}
          name={field.name}
          rows={rows}
          required={field.required}
          defaultValue={defaultValue ?? ""}
          maxLength={maxLength}
          placeholder={placeholder}
        />
      )}
    </Field>
  );
}

export function Select({
  defaultValue,
  options,
  placeholder,
  ...field
}: FieldProps & { defaultValue?: string | null; options: { value: string; label: string }[]; placeholder?: string }) {
  return (
    <Field {...field}>
      {(a11y) => (
        <select {...a11y} name={field.name} required={field.required} defaultValue={defaultValue ?? ""}>
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

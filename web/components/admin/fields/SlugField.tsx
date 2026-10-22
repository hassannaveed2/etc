"use client";

import { useEffect, useRef, useState } from "react";
import { slugify } from "@/lib/slug";
import { Field, type FieldProps } from "./Field";

/**
 * URL slug that follows another field (usually the title) until the editor types in it, or until an existing item's
 * slug is loaded — changing a published URL should always be deliberate.
 */
export function SlugField({ sourceName, defaultValue, prefix = "", ...field }: FieldProps & { sourceName: string; defaultValue?: string; prefix?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const touched = useRef(!!defaultValue);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const form = ref.current?.form;
    if (!form) return;
    const onInput = (e: Event) => {
      const t = e.target as HTMLInputElement;
      if (t.name === sourceName && !touched.current) setValue(slugify(t.value));
    };
    form.addEventListener("input", onInput);
    return () => form.removeEventListener("input", onInput);
  }, [sourceName]);

  return (
    <Field {...field} hint={field.hint ?? (prefix ? <>Address: {prefix}<strong>{value || "…"}</strong></> : undefined)}>
      {(a11y) => (
        <input
          {...a11y}
          ref={ref}
          name={field.name}
          required={field.required}
          value={value}
          onChange={(e) => {
            touched.current = true;
            setValue(e.target.value);
          }}
          spellCheck={false}
          autoCapitalize="off"
        />
      )}
    </Field>
  );
}

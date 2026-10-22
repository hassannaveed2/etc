"use client";

import { useState } from "react";
import { fieldId } from "./Field";

/** Switch-style checkbox. Submits "on" when checked, nothing when not (schemas read presence as true). */
export function Toggle({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  const [on, setOn] = useState(!!defaultChecked);
  const id = fieldId(name);
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
        {description && (
          <p id={`${id}-desc`} className="mt-0.5 text-xs text-muted">
            {description}
          </p>
        )}
      </div>
      <span className="relative inline-flex shrink-0">
        <input
          id={id}
          name={name}
          type="checkbox"
          role="switch"
          checked={on}
          onChange={(e) => setOn(e.target.checked)}
          aria-describedby={description ? `${id}-desc` : undefined}
          className="peer h-6 w-11 cursor-pointer appearance-none rounded-full bg-line transition checked:bg-green-700"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5"
        />
      </span>
    </div>
  );
}

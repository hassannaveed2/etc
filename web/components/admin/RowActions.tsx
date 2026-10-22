"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/icon";

/** "⋮" menu for a table row. Closes on Escape and on outside click; returns focus to the toggle. */
export function RowActions({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onDoc = (e: MouseEvent) => {
      if (el.open && !el.contains(e.target as Node)) el.open = false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && el.open) {
        el.open = false;
        el.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("click", onDoc);
    el.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDoc);
      el.removeEventListener("keydown", onKey);
    };
  }, []);
  return (
    <details ref={ref} className="relative inline-block text-left">
      <summary
        aria-label={`Actions for ${label}`}
        className="grid h-8 w-8 cursor-pointer list-none place-items-center rounded-md text-muted hover:bg-mint-50 hover:text-green-700 [&::-webkit-details-marker]:hidden"
      >
        <Icon name="dots" className="h-5 w-5" />
      </summary>
      <div className="absolute right-0 z-30 mt-1 w-48 rounded-lg border border-line bg-white p-1 shadow-lift">{children}</div>
    </details>
  );
}

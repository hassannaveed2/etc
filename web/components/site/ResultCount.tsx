"use client";

import { useEffect, useRef } from "react";

export const FOCUS_RESULTS_KEY = "etc-focus-results";

/**
 * "Showing 1–8 of 12 notices". After a pagination click, keyboard and screen-reader users land here at the top of
 * the new page of results instead of losing their place.
 */
export function ResultCount({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    let flagged = false;
    try {
      flagged = sessionStorage.getItem(FOCUS_RESULTS_KEY) === "1";
      sessionStorage.removeItem(FOCUS_RESULTS_KEY);
    } catch {}
    if (flagged && ref.current) {
      ref.current.focus({ preventScroll: true });
      ref.current.closest("section")?.scrollIntoView({ block: "start" });
    }
  }, [text]);
  return (
    <p ref={ref} role="status" tabIndex={-1} className="text-sm text-muted">
      {text}
    </p>
  );
}

"use client";

import { useEffect } from "react";

export const UNSAVED_MESSAGE = "You have unsaved changes. Leave this page and lose them?";

/** Warns before closing the tab or following an in-app link while a form has unsaved edits. */
export function useUnsavedGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.href.startsWith("javascript:") || a.getAttribute("href")?.startsWith("#")) return;
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      if (!window.confirm(UNSAVED_MESSAGE)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);
}

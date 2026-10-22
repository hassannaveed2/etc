"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";

/**
 * GET filter form that works without JavaScript (submit button) and, with JavaScript, updates the URL as the user
 * changes a select or types (debounced). Empty values are dropped and paging resets to page 1.
 */
export function FilterForm({ children, className, label }: { children: React.ReactNode; className?: string; label: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function apply(form: HTMLFormElement) {
    const params = new URLSearchParams();
    for (const [k, v] of new FormData(form)) if (typeof v === "string" && v.trim()) params.set(k, v.trim());
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }

  return (
    <form
      role="search"
      aria-label={label}
      method="get"
      action={pathname}
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        apply(e.currentTarget);
      }}
      onChange={(e) => {
        const form = e.currentTarget;
        clearTimeout(timer.current);
        const isText = (e.target as HTMLElement).tagName === "INPUT";
        timer.current = setTimeout(() => apply(form), isText ? 300 : 0);
      }}
    >
      {children}
    </form>
  );
}

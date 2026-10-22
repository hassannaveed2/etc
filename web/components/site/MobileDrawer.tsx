"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { activeSection, NAV } from "@/lib/nav";

const FOCUSABLE = 'a[href], button, summary, [tabindex]:not([tabindex="-1"])';

/** Mobile menu: modal drawer with a focus trap; focus returns to the toggle on close. */
export function MobileDrawer() {
  const pathname = usePathname();
  const active = activeSection(pathname);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") return close();
    if (e.key !== "Tab" || !panelRef.current) return;
    const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        aria-controls="mobile-drawer"
        aria-expanded={open}
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="-mr-2 p-2 text-ink lg:hidden"
      >
        <Icon name="menu" className="h-6 w-6" />
      </button>
      <div
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!open}
        onKeyDown={onKeyDown}
        className="fixed inset-0 z-50"
      >
        <div className="absolute inset-0 bg-green-950/60" onClick={() => close()} />
        <div ref={panelRef} className="absolute right-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto bg-white shadow-lift">
          <div className="flex h-16 items-center justify-between border-b border-line px-5">
            <span className="font-serif text-lg text-green-700">Menu</span>
            <button type="button" onClick={() => close()} className="-mr-2 p-2 text-ink" aria-label="Close menu">
              <Icon name="close" className="h-6 w-6" />
            </button>
          </div>
          <ul className="px-5">
            {NAV.map((item) => (
              <li key={item.id} className="border-b border-line">
                <details className="group" open={item.id === active}>
                  <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 font-medium text-ink [&::-webkit-details-marker]:hidden">
                    {item.label}
                    <Icon name="chevron" className="h-4 w-4 transition group-open:rotate-180" />
                  </summary>
                  <ul className="pb-3 pl-3">
                    {item.links.map(([label, href]) => (
                      <li key={label}>
                        <Link href={href} onClick={() => close(false)} className="block py-1.5 text-sm text-muted hover:text-green-700">
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ))}
          </ul>
          <div className="p-5">
            <Link
              href="/tests"
              onClick={() => close(false)}
              className="flex justify-center rounded-md bg-green-700 px-4 py-3 font-semibold text-white"
            >
              Find a Test
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

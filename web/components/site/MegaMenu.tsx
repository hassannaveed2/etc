"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { activeSection, NAV } from "@/lib/nav";

/** Desktop navigation: click to open, one panel at a time; Escape, outside clicks and panel links close it. */
export function MegaMenu() {
  const pathname = usePathname();
  const active = activeSection(pathname);
  const [open, setOpen] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const buttons = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => setOpen(null), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element;
      const inPanel = target.closest("[data-mega-panel]");
      if (!inPanel || target.closest("[data-mega-panel] a")) {
        if (!target.closest("[data-mega]")) setOpen(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      buttons.current[open]?.focus();
      setOpen(null);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <nav ref={navRef} aria-label="Main" className="hidden border-t border-line lg:block">
      <ul className="mx-auto flex max-w-site items-stretch justify-between px-8">
        {NAV.map((item) => {
          const cur = item.id === active;
          const isOpen = open === item.id;
          const panelId = `mega-${item.id}`;
          return (
            <li key={item.id} className="static">
              <button
                ref={(el) => {
                  buttons.current[item.id] = el;
                }}
                type="button"
                data-mega
                aria-expanded={isOpen}
                aria-controls={panelId}
                aria-current={cur ? "page" : undefined}
                onClick={() => setOpen(isOpen ? null : item.id)}
                className={`relative flex items-center gap-1 py-3.5 text-[13.5px] font-medium ${
                  cur ? "text-green-700" : "text-ink/80 hover:text-green-700"
                }`}
              >
                {item.label}
                <Icon name="chevron" className={`h-3.5 w-3.5 opacity-60 transition ${isOpen ? "rotate-180" : ""}`} />
                {cur && <span className="absolute inset-x-0 -bottom-px h-[3px] rounded-t bg-gold-500" />}
              </button>
              <div
                data-mega-panel
                id={panelId}
                hidden={!isOpen}
                className="absolute left-0 right-0 top-full z-40 border-t-2 border-gold-500 bg-white shadow-lift"
              >
                <div className="mx-auto grid max-w-site grid-cols-12 gap-8 px-8 py-8">
                  <div className="col-span-4 border-r border-line pr-8">
                    <p className="eyebrow">{item.label}</p>
                    <p className="mt-3 font-serif text-2xl leading-snug text-green-700">{item.blurb}</p>
                    <Link
                      href={item.href}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900"
                    >
                      Go to {item.label}
                      <Icon name="arrow" className="h-4 w-4" />
                    </Link>
                  </div>
                  <ul className="col-span-8 grid grid-cols-2 content-start gap-x-6 gap-y-1">
                    {item.links.map(([label, href]) => (
                      <li key={label}>
                        <Link
                          href={href}
                          className="group flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm text-ink hover:bg-mint-50 hover:text-green-700"
                        >
                          {label}
                          <Icon
                            name="arrow"
                            className="h-4 w-4 -translate-x-1 text-gold-500 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

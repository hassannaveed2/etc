"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import { Icon } from "@/components/ui/icon";
import { ADMIN_NAV, isActive } from "@/lib/admin/nav";
import { can } from "@/lib/rbac";

/** Full sidebar from lg; an icon rail below lg (labels stay available to screen readers and as tooltips). */
export function Sidebar({ role, counts }: { role: Role; counts: { enquiries: number; messages: number } }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Admin"
      className="on-dark sticky top-0 flex h-dvh w-16 shrink-0 flex-col overflow-y-auto bg-green-950 text-white/80 lg:w-64"
    >
      {/* The visible text is the link's name (WCAG 2.5.3); on the icon rail it stays for screen readers only. */}
      <Link href="/admin" className="flex items-center gap-3 px-3 py-4 lg:px-5">
        <span className="crest-roundel grid h-10 w-10 shrink-0 place-items-center !p-1">
          <Image src="/brand/etc-crest.png" alt="" width={428} height={480} className="h-8 w-auto" />
        </span>
        <span className="sr-only min-w-0 lg:not-sr-only lg:block">
          <span className="block font-serif text-lg font-semibold leading-tight text-white">ETC Admin</span>
          <span className="block text-xs text-white/60">Education Testing Council</span>
          <span className="sr-only"> (dashboard)</span>
        </span>
      </Link>
      <div className="flex-1 space-y-5 px-2 pb-6 lg:px-3">
        {ADMIN_NAV.map((group) => {
          const items = group.items.filter((i) => !i.permission || can(role, i.permission));
          if (!items.length) return null;
          return (
            <div key={group.label}>
              <p className="hidden px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-eyebrow text-gold-300/80 lg:block">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = isActive(item.href, pathname);
                  const badge = item.badge ? counts[item.badge] : 0;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={item.label}
                        aria-current={active ? "page" : undefined}
                        className={`relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                          active ? "bg-white/10 text-white" : "hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {active && <span className="absolute inset-y-1.5 left-0 w-1 rounded-full bg-gold-300" aria-hidden="true" />}
                        <Icon name={item.icon} className="h-5 w-5 shrink-0" />
                        <span className="sr-only lg:not-sr-only lg:flex-1">{item.label}</span>
                        {badge > 0 && (
                          <span className="absolute right-1 top-1 grid min-w-5 place-items-center rounded-full bg-gold-500 px-1.5 text-[11px] font-bold text-green-950 lg:static">
                            {badge}
                            <span className="sr-only"> new</span>
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

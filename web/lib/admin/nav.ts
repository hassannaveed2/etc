import type { IconName } from "@/components/ui/icon";
import type { Permission } from "@/lib/rbac";

export type AdminNavItem = { label: string; href: string; icon: IconName; permission?: Permission; badge?: "enquiries" | "messages" };
export type AdminNavGroup = { label: string; items: AdminNavItem[] };

export const ADMIN_NAV: AdminNavGroup[] = [
  { label: "Overview", items: [{ label: "Dashboard", href: "/admin", icon: "grid" }] },
  {
    label: "Content",
    items: [
      { label: "Tests", href: "/admin/tests", icon: "register" },
      { label: "Notices", href: "/admin/notices", icon: "file" },
      { label: "Resources", href: "/admin/resources", icon: "download" },
      { label: "FAQs", href: "/admin/faqs", icon: "help" },
      { label: "Hero", href: "/admin/hero", icon: "star" },
      { label: "Schedule", href: "/admin/schedule", icon: "calendar" },
      { label: "Stats", href: "/admin/stats", icon: "results" },
      { label: "Clients", href: "/admin/clients", icon: "building" },
      { label: "Leaders", href: "/admin/leaders", icon: "quote" },
    ],
  },
  {
    label: "Inbox",
    items: [
      { label: "Enquiries", href: "/admin/enquiries", icon: "inbox", badge: "enquiries" },
      { label: "Messages", href: "/admin/messages", icon: "mail", badge: "messages" },
    ],
  },
  { label: "Library", items: [{ label: "Media", href: "/admin/media", icon: "image" }] },
  {
    label: "Settings",
    items: [
      { label: "Settings", href: "/admin/settings", icon: "cog", permission: "settings:manage" },
      { label: "Users", href: "/admin/users", icon: "users", permission: "users:manage" },
      { label: "Audit log", href: "/admin/audit", icon: "log", permission: "audit:read" },
    ],
  },
];

/** The nav item for a pathname: exact match for the dashboard, prefix match elsewhere. */
export function isActive(href: string, pathname: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/");
}

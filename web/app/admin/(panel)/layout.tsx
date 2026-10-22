import type { Metadata } from "next";
import { getInboxCounts } from "@/lib/admin/inbox";
import { requireUser } from "@/lib/auth/session";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | ETC Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const counts = await getInboxCounts();
  return (
    <div className="flex min-h-dvh bg-mint-50/60">
      <Sidebar role={user.role} counts={counts} />
      <div className="min-w-0 flex-1">
        <TopBar user={user} />
        <main id="main" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

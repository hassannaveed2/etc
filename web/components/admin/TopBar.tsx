import { Icon } from "@/components/ui/icon";
import { signOutAction } from "@/app/admin/login/actions";

export function TopBar({ user }: { user: { name: string; email: string; role: string } }) {
  const initials = user.name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-end gap-3 border-b border-line bg-white/90 px-4 backdrop-blur sm:px-6">
      <a
        href="/"
        target="_blank"
        rel="noopener"
        className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-mint-50"
      >
        View site <Icon name="external" className="h-4 w-4" />
        <span className="sr-only">(opens in new tab)</span>
      </a>
      <details className="group relative">
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md px-2 py-1.5 hover:bg-mint-50 [&::-webkit-details-marker]:hidden">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-green-700 text-xs font-bold text-white" aria-hidden="true">
            {initials}
          </span>
          <span className="hidden text-left text-sm leading-tight sm:block">
            <span className="block font-semibold text-ink">{user.name}</span>
            <span className="block text-xs text-muted">{user.role === "ADMIN" ? "Admin" : "Editor"}</span>
          </span>
          <Icon name="chevron" className="h-4 w-4 text-muted transition-transform group-open:rotate-180" />
          <span className="sr-only">Account menu</span>
        </summary>
        <div className="absolute right-0 mt-2 w-64 rounded-lg border border-line bg-white p-2 shadow-lift">
          <p className="truncate px-3 py-2 text-sm text-muted">{user.email}</p>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-ink hover:bg-mint-50"
            >
              <Icon name="logout" className="h-4 w-4" /> Sign out
            </button>
          </form>
        </div>
      </details>
    </header>
  );
}

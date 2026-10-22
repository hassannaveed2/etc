import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export function PageHeader({
  title,
  description,
  back,
  actions,
}: {
  title: string;
  description?: React.ReactNode;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      {back && (
        <Link href={back.href} className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-green-700">
          <Icon name="prev" className="h-4 w-4" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-serif text-3xl font-semibold text-green-700">{title}</h1>
          {description && <p className="mt-1 max-w-3xl text-sm text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function PrimaryLink({ href, children, icon = "plus" }: { href: string; children: React.ReactNode; icon?: "plus" | "upload" | "edit" }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-800">
      <Icon name={icon} className="h-4 w-4" />
      {children}
    </Link>
  );
}

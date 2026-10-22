import { Icon } from "@/components/ui/icon";
import type { SiteSettings } from "@/lib/validation/content";

export type Portal = "registration" | "admitCard" | "results";

const KEY: Record<Portal, keyof SiteSettings> = {
  registration: "portalRegistrationUrl",
  admitCard: "portalAdmitCardUrl",
  results: "portalResultsUrl",
};

/** Link to an official ETC/HEC transactional portal: linked, never rebuilt (slide 6). */
export function PortalLink({
  which,
  settings,
  className,
  children,
}: {
  which: Portal;
  settings: SiteSettings;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a href={settings[KEY[which]]} target="_blank" rel="noopener" className={className}>
      {children}
      <Icon name="external" className="h-4 w-4 shrink-0" />
      <span className="sr-only"> (official ETC portal, opens in new tab)</span>
    </a>
  );
}

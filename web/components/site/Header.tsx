import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { SiteSettings } from "@/lib/validation/content";
import { Brand } from "./Brand";
import { MegaMenu } from "./MegaMenu";
import { MobileDrawer } from "./MobileDrawer";
import { PortalLink } from "./PortalLink";

function UtilityBar({ settings }: { settings: SiteSettings }) {
  return (
    <div className="on-dark bg-green-950 text-xs text-white/80">
      <div className="mx-auto flex h-9 max-w-site items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <p className="truncate">
          <span className="hidden sm:inline">An autonomous body of the </span>Higher Education Commission, Government of Pakistan
        </p>
        <ul className="flex shrink-0 items-center gap-4">
          <li className="hidden items-center gap-1.5 md:flex">
            <Icon name="phone" className="h-3.5 w-3.5" /> Helpline: <span className="text-white">{settings.helpline}</span>
          </li>
          <li>
            <Link className="inline-flex items-center gap-1.5 hover:text-white" href="/candidate-services#accessibility">
              <Icon name="access" className="h-3.5 w-3.5" />
              Accessibility
            </Link>
          </li>
          <li>
            <Link className="hover:text-white" href="/contact">
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

const QL = "inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium text-green-800 hover:bg-white hover:text-green-700";

function QuickLinks({ settings }: { settings: SiteSettings }) {
  return (
    <div className="border-y border-gold-300/60 bg-cream-50">
      <div className="mx-auto flex h-11 max-w-site items-center gap-4 px-4 sm:px-6 lg:px-8">
        <span className="hidden shrink-0 text-[11px] font-semibold uppercase tracking-eyebrow text-gold-600 sm:block">Quick links</span>
        <ul className="no-scrollbar -mx-2 flex items-center gap-1 overflow-x-auto px-2">
          <li>
            <PortalLink which="registration" settings={settings} className={QL}>
              <Icon name="register" className="h-4 w-4" />
              Registration
            </PortalLink>
          </li>
          <li>
            <PortalLink which="admitCard" settings={settings} className={QL}>
              <Icon name="card" className="h-4 w-4" />
              Roll Number Slip
            </PortalLink>
          </li>
          <li>
            <PortalLink which="results" settings={settings} className={QL}>
              <Icon name="results" className="h-4 w-4" />
              Results
            </PortalLink>
          </li>
          <li>
            <Link className={QL} href="/faqs">
              <Icon name="help" className="h-4 w-4" />
              Help &amp; FAQs
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export function Header({ settings }: { settings: SiteSettings }) {
  return (
    <div id="site-header">
      <UtilityBar settings={settings} />
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <div className="relative">
          <div className="mx-auto flex h-[72px] max-w-site items-center justify-between gap-4 px-4 sm:h-20 sm:px-6 lg:px-8">
            <Brand />
            <div className="flex shrink-0 items-center gap-1 sm:gap-3">
              <Image
                src="/brand/hec-crest.png"
                alt="Higher Education Commission crest"
                width={422}
                height={480}
                className="hidden h-12 w-auto opacity-90 md:block"
              />
              <span className="mx-1 hidden h-10 w-px bg-line md:block" />
              <Link
                href="/resources"
                className="hidden rounded-full p-2 text-ink/70 hover:bg-mint-50 hover:text-green-700 sm:block"
                aria-label="Search the site"
              >
                <Icon name="search" />
              </Link>
              <Link
                href="/tests"
                className="hidden items-center gap-2 rounded-md bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800 sm:inline-flex"
              >
                Find a Test
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
              <MobileDrawer />
            </div>
          </div>
          <MegaMenu />
        </div>
      </header>
      <QuickLinks settings={settings} />
    </div>
  );
}

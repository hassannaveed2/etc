import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { SiteSettings } from "@/lib/validation/content";
import { Brand } from "./Brand";

function Col({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-eyebrow text-gold-300">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link className="text-white/75 hover:text-white" href={href}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer id="site-footer" className="on-dark relative overflow-hidden bg-green-900 text-white">
      <div className="pattern-dots absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto max-w-site px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Brand onDark />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/75">
              Pakistan’s public-sector national testing body, providing standardized, centralized and secure assessment for
              education and professional opportunities.
            </p>
            <p className="mt-6 font-serif italic text-gold-300">Merit · Transparency · Fairness · Quality</p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            <Col
              title="About"
              links={[
                ["About ETC", "/about"],
                ["Governance", "/about#governance"],
                ["Quality & Methods", "/quality"],
                ["News & Notices", "/news"],
              ]}
            />
            <Col
              title="Tests"
              links={[
                ["LAT", "/tests/lat"],
                ["LAW-GAT", "/tests/law-gat"],
                ["HAT-General", "/tests/hat"],
                ["HAAT-Subject", "/tests/haat"],
                ["USAT", "/tests/usat"],
              ]}
            />
            <Col
              title="Candidates"
              links={[
                ["Candidate Services", "/candidate-services"],
                ["Resources", "/resources"],
                ["Help & FAQs", "/faqs"],
                ["Accessibility", "/candidate-services#accessibility"],
              ]}
            />
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-eyebrow text-gold-300">Contact</h2>
              <ul className="mt-4 space-y-3 text-sm text-white/75">
                <li className="flex gap-2">
                  <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />
                  <span>{settings.address}</span>
                </li>
                <li className="flex gap-2">
                  <Icon name="phone" className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />
                  <span>Helpline {settings.helpline}</span>
                </li>
                <li className="flex gap-2">
                  <Icon name="mail" className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />
                  <span>Email {settings.supportEmail}</span>
                </li>
                <li>
                  <Link className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-gold-300" href="/institutions#enquiry">
                    Institutional enquiry
                    <Icon name="arrow" className="h-4 w-4" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-14 flex flex-col-reverse gap-4 border-t border-white/15 pt-6 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Education Testing Council, Higher Education Commission. All rights reserved.</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li>
              <Link className="hover:text-white" href="/candidate-services#policies">
                Privacy
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/candidate-services#policies">
                Terms of use
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/candidate-services#accessibility">
                Accessibility
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/candidate-services#unfair-means">
                Unfair means policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";
import { ContactForm } from "@/components/site/forms/ContactForm";
import { PortalLink } from "@/components/site/PortalLink";
import { getSettings } from "@/lib/content/settings";
import { submitContact } from "../actions";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the Education Testing Council: helpline, email support, office information and contact form.",
};

function RouteIcon({ name, dark }: { name: IconName; dark?: boolean }) {
  return (
    <span className={`grid h-11 w-11 place-items-center rounded-full ${dark ? "bg-white/10 text-gold-300" : "bg-mint-50 text-green-700"}`}>
      <Icon name={name} />
    </span>
  );
}

export default async function ContactPage() {
  const settings = await getSettings();
  return (
    <>
      <section className="on-dark relative overflow-hidden bg-green-900 text-white">
        <div className="pattern-dots absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-site px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-sm text-white/70">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link className="hover:text-white" href="/">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-white">
                Contact &amp; Support
              </li>
            </ol>
          </nav>
          <p className="eyebrow mt-8">Contact &amp; Support</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight sm:text-5xl">We’re here to help</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            Choose the quickest route for your question. For registration, admit cards and results, the official ETC portal is the fastest
            place to start.
          </p>
        </div>
      </section>

      <section id="support" aria-labelledby="routes-title" className="mx-auto max-w-site scroll-mt-40 px-4 py-14 sm:px-6 lg:px-8">
        <h2 id="routes-title" className="sr-only">
          Support routes
        </h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <li className="rounded-2xl border border-line p-6">
            <RouteIcon name="phone" />
            <h3 className="mt-4 font-semibold">Helpline &amp; call centre</h3>
            <p className="mt-1 text-sm text-muted">For questions about tests, registration and test day.</p>
            <p className="mt-3 font-semibold text-green-700">{settings.helpline}</p>
            <p className="text-xs text-muted">{settings.officeHours}</p>
          </li>
          <li className="rounded-2xl border border-line p-6">
            <RouteIcon name="mail" />
            <h3 className="mt-4 font-semibold">Email support</h3>
            <p className="mt-1 text-sm text-muted">Include your CNIC and roll number if you have one.</p>
            <p className="mt-3 break-words font-semibold text-green-700">{settings.supportEmail}</p>
          </li>
          <li className="rounded-2xl border border-line p-6">
            <RouteIcon name="results" />
            <h3 className="mt-4 font-semibold">Registration &amp; results</h3>
            <p className="mt-1 text-sm text-muted">Use the official portal for applications, admit cards and results.</p>
            <div className="mt-3">
              <PortalLink which="registration" settings={settings} className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900">
                Open the official portal{" "}
              </PortalLink>
            </div>
          </li>
          <li className="on-dark rounded-2xl bg-green-900 p-6 text-white">
            <RouteIcon name="building" dark />
            <h3 className="mt-4 font-semibold">Institutions</h3>
            <p className="mt-1 text-sm text-white/75">Universities and public bodies planning an assessment.</p>
            <Link href="/institutions#enquiry" className="mt-3 inline-flex font-semibold text-gold-300 hover:text-white">
              Institutional enquiry
            </Link>
          </li>
        </ul>
      </section>

      <section className="border-y border-line bg-mint-50">
        <div className="mx-auto grid max-w-site gap-10 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div id="form" className="scroll-mt-40 lg:col-span-7">
            <p className="eyebrow">Write to us</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-green-700">Contact form</h2>
            <ContactForm action={submitContact} />
          </div>
          <div id="office" className="scroll-mt-40 lg:col-span-5">
            <p className="eyebrow">Office information</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-green-700">Visit or write</h2>
            <div className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-line">
              <div className="flex items-center gap-4">
                <Image src="/brand/etc-crest.png" alt="" width={428} height={480} className="h-14 w-auto" />
                <div>
                  <p className="font-semibold">Education Testing Council</p>
                  <p className="text-sm text-muted">Higher Education Commission</p>
                </div>
              </div>
              <dl className="mt-6 space-y-4 text-sm">
                <div>
                  <dt className="font-semibold">Address</dt>
                  <dd className="mt-1 text-ink/80">{settings.address}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Office hours</dt>
                  <dd className="mt-1 text-ink/80">{settings.officeHours}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

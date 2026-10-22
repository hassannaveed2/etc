// Test detail page body (mockup render.js R.testDetail): one template for all six tests.
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { FEE_NOTE, formatDate, formatFee } from "@/lib/format";
import { TEST_CATEGORY } from "@/lib/labels";
import type { TestDetail as TestDetailData } from "@/lib/content/types";
import type { SiteSettings } from "@/lib/validation/content";
import { NoticeRow } from "../NoticeRow";
import { PortalLink, type Portal } from "../PortalLink";
import { ResourceCard } from "../ResourceCard";
import { ShareButtons } from "../ShareButtons";
import { UsatCategories } from "./UsatCategories";

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-40 border-b border-line py-12 first:pt-0 last:border-0">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={`${id}-h`} className="mt-3 font-serif text-3xl font-semibold text-green-700">
        {title}
      </h2>
      {children}
    </section>
  );
}

function PortalCard({ which, title, text, settings }: { which: Portal; title: string; text: string; settings: SiteSettings }) {
  return (
    <li className="rounded-xl border border-line bg-white p-6">
      <h3 className="font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-muted">{text}</p>
      <PortalLink which={which} settings={settings} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900">
        {which === "registration" ? "Register on the portal " : "Open the portal "}
      </PortalLink>
    </li>
  );
}

export function TestDetail({ test: t, settings }: { test: TestDetailData; settings: SiteSettings }) {
  const isCustom = t.slug === "customized";
  const nav: [string, string][] = [
    ["overview", "Overview"],
    ["eligibility", "Eligibility"],
    ["pattern", "Pattern & syllabus"],
    ["fees", "Fees & notices"],
    ["schedule", "Schedule & preparation"],
    ["services", isCustom ? "Get started" : "Register & results"],
  ];

  return (
    <>
      <section className="on-dark relative isolate overflow-hidden bg-green-900 text-white">
        {t.image && (
          <div className="absolute inset-y-0 right-0 h-full w-full lg:w-[55%]">
            <Image src={t.image.url} alt="" fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-green-900 via-green-900/95 to-green-900/40 lg:via-green-900/90" aria-hidden="true" />
        <div className="relative mx-auto max-w-site px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-sm text-white/70">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link className="hover:text-white" href="/">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link className="hover:text-white" href="/tests">
                  Tests &amp; Assessments
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-white">
                {t.code}
              </li>
            </ol>
          </nav>
          <div className="mt-8 max-w-2xl">
            <p className="eyebrow">
              {TEST_CATEGORY[t.category].label} · {t.level}
            </p>
            <p className="mt-4">
              <span className="inline-block rounded-md bg-gold-500 px-3 py-1 font-serif text-lg font-semibold text-green-950">{t.code}</span>
            </p>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl">{t.name}</h1>
            <p className="mt-4 text-lg text-white/80">{t.short}</p>
            <dl className="mt-8 grid max-w-xl grid-cols-3 gap-4 border-t border-white/15 pt-6">
              <div>
                <dt className="text-xs uppercase tracking-wider text-white/60">Fee*</dt>
                <dd className="mt-1 font-serif text-lg sm:text-2xl">{formatFee(t.fee)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-white/60">Frequency</dt>
                <dd className="mt-1 font-serif text-lg sm:text-2xl">{t.frequency}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-white/60">For</dt>
                <dd className="mt-1 break-words font-serif text-lg sm:text-2xl">{t.level}</dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              {isCustom ? (
                <Link href="/institutions#enquiry" className="rounded-md bg-gold-500 px-5 py-3 font-semibold text-green-950 hover:bg-gold-300">
                  Submit an enquiry
                </Link>
              ) : (
                <PortalLink
                  which="registration"
                  settings={settings}
                  className="inline-flex items-center gap-2 rounded-md bg-gold-500 px-5 py-3 font-semibold text-green-950 hover:bg-gold-300"
                >
                  Register{" "}
                </PortalLink>
              )}
              <a href="#pattern" className="rounded-md border border-white/40 px-5 py-3 font-semibold hover:bg-white/10">
                Pattern &amp; syllabus
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-site gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-16">
        <aside className="min-w-0 lg:col-span-3">
          <nav aria-label="On this page" className="lg:sticky lg:top-40">
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-gold-600">On this page</p>
            <ul className="no-scrollbar mt-4 flex gap-2 overflow-x-auto lg:block lg:space-y-1 lg:border-l lg:border-line">
              {nav.map(([id, label]) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="block whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-muted ring-1 ring-line hover:text-green-700 lg:-ml-px lg:rounded-none lg:border-l-2 lg:border-transparent lg:py-2 lg:pl-4 lg:ring-0 hover:lg:border-gold-500"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="min-w-0 lg:col-span-9">
          <Section id="overview" eyebrow="Overview" title="Purpose of the test">
            <p className="mt-5 text-lg leading-relaxed text-ink/90">{t.purpose}</p>
            <div className="mt-6 rounded-xl border-l-4 border-gold-500 bg-mint-50 p-5">
              <p className="font-semibold text-green-700">How results are used</p>
              <p className="mt-1 text-sm text-ink/80">{t.resultsUse}</p>
            </div>
          </Section>

          <Section id="eligibility" eyebrow="Eligibility" title="Who should take it">
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["Eligibility", t.eligibility],
                ["Target candidates", t.audience],
                ["What it measures", t.measures],
                ["Frequency", `${t.frequency}. ${t.frequencyNote}`],
              ].map(([dt, dd]) => (
                <div key={dt} className="rounded-xl border border-line p-5">
                  <dt className="text-sm font-semibold text-gold-600">{dt}</dt>
                  <dd className="mt-2 text-ink/90">{dd}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section id="pattern" eyebrow="Test pattern" title="Pattern and syllabus">
            <div className="table-wrap mt-6" tabIndex={0} role="region" aria-label={`${t.code} test pattern`}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Section</th>
                    <th scope="col" className="num">
                      Items / marks
                    </th>
                    <th scope="col">What it covers</th>
                  </tr>
                </thead>
                <tbody>
                  {t.sections.map((s) => (
                    <tr key={s.name}>
                      <td className="font-medium">{s.name}</td>
                      <td className="num">{s.items ?? <span className="text-muted">As published</span>}</td>
                      <td>{s.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-muted">{t.patternNote}</p>

            {t.categories && t.categories.length > 0 && (
              <>
                <h3 className="mt-10 font-serif text-xl font-semibold text-ink">Six categories, matched to your intermediate stream</h3>
                <UsatCategories categories={t.categories} />
              </>
            )}
            {t.tos && (
              <>
                <h3 className="mt-10 font-serif text-xl font-semibold text-ink">Common Core — Table of Specifications (45 MCQs)</h3>
                <div className="table-wrap mt-4" tabIndex={0} role="region" aria-label="Common Core table of specifications">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th scope="col">Content area</th>
                        {t.tos.levels.map((l) => (
                          <th key={l} scope="col" className="num">
                            {l}
                          </th>
                        ))}
                        <th scope="col" className="num">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {t.tos.rows.map((r) => {
                        const bg = r.subtotal ? { background: "#FAF6EA" } : undefined;
                        return (
                          <tr key={r.area} className={r.subtotal ? "font-semibold" : undefined}>
                            <td style={bg}>{r.area}</td>
                            {r.v.map((v, k) => (
                              <td key={k} className="num" style={bg}>
                                {v}
                              </td>
                            ))}
                            <td className="num" style={bg}>
                              {r.total}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-xs text-muted">K = Knowledge, U = Understanding, Ap = Application, An = Analysis, E = Evaluation, C = Create.</p>
              </>
            )}

            <h3 className="mt-10 font-serif text-xl font-semibold text-ink">Syllabus areas</h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {t.syllabus.map((s) => (
                <li key={s} className="flex gap-3 rounded-lg bg-mint-50 px-4 py-3 text-sm">
                  <Icon name="check" className="h-5 w-5 shrink-0 text-green-700" />
                  {s}
                </li>
              ))}
            </ul>
            <div className="on-dark mt-8 rounded-xl bg-green-900 p-6 text-white">
              <p className="text-sm font-semibold text-gold-300">How we make sure scores are reliable</p>
              <p className="mt-2 text-sm text-white/80">{t.reliability}</p>
              <Link href="/quality" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold hover:text-gold-300">
                Quality &amp; methods
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </div>
          </Section>

          <Section id="fees" eyebrow="Fees & notices" title="Fee and official notices">
            <div className="mt-6 flex flex-col gap-4 rounded-xl border border-gold-300 bg-cream-50 p-6 sm:flex-row sm:items-center">
              <p className="font-serif text-4xl font-semibold text-green-700">{formatFee(t.fee)}</p>
              <p className="text-sm text-ink/80 sm:border-l sm:border-gold-300 sm:pl-4">
                {isCustom ? "Fees are agreed with each client institution." : `Per candidate. ${FEE_NOTE}`}
              </p>
            </div>
            {t.notices.length ? (
              <ul className="mt-6 border-t border-line">
                {t.notices.map((n) => (
                  <NoticeRow key={n.slug} notice={n} />
                ))}
              </ul>
            ) : (
              <p className="mt-6 text-muted">There are no current notices for this test.</p>
            )}
            <Link href={`/news?test=${t.slug}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-900">
              All {t.code} notices
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </Section>

          <Section id="schedule" eyebrow="Schedule & preparation" title="Dates and preparation material">
            {t.schedule ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-mint-50 p-5">
                  <p className="text-xs uppercase tracking-wider text-muted">Next session</p>
                  <p className="mt-1 font-semibold">{t.schedule.session}</p>
                </div>
                <div className="rounded-xl bg-mint-50 p-5">
                  <p className="text-xs uppercase tracking-wider text-muted">Registration closes</p>
                  <p className="mt-1 font-serif text-2xl text-green-700">{formatDate(t.schedule.regCloses)}</p>
                </div>
                <div className="rounded-xl bg-mint-50 p-5">
                  <p className="text-xs uppercase tracking-wider text-muted">Test date</p>
                  <p className="mt-1 font-serif text-2xl text-green-700">{formatDate(t.schedule.testDate)}</p>
                </div>
              </div>
            ) : (
              <p className="mt-6 text-muted">{t.frequencyNote}</p>
            )}
            {t.resources.length > 0 && (
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {t.resources.map((r) => (
                  <ResourceCard key={r.id} resource={r} />
                ))}
              </ul>
            )}
          </Section>

          <Section id="services" eyebrow={isCustom ? "Get started" : "Candidate services"} title={isCustom ? "Plan a customized assessment" : "Registration and results"}>
            {isCustom ? (
              <>
                <p className="mt-5 text-ink/90">
                  Tell us about the posts or programme, the number of candidates and your timeline. ETC will arrange a requirement study and
                  propose a blueprint and paper pattern.
                </p>
                <Link href="/institutions#enquiry" className="mt-6 inline-flex rounded-md bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800">
                  Submit an institutional enquiry
                </Link>
              </>
            ) : (
              <>
                <ul className="mt-6 grid gap-4 sm:grid-cols-3">
                  <PortalCard which="registration" settings={settings} title="Register" text="Apply and pay on the official ETC portal before the deadline." />
                  <PortalCard which="admitCard" settings={settings} title="Roll number slip" text="Download your admit card with test centre, date and time." />
                  <PortalCard which="results" settings={settings} title="Results" text="View and download your result after it is announced." />
                </ul>
                <p className="mt-5 flex gap-3 rounded-xl bg-cream-50 p-4 text-sm text-ink/80">
                  <Icon name="shield" className="h-5 w-5 shrink-0 text-gold-600" />
                  <span>
                    Registration, payments, admit cards and results are handled only by the official ETC/HEC portal. This website never asks for
                    payment details.
                  </span>
                </p>
              </>
            )}
          </Section>
          <div className="mt-6 flex flex-wrap gap-3" data-noprint>
            <ShareButtons title={t.name} noun="page" />
          </div>
          <p className="mt-2 text-xs text-muted">*{FEE_NOTE}</p>
        </div>
      </div>
    </>
  );
}


import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import { PortalLink } from "@/components/site/PortalLink";
import { StatusChip } from "@/components/site/StatusChip";
import { formatDate } from "@/lib/format";
import { getSchedule } from "@/lib/content/home";
import { getMediaByKeys, SECTION_IMAGES } from "@/lib/content/media";
import { getSettings } from "@/lib/content/settings";
import { getPublishedTests } from "@/lib/content/tests";

export const metadata: Metadata = pageMetadata({
  title: "Candidate Services",
  description: "Registration guidance, admit cards, results, test schedules and the test-day guide for ETC candidates.",
  path: "/candidate-services",
});

export default async function Page() {
  const [schedule, settings, tests, media] = await Promise.all([
    getSchedule(),
    getSettings(),
    getPublishedTests(),
    getMediaByKeys([SECTION_IMAGES.candidateCentre]),
  ]);
  const testNames = Object.fromEntries(tests.map((t) => [t.slug, t.name]));
  const img = (k: keyof typeof SECTION_IMAGES) => media[SECTION_IMAGES[k]] ?? { url: "/brand/etc-crest.png", alt: "" };
  return (
    <>
      <section className="relative isolate overflow-hidden bg-green-900 text-white on-dark">
        <div className="absolute inset-y-0 right-0 h-full w-full lg:w-3/5">
          <Image src={img("candidateCentre").url} alt="" fill priority sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-green-900 via-green-900/95 to-green-900/40" aria-hidden="true"></div>
        <div className="relative max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <nav aria-label="Breadcrumb" className="text-sm text-white/70">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link className="hover:text-white" href="/">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-white">
                Candidate Services
              </li>
            </ol>
          </nav>
          <p className="eyebrow mt-8">Candidate Services</p>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl font-semibold leading-tight max-w-2xl">
            Everything you need, from registration to results
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/80">
            Clear guidance on every step, with direct links to the official ETC portal for registration, admit cards and results.
          </p>
        </div>
      </section>
      {/* Four services */}
      <section aria-labelledby="svc-title" className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 id="svc-title" className="sr-only">
          Candidate services
        </h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <li id="register" className="scroll-mt-48 flex flex-col rounded-2xl border border-line p-6">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-green-700 font-serif text-white">1</span>
            <h3 className="mt-4 font-serif text-xl font-semibold text-green-700">Register</h3>
            <p className="mt-2 text-sm text-muted">
              Read the official notice for your test, then create an account, complete the form and pay the fee on the official portal
              before the deadline.
            </p>
            <div className="mt-auto pt-5">
              <PortalLink
                which="registration"
                settings={settings}
                className="inline-flex items-center gap-2 rounded-md bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
              >
                Go to registration{" "}
              </PortalLink>
            </div>
          </li>
          <li id="admit-card" className="scroll-mt-48 flex flex-col rounded-2xl border border-line p-6">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-green-700 font-serif text-white">2</span>
            <h3 className="mt-4 font-serif text-xl font-semibold text-green-700">Admit card</h3>
            <p className="mt-2 text-sm text-muted">
              Your roll number slip shows your test centre, date and reporting time. It is usually available about ten days before the test.
            </p>
            <div className="mt-auto pt-5">
              <PortalLink
                which="admitCard"
                settings={settings}
                className="inline-flex items-center gap-2 rounded-md bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
              >
                Download roll number slip{" "}
              </PortalLink>
            </div>
          </li>
          <li id="results" className="scroll-mt-48 flex flex-col rounded-2xl border border-line p-6">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-green-700 font-serif text-white">3</span>
            <h3 className="mt-4 font-serif text-xl font-semibold text-green-700">Results</h3>
            <p className="mt-2 text-sm text-muted">
              Results are released after post-hoc analysis of every item and published on the official results portal. Check result notices
              for dates.
            </p>
            <div className="mt-auto pt-5">
              <PortalLink
                which="results"
                settings={settings}
                className="inline-flex items-center gap-2 rounded-md bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
              >
                View results{" "}
              </PortalLink>
            </div>
          </li>
          <li className="flex flex-col rounded-2xl border border-line p-6">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-green-700 font-serif text-white">4</span>
            <h3 className="mt-4 font-serif text-xl font-semibold text-green-700">Schedule</h3>
            <p className="mt-2 text-sm text-muted">
              Upcoming tests, registration deadlines and test dates, with links to each official notice.
            </p>
            <a
              href="#schedule"
              className="mt-auto pt-5 inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900"
            >
              See the schedule
            </a>
          </li>
        </ul>
        <div className="mt-6 flex gap-3 rounded-xl bg-cream-50 p-5 text-sm ring-1 ring-gold-300/50">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5 shrink-0 text-gold-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M12 3 4 6v6c0 4.4 3.4 8.3 8 9 4.6-.7 8-4.6 8-9V6Z"></path>
            <path d="m9 12 2 2 4-4"></path>
          </svg>
          <p>
            <span className="font-semibold">
              The official ETC/HEC portal is the only place to register, pay, download admit cards and view results.
            </span>{" "}
            This website provides guidance and links; it never asks for payment or card details.
          </p>
        </div>
      </section>
      {/* Schedule */}
      <section id="schedule" aria-labelledby="schedule-title" className="scroll-mt-40 bg-mint-50 border-y border-line">
        <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Plan ahead</p>
              <h2 id="schedule-title" className="mt-3 font-serif text-3xl font-semibold text-green-700">
                Upcoming test schedule
              </h2>
            </div>
          </div>
          <div className="table-wrap mt-8" tabIndex={0} role="region" aria-label="Upcoming test schedule">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Session</th>
                  <th scope="col">Registration closes</th>
                  <th scope="col">Test date</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="sr-only">Details</span>
                  </th>
                </tr>
              </thead>
              <tbody id="schedule-body">
                {schedule.map((s) => (
                  <tr key={s.session}>
                    <td>
                      <span className="font-semibold">{s.session}</span>
                      <span className="block text-xs text-muted">{testNames[s.testSlug]}</span>
                    </td>
                    <td className="whitespace-nowrap">{formatDate(s.regCloses)}</td>
                    <td className="whitespace-nowrap">{formatDate(s.testDate)}</td>
                    <td>
                      <span className="inline-flex rounded-full bg-white">
                      <StatusChip status={s.status} />
                    </span>
                    </td>
                    <td>
                      <Link
                        className="whitespace-nowrap font-semibold text-green-700 hover:underline"
                        href={`/tests/${s.testSlug}#schedule`}
                      >
                        Details<span className="sr-only"> for {s.session}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted">
            Official dates are confirmed in the notice for each test.{" "}
            <Link className="font-semibold text-green-700 hover:underline" href="/news?type=schedule">
              See schedule notices
            </Link>
            .
          </p>
        </div>
      </section>
      {/* Test day */}
      <section id="test-day" aria-labelledby="day-title" className="scroll-mt-40 max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">Test day</p>
            <h2 id="day-title" className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-green-700">
              Your test-day journey
            </h2>
            <p className="mt-4 text-muted">The same steps, the same rules and the same timing for every candidate, in every city.</p>
            <div className="mt-8 rounded-2xl bg-green-900 p-6 text-white on-dark">
              <p className="font-semibold text-gold-300">Bring with you</p>
              <ul className="mt-3 space-y-2 text-sm text-white/85">
                <li className="flex gap-2">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-5 w-5 shrink-0 text-gold-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m5 12 4.5 4.5L19 7"></path>
                  </svg>
                  Printed admit card (roll number slip)
                </li>
                <li className="flex gap-2">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-5 w-5 shrink-0 text-gold-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m5 12 4.5 4.5L19 7"></path>
                  </svg>
                  Original CNIC or B-Form
                </li>
                <li className="flex gap-2">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-5 w-5 shrink-0 text-gold-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m5 12 4.5 4.5L19 7"></path>
                  </svg>
                  Only the items permitted in your instructions
                </li>
              </ul>
              <p className="mt-4 text-xs text-white/60">Mobile phones, smart watches and other electronic devices are not allowed.</p>
            </div>
          </div>
          <ol className="lg:col-span-8 relative space-y-4 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-line">
            <li className="relative flex gap-5">
              <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white font-serif text-green-700 ring-2 ring-green-700">
                1
              </span>
              <div className="pt-1.5">
                <h3 className="font-semibold">Registration</h3>
                <p className="mt-1 text-sm text-muted">Register and pay online, then receive your admit card with centre, date and time.</p>
              </div>
            </li>
            <li className="relative flex gap-5">
              <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white font-serif text-green-700 ring-2 ring-green-700">
                2
              </span>
              <div className="pt-1.5">
                <h3 className="font-semibold">Arrival and identity check</h3>
                <p className="mt-1 text-sm text-muted">You are verified against your admit card and identity document.</p>
              </div>
            </li>
            <li className="relative flex gap-5">
              <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white font-serif text-green-700 ring-2 ring-green-700">
                3
              </span>
              <div className="pt-1.5">
                <h3 className="font-semibold">Seating and instructions</h3>
                <p className="mt-1 text-sm text-muted">You are seated according to the seating plan and given standard instructions.</p>
              </div>
            </li>
            <li className="relative flex gap-5">
              <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white font-serif text-green-700 ring-2 ring-green-700">
                4
              </span>
              <div className="pt-1.5">
                <h3 className="font-semibold">Test administration</h3>
                <p className="mt-1 text-sm text-muted">Sealed papers are opened in front of candidates and timing is strictly followed.</p>
              </div>
            </li>
            <li className="relative flex gap-5">
              <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white font-serif text-green-700 ring-2 ring-green-700">
                5
              </span>
              <div className="pt-1.5">
                <h3 className="font-semibold">Collection and return</h3>
                <p className="mt-1 text-sm text-muted">Answer sheets are counted, sealed and returned securely to ETC.</p>
              </div>
            </li>
            <li className="relative flex gap-5">
              <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white font-serif text-green-700 ring-2 ring-green-700">
                6
              </span>
              <div className="pt-1.5">
                <h3 className="font-semibold">Scanning and analysis</h3>
                <p className="mt-1 text-sm text-muted">Answer sheets are scanned, scored and analysed, including post-hoc item analysis.</p>
              </div>
            </li>
            <li className="relative flex gap-5">
              <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-500 font-serif text-green-950">
                7
              </span>
              <div className="pt-1.5">
                <h3 className="font-semibold">Results</h3>
                <p className="mt-1 text-sm text-muted">Results are published online and shared with client institutions.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>
      {/* Rights & responsibilities */}
      <section id="policies" aria-labelledby="rights-title" className="scroll-mt-40 bg-cream-50 border-y border-gold-300/50">
        <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <p className="eyebrow">Transparency</p>
          <h2 id="rights-title" className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-green-700">
            Our commitment to candidates
          </h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-7 ring-1 ring-line">
              <h3 className="font-serif text-xl font-semibold text-green-700">What you can expect from ETC</h3>
              <ul className="mt-5 space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500"></span>
                  Clear, advance information about the test purpose, format, syllabus, timing, fee and rules.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500"></span>
                  Equal treatment under the same conditions, wherever and whenever the test is taken.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500"></span>
                  Questions that have been reviewed for accuracy and fairness, and statistically checked.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500"></span>
                  Reasonable arrangements for candidates with disabilities or special needs, on request.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500"></span>
                  Protection of personal data and confidentiality of results.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500"></span>
                  Timely results, and a clear route to raise questions or complaints.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500"></span>A fair hearing before any decision on a case
                  of alleged unfair means.
                </li>
              </ul>
            </div>
            <div className="rounded-2xl bg-white p-7 ring-1 ring-line">
              <h3 className="font-serif text-xl font-semibold text-green-700">What ETC expects from you</h3>
              <ul className="mt-5 space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-700"></span>
                  Read all instructions and follow the test rules.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-700"></span>
                  Provide accurate personal information and carry valid identification.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-700"></span>
                  Arrive on time and bring only permitted items.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-700"></span>
                  Do your own work honestly; any form of cheating or impersonation leads to disciplinary action.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-700"></span>
                  Keep the content of the test confidential.
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div id="unfair-means" className="scroll-mt-40 rounded-2xl bg-green-900 p-7 text-white on-dark">
              <h3 className="font-serif text-xl font-semibold">Unfair means</h3>
              <p className="mt-3 text-sm text-white/80">
                Cases of alleged unfair means are heard by ETC’s independent Quality Assurance Department through a set, documented
                procedure. The candidate is always heard before a decision is made.
              </p>
              <Link href="/resources?type=policy" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold hover:text-gold-300">
                Read the unfair means policy
              </Link>
            </div>
            <div id="accessibility" className="scroll-mt-40 rounded-2xl bg-white p-7 ring-1 ring-line">
              <h3 className="font-serif text-xl font-semibold text-green-700">Accessibility & special accommodations</h3>
              <p className="mt-3 text-sm text-ink/80">
                ETC provides reasonable arrangements for candidates with disabilities or special needs. Request them during registration
                with supporting documents, so arrangements can be confirmed before your test.
              </p>
              <Link
                href="/news/accommodations-2026"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900"
              >
                How to request special arrangements
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col gap-6 rounded-2xl bg-mint-50 p-8 sm:flex-row sm:items-center sm:justify-between ring-1 ring-line">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-green-700">Still have a question?</h2>
            <p className="mt-1 text-muted">Browse answers to common questions, or contact the ETC helpline.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/faqs" className="rounded-md bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800">
              Help & FAQs
            </Link>
            <Link href="/contact" className="rounded-md border border-green-700/30 px-5 py-3 font-semibold text-green-700 hover:bg-white">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

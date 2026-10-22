// Homepage sections ported from mockup/index.html. Static copy is verbatim; lists come from the database.
import Image from "next/image";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";
import type { ClientSector } from "@prisma/client";
import type { LeaderItem, NoticeRow as NoticeRowData, ScheduleItem as ScheduleItemData, StatItem, TestCard as TestCardData } from "@/lib/content/types";
import { NoticeRow } from "../NoticeRow";
import { ScheduleItem } from "../ScheduleItem";
import { TestCard } from "../TestCard";
import { Counter } from "../Counter";

const QUICK: [IconName, string, string, string][] = [
  ["register", "/candidate-services#register", "Registration guidance", "How to apply, then register on the official portal."],
  ["card", "/candidate-services#admit-card", "Roll number slip", "Download your admit card with centre and time."],
  ["results", "/candidate-services#results", "Results", "Check result announcements and the results portal."],
  ["calendar", "/candidate-services#schedule", "Test schedules", "Upcoming tests, deadlines and key dates."],
];

export function QuickActions() {
  return (
    <section aria-labelledby="qa-title" className="relative z-10 -mt-16 sm:-mt-20">
      <h2 id="qa-title" className="sr-only">
        Candidate quick actions
      </h2>
      <div className="mx-auto max-w-site px-4 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {QUICK.map(([icon, href, title, text]) => (
            <li key={href} className="group relative rounded-xl bg-white p-5 shadow-lift ring-1 ring-line hover:ring-green-700 sm:p-6">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-mint-50 text-green-700">
                <Icon name={icon} />
              </span>
              <h3 className="mt-4 font-semibold text-ink">
                <Link href={href} className="after:absolute after:inset-0">
                  {title}
                </Link>
              </h3>
              <p className="mt-1 hidden text-sm text-muted sm:block">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Announcements({ notices, schedule }: { notices: NoticeRowData[]; schedule: ScheduleItemData[] }) {
  return (
    <section aria-labelledby="news-title" className="mx-auto max-w-site px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8" data-reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">News &amp; Notices</p>
              <h2 id="news-title" className="mt-3 font-serif text-3xl font-semibold text-green-700 sm:text-4xl">
                Latest announcements
              </h2>
            </div>
            <Link href="/news" className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900">
              View all notices <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </div>
          <ul id="home-notices" className="mt-6 border-t border-line">
            {notices.map((n) => (
              <NoticeRow key={n.slug} notice={n} />
            ))}
          </ul>
        </div>
        <aside className="lg:col-span-4" data-reveal aria-labelledby="dates-title">
          <div className="on-dark relative overflow-hidden rounded-2xl bg-green-900 p-7 text-white lg:sticky lg:top-40">
            <div className="pattern-dots absolute inset-0 opacity-70" aria-hidden="true" />
            <div className="relative">
              <p className="eyebrow">Plan ahead</p>
              <h2 id="dates-title" className="mt-3 font-serif text-2xl font-semibold">
                Upcoming test dates
              </h2>
              <ul id="home-schedule" className="mt-4">
                {schedule.slice(0, 4).map((s) => (
                  <ScheduleItem key={s.session} item={s} />
                ))}
              </ul>
              <p className="mt-4 text-xs text-white/60">Official dates are confirmed in each test notice.</p>
              <Link
                href="/candidate-services#schedule"
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-green-800 hover:bg-cream-50"
              >
                Full schedule
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function FindYourTest({ tests }: { tests: TestCardData[] }) {
  return (
    <section aria-labelledby="tests-title" className="border-y border-line bg-mint-50">
      <div className="mx-auto max-w-site px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="max-w-3xl" data-reveal>
          <p className="eyebrow">Tests &amp; Assessments</p>
          <h2 id="tests-title" className="mt-3 font-serif text-3xl font-semibold text-green-700 sm:text-4xl">
            Find your test
          </h2>
          <p className="mt-4 text-lg text-muted">
            Five national standardized tests and customized assessments — each built to a blueprint, piloted before use and
            analysed after every session.
          </p>
        </div>
        <div id="home-tests" className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tests.map((t) => (
            <TestCard key={t.slug} test={t} />
          ))}
        </div>
        <p className="mt-6 text-xs text-muted">
          *Fee per candidate as per ETC Institutional Profile 2026; always confirm in the official announcement.
        </p>
      </div>
    </section>
  );
}

function Step({ n, title, text, gold, dark }: { n: number; title: string; text: string; gold?: boolean; dark?: boolean }) {
  const dot = gold ? "bg-gold-500 text-green-950" : dark ? "bg-white/15" : "bg-green-700 text-white";
  return (
    <li className="flex gap-4">
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full font-serif ${dot}`}>{n}</span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className={`text-sm ${dark ? "text-white/70" : "text-muted"}`}>{text}</p>
      </div>
    </li>
  );
}

export function Journeys({ institutionsImage }: { institutionsImage: string }) {
  return (
    <section aria-labelledby="journeys-title" className="mx-auto max-w-site px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <h2 id="journeys-title" className="sr-only">
        How can we help you?
      </h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-cream-50 p-8 ring-1 ring-gold-300/50 sm:p-10" data-reveal>
          <p className="eyebrow">For candidates</p>
          <h3 className="mt-3 font-serif text-3xl font-semibold text-green-700">I’m taking a test</h3>
          <ol className="mt-8 space-y-5">
            <Step n={1} title="Find the right test" text="Admissions, scholarships, licensing or recruitment." />
            <Step n={2} title="Check eligibility and syllabus" text="Test pattern, fee and preparation PDFs." />
            <Step n={3} title="Read the current notice" text="Dates, deadlines and instructions." />
            <Step n={4} title="Register on the official ETC portal" text="Registration, payment, admit cards and results." gold />
          </ol>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/tests" className="rounded-md bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800">
              Find a test
            </Link>
            <Link href="/candidate-services" className="rounded-md border border-green-700/30 px-5 py-3 font-semibold text-green-700 hover:bg-white">
              Candidate services
            </Link>
          </div>
        </div>
        <div className="on-dark relative overflow-hidden rounded-2xl bg-green-900 p-8 text-white sm:p-10" data-reveal>
          <Image src={institutionsImage} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-900/90 to-green-900/70" aria-hidden="true" />
          <div className="relative">
            <p className="eyebrow">For institutions</p>
            <h3 className="mt-3 font-serif text-3xl font-semibold">I represent an institution</h3>
            <ol className="mt-8 space-y-5">
              <Step n={1} dark title="Understand what ETC can do" text="Admissions, recruitment, scholarships, promotions and more." />
              <Step n={2} dark title="Review our quality approach" text="Blueprints, piloting, psychometrics and three-tier monitoring." />
              <Step n={3} dark gold title="Submit an enquiry" text="Tell us your posts or programme, candidates and timeline." />
            </ol>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/institutions#enquiry" className="rounded-md bg-gold-500 px-5 py-3 font-semibold text-green-950 hover:bg-gold-300">
                Make an enquiry
              </Link>
              <Link href="/institutions" className="rounded-md border border-white/40 px-5 py-3 font-semibold hover:bg-white/10">
                Institutional solutions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Numbers({ stats }: { stats: StatItem[] }) {
  return (
    <section aria-labelledby="numbers-title" className="border-y border-gold-300/50 bg-cream-50">
      <div className="mx-auto max-w-site px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4" data-reveal>
          <div>
            <p className="eyebrow">ETC at a glance</p>
            <h2 id="numbers-title" className="mt-3 font-serif text-3xl font-semibold text-green-700 sm:text-4xl">
              Our record in numbers
            </h2>
          </div>
          <p className="text-sm text-muted">Since 1 July 2021, as recorded in ETC’s institutional data.</p>
        </div>
        <dl className="mt-12 grid grid-cols-2 gap-y-10 sm:grid-cols-4">
          {stats.map((s, k) => (
            <div key={s.label} className={`flex flex-col px-2 lg:px-6 ${k % 4 ? "lg:border-l lg:border-gold-300/50" : "lg:pl-0"}`}>
              <dt className="order-2 text-sm font-medium text-muted">{s.label}</dt>
              <dd className="order-1 font-serif text-4xl font-semibold text-green-700 sm:text-[2.6rem]">
                <Counter value={s.value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

const PROTECT: [string, string, string][] = [
  ["01", "Built to a blueprint", "A Table of Specifications fixes topics, number of questions and thinking levels in advance, using Bloom’s Taxonomy."],
  ["02", "Tested before it counts", "Items pass blind peer review and five quality committees, then are piloted on real students — 802 test batteries so far."],
  ["03", "Checked after every test", "Post-hoc analysis validates every key before results are released. Any faulty item is removed or credited to all candidates."],
];

export function Protect({ omr, sealed }: { omr: { url: string; alt: string }; sealed: { url: string; alt: string } }) {
  return (
    <section aria-labelledby="protect-title" className="on-dark relative overflow-hidden bg-green-900 text-white">
      <div className="pattern-dots absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-site px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6" data-reveal>
            <p className="eyebrow">Quality &amp; Methods</p>
            <h2 id="protect-title" className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              How we protect every result
            </h2>
            <p className="mt-5 max-w-xl text-lg text-white/80">
              A test score is only as good as the questions behind it. Every ETC item follows the same 13-step path before it can
              count towards a candidate’s score.
            </p>
            <ol className="mt-10 space-y-8">
              {PROTECT.map(([n, title, text]) => (
                <li key={n} className="flex gap-6">
                  <span className="w-10 shrink-0 font-serif text-3xl text-gold-300">{n}</span>
                  <div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="mt-1 text-white/70">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/quality" className="mt-10 inline-flex items-center gap-2 rounded-md border border-white/40 px-5 py-3 font-semibold hover:bg-white/10">
              Explore our methods <Icon name="arrow" className="h-5 w-5" />
            </Link>
          </div>
          <div className="lg:col-span-6" data-reveal>
            <div className="relative grid grid-cols-5 gap-4">
              <figure className="relative col-span-3 aspect-[3/4] overflow-hidden rounded-2xl ring-1 ring-white/10">
                <Image src={omr.url} alt={omr.alt} fill sizes="(min-width: 1024px) 30vw, 60vw" className="object-cover" />
              </figure>
              <div className="col-span-2 flex flex-col gap-4">
                <figure className="relative aspect-square overflow-hidden rounded-2xl ring-1 ring-white/10">
                  <Image src={sealed.url} alt={sealed.alt} fill sizes="(min-width: 1024px) 20vw, 40vw" className="object-cover" />
                </figure>
                <div className="flex-1 rounded-2xl bg-gold-500 p-5 text-green-950">
                  <p className="font-serif text-4xl font-semibold">3-tier</p>
                  <p className="mt-1 text-sm font-medium">monitoring at every centre, including senior HEC officials</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const SERVICES: [string, string][] = [
  ["Admissions", "Standardized tests that help universities and colleges select students fairly and on merit."],
  ["Bar Council licence", "The Law Graduate Assessment Test for law graduates seeking enrolment as advocates."],
  ["Scholarships", "Eligibility and merit tests for HEC and other national scholarship programmes."],
  ["Recruitment", "Job-related tests that help public bodies shortlist and select qualified candidates."],
  ["Promotions", "Assessments that support fair, evidence-based decisions on career progression."],
  ["Personality assessment", "Psychological and personality evaluations for selection and placement needs."],
];

export function Services() {
  return (
    <section aria-labelledby="services-title" className="mx-auto max-w-site px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="max-w-3xl" data-reveal>
        <p className="eyebrow">Institutional Solutions</p>
        <h2 id="services-title" className="mt-3 font-serif text-3xl font-semibold text-green-700 sm:text-4xl">
          Assessment services for institutions
        </h2>
        <p className="mt-4 text-lg text-muted">
          Universities, government departments, regulators and professional councils rely on ETC for standardized assessment,
          tailored to the decision they need to make.
        </p>
      </div>
      <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-line ring-1 ring-line sm:grid-cols-2 lg:grid-cols-3" data-reveal>
        {SERVICES.map(([title, text]) => (
          <li key={title} className="bg-white p-7">
            <h3 className="font-serif text-xl font-semibold text-green-700">{title}</h3>
            <p className="mt-2 text-sm text-muted">{text}</p>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link href="/institutions#enquiry" className="rounded-md bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800">
          Submit an institutional enquiry
        </Link>
        <Link href="/institutions" className="inline-flex items-center gap-2 font-semibold text-green-700 hover:text-green-900">
          See all services <Icon name="arrow" className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

export function ChairmanQuote({ leader }: { leader: LeaderItem | null }) {
  if (!leader) return null;
  return (
    <section aria-labelledby="quote-title" className="border-y border-gold-300/50 bg-cream-50">
      <div className="mx-auto grid max-w-site gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-12 lg:items-center lg:px-8">
        <figure className="lg:col-span-8" data-reveal>
          <h2 id="quote-title" className="sr-only">
            Message from the Chairman
          </h2>
          <svg aria-hidden="true" viewBox="0 0 48 48" className="h-12 w-12 text-gold-500" fill="currentColor">
            <path d="M20 12c-7 2-12 8-12 16v8h12V24h-6c0-4 3-7 7-8l-1-4Zm20 0c-7 2-12 8-12 16v8h12V24h-6c0-4 3-7 7-8l-1-4Z" />
          </svg>
          <blockquote className="mt-6 font-serif text-3xl leading-snug text-green-800 sm:text-4xl">“{leader.quote}”</blockquote>
          <figcaption className="mt-8 flex items-center gap-4">
            <span className="h-px w-10 bg-gold-500" />
            <span>
              <span className="block font-semibold text-ink">{leader.name}</span>
              <span className="block text-sm text-muted">{leader.title}, Education Testing Council</span>
            </span>
          </figcaption>
          <Link href="/about#leadership" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900">
            Read the leadership messages <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </figure>
        <div className="lg:col-span-4" data-reveal>
          <div className="relative mx-auto aspect-[4/5] max-w-xs overflow-hidden rounded-2xl bg-mint-50 ring-1 ring-line">
            {leader.photo ? (
              <Image src={leader.photo.url} alt={leader.photo.alt || leader.name} fill sizes="320px" className="object-cover" />
            ) : (
              <div className="grid h-full place-items-center p-6 text-center">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-white font-serif text-2xl text-green-700 ring-1 ring-line">C</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const SECTOR_ORDER: ClientSector[] = ["FEDERAL", "UNIVERSITY", "PROVINCIAL", "OTHER"];

export function ClientsMarquee({ clients }: { clients: Record<ClientSector, string[]> }) {
  const names = SECTOR_ORDER.flatMap((s) => clients[s]);
  const item = (n: string, k: number, hidden: boolean) => (
    <li key={`${hidden ? "b" : "a"}${k}`} className="flex items-center gap-10 font-serif text-lg text-ink/70" aria-hidden={hidden || undefined}>
      {n}
      <span className="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden="true" />
    </li>
  );
  return (
    <section aria-labelledby="clients-title" className="overflow-hidden py-16">
      <div className="mx-auto max-w-site px-4 text-center sm:px-6 lg:px-8">
        <p className="eyebrow justify-center">Track record</p>
        <h2 id="clients-title" className="mt-3 font-serif text-2xl font-semibold text-green-700 sm:text-3xl">
          Trusted by institutions across Pakistan
        </h2>
      </div>
      <div className="marquee relative mt-10" tabIndex={0} aria-label="Client institutions (scrolling list)" role="region">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" aria-hidden="true" />
        <ul className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap">
          {names.map((n, k) => item(n, k, false))}
          {names.map((n, k) => item(n, k, true))}
        </ul>
      </div>
      <p className="mt-8 text-center">
        <Link href="/institutions#clients" className="text-sm font-semibold text-green-700 hover:text-green-900">
          See all clients and partners
        </Link>
      </p>
    </section>
  );
}

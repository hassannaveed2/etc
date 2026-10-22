import type { Metadata } from "next";
import type { ClientSector } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { EnquiryForm } from "@/components/site/forms/EnquiryForm";
import { getClients } from "@/lib/content/home";
import { getMediaByKeys, SECTION_IMAGES } from "@/lib/content/media";
import { submitEnquiry } from "../actions";

const CLIENT_GROUPS: [string, ClientSector][] = [
  ["Federal & regulatory bodies", "FEDERAL"],
  ["Universities", "UNIVERSITY"],
  ["Provincial & Gilgit-Baltistan bodies", "PROVINCIAL"],
  ["Scholarships, schools & projects", "OTHER"],
];

export const metadata: Metadata = {
  title: "Institutional Solutions",
  description:
    "Admissions, recruitment, scholarship, promotion, skill and personality assessments from ETC for universities and public bodies.",
};

export default async function Page() {
  const [clients, media] = await Promise.all([getClients(), getMediaByKeys([SECTION_IMAGES.institutions])]);
  const img = (k: keyof typeof SECTION_IMAGES) => media[SECTION_IMAGES[k]] ?? { url: "/brand/etc-crest.png", alt: "" };
  return (
    <>
      <section className="relative isolate overflow-hidden bg-green-900 text-white on-dark">
        <Image src={img("institutions").url} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-green-950/95 via-green-950/85 to-green-950/30" aria-hidden="true"></div>
        <div className="relative max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <nav aria-label="Breadcrumb" className="text-sm text-white/70">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link className="hover:text-white" href="/">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-white">
                Institutional Solutions
              </li>
            </ol>
          </nav>
          <p className="eyebrow mt-8">Institutional Solutions</p>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl font-semibold leading-tight max-w-3xl">Assessment you can stand behind</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85">
            Standardized tests for universities, government departments, regulators and professional councils — with the same quality
            process behind every one.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#enquiry" className="rounded-md bg-gold-500 px-5 py-3 font-semibold text-green-950 hover:bg-gold-300">
              Submit an enquiry
            </a>
            <Link href="/quality" className="rounded-md border border-white/40 px-5 py-3 font-semibold hover:bg-white/10">
              Our quality approach
            </Link>
          </div>
          <dl className="mt-12 grid max-w-3xl grid-cols-3 gap-6 border-t border-white/15 pt-6">
            <div>
              <dt className="text-xs uppercase tracking-wider text-white/60">Test projects</dt>
              <dd className="mt-1 font-serif text-3xl">261</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-white/60">Blueprints</dt>
              <dd className="mt-1 font-serif text-3xl">850</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-white/60">In one shift</dt>
              <dd className="mt-1 font-serif text-3xl">80,000</dd>
            </div>
          </dl>
        </div>
      </section>
      {/* Services */}
      <section
        id="services"
        aria-labelledby="services-title"
        className="scroll-mt-40 max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
      >
        <p className="eyebrow">What we offer</p>
        <h2 id="services-title" className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-green-700">
          Services for institutions
        </h2>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <li className="rounded-2xl border border-line p-7">
            <h3 className="font-serif text-xl font-semibold text-green-700">University admissions</h3>
            <p className="mt-2 text-sm text-muted">
              Standardized admission tests that make selection transparent and comparable — including the Quaid-i-Azam University
              undergraduate test and MDCAT for SZABMU.
            </p>
          </li>
          <li className="rounded-2xl border border-line p-7">
            <h3 className="font-serif text-xl font-semibold text-green-700">Recruitment & screening</h3>
            <p className="mt-2 text-sm text-muted">
              Job-related tests that help public bodies shortlist and select qualified candidates for specific cadres.
            </p>
          </li>
          <li className="rounded-2xl border border-line p-7">
            <h3 className="font-serif text-xl font-semibold text-green-700">Scholarship assessments</h3>
            <p className="mt-2 text-sm text-muted">Eligibility and merit tests for HEC and other national scholarship programmes.</p>
          </li>
          <li className="rounded-2xl border border-line p-7">
            <h3 className="font-serif text-xl font-semibold text-green-700">Promotion & skill assessments</h3>
            <p className="mt-2 text-sm text-muted">
              Fair, evidence-based decisions on career progression, plus practical skill tests for technical and IT posts.
            </p>
          </li>
          <li className="rounded-2xl border border-line p-7">
            <h3 className="font-serif text-xl font-semibold text-green-700">Personality assessment</h3>
            <p className="mt-2 text-sm text-muted">Standardized psychological tools for selection, placement and personality profiling.</p>
          </li>
          <li className="rounded-2xl bg-green-900 p-7 text-white on-dark">
            <h3 className="font-serif text-xl font-semibold">Customized assessment development</h3>
            <p className="mt-2 text-sm text-white/80">A test built for your purpose, from blueprint to result report.</p>
            <Link href="/tests/customized" className="mt-4 inline-flex text-sm font-semibold text-gold-300 hover:text-white">
              About customized tests
            </Link>
          </li>
        </ul>
      </section>
      {/* Types of tests */}
      <section id="types" aria-labelledby="types-title" className="scroll-mt-40 max-w-site mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <h2 id="types-title" className="font-serif text-2xl sm:text-3xl font-semibold text-green-700">
          Types of tests and assessments
        </h2>
        <div className="table-wrap mt-6" tabIndex={0} role="region" aria-label="Types of tests and assessments">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Type</th>
                <th scope="col">What it is</th>
                <th scope="col">Typical use</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-semibold">MCQ-based tests</td>
                <td>Objective questions with one correct answer among several options, scored by machine quickly and without bias.</td>
                <td>Admissions, scholarships, recruitment, licensing.</td>
              </tr>
              <tr>
                <td className="font-semibold">Descriptive tests</td>
                <td>Written answers or essays scored against a fixed marking rubric by trained examiners.</td>
                <td>USAT Part II essay, recruitment, promotion.</td>
              </tr>
              <tr>
                <td className="font-semibold">Skill tests</td>
                <td>Practical tasks that check whether a candidate can actually perform defined skills.</td>
                <td>Technical and vocational posts, IT skills.</td>
              </tr>
              <tr>
                <td className="font-semibold">Physical tests</td>
                <td>Measured physical tasks against defined standards.</td>
                <td>Police and security recruitment.</td>
              </tr>
              <tr>
                <td className="font-semibold">Psychological assessment</td>
                <td>Standardized tools that measure personality, aptitude or behavioural traits.</td>
                <td>Selection, placement, personality profiling.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      {/* Process */}
      <section id="process" aria-labelledby="process-title" className="scroll-mt-40 bg-mint-50 border-y border-line">
        <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <p className="eyebrow">How an engagement works</p>
          <h2 id="process-title" className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-green-700">
            Five steps from requirement to result
          </h2>
          <ol className="mt-12 grid gap-5 md:grid-cols-5">
            <li className="rounded-2xl bg-white p-6 ring-1 ring-line">
              <p className="font-serif text-4xl text-gold-500">01</p>
              <h3 className="mt-3 font-semibold">Requirement study</h3>
              <p className="mt-2 text-sm text-muted">
                We meet you to understand the posts, programme or decision, the number of candidates and the timeline.
              </p>
            </li>
            <li className="rounded-2xl bg-white p-6 ring-1 ring-line">
              <p className="font-serif text-4xl text-gold-500">02</p>
              <h3 className="mt-3 font-semibold">Test design</h3>
              <p className="mt-2 text-sm text-muted">A blueprint and paper pattern are prepared and agreed with you.</p>
            </li>
            <li className="rounded-2xl bg-white p-6 ring-1 ring-line">
              <p className="font-serif text-4xl text-gold-500">03</p>
              <h3 className="mt-3 font-semibold">Item selection</h3>
              <p className="mt-2 text-sm text-muted">Calibrated items are drawn from the bank, or new items are written and reviewed.</p>
            </li>
            <li className="rounded-2xl bg-white p-6 ring-1 ring-line">
              <p className="font-serif text-4xl text-gold-500">04</p>
              <h3 className="mt-3 font-semibold">Administration</h3>
              <p className="mt-2 text-sm text-muted">The test is conducted at ETC centres under standard security protocols.</p>
            </li>
            <li className="rounded-2xl bg-white p-6 ring-1 ring-line">
              <p className="font-serif text-4xl text-gold-500">05</p>
              <h3 className="mt-3 font-semibold">Scoring & reporting</h3>
              <p className="mt-2 text-sm text-muted">
                Results are processed, checked and delivered with a result report and, where useful, analysis by learning outcome.
              </p>
            </li>
          </ol>
        </div>
      </section>
      {/* Why ETC */}
      <section aria-labelledby="why-title" className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">What sets ETC apart</p>
            <h2 id="why-title" className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-green-700">
              One integrated, quality-controlled system
            </h2>
            <p className="mt-4 text-muted">From item development to result processing, every stage is connected and checked.</p>
          </div>
          <ul className="lg:col-span-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <li className="border-t-2 border-gold-500 pt-4">
              <h3 className="font-semibold">Standardized, competency-based</h3>
              <p className="mt-1 text-sm text-muted">Consistency, validity, reliability and fairness, aligned with defined competencies.</p>
            </li>
            <li className="border-t-2 border-gold-500 pt-4">
              <h3 className="font-semibold">Evidence-based quality assurance</h3>
              <p className="mt-1 text-sm text-muted">Pre-test and post-hoc analysis checks how every item and test performs.</p>
            </li>
            <li className="border-t-2 border-gold-500 pt-4">
              <h3 className="font-semibold">Calibrated item bank</h3>
              <p className="mt-1 text-sm text-muted">230,685 items developed, calibrated on national and regional norms.</p>
            </li>
            <li className="border-t-2 border-gold-500 pt-4">
              <h3 className="font-semibold">Trained subject experts</h3>
              <p className="mt-1 text-sm text-muted">A pool of 530 experts develops, reviews and validates items.</p>
            </li>
            <li className="border-t-2 border-gold-500 pt-4">
              <h3 className="font-semibold">Automated, secure test generation</h3>
              <p className="mt-1 text-sm text-muted">No single person sees a complete paper in advance.</p>
            </li>
            <li className="border-t-2 border-gold-500 pt-4">
              <h3 className="font-semibold">Three-tier monitoring</h3>
              <p className="mt-1 text-sm text-muted">Centre staff, ETC teams and senior HEC officials oversee every administration.</p>
            </li>
          </ul>
        </div>
      </section>
      {/* Clients */}
      <section id="clients" aria-labelledby="clients-title" className="scroll-mt-40 bg-cream-50 border-y border-gold-300/50">
        <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <p className="eyebrow">Track record</p>
          <h2 id="clients-title" className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-green-700">
            Clients and institutional partners
          </h2>
          <div id="client-groups" className="mt-10 grid gap-6 md:grid-cols-2">
            {CLIENT_GROUPS.map(([title, sector]) => (
              <div key={sector} className="rounded-2xl bg-white p-7 ring-1 ring-line">
                <h3 className="font-serif text-xl font-semibold text-green-700">{title}</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {clients[sector].map((n) => (
                    <li key={n} className="rounded-full bg-mint-50 px-3 py-1.5 text-sm text-ink/80">
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Enquiry form */}
      <section id="enquiry" aria-labelledby="enquiry-title" className="scroll-mt-40 max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">Get in touch</p>
            <h2 id="enquiry-title" className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-green-700">
              Institutional enquiry
            </h2>
            <p className="mt-4 text-muted">
              Tell us what you need to assess. The ETC business development team will contact you to arrange a requirement study.
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              <li className="flex gap-3">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 shrink-0 text-green-700"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m5 12 4.5 4.5L19 7"></path>
                </svg>
                Response from the ETC team
              </li>
              <li className="flex gap-3">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 shrink-0 text-green-700"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m5 12 4.5 4.5L19 7"></path>
                </svg>
                Secure delivery to a designated ETC address
              </li>
              <li className="flex gap-3">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 shrink-0 text-green-700"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m5 12 4.5 4.5L19 7"></path>
                </svg>
                No obligation until a proposal is agreed
              </li>
            </ul>
          </div>
          <EnquiryForm action={submitEnquiry} />
        </div>
      </section>
    </>
  );
}

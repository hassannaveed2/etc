import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import { BankBars, Workflow } from "@/components/site/quality/Workflow";
import { getMediaByKeys, SECTION_IMAGES } from "@/lib/content/media";

export const metadata: Metadata = pageMetadata({
  title: "Quality & Methods",
  description: "How ETC designs, reviews, pilots and analyses every question, and keeps every test fair and secure.",
  path: "/quality",
});

export default async function Page() {
  const media = await getMediaByKeys([SECTION_IMAGES.qualityOmr, SECTION_IMAGES.qualitySealed]);
  const img = (k: keyof typeof SECTION_IMAGES) => media[SECTION_IMAGES[k]] ?? { url: "/brand/etc-crest.png", alt: "" };
  return (
    <>
      <section className="relative isolate overflow-hidden bg-green-900 text-white on-dark">
        <div className="absolute inset-0 pattern-dots" aria-hidden="true"></div>
        <div className="relative max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <nav aria-label="Breadcrumb" className="text-sm text-white/70">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link className="hover:text-white" href="/">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-white">
                  Quality & Methods
                </li>
              </ol>
            </nav>
            <p className="eyebrow mt-8">Quality & Methods</p>
            <h1 className="mt-3 font-serif text-4xl sm:text-5xl font-semibold leading-tight">
              A test score is only as good as the questions behind it
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/80">
              How ETC designs, reviews, pilots and analyses every question — in line with international good practice such as the ETS
              Standards for Quality and Fairness.
            </p>
          </div>
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <Image
              src={img("qualityOmr").url}
              alt={img("qualityOmr").alt}
              width={800}
              height={1000}
              priority
              className="aspect-[4/5] rounded-2xl object-cover ring-1 ring-white/10"
            />
            <Image
              src={img("qualitySealed").url}
              alt={img("qualitySealed").alt}
              width={800}
              height={1000}
              className="mt-10 aspect-[4/5] rounded-2xl object-cover ring-1 ring-white/10"
            />
          </div>
        </div>
      </section>
      <nav
        aria-label="On this page"
        className="sticky top-[72px] sm:top-20 lg:top-[130px] z-30 border-b border-line bg-white/95 backdrop-blur"
      >
        <ul className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 overflow-x-auto no-scrollbar text-sm">
          <li>
            <a className="block whitespace-nowrap px-3 py-3.5 text-muted hover:text-green-700" href="#workflow">
              13-step workflow
            </a>
          </li>
          <li>
            <a className="block whitespace-nowrap px-3 py-3.5 text-muted hover:text-green-700" href="#blueprints">
              Blueprints
            </a>
          </li>
          <li>
            <a className="block whitespace-nowrap px-3 py-3.5 text-muted hover:text-green-700" href="#item-bank">
              Item bank
            </a>
          </li>
          <li>
            <a className="block whitespace-nowrap px-3 py-3.5 text-muted hover:text-green-700" href="#psychometrics">
              Psychometrics
            </a>
          </li>
          <li>
            <a className="block whitespace-nowrap px-3 py-3.5 text-muted hover:text-green-700" href="#qa">
              Quality assurance
            </a>
          </li>
          <li>
            <a className="block whitespace-nowrap px-3 py-3.5 text-muted hover:text-green-700" href="#security">
              Fairness & security
            </a>
          </li>
        </ul>
      </nav>
      {/* Workflow */}
      <section id="workflow" aria-labelledby="wf-title" className="scroll-mt-48 max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <p className="eyebrow">Test development</p>
        <h2 id="wf-title" className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-green-700">
          The 13-step test development workflow
        </h2>
        <p className="mt-4 max-w-3xl text-muted">
          Every question follows the same path before it can count towards a candidate’s score. Select a step to see what happens. Use the
          arrow keys to move between steps.
        </p>
        <Workflow />
      </section>
      {/* Blueprints */}
      <section id="blueprints" aria-labelledby="bp-title" className="scroll-mt-48 bg-mint-50 border-y border-line">
        <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5 min-w-0">
            <p className="eyebrow">Blueprints</p>
            <h2 id="bp-title" className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-green-700">
              Every test starts with a plan
            </h2>
            <p className="mt-4 text-ink/80">
              A blueprint (Table of Specifications) makes sure the paper covers the right topics in the right proportions, and asks
              candidates to think at the right levels. ETC uses Bloom’s Taxonomy to describe these levels.
            </p>
            <h3 className="mt-8 font-semibold">Good practice in item writing</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink/80">
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500"></span>
                One clear idea per question, linked to a blueprint cell.
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500"></span>A clear stem and one, and only one, correct
                answer.
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500"></span>
                Plausible distractors based on common mistakes, not tricks.
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500"></span>
                Plain language, so the question measures the skill and not reading speed.
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500"></span>
                No offensive, stereotyped or unfamiliar content for any group.
              </li>
            </ul>
          </div>
          <div className="lg:col-span-7 min-w-0">
            <div className="table-wrap" tabIndex={0} role="region" aria-label="Bloom's taxonomy levels">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Code</th>
                    <th scope="col">Level</th>
                    <th scope="col">What the candidate does</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-semibold">K</td>
                    <td>Knowledge</td>
                    <td>Recalls facts, terms, definitions and formulas.</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">U</td>
                    <td>Understanding</td>
                    <td>Explains, interprets and summarizes ideas.</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Ap</td>
                    <td>Application</td>
                    <td>Uses rules, formulas and concepts to solve new problems.</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">An</td>
                    <td>Analysis</td>
                    <td>Breaks information down and identifies relationships and patterns.</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">E</td>
                    <td>Evaluation</td>
                    <td>Judges validity and makes evidence-based decisions.</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">C</td>
                    <td>Create</td>
                    <td>Combines ideas to form a new structure or argument.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
      {/* Item bank */}
      <section id="item-bank" aria-labelledby="ib-title" className="scroll-mt-48 max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">The ETC item bank</p>
            <h2 id="ib-title" className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-green-700">
              A calibrated national resource
            </h2>
            <p className="mt-6 font-serif text-6xl font-semibold text-green-700">
              <span data-counter="230685">230,685</span>
            </p>
            <p className="mt-1 text-muted">items developed to date</p>
            <p className="mt-6 text-sm text-ink/80">
              The bank lets ETC build many different but equivalent papers, avoid repeating questions, and respond quickly to new client
              needs. Every item is tagged with its subject, Bloom’s level, difficulty, discrimination, fairness flag, usage history and
              review trail.
            </p>
            <p className="mt-4 text-sm text-ink/80">
              Access is strictly controlled and logged. Papers are produced by an automated system, so no single person sees a complete
              paper in advance.
            </p>
          </div>
          <figure className="lg:col-span-8 min-w-0">
            <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-semibold">The twelve main subject banks</span>
              <span className="text-xs text-muted">188,310 items in the listed banks</span>
            </figcaption>
            <BankBars />
          </figure>
        </div>
      </section>
      {/* Psychometrics */}
      <section
        id="psychometrics"
        aria-labelledby="ps-title"
        className="scroll-mt-48 relative overflow-hidden bg-green-900 text-white on-dark"
      >
        <div className="absolute inset-0 pattern-dots" aria-hidden="true"></div>
        <div className="relative max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <p className="eyebrow">Psychometric analysis</p>
          <h2 id="ps-title" className="mt-3 font-serif text-3xl sm:text-4xl font-semibold max-w-3xl">
            Every item is checked twice — before it counts, and after every test
          </h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-white/5 p-7 ring-1 ring-white/10">
              <p className="font-serif text-2xl text-gold-300">Pre-test (pilot)</p>
              <p className="mt-1 text-sm text-white/60">Before the item is used for real decisions · 802 test batteries piloted</p>
              <ol className="mt-5 space-y-2 text-sm text-white/85 list-decimal pl-5">
                <li>Assemble pilot forms covering the blueprint, with a few proven anchor items.</li>
                <li>Administer to a sample of similar students at partner institutions.</li>
                <li>Analyse difficulty, discrimination, distractors and fairness.</li>
                <li>Accept, revise or reject each item; re-pilot borderline items.</li>
                <li>Calibrate and store accepted items in the bank with their statistics.</li>
              </ol>
              <p className="mt-5 text-sm text-white/60">Effect on candidates: none — pilot scores do not count.</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-7 ring-1 ring-white/10">
              <p className="font-serif text-2xl text-gold-300">Post-hoc</p>
              <p className="mt-1 text-sm text-white/60">After the live test, before results are released · all candidates</p>
              <ul className="mt-5 space-y-2 text-sm text-white/85">
                <li>
                  <span className="font-semibold text-white">Key validation</span> — checks for a wrong key or two correct answers.
                </li>
                <li>
                  <span className="font-semibold text-white">Item re-analysis</span> — statistics recalculated on the full population.
                </li>
                <li>
                  <span className="font-semibold text-white">Fairness re-check</span> — DIF where group sizes allow.
                </li>
                <li>
                  <span className="font-semibold text-white">Test-level analysis</span> — reliability (KR-20 / alpha) and SEM.
                </li>
                <li>
                  <span className="font-semibold text-white">Form comparability</span> — scores equated where several versions are used.
                </li>
              </ul>
              <p className="mt-5 text-sm text-white/60">
                Any flawed item is removed from scoring or credited to all candidates, so that no candidate is harmed.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl bg-gold-500 p-6 text-green-950">
              <p className="font-serif text-xl font-semibold">Reliability</p>
              <p className="mt-2 text-sm">Consistency: similar results if the same candidate took an equivalent version again.</p>
            </div>
            <div className="rounded-2xl bg-white p-6 text-ink">
              <p className="font-serif text-xl font-semibold text-green-700">Validity</p>
              <p className="mt-2 text-sm text-muted">Accuracy of meaning: the score tells us what we need to know for this decision.</p>
            </div>
            <div className="rounded-2xl bg-white p-6 text-ink">
              <p className="font-serif text-xl font-semibold text-green-700">Interpreting scores</p>
              <p className="mt-2 text-sm text-muted">
                With reliability 0.90 and a spread of 10 marks, a score of 62 likely lies between about 59 and 65 — so very small
                differences should not be over-read.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* QA */}
      <section id="qa" aria-labelledby="qa-title" className="scroll-mt-48 max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <p className="eyebrow">Quality assurance</p>
        <h2 id="qa-title" className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-green-700">
          Multi-layer review of every question
        </h2>
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="font-serif text-xl font-semibold">Five quality-control committees</h3>
            <dl className="mt-5 divide-y divide-line rounded-2xl border border-line">
              <div className="p-5">
                <dt className="font-semibold text-green-700">Academic Committee</dt>
                <dd className="mt-1 text-sm text-muted">Sets academic policy and oversees the content and standards of assessments.</dd>
              </div>
              <div className="p-5">
                <dt className="font-semibold text-green-700">Subject Committee</dt>
                <dd className="mt-1 text-sm text-muted">
                  Reviews content within each subject for correctness, relevance and full blueprint coverage.
                </dd>
              </div>
              <div className="p-5">
                <dt className="font-semibold text-green-700">Paper Review Committee</dt>
                <dd className="mt-1 text-sm text-muted">Reviews assembled papers as a whole for balance, quality and suitability.</dd>
              </div>
              <div className="p-5">
                <dt className="font-semibold text-green-700">Peer Review Committee</dt>
                <dd className="mt-1 text-sm text-muted">Independent, blind review of individual questions by subject experts.</dd>
              </div>
              <div className="p-5">
                <dt className="font-semibold text-green-700">MCQ Contributors</dt>
                <dd className="mt-1 text-sm text-muted">Trained subject specialists who write new questions to ETC guidelines.</dd>
              </div>
            </dl>
          </div>
          <div>
            <h3 className="font-serif text-xl font-semibold">Four questions asked of every item</h3>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              <li className="rounded-2xl bg-mint-50 p-5">
                <p className="font-semibold text-green-700">Technical</p>
                <p className="mt-1 text-sm text-muted">
                  Is the content correct, with exactly one right answer, matching the blueprint and Bloom’s level?
                </p>
              </li>
              <li className="rounded-2xl bg-cream-50 p-5">
                <p className="font-semibold text-green-700">Grammatical</p>
                <p className="mt-1 text-sm text-muted">Is the language correct, consistent and free of errors?</p>
              </li>
              <li className="rounded-2xl bg-cream-50 p-5">
                <p className="font-semibold text-green-700">Linguistic</p>
                <p className="mt-1 text-sm text-muted">
                  Is the wording clear and simple, so it tests the skill and not reading difficulty?
                </p>
              </li>
              <li className="rounded-2xl bg-mint-50 p-5">
                <p className="font-semibold text-green-700">Fairness</p>
                <p className="mt-1 text-sm text-muted">
                  Is it free of bias, stereotypes and material unfamiliar or offensive to any group?
                </p>
              </li>
            </ul>
            <div className="mt-6 rounded-2xl border-l-4 border-gold-500 bg-white p-5 ring-1 ring-line">
              <p className="font-semibold">An independent Quality Assurance Department</p>
              <p className="mt-1 text-sm text-muted">
                Works independently of the teams it checks, monitoring test operations, paper development, result generation and printing,
                and conducting unfair-means hearings.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Security */}
      <section id="security" aria-labelledby="sec-title" className="scroll-mt-48 bg-cream-50 border-y border-gold-300/50">
        <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <p className="eyebrow">Fairness & security</p>
          <h2 id="sec-title" className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-green-700">
            Three-tier monitoring and secure handling
          </h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            <li className="rounded-2xl bg-white p-6 ring-1 ring-line">
              <p className="text-xs font-semibold uppercase tracking-eyebrow text-gold-600">Tier 1</p>
              <p className="mt-2 font-serif text-xl font-semibold">Centre supervisors & invigilators</p>
              <p className="mt-2 text-sm text-muted">Running the test correctly inside each hall.</p>
            </li>
            <li className="rounded-2xl bg-white p-6 ring-1 ring-line">
              <p className="text-xs font-semibold uppercase tracking-eyebrow text-gold-600">Tier 2</p>
              <p className="mt-2 font-serif text-xl font-semibold">ETC monitoring teams</p>
              <p className="mt-2 text-sm text-muted">Visiting centres, checking compliance and reporting problems in real time.</p>
            </li>
            <li className="rounded-2xl bg-green-900 p-6 text-white on-dark">
              <p className="text-xs font-semibold uppercase tracking-eyebrow text-gold-300">Tier 3</p>
              <p className="mt-2 font-serif text-xl font-semibold">Senior HEC officials</p>
              <p className="mt-2 text-sm text-white/75">Independent oversight of the whole process and protocol compliance.</p>
            </li>
          </ol>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
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
              Papers generated automatically in a secure environment.
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
              Secure printing at ETC’s own press, with controlled access.
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
              Sealed, tracked transport and storage of materials.
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
              Identity checks at entry to prevent impersonation.
            </li>
          </ul>
          <p className="mt-10 max-w-3xl text-sm text-muted">
            Looking ahead, ETC plans to seek ISO certification for its testing operations and to introduce certification programmes for item
            writers and reviewers.
          </p>
        </div>
      </section>
    </>
  );
}

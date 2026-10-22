import type { TestCategory } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";
import { TestCard } from "@/components/site/TestCard";
import { first, type SP } from "@/lib/filters";
import { formatFee } from "@/lib/format";
import { fromParam, TEST_CATEGORY } from "@/lib/labels";
import { getPublishedTests } from "@/lib/content/tests";

export const metadata: Metadata = {
  title: "Tests & Assessments",
  description: "LAT, LAW-GAT, HAT-General, HAAT-Subject, USAT and customized tests from the Education Testing Council.",
};

const PURPOSES: [TestCategory | "", string][] = [
  ["", "All tests"],
  ["ADMISSIONS", "Admissions"],
  ["POSTGRADUATE", "Postgraduate & scholarships"],
  ["LICENSING", "Licensing"],
  ["RECRUITMENT", "Recruitment & customized"],
];
const LEVELS = ["Undergraduate", "MS / MPhil", "PhD", "Professional"];

const CHIP =
  "rounded-full px-4 py-2 text-sm font-semibold text-muted ring-1 ring-line hover:text-green-700 aria-[current=true]:bg-green-700 aria-[current=true]:text-white aria-[current=true]:ring-green-700";

export default async function TestsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const tests = await getPublishedTests();
  const category = fromParam(TEST_CATEGORY, first(sp.category));
  const levelParam = first(sp.level);
  const level = LEVELS.includes(levelParam ?? "") ? levelParam : undefined;
  const shown = tests.filter((t) => (!category || t.category === category) && (!level || t.level === level));

  const href = (c: TestCategory | "" | undefined, l: string | undefined) => {
    const p = new URLSearchParams();
    if (c) p.set("category", TEST_CATEGORY[c].param);
    if (l) p.set("level", l);
    const q = p.toString();
    return q ? `/tests?${q}` : "/tests";
  };

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
                Tests &amp; Assessments
              </li>
            </ol>
          </nav>
          <p className="eyebrow mt-8">Tests &amp; Assessments</p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl font-semibold leading-tight sm:text-5xl">A standardized national assessment portfolio</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            Five national tests and customized assessments. Every test follows the same quality process — blueprint, review, piloting
            and analysis — with content, format and scoring tailored to the decision it supports.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-site px-4 py-14 sm:px-6 lg:px-8" aria-labelledby="dir-title">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="dir-title" className="font-serif text-3xl font-semibold text-green-700">
            Test directory
          </h2>
          <ul aria-label="Filter tests by purpose" className="flex flex-wrap gap-2">
            {PURPOSES.map(([c, label]) => (
              <li key={label}>
                <Link href={href(c, level)} scroll={false} aria-current={(category ?? "") === c} className={CHIP}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-semibold text-muted">Level:</span>
          <ul aria-label="Filter tests by level" className="flex flex-wrap gap-2">
            {[undefined, ...LEVELS].map((l) => (
              <li key={l ?? "any"}>
                <Link href={href(category, l)} scroll={false} aria-current={level === l} className={CHIP}>
                  {l ?? "Any level"}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-4 text-sm text-muted" role="status">
          {shown.length ? `Showing ${shown.length} of ${tests.length} tests` : "No tests match these filters."}
        </p>
        <div id="test-grid" className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.length ? (
            shown.map((t) => <TestCard key={t.slug} test={t} />)
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-line p-10 text-center">
              <p className="font-serif text-xl text-green-700">No tests match these filters.</p>
              <p className="mt-1 text-sm text-muted">Try another purpose or level.</p>
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-line bg-mint-50" aria-labelledby="compare-title">
        <div className="mx-auto max-w-site px-4 py-16 sm:px-6 lg:px-8">
          <p className="eyebrow">Portfolio overview</p>
          <h2 id="compare-title" className="mt-3 font-serif text-3xl font-semibold text-green-700">
            Compare tests at a glance
          </h2>
          <div className="table-wrap mt-8" tabIndex={0} role="region" aria-label="Comparison of ETC tests">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Test</th>
                  <th scope="col">Who takes it</th>
                  <th scope="col">Purpose</th>
                  <th scope="col">Frequency</th>
                  <th scope="col">Fee*</th>
                </tr>
              </thead>
              <tbody id="compare-body">
                {tests.map((t) => (
                  <tr key={t.slug}>
                    <td>
                      <Link className="font-semibold text-green-700 hover:underline" href={`/tests/${t.slug}`}>
                        {t.code}
                      </Link>
                      <span className="block text-xs text-muted">{t.name}</span>
                    </td>
                    <td>{t.audience}</td>
                    <td>{t.short}</td>
                    <td>{t.frequency}</td>
                    <td className="whitespace-nowrap">{formatFee(t.fee)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted">*Fee per candidate. As per ETC Institutional Profile 2026; always confirm in the official announcement.</p>
        </div>
      </section>

      <section className="mx-auto max-w-site px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="types-title">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">Formats</p>
            <h2 id="types-title" className="mt-3 font-serif text-3xl font-semibold text-green-700">
              Types of tests we deliver
            </h2>
            <p className="mt-4 text-muted">From machine-scored MCQs to rubric-marked essays, skill tasks and psychological assessment.</p>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
            {[
              ["MCQ-based tests", "Objective questions with one correct answer, scored by machine quickly and without bias."],
              ["Descriptive tests", "Written answers or essays scored against a fixed rubric by trained examiners."],
              ["Skill tests", "Practical tasks that check whether a candidate can actually perform defined skills."],
              ["Physical tests", "Measured physical tasks against defined standards, for example police recruitment."],
              ["Psychological assessment", "Standardized tools that measure personality, aptitude or behavioural traits for selection and placement."],
            ].map(([t, d], k) => (
              <div key={t} className={`rounded-xl border border-line p-5 ${k === 4 ? "sm:col-span-2" : ""}`}>
                <dt className="font-semibold text-green-700">{t}</dt>
                <dd className="mt-1 text-sm text-muted">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}

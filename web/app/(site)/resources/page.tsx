import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/site/EmptyState";
import { FilterForm } from "@/components/site/FilterForm";
import { Pagination } from "@/components/site/Pagination";
import { ResourceCard } from "@/components/site/ResourceCard";
import { ResultCount } from "@/components/site/ResultCount";
import { parseResourceFilters, RESOURCES_PER_PAGE, type SP } from "@/lib/filters";
import { RESOURCE_TYPE } from "@/lib/labels";
import { searchResources } from "@/lib/content/resources";
import { getTestOptions } from "@/lib/content/tests";

export const metadata: Metadata = {
  title: "Resources",
  description: "Syllabi, sample papers, candidate guides and policies for ETC tests, in one searchable library.",
};

const FIELD = "mt-1.5 w-full rounded-md border border-line bg-white px-4 py-2.5 focus:border-green-700 focus:outline-none";

export default async function ResourcesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const tests = await getTestOptions();
  const f = parseResourceFilters(sp, tests.map((t) => t.slug));
  const result = await searchResources(f);

  const href = (page: number) => {
    const p = new URLSearchParams();
    if (f.q) p.set("q", f.q);
    if (f.type) p.set("type", RESOURCE_TYPE[f.type].param);
    if (f.test) p.set("test", f.test);
    if (page > 1) p.set("page", String(page));
    const q = p.toString();
    return q ? `/resources?${q}` : "/resources";
  };
  const from = (result.page - 1) * RESOURCES_PER_PAGE + 1;
  const count = result.total ? `Showing ${from}–${from + result.items.length - 1} of ${result.total} resources` : "";

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
                Resources
              </li>
            </ol>
          </nav>
          <p className="eyebrow mt-8">Resources</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight sm:text-5xl">Syllabi, sample papers and guides</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            Everything you need to prepare, in one searchable library. Test formats, syllabi and rules are published in advance.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-site scroll-mt-40 px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="lib-title">
        <h2 id="lib-title" className="sr-only">
          Resource library
        </h2>
        <FilterForm label="Filter resources" className="grid gap-4 rounded-2xl bg-mint-50 p-5 ring-1 ring-line sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-5">
            <label htmlFor="rq" className="block text-sm font-semibold">
              Search resources
            </label>
            <input id="rq" name="q" type="search" defaultValue={f.q ?? ""} placeholder="e.g. USAT syllabus" className={FIELD} />
          </div>
          <div className="lg:col-span-3">
            <label htmlFor="rtype" className="block text-sm font-semibold">
              Resource type
            </label>
            <select id="rtype" name="type" defaultValue={f.type ? RESOURCE_TYPE[f.type].param : ""} className={FIELD}>
              <option value="">All types</option>
              {Object.values(RESOURCE_TYPE).map((t) => (
                <option key={t.param} value={t.param}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-3">
            <label htmlFor="rtest" className="block text-sm font-semibold">
              Related test
            </label>
            <select id="rtest" name="test" defaultValue={f.test ?? ""} className={FIELD}>
              <option value="">All tests</option>
              {tests.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.slug === "customized" ? "Institutions" : t.code}
                </option>
              ))}
              <option value="general">General / policies</option>
            </select>
          </div>
          <div className="flex gap-2 lg:col-span-1 lg:flex-col">
            <button type="submit" className="w-full rounded-md bg-green-700 px-3 py-2.5 text-sm font-semibold text-white hover:bg-green-800">
              Filter
            </button>
            <Link href="/resources" className="w-full rounded-md px-3 py-2.5 text-center text-sm font-semibold text-green-700 ring-1 ring-green-700/30 hover:bg-white">
              Clear
            </Link>
          </div>
        </FilterForm>
        <div className="mt-6">
          <ResultCount text={count} />
        </div>
        {result.items.length ? (
          <ul id="resource-list" className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </ul>
        ) : (
          <div id="resource-list" className="mt-3">
            <EmptyState noun="resources" resetHref="/resources" />
          </div>
        )}
        <Pagination page={result.page} hrefs={Array.from({ length: result.pages }, (_, k) => href(k + 1))} />
      </section>
    </>
  );
}

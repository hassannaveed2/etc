import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import { EmptyState } from "@/components/site/EmptyState";
import { FilterForm } from "@/components/site/FilterForm";
import { NoticeRow } from "@/components/site/NoticeRow";
import { Pagination } from "@/components/site/Pagination";
import { ResultCount } from "@/components/site/ResultCount";
import { NEWS_PER_PAGE, parseNoticeFilters, type SP } from "@/lib/filters";
import { todayInKarachi } from "@/lib/format";
import { NOTICE_TYPE } from "@/lib/labels";
import { getMediaByKeys, SECTION_IMAGES } from "@/lib/content/media";
import { searchNotices } from "@/lib/content/notices";
import { getTestOptions } from "@/lib/content/tests";

export const metadata: Metadata = pageMetadata({
  title: "News & Notices",
  description: "Registration, schedules, results and recruitment notices from the Education Testing Council.",
  path: "/news",
});

const FIELD = "mt-1.5 w-full rounded-md border border-line bg-white px-4 py-2.5 focus:border-green-700 focus:outline-none";

export default async function NewsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const tests = await getTestOptions();
  const f = parseNoticeFilters(sp, tests.map((t) => t.slug));
  const [result, media] = await Promise.all([searchNotices(f, todayInKarachi()), getMediaByKeys([SECTION_IMAGES.noticeDefault])]);
  const hero = media[SECTION_IMAGES.noticeDefault];

  const href = (page: number) => {
    const p = new URLSearchParams();
    if (f.q) p.set("q", f.q);
    if (f.type) p.set("type", NOTICE_TYPE[f.type].param);
    if (f.test) p.set("test", f.test);
    if (f.period) p.set("period", f.period);
    if (page > 1) p.set("page", String(page));
    const q = p.toString();
    return q ? `/news?${q}` : "/news";
  };
  const from = (result.page - 1) * NEWS_PER_PAGE + 1;
  const count = result.total ? `Showing ${from}–${from + result.items.length - 1} of ${result.total} notices` : "";

  return (
    <>
      <section className="on-dark relative isolate overflow-hidden bg-green-900 text-white">
        {hero && <Image src={hero.url} alt="" fill priority sizes="100vw" className="object-cover opacity-30" />}
        <div className="absolute inset-0 bg-gradient-to-r from-green-950/95 to-green-900/70" aria-hidden="true" />
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
                News &amp; Notices
              </li>
            </ol>
          </nav>
          <p className="eyebrow mt-8">News &amp; Notices</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight sm:text-5xl">Official announcements</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            Registration, schedules, results and recruitment notices from the Education Testing Council.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-site scroll-mt-40 px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="list-title">
        <h2 id="list-title" className="sr-only">
          Notices
        </h2>
        <FilterForm label="Filter notices" className="grid gap-4 rounded-2xl bg-mint-50 p-5 ring-1 ring-line sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-4">
            <label htmlFor="nq" className="block text-sm font-semibold">
              Search notices
            </label>
            <input id="nq" name="q" type="search" defaultValue={f.q ?? ""} placeholder="e.g. USAT registration" className={FIELD} />
          </div>
          <div className="lg:col-span-2">
            <label htmlFor="ntype" className="block text-sm font-semibold">
              Notice type
            </label>
            <select id="ntype" name="type" defaultValue={f.type ? NOTICE_TYPE[f.type].param : ""} className={FIELD}>
              <option value="">All types</option>
              {Object.values(NOTICE_TYPE).map((t) => (
                <option key={t.param} value={t.param}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-3">
            <label htmlFor="ntest" className="block text-sm font-semibold">
              Related test
            </label>
            <select id="ntest" name="test" defaultValue={f.test ?? ""} className={FIELD}>
              <option value="">All tests</option>
              {tests.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.code}
                </option>
              ))}
              <option value="general">General</option>
            </select>
          </div>
          <div className="lg:col-span-2">
            <label htmlFor="nperiod" className="block text-sm font-semibold">
              Published
            </label>
            <select id="nperiod" name="period" defaultValue={f.period ?? ""} className={FIELD}>
              <option value="">Any time</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="year">This year</option>
            </select>
          </div>
          <div className="flex gap-2 lg:col-span-1 lg:flex-col">
            <button type="submit" className="w-full rounded-md bg-green-700 px-3 py-2.5 text-sm font-semibold text-white hover:bg-green-800">
              Filter
            </button>
            <Link href="/news" className="w-full rounded-md px-3 py-2.5 text-center text-sm font-semibold text-green-700 ring-1 ring-green-700/30 hover:bg-white">
              Clear
            </Link>
          </div>
        </FilterForm>
        <div className="mt-6">
          <ResultCount text={count} />
        </div>
        {result.items.length ? (
          <ul id="notice-list" className="mt-2 border-t border-line">
            {result.items.map((n) => (
              <NoticeRow key={n.slug} notice={n} />
            ))}
          </ul>
        ) : (
          <div id="notice-list" className="mt-2">
            <EmptyState noun="notices" resetHref="/news" />
          </div>
        )}
        <Pagination page={result.page} hrefs={Array.from({ length: result.pages }, (_, k) => href(k + 1))} />
      </section>
    </>
  );
}

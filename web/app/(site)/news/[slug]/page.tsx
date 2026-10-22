import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { PortalLink } from "@/components/site/PortalLink";
import { ShareButtons } from "@/components/site/ShareButtons";
import { SampleChip, StatusChip } from "@/components/site/StatusChip";
import { formatDate } from "@/lib/format";
import { NOTICE_TYPE } from "@/lib/labels";
import { getNoticeBySlug } from "@/lib/content/notices";
import { getSettings } from "@/lib/content/settings";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const n = await getNoticeBySlug((await params).slug);
  if (!n) return { title: "Notice not found" };
  return { title: n.seoTitle ?? n.title, description: n.seoDescription ?? n.summary };
}

export default async function NoticePage({ params }: Props) {
  const [n, settings] = await Promise.all([getNoticeBySlug((await params).slug), getSettings()]);
  if (!n) notFound();
  const type = NOTICE_TYPE[n.type].label;

  return (
    <>
      <section className="on-dark relative overflow-hidden bg-green-900 text-white">
        <div className="pattern-dots absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-site px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-sm text-white/70">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link className="hover:text-white" href="/">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link className="hover:text-white" href="/news">
                  News &amp; Notices
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-white">
                {type} notice
              </li>
            </ol>
          </nav>
          <div className="mt-8 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold uppercase tracking-wider text-gold-300">{type}</span>
            <span className="text-white/40">•</span>
            <span>{n.testCode}</span>
            <span className="rounded-full bg-white px-0.5">
              <StatusChip status={n.status} />
            </span>
            {n.isSample && <SampleChip />}
          </div>
          <h1 className="mt-4 max-w-4xl font-serif text-3xl font-semibold leading-tight sm:text-5xl">{n.title}</h1>
          <p className="mt-4 max-w-3xl text-lg text-white/80">{n.summary}</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-site gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:px-8">
        <article className="min-w-0 lg:col-span-8">
          <dl className="grid grid-cols-2 gap-4 rounded-2xl bg-mint-50 p-5 ring-1 ring-line sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted">Published</dt>
              <dd className="mt-1 font-semibold">
                <time dateTime={n.publishedAt}>{formatDate(n.publishedAt)}</time>
              </dd>
            </div>
            {n.deadline && (
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted">Deadline</dt>
                <dd className="mt-1 font-semibold text-status-closing">
                  <time dateTime={n.deadline}>{formatDate(n.deadline)}</time>
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted">Related test</dt>
              <dd className="mt-1 font-semibold">
                {n.testSlug ? (
                  <Link className="text-green-700 hover:underline" href={`/tests/${n.testSlug}`}>
                    {n.testCode}
                  </Link>
                ) : (
                  "General"
                )}
              </dd>
            </div>
          </dl>
          {/* bodyHtml is sanitised on save (lib/sanitize.ts allow-list) */}
          <div className="rich mt-8 text-lg leading-relaxed text-ink/90" dangerouslySetInnerHTML={{ __html: n.bodyHtml }} />
          {n.attachments.length > 0 && (
            <>
              <h2 className="mt-10 font-serif text-2xl font-semibold text-green-700">Attachments</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {n.attachments.map((a) => (
                  <li key={a.url + a.label} className="group relative flex items-center gap-4 rounded-xl border border-line p-4 hover:border-green-700">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-mint-50 text-green-700">
                      <Icon name="file" className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <a href={a.url} download className="font-semibold leading-snug after:absolute after:inset-0 group-hover:text-green-700">
                        {a.label}
                      </a>
                      <span className="block text-xs text-muted">PDF · {a.sizeLabel}</span>
                    </span>
                    <Icon name="download" className="h-5 w-5 text-gold-500" />
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="mt-10 flex flex-wrap gap-3" data-noprint>
            <ShareButtons title={n.title} noun="notice" />
            <Link
              href="/news"
              className="inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-green-700 ring-1 ring-green-700/30 hover:bg-mint-50"
            >
              All notices
            </Link>
          </div>
        </article>

        <aside className="min-w-0 lg:col-span-4" aria-labelledby="related-h">
          {n.testSlug && n.testSlug !== "customized" && (
            <div className="on-dark mb-8 rounded-2xl bg-green-900 p-6 text-white">
              <p className="text-sm font-semibold text-gold-300">Ready to apply?</p>
              <p className="mt-2 text-sm text-white/80">Registration and payment are handled only on the official ETC portal.</p>
              <PortalLink
                which="registration"
                settings={settings}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-gold-500 px-4 py-2.5 text-sm font-semibold text-green-950 hover:bg-gold-300"
              >
                Register for {n.testCode}{" "}
              </PortalLink>
            </div>
          )}
          <h2 id="related-h" className="font-serif text-xl font-semibold text-green-700">
            Related notices
          </h2>
          {n.related.length ? (
            <ul className="mt-3 divide-y divide-line">
              {n.related.map((r) => (
                <li key={r.slug} className="py-3">
                  <Link className="font-semibold leading-snug hover:text-green-700" href={`/news/${r.slug}`}>
                    {r.title}
                  </Link>
                  <span className="block text-xs text-muted">{formatDate(r.publishedAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">No related notices.</p>
          )}
        </aside>
      </div>
    </>
  );
}

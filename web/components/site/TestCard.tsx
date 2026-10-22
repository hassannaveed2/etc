import Image from "next/image";
import Link from "next/link";
import { formatFee } from "@/lib/format";
import { TEST_CATEGORY } from "@/lib/labels";
import type { TestCard as TestCardData } from "@/lib/content/types";

/** Card in the tests directory and on the homepage (mockup R.testCard). */
export function TestCard({ test: t }: { test: TestCardData }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative aspect-[16/10] overflow-hidden bg-mint-50">
        {t.image && (
          <Image
            src={t.image.url}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        )}
        <span className="absolute left-4 top-4 rounded-md bg-white/95 px-2.5 py-1 font-serif text-sm font-semibold text-green-700 shadow">
          {t.code}
        </span>
        <span className="absolute right-4 top-4 rounded-full bg-green-900/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
          {TEST_CATEGORY[t.category].label}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-serif text-xl font-semibold leading-snug text-ink">
          <Link href={`/tests/${t.slug}`} className="after:absolute after:inset-0 group-hover:text-green-700">
            {t.name}
          </Link>
        </h3>
        <p className="mb-5 mt-2 text-sm text-muted">{t.short}</p>
        <dl className="mt-auto grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
          <div>
            <dt className="text-xs text-muted">For</dt>
            <dd className="font-medium text-ink">{t.level}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Fee*</dt>
            <dd className="font-medium text-ink">{formatFee(t.fee)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs text-muted">Frequency</dt>
            <dd className="font-medium text-ink">{t.frequency}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

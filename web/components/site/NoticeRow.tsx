import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { formatDate } from "@/lib/format";
import { NOTICE_TYPE } from "@/lib/labels";
import type { NoticeRow as NoticeRowData } from "@/lib/content/types";
import { SampleChip, StatusChip } from "./StatusChip";

/** One row in a notices list (mockup render.js R.noticeRow). */
export function NoticeRow({ notice: n }: { notice: NoticeRowData }) {
  const [, , day] = n.publishedAt.split("-");
  const month = formatDate(n.publishedAt).split(" ")[1];
  return (
    <li className="group relative flex gap-4 border-b border-line py-5 last:border-b-0 sm:gap-5">
      <div className="w-14 shrink-0 rounded-lg bg-mint-50 py-2 text-center" aria-hidden="true">
        <span className="block font-serif text-2xl leading-none text-green-700">{Number(day)}</span>
        <span className="mt-1 block text-[11px] font-semibold uppercase tracking-wider text-muted">{month}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold uppercase tracking-wider text-gold-600">{NOTICE_TYPE[n.type].label}</span>
          <span className="text-line">•</span>
          <span className="font-medium text-muted">{n.testCode}</span>
          <StatusChip status={n.status} />
          {n.isSample && <SampleChip />}
        </div>
        <h3 className="mt-1.5 font-semibold leading-snug text-ink group-hover:text-green-700">
          <Link href={`/news/${n.slug}`} className="after:absolute after:inset-0">
            {n.title}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{n.summary}</p>
        <p className="mt-2 text-xs text-muted">
          <span className="sr-only">Published </span>
          <time dateTime={n.publishedAt}>{formatDate(n.publishedAt)}</time>
          {n.deadline && (
            <>
              {" · "}
              <span className="font-medium text-ink">Deadline {formatDate(n.deadline)}</span>
            </>
          )}
        </p>
      </div>
      <Icon name="arrow" className="hidden h-5 w-5 self-center text-gold-500 transition group-hover:translate-x-1 sm:block" />
    </li>
  );
}

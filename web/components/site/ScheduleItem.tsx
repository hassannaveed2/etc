import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { formatDate } from "@/lib/format";
import type { ScheduleItem as ScheduleItemData } from "@/lib/content/types";

/** Compact upcoming-date row on a dark band (mockup R.scheduleItem). */
export function ScheduleItem({ item: s }: { item: ScheduleItemData }) {
  return (
    <li className="flex items-start gap-3 border-b border-white/10 py-3 last:border-0">
      <Icon name="calendar" className="mt-0.5 h-5 w-5 shrink-0 text-gold-300" />
      <div className="min-w-0">
        <p className="font-semibold text-white">
          <Link className="hover:underline" href={`/tests/${s.testSlug}`}>
            {s.session}
          </Link>
        </p>
        <p className="text-sm text-white/70">
          Test {formatDate(s.testDate)} · Registration closes {formatDate(s.regCloses)}
        </p>
      </div>
    </li>
  );
}

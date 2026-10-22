import type { ResourceType } from "@prisma/client";
import { Icon, type IconName } from "@/components/ui/icon";
import { formatDate } from "@/lib/format";
import { RESOURCE_TYPE } from "@/lib/labels";
import type { ResourceCard as ResourceCardData } from "@/lib/content/types";
import { SampleChip } from "./StatusChip";

const TYPE_ICON: Record<ResourceType, IconName> = { SYLLABUS: "file", SAMPLE_PAPER: "register", GUIDE: "help", POLICY: "shield" };

/** Downloadable PDF card (mockup R.resourceCard). */
export function ResourceCard({ resource: r }: { resource: ResourceCardData }) {
  return (
    <li className="group relative flex gap-4 rounded-xl border border-line bg-white p-5 hover:border-green-700 hover:shadow-card">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-mint-50 text-green-700">
        <Icon name={TYPE_ICON[r.type]} className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-600">
          <span>
            {RESOURCE_TYPE[r.type].label} · {r.testCode}
          </span>
          {r.isSample && <SampleChip />}
        </p>
        <h3 className="mt-1 font-semibold leading-snug text-ink">
          <a href={r.fileUrl} download className="after:absolute after:inset-0 group-hover:text-green-700">
            {r.title}
          </a>
        </h3>
        <p className="mt-1 text-xs text-muted">
          PDF · {r.sizeLabel} · Updated {formatDate(r.date)}
        </p>
      </div>
      <Icon name="download" className="h-5 w-5 shrink-0 self-center text-gold-500" />
    </li>
  );
}

import type { Status } from "@prisma/client";
import { STATUS } from "@/lib/labels";

const CLS: Record<Status, string> = {
  OPEN: "bg-status-open/10 text-status-open ring-status-open/30",
  CLOSING: "bg-status-closing/10 text-status-closing ring-status-closing/30",
  RESULT: "bg-status-result/10 text-status-result ring-status-result/30",
  CLOSED: "bg-status-closed/10 text-status-closed ring-status-closed/30",
};

export function StatusChip({ status }: { status: Status }) {
  return (
    <span
      data-testid="status-chip"
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${CLS[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {STATUS[status].label}
    </span>
  );
}

export function SampleChip() {
  return (
    <span
      className="inline-flex items-center rounded bg-gold-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-600"
      title="Sample content — to be replaced with ETC-approved content"
    >
      Sample
    </span>
  );
}

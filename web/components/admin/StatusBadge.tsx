const STYLE = {
  published: "bg-status-open/10 text-status-open ring-status-open/30",
  draft: "bg-status-closed/10 text-status-closed ring-status-closed/30",
  new: "bg-gold-100 text-gold-600 ring-gold-500/40",
  progress: "bg-status-result/10 text-status-result ring-status-result/30",
  closed: "bg-status-closed/10 text-status-closed ring-status-closed/30",
} as const;

export type BadgeTone = keyof typeof STYLE;

export function StatusBadge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STYLE[tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}

export function PublishedBadge({ published }: { published: boolean }) {
  return <StatusBadge tone={published ? "published" : "draft"}>{published ? "Published" : "Draft"}</StatusBadge>;
}

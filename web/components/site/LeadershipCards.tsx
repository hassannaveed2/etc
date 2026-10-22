import Image from "next/image";
import type { LeaderItem } from "@/lib/content/types";

/** About › Messages from our leadership (mockup about.html#leadership), fed by Leader rows. */
export function LeadershipCards({ leaders }: { leaders: LeaderItem[] }) {
  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-3">
      {leaders.map((l) => (
        <article key={l.role} className="flex flex-col rounded-2xl bg-white p-7 ring-1 ring-line" data-reveal>
          <div className="flex items-center gap-4">
            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-mint-50 ring-1 ring-line">
              {l.photo && <Image src={l.photo.url} alt="" fill sizes="64px" className="object-cover" />}
            </span>
            <div>
              <h3 className="font-semibold">{l.name}</h3>
              <p className="text-sm text-muted">{l.title}</p>
            </div>
          </div>
          <blockquote className="mt-6 font-serif text-xl leading-snug text-green-800">“{l.quote}”</blockquote>
          <div
            className="mt-4 space-y-3 text-sm leading-relaxed text-muted [&_a]:font-semibold [&_a]:text-green-700"
            dangerouslySetInnerHTML={{ __html: l.messageHtml }}
          />
        </article>
      ))}
    </div>
  );
}

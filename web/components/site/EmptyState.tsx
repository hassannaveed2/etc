import Link from "next/link";

/** Shown when a filtered list has no matches (mockup filterList empty state). */
export function EmptyState({ noun, resetHref }: { noun: string; resetHref: string }) {
  return (
    <div className="col-span-full rounded-2xl border border-dashed border-line p-10 text-center">
      <p className="font-serif text-xl text-green-700">No {noun} match your filters.</p>
      <p className="mt-1 text-sm text-muted">Try a different search term, or clear the filters.</p>
      <Link href={resetHref} className="mt-5 inline-flex rounded-md bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800">
        Reset filters
      </Link>
    </div>
  );
}

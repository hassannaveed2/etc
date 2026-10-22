import Image from "next/image";
import Link from "next/link";

export function Brand({ onDark = false }: { onDark?: boolean }) {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
      <Image
        src="/brand/etc-crest.png"
        alt=""
        width={428}
        height={480}
        priority={!onDark}
        className={onDark ? "crest-roundel h-16 w-16 object-contain" : "h-11 w-auto shrink-0 sm:h-14"}
      />
      <span className="min-w-0 leading-tight">
        <span
          className={`block font-serif text-[17px] font-semibold sm:text-xl ${onDark ? "text-white" : "truncate text-green-700"}`}
        >
          Education Testing Council
        </span>
        {onDark ? (
          <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-300">
            Higher Education Commission · Pakistan
          </span>
        ) : (
          <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-600 sm:text-[11px]">
            <span className="sm:hidden">HEC · Pakistan</span>
            <span className="hidden sm:inline">Higher Education Commission · Pakistan</span>
          </span>
        )}
        <span className="sr-only"> — home</span>
      </span>
    </Link>
  );
}

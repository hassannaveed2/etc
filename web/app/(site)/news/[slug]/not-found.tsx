import Link from "next/link";

export default function NoticeNotFound() {
  return (
    <section className="on-dark relative overflow-hidden bg-green-900 text-white">
      <div className="pattern-dots absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-site px-4 py-20 sm:px-6 lg:px-8">
        <p className="eyebrow">News &amp; Notices</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">Notice not found</h1>
        <p className="mt-4 max-w-xl text-lg text-white/80">This notice may have been withdrawn or the link may be incomplete.</p>
        <Link href="/news" className="mt-8 inline-flex rounded-md bg-gold-500 px-5 py-3 font-semibold text-green-950 hover:bg-gold-300">
          Browse all notices
        </Link>
      </div>
    </section>
  );
}

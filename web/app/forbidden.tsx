import Link from "next/link";

export default function Forbidden() {
  return (
    <main id="main" className="grid min-h-[60vh] place-items-center px-4 py-16 text-center">
      <div>
        <p className="eyebrow">403</p>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-green-700">You don&rsquo;t have access to this page.</h1>
        <p className="mt-3 text-muted">Ask an administrator if you need this permission.</p>
        <Link href="/admin" className="mt-6 inline-flex rounded-md bg-green-700 px-5 py-2.5 font-semibold text-white hover:bg-green-800">
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}

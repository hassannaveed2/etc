import Link from "next/link";

const DESTINATIONS = [
  ["/tests", "Find a test", "LAT, LAW-GAT, HAT, HAAT, USAT and customized tests."],
  ["/candidate-services", "Candidate services", "Registration, admit cards, results and schedules."],
  ["/news", "News & notices", "The latest official announcements."],
  ["/", "Back to home", "Start again from the ETC homepage."],
] as const;

/** Body of the branded 404 (mockup/404.html). */
export function NotFoundBody() {
  return (
    <>
      <section className="on-dark relative overflow-hidden bg-green-900 text-white">
        <div className="pattern-dots absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-site px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-sm text-white/70">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link className="hover:text-white" href="/">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-white">
                Page not found
              </li>
            </ol>
          </nav>
          <p className="eyebrow mt-8">Error 404</p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl font-semibold leading-tight sm:text-5xl">We couldn’t find that page.</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            The link may be out of date, or the page may have moved. Try one of the routes below, or search our resources.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-site px-4 py-16 sm:px-6 lg:px-8">
        <form action="/resources" method="get" role="search" className="max-w-2xl">
          <label htmlFor="q404" className="block text-sm font-semibold text-ink">
            Search syllabi, guides and notices
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="q404"
              name="q"
              type="search"
              placeholder="e.g. USAT syllabus"
              className="w-full rounded-md border border-line px-4 py-3 text-base focus:border-green-700 focus:outline-none"
            />
            <button className="rounded-md bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800">Search</button>
          </div>
        </form>
        <h2 className="mt-14 font-serif text-2xl text-green-700">Popular destinations</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DESTINATIONS.map(([href, title, text]) => (
            <li key={href}>
              <Link href={href} className="block h-full rounded-xl border border-line p-6 hover:border-green-700 hover:shadow-card">
                <span className="font-semibold text-green-700">{title}</span>
                <span className="mt-1 block text-sm text-muted">{text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import { LeadershipCards } from "@/components/site/LeadershipCards";
import { getLeaders } from "@/lib/content/leaders";
import { getMediaByKeys, SECTION_IMAGES } from "@/lib/content/media";

export const metadata: Metadata = pageMetadata({
  title: "About ETC",
  description: "The Education Testing Council: HEC's own national testing arm — history, legal mandate, governance and leadership.",
  path: "/about",
});

export default async function Page() {
  const [leaders, media] = await Promise.all([getLeaders(), getMediaByKeys([SECTION_IMAGES.aboutBuilding])]);
  const img = (k: keyof typeof SECTION_IMAGES) => media[SECTION_IMAGES[k]] ?? { url: "/brand/etc-crest.png", alt: "" };
  return (
    <>
      <section className="relative isolate overflow-hidden bg-green-900 text-white on-dark">
        <Image src={img("aboutBuilding").url} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-green-950/95 via-green-950/80 to-green-950/30" aria-hidden="true"></div>
        <div className="relative max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <nav aria-label="Breadcrumb" className="text-sm text-white/70">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link className="hover:text-white" href="/">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-white">
                About ETC
              </li>
            </ol>
          </nav>
          <p className="eyebrow mt-8">About the Education Testing Council</p>
          <h1 className="mt-3 font-serif text-4xl sm:text-6xl font-semibold leading-[1.08] max-w-3xl">HEC’s own national testing arm</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/85">
            Publicly owned, run as an autonomous and self-financing body, and legally responsible for key national tests such as LAT and
            LAW-GAT.
          </p>
        </div>
      </section>
      <nav
        aria-label="On this page"
        className="sticky top-[72px] sm:top-20 lg:top-[130px] z-30 border-b border-line bg-white/95 backdrop-blur"
      >
        <ul className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 overflow-x-auto no-scrollbar text-sm">
          <li>
            <a className="block whitespace-nowrap px-3 py-3.5 text-muted hover:text-green-700" href="#overview">
              Overview
            </a>
          </li>
          <li>
            <a className="block whitespace-nowrap px-3 py-3.5 text-muted hover:text-green-700" href="#history">
              Our journey
            </a>
          </li>
          <li>
            <a className="block whitespace-nowrap px-3 py-3.5 text-muted hover:text-green-700" href="#mandate">
              Legal mandate
            </a>
          </li>
          <li>
            <a className="block whitespace-nowrap px-3 py-3.5 text-muted hover:text-green-700" href="#vision">
              Vision & values
            </a>
          </li>
          <li>
            <a className="block whitespace-nowrap px-3 py-3.5 text-muted hover:text-green-700" href="#governance">
              Governance
            </a>
          </li>
          <li>
            <a className="block whitespace-nowrap px-3 py-3.5 text-muted hover:text-green-700" href="#leadership">
              Leadership
            </a>
          </li>
          <li>
            <a className="block whitespace-nowrap px-3 py-3.5 text-muted hover:text-green-700" href="#roadmap">
              Roadmap
            </a>
          </li>
        </ul>
      </nav>
      {/* Overview */}
      <section id="overview" className="scroll-mt-48 max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7" data-reveal>
          <p className="eyebrow">Overview</p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-green-700">
            Standardized, centralized and secure assessment
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink/90">
            The Education Testing Council (ETC) is Pakistan’s public-sector national testing body, set up under the Higher Education
            Commission (HEC) Ordinance to provide standardized, centralized and secure assessment for education and professional
            opportunities.
          </p>
          <p className="mt-4 leading-relaxed text-ink/80">
            Tests are designed to a fixed plan, delivered under the same conditions everywhere, and scored in the same way for every
            candidate — so results from different cities, sessions and test forms can be compared fairly.
          </p>
        </div>
        <dl className="lg:col-span-5 grid grid-cols-2 gap-4 content-start" data-reveal>
          <div className="rounded-xl bg-mint-50 p-5">
            <dt className="text-sm text-muted">Standardized</dt>
            <dd className="mt-1 text-sm">Same rules, same conditions, same scoring for every candidate.</dd>
          </div>
          <div className="rounded-xl bg-cream-50 p-5">
            <dt className="text-sm text-muted">Centralized</dt>
            <dd className="mt-1 text-sm">One national system for design, printing, delivery and results.</dd>
          </div>
          <div className="rounded-xl bg-cream-50 p-5">
            <dt className="text-sm text-muted">Secure</dt>
            <dd className="mt-1 text-sm">Controlled handling of papers, data and materials at every step.</dd>
          </div>
          <div className="rounded-xl bg-mint-50 p-5">
            <dt className="text-sm text-muted">Quality-driven</dt>
            <dd className="mt-1 text-sm">Every question reviewed, piloted and analysed before and after use.</dd>
          </div>
        </dl>
      </section>
      {/* Journey */}
      <section id="history" className="scroll-mt-48 bg-cream-50 border-y border-gold-300/50">
        <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <p className="eyebrow">Our journey</p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-green-700">From conception to a national platform</h2>
          <ol className="mt-12 relative grid gap-8 lg:grid-cols-5 lg:gap-6">
            <li className="relative lg:pt-10" data-reveal>
              <span className="hidden lg:block absolute top-3 left-0 right-0 h-px bg-gold-300" aria-hidden="true"></span>
              <span
                className="hidden lg:block absolute top-1.5 left-0 h-3.5 w-3.5 rounded-full bg-gold-500 ring-4 ring-cream-50"
                aria-hidden="true"
              ></span>
              <p className="font-serif text-3xl text-green-700">2017</p>
              <p className="mt-1 font-semibold">Conceived</p>
              <p className="mt-2 text-sm text-muted">ETC conceived as a public-sector testing body under the HEC Ordinance.</p>
            </li>
            <li className="relative lg:pt-10" data-reveal>
              <span className="hidden lg:block absolute top-3 left-0 right-0 h-px bg-gold-300" aria-hidden="true"></span>
              <span
                className="hidden lg:block absolute top-1.5 left-0 h-3.5 w-3.5 rounded-full bg-gold-500 ring-4 ring-cream-50"
                aria-hidden="true"
              ></span>
              <p className="font-serif text-3xl text-green-700">Aug 2018</p>
              <p className="mt-1 font-semibold">Revamped</p>
              <p className="mt-2 text-sm text-muted">
                The Commission’s 34th meeting (30–31 Aug 2018) approved a revamped ETC as an autonomous, self-sustaining entity.
              </p>
            </li>
            <li className="relative lg:pt-10" data-reveal>
              <span className="hidden lg:block absolute top-3 left-0 right-0 h-px bg-gold-300" aria-hidden="true"></span>
              <span
                className="hidden lg:block absolute top-1.5 left-0 h-3.5 w-3.5 rounded-full bg-gold-500 ring-4 ring-cream-50"
                aria-hidden="true"
              ></span>
              <p className="font-serif text-3xl text-green-700">31 Aug 2018</p>
              <p className="mt-1 font-semibold">Legal mandate</p>
              <p className="mt-2 text-sm text-muted">
                The Supreme Court’s decision on legal education reforms assigned national law tests to HEC as the executing institution.
              </p>
            </li>
            <li className="relative lg:pt-10" data-reveal>
              <span className="hidden lg:block absolute top-3 left-0 right-0 h-px bg-gold-300" aria-hidden="true"></span>
              <span
                className="hidden lg:block absolute top-1.5 left-0 h-3.5 w-3.5 rounded-full bg-gold-500 ring-4 ring-cream-50"
                aria-hidden="true"
              ></span>
              <p className="font-serif text-3xl text-green-700">15 Jun 2022</p>
              <p className="mt-1 font-semibold">Gazette</p>
              <p className="mt-2 text-sm text-muted">ETC formally notified in The Gazette of Pakistan.</p>
            </li>
            <li className="relative lg:pt-10" data-reveal>
              <span className="hidden lg:block absolute top-3 left-0 right-0 h-px bg-gold-300" aria-hidden="true"></span>
              <span
                className="hidden lg:block absolute top-1.5 left-0 h-3.5 w-3.5 rounded-full bg-green-700 ring-4 ring-cream-50"
                aria-hidden="true"
              ></span>
              <p className="font-serif text-3xl text-green-700">Today</p>
              <p className="mt-1 font-semibold">National platform</p>
              <p className="mt-2 text-sm text-muted">
                103 test centres, a 230,000+ item bank and more than 1.85 million candidates tested since July 2021.
              </p>
            </li>
          </ol>
        </div>
      </section>
      {/* Mandate */}
      <section id="mandate" className="scroll-mt-48 max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5" data-reveal>
          <p className="eyebrow">Legal mandate</p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-green-700">Legal education reforms</h2>
          <p className="mt-5 text-ink/80 leading-relaxed">
            On 31 August 2018, while considering the reports of the Legal Education Reform Committees in Constitution Petition No. 134/2012
            and related applications, the Supreme Court of Pakistan decided that:
          </p>
          <div className="mt-8 rounded-xl border-l-4 border-gold-500 bg-mint-50 p-5">
            <p className="font-semibold text-green-700">In simple terms</p>
            <p className="mt-1 text-sm">
              ETC carries out these responsibilities on behalf of HEC. LAT and LAW-GAT are now national gateways to legal education and to
              the legal profession.
            </p>
          </div>
        </div>
        <ol className="lg:col-span-7 space-y-4" data-reveal>
          <li className="flex gap-5 rounded-xl border border-line p-6">
            <span className="font-serif text-xl text-gold-600 shrink-0">Para 8</span>
            <p>
              The Pakistan Bar Council (PBC) and the Higher Education Commission (HEC) are the key regulators responsible for supervising
              and enforcing professional standards in legal education.
            </p>
          </li>
          <li className="flex gap-5 rounded-xl border border-line p-6">
            <span className="font-serif text-xl text-gold-600 shrink-0">Para 15(1)</span>
            <p>
              A{" "}
              <Link className="font-semibold text-green-700 hover:underline" href="/tests/law-gat">
                Law Graduate Assessment Test (LAW-GAT)
              </Link>{" "}
              for law graduates seeking enrolment to the Bar shall be held quarterly by HEC throughout Pakistan, using a question bank
              prepared for the test.
            </p>
          </li>
          <li className="flex gap-5 rounded-xl border border-line p-6">
            <span className="font-serif text-xl text-gold-600 shrink-0">Para 15(2)</span>
            <p>
              A{" "}
              <Link className="font-semibold text-green-700 hover:underline" href="/tests/lat">
                Law Admission Test (LAT)
              </Link>{" "}
              for all law colleges in Pakistan shall be held twice a year by HEC.
            </p>
          </li>
        </ol>
      </section>
      {/* Vision, mission, values */}
      <section id="vision" className="scroll-mt-48 relative overflow-hidden bg-green-900 text-white on-dark">
        <div className="absolute inset-0 pattern-dots" aria-hidden="true"></div>
        <div className="relative max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-2">
            <div data-reveal>
              <p className="eyebrow">Our vision</p>
              <p className="mt-4 font-serif text-2xl sm:text-3xl leading-snug">
                To empower future generations of students to reach their full potential in service of the nation, by building a transparent,
                merit-based and equitable system of education and professional opportunity.
              </p>
            </div>
            <div data-reveal>
              <p className="eyebrow">Our mission</p>
              <p className="mt-4 text-lg text-white/85 leading-relaxed">
                To advance quality and equity in education, public service and the professions across Pakistan, by making sound decisions
                possible through assessments built on quality, integrity and equal opportunity — using the best available technology, and
                developing our own tools, so that the true potential of our young people can be recognized and put to work for the country.
              </p>
            </div>
          </div>
          <h2 className="mt-16 font-serif text-3xl font-semibold">Our core values</h2>
          <ul className="mt-8 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            <li className="bg-green-900 p-6">
              <p className="font-serif text-xl text-gold-300">Merit</p>
              <p className="mt-2 text-sm text-white/75">Opportunity is earned through ability and performance.</p>
            </li>
            <li className="bg-green-900 p-6">
              <p className="font-serif text-xl text-gold-300">Transparency</p>
              <p className="mt-2 text-sm text-white/75">Processes are clear, explained and open to scrutiny.</p>
            </li>
            <li className="bg-green-900 p-6">
              <p className="font-serif text-xl text-gold-300">Fairness</p>
              <p className="mt-2 text-sm text-white/75">Every candidate is assessed impartially, under the same rules.</p>
            </li>
            <li className="bg-green-900 p-6">
              <p className="font-serif text-xl text-gold-300">Integrity</p>
              <p className="mt-2 text-sm text-white/75">We act ethically and protect the credibility of every test.</p>
            </li>
            <li className="bg-green-900 p-6">
              <p className="font-serif text-xl text-gold-300">Quality</p>
              <p className="mt-2 text-sm text-white/75">We apply consistent standards and keep improving.</p>
            </li>
            <li className="bg-green-900 p-6">
              <p className="font-serif text-xl text-gold-300">Innovation</p>
              <p className="mt-2 text-sm text-white/75">We use modern methods and technology responsibly.</p>
            </li>
            <li className="bg-green-900 p-6">
              <p className="font-serif text-xl text-gold-300">Accountability</p>
              <p className="mt-2 text-sm text-white/75">We take ownership of our results and our service.</p>
            </li>
            <li className="bg-green-900 p-6">
              <p className="font-serif text-xl text-gold-300">Service</p>
              <p className="mt-2 text-sm text-white/75">Candidates and institutions are at the centre of our work.</p>
            </li>
          </ul>
          <h2 className="mt-16 font-serif text-3xl font-semibold">What our values mean in practice</h2>
          <dl className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
              <dt className="font-semibold text-gold-300">Merit</dt>
              <dd className="mt-2 text-sm text-white/80">
                Scores are based only on answers given; seat allocation and selection follow published rules.
              </dd>
            </div>
            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
              <dt className="font-semibold text-gold-300">Transparency</dt>
              <dd className="mt-2 text-sm text-white/80">
                Test formats, syllabi and rules are published in advance; answer keys and results are released on time.
              </dd>
            </div>
            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
              <dt className="font-semibold text-gold-300">Fairness</dt>
              <dd className="mt-2 text-sm text-white/80">
                Every question is checked for bias; candidates with special needs can request suitable arrangements.
              </dd>
            </div>
            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
              <dt className="font-semibold text-gold-300">Integrity</dt>
              <dd className="mt-2 text-sm text-white/80">
                Papers are generated in a secure environment; unfair-means cases are heard and decided by a set procedure.
              </dd>
            </div>
            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
              <dt className="font-semibold text-gold-300">Quality</dt>
              <dd className="mt-2 text-sm text-white/80">
                Questions pass five review committees, piloting and statistical analysis before and after use.
              </dd>
            </div>
          </dl>
        </div>
      </section>
      {/* Governance */}
      <section id="governance" className="scroll-mt-48 max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <p className="eyebrow">Governance</p>
        <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-green-700">Board of Governors</h2>
        <p className="mt-4 max-w-3xl text-ink/80">
          The Board of Governors is ETC’s highest decision-making body. It brings together the federal government, all four provinces,
          public and private universities and the private sector, so that every major stakeholder is represented.
        </p>
        <div className="table-wrap mt-8" tabIndex={0} role="region" aria-label="Board of Governors composition">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Member</th>
                <th scope="col">Representation</th>
                <th scope="col">Role</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Chairperson</td>
                <td>Appointed by the Commission</td>
                <td>Chairperson</td>
              </tr>
              <tr>
                <td>Two Federal Secretaries (ex-officio)</td>
                <td>Ministry of Federal Education & Professional Training; Ministry of Information Technology</td>
                <td>Members</td>
              </tr>
              <tr>
                <td>Executive Director, HEC (ex-officio)</td>
                <td>Higher Education Commission</td>
                <td>Member</td>
              </tr>
              <tr>
                <td>Four Provincial Secretaries (ex-officio)</td>
                <td>Higher Education Departments — one from each province</td>
                <td>Members</td>
              </tr>
              <tr>
                <td>Four Vice Chancellors</td>
                <td>Public-sector universities — one from each province, nominated by the Commission</td>
                <td>Members</td>
              </tr>
              <tr>
                <td>Two Vice Chancellors</td>
                <td>Private non-profit universities, appointed by the Commission</td>
                <td>Members</td>
              </tr>
              <tr>
                <td>Two persons of eminence</td>
                <td>Private sector, appointed by the Commission</td>
                <td>Members</td>
              </tr>
              <tr>
                <td>CEO, ETC (ex-officio)</td>
                <td>Education Testing Council</td>
                <td>Member / Secretary</td>
              </tr>
              <tr>
                <td>Co-opted members</td>
                <td>Specialists from relevant fields, as the BOG considers necessary</td>
                <td>Co-opted Members</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 className="mt-16 font-serif text-2xl font-semibold text-green-700">Functional organization</h3>
        <p className="mt-3 max-w-3xl text-ink/80">
          Below the Board, the Chief Executive Officer leads the Council. An Internal Audit unit reports independently, and a Secretariat
          provides technical, legal, financial and administrative advice.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <li className="rounded-xl border border-line p-5">
            <p className="font-semibold text-green-700">Quality Assurance</p>
            <p className="mt-2 text-sm text-muted">Monitoring & evaluation; international collaboration & certification.</p>
          </li>
          <li className="rounded-xl border border-line p-5">
            <p className="font-semibold text-green-700">Academics & Research</p>
            <p className="mt-2 text-sm text-muted">Question bank, test development, training, research and data analytics.</p>
          </li>
          <li className="rounded-xl border border-line p-5">
            <p className="font-semibold text-green-700">Operations & Technology</p>
            <p className="mt-2 text-sm text-muted">Test administration, technology, printing press and call centre.</p>
          </li>
          <li className="rounded-xl border border-line p-5">
            <p className="font-semibold text-green-700">Administration</p>
            <p className="mt-2 text-sm text-muted">HR, accounting & finance, infrastructure and logistics.</p>
          </li>
          <li className="rounded-xl border border-line p-5">
            <p className="font-semibold text-green-700">Marketing & Business Development</p>
            <p className="mt-2 text-sm text-muted">Client relations, partnerships, media and CSR.</p>
          </li>
        </ul>
        <h3 className="mt-16 font-serif text-2xl font-semibold text-green-700">Core departments at work</h3>
        <p className="mt-3 max-w-3xl text-ink/80">Three departments sit at the heart of every test that ETC delivers.</p>
        <ul className="mt-8 grid gap-5 lg:grid-cols-3">
          <li className="rounded-2xl bg-mint-50 p-6">
            <p className="font-serif text-xl font-semibold text-green-700">Test Development & Evaluation</p>
            <p className="mt-2 text-sm text-ink/80">
              Designs tests, builds and maintains the item bank, marks descriptive papers, compiles results and runs psychometric analysis.
            </p>
            <Link href="/quality#workflow" className="mt-4 inline-flex text-sm font-semibold text-green-700 hover:underline">
              How tests are developed
            </Link>
          </li>
          <li className="rounded-2xl bg-cream-50 p-6">
            <p className="font-serif text-xl font-semibold text-green-700">Test Operations</p>
            <p className="mt-2 text-sm text-ink/80">
              Plans, schedules and conducts tests across the country and manages candidate services.
            </p>
            <Link href="/candidate-services#test-day" className="mt-4 inline-flex text-sm font-semibold text-green-700 hover:underline">
              The test-day journey
            </Link>
          </li>
          <li className="rounded-2xl bg-mint-50 p-6">
            <p className="font-serif text-xl font-semibold text-green-700">Quality Assurance</p>
            <p className="mt-2 text-sm text-ink/80">
              Monitors test operations, paper development, printing and result generation, and handles legal matters and unfair-means
              hearings.
            </p>
            <Link href="/quality#qa" className="mt-4 inline-flex text-sm font-semibold text-green-700 hover:underline">
              Quality assurance
            </Link>
          </li>
        </ul>
      </section>
      {/* Leadership */}
      <section id="leadership" className="scroll-mt-48 bg-mint-50 border-y border-line">
        <div className="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <p className="eyebrow">Leadership</p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-green-700">Messages from our leadership</h2>
          <LeadershipCards leaders={leaders} />
        </div>
      </section>
      {/* Roadmap */}
      <section id="roadmap" className="scroll-mt-48 max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4" data-reveal>
            <p className="eyebrow">Strategic roadmap</p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-green-700">Where we are heading</h2>
            <p className="mt-5 font-serif text-xl leading-snug text-ink/80">
              ETC aims to become a fully digital, research-led and internationally certified national testing body that every candidate and
              institution in Pakistan can trust.
            </p>
          </div>
          <ul className="lg:col-span-8 grid gap-4 sm:grid-cols-2" data-reveal>
            <li className="rounded-xl bg-mint-50 p-5">
              <p className="font-semibold text-green-700">National assessment policy</p>
              <p className="mt-1 text-sm text-muted">
                A Pakistan National Assessment Framework and data-driven policy input to higher-education reforms.
              </p>
            </li>
            <li className="rounded-xl bg-cream-50 p-5">
              <p className="font-semibold text-green-700">Standardized admissions</p>
              <p className="mt-1 text-sm text-muted">Expand mandatory standardized admission tests such as USAT and HAT.</p>
            </li>
            <li className="rounded-xl bg-cream-50 p-5">
              <p className="font-semibold text-green-700">Digital transformation</p>
              <p className="mt-1 text-sm text-muted">A gradual shift to nationwide computer-based testing (CBT).</p>
            </li>
            <li className="rounded-xl bg-mint-50 p-5">
              <p className="font-semibold text-green-700">Secure technology</p>
              <p className="mt-1 text-sm text-muted">
                AI-assisted proctoring and biometric verification, with safeguards for data protection.
              </p>
            </li>
            <li className="rounded-xl bg-mint-50 p-5">
              <p className="font-semibold text-green-700">Advanced item bank</p>
              <p className="mt-1 text-sm text-muted">A large-scale calibrated, psychometrically tagged and encrypted item bank.</p>
            </li>
            <li className="rounded-xl bg-cream-50 p-5">
              <p className="font-semibold text-green-700">International standards</p>
              <p className="mt-1 text-sm text-muted">ISO certification for testing operations and certification for item writers.</p>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}

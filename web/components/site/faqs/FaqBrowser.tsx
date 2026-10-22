"use client";

import type { FaqCategory } from "@prisma/client";
import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { searchFaqs } from "@/lib/filters";
import { FAQ_CATEGORY } from "@/lib/labels";
import type { FaqItem } from "@/lib/content/types";

const CATS: (FaqCategory | "")[] = ["", "REGISTRATION", "TEST_DAY", "RESULTS", "FEES", "ACCESSIBILITY", "INSTITUTIONS"];

/** Help & FAQs: live search in the hero, topic filter and an accordion of answers (mockup faqs.html). */
export function FaqBrowser({ faqs }: { faqs: FaqItem[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<FaqCategory | "">("");
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const query = useDeferredValue(q);
  const shown = searchFaqs(faqs, query, cat || undefined);
  const count = `${shown.length} ${shown.length === 1 ? "question" : "questions"}${query.trim() ? ` matching “${query.trim()}”` : ""}`;

  return (
    <>
      <section className="on-dark relative overflow-hidden bg-green-900 text-white">
        <div className="pattern-dots absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-site px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-sm text-white/70">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link className="hover:text-white" href="/">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link className="hover:text-white" href="/candidate-services">
                  Candidate Services
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-white">
                Help &amp; FAQs
              </li>
            </ol>
          </nav>
          <p className="eyebrow mt-8">Help &amp; FAQs</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight sm:text-5xl">How can we help?</h1>
          <form role="search" className="mt-8 max-w-2xl" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="faq-q" className="sr-only">
              Search questions
            </label>
            <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-1.5 text-ink shadow-lift">
              <Icon name="search" className="h-5 w-5 shrink-0 text-muted" />
              <input
                id="faq-q"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search, e.g. admit card, fee, results"
                className="w-full border-0 bg-transparent py-2.5 text-base focus:outline-none"
              />
            </div>
          </form>
        </div>
      </section>

      <section className="mx-auto grid max-w-site gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:px-8" aria-labelledby="faq-title">
        <h2 id="faq-title" className="sr-only">
          Frequently asked questions
        </h2>
        <div className="min-w-0 lg:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-gold-600" id="faq-cat-label">
            Topics
          </p>
          <div role="group" aria-labelledby="faq-cat-label" className="no-scrollbar mt-3 flex gap-2 overflow-x-auto lg:flex-col">
            {CATS.map((c) => {
              const n = c ? faqs.filter((f) => f.category === c).length : faqs.length;
              return (
                <button
                  key={c || "all"}
                  type="button"
                  aria-pressed={cat === c}
                  onClick={() => setCat(c)}
                  className="flex shrink-0 items-center justify-between gap-3 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-ink/80 ring-1 ring-line hover:text-green-700 aria-pressed:bg-green-700 aria-pressed:text-white aria-pressed:ring-green-700 lg:rounded-md"
                >
                  {c ? FAQ_CATEGORY[c].label : "All topics"}
                  <span className="text-xs opacity-70">{n}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="min-w-0 lg:col-span-9">
          <p role="status" className="text-sm text-muted">
            {count}
          </p>
          <div className="mt-3 divide-y divide-line border-y border-line">
            {shown.length ? (
              shown.map((f) => {
                const isOpen = !!open[f.id];
                return (
                  <div key={f.id}>
                    <h3>
                      <button
                        type="button"
                        id={`faq-b-${f.id}`}
                        aria-expanded={isOpen}
                        aria-controls={`faq-a-${f.id}`}
                        onClick={() => setOpen((o) => ({ ...o, [f.id]: !o[f.id] }))}
                        className="group flex w-full items-start justify-between gap-6 py-5 text-left font-semibold text-ink hover:text-green-700"
                      >
                        <span>
                          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gold-600">{FAQ_CATEGORY[f.category].label}</span>
                          {f.question}
                        </span>
                        <span
                          className="mt-5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-mint-50 text-green-700 transition group-aria-expanded:rotate-45"
                          aria-hidden="true"
                        >
                          +
                        </span>
                      </button>
                    </h3>
                    <div id={`faq-a-${f.id}`} role="region" aria-labelledby={`faq-b-${f.id}`} hidden={!isOpen} className="pb-6 pr-12 leading-relaxed text-ink/80">
                      {f.answer}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center">
                <p className="font-serif text-xl text-green-700">No questions match your search.</p>
                <p className="mt-1 text-sm text-muted">
                  Try another word, or{" "}
                  <Link className="font-semibold text-green-700 underline" href="/contact">
                    contact us
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
          <div className="mt-10 flex flex-col gap-4 rounded-2xl bg-cream-50 p-6 ring-1 ring-gold-300/50 sm:flex-row sm:items-center sm:justify-between">
            <p>
              <span className="font-semibold">Didn’t find your answer?</span> <span className="text-muted">Our helpline and email support can help.</span>
            </p>
            <Link href="/contact" className="shrink-0 rounded-md bg-green-700 px-5 py-3 text-center font-semibold text-white hover:bg-green-800">
              Contact support
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { HeroSlideItem } from "@/lib/content/types";

const INTERVAL = 7000;
const GRADIENTS = [
  "bg-gradient-to-r from-green-950/95 via-green-950/75 to-green-950/10",
  "bg-gradient-to-r from-green-950/95 via-green-950/70 to-transparent",
];

function Cta({ href, label, primary, tabIndex }: { href: string; label: string; primary: boolean; tabIndex: number }) {
  const cls = primary
    ? "inline-flex items-center gap-2 rounded-md bg-gold-500 px-6 py-3.5 font-semibold text-green-950 hover:bg-gold-300"
    : "inline-flex items-center gap-2 rounded-md border border-white/40 px-6 py-3.5 font-semibold text-white hover:bg-white/10";
  const external = href.startsWith("https://");
  return external ? (
    <a href={href} className={cls} tabIndex={tabIndex} target="_blank" rel="noopener">
      {label}
    </a>
  ) : (
    <Link href={href} className={cls} tabIndex={tabIndex}>
      {label}
      {primary && <Icon name="arrow" className="h-5 w-5" />}
    </Link>
  );
}

/**
 * Homepage hero (WAI-ARIA carousel): crossfade, auto-rotation every 7 s with a pause control, prev/next, dots and
 * arrow keys. The live region is silent while rotating and announces only when the user is in control.
 * Rotation stops while focus is inside, and never starts with reduced motion.
 */
export function Carousel({ slides, aside }: { slides: HeroSlideItem[]; aside?: React.ReactNode }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [focusInside, setFocusInside] = useState(false);
  const [announce, setAnnounce] = useState(false);
  const reduced = useRef(false);
  const n = slides.length;

  useEffect(() => {
    reduced.current = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current) setPlaying(false);
  }, []);

  const rotating = playing && !focusInside && n > 1;
  useEffect(() => {
    if (!rotating) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % n), INTERVAL);
    return () => clearInterval(t);
  }, [rotating, n, index]);

  const go = useCallback(
    (to: number) => {
      setAnnounce(true);
      setIndex(((to % n) + n) % n);
    },
    [n],
  );

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Highlights"
      data-carousel
      className="on-dark relative isolate overflow-hidden bg-green-950 text-white"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(index - 1);
        if (e.key === "ArrowRight") go(index + 1);
      }}
      onFocus={() => setFocusInside(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocusInside(false);
      }}
    >
      <div className="relative h-[640px] sm:h-[680px] lg:h-[min(82vh,720px)]">
        {slides.map((s, k) => {
          const active = k === index;
          const Title = k === 0 ? "h1" : "h2";
          return (
            <div
              key={s.id}
              data-slide
              role="group"
              aria-roledescription="slide"
              aria-label={`${k + 1} of ${n}`}
              aria-hidden={!active}
              className="absolute inset-0"
            >
              <Image
                src={s.image.url}
                alt=""
                fill
                priority={k === 0}
                sizes="100vw"
                className={`object-cover ${k === 2 ? "object-[70%_center]" : ""}`}
              />
              <div className={`absolute inset-0 ${GRADIENTS[k === 0 ? 0 : 1]}`} aria-hidden="true" />
              {k === 0 && <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-green-950/80 to-transparent" aria-hidden="true" />}
              <div className="relative mx-auto flex h-full max-w-site items-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl pb-24">
                  <p className="eyebrow">{s.eyebrow}</p>
                  <Title
                    className={`mt-5 font-serif font-semibold leading-[1.05] tracking-tight ${
                      k === 0 ? "text-[2.6rem] sm:text-6xl lg:text-7xl" : "text-[2.4rem] sm:text-6xl"
                    }`}
                  >
                    {s.title}
                  </Title>
                  <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">{s.body}</p>
                  {(s.cta1Href || s.cta2Href) && (
                    <div className="mt-9 flex flex-wrap gap-3">
                      {s.cta1Href && s.cta1Label && <Cta href={s.cta1Href} label={s.cta1Label} primary tabIndex={active ? 0 : -1} />}
                      {s.cta2Href && s.cta2Label && <Cta href={s.cta2Href} label={s.cta2Label} primary={false} tabIndex={active ? 0 : -1} />}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div className="absolute inset-x-0 bottom-24 z-10 sm:bottom-28">
          <div className="mx-auto flex max-w-site items-center gap-4 px-4 sm:px-6 lg:px-8">
            {n > 1 && (
              <>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => go(index - 1)}
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/30 hover:bg-white/10"
                    aria-label="Previous slide"
                  >
                    <Icon name="prev" className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(index + 1)}
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/30 hover:bg-white/10"
                    aria-label="Next slide"
                  >
                    <Icon name="next" className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlaying((p) => !p)}
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/30 hover:bg-white/10"
                    aria-label={playing ? "Pause slideshow" : "Play slideshow"}
                  >
                    <Icon name={playing ? "pause" : "play"} className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2" role="group" aria-label="Choose slide">
                  {slides.map((s, k) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => go(k)}
                      aria-current={k === index}
                      aria-label={`Slide ${k + 1}: ${s.title}`}
                      className="h-1.5 w-8 rounded-full bg-white/30 transition-all aria-[current=true]:w-12 aria-[current=true]:bg-gold-300"
                    />
                  ))}
                </div>
              </>
            )}
            {aside}
          </div>
          <p className="sr-only" aria-live={rotating || !announce ? "off" : "polite"}>
            Slide {index + 1} of {n}
          </p>
        </div>
      </div>
    </section>
  );
}

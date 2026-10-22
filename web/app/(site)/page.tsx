import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Carousel } from "@/components/site/Carousel";
import {
  Announcements,
  ChairmanQuote,
  ClientsMarquee,
  FindYourTest,
  Journeys,
  Numbers,
  Protect,
  QuickActions,
  Services,
} from "@/components/site/home/HomeSections";
import { getClients, getHeroSlides, getSchedule, getStats } from "@/lib/content/home";
import { getLeader } from "@/lib/content/leaders";
import { getMediaByKeys, SECTION_IMAGES } from "@/lib/content/media";
import { getLatestNotices } from "@/lib/content/notices";
import { getPublishedTests } from "@/lib/content/tests";

export const metadata: Metadata = pageMetadata({
  title: { absolute: "Education Testing Council | Higher Education Commission, Pakistan" },
  description:
    "Standardized, secure and merit-based assessment for admissions, scholarships, licensing and careers across Pakistan.",
  path: "/",
});

export default async function HomePage() {
  const [slides, notices, schedule, tests, stats, chairman, clients, media] = await Promise.all([
    getHeroSlides(),
    getLatestNotices(5),
    getSchedule(),
    getPublishedTests(),
    getStats(),
    getLeader("CHAIRMAN"),
    getClients(),
    getMediaByKeys([SECTION_IMAGES.institutions, SECTION_IMAGES.qualityOmr, SECTION_IMAGES.qualitySealed]),
  ]);
  const candidates = stats.find((s) => s.label === "Candidates tested");
  const img = (key: string) => media[key] ?? { url: "/brand/etc-crest.png", alt: "" };

  return (
    <>
      <Carousel
        slides={slides}
        aside={
          candidates && (
            <p className="ml-auto hidden text-sm text-white/70 lg:block">
              <span className="font-serif text-2xl text-white">{(candidates.value / 1_000_000).toFixed(2)} M</span>&nbsp; candidates
              tested since July 2021
            </p>
          )
        }
      />
      <QuickActions />
      <Announcements notices={notices} schedule={schedule} />
      <FindYourTest tests={tests} />
      <Journeys institutionsImage={img(SECTION_IMAGES.institutions).url} />
      <Numbers stats={stats} />
      <Protect omr={img(SECTION_IMAGES.qualityOmr)} sealed={img(SECTION_IMAGES.qualitySealed)} />
      <Services />
      <ChairmanQuote leader={chairman} />
      <ClientsMarquee clients={clients} />
    </>
  );
}

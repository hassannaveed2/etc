import type { ClientSector } from "@prisma/client";
import { prisma } from "@/lib/db";
import { cached, TAGS } from "@/lib/cache";
import { mediaRef, scheduleItem } from "./shape";
import type { HeroSlideItem, ScheduleItem, StatItem } from "./types";

export async function _getHeroSlides(): Promise<HeroSlideItem[]> {
  const rows = await prisma.heroSlide.findMany({ where: { published: true }, orderBy: [{ order: "asc" }, { id: "asc" }], include: { image: true } });
  return rows.map((h) => ({
    id: h.id,
    eyebrow: h.eyebrow,
    title: h.title,
    body: h.body,
    image: mediaRef(h.image)!,
    cta1Label: h.cta1Label,
    cta1Href: h.cta1Href,
    cta2Label: h.cta2Label,
    cta2Href: h.cta2Href,
  }));
}

export async function _getStats(): Promise<StatItem[]> {
  return prisma.stat.findMany({ orderBy: [{ order: "asc" }, { id: "asc" }], select: { value: true, label: true, note: true } });
}

/** Published sessions, soonest registration deadline first. */
export async function _getSchedule(): Promise<ScheduleItem[]> {
  const rows = await prisma.scheduleEntry.findMany({
    where: { published: true, test: { published: true } },
    orderBy: [{ regCloses: "asc" }, { id: "asc" }],
    include: { test: true },
  });
  return rows.map(scheduleItem);
}

export async function _getClients(): Promise<Record<ClientSector, string[]>> {
  const rows = await prisma.client.findMany({ orderBy: [{ order: "asc" }, { id: "asc" }] });
  const out: Record<ClientSector, string[]> = { FEDERAL: [], PROVINCIAL: [], UNIVERSITY: [], OTHER: [] };
  for (const c of rows) out[c.sector].push(c.name);
  return out;
}

export const getHeroSlides = cached(_getHeroSlides, "home:hero", [TAGS.hero, TAGS.media]);
export const getStats = cached(_getStats, "home:stats", [TAGS.stats]);
export const getSchedule = cached(_getSchedule, "home:schedule", [TAGS.schedule, TAGS.tests]);
export const getClients = cached(_getClients, "home:clients", [TAGS.clients]);

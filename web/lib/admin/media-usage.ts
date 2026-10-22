import type { LeaderRole } from "@prisma/client";
import { prisma } from "@/lib/db";

const LEADER: Record<LeaderRole, string> = { CHAIRMAN: "Chairman", EXECUTIVE_DIRECTOR: "Executive Director", CEO: "CEO" };

/** Human-readable list of every place a media item is used ("Test: USAT", "Resource: …"). */
export async function findMediaUsage(mediaId: number): Promise<string[]> {
  const [tests, resources, attachments, slides, leaders] = await Promise.all([
    prisma.test.findMany({ where: { imageId: mediaId }, select: { code: true } }),
    prisma.resource.findMany({ where: { mediaId }, select: { title: true } }),
    prisma.noticeAttachment.findMany({ where: { mediaId }, select: { label: true, notice: { select: { title: true } } } }),
    prisma.heroSlide.findMany({ where: { imageId: mediaId }, select: { title: true } }),
    prisma.leader.findMany({ where: { photoId: mediaId }, select: { role: true } }),
  ]);
  return [
    ...tests.map((t) => `Test: ${t.code}`),
    ...resources.map((r) => `Resource: ${r.title}`),
    ...attachments.map((a) => `Notice attachment: ${a.notice.title}`),
    ...slides.map((s) => `Hero slide: ${s.title}`),
    ...leaders.map((l) => `Leader: ${LEADER[l.role]}`),
  ];
}

export function mediaInUseMessage(usage: string[]): string {
  const shown = usage.slice(0, 3).join("; ");
  const more = usage.length > 3 ? ` and ${usage.length - 3} more` : "";
  return `This file is used by ${shown}${more}. Remove it there first.`;
}

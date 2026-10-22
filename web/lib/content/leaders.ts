import type { LeaderRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { cached, TAGS } from "@/lib/cache";
import { mediaRef } from "./shape";
import type { LeaderItem } from "./types";

const ORDER: LeaderRole[] = ["CHAIRMAN", "EXECUTIVE_DIRECTOR", "CEO"];

export async function _getLeaders(): Promise<LeaderItem[]> {
  const rows = await prisma.leader.findMany({ include: { photo: true } });
  return rows
    .sort((a, b) => ORDER.indexOf(a.role) - ORDER.indexOf(b.role))
    .map((l) => ({ role: l.role, name: l.name, title: l.title, quote: l.quote, messageHtml: l.messageHtml, photo: mediaRef(l.photo) }));
}

export async function _getLeader(role: LeaderRole): Promise<LeaderItem | null> {
  return (await _getLeaders()).find((l) => l.role === role) ?? null;
}

export const getLeaders = cached(_getLeaders, "leaders:all", [TAGS.leaders, TAGS.media]);
export const getLeader = cached(_getLeader, "leaders:one", [TAGS.leaders, TAGS.media]);

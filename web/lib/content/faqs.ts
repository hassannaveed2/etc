import { prisma } from "@/lib/db";
import { cached, TAGS } from "@/lib/cache";
import type { FaqItem } from "./types";

export async function _getFaqs(): Promise<FaqItem[]> {
  return prisma.faq.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { id: "asc" }],
    select: { id: true, category: true, question: true, answer: true },
  });
}

export const getFaqs = cached(_getFaqs, "faqs:all", [TAGS.faqs]);

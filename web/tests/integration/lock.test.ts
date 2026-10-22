import { afterAll, describe, expect, test } from "vitest";
import { prisma } from "@/lib/db";
import { StaleError, updateLocked } from "@/lib/admin/lock";

describe.skipIf(!process.env.DATABASE_URL)("optimistic lock", () => {
  afterAll(async () => {
    await prisma.faq.deleteMany({ where: { question: { startsWith: "E2E " } } });
    await prisma.$disconnect();
  });

  test("the second save with the same version is refused", async () => {
    const faq = await prisma.faq.create({ data: { category: "FEES", question: "E2E lock question", answer: "A", published: false } });
    const version = faq.updatedAt.toISOString();
    await updateLocked(prisma.faq, faq.id, version, { answer: "First editor" });
    await expect(updateLocked(prisma.faq, faq.id, version, { answer: "Second editor" })).rejects.toBeInstanceOf(StaleError);
    expect((await prisma.faq.findUniqueOrThrow({ where: { id: faq.id } })).answer).toBe("First editor");
  });

  test("a missing version is refused rather than overwriting", async () => {
    const faq = await prisma.faq.create({ data: { category: "FEES", question: "E2E lock question 2", answer: "A", published: false } });
    await expect(updateLocked(prisma.faq, faq.id, "", { answer: "x" })).rejects.toBeInstanceOf(StaleError);
  });
});

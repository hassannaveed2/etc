import { describe, test, expect, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { seed } from "@/prisma/seed";

describe.skipIf(!process.env.DATABASE_URL)("seed", () => {
  const prisma = new PrismaClient();
  const env = {
    ADMIN_EMAIL: process.env.ADMIN_EMAIL!,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD!,
    ADMIN_NAME: process.env.ADMIN_NAME ?? "ETC Administrator",
  };
  let originalHelpline: string | undefined;

  afterAll(async () => {
    if (originalHelpline !== undefined) {
      await prisma.setting.update({ where: { key: "helpline" }, data: { value: originalHelpline } });
    }
    await prisma.$disconnect();
  });

  test("seed is idempotent and never overwrites", async () => {
    await seed(prisma, env);
    originalHelpline = (await prisma.setting.findUniqueOrThrow({ where: { key: "helpline" } })).value;
    const adminBefore = await prisma.user.findUniqueOrThrow({ where: { email: env.ADMIN_EMAIL } });
    await prisma.setting.update({ where: { key: "helpline" }, data: { value: "E2E edited" } });

    const second = await seed(prisma, env);

    expect(Object.values(second).every((v) => v === "skipped")).toBe(true);
    expect((await prisma.setting.findUniqueOrThrow({ where: { key: "helpline" } })).value).toBe("E2E edited");
    const adminAfter = await prisma.user.findUniqueOrThrow({ where: { email: env.ADMIN_EMAIL } });
    expect(adminAfter.passwordHash).toBe(adminBefore.passwordHash);
  });

  test("seeded content is wired to its relations", async () => {
    const usat = await prisma.test.findUniqueOrThrow({ where: { slug: "usat" }, include: { sections: true, image: true } });
    expect(usat.sections).toHaveLength(4);
    expect(usat.image?.key).toBe("mockup/images/test-usat.jpg");
    const notice = await prisma.notice.findUniqueOrThrow({ where: { slug: "usat-reg-dec-2026" }, include: { attachments: true, test: true } });
    expect(notice.test?.slug).toBe("usat");
    expect(notice.attachments).toHaveLength(2);
    const chairman = await prisma.leader.findUniqueOrThrow({ where: { role: "CHAIRMAN" }, include: { photo: true } });
    expect(chairman.photo?.url).toBe("/img/leaders/imtiaz-haider.jpg");
  });
});

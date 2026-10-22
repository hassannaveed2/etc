import { afterAll, describe, expect, test } from "vitest";
import { prisma } from "@/lib/db";
import { findMediaUsage, mediaInUseMessage } from "@/lib/admin/media-usage";

// Review Focus 2: media still used by content must not be deletable.
describe.skipIf(!process.env.DATABASE_URL)("media usage", () => {
  afterAll(async () => {
    await prisma.resource.deleteMany({ where: { title: { startsWith: "E2E " } } });
    await prisma.media.deleteMany({ where: { key: { startsWith: "e2e/" } } });
    await prisma.$disconnect();
  });

  test("lists every place a media item is used", async () => {
    const media = await prisma.media.create({ data: { key: "e2e/usage.pdf", url: "https://x/e2e.pdf", mime: "application/pdf", size: 10 } });
    expect(await findMediaUsage(media.id)).toEqual([]);
    await prisma.resource.create({ data: { title: "E2E usage guide", type: "GUIDE", mediaId: media.id, date: new Date("2026-10-22"), published: false } });
    expect(await findMediaUsage(media.id)).toEqual(["Resource: E2E usage guide"]);
    expect(mediaInUseMessage(await findMediaUsage(media.id))).toBe("This file is used by Resource: E2E usage guide. Remove it there first.");
  });

  test("seed media is reported where used", async () => {
    const usat = await prisma.media.findUniqueOrThrow({ where: { key: "mockup/images/test-usat.jpg" } });
    expect(await findMediaUsage(usat.id)).toContain("Test: USAT");
    const photo = await prisma.media.findUniqueOrThrow({ where: { key: "local/img/leaders/imtiaz-haider.jpg" } });
    expect(await findMediaUsage(photo.id)).toEqual(expect.arrayContaining(["Leader: Chairman"]));
  });
});

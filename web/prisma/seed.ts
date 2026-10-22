// Idempotent seed: imports the approved mockup content, registers existing media and creates the first admin.
// Rules (shared cluster safety): per content model, insert only when its table is empty; settings are created
// only when missing; the admin is matched by email and its password is never changed once it exists.
import { statSync } from "node:fs";
import path from "node:path";
import { Prisma, PrismaClient } from "@prisma/client";
import data from "./seed-data/mockup.json";
import { heroSlides } from "./seed-data/hero";
import { leaderPhoto, leaders } from "./seed-data/leaders";
import { settingsDefaults } from "./seed-data/settings";
import { hashPassword, PASSWORD_MIN } from "../lib/auth/password";

type Outcome = "inserted" | "skipped";
export type SeedReport = Record<
  | "media"
  | "admin"
  | "settings"
  | "tests"
  | "notices"
  | "resources"
  | "faqs"
  | "heroSlides"
  | "schedule"
  | "stats"
  | "clients"
  | "leaders",
  Outcome
>;

export type SeedEnv = { ADMIN_EMAIL: string; ADMIN_PASSWORD?: string; ADMIN_NAME?: string };

const CDN = "https://sbsi-cdn.sgp1.digitaloceanspaces.com/ETC/mockup/";
const SAMPLE_PDF_KEY = "mockup/files/sample.pdf";
const date = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

function seedMedia(): Prisma.MediaCreateManyInput[] {
  const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
  const crest = (file: string, alt: string, width: number, height: number): Prisma.MediaCreateManyInput => ({
    key: `local/brand/${file}`,
    url: `/brand/${file}`,
    mime: "image/png",
    size: statSync(path.join(here, "../public/brand", file)).size,
    width,
    height,
    alt,
  });
  return [
    ...data.media.map(({ ref: _ref, ...m }) => m),
    crest("etc-crest.png", "Education Testing Council crest", 428, 480),
    crest("hec-crest.png", "Higher Education Commission crest", 422, 480),
    { ...leaderPhoto, size: statSync(path.join(here, "../public", leaderPhoto.url)).size },
    {
      key: SAMPLE_PDF_KEY,
      url: `${CDN}files/sample.pdf`,
      mime: "application/pdf",
      size: statSync(path.join(here, "seed-data/files/sample.pdf")).size,
      alt: "",
    },
  ];
}

async function whenEmpty(count: Promise<number>, insert: () => Promise<unknown>): Promise<Outcome> {
  if ((await count) > 0) return "skipped";
  await insert();
  return "inserted";
}

export async function seed(prisma: PrismaClient, env: SeedEnv): Promise<SeedReport> {
  // Media: create any missing keys, never touch existing rows.
  const mediaRows = seedMedia();
  const media = await prisma.media.createMany({ data: mediaRows, skipDuplicates: true });

  const mediaIds = new Map((await prisma.media.findMany({ select: { id: true, key: true } })).map((m) => [m.key, m.id]));
  const refToKey = new Map(data.media.map((m) => [m.ref, m.key]));
  const mediaId = (ref: string) => {
    const id = mediaIds.get(refToKey.get(ref) ?? ref);
    if (!id) throw new Error(`Seed media missing: ${ref}`);
    return id;
  };
  const pdfId = mediaId(SAMPLE_PDF_KEY);

  // First admin.
  let admin: Outcome = "skipped";
  const email = env.ADMIN_EMAIL.toLowerCase();
  if (!(await prisma.user.findUnique({ where: { email } }))) {
    if (!env.ADMIN_PASSWORD || env.ADMIN_PASSWORD.length < PASSWORD_MIN) {
      throw new Error(`ADMIN_PASSWORD (at least ${PASSWORD_MIN} characters) is required to create the first admin.`);
    }
    await prisma.user.create({
      data: { email, name: env.ADMIN_NAME || "ETC Administrator", role: "ADMIN", passwordHash: await hashPassword(env.ADMIN_PASSWORD) },
    });
    admin = "inserted";
  }

  // Settings: create missing keys only.
  const settings = await prisma.setting.createMany({
    data: Object.entries(settingsDefaults).map(([key, value]) => ({ key, value })),
    skipDuplicates: true,
  });

  const tests = await whenEmpty(prisma.test.count(), async () => {
    for (const { sections, imageRef, categories, tos, ...t } of data.tests) {
      await prisma.test.create({
        data: {
          ...t,
          category: t.category as Prisma.TestCreateInput["category"],
          categories: categories ?? Prisma.DbNull,
          tos: tos ?? Prisma.DbNull,
          imageId: mediaId(imageRef),
          sections: { create: sections.map((s, order) => ({ ...s, order })) },
        },
      });
    }
  });

  const testIds = new Map((await prisma.test.findMany({ select: { id: true, slug: true } })).map((t) => [t.slug, t.id]));
  const testId = (slug: string | null) => (slug ? testIds.get(slug) ?? null : null);

  const notices = await whenEmpty(prisma.notice.count(), async () => {
    for (const { attachments, testSlug, publishedAt, deadline, ...n } of data.notices) {
      await prisma.notice.create({
        data: {
          ...n,
          type: n.type as Prisma.NoticeCreateInput["type"],
          status: n.status as Prisma.NoticeCreateInput["status"],
          testId: testId(testSlug),
          publishedAt: date(publishedAt),
          deadline: deadline ? date(deadline) : null,
          attachments: { create: attachments.map((a, order) => ({ label: a.label, mediaId: pdfId, order })) },
        },
      });
    }
  });

  const resources = await whenEmpty(prisma.resource.count(), () =>
    prisma.resource.createMany({
      data: data.resources.map(({ testSlug, date: d, ...r }) => ({
        ...r,
        type: r.type as Prisma.ResourceCreateManyInput["type"],
        testId: testId(testSlug),
        mediaId: pdfId,
        date: date(d),
      })),
    }),
  );

  const faqs = await whenEmpty(prisma.faq.count(), () =>
    prisma.faq.createMany({
      data: data.faqs.map((f) => ({ ...f, category: f.category as Prisma.FaqCreateManyInput["category"] })),
    }),
  );

  const heroSlidesOutcome = await whenEmpty(prisma.heroSlide.count(), () =>
    prisma.heroSlide.createMany({ data: heroSlides.map(({ imageRef, ...h }) => ({ ...h, imageId: mediaId(imageRef) })) }),
  );

  const schedule = await whenEmpty(prisma.scheduleEntry.count(), () =>
    prisma.scheduleEntry.createMany({
      data: data.schedule.map(({ testSlug, regCloses, testDate, ...s }) => ({
        ...s,
        status: s.status as Prisma.ScheduleEntryCreateManyInput["status"],
        testId: testId(testSlug)!,
        regCloses: date(regCloses),
        testDate: date(testDate),
      })),
    }),
  );

  const stats = await whenEmpty(prisma.stat.count(), () => prisma.stat.createMany({ data: data.stats }));

  const clients = await whenEmpty(prisma.client.count(), () =>
    prisma.client.createMany({
      data: data.clients.map((c) => ({ ...c, sector: c.sector as Prisma.ClientCreateManyInput["sector"] })),
    }),
  );

  const leadersOutcome = await whenEmpty(prisma.leader.count(), () =>
    prisma.leader.createMany({ data: leaders.map((l) => ({ ...l, photoId: mediaId(leaderPhoto.key) })) }),
  );

  return {
    media: media.count > 0 ? "inserted" : "skipped",
    admin,
    settings: settings.count > 0 ? "inserted" : "skipped",
    tests,
    notices,
    resources,
    faqs,
    heroSlides: heroSlidesOutcome,
    schedule,
    stats,
    clients,
    leaders: leadersOutcome,
  };
}

if (process.argv[1]?.replace(/\\/g, "/").endsWith("prisma/seed.ts")) {
  const prisma = new PrismaClient();
  seed(prisma, {
    ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "",
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_NAME: process.env.ADMIN_NAME,
  })
    .then((report) => console.log("Seed report:", report))
    .catch((e) => {
      console.error(e instanceof Error ? e.message : e);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}

import { describe, test, expect, afterAll } from "vitest";
import { prisma } from "@/lib/db";
import { _getPublishedTests, _getTestBySlug, _getTestOptions } from "@/lib/content/tests";
import { _getLatestNotices, _getNoticeBySlug, _searchNotices } from "@/lib/content/notices";
import { _searchResources } from "@/lib/content/resources";
import { _getFaqs } from "@/lib/content/faqs";
import { _getClients, _getHeroSlides, _getSchedule, _getStats } from "@/lib/content/home";
import { _getLeader, _getLeaders } from "@/lib/content/leaders";
import { _getSettings } from "@/lib/content/settings";

const today = new Date("2026-10-22T00:00:00Z");

describe.skipIf(!process.env.DATABASE_URL)("content queries", () => {
  afterAll(async () => {
    await prisma.notice.deleteMany({ where: { slug: { startsWith: "e2e-" } } });
    await prisma.$disconnect();
  });

  test("published tests come back in sortOrder with fees and images", async () => {
    const t = await _getPublishedTests();
    expect(t.map((x) => x.slug)).toEqual(["lat", "law-gat", "hat", "haat", "usat", "customized"]);
    expect(t.find((x) => x.slug === "customized")!.fee).toBeNull();
    expect(t[0].image?.url).toMatch(/\/ETC\/mockup\/images\/test-lat\.jpg$/);
    expect((await _getTestOptions()).map((o) => o.code)).toContain("USAT");
  });

  test("getTestBySlug('usat') includes ordered sections, categories, TOS, notices and schedule", async () => {
    const t = (await _getTestBySlug("usat"))!;
    expect(t.sections.map((s) => s.name)[0]).toBe("Part I — Common Core");
    expect(t.sections[0].items).toBe("45");
    expect(t.categories).toHaveLength(6);
    expect(t.tos!.rows.at(-1)).toMatchObject({ area: "Common Core total", total: 45 });
    expect(t.notices.length).toBeGreaterThan(0);
    expect(t.notices.length).toBeLessThanOrEqual(3);
    expect(t.resources.every((r) => r.testCode === "USAT")).toBe(true);
    expect(t.schedule?.session).toBe("USAT December 2026");
    expect(await _getTestBySlug("nope")).toBeNull();
  });

  test("unpublished notice is invisible to list and detail", async () => {
    const before = await _searchNotices({ page: 1 }, today);
    await prisma.notice.create({
      data: {
        slug: "e2e-hidden-notice",
        title: "E2E hidden notice",
        type: "GENERAL",
        publishedAt: today,
        status: "OPEN",
        summary: "Hidden",
        bodyHtml: "<p>Hidden</p>",
        published: false,
      },
    });
    const after = await _searchNotices({ page: 1 }, today);
    expect(after.total).toBe(before.total);
    expect(await _getNoticeBySlug("e2e-hidden-notice")).toBeNull();
  });

  test("searchNotices filters, sorts newest first and clamps the page", async () => {
    const results = await _searchNotices({ type: "RESULT", page: 1 }, today);
    expect(results.items.every((n) => n.type === "RESULT")).toBe(true);
    const all = await _searchNotices({ page: 999 }, today);
    expect(all.page).toBe(all.pages);
    const dates = (await _getLatestNotices(5)).map((n) => n.publishedAt);
    expect([...dates].sort().reverse()).toEqual(dates);
    const general = await _searchNotices({ test: "general", page: 1 }, today);
    expect(general.items.every((n) => n.testCode === "General")).toBe(true);
  });

  test("notice detail has sanitised body, attachments with file urls and related notices", async () => {
    const n = (await _getNoticeBySlug("usat-reg-dec-2026"))!;
    expect(n.bodyHtml).toContain("<p>Registration for the Undergraduate");
    expect(n.attachments).toHaveLength(2);
    expect(n.attachments[0].url).toMatch(/sample\.pdf$/);
    expect(n.attachments[0].sizeLabel).toMatch(/KB$/);
    expect(n.related.every((r) => r.slug !== n.slug && r.testSlug === "usat")).toBe(true);
    expect(n.isSample).toBe(true);
  });

  test("resources: filters, PDF link, size label", async () => {
    const policies = await _searchResources({ type: "POLICY", page: 1 });
    expect(policies.total).toBe(3);
    expect(policies.items[0]).toMatchObject({ testCode: "General", isSample: true });
    expect(policies.items[0].fileUrl).toMatch(/\.pdf$/);
  });

  test("faqs, hero, stats, schedule, clients, leaders, settings", async () => {
    expect(await _getFaqs()).toHaveLength(19);
    expect((await _getHeroSlides()).map((h) => h.title)[0]).toBe("A fair test opens a door.");
    expect((await _getStats())[0]).toEqual({ value: 1852391, label: "Candidates tested", note: "Since 1 July 2021" });
    const schedule = await _getSchedule();
    expect(schedule.map((s) => s.regCloses)).toEqual([...schedule.map((s) => s.regCloses)].sort());
    const clients = await _getClients();
    expect(clients.FEDERAL[0]).toBe("Higher Education Commission (HRM & HRD Divisions)");
    expect(clients.UNIVERSITY).toHaveLength(16);
    expect((await _getLeader("CHAIRMAN"))!.photo?.url).toBe("/img/leaders/imtiaz-haider.jpg");
    expect((await _getLeaders()).map((l) => l.role)).toEqual(["CHAIRMAN", "EXECUTIVE_DIRECTOR", "CEO"]);
    const settings = await _getSettings();
    expect(settings.portalRegistrationUrl).toBe("#portal-registration");
  });
});

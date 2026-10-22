import { test, expect } from "vitest";
import data from "@/prisma/seed-data/mockup.json";
import { heroSlides } from "@/prisma/seed-data/hero";
import { leaders } from "@/prisma/seed-data/leaders";
import { settingsDefaults } from "@/prisma/seed-data/settings";
import {
  testInput,
  noticeInput,
  resourceInput,
  faqInput,
  scheduleEntryInput,
  statInput,
  clientInput,
  heroSlideInput,
  leaderInput,
  settingsInput,
  SETTINGS_KEYS,
} from "@/lib/validation/content";

const passes = (schema: { safeParse(v: unknown): { success: boolean; error?: unknown } }, rows: unknown[]) => {
  for (const row of rows) {
    const r = schema.safeParse(row);
    expect(r.success, JSON.stringify(r.error)).toBe(true);
  }
};

test("every mockup record passes the admin schemas", () => {
  passes(testInput, data.tests);
  passes(noticeInput, data.notices);
  passes(resourceInput, data.resources);
  passes(faqInput, data.faqs);
  passes(scheduleEntryInput, data.schedule);
  passes(statInput, data.stats);
  passes(clientInput, data.clients);
  passes(heroSlideInput, heroSlides);
  passes(leaderInput, [...leaders]);
  passes(settingsInput, [settingsDefaults]);
});

test("counts match the mockup", () => {
  expect(data.tests).toHaveLength(6);
  expect(data.faqs).toHaveLength(19);
  expect(data.stats).toHaveLength(8);
  expect(data.schedule).toHaveLength(5);
  expect(data.resources).toHaveLength(17);
  expect(heroSlides).toHaveLength(3);
  expect(leaders.map((l) => l.role)).toEqual(["CHAIRMAN", "EXECUTIVE_DIRECTOR", "CEO"]);
  expect(Object.keys(settingsDefaults).sort()).toEqual([...SETTINGS_KEYS].sort());
});

test("USAT keeps its 6 categories and 13 TOS rows", () => {
  const usat = data.tests.find((t) => t.slug === "usat")!;
  expect(usat.categories).toHaveLength(6);
  expect(usat.tos!.rows).toHaveLength(13);
});

test("a bad slug carries the plain-English message", () => {
  const r = noticeInput.safeParse({ ...data.notices[0], slug: "" });
  expect(r.success).toBe(false);
  expect(r.error!.issues[0].message).toBe("Enter a URL slug using English letters, numbers and hyphens.");
});

test("schedule rejects a test date before registration closes", () => {
  const r = scheduleEntryInput.safeParse({ ...data.schedule[0], regCloses: "2026-12-15", testDate: "2026-12-01" });
  expect(r.success).toBe(false);
  expect(r.error!.issues[0].message).toBe("Test date must be on or after the registration closing date.");
});

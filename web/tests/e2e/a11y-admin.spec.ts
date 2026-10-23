import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { PrismaClient } from "@prisma/client";
import { ADMIN, login } from "./fixtures";

const prisma = new PrismaClient();
let enquiryId = 0;
let noticeId = 0;

test.beforeAll(async () => {
  enquiryId = (
    await prisma.enquiry.create({
      data: {
        organization: "E2E A11y Board",
        contactPerson: "E2E Officer",
        email: "e2e+a11y@etc.test",
        service: "Recruitment & screening",
        candidates: 300,
        timeline: "1–3 months",
        message: "Accessibility check.",
        ipHash: "0".repeat(64),
      },
    })
  ).id;
  noticeId = (await prisma.notice.findFirstOrThrow({ orderBy: { id: "asc" } })).id;
});

test.afterAll(async () => {
  await prisma.enquiry.deleteMany({ where: { email: "e2e+a11y@etc.test" } });
  await prisma.$disconnect();
});

test.use({ reducedMotion: "reduce" });

async function expectNoSerious(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const bad = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
}

test("the sign-in page has no serious or critical violations", async ({ page }) => {
  await page.goto("/admin/login");
  await expectNoSerious(page);
});

test("admin pages have no serious or critical violations", async ({ page }) => {
  await login(page, ADMIN);
  for (const path of ["/admin", "/admin/notices", `/admin/notices/${noticeId}`, "/admin/media", `/admin/enquiries/${enquiryId}`]) {
    await test.step(path, async () => {
      await page.goto(path);
      await expect(page.locator("main h1")).toBeVisible();
      await expectNoSerious(page);
    });
  }
});

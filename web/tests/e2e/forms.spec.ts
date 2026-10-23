import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { EDITOR, login } from "./fixtures";

const prisma = new PrismaClient();
const EMAIL = "e2e+forms@etc.test";

test.beforeEach(async ({ request }) => {
  expect((await request.post("/api/test/reset-limits")).status()).toBe(204);
});

test.afterAll(async ({ request }) => {
  await request.post("/api/test/reset-limits");
  await prisma.enquiry.deleteMany({ where: { email: EMAIL } });
  await prisma.contactMessage.deleteMany({ where: { email: EMAIL } });
  await prisma.$disconnect();
});

const form = (page: Page) => page.locator("main form");
const summary = (page: Page) => page.locator("main").getByRole("alert");

async function fillEnquiry(page: Page, organization: string) {
  await page.goto("/institutions#enquiry");
  await form(page).getByLabel(/^Organization/).fill(organization);
  await form(page).getByLabel(/^Contact person/).fill("E2E Officer");
  await form(page).getByLabel(/^Official email/).fill(EMAIL);
  await form(page).getByLabel(/^Service/).selectOption("Recruitment & screening");
  await form(page).getByLabel(/^Estimated candidates/).fill("1200");
  await form(page).getByLabel(/^Timeline/).selectOption("1–3 months");
  await form(page).getByLabel(/^Message/).fill("Screening test for 40 posts.");
}

async function sendContact(page: Page, n: number) {
  await page.goto("/contact");
  await form(page).getByLabel(/^Full name/).fill(`E2E Contact ${n}`);
  await form(page).getByLabel(/^Email/).fill(EMAIL);
  await form(page).getByLabel(/^Subject/).selectOption("Results");
  await form(page).getByLabel(/^Message/).fill(`Message number ${n}.`);
  await page.getByRole("button", { name: "Send message" }).click();
}

test("an empty enquiry shows seven errors, focuses the summary and keeps what was typed", async ({ page }) => {
  await page.goto("/institutions#enquiry");
  await form(page).getByLabel(/^Phone/).fill("051 9040000");
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(summary(page)).toContainText("Please correct 7 fields below.");
  await expect(summary(page)).toBeFocused();
  await expect(summary(page).getByRole("link")).toHaveCount(7);
  await expect(form(page).getByLabel(/^Organization/)).toHaveAttribute("aria-invalid", "true");
  await expect(form(page).getByLabel(/^Phone/)).toHaveValue("051 9040000");
});

test("a valid enquiry shows the success panel and reaches the admin inbox", async ({ page }) => {
  await fillEnquiry(page, "E2E Org");
  await page.getByRole("button", { name: "Send enquiry" }).click();
  const done = page.getByRole("status").filter({ hasText: "Thank you — your enquiry has been received" });
  await expect(done).toBeVisible();
  await expect(done).toBeFocused();

  const row = await prisma.enquiry.findFirstOrThrow({ where: { email: EMAIL, organization: "E2E Org" } });
  expect(row).toMatchObject({ candidates: 1200, phone: null, status: "NEW" });
  expect(row.ipHash).toMatch(/^[0-9a-f]{64}$/);

  await login(page, EDITOR);
  await page.goto("/admin/enquiries");
  await expect(page.getByRole("row", { name: /E2E Org/ })).toBeVisible();
});

test("a filled honeypot looks successful but stores nothing", async ({ page }) => {
  await fillEnquiry(page, "E2E Honeypot Org");
  await page.locator("#website").fill("http://spam.example", { force: true });
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Thank you" })).toBeVisible();
  expect(await prisma.enquiry.count({ where: { organization: "E2E Honeypot Org" } })).toBe(0);
});

test("the sixth contact message in an hour is refused with the rate-limit message", async ({ page }) => {
  for (let n = 1; n <= 5; n++) {
    await sendContact(page, n);
    await expect(page.getByRole("status").filter({ hasText: "Thank you — your message has been received" })).toBeVisible();
  }
  await sendContact(page, 6);
  await expect(summary(page)).toContainText("You've sent several messages in the last hour. Please try again later or call the helpline.");
  await expect(form(page).getByLabel(/^Full name/)).toHaveValue("E2E Contact 6");
  expect(await prisma.contactMessage.count({ where: { email: EMAIL } })).toBe(5);
  await expect(form(page)).toBeVisible();
});

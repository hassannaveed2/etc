import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { ADMIN, EDITOR, login } from "./fixtures";

const prisma = new PrismaClient();

test.afterAll(async () => {
  await prisma.notice.deleteMany({ where: { title: { startsWith: "E2E " } } });
  await prisma.$disconnect();
});

async function fillNotice(page: Page, title: string) {
  await page.getByLabel(/^Title/).fill(title);
  await page.getByLabel("Notice type").selectOption("GENERAL");
  await page.getByLabel("Summary").fill("E2E summary text for the list.");
  await page.locator(".ProseMirror").click();
  await page.keyboard.type("E2E body paragraph.");
}

test("admin creates and publishes a notice and it appears on /news", async ({ page }) => {
  await login(page, ADMIN);
  await page.goto("/admin/notices/new");
  await fillNotice(page, "E2E Test notice");
  await expect(page.getByLabel("URL slug")).toHaveValue("e2e-test-notice");
  await page.getByRole("switch", { name: "Published" }).check();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("status").filter({ hasText: /^Saved$/ })).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/notices\/\d+$/);
  await expect(page.getByRole("link", { name: /View on site/ })).toHaveAttribute("href", "/news/e2e-test-notice");
  await page.goto("/news?q=E2E");
  await expect(page.getByText("E2E Test notice")).toBeVisible();
  await page.goto("/news/e2e-test-notice");
  await expect(page.getByText("E2E body paragraph.")).toBeVisible();
});

test("missing fields show inline errors and a focused summary", async ({ page }) => {
  await login(page, EDITOR);
  await page.goto("/admin/notices/new");
  await page.getByLabel(/^Title/).fill("E2E Incomplete");
  await page.getByRole("button", { name: "Save" }).click();
  const summary = page.locator("main").getByRole("alert");
  await expect(summary).toBeFocused();
  await expect(summary).toContainText("Summary is required.");
  await expect(page.getByLabel("Summary")).toHaveAttribute("aria-invalid", "true");
  // what the editor typed survives a failed save
  await expect(page.getByLabel(/^Title/)).toHaveValue("E2E Incomplete");
  expect(await prisma.notice.count({ where: { title: "E2E Incomplete" } })).toBe(0);
});

// Review Focus 5
test("an Urdu title with an empty slug shows the slug error and does not save", async ({ page }) => {
  await login(page, EDITOR);
  await page.goto("/admin/notices/new");
  await fillNotice(page, "داخلہ ٹیسٹ کا اعلان");
  await expect(page.getByLabel("URL slug")).toHaveValue("");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("Enter a URL slug using English letters, numbers and hyphens.");
  expect(await prisma.notice.count({ where: { title: "داخلہ ٹیسٹ کا اعلان" } })).toBe(0);
});

test("editors see Edit and Publish but no Delete in the row menu", async ({ page }) => {
  await login(page, EDITOR);
  await page.goto("/admin/notices");
  await page.locator('summary[aria-label^="Actions for"]').first().click();
  await expect(page.getByRole("button", { name: /Publish|Unpublish/ }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete…" })).toHaveCount(0);
});

// Review Focus 3 (end to end)
test("the second of two concurrent saves is refused with the reload message", async ({ browser }) => {
  const n = await prisma.notice.create({
    data: { slug: "e2e-concurrent", title: "E2E Concurrent", type: "GENERAL", publishedAt: new Date("2026-10-22"), status: "OPEN", summary: "S", bodyHtml: "<p>B</p>" },
  });
  const a = await (await browser.newContext()).newPage();
  const b = await (await browser.newContext()).newPage();
  await login(a, ADMIN);
  await login(b, EDITOR);
  await a.goto(`/admin/notices/${n.id}`);
  await b.goto(`/admin/notices/${n.id}`);
  await a.getByLabel(/^Summary/).fill("Saved by the first editor");
  await a.getByRole("button", { name: "Save" }).click();
  await expect(a.getByRole("status").filter({ hasText: /^Saved$/ })).toBeVisible();
  await b.getByLabel(/^Summary/).fill("Saved by the second editor");
  await b.getByRole("button", { name: "Save" }).click();
  await expect(b.locator("main").getByRole("alert")).toContainText("Someone else saved this item while you were editing.");
  expect((await prisma.notice.findUniqueOrThrow({ where: { id: n.id } })).summary).toBe("Saved by the first editor");
});

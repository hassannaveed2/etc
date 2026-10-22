import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { EDITOR, login } from "./fixtures";

const prisma = new PrismaClient();

test.afterAll(async () => {
  await prisma.stat.updateMany({ where: { label: "Cities" }, data: { value: 40 } });
  await prisma.heroSlide.updateMany({ data: { published: true } });
  await prisma.scheduleEntry.deleteMany({ where: { session: { startsWith: "E2E " } } });
  await prisma.client.deleteMany({ where: { name: { startsWith: "E2E " } } });
  await prisma.$disconnect();
});

test("changing a stat shows on the homepage", async ({ page }) => {
  await login(page, EDITOR);
  await page.goto("/admin/stats");
  const cities = page.getByLabel("Value of Cities");
  await expect(cities).toHaveValue("40");
  await cities.fill("41");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("status").filter({ hasText: /^Saved$/ })).toBeVisible();
  await page.goto("/");
  const numbers = page.locator("section", { has: page.getByRole("heading", { name: "Our record in numbers" }) });
  await expect(numbers.getByText("41", { exact: true }).first()).toBeAttached();
});

test("the last published hero slide can't be unpublished", async ({ page }) => {
  const slides = await prisma.heroSlide.findMany({ orderBy: { order: "asc" } });
  await prisma.heroSlide.updateMany({ where: { id: { in: slides.slice(1).map((s) => s.id) } }, data: { published: false } });
  await login(page, EDITOR);
  await page.goto("/admin/hero");
  await page.locator(`summary[aria-label="Actions for ${slides[0].title}"]`).click();
  await page.getByRole("button", { name: "Unpublish" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("Keep at least one hero slide published.");
});

test("a schedule entry with the test before registration closes is refused", async ({ page }) => {
  await login(page, EDITOR);
  await page.goto("/admin/schedule/new");
  await page.locator("#field-testId").selectOption({ label: "USAT" });
  await page.getByLabel(/^Session/).fill("E2E USAT March 2027");
  await page.getByLabel(/^Registration closes/).fill("2027-03-10");
  await page.getByLabel(/^Test date/).fill("2027-03-01");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("Test date must be on or after the registration closing date.");
  await page.getByLabel(/^Test date/).fill("2027-03-20");
  await page.getByRole("switch", { name: "Published" }).check();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("status").filter({ hasText: /^Saved$/ })).toBeVisible();
  await page.goto("/candidate-services");
  await expect(page.locator("#schedule").getByText("E2E USAT March 2027", { exact: true })).toBeVisible();
});

test("adding a client shows it on the institutions page", async ({ page }) => {
  await login(page, EDITOR);
  await page.goto("/admin/clients");
  await page.getByRole("button", { name: "Add client" }).click();
  const names = page.getByLabel(/^Client name/);
  await names.last().fill("E2E Testing Authority");
  await page.getByLabel(/^Sector/).last().selectOption("OTHER");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("status").filter({ hasText: /^Saved$/ })).toBeVisible();
  await page.goto("/institutions#clients");
  await expect(page.locator("#clients").getByText("E2E Testing Authority")).toBeVisible();
});

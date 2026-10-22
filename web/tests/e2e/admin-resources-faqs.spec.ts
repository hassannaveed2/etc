import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { EDITOR, login } from "./fixtures";

const prisma = new PrismaClient();

test.afterAll(async () => {
  await prisma.faq.deleteMany({ where: { question: { startsWith: "E2E " } } });
  await prisma.resource.deleteMany({ where: { title: { startsWith: "E2E " } } });
  await prisma.$disconnect();
});

test("an editor adds a FAQ, it shows under Fees, and unpublishing hides it", async ({ page }) => {
  await login(page, EDITOR);
  await page.goto("/admin/faqs/new");
  await page.getByLabel(/^Topic/).selectOption("FEES");
  await page.getByLabel(/^Question/).fill("E2E Can I pay the fee in instalments?");
  await page.getByLabel(/^Answer/).fill("No. The full fee is paid once on the official portal.");
  await page.getByRole("switch", { name: "Published" }).check();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();

  await page.goto("/faqs");
  await page.getByRole("group", { name: "Topics" }).getByRole("button", { name: /Fees/ }).click();
  await expect(page.getByText("E2E Can I pay the fee in instalments?")).toBeVisible();

  await page.goto("/admin/faqs");
  await page.locator('summary[aria-label="Actions for E2E Can I pay the fee in instalments?"]').click();
  await page.getByRole("button", { name: "Unpublish" }).click();
  await expect(page.getByText("Draft").first()).toBeVisible();
  await page.goto("/faqs");
  await expect(page.getByText("E2E Can I pay the fee in instalments?")).toHaveCount(0);
});

test("a resource with an existing PDF from the library appears on /resources", async ({ page }) => {
  await login(page, EDITOR);
  await page.goto("/admin/resources/new");
  await page.getByLabel(/^Title/).fill("E2E Candidate checklist");
  await page.getByLabel(/^Resource type/).selectOption("GUIDE");
  await page.getByRole("button", { name: "Choose…" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByPlaceholder("Search by file name or alt text").fill("sample.pdf");
  await dialog.getByRole("button", { name: /sample\.pdf/ }).first().click();
  await page.getByRole("switch", { name: "Published" }).check();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();
  await page.goto("/resources?q=E2E");
  await expect(page.getByText("E2E Candidate checklist")).toBeVisible();
});

test("a resource without a file is refused with a clear message", async ({ page }) => {
  await login(page, EDITOR);
  await page.goto("/admin/resources/new");
  await page.getByLabel(/^Title/).fill("E2E No file");
  await page.getByLabel(/^Resource type/).selectOption("GUIDE");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("Choose the PDF for this resource.");
});

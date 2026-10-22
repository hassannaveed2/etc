import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { ADMIN, EDITOR, login } from "./fixtures";

const prisma = new PrismaClient();
const TMP = { email: "e2e+tmp@etc.test", password: "e2e-temporary-pass-1" };

test.afterAll(async () => {
  await prisma.auditLog.updateMany({ where: { user: { email: TMP.email } }, data: { userId: null } });
  await prisma.user.deleteMany({ where: { email: TMP.email } });
  await prisma.faq.deleteMany({ where: { question: { startsWith: "E2E " } } });
  await prisma.$disconnect();
});

test("editors can't reach Users or the audit log", async ({ page }) => {
  await login(page, EDITOR);
  await expect(page.getByRole("link", { name: "Users" })).toHaveCount(0);
  await page.goto("/admin/users");
  await expect(page.getByRole("heading", { name: "You don’t have access to this page." })).toBeVisible();
  await page.goto("/admin/audit");
  await expect(page.getByRole("heading", { name: "You don’t have access to this page." })).toBeVisible();
});

test("a deactivated user's next action is refused", async ({ page, browser }) => {
  await login(page, ADMIN);
  await page.goto("/admin/users/new");
  await page.getByLabel(/^Name/).fill("E2E Temporary Editor");
  await page.getByLabel(/^Email/).fill(TMP.email);
  await page.getByLabel(/^Role/).selectOption("EDITOR");
  await page.getByLabel(/^Password/).fill(TMP.password);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("status").filter({ hasText: /^Saved$/ })).toBeVisible();

  const tmp = await (await browser.newContext()).newPage();
  await login(tmp, TMP);
  await tmp.goto("/admin/faqs/new");
  await tmp.getByLabel(/^Topic/).selectOption("FEES");
  await tmp.getByLabel(/^Question/).fill("E2E Deactivated user question");
  await tmp.getByLabel(/^Answer/).fill("Should not be saved.");

  await page.getByRole("switch", { name: "Active" }).uncheck();
  await page.getByRole("button", { name: "Save" }).click();
  // the create's "Saved" flash may still be showing, so wait for the account itself to be inactive.
  // (The temporary user signed in after this page loaded: that must not make the admin's save look stale.)
  await expect.poll(async () => (await prisma.user.findUnique({ where: { email: TMP.email } }))?.active, { timeout: 15_000 }).toBe(false);

  await tmp.getByRole("button", { name: "Save" }).click();
  await expect(tmp.locator("main").getByRole("alert")).toContainText("Your session has expired. Sign in again.");
  expect(await prisma.faq.count({ where: { question: "E2E Deactivated user question" } })).toBe(0);
});

test("admins can't remove their own admin access", async ({ page }) => {
  await login(page, ADMIN);
  await page.goto("/admin/users");
  await page.getByRole("link", { name: ADMIN.email }).click();
  await page.getByLabel(/^Role/).selectOption("EDITOR");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("You can't remove your own admin access.");
});

test("the dashboard shows content counts, the inbox and recent activity", async ({ page }) => {
  await login(page, ADMIN);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  const tests = page.getByRole("link", { name: /^Tests/ }).filter({ hasText: "published" });
  await expect(tests).toContainText("6 published");
  await expect(page.getByRole("heading", { name: "Recent activity" })).toBeVisible();
  await expect(page.getByRole("link", { name: "New notice" })).toHaveAttribute("href", "/admin/notices/new");
});

test("admins can read the audit log", async ({ page }) => {
  await login(page, ADMIN);
  await page.goto("/admin/audit");
  await expect(page.getByRole("heading", { name: "Audit log" })).toBeVisible();
  await expect(page.getByRole("cell", { name: /Signed in/ }).first()).toBeVisible();
});

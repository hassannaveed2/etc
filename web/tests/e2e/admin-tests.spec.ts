import { test, expect } from "@playwright/test";
import { Prisma, PrismaClient } from "@prisma/client";
import { ADMIN, EDITOR, login } from "./fixtures";

const prisma = new PrismaClient();
let originalTos: Prisma.JsonValue | null = null;

test.beforeAll(async () => {
  originalTos = (await prisma.test.findUniqueOrThrow({ where: { slug: "usat" } })).tos;
});

test.afterAll(async () => {
  await prisma.test.update({ where: { slug: "usat" }, data: { tos: originalTos ?? Prisma.DbNull } });
  await prisma.$disconnect();
});

test("editing a USAT TOS cell updates the computed total on the public page", async ({ page }) => {
  await login(page, EDITOR);
  await page.goto("/admin/tests");
  await page.getByRole("link", { name: "Undergraduate Studies Admission Test" }).click();
  const cell = page.getByLabel("A1 Analogy, K");
  await expect(cell).toHaveValue("1");
  await cell.fill("2");
  await expect(page.getByTestId("tos-total-0")).toHaveText("6");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("status").filter({ hasText: /^Saved$/ })).toBeVisible();
  await page.goto("/tests/usat");
  await expect(page.getByRole("row", { name: /^A1 Analogy/ })).toContainText("6");
});

test("a test with notices can't be deleted", async ({ page }) => {
  await login(page, ADMIN);
  await page.goto("/admin/tests");
  await page.locator('summary[aria-label="Actions for Law Admission Test"]').click();
  await page.getByRole("button", { name: "Delete…" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(/still has .*notice/);
});

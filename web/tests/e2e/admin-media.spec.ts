import path from "node:path";
import { test, expect } from "@playwright/test";
import { ADMIN, EDITOR, login } from "./fixtures";

const FIXTURES = path.join(__dirname, "fixtures");

test.describe("media library", () => {
  test.skip(!process.env.SPACES_KEY, "Spaces credentials are not available");

  test("admin uploads a PDF, sees it in the library and deletes it", async ({ page }) => {
    await login(page, ADMIN);
    await page.goto("/admin/media");
    await page.locator('input[type="file"]').setInputFiles(path.join(FIXTURES, "e2e-sample.pdf"));
    await expect(page.getByRole("status").filter({ hasText: /Uploaded .*e2e-sample\.pdf/ })).toBeVisible({ timeout: 30_000 });
    const card = page.getByRole("link", { name: /e2e-sample\.pdf/ }).first();
    await expect(card).toBeVisible();
    await card.click();
    await expect(page.getByText("Not used anywhere yet.")).toBeVisible();
    await page.getByRole("button", { name: "Delete file…" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click();
    await expect(page).toHaveURL(/\/admin\/media$/);
  });

  test("a file whose contents don't match its type is refused", async ({ page }) => {
    await login(page, EDITOR);
    await page.goto("/admin/media");
    await page.locator('input[type="file"]').setInputFiles({
      name: "not-really.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("<html><script>alert(1)</script></html>"),
    });
    await expect(page.locator("main").getByRole("alert")).toContainText("contents don’t match its type");
  });
});

// Review Focus 2
test("media used by content cannot be deleted and says where it is used", async ({ page }) => {
  await login(page, ADMIN);
  await page.goto("/admin/media?q=test-usat");
  await page.getByRole("link", { name: /test-usat\.jpg/ }).first().click();
  await expect(page.getByText("Test: USAT")).toBeVisible();
  await page.getByRole("button", { name: "Delete file…" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toHaveText(/This file is used by Test: USAT.*Remove it there first\./);
});

test("editors can't delete media", async ({ page }) => {
  await login(page, EDITOR);
  await page.goto("/admin/media?q=test-usat");
  await page.getByRole("link", { name: /test-usat\.jpg/ }).first().click();
  await expect(page.getByRole("button", { name: "Delete file…" })).toHaveCount(0);
});

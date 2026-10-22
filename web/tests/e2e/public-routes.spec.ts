import { test, expect } from "@playwright/test";

test.describe("home", () => {
  test("renders DB content", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "A fair test opens a door." })).toBeVisible();
    await expect(page.getByText("Candidates tested", { exact: true })).toBeVisible();
    await expect(page.getByText("Dr Muhammad Imtiaz Haider").first()).toBeVisible();
    await expect(page.locator("#home-notices li")).toHaveCount(5);
    await expect(page.locator("#home-tests article")).toHaveCount(6);
    await expect(page.locator("#home-schedule li")).toHaveCount(4);
    await expect(page.getByRole("link", { name: "Law Admission Test" }).first()).toHaveAttribute("href", "/tests/lat");
  });

  test("hero pause control toggles", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Pause slideshow" }).click();
    await expect(page.getByRole("button", { name: "Play slideshow" })).toBeVisible();
    await page.getByRole("button", { name: "Next slide" }).click();
    await expect(page.getByRole("heading", { level: 2, name: "Registration is open for USAT." })).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";

test.describe("desktop chrome", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("mega-menu opens by keyboard and Escape returns focus", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Tests & Assessments" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("link", { name: "USAT", exact: true }).first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("only one mega panel is open at a time and an outside click closes it", async ({ page }) => {
    await page.goto("/");
    const about = page.getByRole("button", { name: "About ETC" });
    const tests = page.getByRole("button", { name: "Tests & Assessments" });
    await about.click();
    await tests.click();
    await expect(about).toHaveAttribute("aria-expanded", "false");
    await expect(tests).toHaveAttribute("aria-expanded", "true");
    await page.mouse.click(10, 700);
    await expect(tests).toHaveAttribute("aria-expanded", "false");
  });

  test("current section is marked on detail pages", async ({ page }) => {
    await page.goto("/tests/usat");
    await expect(page.getByRole("button", { name: "Tests & Assessments" })).toHaveAttribute("aria-current", "page");
  });

  test("footer and quick links render settings-driven content", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("contentinfo")).toContainText("Merit · Transparency · Fairness · Quality");
    await expect(page.getByRole("link", { name: /Results.*official ETC portal/ }).first()).toHaveAttribute("target", "_blank");
  });
});

test.describe("mobile drawer", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("drawer traps focus and returns it on close", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Open menu" });
    await toggle.click();
    const dialog = page.getByRole("dialog", { name: "Site menu" });
    await expect(dialog).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    // Shift+Tab from the first focusable wraps to the last one inside the drawer
    await page.keyboard.press("Shift+Tab");
    await expect(dialog.getByRole("link", { name: "Find a Test" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(dialog.getByRole("button", { name: "Close menu" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(toggle).toBeFocused();
  });
});

test("unknown route shows the branded 404 with status 404", async ({ page }) => {
  const res = await page.goto("/nope");
  expect(res!.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("We couldn’t find that page.");
  await expect(page.getByRole("banner")).toBeVisible();
});

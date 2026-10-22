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

const STATIC_PAGES: [string, string[]][] = [
  ["/about", ["overview", "history", "mandate", "vision", "governance", "leadership"]],
  ["/quality", ["workflow", "item-bank", "psychometrics", "qa", "security"]],
  ["/institutions", ["services", "process", "clients", "enquiry"]],
  ["/candidate-services", ["schedule", "register", "admit-card", "results", "test-day", "accessibility", "policies", "unfair-means"]],
];

for (const [path, anchors] of STATIC_PAGES) {
  test(`${path} renders with one h1 and its nav anchors`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res!.status()).toBe(200);
    await expect(page.locator("main h1")).toHaveCount(1);
    for (const id of anchors) await expect(page.locator(`#${id}`), `#${id} on ${path}`).toHaveCount(1);
  });
}

test("about shows the three leadership messages from the database", async ({ page }) => {
  await page.goto("/about#leadership");
  const section = page.locator("#leadership");
  await expect(section.getByText("Dr Muhammad Imtiaz Haider")).toHaveCount(3);
  await expect(section.getByText("Executive Director, Higher Education Commission")).toBeVisible();
});

test("institutions lists clients by sector and shows the enquiry form", async ({ page }) => {
  await page.goto("/institutions");
  await expect(page.locator("#clients").getByText("Quaid-i-Azam University")).toBeVisible();
  await expect(page.getByLabel(/Organization/)).toBeVisible();
});

test("candidate services schedule table comes from the database", async ({ page }) => {
  await page.goto("/candidate-services");
  await expect(page.locator("#schedule tbody tr")).toHaveCount(5);
  await expect(page.locator("#schedule").getByText("LAW-GAT Q4 2026", { exact: true })).toBeVisible();
});

test("quality workflow tabs switch by keyboard", async ({ page }) => {
  await page.goto("/quality");
  const first = page.getByRole("tab", { name: /Test blueprint/ });
  await first.click();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("tab", { name: /Item development/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("heading", { level: 3, name: "Item development" })).toBeVisible();
});

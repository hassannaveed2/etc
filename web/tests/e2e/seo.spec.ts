import { test, expect } from "@playwright/test";

test("sitemap lists static routes plus every published test and notice", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const xml = await res.text();
  for (const path of ["/about", "/tests", "/tests/usat", "/news/usat-reg-dec-2026", "/faqs", "/contact"]) {
    expect(xml, path).toContain(`${path}</loc>`);
  }
  expect(xml).not.toContain("/admin");
});

test("robots disallows everything outside production", async ({ request }) => {
  const txt = await (await request.get("/robots.txt")).text();
  expect(txt).toMatch(/Disallow: \/\s*$/m);
});

test("pages carry a canonical URL, a description and noindex outside production", async ({ page }) => {
  await page.goto("/tests/usat");
  await expect(page).toHaveTitle("USAT — Undergraduate Studies Admission Test | Education Testing Council");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/tests\/usat$/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /test-usat\.jpg|_next\/image|digitaloceanspaces/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

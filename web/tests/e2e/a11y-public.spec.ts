import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PATHS = [
  "/",
  "/about",
  "/tests",
  "/tests/usat",
  "/candidate-services",
  "/institutions",
  "/quality",
  "/news",
  "/news/usat-reg-dec-2026",
  "/resources",
  "/faqs",
  "/contact",
  "/nope",
];

for (const width of [375, 1280]) {
  test.describe(`axe at ${width}px`, () => {
    // Reduced motion keeps reveal-on-scroll sections fully opaque, so axe measures the final colours.
    test.use({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    for (const path of PATHS) {
      test(`${path} has no serious or critical WCAG A/AA violations`, async ({ page }) => {
        await page.goto(path);
        const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
        const bad = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
        expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
      });
    }
  });
}

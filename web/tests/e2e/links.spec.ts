import { test, expect } from "@playwright/test";

// Port of the mockup's links test: every internal link reachable from the 13 templates resolves (no 404s).
const START = ["/", "/about", "/tests", "/tests/usat", "/candidate-services", "/institutions", "/quality", "/news", "/news/usat-reg-dec-2026", "/resources", "/faqs", "/contact"];

test("no internal link returns 404", async ({ page, request }) => {
  test.setTimeout(300_000);
  const targets = new Set<string>();
  for (const path of START) {
    await page.goto(path);
    const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => (a as HTMLAnchorElement).getAttribute("href")!));
    for (const h of hrefs) {
      if (!h.startsWith("/") || h.startsWith("//")) continue;
      targets.add(h.split("#")[0] || "/");
    }
  }
  const broken: string[] = [];
  for (const url of targets) {
    const res = await request.get(url);
    if (res.status() >= 400) broken.push(`${url} → ${res.status()}`);
  }
  expect(broken).toEqual([]);
  expect(targets.size).toBeGreaterThan(30);
});

test("every in-page anchor on a template points at an element that exists", async ({ page }) => {
  for (const path of ["/about", "/quality", "/institutions", "/candidate-services", "/contact", "/tests/usat"]) {
    await page.goto(path);
    const missing = await page.$$eval('a[href^="#"]:not([target="_blank"])', (as) =>
      as.map((a) => a.getAttribute("href")!.slice(1)).filter((id) => id && !document.getElementById(id)),
    );
    expect(missing, path).toEqual([]);
  }
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../mockup");
const SPEC_PAGES = [
  "index.html", "about.html", "tests.html", "test.html", "candidate-services.html", "institutions.html",
  "quality.html", "news.html", "notice.html", "resources.html", "faqs.html", "contact.html", "404.html",
];

const sources = [
  ...readdirSync(ROOT).filter((f) => f.endsWith(".html")),
  "assets/js/partials.js",
  "assets/js/render.js",
];

// Any quoted local page reference: href="x.html", "x.html#a", 'x.html?test=..'
const PAGE_REF = /["']([a-z0-9-]+\.html)(?:[#?][^"']*)?["']/g;

test("every page in the spec sitemap exists", () => {
  for (const p of SPEC_PAGES) assert.ok(existsSync(path.join(ROOT, p)), `missing page ${p}`);
});

test("every internal .html reference resolves to an existing page", () => {
  const broken = [];
  for (const src of sources) {
    const text = readFileSync(path.join(ROOT, src), "utf8");
    for (const m of text.matchAll(PAGE_REF)) {
      if (!existsSync(path.join(ROOT, m[1]))) broken.push(`${src} -> ${m[1]}`);
    }
  }
  assert.deepEqual(broken, []);
});

test("every in-page #anchor used by the nav exists on its target page", () => {
  const partials = readFileSync(path.join(ROOT, "assets/js/partials.js"), "utf8");
  const missing = [];
  for (const m of partials.matchAll(/["']([a-z0-9-]+\.html)#([a-z0-9-]+)["']/g)) {
    const html = readFileSync(path.join(ROOT, m[1]), "utf8");
    if (!html.includes(`id="${m[2]}"`)) missing.push(`${m[1]}#${m[2]}`);
  }
  assert.deepEqual(missing, []);
});

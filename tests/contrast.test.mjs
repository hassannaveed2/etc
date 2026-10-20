import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadScripts } from "./helpers/load.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../mockup");
const C = loadScripts(["assets/js/tailwind.config.js"]).tailwind.config.theme.extend.colors;
const css = readFileSync(path.join(ROOT, "assets/css/site.css"), "utf8");

const rgb = (hex) => hex.replace("#", "").match(/../g).map((h) => parseInt(h, 16));
const lum = (hex) => {
  const [r, g, b] = rgb(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
// colour at `alpha` over white (the bg-status-x/10 chip backgrounds)
const tint = (hex, alpha) => "#" + rgb(hex).map((v) => Math.round(v * alpha + 255 * (1 - alpha)).toString(16).padStart(2, "0")).join("");

const LIGHT = { white: "#FFFFFF", mint: C.mint[50], cream: C.cream[50] };

test("gold-600 small text meets 4.5:1 on all light surfaces and on gold-100", () => {
  for (const [name, bg] of Object.entries({ ...LIGHT, gold100: C.gold[100] })) {
    assert.ok(ratio(C.gold[600], bg) >= 4.5, `gold-600 on ${name}: ${ratio(C.gold[600], bg).toFixed(2)}`);
  }
});

test("status chip text meets 4.5:1 on its own 10% tint and on mint", () => {
  for (const [k, hex] of Object.entries(C.status)) {
    assert.ok(ratio(hex, tint(hex, 0.1)) >= 4.5, `${k} on its tint: ${ratio(hex, tint(hex, 0.1)).toFixed(2)}`);
    assert.ok(ratio(hex, LIGHT.mint) >= 4.5, `${k} on mint: ${ratio(hex, LIGHT.mint).toFixed(2)}`);
  }
});

test("focus ring on light surfaces meets 3:1 non-text contrast", () => {
  const ring = css.match(/:focus-visible\s*\{[^}]*outline:\s*3px solid (#[0-9A-Fa-f]{6})/)[1];
  for (const [name, bg] of Object.entries(LIGHT)) {
    assert.ok(ratio(ring, bg) >= 3, `focus ring ${ring} on ${name}: ${ratio(ring, bg).toFixed(2)}`);
  }
});

test("body and muted text meet 4.5:1 on light surfaces", () => {
  for (const fg of [C.ink, C.muted, C.green[700]]) {
    for (const [name, bg] of Object.entries(LIGHT)) assert.ok(ratio(fg, bg) >= 4.5, `${fg} on ${name}: ${ratio(fg, bg).toFixed(2)}`);
  }
});

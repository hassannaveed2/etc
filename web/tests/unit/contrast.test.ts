import { test, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../..");
const tokens = readFileSync(path.join(ROOT, "styles/tokens.css"), "utf8");
const css = readFileSync(path.join(ROOT, "app/globals.css"), "utf8");

const color = (name: string): string => {
  const m = tokens.match(new RegExp(`--color-${name}:\\s*(#[0-9A-Fa-f]{6})`));
  if (!m) throw new Error(`token --color-${name} not found`);
  return m[1];
};

const rgb = (hex: string) => hex.replace("#", "").match(/../g)!.map((h) => parseInt(h, 16));
const lum = (hex: string) => {
  const [r, g, b] = rgb(hex).map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
// colour at `alpha` over white (the bg-status-x/10 chip backgrounds)
const tint = (hex: string, alpha: number) =>
  "#" + rgb(hex).map((v) => Math.round(v * alpha + 255 * (1 - alpha)).toString(16).padStart(2, "0")).join("");

const LIGHT = { white: "#FFFFFF", mint: color("mint-50"), cream: color("cream-50") };

test("gold-600 small text meets 4.5:1 on white, mint-50, cream-50 and gold-100", () => {
  for (const [name, bg] of Object.entries({ ...LIGHT, gold100: color("gold-100") })) {
    expect(ratio(color("gold-600"), bg), `gold-600 on ${name}`).toBeGreaterThanOrEqual(4.5);
  }
});

test("status chip text meets 4.5:1 on its own 10% tint and on mint-50", () => {
  for (const k of ["open", "closing", "result", "closed"]) {
    const hex = color(`status-${k}`);
    expect(ratio(hex, tint(hex, 0.1)), `${k} on its tint`).toBeGreaterThanOrEqual(4.5);
    expect(ratio(hex, LIGHT.mint), `${k} on mint`).toBeGreaterThanOrEqual(4.5);
  }
});

test("focus ring on light surfaces meets 3:1 non-text contrast", () => {
  const ring = css.match(/:focus-visible\s*\{[^}]*outline:\s*3px solid (#[0-9A-Fa-f]{6})/)![1];
  for (const [name, bg] of Object.entries(LIGHT)) {
    expect(ratio(ring, bg), `focus ring on ${name}`).toBeGreaterThanOrEqual(3);
  }
});

test("body and muted text meet 4.5:1 on light surfaces", () => {
  for (const fg of ["ink", "muted", "green-700"]) {
    for (const [name, bg] of Object.entries(LIGHT)) {
      expect(ratio(color(fg), bg), `${fg} on ${name}`).toBeGreaterThanOrEqual(4.5);
    }
  }
});

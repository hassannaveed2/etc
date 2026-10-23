import { test, expect } from "@playwright/test";

const HEADERS = {
  "strict-transport-security": "max-age=31536000; includeSubDomains",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "x-frame-options": "DENY",
};

for (const path of ["/", "/admin/login"]) {
  test(`${path} carries the CSP and security headers`, async ({ request }) => {
    const res = await request.get(path);
    expect(res.status()).toBe(200);
    const h = res.headers();
    expect(h["content-security-policy"]).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/);
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["x-powered-by"]).toBeUndefined();
    for (const [k, v] of Object.entries(HEADERS)) expect(h[k], k).toBe(v);
  });
}

test("each response gets a fresh nonce", async ({ request }) => {
  const nonce = async () => (await request.get("/")).headers()["content-security-policy"].match(/'nonce-([^']+)'/)![1];
  expect(await nonce()).not.toBe(await nonce());
});

test("an unauthenticated admin page redirects to sign in, with the headers", async ({ request }) => {
  const res = await request.get("/admin/notices", { maxRedirects: 0 });
  expect(res.status()).toBe(307);
  expect(res.headers()["location"]).toContain("/admin/login");
  expect(res.headers()["x-frame-options"]).toBe("DENY");
});

test("the homepage runs under the CSP: no violations, and its scripts work", async ({ page }) => {
  const violations: string[] = [];
  page.on("console", (m) => {
    if (/Content Security Policy|Refused to/i.test(m.text())) violations.push(m.text());
  });
  await page.goto("/");
  // the hydrated mega-menu opens on click: proves Next's scripts were allowed to run
  await page.getByRole("button", { name: /^Tests/ }).first().click();
  await expect(page.getByRole("button", { name: /^Tests/ }).first()).toHaveAttribute("aria-expanded", "true");
  expect(violations).toEqual([]);
});

test("/api/health reports the database as up", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.status()).toBe(200);
  expect(res.headers()["cache-control"]).toContain("no-store");
  expect(await res.json()).toMatchObject({ ok: true, db: "up", version: expect.any(String) });
});

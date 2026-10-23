import { describe, expect, test } from "vitest";
import { buildCsp, securityHeaders } from "@/lib/csp";
import { needsSignIn } from "@/auth.config";

describe("buildCsp", () => {
  const prod = buildCsp("abc", { dev: false });

  test("scripts need the request nonce; no eval outside development", () => {
    expect(prod).toContain("script-src 'self' 'nonce-abc' 'strict-dynamic'");
    expect(prod).not.toContain("unsafe-eval");
    expect(buildCsp("abc", { dev: true })).toContain("script-src 'self' 'nonce-abc' 'strict-dynamic' 'unsafe-eval'");
  });

  test("the full production policy", () => {
    expect(prod.split("; ")).toEqual([
      "default-src 'self'",
      "script-src 'self' 'nonce-abc' 'strict-dynamic'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://sbsi-cdn.sgp1.digitaloceanspaces.com",
      "font-src 'self'",
      "connect-src 'self' https://sbsi-cdn.sgp1.digitaloceanspaces.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ]);
  });
});

test("securityHeaders", () => {
  expect(securityHeaders()).toEqual({
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    "X-Frame-Options": "DENY",
  });
});

test("needsSignIn covers /admin/** except the login page", () => {
  expect(needsSignIn("/admin")).toBe(true);
  expect(needsSignIn("/admin/notices/new")).toBe(true);
  expect(needsSignIn("/admin/login")).toBe(false);
  expect(needsSignIn("/administration")).toBe(false);
  expect(needsSignIn("/")).toBe(false);
});

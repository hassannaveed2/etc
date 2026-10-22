import { test, expect, describe } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { can } from "@/lib/rbac";
import { createRateLimiter } from "@/lib/rate-limit";
import { getClientIp, hashIp } from "@/lib/ip";
import { verifyCredentials, type CredentialDeps } from "@/lib/auth/credentials";

describe("password", () => {
  test("hashes verify and use cost 12", async () => {
    const h = await hashPassword("correct horse battery");
    expect(h).toMatch(/^\$2[aby]\$12\$/);
    expect(await verifyPassword("correct horse battery", h)).toBe(true);
    expect(await verifyPassword("wrong horse battery", h)).toBe(false);
  });
});

describe("rbac", () => {
  test("editor can write content, upload and work the inbox", () => {
    for (const p of ["content:write", "media:upload", "inbox:work"] as const) expect(can("EDITOR", p)).toBe(true);
  });
  test("editor cannot delete, manage users or settings, or read audit", () => {
    for (const p of ["content:delete", "media:delete", "users:manage", "settings:manage", "audit:read"] as const) {
      expect(can("EDITOR", p)).toBe(false);
    }
  });
  test("admin can do everything", () => {
    for (const p of ["content:delete", "users:manage", "settings:manage", "audit:read", "media:delete"] as const) {
      expect(can("ADMIN", p)).toBe(true);
    }
  });
});

describe("rate limiter", () => {
  test("6th hit inside window is refused and frees after window", () => {
    let t = 0;
    const l = createRateLimiter({ limit: 5, windowMs: 1000, now: () => t });
    for (let i = 0; i < 5; i++) expect(l.hit("k").ok).toBe(true);
    expect(l.hit("k")).toEqual({ ok: false, retryAfterSec: 1 });
    t = 1001;
    expect(l.hit("k").ok).toBe(true);
  });
  test("keys are independent and reset clears one key", () => {
    const l = createRateLimiter({ limit: 1, windowMs: 60_000 });
    expect(l.hit("a").ok).toBe(true);
    expect(l.hit("b").ok).toBe(true);
    expect(l.hit("a").ok).toBe(false);
    l.reset("a");
    expect(l.hit("a").ok).toBe(true);
  });
});

describe("ip", () => {
  test("first x-forwarded-for entry wins", () => {
    expect(getClientIp(new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))).toBe("1.2.3.4");
  });
  test("falls back to x-real-ip, then 0.0.0.0", () => {
    expect(getClientIp(new Headers({ "x-real-ip": "5.6.7.8" }))).toBe("5.6.7.8");
    expect(getClientIp(new Headers())).toBe("0.0.0.0");
  });
  test("hashIp is a salted sha256 hex digest", () => {
    expect(hashIp("1.2.3.4", "s")).toMatch(/^[0-9a-f]{64}$/);
    expect(hashIp("1.2.3.4", "s")).not.toBe(hashIp("1.2.3.4", "t"));
  });
});

describe("verifyCredentials", () => {
  const makeDeps = async (overrides: Partial<{ active: boolean }> = {}) => {
    const passwordHash = await hashPassword("a-very-good-password");
    const user = { id: 7, name: "Ayesha", email: "ayesha@etc.test", role: "EDITOR" as const, active: true, passwordHash, ...overrides };
    const calls = { lastLogin: 0, audits: 0 };
    const deps: CredentialDeps = {
      findUser: async (email) => (email === user.email ? user : null),
      onSuccess: async () => {
        calls.lastLogin++;
        calls.audits++;
      },
      limiter: createRateLimiter({ limit: 5, windowMs: 15 * 60_000 }),
    };
    return { deps, calls };
  };

  test("right password returns the session user and records the login", async () => {
    const { deps, calls } = await makeDeps();
    const u = await verifyCredentials({ email: "ayesha@etc.test", password: "a-very-good-password", ip: "1.1.1.1" }, deps);
    expect(u).toEqual({ id: 7, name: "Ayesha", email: "ayesha@etc.test", role: "EDITOR" });
    expect(calls).toEqual({ lastLogin: 1, audits: 1 });
  });

  test("wrong password, unknown email and inactive user all return null", async () => {
    const { deps } = await makeDeps();
    expect(await verifyCredentials({ email: "ayesha@etc.test", password: "nope-nope-nope", ip: "1.1.1.1" }, deps)).toBeNull();
    expect(await verifyCredentials({ email: "who@etc.test", password: "a-very-good-password", ip: "1.1.1.1" }, deps)).toBeNull();
    const inactive = await makeDeps({ active: false });
    expect(await verifyCredentials({ email: "ayesha@etc.test", password: "a-very-good-password", ip: "1.1.1.1" }, inactive.deps)).toBeNull();
  });

  test("6th attempt is refused even with the right password", async () => {
    const { deps } = await makeDeps();
    for (let i = 0; i < 5; i++) await verifyCredentials({ email: "ayesha@etc.test", password: "bad-password-x", ip: "2.2.2.2" }, deps);
    expect(await verifyCredentials({ email: "ayesha@etc.test", password: "a-very-good-password", ip: "2.2.2.2" }, deps)).toBeNull();
  });

  test("successful sign-ins do not count toward the lockout", async () => {
    const { deps } = await makeDeps();
    for (let i = 0; i < 8; i++) {
      expect(await verifyCredentials({ email: "ayesha@etc.test", password: "a-very-good-password", ip: "4.4.4.4" }, deps)).not.toBeNull();
    }
  });

  test("a success clears earlier failures", async () => {
    const { deps } = await makeDeps();
    const attempt = (password: string) => verifyCredentials({ email: "ayesha@etc.test", password, ip: "5.5.5.5" }, deps);
    for (let i = 0; i < 4; i++) await attempt("bad-password-x");
    expect(await attempt("a-very-good-password")).not.toBeNull();
    for (let i = 0; i < 4; i++) await attempt("bad-password-x");
    expect(await attempt("a-very-good-password")).not.toBeNull();
  });

  test("email is matched case-insensitively", async () => {
    const { deps } = await makeDeps();
    const u = await verifyCredentials({ email: "  Ayesha@ETC.test ", password: "a-very-good-password", ip: "3.3.3.3" }, deps);
    expect(u?.id).toBe(7);
  });
});

import { test, expect } from "vitest";
import { parseEnv } from "@/lib/env";

const minimalValidEnv = {
  DATABASE_URL: "mysql://u:pw@h:3306/ETCStaging",
  AUTH_SECRET: "x".repeat(32),
  ADMIN_EMAIL: "admin@etc.test",
  IP_HASH_SALT: "salt",
};

test("getEnv reports missing names without values", () => {
  expect(() => parseEnv({ DATABASE_URL: "mysql://x" })).toThrow(/AUTH_SECRET/);
  expect(() => parseEnv({ DATABASE_URL: "mysql://u:secretpw@h/db" })).not.toThrow(/secretpw/);
});

test("SMTP vars are optional; SITE_ENV defaults to development", () => {
  const env = parseEnv(minimalValidEnv);
  expect(env.NEXT_PUBLIC_SITE_ENV).toBe("development");
  expect(env.SMTP_HOST).toBeUndefined();
});

test("an unknown SITE_ENV is rejected by name", () => {
  expect(() => parseEnv({ ...minimalValidEnv, NEXT_PUBLIC_SITE_ENV: "prod" })).toThrow(/NEXT_PUBLIC_SITE_ENV/);
});

/** Test-only routes exist only in e2e runs (E2E=1) and never on production. */
export function testRoutesEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.E2E === "1" && env.NEXT_PUBLIC_SITE_ENV !== "production";
}

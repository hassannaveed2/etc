// Edge-safe: imported by middleware.ts. Spec §8 security headers.
const SPACES = "https://sbsi-cdn.sgp1.digitaloceanspaces.com";

/** Per-request Content-Security-Policy. Next adds the nonce to its own scripts; 'strict-dynamic' trusts what they load. */
export function buildCsp(nonce: string, opts: { dev: boolean }): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${opts.dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${SPACES}`,
    "font-src 'self'",
    `connect-src 'self' ${SPACES}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}

export function securityHeaders(): Record<string, string> {
  return {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    "X-Frame-Options": "DENY",
  };
}

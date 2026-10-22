import { createHash } from "node:crypto";

/** Client IP behind Nginx: first X-Forwarded-For entry, then X-Real-IP. */
export function getClientIp(h: Headers): string {
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip")?.trim() || "0.0.0.0";
}

/** IPs are only ever stored as salted hashes (spec §6). */
export function hashIp(ip: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

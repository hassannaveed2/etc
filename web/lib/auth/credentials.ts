import type { Role } from "@prisma/client";
import { verifyPassword } from "./password";
import type { RateLimiter } from "../rate-limit";

export type SessionUser = { id: number; name: string; email: string; role: Role };

type StoredUser = SessionUser & { active: boolean; passwordHash: string };

export type CredentialDeps = {
  findUser(email: string): Promise<StoredUser | null>;
  /** Records lastLoginAt and the LOGIN audit entry. */
  onSuccess(user: SessionUser, ip: string): Promise<void>;
  limiter: RateLimiter;
};

/**
 * Checks an email/password pair. Every failure returns null so the login page can show one generic message.
 * Failed attempts are limited per IP + email (5 per 15 minutes); once limited, even the right password fails.
 * A successful sign-in clears that key's failures.
 */
export async function verifyCredentials(
  input: { email: string; password: string; ip: string },
  deps: CredentialDeps,
): Promise<SessionUser | null> {
  const email = input.email.trim().toLowerCase();
  if (!email || !input.password) return null;
  const key = `${input.ip}|${email}`;
  if (deps.limiter.blocked(key)) return null;

  const user = await deps.findUser(email);
  const valid = !!user && user.active && (await verifyPassword(input.password, user.passwordHash));
  if (!user || !valid) {
    deps.limiter.hit(key);
    return null;
  }
  deps.limiter.reset(key);

  const session: SessionUser = { id: user.id, name: user.name, email: user.email, role: user.role };
  await deps.onSuccess(session, input.ip);
  return session;
}

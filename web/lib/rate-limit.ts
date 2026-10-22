// In-memory sliding-window limiter. Correct only with a single app instance (PM2 runs one; spec §8).
export type RateLimiter = {
  /** Records an attempt; refused once `limit` attempts fall inside the window. */
  hit(key: string): { ok: boolean; retryAfterSec: number };
  /** True when the key is already at its limit, without recording anything. */
  blocked(key: string): boolean;
  reset(key: string): void;
};

export function createRateLimiter(opts: { limit: number; windowMs: number; now?: () => number }): RateLimiter {
  const { limit, windowMs, now = Date.now } = opts;
  const hits = new Map<string, number[]>();

  return {
    hit(key) {
      const t = now();
      const recent = (hits.get(key) ?? []).filter((at) => t - at < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return { ok: false, retryAfterSec: Math.ceil((recent[0] + windowMs - t) / 1000) };
      }
      recent.push(t);
      hits.set(key, recent);
      return { ok: true, retryAfterSec: 0 };
    },
    blocked(key) {
      const t = now();
      return (hits.get(key) ?? []).filter((at) => t - at < windowMs).length >= limit;
    },
    reset(key) {
      hits.delete(key);
    },
  };
}

// Module-level singletons, shared by every request in this process.
const globalLimiters = globalThis as unknown as { etcLoginLimiter?: RateLimiter; etcFormLimiter?: RateLimiter };
export const loginLimiter = (globalLimiters.etcLoginLimiter ??= createRateLimiter({ limit: 5, windowMs: 15 * 60_000 }));
export const formLimiter = (globalLimiters.etcFormLimiter ??= createRateLimiter({ limit: 5, windowMs: 60 * 60_000 }));

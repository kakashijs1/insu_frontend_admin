import Elysia from "elysia";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  /** Maximum requests allowed per window (default: 20) */
  max?: number;
  /** Window duration in milliseconds (default: 60_000 = 1 minute) */
  windowMs?: number;
}

/**
 * Simple in-memory rate limiter by IP address.
 * Suitable for single-instance deployments.
 * For multi-instance, replace with Redis-backed store.
 */
export function rateLimiter(options: RateLimitOptions = {}) {
  const { max = 20, windowMs = 60_000 } = options;
  const store = new Map<string, RateLimitEntry>();

  // Periodically clean up expired entries to prevent memory leaks
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) {
        store.delete(key);
      }
    }
  }, windowMs * 2).unref();

  return new Elysia({ name: "rate-limiter" }).onBeforeHandle(
    ({ request, set }) => {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown";

      const now = Date.now();
      const entry = store.get(ip);

      if (!entry || entry.resetAt <= now) {
        store.set(ip, { count: 1, resetAt: now + windowMs });
        return;
      }

      entry.count++;

      if (entry.count > max) {
        set.status = 429;
        set.headers = {
          ...((set.headers as Record<string, string>) || {}),
          "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)),
        };
        return {
          success: false,
          message: "Too many requests. Please try again later.",
        };
      }
    },
  );
}

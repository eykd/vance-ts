/**
 * KV-backed distributed rate limiter for Cloudflare Workers.
 *
 * Implements the {@link RateLimiter} port using Cloudflare KV as the shared
 * backing store. Because KV is globally replicated, counters are visible
 * across all Workers isolates on the edge network — unlike in-memory solutions
 * that are siloed per isolate.
 *
 * **Key format**: `ratelimit:{endpoint}:{ip}`
 * Example: `ratelimit:sign-in:1.2.3.4`, `ratelimit:register:1.2.3.4`
 *
 * **Consistency trade-off**: Increment uses a read-increment-write cycle.
 * There is a small race window if two requests arrive simultaneously and both
 * read the same count before either writes back. This is an accepted trade-off
 * documented in the plan (see Security Considerations §Rate Limiting). A future
 * iteration may replace this with a Durable Objects atomic counter if abuse is
 * observed.
 *
 * @module
 */

import type { RateLimiter } from '../application/ports/RateLimiter';
import { MAX_ATTEMPTS } from '../application/ports/RateLimiter';

/** Shape of the JSON value stored in KV for each rate limit counter. */
interface RateLimitEntry {
  /** Number of attempts recorded within the current window. */
  count: number;
  /** Unix timestamp (ms) at which the current window expires. */
  resetAt: number;
}

/**
 * Parses a raw KV value into a RateLimitEntry.
 *
 * Returns `null` when the value is absent, malformed, or already past its
 * reset time. Callers treat `null` as "no active window" and create a fresh
 * counter.
 *
 * @param raw - Raw string from KV, or `null` if the key was not found.
 * @returns The parsed entry, or `null` if absent/invalid/expired.
 */
function parseEntry(raw: string | null): RateLimitEntry | null {
  if (raw === null) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return null;
  }

  const record = parsed as Record<string, unknown>;
  if (typeof record['count'] !== 'number' || typeof record['resetAt'] !== 'number') {
    return null;
  }

  const entry: RateLimitEntry = {
    count: record['count'],
    resetAt: record['resetAt'],
  };

  // Treat entries whose window has already passed as absent.
  if (entry.resetAt <= Date.now()) {
    return null;
  }

  return entry;
}

/**
 * KV-backed distributed rate limiter.
 *
 * @example
 * ```typescript
 * const limiter = new KvRateLimiter(env.RATE_LIMIT);
 * const key = `ratelimit:sign-in:${clientIp}`;
 * const { allowed, retryAfter } = await limiter.check(key);
 * if (!allowed) return new Response(null, { status: 429 });
 * await limiter.increment(key, SIGN_IN_WINDOW_SECONDS);
 * ```
 */
export class KvRateLimiter implements RateLimiter {
  private readonly kv: KVNamespace;

  /**
   * Creates a new KvRateLimiter backed by the given KV namespace.
   *
   * @param kv - The Cloudflare KV namespace for storing rate limit counters.
   * Bind as `RATE_LIMIT` in `wrangler.toml`.
   */
  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  /**
   * Checks whether the given key is within the rate limit.
   *
   * Does not modify the counter. Call {@link increment} separately after each
   * attempt to update the count.
   *
   * @param key - Rate limit key (e.g., `ratelimit:sign-in:1.2.3.4`).
   * @returns `{ allowed: true }` when under the limit, or `{ allowed: false,
   * retryAfter }` (seconds until reset) when the limit is exceeded.
   */
  async check(key: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    const raw = await this.kv.get(key);
    const entry = parseEntry(raw);

    if (entry === null) {
      return { allowed: true };
    }

    if (entry.count >= MAX_ATTEMPTS) {
      const retryAfter = Math.max(1, Math.ceil((entry.resetAt - Date.now()) / 1000));
      return { allowed: false, retryAfter };
    }

    return { allowed: true };
  }

  /**
   * Increments the attempt counter for the given key.
   *
   * - **New key**: Creates an entry with `count = 1` and TTL of `ttlSeconds`.
   * - **Existing key**: Increments `count` and preserves the remaining TTL
   * so the window does not extend on each attempt.
   *
   * @param key - Rate limit key (e.g., `ratelimit:sign-in:1.2.3.4`).
   * @param ttlSeconds - Window duration in seconds, used only when creating a new entry.
   */
  async increment(key: string, ttlSeconds: number): Promise<void> {
    const raw = await this.kv.get(key);
    const entry = parseEntry(raw);

    if (entry === null) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetAt: Date.now() + ttlSeconds * 1000,
      };
      await this.kv.put(key, JSON.stringify(newEntry), { expirationTtl: ttlSeconds });
    } else {
      const updatedEntry: RateLimitEntry = {
        count: entry.count + 1,
        resetAt: entry.resetAt,
      };
      const remainingSeconds = Math.max(1, Math.ceil((entry.resetAt - Date.now()) / 1000));
      await this.kv.put(key, JSON.stringify(updatedEntry), { expirationTtl: remainingSeconds });
    }
  }
}

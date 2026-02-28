/**
 * Durable Object-backed distributed rate limiter for Cloudflare Workers.
 *
 * Implements the {@link RateLimiter} port by routing each rate limit key to a
 * dedicated `RateLimitDO` instance via `DurableObjectNamespace.idFromName`.
 * Because Durable Objects process requests sequentially, concurrent `increment`
 * calls for the same key are automatically serialised — no increment is ever lost.
 *
 * **Key format**: `ratelimit:{endpoint}:{ip}`
 * Example: `ratelimit:sign-in:1.2.3.4`, `ratelimit:register:1.2.3.4`
 *
 * @module
 */

import type { RateLimiter } from '../application/ports/RateLimiter';
import { MAX_ATTEMPTS } from '../application/ports/RateLimiter';

/** Base URL used for Durable Object internal fetch calls. */
const DO_BASE_URL = 'https://rate-limit-do';

/** Shape of the JSON body returned by the DO `/check` endpoint. */
interface CheckResponseBody {
  /** Number of attempts recorded within the current window. */
  count: number;
  /** Unix timestamp (ms) at which the current window expires. */
  resetAt: number;
}

/** Shape of the JSON body returned by the DO `/check-and-increment` endpoint. */
interface CheckAndIncrementResponseBody {
  /** Whether the request is allowed to proceed. */
  allowed: boolean;
  /** Seconds until the rate limit window resets; present only when `allowed` is `false`. */
  retryAfter?: number;
}

/**
 * Rate limiter backed by a `RateLimitDO` Durable Object.
 *
 * @example
 * ```typescript
 * const limiter = new DurableObjectRateLimiter(env.RATE_LIMIT);
 * const key = `ratelimit:sign-in:${clientIp}`;
 * const { allowed, retryAfter } = await limiter.check(key);
 * if (!allowed) return new Response(null, { status: 429 });
 * await limiter.increment(key, SIGN_IN_WINDOW_SECONDS);
 * ```
 */
export class DurableObjectRateLimiter implements RateLimiter {
  private readonly namespace: DurableObjectNamespace;

  /**
   * Creates a new DurableObjectRateLimiter.
   *
   * @param namespace - The Durable Object namespace bound as `RATE_LIMIT` in `wrangler.toml`.
   */
  constructor(namespace: DurableObjectNamespace) {
    this.namespace = namespace;
  }

  /**
   * Returns the Durable Object stub for the given rate limit key.
   *
   * Each unique key maps to a distinct DO instance via `idFromName`, ensuring
   * that counters for different IP+endpoint combinations are isolated.
   *
   * @param key - Rate limit key (e.g., `ratelimit:sign-in:1.2.3.4`).
   * @returns The Durable Object stub for that key.
   */
  private getStub(key: string): DurableObjectStub {
    const id = this.namespace.idFromName(key);
    return this.namespace.get(id);
  }

  /**
   * Checks whether the given key is within the rate limit.
   *
   * Does not modify the counter. Call {@link increment} separately after each
   * attempt to record the usage.
   *
   * @param key - Rate limit key (e.g., `ratelimit:sign-in:1.2.3.4`).
   * @returns `{ allowed: true }` when under the limit, or `{ allowed: false,
   * retryAfter }` (seconds until reset) when the limit is exceeded.
   */
  async check(key: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    const stub = this.getStub(key);
    const response = await stub.fetch(`${DO_BASE_URL}/check`, { method: 'GET' });
    const entry = await response.json<CheckResponseBody | null>();

    if (entry === null || !Number.isFinite(entry.count) || !Number.isFinite(entry.resetAt)) {
      return { allowed: true };
    }

    if (entry.count >= MAX_ATTEMPTS) {
      const retryAfter = Math.max(1, Math.ceil((entry.resetAt - Date.now()) / 1000));
      return { allowed: false, retryAfter };
    }

    return { allowed: true };
  }

  /**
   * Increments the attempt counter for the given key via the Durable Object.
   *
   * The Durable Object guarantees atomic read-modify-write, so concurrent
   * calls for the same key never lose increments.
   *
   * - **New key / expired window**: Creates an entry with `count = 1` and TTL of `ttlSeconds`.
   * - **Active window**: Increments `count` and preserves `resetAt`.
   *
   * @param key - Rate limit key (e.g., `ratelimit:sign-in:1.2.3.4`).
   * @param ttlSeconds - Window duration in seconds, used only when creating a new entry.
   */
  async increment(key: string, ttlSeconds: number): Promise<void> {
    const stub = this.getStub(key);
    await stub.fetch(`${DO_BASE_URL}/increment`, {
      method: 'POST',
      body: JSON.stringify({ ttlSeconds }),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Atomically checks the rate limit and increments the counter via the Durable Object.
   *
   * Performs a single sequential DO invocation that eliminates the TOCTOU race
   * between a separate {@link check} and {@link increment} call. If the limit is already
   * exceeded, the counter is not modified.
   *
   * @param key - Rate limit key (e.g., `ratelimit:sign-in:1.2.3.4`).
   * @param ttlSeconds - Window duration in seconds, used only when creating a new entry.
   * @returns `{ allowed: true }` when the request may proceed (counter incremented), or
   * `{ allowed: false, retryAfter }` (seconds until reset) when the limit is exceeded.
   */
  async checkAndIncrement(
    key: string,
    ttlSeconds: number
  ): Promise<{ allowed: boolean; retryAfter?: number }> {
    const stub = this.getStub(key);
    const response = await stub.fetch(`${DO_BASE_URL}/check-and-increment`, {
      method: 'POST',
      body: JSON.stringify({ ttlSeconds, maxAttempts: MAX_ATTEMPTS }),
      headers: { 'Content-Type': 'application/json' },
    });
    const body = await response.json<CheckAndIncrementResponseBody>();

    if (!body.allowed) {
      const retryAfter = Number.isFinite(body.retryAfter) ? body.retryAfter : undefined;
      return { allowed: false, retryAfter };
    }

    return { allowed: true };
  }
}

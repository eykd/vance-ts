/**
 * RateLimiter port interface and policy constants.
 *
 * The port defines the contract for distributed rate limiting, decoupled from
 * the backing store. Constants are co-located here so that application-layer
 * use cases can import them without violating layer boundaries.
 *
 * @module
 */

/** Maximum number of allowed IP-based attempts per window before a request is rejected. */
export const MAX_ATTEMPTS = 5;

/** Rate limit window for sign-in attempts (seconds). 15 minutes. */
export const SIGN_IN_WINDOW_SECONDS = 900;

/** Rate limit window for registration attempts (seconds). 5 minutes. */
export const REGISTER_WINDOW_SECONDS = 300;

/** Maximum number of failed sign-in attempts per email before the account is locked (FR-006). */
export const SIGN_IN_EMAIL_MAX_ATTEMPTS = 10;

/** Rate limit window for per-email sign-in failures (seconds). 60 minutes (FR-006). */
export const SIGN_IN_EMAIL_WINDOW_SECONDS = 3600;

/**
 * Port interface for distributed rate limiting across Cloudflare Workers isolates.
 *
 * Implementations must use a shared distributed store (e.g., Cloudflare KV)
 * so that counters are visible across all isolates on the global edge network.
 * In-memory implementations are not sufficient for this requirement.
 */
export interface RateLimiter {
  /**
   * Checks whether the given key is within the allowed rate limit.
   *
   * Does not modify the counter — call `increment` separately after a check.
   *
   * @param key - The rate limit key (e.g., `ratelimit:sign-in:1.2.3.4`).
   * @param maxAttempts - Maximum attempts allowed within the current window.
   * @returns `{ allowed: true }` when the request may proceed, or `{ allowed: false,
   * retryAfter }` (seconds until reset) when the limit is exceeded.
   */
  check(key: string, maxAttempts: number): Promise<{ allowed: boolean; retryAfter?: number }>;

  /**
   * Increments the attempt counter for the given key.
   *
   * Creates a new counter if the key does not exist, using `ttlSeconds` as
   * the window duration. For existing counters, the remaining TTL is preserved.
   *
   * @param key - The rate limit key (e.g., `ratelimit:sign-in:1.2.3.4`).
   * @param ttlSeconds - Window duration in seconds used only when creating a new counter.
   */
  increment(key: string, ttlSeconds: number): Promise<void>;

  /**
   * Atomically checks the rate limit and increments the counter in a single
   * Durable Object invocation, eliminating the TOCTOU race between a separate
   * `check` and `increment` call.
   *
   * If the limit is already exceeded, the counter is **not** incremented and
   * `{ allowed: false, retryAfter }` is returned. If the limit is not exceeded,
   * the counter is incremented before returning `{ allowed: true }`.
   *
   * @param key - The rate limit key (e.g., `ratelimit:sign-in:1.2.3.4`).
   * @param ttlSeconds - Window duration in seconds used only when creating a new counter.
   * @returns `{ allowed: true }` when the request may proceed (counter incremented), or
   * `{ allowed: false, retryAfter }` (seconds until reset) when the limit is exceeded
   * (counter unchanged).
   */
  checkAndIncrement(
    key: string,
    ttlSeconds: number
  ): Promise<{ allowed: boolean; retryAfter?: number }>;
}

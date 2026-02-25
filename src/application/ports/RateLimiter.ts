/**
 * RateLimiter port interface and policy constants.
 *
 * The port defines the contract for distributed rate limiting, decoupled from
 * the backing store. Constants are co-located here so that application-layer
 * use cases can import them without violating layer boundaries.
 *
 * @module
 */

/** Maximum number of allowed attempts per window before a request is rejected. */
export const MAX_ATTEMPTS = 5;

/** Rate limit window for sign-in attempts (seconds). 15 minutes. */
export const SIGN_IN_WINDOW_SECONDS = 900;

/** Rate limit window for registration attempts (seconds). 5 minutes. */
export const REGISTER_WINDOW_SECONDS = 300;

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
   * @returns `{ allowed: true }` when the request may proceed, or `{ allowed: false,
   * retryAfter }` (seconds until reset) when the limit is exceeded.
   */
  check(key: string): Promise<{ allowed: boolean; retryAfter?: number }>;

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
}

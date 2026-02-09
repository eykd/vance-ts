/**
 * Configuration for a rate limiting rule.
 *
 * Defines the maximum number of requests allowed within a sliding window,
 * and an optional block duration for when the limit is exceeded.
 */
export interface RateLimitConfig {
  /** Maximum number of requests allowed within the window. */
  readonly maxRequests: number;

  /** Duration of the sliding window in seconds. */
  readonly windowSeconds: number;

  /** Optional duration in seconds to block after limit is exceeded. */
  readonly blockDurationSeconds?: number;
}

/**
 * Result of a rate limit check.
 *
 * Indicates whether the request is allowed, how many requests remain,
 * and when the client should retry if blocked.
 */
export interface RateLimitResult {
  /** Whether the request is allowed. */
  readonly allowed: boolean;

  /** Number of requests remaining in the current window. */
  readonly remaining: number;

  /** Seconds until the client can retry, or null if not blocked. */
  readonly retryAfterSeconds: number | null;
}

/**
 * Port defining how the domain expects to check and enforce rate limits.
 *
 * Implementations live in the infrastructure layer (e.g., KVRateLimiter).
 */
export interface RateLimiter {
  /**
   * Checks whether a request is allowed under the given rate limit config.
   *
   * @param identifier - The entity being rate-limited (e.g., IP address, user ID)
   * @param action - The action being rate-limited (e.g., 'login', 'register')
   * @param config - The rate limit configuration to apply
   * @returns The rate limit check result
   */
  checkLimit(identifier: string, action: string, config: RateLimitConfig): Promise<RateLimitResult>;

  /**
   * Resets the rate limit state for a given identifier and action.
   *
   * @param identifier - The entity whose rate limit state should be reset
   * @param action - The action whose rate limit state should be reset
   */
  reset(identifier: string, action: string): Promise<void>;
}

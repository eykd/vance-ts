import type {
  RateLimitConfig,
  RateLimitResult,
  RateLimiter,
} from '../../domain/interfaces/RateLimiter';

/**
 * In-memory mock implementation of RateLimiter for testing.
 *
 * Uses a configurable `allowed` property and tracks all calls
 * for test assertions.
 */
export class MockRateLimiter implements RateLimiter {
  /** Whether checkLimit should return allowed. Defaults to true. */
  allowed = true;

  /** Custom retryAfterSeconds value. Defaults to null. */
  retryAfterSeconds: number | null = null;

  /** Arguments passed to checkLimit(), in call order. */
  readonly checkLimitCalls: Array<{
    identifier: string;
    action: string;
    config: RateLimitConfig;
  }> = [];

  /** Arguments passed to reset(), in call order. */
  readonly resetCalls: Array<{ identifier: string; action: string }> = [];

  /**
   * Checks whether a request is allowed under the configured mock behavior.
   *
   * @param identifier - The entity being rate-limited
   * @param action - The action being rate-limited
   * @param config - The rate limit configuration to apply
   * @returns The mock rate limit result
   */
  checkLimit(
    identifier: string,
    action: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    this.checkLimitCalls.push({ identifier, action, config });
    return Promise.resolve({
      allowed: this.allowed,
      remaining: this.allowed ? 1 : 0,
      retryAfterSeconds: this.retryAfterSeconds,
    });
  }

  /**
   * Resets the rate limit state for a given identifier and action.
   *
   * @param identifier - The entity whose rate limit state should be reset
   * @param action - The action whose rate limit state should be reset
   * @returns Resolves when the reset is recorded
   */
  reset(identifier: string, action: string): Promise<void> {
    this.resetCalls.push({ identifier, action });
    return Promise.resolve();
  }
}

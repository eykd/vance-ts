import type { Logger } from '../../domain/interfaces/Logger';
import type {
  RateLimitConfig,
  RateLimitResult,
  RateLimiter,
} from '../../domain/interfaces/RateLimiter';
import type { TimeProvider } from '../../domain/interfaces/TimeProvider';
import type { KVNamespace } from '../types/CloudflareTypes';

/**
 * Shape of the rate limit state stored in KV.
 *
 * This type is file-private and must not be exported.
 */
interface RateLimitState {
  /** Timestamps of requests within the current window. */
  readonly requests: number[];

  /** Timestamp when the block expires, or null if not blocked. */
  readonly blockedUntil: number | null;
}

/**
 * KV-backed implementation of the RateLimiter port.
 *
 * Uses a sliding window algorithm with request timestamps stored in KV.
 * Supports configurable block durations for repeated violations.
 *
 * Key pattern: `ratelimit:{action}:{identifier}`
 *
 * Fails open (allows request) if KV operations fail, logging a warning.
 */
export class KVRateLimiter implements RateLimiter {
  private readonly kv: KVNamespace;
  private readonly logger: Logger;
  private readonly timeProvider: TimeProvider;

  /**
   * Creates a new KVRateLimiter.
   *
   * @param kv - The KV namespace binding
   * @param logger - Logger for warning on KV failures
   * @param timeProvider - Provides the current time for deterministic testing
   */
  constructor(kv: KVNamespace, logger: Logger, timeProvider: TimeProvider) {
    this.kv = kv;
    this.logger = logger;
    this.timeProvider = timeProvider;
  }

  /**
   * Checks whether a request is allowed under the given rate limit config.
   *
   * Implements a sliding window algorithm:
   * 1. Load state from KV (missing/corrupt defaults to empty)
   * 2. If blocked and block hasn't expired, return denied
   * 3. Filter requests to those within the window
   * 4. If at/over limit, optionally apply block duration
   * 5. Otherwise, record the request and allow
   *
   * Fails open on KV errors (logs warning, allows request).
   *
   * @param identifier - The entity being rate-limited (e.g., IP address)
   * @param action - The action being rate-limited (e.g., 'login')
   * @param config - The rate limit configuration to apply
   * @returns The rate limit check result
   */
  async checkLimit(
    identifier: string,
    action: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const key = `ratelimit:${action}:${identifier}`;
    const now = this.timeProvider.now();

    let state: RateLimitState;
    try {
      state = await this.loadState(key);
    } catch {
      if (config.failClosed === true) {
        this.logger.warn('Rate limiter KV read failed, failing closed', {
          action,
          ip: identifier,
        });
        return { allowed: false, remaining: 0, retryAfterSeconds: null };
      }
      this.logger.warn('Rate limiter KV read failed, failing open', {
        action,
        ip: identifier,
      });
      return { allowed: true, remaining: config.maxRequests, retryAfterSeconds: null };
    }

    // Check if currently blocked
    if (state.blockedUntil !== null && now < state.blockedUntil) {
      const retryAfterSeconds = Math.ceil((state.blockedUntil - now) / 1000);
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }

    // Clear block if expired
    const clearedState: RateLimitState =
      state.blockedUntil !== null ? { requests: state.requests, blockedUntil: null } : state;

    // Evict expired requests outside the window
    const windowStart = now - config.windowSeconds * 1000;
    const activeRequests = clearedState.requests.filter((ts) => ts > windowStart);

    if (activeRequests.length >= config.maxRequests) {
      // Rate limit exceeded
      if (config.blockDurationSeconds !== undefined && config.blockDurationSeconds > 0) {
        // Apply block duration
        const blockedUntil = now + config.blockDurationSeconds * 1000;
        const newState: RateLimitState = { requests: activeRequests, blockedUntil };
        const ttl = Math.max(config.windowSeconds, config.blockDurationSeconds);

        try {
          await this.kv.put(key, JSON.stringify(newState), { expirationTtl: ttl });
        } catch {
          this.logger.warn('Rate limiter KV write failed', { action, ip: identifier });
        }

        return {
          allowed: false,
          remaining: 0,
          retryAfterSeconds: config.blockDurationSeconds,
        };
      }

      // No block duration — calculate retry from oldest request expiry
      const oldestRequest = activeRequests[0];
      /* istanbul ignore next -- noUncheckedIndexedAccess guard: array is non-empty when length >= maxRequests */
      const retryAfterSeconds =
        oldestRequest !== undefined
          ? Math.ceil((oldestRequest + config.windowSeconds * 1000 - now) / 1000)
          : 1;

      return { allowed: false, remaining: 0, retryAfterSeconds };
    }

    // Request allowed — record timestamp
    activeRequests.push(now);
    const newState: RateLimitState = { requests: activeRequests, blockedUntil: null };

    try {
      await this.kv.put(key, JSON.stringify(newState), {
        expirationTtl: config.windowSeconds,
      });
    } catch {
      this.logger.warn('Rate limiter KV write failed', { action, ip: identifier });
    }

    return {
      allowed: true,
      remaining: config.maxRequests - activeRequests.length,
      retryAfterSeconds: null,
    };
  }

  /**
   * Resets the rate limit state for a given identifier and action.
   *
   * @param identifier - The entity whose rate limit state should be reset
   * @param action - The action whose rate limit state should be reset
   */
  async reset(identifier: string, action: string): Promise<void> {
    const key = `ratelimit:${action}:${identifier}`;
    await this.kv.delete(key);
  }

  /**
   * Loads rate limit state from KV.
   *
   * Returns empty state if the key is missing or data is corrupt.
   *
   * @param key - The KV key to load
   * @returns The rate limit state
   */
  private async loadState(key: string): Promise<RateLimitState> {
    const raw = await this.kv.get(key);

    if (raw === null) {
      return { requests: [], blockedUntil: null };
    }

    try {
      const parsed = JSON.parse(raw) as RateLimitState;

      if (!Array.isArray(parsed.requests)) {
        return { requests: [], blockedUntil: null };
      }

      return parsed;
    } catch {
      return { requests: [], blockedUntil: null };
    }
  }
}

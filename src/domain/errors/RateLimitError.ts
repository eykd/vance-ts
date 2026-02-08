import { DomainError } from './DomainError';

/**
 * Thrown when a client exceeds the allowed rate limit.
 *
 * Examples:
 * - Too many login attempts from an IP address
 * - Too many registration attempts in a time window
 * - API request quota exceeded
 *
 * This error indicates the client has made too many requests in a given
 * time period and should wait before retrying. It should be returned from
 * use cases (wrapped in Result type) and mapped to HTTP 429 Too Many Requests
 * responses with a Retry-After header.
 */
export class RateLimitError extends DomainError {
  readonly code = 'RATE_LIMIT_EXCEEDED';

  /**
   * Number of seconds the client should wait before retrying.
   */
  readonly retryAfter: number;

  /**
   * Creates a new rate limit error.
   *
   * @param message - Human-readable error description
   * @param retryAfter - Seconds the client should wait before retrying
   */
  constructor(message: string, retryAfter: number) {
    super(message);

    if (!Number.isFinite(retryAfter) || retryAfter <= 0) {
      throw new Error('retryAfter must be a positive finite number');
    }

    this.retryAfter = retryAfter;
  }
}

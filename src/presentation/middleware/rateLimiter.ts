import type { Logger } from '../../domain/interfaces/Logger';
import type { RateLimitConfig, RateLimiter } from '../../domain/interfaces/RateLimiter';
import { rateLimitPage } from '../templates/pages/errorPages';
import { extractClientIp } from '../utils/extractClientIp';
import { htmlResponse } from '../utils/htmlResponse';

/** Dependencies required by the rate limiter middleware. */
interface RateLimiterDeps {
  /** Rate limiter service. */
  readonly rateLimiter: RateLimiter;
  /** Logger for security events. */
  readonly logger: Logger;
}

/**
 * Checks whether a request is allowed under the given rate limit config.
 *
 * Returns `null` if the request is allowed, or a 429 Response if blocked.
 *
 * @param request - The incoming HTTP request
 * @param deps - The rate limiter dependencies
 * @param config - The rate limit configuration to apply
 * @param action - Optional action name for the rate limiter (defaults to request pathname)
 * @returns Null if allowed, or a 429 Response with Retry-After header
 */
export async function checkRateLimit(
  request: Request,
  deps: RateLimiterDeps,
  config: RateLimitConfig,
  action?: string
): Promise<Response | null> {
  const ip = extractClientIp(request);
  const actionName = action ?? new URL(request.url).pathname;

  const result = await deps.rateLimiter.checkLimit(ip, actionName, config);
  if (result.allowed) {
    return null;
  }

  const retryAfter = result.retryAfterSeconds ?? config.windowSeconds;

  deps.logger.security('rate_limit_exceeded', {
    ip,
    action: actionName,
  });

  const headers = new Headers();
  headers.set('Retry-After', String(retryAfter));

  return htmlResponse(rateLimitPage(), 429, headers);
}

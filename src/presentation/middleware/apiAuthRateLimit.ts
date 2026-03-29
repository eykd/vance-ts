/**
 * API auth rate limit middleware.
 *
 * Applies IP-based rate limiting to the better-auth API endpoints
 * `POST /api/auth/sign-in/*` and `POST /api/auth/sign-up/*`. These endpoints
 * bypass the HTML form handlers (and their use-case-level rate limiting), so
 * without this middleware an attacker could POST directly to the better-auth
 * JSON API with no rate limiting.
 *
 * The rate limit key format matches `SignInUseCase` and `SignUpUseCase`
 * (`ratelimit:<endpoint>:<ip>`), so API and form-based attack vectors share a
 * single counter per IP and cannot be used to bypass each other.
 *
 * @module
 */

import type { Context, Next } from 'hono';

import type { RateLimiter } from '../../application/ports/RateLimiter';
import { MAX_ATTEMPTS } from '../../application/ports/RateLimiter';
import type { AppEnv } from '../types';
import { extractClientIp } from '../utils/extractClientIp';

/**
 * Creates a Hono middleware that applies IP-based rate limiting to a specific
 * auth API endpoint using an atomic `checkAndIncrement` operation.
 *
 * On each request:
 * 1. Extracts the client IP via `CF-Connecting-IP` (Cloudflare-trusted header).
 * 2. Atomically checks and increments the counter for `ratelimit:<endpoint>:<ip>`
 * in a single Durable Object round-trip, eliminating the TOCTOU race that
 * the two-step `check` + `increment` pattern would introduce during the
 * 100–500 ms Argon2id hashing window.
 * 3. Returns 429 JSON with `Retry-After` if the limit is exceeded.
 * 4. Calls `next()` to pass through to the better-auth handler.
 *
 * @param rateLimiter - Rate limiter port; implemented by DurableObjectRateLimiter.
 * @param endpoint - The endpoint label used in the key ('sign-in' or 'register').
 * @param windowSeconds - Window duration in seconds, used when creating a new counter.
 * @returns A Hono middleware function.
 */
export function createApiAuthRateLimit(
  rateLimiter: RateLimiter,
  endpoint: 'sign-in' | 'register',
  windowSeconds: number
): (c: Context<AppEnv>, next: Next) => Promise<Response | void> {
  return async function apiAuthRateLimit(c: Context<AppEnv>, next: Next): Promise<Response | void> {
    const ip = extractClientIp(c.req.raw);
    const key = `ratelimit:${endpoint}:${ip}`;

    const check = await rateLimiter.checkAndIncrement(key, windowSeconds, MAX_ATTEMPTS);
    if (!check.allowed) {
      return new Response(
        JSON.stringify({ error: { code: 'rate_limit_exceeded', message: 'Too many requests' } }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(check.retryAfter ?? 60),
          },
        }
      );
    }

    await next();
  };
}

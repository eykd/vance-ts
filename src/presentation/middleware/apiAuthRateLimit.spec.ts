/**
 * Tests for the API auth rate limit middleware.
 *
 * Verifies that POST requests to /api/auth/sign-in/* and /api/auth/sign-up/*
 * are rate-limited using the DurableObjectRateLimiter, sharing the same key
 * format as the form-based use cases (SignInUseCase, SignUpUseCase).
 */

import { Hono } from 'hono/tiny';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { RateLimiter } from '../../application/ports/RateLimiter';
import {
  REGISTER_WINDOW_SECONDS,
  SIGN_IN_WINDOW_SECONDS,
} from '../../application/ports/RateLimiter';

import { createApiAuthRateLimit } from './apiAuthRateLimit';

/**
 * Creates a minimal RateLimiter mock with vi.fn() stubs.
 *
 * @returns An object with vi.fn() stubs for each RateLimiter method.
 */
function makeRateLimiterMock(): {
  check: ReturnType<typeof vi.fn>;
  increment: ReturnType<typeof vi.fn>;
} {
  return {
    check: vi.fn(),
    increment: vi.fn().mockResolvedValue(undefined),
  };
}

describe('createApiAuthRateLimit', () => {
  let rateLimiterMock: ReturnType<typeof makeRateLimiterMock>;

  beforeEach(() => {
    rateLimiterMock = makeRateLimiterMock();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Builds a test Hono app with the rate limit middleware applied globally and
   * downstream route handlers that respond with the given status.
   *
   * @param endpoint - The rate limit endpoint label.
   * @param windowSeconds - Rate limit window duration.
   * @param downstreamStatus - HTTP status returned by the downstream handler.
   * @returns A configured Hono app for exercising the middleware.
   */
  function makeTestApp(
    endpoint: 'sign-in' | 'register',
    windowSeconds: number,
    downstreamStatus = 200
  ): Hono {
    const app = new Hono();
    const middleware = createApiAuthRateLimit(
      rateLimiterMock as unknown as RateLimiter,
      endpoint,
      windowSeconds
    );
    app.use('*', middleware);
    app.post('/api/auth/sign-in/email', (c) =>
      c.json({ token: 'abc' }, downstreamStatus as Parameters<typeof c.json>[1])
    );
    app.post('/api/auth/sign-up/email', (c) =>
      c.json({ id: 'user-1' }, downstreamStatus as Parameters<typeof c.json>[1])
    );
    return app;
  }

  describe('rate limit enforcement', () => {
    it('returns 429 when the rate limiter denies the request', async () => {
      rateLimiterMock.check.mockResolvedValue({ allowed: false, retryAfter: 60 });

      const app = makeTestApp('sign-in', SIGN_IN_WINDOW_SECONDS);
      const res = await app.fetch(
        new Request('https://example.com/api/auth/sign-in/email', { method: 'POST' })
      );

      expect(res.status).toBe(429);
    });

    it('includes Retry-After header from the rate limiter in the 429 response', async () => {
      rateLimiterMock.check.mockResolvedValue({ allowed: false, retryAfter: 120 });

      const app = makeTestApp('sign-in', SIGN_IN_WINDOW_SECONDS);
      const res = await app.fetch(
        new Request('https://example.com/api/auth/sign-in/email', { method: 'POST' })
      );

      expect(res.headers.get('Retry-After')).toBe('120');
    });

    it('uses Retry-After: 60 as default when retryAfter is undefined', async () => {
      rateLimiterMock.check.mockResolvedValue({ allowed: false });

      const app = makeTestApp('sign-in', SIGN_IN_WINDOW_SECONDS);
      const res = await app.fetch(
        new Request('https://example.com/api/auth/sign-in/email', { method: 'POST' })
      );

      expect(res.headers.get('Retry-After')).toBe('60');
    });

    it('returns JSON error body on 429', async () => {
      rateLimiterMock.check.mockResolvedValue({ allowed: false, retryAfter: 60 });

      const app = makeTestApp('sign-in', SIGN_IN_WINDOW_SECONDS);
      const res = await app.fetch(
        new Request('https://example.com/api/auth/sign-in/email', { method: 'POST' })
      );

      expect(await res.json()).toEqual({ error: 'Too many requests' });
    });

    it('passes through to the downstream handler when the rate limiter allows the request', async () => {
      rateLimiterMock.check.mockResolvedValue({ allowed: true });

      const app = makeTestApp('sign-in', SIGN_IN_WINDOW_SECONDS, 200);
      const res = await app.fetch(
        new Request('https://example.com/api/auth/sign-in/email', { method: 'POST' })
      );

      expect(res.status).toBe(200);
    });
  });

  describe('rate limit key construction', () => {
    it('uses ratelimit:sign-in:<ip> key for the sign-in endpoint', async () => {
      rateLimiterMock.check.mockResolvedValue({ allowed: true });

      const app = makeTestApp('sign-in', SIGN_IN_WINDOW_SECONDS);
      await app.fetch(
        new Request('https://example.com/api/auth/sign-in/email', {
          method: 'POST',
          headers: { 'CF-Connecting-IP': '1.2.3.4' },
        })
      );

      expect(rateLimiterMock.check).toHaveBeenCalledWith('ratelimit:sign-in:1.2.3.4');
    });

    it('uses ratelimit:register:<ip> key for the register endpoint', async () => {
      rateLimiterMock.check.mockResolvedValue({ allowed: true });

      const app = makeTestApp('register', REGISTER_WINDOW_SECONDS);
      await app.fetch(
        new Request('https://example.com/api/auth/sign-up/email', {
          method: 'POST',
          headers: { 'CF-Connecting-IP': '5.6.7.8' },
        })
      );

      expect(rateLimiterMock.check).toHaveBeenCalledWith('ratelimit:register:5.6.7.8');
    });

    it('uses a UUID as ip key when CF-Connecting-IP is absent (unknown IP)', async () => {
      rateLimiterMock.check.mockResolvedValue({ allowed: true });

      const app = makeTestApp('sign-in', SIGN_IN_WINDOW_SECONDS);
      await app.fetch(
        new Request('https://example.com/api/auth/sign-in/email', { method: 'POST' })
      );

      const [calledKey] = rateLimiterMock.check.mock.calls[0] as [string];
      expect(calledKey).toMatch(
        /^ratelimit:sign-in:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
    });
  });

  describe('attempt counter increment', () => {
    it('increments the counter using the correct key after a 4xx response', async () => {
      rateLimiterMock.check.mockResolvedValue({ allowed: true });

      const app = makeTestApp('sign-in', SIGN_IN_WINDOW_SECONDS, 401);
      await app.fetch(
        new Request('https://example.com/api/auth/sign-in/email', {
          method: 'POST',
          headers: { 'CF-Connecting-IP': '1.2.3.4' },
        })
      );

      expect(rateLimiterMock.increment).toHaveBeenCalledWith(
        'ratelimit:sign-in:1.2.3.4',
        SIGN_IN_WINDOW_SECONDS
      );
    });

    it('increments using REGISTER_WINDOW_SECONDS for the register endpoint', async () => {
      rateLimiterMock.check.mockResolvedValue({ allowed: true });

      const app = makeTestApp('register', REGISTER_WINDOW_SECONDS, 422);
      await app.fetch(
        new Request('https://example.com/api/auth/sign-up/email', {
          method: 'POST',
          headers: { 'CF-Connecting-IP': '1.2.3.4' },
        })
      );

      expect(rateLimiterMock.increment).toHaveBeenCalledWith(
        'ratelimit:register:1.2.3.4',
        REGISTER_WINDOW_SECONDS
      );
    });

    it('does not increment after a successful 200 response', async () => {
      rateLimiterMock.check.mockResolvedValue({ allowed: true });

      const app = makeTestApp('sign-in', SIGN_IN_WINDOW_SECONDS, 200);
      await app.fetch(
        new Request('https://example.com/api/auth/sign-in/email', {
          method: 'POST',
          headers: { 'CF-Connecting-IP': '1.2.3.4' },
        })
      );

      expect(rateLimiterMock.increment).not.toHaveBeenCalled();
    });

    it('does not increment after a 5xx server error response', async () => {
      rateLimiterMock.check.mockResolvedValue({ allowed: true });

      const app = makeTestApp('sign-in', SIGN_IN_WINDOW_SECONDS, 500);
      await app.fetch(
        new Request('https://example.com/api/auth/sign-in/email', {
          method: 'POST',
          headers: { 'CF-Connecting-IP': '1.2.3.4' },
        })
      );

      expect(rateLimiterMock.increment).not.toHaveBeenCalled();
    });

    it('does not increment when the request is blocked by rate limiting', async () => {
      rateLimiterMock.check.mockResolvedValue({ allowed: false, retryAfter: 60 });

      const app = makeTestApp('sign-in', SIGN_IN_WINDOW_SECONDS);
      await app.fetch(
        new Request('https://example.com/api/auth/sign-in/email', {
          method: 'POST',
          headers: { 'CF-Connecting-IP': '1.2.3.4' },
        })
      );

      expect(rateLimiterMock.increment).not.toHaveBeenCalled();
    });
  });
});

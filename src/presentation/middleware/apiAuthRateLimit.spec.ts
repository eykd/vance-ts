/**
 * Tests for the API auth rate limit middleware.
 *
 * Verifies that POST requests to /api/auth/sign-in/* and /api/auth/sign-up/*
 * are rate-limited using an atomic `checkAndIncrement` operation, sharing the
 * same key format as the form-based use cases (SignInUseCase, SignUpUseCase).
 *
 * The middleware uses `checkAndIncrement` (a single Durable Object round-trip)
 * instead of the two-step `check` + `increment` pattern, eliminating the TOCTOU
 * race that would otherwise allow concurrent bursts to bypass the rate limit
 * during the 100–500 ms Argon2id hashing window.
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
  checkAndIncrement: ReturnType<typeof vi.fn>;
} {
  return {
    check: vi.fn(),
    increment: vi.fn().mockResolvedValue(undefined),
    checkAndIncrement: vi.fn().mockResolvedValue({ allowed: true }),
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
    it('returns 429 when checkAndIncrement denies the request', async () => {
      rateLimiterMock.checkAndIncrement.mockResolvedValue({ allowed: false, retryAfter: 60 });

      const app = makeTestApp('sign-in', SIGN_IN_WINDOW_SECONDS);
      const res = await app.fetch(
        new Request('https://example.com/api/auth/sign-in/email', { method: 'POST' })
      );

      expect(res.status).toBe(429);
    });

    it('includes Retry-After header from checkAndIncrement in the 429 response', async () => {
      rateLimiterMock.checkAndIncrement.mockResolvedValue({ allowed: false, retryAfter: 120 });

      const app = makeTestApp('sign-in', SIGN_IN_WINDOW_SECONDS);
      const res = await app.fetch(
        new Request('https://example.com/api/auth/sign-in/email', { method: 'POST' })
      );

      expect(res.headers.get('Retry-After')).toBe('120');
    });

    it('uses Retry-After: 60 as default when retryAfter is undefined', async () => {
      rateLimiterMock.checkAndIncrement.mockResolvedValue({ allowed: false });

      const app = makeTestApp('sign-in', SIGN_IN_WINDOW_SECONDS);
      const res = await app.fetch(
        new Request('https://example.com/api/auth/sign-in/email', { method: 'POST' })
      );

      expect(res.headers.get('Retry-After')).toBe('60');
    });

    it('returns JSON error body on 429', async () => {
      rateLimiterMock.checkAndIncrement.mockResolvedValue({ allowed: false, retryAfter: 60 });

      const app = makeTestApp('sign-in', SIGN_IN_WINDOW_SECONDS);
      const res = await app.fetch(
        new Request('https://example.com/api/auth/sign-in/email', { method: 'POST' })
      );

      expect(await res.json()).toEqual({ error: 'Too many requests' });
    });

    it('passes through to the downstream handler when checkAndIncrement allows the request', async () => {
      rateLimiterMock.checkAndIncrement.mockResolvedValue({ allowed: true });

      const app = makeTestApp('sign-in', SIGN_IN_WINDOW_SECONDS, 200);
      const res = await app.fetch(
        new Request('https://example.com/api/auth/sign-in/email', { method: 'POST' })
      );

      expect(res.status).toBe(200);
    });
  });

  describe('rate limit key and window', () => {
    it('calls checkAndIncrement with ratelimit:sign-in:<ip> and SIGN_IN_WINDOW_SECONDS', async () => {
      const app = makeTestApp('sign-in', SIGN_IN_WINDOW_SECONDS);
      await app.fetch(
        new Request('https://example.com/api/auth/sign-in/email', {
          method: 'POST',
          headers: { 'CF-Connecting-IP': '1.2.3.4' },
        })
      );

      expect(rateLimiterMock.checkAndIncrement).toHaveBeenCalledWith(
        'ratelimit:sign-in:1.2.3.4',
        SIGN_IN_WINDOW_SECONDS
      );
    });

    it('calls checkAndIncrement with ratelimit:register:<ip> and REGISTER_WINDOW_SECONDS', async () => {
      const app = makeTestApp('register', REGISTER_WINDOW_SECONDS);
      await app.fetch(
        new Request('https://example.com/api/auth/sign-up/email', {
          method: 'POST',
          headers: { 'CF-Connecting-IP': '5.6.7.8' },
        })
      );

      expect(rateLimiterMock.checkAndIncrement).toHaveBeenCalledWith(
        'ratelimit:register:5.6.7.8',
        REGISTER_WINDOW_SECONDS
      );
    });

    it('uses a UUID as ip key when CF-Connecting-IP is absent (unknown IP)', async () => {
      const app = makeTestApp('sign-in', SIGN_IN_WINDOW_SECONDS);
      await app.fetch(
        new Request('https://example.com/api/auth/sign-in/email', { method: 'POST' })
      );

      const [calledKey] = rateLimiterMock.checkAndIncrement.mock.calls[0] as [string, number];
      expect(calledKey).toMatch(
        /^ratelimit:sign-in:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
    });
  });

  describe('atomic operation: no separate check or increment calls', () => {
    it('never calls check() separately', async () => {
      const app = makeTestApp('sign-in', SIGN_IN_WINDOW_SECONDS);
      await app.fetch(
        new Request('https://example.com/api/auth/sign-in/email', {
          method: 'POST',
          headers: { 'CF-Connecting-IP': '1.2.3.4' },
        })
      );

      expect(rateLimiterMock.check).not.toHaveBeenCalled();
    });

    it('never calls increment() separately after a 4xx auth failure', async () => {
      const app = makeTestApp('sign-in', SIGN_IN_WINDOW_SECONDS, 401);
      await app.fetch(
        new Request('https://example.com/api/auth/sign-in/email', {
          method: 'POST',
          headers: { 'CF-Connecting-IP': '1.2.3.4' },
        })
      );

      expect(rateLimiterMock.increment).not.toHaveBeenCalled();
    });

    it('never calls increment() separately after a 200 success response', async () => {
      const app = makeTestApp('sign-in', SIGN_IN_WINDOW_SECONDS, 200);
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

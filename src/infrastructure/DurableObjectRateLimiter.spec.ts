import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  MAX_ATTEMPTS,
  REGISTER_WINDOW_SECONDS,
  SIGN_IN_WINDOW_SECONDS,
} from '../application/ports/RateLimiter';

import { DurableObjectRateLimiter } from './DurableObjectRateLimiter';

/** Fixed epoch timestamp used across all tests for deterministic assertions. */
const FIXED_NOW = 1_700_000_000_000;

/**
 * Serialises a check-endpoint response body as the DO would return it.
 *
 * @param count - The attempt count stored in the window.
 * @param resetAt - The epoch timestamp (ms) when the window resets.
 * @returns A JSON string matching the DO /check response format.
 */
function makeCheckResponse(count: number, resetAt: number): Response {
  return Response.json({ count, resetAt });
}

/**
 * Creates a partial DurableObjectNamespace mock with controllable stub responses.
 *
 * @returns Object with `namespace` (the mock namespace) and `stub` (the mock DO stub).
 */
function makeNamespaceMock(): {
  namespace: { idFromName: ReturnType<typeof vi.fn>; get: ReturnType<typeof vi.fn> };
  stub: { fetch: ReturnType<typeof vi.fn> };
} {
  const stub = {
    fetch: vi.fn().mockResolvedValue(Response.json(null)),
  };
  const namespace = {
    idFromName: vi.fn().mockReturnValue({ toString: (): string => 'mock-id' }),
    get: vi.fn().mockReturnValue(stub),
  };
  return { namespace, stub };
}

describe('DurableObjectRateLimiter', () => {
  let namespace: ReturnType<typeof makeNamespaceMock>['namespace'];
  let stub: ReturnType<typeof makeNamespaceMock>['stub'];
  let limiter: DurableObjectRateLimiter;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
    ({ namespace, stub } = makeNamespaceMock());
    limiter = new DurableObjectRateLimiter(namespace as unknown as DurableObjectNamespace);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('check', () => {
    it('returns allowed: true when DO returns null (no active window)', async () => {
      stub.fetch.mockResolvedValue(Response.json(null));

      const result = await limiter.check('ratelimit:sign-in:1.2.3.4', MAX_ATTEMPTS);

      expect(result).toEqual({ allowed: true });
    });

    it('returns allowed: true when count is below maxAttempts', async () => {
      stub.fetch.mockResolvedValue(makeCheckResponse(MAX_ATTEMPTS - 1, FIXED_NOW + 60_000));

      const result = await limiter.check('ratelimit:sign-in:1.2.3.4', MAX_ATTEMPTS);

      expect(result).toEqual({ allowed: true });
    });

    it('returns allowed: false with retryAfter when count equals maxAttempts', async () => {
      stub.fetch.mockResolvedValue(makeCheckResponse(MAX_ATTEMPTS, FIXED_NOW + 60_000));

      const result = await limiter.check('ratelimit:sign-in:1.2.3.4', MAX_ATTEMPTS);

      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBe(60);
    });

    it('returns allowed: false with retryAfter when count exceeds maxAttempts', async () => {
      stub.fetch.mockResolvedValue(makeCheckResponse(MAX_ATTEMPTS + 2, FIXED_NOW + 60_000));

      const result = await limiter.check('ratelimit:sign-in:1.2.3.4', MAX_ATTEMPTS);

      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBe(60);
    });

    it('returns retryAfter of at least 1 when window is nearly expired', async () => {
      // 500 ms remaining → Math.ceil(0.5) = 1
      stub.fetch.mockResolvedValue(makeCheckResponse(MAX_ATTEMPTS, FIXED_NOW + 500));

      const result = await limiter.check('ratelimit:sign-in:1.2.3.4', MAX_ATTEMPTS);

      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBe(1);
    });

    it('routes to the DO stub identified by the given key', async () => {
      const key = 'ratelimit:sign-in:1.2.3.4';

      await limiter.check(key, MAX_ATTEMPTS);

      expect(namespace.idFromName).toHaveBeenCalledWith(key);
      expect(namespace.get).toHaveBeenCalled();
    });

    it('fetches GET /check on the DO stub', async () => {
      await limiter.check('ratelimit:sign-in:1.2.3.4', MAX_ATTEMPTS);

      expect(stub.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/check'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('returns allowed: true when entry count is NaN (non-finite count treated as no window)', async () => {
      // NaN cannot survive JSON serialisation (becomes null), but can appear via in-memory
      // bugs or future arithmetic errors. Number.isFinite guards prevent silent bypass.
      stub.fetch.mockResolvedValue({
        json: vi.fn().mockResolvedValue({ count: NaN, resetAt: FIXED_NOW + 60_000 }),
      });

      const result = await limiter.check('ratelimit:sign-in:1.2.3.4', MAX_ATTEMPTS);

      expect(result).toEqual({ allowed: true });
    });

    it('returns allowed: true when entry resetAt is NaN (non-finite resetAt produces NaN retryAfter)', async () => {
      // If resetAt is NaN, Math.max(1, NaN) returns NaN — a corrupt retryAfter value.
      // The entry must be treated as invalid and discarded rather than forwarded.
      stub.fetch.mockResolvedValue({
        json: vi.fn().mockResolvedValue({ count: MAX_ATTEMPTS, resetAt: NaN }),
      });

      const result = await limiter.check('ratelimit:sign-in:1.2.3.4', MAX_ATTEMPTS);

      expect(result).toEqual({ allowed: true });
    });

    it('uses provided maxAttempts instead of hardcoded constant', async () => {
      const customMax = 10;
      // count is 7 — below customMax (10) but above MAX_ATTEMPTS (5)
      stub.fetch.mockResolvedValue(makeCheckResponse(7, FIXED_NOW + 60_000));

      const result = await limiter.check('ratelimit:sign-in-email:user@example.com', customMax);

      expect(result).toEqual({ allowed: true });
    });

    it('rejects when count reaches custom maxAttempts', async () => {
      const customMax = 10;
      stub.fetch.mockResolvedValue(makeCheckResponse(10, FIXED_NOW + 60_000));

      const result = await limiter.check('ratelimit:sign-in-email:user@example.com', customMax);

      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBe(60);
    });
  });

  describe('increment', () => {
    it('returns void after incrementing', async () => {
      stub.fetch.mockResolvedValue(new Response(null, { status: 204 }));

      const result = await limiter.increment('ratelimit:sign-in:1.2.3.4', SIGN_IN_WINDOW_SECONDS);

      expect(result).toBeUndefined();
    });

    it('routes to the DO stub identified by the given key', async () => {
      stub.fetch.mockResolvedValue(new Response(null, { status: 204 }));
      const key = 'ratelimit:register:9.9.9.9';

      await limiter.increment(key, REGISTER_WINDOW_SECONDS);

      expect(namespace.idFromName).toHaveBeenCalledWith(key);
      expect(namespace.get).toHaveBeenCalled();
    });

    it('sends POST /increment with ttlSeconds in the request body', async () => {
      stub.fetch.mockResolvedValue(new Response(null, { status: 204 }));

      await limiter.increment('ratelimit:sign-in:1.2.3.4', SIGN_IN_WINDOW_SECONDS);

      expect(stub.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/increment'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ ttlSeconds: SIGN_IN_WINDOW_SECONDS }),
        })
      );
    });
  });

  describe('checkAndIncrement', () => {
    it('returns allowed: true when DO returns allowed: true', async () => {
      stub.fetch.mockResolvedValue(Response.json({ allowed: true }));

      const result = await limiter.checkAndIncrement(
        'ratelimit:sign-in:1.2.3.4',
        SIGN_IN_WINDOW_SECONDS,
        MAX_ATTEMPTS
      );

      expect(result).toEqual({ allowed: true });
    });

    it('returns allowed: false with retryAfter when DO returns allowed: false', async () => {
      stub.fetch.mockResolvedValue(Response.json({ allowed: false, retryAfter: 60 }));

      const result = await limiter.checkAndIncrement(
        'ratelimit:sign-in:1.2.3.4',
        SIGN_IN_WINDOW_SECONDS,
        MAX_ATTEMPTS
      );

      expect(result).toEqual({ allowed: false, retryAfter: 60 });
    });

    it('returns allowed: false without retryAfter when DO omits retryAfter', async () => {
      stub.fetch.mockResolvedValue(Response.json({ allowed: false }));

      const result = await limiter.checkAndIncrement(
        'ratelimit:sign-in:1.2.3.4',
        SIGN_IN_WINDOW_SECONDS,
        MAX_ATTEMPTS
      );

      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeUndefined();
    });

    it('routes to the DO stub identified by the given key', async () => {
      stub.fetch.mockResolvedValue(Response.json({ allowed: true }));
      const key = 'ratelimit:sign-in:5.5.5.5';

      await limiter.checkAndIncrement(key, SIGN_IN_WINDOW_SECONDS, MAX_ATTEMPTS);

      expect(namespace.idFromName).toHaveBeenCalledWith(key);
      expect(namespace.get).toHaveBeenCalled();
    });

    it('sends POST /check-and-increment with ttlSeconds and maxAttempts in the request body', async () => {
      stub.fetch.mockResolvedValue(Response.json({ allowed: true }));

      await limiter.checkAndIncrement(
        'ratelimit:sign-in:1.2.3.4',
        SIGN_IN_WINDOW_SECONDS,
        MAX_ATTEMPTS
      );

      expect(stub.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/check-and-increment'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ ttlSeconds: SIGN_IN_WINDOW_SECONDS, maxAttempts: MAX_ATTEMPTS }),
        })
      );
    });

    it('passes custom maxAttempts to DO instead of hardcoded constant', async () => {
      stub.fetch.mockResolvedValue(Response.json({ allowed: true }));
      const customMax = 10;

      await limiter.checkAndIncrement('ratelimit:sign-in-email:user@example.com', 3600, customMax);

      expect(stub.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/check-and-increment'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ ttlSeconds: 3600, maxAttempts: customMax }),
        })
      );
    });
  });
});

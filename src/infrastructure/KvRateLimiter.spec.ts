import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  MAX_ATTEMPTS,
  REGISTER_WINDOW_SECONDS,
  SIGN_IN_WINDOW_SECONDS,
} from '../application/ports/RateLimiter';

import { KvRateLimiter } from './KvRateLimiter';

/** Fixed epoch timestamp used across all tests for deterministic assertions. */
const FIXED_NOW = 1_700_000_000_000;

/**
 * Creates a partial KVNamespace mock with controllable responses.
 *
 * @returns Object with `get` and `put` vi mock functions.
 */
function makeKvMock(): { get: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn> } {
  return {
    get: vi.fn().mockResolvedValue(null),
    put: vi.fn().mockResolvedValue(undefined),
  };
}

/**
 * Serializes a rate limit entry to the JSON format stored in KV.
 *
 * @param count - The attempt count to store.
 * @param resetAt - The epoch timestamp (ms) when the window resets.
 * @returns JSON string matching the KV storage format.
 */
function makeEntry(count: number, resetAt: number): string {
  return JSON.stringify({ count, resetAt });
}

describe('KvRateLimiter', () => {
  let kv: ReturnType<typeof makeKvMock>;
  let limiter: KvRateLimiter;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
    kv = makeKvMock();
    limiter = new KvRateLimiter(kv as unknown as KVNamespace);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('check', () => {
    it('returns allowed: true when key does not exist in KV', async () => {
      kv.get.mockResolvedValue(null);

      const result = await limiter.check('ratelimit:sign-in:1.2.3.4');

      expect(result).toEqual({ allowed: true });
    });

    it('passes the key directly to KV.get', async () => {
      const key = 'ratelimit:register:5.6.7.8';

      await limiter.check(key);

      expect(kv.get).toHaveBeenCalledWith(key);
    });

    it('returns allowed: true when count is below the limit', async () => {
      kv.get.mockResolvedValue(makeEntry(MAX_ATTEMPTS - 1, FIXED_NOW + 60_000));

      const result = await limiter.check('ratelimit:sign-in:1.2.3.4');

      expect(result).toEqual({ allowed: true });
    });

    it('returns allowed: false when count equals MAX_ATTEMPTS', async () => {
      kv.get.mockResolvedValue(makeEntry(MAX_ATTEMPTS, FIXED_NOW + 60_000));

      const result = await limiter.check('ratelimit:sign-in:1.2.3.4');

      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBe(60);
    });

    it('returns allowed: false when count exceeds MAX_ATTEMPTS', async () => {
      kv.get.mockResolvedValue(makeEntry(MAX_ATTEMPTS + 2, FIXED_NOW + 60_000));

      const result = await limiter.check('ratelimit:sign-in:1.2.3.4');

      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBe(60);
    });

    it('returns retryAfter of at least 1 when window is nearly expired', async () => {
      // 500 ms remaining → Math.ceil(0.5) = 1
      kv.get.mockResolvedValue(makeEntry(MAX_ATTEMPTS, FIXED_NOW + 500));

      const result = await limiter.check('ratelimit:sign-in:1.2.3.4');

      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBe(1);
    });

    it('returns allowed: true when entry is expired (resetAt in the past)', async () => {
      kv.get.mockResolvedValue(makeEntry(MAX_ATTEMPTS, FIXED_NOW - 1_000));

      const result = await limiter.check('ratelimit:sign-in:1.2.3.4');

      expect(result).toEqual({ allowed: true });
    });

    it('returns allowed: true when KV value is malformed JSON', async () => {
      kv.get.mockResolvedValue('not-valid-json{{{');

      const result = await limiter.check('ratelimit:sign-in:1.2.3.4');

      expect(result).toEqual({ allowed: true });
    });

    it('returns allowed: true when KV value is missing the count field', async () => {
      kv.get.mockResolvedValue(JSON.stringify({ resetAt: FIXED_NOW + 60_000 }));

      const result = await limiter.check('ratelimit:sign-in:1.2.3.4');

      expect(result).toEqual({ allowed: true });
    });

    it('returns allowed: true when KV value is missing the resetAt field', async () => {
      kv.get.mockResolvedValue(JSON.stringify({ count: 5 }));

      const result = await limiter.check('ratelimit:sign-in:1.2.3.4');

      expect(result).toEqual({ allowed: true });
    });
  });

  describe('increment', () => {
    it('creates a new entry with count 1 when key does not exist', async () => {
      kv.get.mockResolvedValue(null);

      await limiter.increment('ratelimit:sign-in:1.2.3.4', SIGN_IN_WINDOW_SECONDS);

      expect(kv.put).toHaveBeenCalledWith(
        'ratelimit:sign-in:1.2.3.4',
        JSON.stringify({ count: 1, resetAt: FIXED_NOW + SIGN_IN_WINDOW_SECONDS * 1000 }),
        { expirationTtl: SIGN_IN_WINDOW_SECONDS }
      );
    });

    it('increments count and preserves resetAt for an existing entry', async () => {
      const remainingMs = 300_000; // 300 seconds remaining
      const resetAt = FIXED_NOW + remainingMs;
      kv.get.mockResolvedValue(makeEntry(3, resetAt));

      await limiter.increment('ratelimit:sign-in:1.2.3.4', SIGN_IN_WINDOW_SECONDS);

      expect(kv.put).toHaveBeenCalledWith(
        'ratelimit:sign-in:1.2.3.4',
        JSON.stringify({ count: 4, resetAt }),
        { expirationTtl: 300 }
      );
    });

    it('uses at least 1 second TTL when entry is nearly expired', async () => {
      const resetAt = FIXED_NOW + 500; // 0.5 seconds remaining
      kv.get.mockResolvedValue(makeEntry(2, resetAt));

      await limiter.increment('ratelimit:sign-in:1.2.3.4', SIGN_IN_WINDOW_SECONDS);

      expect(kv.put).toHaveBeenCalledWith(
        'ratelimit:sign-in:1.2.3.4',
        JSON.stringify({ count: 3, resetAt }),
        { expirationTtl: 1 }
      );
    });

    it('treats an expired entry as a new key and resets the counter', async () => {
      const expiredResetAt = FIXED_NOW - 1_000;
      kv.get.mockResolvedValue(makeEntry(5, expiredResetAt));

      await limiter.increment('ratelimit:sign-in:1.2.3.4', SIGN_IN_WINDOW_SECONDS);

      expect(kv.put).toHaveBeenCalledWith(
        'ratelimit:sign-in:1.2.3.4',
        JSON.stringify({ count: 1, resetAt: FIXED_NOW + SIGN_IN_WINDOW_SECONDS * 1000 }),
        { expirationTtl: SIGN_IN_WINDOW_SECONDS }
      );
    });

    it('creates a register entry with REGISTER_WINDOW_SECONDS TTL', async () => {
      kv.get.mockResolvedValue(null);

      await limiter.increment('ratelimit:register:1.2.3.4', REGISTER_WINDOW_SECONDS);

      expect(kv.put).toHaveBeenCalledWith(
        'ratelimit:register:1.2.3.4',
        JSON.stringify({ count: 1, resetAt: FIXED_NOW + REGISTER_WINDOW_SECONDS * 1000 }),
        { expirationTtl: REGISTER_WINDOW_SECONDS }
      );
    });

    it('passes the key directly to KV.get and KV.put', async () => {
      kv.get.mockResolvedValue(null);
      const key = 'ratelimit:register:9.9.9.9';

      await limiter.increment(key, REGISTER_WINDOW_SECONDS);

      expect(kv.get).toHaveBeenCalledWith(key);
      expect(kv.put).toHaveBeenCalledWith(key, expect.any(String), expect.any(Object));
    });

    it('treats malformed JSON entry as a new key', async () => {
      kv.get.mockResolvedValue('bad-json');

      await limiter.increment('ratelimit:sign-in:1.2.3.4', SIGN_IN_WINDOW_SECONDS);

      expect(kv.put).toHaveBeenCalledWith(
        'ratelimit:sign-in:1.2.3.4',
        JSON.stringify({ count: 1, resetAt: FIXED_NOW + SIGN_IN_WINDOW_SECONDS * 1000 }),
        { expirationTtl: SIGN_IN_WINDOW_SECONDS }
      );
    });
  });
});

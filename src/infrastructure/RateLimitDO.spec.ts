import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MAX_ATTEMPTS, SIGN_IN_WINDOW_SECONDS } from '../domain/interfaces/RateLimiter';
import type { Env } from '../shared/env';

import { RateLimitDO } from './RateLimitDO';

/** Fixed epoch timestamp used across all tests for deterministic assertions. */
const FIXED_NOW = 1_700_000_000_000;

/**
 * Creates a minimal DurableObjectStorage mock with controllable responses.
 *
 * @returns Object with `get` and `put` vi mock functions.
 */
function makeStorageMock(): { get: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn> } {
  return {
    get: vi.fn().mockResolvedValue(undefined),
    put: vi.fn().mockResolvedValue(undefined),
  };
}

/**
 * Wraps a storage mock in a minimal DurableObjectState shape.
 *
 * @param storage - The storage mock to wrap.
 * @returns A DurableObjectState cast for use in tests.
 */
function makeState(storage: ReturnType<typeof makeStorageMock>): DurableObjectState {
  return { storage } as unknown as DurableObjectState;
}

describe('RateLimitDO', () => {
  let storage: ReturnType<typeof makeStorageMock>;
  let rateLimitDO: RateLimitDO;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
    storage = makeStorageMock();
    rateLimitDO = new RateLimitDO(makeState(storage), {} as unknown as Env);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('GET /check', () => {
    it('returns null when no entry exists in storage', async () => {
      storage.get.mockResolvedValue(undefined);

      const response = await rateLimitDO.fetch(new Request('https://do/check'));
      const result: unknown = await response.json();

      expect(response.status).toBe(200);
      expect(result).toBeNull();
    });

    it('returns the stored entry when it is within the active window', async () => {
      const entry = { count: 3, resetAt: FIXED_NOW + 60_000 };
      storage.get.mockResolvedValue(entry);

      const response = await rateLimitDO.fetch(new Request('https://do/check'));
      const result: unknown = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual(entry);
    });

    it('returns null when the stored entry is expired', async () => {
      const expiredEntry = { count: MAX_ATTEMPTS, resetAt: FIXED_NOW - 1_000 };
      storage.get.mockResolvedValue(expiredEntry);

      const response = await rateLimitDO.fetch(new Request('https://do/check'));
      const result: unknown = await response.json();

      expect(result).toBeNull();
    });

    it('reads from storage using the fixed key "entry"', async () => {
      await rateLimitDO.fetch(new Request('https://do/check'));

      expect(storage.get).toHaveBeenCalledWith('entry');
    });
  });

  describe('POST /increment', () => {
    it('creates a new entry with count 1 when no entry exists', async () => {
      storage.get.mockResolvedValue(undefined);

      const request = new Request('https://do/increment', {
        method: 'POST',
        body: JSON.stringify({ ttlSeconds: SIGN_IN_WINDOW_SECONDS }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await rateLimitDO.fetch(request);

      expect(response.status).toBe(204);
      expect(storage.put).toHaveBeenCalledWith('entry', {
        count: 1,
        resetAt: FIXED_NOW + SIGN_IN_WINDOW_SECONDS * 1000,
      });
    });

    it('increments count and preserves resetAt for an existing entry', async () => {
      const resetAt = FIXED_NOW + 300_000;
      storage.get.mockResolvedValue({ count: 3, resetAt });

      const request = new Request('https://do/increment', {
        method: 'POST',
        body: JSON.stringify({ ttlSeconds: SIGN_IN_WINDOW_SECONDS }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await rateLimitDO.fetch(request);

      expect(response.status).toBe(204);
      expect(storage.put).toHaveBeenCalledWith('entry', {
        count: 4,
        resetAt,
      });
    });

    it('resets counter to 1 with a fresh window when the existing entry is expired', async () => {
      storage.get.mockResolvedValue({ count: 5, resetAt: FIXED_NOW - 1_000 });

      const request = new Request('https://do/increment', {
        method: 'POST',
        body: JSON.stringify({ ttlSeconds: SIGN_IN_WINDOW_SECONDS }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await rateLimitDO.fetch(request);

      expect(response.status).toBe(204);
      expect(storage.put).toHaveBeenCalledWith('entry', {
        count: 1,
        resetAt: FIXED_NOW + SIGN_IN_WINDOW_SECONDS * 1000,
      });
    });

    it('reads from storage using the fixed key "entry"', async () => {
      const request = new Request('https://do/increment', {
        method: 'POST',
        body: JSON.stringify({ ttlSeconds: SIGN_IN_WINDOW_SECONDS }),
        headers: { 'Content-Type': 'application/json' },
      });

      await rateLimitDO.fetch(request);

      expect(storage.get).toHaveBeenCalledWith('entry');
    });
  });

  describe('POST /check-and-increment', () => {
    it('returns allowed: true and creates entry with count 1 when no entry exists', async () => {
      storage.get.mockResolvedValue(undefined);

      const request = new Request('https://do/check-and-increment', {
        method: 'POST',
        body: JSON.stringify({ ttlSeconds: SIGN_IN_WINDOW_SECONDS, maxAttempts: MAX_ATTEMPTS }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await rateLimitDO.fetch(request);
      const result: unknown = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual({ allowed: true });
      expect(storage.put).toHaveBeenCalledWith('entry', {
        count: 1,
        resetAt: FIXED_NOW + SIGN_IN_WINDOW_SECONDS * 1000,
      });
    });

    it('returns allowed: true and increments count when under the limit', async () => {
      const resetAt = FIXED_NOW + 300_000;
      storage.get.mockResolvedValue({ count: MAX_ATTEMPTS - 1, resetAt });

      const request = new Request('https://do/check-and-increment', {
        method: 'POST',
        body: JSON.stringify({ ttlSeconds: SIGN_IN_WINDOW_SECONDS, maxAttempts: MAX_ATTEMPTS }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await rateLimitDO.fetch(request);
      const result: unknown = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual({ allowed: true });
      expect(storage.put).toHaveBeenCalledWith('entry', {
        count: MAX_ATTEMPTS,
        resetAt,
      });
    });

    it('returns allowed: false with retryAfter and does not increment when limit is reached', async () => {
      const resetAt = FIXED_NOW + 60_000;
      storage.get.mockResolvedValue({ count: MAX_ATTEMPTS, resetAt });

      const request = new Request('https://do/check-and-increment', {
        method: 'POST',
        body: JSON.stringify({ ttlSeconds: SIGN_IN_WINDOW_SECONDS, maxAttempts: MAX_ATTEMPTS }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await rateLimitDO.fetch(request);
      const result: unknown = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual({ allowed: false, retryAfter: 60 });
      expect(storage.put).not.toHaveBeenCalled();
    });

    it('returns allowed: false with retryAfter and does not increment when limit is exceeded', async () => {
      const resetAt = FIXED_NOW + 500;
      storage.get.mockResolvedValue({ count: MAX_ATTEMPTS + 2, resetAt });

      const request = new Request('https://do/check-and-increment', {
        method: 'POST',
        body: JSON.stringify({ ttlSeconds: SIGN_IN_WINDOW_SECONDS, maxAttempts: MAX_ATTEMPTS }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await rateLimitDO.fetch(request);
      const result: unknown = await response.json();

      expect(result).toEqual({ allowed: false, retryAfter: 1 });
      expect(storage.put).not.toHaveBeenCalled();
    });

    it('returns allowed: true and resets counter when existing entry is expired', async () => {
      storage.get.mockResolvedValue({ count: MAX_ATTEMPTS, resetAt: FIXED_NOW - 1_000 });

      const request = new Request('https://do/check-and-increment', {
        method: 'POST',
        body: JSON.stringify({ ttlSeconds: SIGN_IN_WINDOW_SECONDS, maxAttempts: MAX_ATTEMPTS }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await rateLimitDO.fetch(request);
      const result: unknown = await response.json();

      expect(result).toEqual({ allowed: true });
      expect(storage.put).toHaveBeenCalledWith('entry', {
        count: 1,
        resetAt: FIXED_NOW + SIGN_IN_WINDOW_SECONDS * 1000,
      });
    });

    it('reads from storage using the fixed key "entry"', async () => {
      const request = new Request('https://do/check-and-increment', {
        method: 'POST',
        body: JSON.stringify({ ttlSeconds: SIGN_IN_WINDOW_SECONDS, maxAttempts: MAX_ATTEMPTS }),
        headers: { 'Content-Type': 'application/json' },
      });

      await rateLimitDO.fetch(request);

      expect(storage.get).toHaveBeenCalledWith('entry');
    });
  });

  describe('unknown routes', () => {
    it('returns 404 for an unknown path', async () => {
      const response = await rateLimitDO.fetch(new Request('https://do/unknown'));

      expect(response.status).toBe(404);
    });
  });
});

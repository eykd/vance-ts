import type { Logger } from '../../domain/interfaces/Logger';
import type { RateLimitConfig } from '../../domain/interfaces/RateLimiter';
import type { TimeProvider } from '../../domain/interfaces/TimeProvider';
import type { KVNamespace } from '../types/CloudflareTypes';

import { KVRateLimiter } from './KVRateLimiter';

/** Fixed timestamp for deterministic tests: 2025-06-01T00:00:00.000Z */
const BASE_TIME = 1748736000000;

/**
 * Creates a mock KV namespace for testing.
 *
 * @returns A mock KVNamespace with jest mocks
 */
function createMockKV(): KVNamespace & {
  get: jest.Mock<Promise<string | null>, [string]>;
  put: jest.Mock<Promise<void>, [string, string, unknown?]>;
  delete: jest.Mock<Promise<void>, [string]>;
} {
  return {
    get: jest.fn<Promise<string | null>, [string]>().mockResolvedValue(null),
    put: jest.fn<Promise<void>, [string, string, unknown?]>().mockResolvedValue(undefined),
    delete: jest.fn<Promise<void>, [string]>().mockResolvedValue(undefined),
  };
}

/**
 * Creates a mock Logger for testing.
 *
 * @returns A mock Logger with accessible jest mock references
 */
function createMockLogger(): {
  logger: Logger;
  warnMock: jest.Mock;
} {
  const warnMock = jest.fn();
  const logger: Logger = {
    info: jest.fn(),
    warn: warnMock,
    error: jest.fn(),
    security: jest.fn(),
  };
  return { logger, warnMock };
}

/**
 * Creates a mock TimeProvider returning a fixed timestamp.
 *
 * @param time - The fixed timestamp to return
 * @returns A mock TimeProvider
 */
function createMockTimeProvider(time: number = BASE_TIME): TimeProvider {
  return { now: jest.fn().mockReturnValue(time) };
}

/** Standard test config: 5 requests per 60s window. */
const TEST_CONFIG: RateLimitConfig = {
  maxRequests: 5,
  windowSeconds: 60,
};

/** Test config with block duration. */
const BLOCK_CONFIG: RateLimitConfig = {
  maxRequests: 3,
  windowSeconds: 60,
  blockDurationSeconds: 300,
};

describe('KVRateLimiter', () => {
  describe('checkLimit', () => {
    it('allows first request with correct remaining count', async () => {
      const kv = createMockKV();
      const { logger } = createMockLogger();
      const limiter = new KVRateLimiter(kv, logger, createMockTimeProvider());

      const result = await limiter.checkLimit('127.0.0.1', 'login', TEST_CONFIG);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.retryAfterSeconds).toBeNull();

      expect(kv.put).toHaveBeenCalledWith(
        'ratelimit:login:127.0.0.1',
        JSON.stringify({ requests: [BASE_TIME], blockedUntil: null }),
        { expirationTtl: 60 }
      );
    });

    it('allows multiple requests under limit', async () => {
      const kv = createMockKV();
      const { logger } = createMockLogger();
      const existingRequests = [BASE_TIME - 10000, BASE_TIME - 5000];
      kv.get.mockResolvedValue(JSON.stringify({ requests: existingRequests, blockedUntil: null }));
      const limiter = new KVRateLimiter(kv, logger, createMockTimeProvider());

      const result = await limiter.checkLimit('127.0.0.1', 'login', TEST_CONFIG);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it('denies request at limit', async () => {
      const kv = createMockKV();
      const { logger } = createMockLogger();
      const existingRequests = [
        BASE_TIME - 40000,
        BASE_TIME - 30000,
        BASE_TIME - 20000,
        BASE_TIME - 10000,
        BASE_TIME - 5000,
      ];
      kv.get.mockResolvedValue(JSON.stringify({ requests: existingRequests, blockedUntil: null }));
      const limiter = new KVRateLimiter(kv, logger, createMockTimeProvider());

      const result = await limiter.checkLimit('127.0.0.1', 'login', TEST_CONFIG);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfterSeconds).not.toBeNull();
    });

    it('evicts old requests outside the sliding window', async () => {
      const kv = createMockKV();
      const { logger } = createMockLogger();
      // 5 requests, but 3 are outside the 60s window
      const existingRequests = [
        BASE_TIME - 120000, // 2 min ago — outside window
        BASE_TIME - 90000, // 1.5 min ago — outside window
        BASE_TIME - 70000, // 70s ago — outside window
        BASE_TIME - 30000, // 30s ago — inside window
        BASE_TIME - 10000, // 10s ago — inside window
      ];
      kv.get.mockResolvedValue(JSON.stringify({ requests: existingRequests, blockedUntil: null }));
      const limiter = new KVRateLimiter(kv, logger, createMockTimeProvider());

      const result = await limiter.checkLimit('127.0.0.1', 'login', TEST_CONFIG);

      expect(result.allowed).toBe(true);
      // 2 existing in window + 1 new = 3, remaining = 5 - 3 = 2
      expect(result.remaining).toBe(2);
    });

    it('applies block duration when configured', async () => {
      const kv = createMockKV();
      const { logger } = createMockLogger();
      const existingRequests = [BASE_TIME - 30000, BASE_TIME - 20000, BASE_TIME - 10000];
      kv.get.mockResolvedValue(JSON.stringify({ requests: existingRequests, blockedUntil: null }));
      const limiter = new KVRateLimiter(kv, logger, createMockTimeProvider());

      const result = await limiter.checkLimit('127.0.0.1', 'login', BLOCK_CONFIG);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfterSeconds).toBe(300);

      // Verify block state saved to KV
      const putCall = kv.put.mock.calls[0];
      const savedState = JSON.parse(String(putCall?.[1])) as { blockedUntil: number };
      expect(savedState.blockedUntil).toBe(BASE_TIME + 300000);
    });

    it('immediately denies during block period', async () => {
      const kv = createMockKV();
      const { logger } = createMockLogger();
      kv.get.mockResolvedValue(JSON.stringify({ requests: [], blockedUntil: BASE_TIME + 200000 }));
      const limiter = new KVRateLimiter(kv, logger, createMockTimeProvider());

      const result = await limiter.checkLimit('127.0.0.1', 'login', BLOCK_CONFIG);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfterSeconds).toBe(200);
    });

    it('allows requests after block expires', async () => {
      const kv = createMockKV();
      const { logger } = createMockLogger();
      // Block expired 1 second ago
      kv.get.mockResolvedValue(JSON.stringify({ requests: [], blockedUntil: BASE_TIME - 1000 }));
      const limiter = new KVRateLimiter(kv, logger, createMockTimeProvider());

      const result = await limiter.checkLimit('127.0.0.1', 'login', BLOCK_CONFIG);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it('fails open and logs warning on KV read error', async () => {
      const kv = createMockKV();
      const { logger, warnMock } = createMockLogger();
      kv.get.mockRejectedValue(new Error('KV unavailable'));
      const limiter = new KVRateLimiter(kv, logger, createMockTimeProvider());

      const result = await limiter.checkLimit('127.0.0.1', 'login', TEST_CONFIG);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(5);
      expect(warnMock).toHaveBeenCalledWith(
        'Rate limiter KV read failed, failing open',
        expect.objectContaining({ action: 'login', ip: '127.0.0.1' })
      );
    });

    it('fails closed and logs warning on KV read error when failClosed is true', async () => {
      const kv = createMockKV();
      const { logger, warnMock } = createMockLogger();
      kv.get.mockRejectedValue(new Error('KV unavailable'));
      const limiter = new KVRateLimiter(kv, logger, createMockTimeProvider());
      const failClosedConfig: RateLimitConfig = { ...TEST_CONFIG, failClosed: true };

      const result = await limiter.checkLimit('127.0.0.1', 'login', failClosedConfig);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfterSeconds).toBeNull();
      expect(warnMock).toHaveBeenCalledWith(
        'Rate limiter KV read failed, failing closed',
        expect.objectContaining({ action: 'login', ip: '127.0.0.1' })
      );
    });

    it('logs warning on KV write error but still returns result', async () => {
      const kv = createMockKV();
      const { logger, warnMock } = createMockLogger();
      kv.put.mockRejectedValue(new Error('KV write failed'));
      const limiter = new KVRateLimiter(kv, logger, createMockTimeProvider());

      const result = await limiter.checkLimit('127.0.0.1', 'login', TEST_CONFIG);

      expect(result.allowed).toBe(true);
      expect(warnMock).toHaveBeenCalledWith(
        'Rate limiter KV write failed',
        expect.objectContaining({ action: 'login', ip: '127.0.0.1' })
      );
    });

    it('handles corrupt JSON by defaulting to empty state', async () => {
      const kv = createMockKV();
      const { logger } = createMockLogger();
      kv.get.mockResolvedValue('not-valid-json');
      const limiter = new KVRateLimiter(kv, logger, createMockTimeProvider());

      const result = await limiter.checkLimit('127.0.0.1', 'login', TEST_CONFIG);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('handles missing requests array by defaulting to empty', async () => {
      const kv = createMockKV();
      const { logger } = createMockLogger();
      kv.get.mockResolvedValue(JSON.stringify({ blockedUntil: null }));
      const limiter = new KVRateLimiter(kv, logger, createMockTimeProvider());

      const result = await limiter.checkLimit('127.0.0.1', 'login', TEST_CONFIG);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('logs warning on KV write error during block save', async () => {
      const kv = createMockKV();
      const { logger, warnMock } = createMockLogger();
      const existingRequests = [BASE_TIME - 30000, BASE_TIME - 20000, BASE_TIME - 10000];
      kv.get.mockResolvedValue(JSON.stringify({ requests: existingRequests, blockedUntil: null }));
      kv.put.mockRejectedValue(new Error('KV write failed'));
      const limiter = new KVRateLimiter(kv, logger, createMockTimeProvider());

      const result = await limiter.checkLimit('127.0.0.1', 'login', BLOCK_CONFIG);

      expect(result.allowed).toBe(false);
      expect(warnMock).toHaveBeenCalledWith(
        'Rate limiter KV write failed',
        expect.objectContaining({ action: 'login' })
      );
    });
  });

  describe('reset', () => {
    it('clears state for identifier and action', async () => {
      const kv = createMockKV();
      const { logger } = createMockLogger();
      const limiter = new KVRateLimiter(kv, logger, createMockTimeProvider());

      await limiter.reset('127.0.0.1', 'login');

      expect(kv.delete).toHaveBeenCalledWith('ratelimit:login:127.0.0.1');
    });

    it('allows requests after reset', async () => {
      const kv = createMockKV();
      const { logger } = createMockLogger();
      const limiter = new KVRateLimiter(kv, logger, createMockTimeProvider());

      // First, reset
      await limiter.reset('127.0.0.1', 'login');

      // Then make a request (KV returns null after delete)
      const result = await limiter.checkLimit('127.0.0.1', 'login', TEST_CONFIG);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });
  });
});

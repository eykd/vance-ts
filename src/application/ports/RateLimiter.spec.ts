import { describe, expect, it } from 'vitest';

import type { RateLimiter } from './RateLimiter';
import {
  MAX_ATTEMPTS,
  REGISTER_WINDOW_SECONDS,
  SIGN_IN_EMAIL_MAX_ATTEMPTS,
  SIGN_IN_EMAIL_WINDOW_SECONDS,
  SIGN_IN_WINDOW_SECONDS,
} from './RateLimiter';

/**
 * Contract tests for the RateLimiter port.
 *
 * Verifies the interface shape and exported policy constants.
 * Adapter tests (KvRateLimiter) live in src/infrastructure/KvRateLimiter.spec.ts.
 */
describe('RateLimiter port', () => {
  describe('interface contract', () => {
    it('can be satisfied by a test double with check returning allowed: true', async () => {
      const stub: RateLimiter = {
        check: (_key: string, _maxAttempts: number) => Promise.resolve({ allowed: true }),
        increment: (_key: string, _ttlSeconds: number): Promise<void> => Promise.resolve(),
        checkAndIncrement: (_key: string, _ttlSeconds: number) =>
          Promise.resolve({ allowed: true }),
      };

      const result = await stub.check('ratelimit:sign-in:1.2.3.4', MAX_ATTEMPTS);

      expect(result.allowed).toBe(true);
    });

    it('can be satisfied by a test double with check returning allowed: false', async () => {
      const stub: RateLimiter = {
        check: (_key: string, _maxAttempts: number) =>
          Promise.resolve({ allowed: false, retryAfter: 300 }),
        increment: (_key: string, _ttlSeconds: number): Promise<void> => Promise.resolve(),
        checkAndIncrement: (_key: string, _ttlSeconds: number) =>
          Promise.resolve({ allowed: true }),
      };

      const result = await stub.check('ratelimit:sign-in:1.2.3.4', MAX_ATTEMPTS);

      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBe(300);
    });

    it('increment resolves without a return value', async () => {
      const stub: RateLimiter = {
        check: (_key: string, _maxAttempts: number) => Promise.resolve({ allowed: true }),
        increment: (_key: string, _ttlSeconds: number): Promise<void> => Promise.resolve(),
        checkAndIncrement: (_key: string, _ttlSeconds: number) =>
          Promise.resolve({ allowed: true }),
      };

      await expect(stub.increment('ratelimit:sign-in:1.2.3.4', 900)).resolves.toBeUndefined();
    });

    it('checkAndIncrement resolves with allowed: true when under the limit', async () => {
      const stub: RateLimiter = {
        check: (_key: string, _maxAttempts: number) => Promise.resolve({ allowed: true }),
        increment: (_key: string, _ttlSeconds: number): Promise<void> => Promise.resolve(),
        checkAndIncrement: (_key: string, _ttlSeconds: number) =>
          Promise.resolve({ allowed: true }),
      };

      const result = await stub.checkAndIncrement('ratelimit:sign-in:1.2.3.4', 900);

      expect(result.allowed).toBe(true);
    });

    it('checkAndIncrement resolves with allowed: false and retryAfter when limit is exceeded', async () => {
      const stub: RateLimiter = {
        check: (_key: string, _maxAttempts: number) => Promise.resolve({ allowed: true }),
        increment: (_key: string, _ttlSeconds: number): Promise<void> => Promise.resolve(),
        checkAndIncrement: (_key: string, _ttlSeconds: number) =>
          Promise.resolve({ allowed: false, retryAfter: 300 }),
      };

      const result = await stub.checkAndIncrement('ratelimit:sign-in:1.2.3.4', 900);

      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBe(300);
    });
  });

  describe('policy constants', () => {
    it('MAX_ATTEMPTS is 5', () => {
      expect(MAX_ATTEMPTS).toBe(5);
    });

    it('SIGN_IN_WINDOW_SECONDS is 900 (15 minutes)', () => {
      expect(SIGN_IN_WINDOW_SECONDS).toBe(900);
    });

    it('REGISTER_WINDOW_SECONDS is 300 (5 minutes)', () => {
      expect(REGISTER_WINDOW_SECONDS).toBe(300);
    });

    it('SIGN_IN_EMAIL_MAX_ATTEMPTS is 10 (FR-006)', () => {
      expect(SIGN_IN_EMAIL_MAX_ATTEMPTS).toBe(10);
    });

    it('SIGN_IN_EMAIL_WINDOW_SECONDS is 3600 (60 minutes, FR-006)', () => {
      expect(SIGN_IN_EMAIL_WINDOW_SECONDS).toBe(3600);
    });
  });
});

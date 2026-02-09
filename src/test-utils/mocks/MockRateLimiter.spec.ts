import type { RateLimitConfig } from '../../domain/interfaces/RateLimiter';

import { MockRateLimiter } from './MockRateLimiter';

describe('MockRateLimiter', () => {
  let rateLimiter: MockRateLimiter;

  const testConfig: RateLimitConfig = {
    maxRequests: 5,
    windowSeconds: 60,
    blockDurationSeconds: 300,
  };

  beforeEach(() => {
    rateLimiter = new MockRateLimiter();
  });

  describe('checkLimit', () => {
    it('returns allowed: true by default', async () => {
      const result = await rateLimiter.checkLimit('user@example.com', 'login', testConfig);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);
      expect(result.retryAfterSeconds).toBeNull();
    });

    it('returns allowed: false when configured', async () => {
      rateLimiter.allowed = false;

      const result = await rateLimiter.checkLimit('user@example.com', 'login', testConfig);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('returns custom retryAfterSeconds when configured', async () => {
      rateLimiter.retryAfterSeconds = 120;

      const result = await rateLimiter.checkLimit('user@example.com', 'login', testConfig);

      expect(result.retryAfterSeconds).toBe(120);
    });

    it('records call in checkLimitCalls', async () => {
      await rateLimiter.checkLimit('user@example.com', 'login', testConfig);

      expect(rateLimiter.checkLimitCalls).toEqual([
        { identifier: 'user@example.com', action: 'login', config: testConfig },
      ]);
    });
  });

  describe('reset', () => {
    it('records call in resetCalls', async () => {
      await rateLimiter.reset('user@example.com', 'login');

      expect(rateLimiter.resetCalls).toEqual([{ identifier: 'user@example.com', action: 'login' }]);
    });
  });

  describe('call tracking', () => {
    it('accumulates calls across multiple invocations', async () => {
      await rateLimiter.checkLimit('user1@example.com', 'login', testConfig);
      await rateLimiter.checkLimit('user2@example.com', 'register', testConfig);
      await rateLimiter.reset('user1@example.com', 'login');
      await rateLimiter.reset('user2@example.com', 'register');

      expect(rateLimiter.checkLimitCalls).toEqual([
        { identifier: 'user1@example.com', action: 'login', config: testConfig },
        { identifier: 'user2@example.com', action: 'register', config: testConfig },
      ]);
      expect(rateLimiter.resetCalls).toEqual([
        { identifier: 'user1@example.com', action: 'login' },
        { identifier: 'user2@example.com', action: 'register' },
      ]);
    });
  });
});

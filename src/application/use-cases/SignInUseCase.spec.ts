import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthService } from '../ports/AuthService.js';
import type { RateLimiter } from '../ports/RateLimiter.js';
import { SIGN_IN_WINDOW_SECONDS } from '../ports/RateLimiter.js';
import { SignInUseCase } from './SignInUseCase.js';

/**
 * Creates a minimal AuthService mock with vi.fn() stubs.
 *
 * @returns An object with `vi.fn()` stubs for each AuthService method.
 */
function makeAuthServiceMock(): {
  signIn: ReturnType<typeof vi.fn>;
  signUp: ReturnType<typeof vi.fn>;
  signOut: ReturnType<typeof vi.fn>;
  getSession: ReturnType<typeof vi.fn>;
} {
  return {
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
  };
}

/**
 * Creates a minimal RateLimiter mock with vi.fn() stubs.
 *
 * @returns An object with `vi.fn()` stubs for `check` and `increment`.
 */
function makeRateLimiterMock(): {
  check: ReturnType<typeof vi.fn>;
  increment: ReturnType<typeof vi.fn>;
} {
  return {
    check: vi.fn(),
    increment: vi.fn(),
  };
}

describe('SignInUseCase', () => {
  let authServiceMock: ReturnType<typeof makeAuthServiceMock>;
  let rateLimiterMock: ReturnType<typeof makeRateLimiterMock>;
  let useCase: SignInUseCase;

  const defaultRequest = { email: 'user@example.com', password: 'correcthorse12', ip: '1.2.3.4' };

  beforeEach(() => {
    authServiceMock = makeAuthServiceMock();
    rateLimiterMock = makeRateLimiterMock();
    rateLimiterMock.check.mockResolvedValue({ allowed: true });
    rateLimiterMock.increment.mockResolvedValue(undefined);
    useCase = new SignInUseCase(
      authServiceMock as unknown as AuthService,
      rateLimiterMock as unknown as RateLimiter
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('execute', () => {
    it('returns ok: true with sessionCookie when sign-in succeeds', async () => {
      const sessionCookieValue = '__Host-better-auth.session-token=abc123; Path=/; HttpOnly';
      authServiceMock.signIn.mockResolvedValue({ ok: true, sessionCookie: sessionCookieValue });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.sessionCookie).toBe(sessionCookieValue);
      }
    });

    it('returns ok: false kind: rate_limited with retryAfter when KV rate limit is exceeded', async () => {
      rateLimiterMock.check.mockResolvedValue({ allowed: false, retryAfter: 900 });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('rate_limited');
        expect(result.retryAfter).toBe(900);
      }
    });

    it('returns ok: false kind: rate_limited without retryAfter when KV check omits Retry-After', async () => {
      rateLimiterMock.check.mockResolvedValue({ allowed: false });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('rate_limited');
        expect(result.retryAfter).toBeUndefined();
      }
    });

    it('does not call authService.signIn when rate limit is exceeded', async () => {
      rateLimiterMock.check.mockResolvedValue({ allowed: false, retryAfter: 900 });

      await useCase.execute(defaultRequest);

      expect(authServiceMock.signIn).not.toHaveBeenCalled();
    });

    it('returns ok: false kind: invalid_credentials when auth returns invalid_credentials', async () => {
      authServiceMock.signIn.mockResolvedValue({ ok: false, kind: 'invalid_credentials' });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('invalid_credentials');
      }
    });

    it('increments rate limiter with correct key and window on invalid_credentials', async () => {
      authServiceMock.signIn.mockResolvedValue({ ok: false, kind: 'invalid_credentials' });

      await useCase.execute({ ...defaultRequest, ip: '5.6.7.8' });

      expect(rateLimiterMock.increment).toHaveBeenCalledWith(
        'ratelimit:sign-in:5.6.7.8',
        SIGN_IN_WINDOW_SECONDS
      );
    });

    it('returns ok: false kind: rate_limited with retryAfter when auth service returns rate_limited', async () => {
      authServiceMock.signIn.mockResolvedValue({ ok: false, kind: 'rate_limited', retryAfter: 300 });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('rate_limited');
        expect(result.retryAfter).toBe(300);
      }
    });

    it('returns ok: false kind: service_error when auth returns service_error', async () => {
      authServiceMock.signIn.mockResolvedValue({ ok: false, kind: 'service_error' });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('does not increment rate limiter on successful sign-in', async () => {
      authServiceMock.signIn.mockResolvedValue({ ok: true, sessionCookie: 'abc' });

      await useCase.execute(defaultRequest);

      expect(rateLimiterMock.increment).not.toHaveBeenCalled();
    });

    it('does not increment rate limiter on service_error', async () => {
      authServiceMock.signIn.mockResolvedValue({ ok: false, kind: 'service_error' });

      await useCase.execute(defaultRequest);

      expect(rateLimiterMock.increment).not.toHaveBeenCalled();
    });

    it('does not increment rate limiter when auth service returns rate_limited', async () => {
      authServiceMock.signIn.mockResolvedValue({ ok: false, kind: 'rate_limited', retryAfter: 300 });

      await useCase.execute(defaultRequest);

      expect(rateLimiterMock.increment).not.toHaveBeenCalled();
    });

    it('checks rate limiter with key ratelimit:sign-in:{ip}', async () => {
      authServiceMock.signIn.mockResolvedValue({ ok: true, sessionCookie: 'abc' });

      await useCase.execute({ email: 'user@example.com', password: 'password12', ip: '9.8.7.6' });

      expect(rateLimiterMock.check).toHaveBeenCalledWith('ratelimit:sign-in:9.8.7.6');
    });

    it('calls authService.signIn with email, password, and ip', async () => {
      authServiceMock.signIn.mockResolvedValue({ ok: true, sessionCookie: 'abc' });

      await useCase.execute(defaultRequest);

      expect(authServiceMock.signIn).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'correcthorse12',
        ip: '1.2.3.4',
      });
    });
  });
});

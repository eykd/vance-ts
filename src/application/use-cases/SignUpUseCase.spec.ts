import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthService } from '../ports/AuthService.js';
import type { RateLimiter } from '../ports/RateLimiter.js';
import { REGISTER_WINDOW_SECONDS } from '../ports/RateLimiter.js';

import { SignUpUseCase } from './SignUpUseCase.js';

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

describe('SignUpUseCase', () => {
  let authServiceMock: ReturnType<typeof makeAuthServiceMock>;
  let rateLimiterMock: ReturnType<typeof makeRateLimiterMock>;
  let useCase: SignUpUseCase;

  const defaultRequest = { email: 'user@example.com', password: 'correcthorse12', ip: '1.2.3.4' };

  beforeEach(() => {
    authServiceMock = makeAuthServiceMock();
    rateLimiterMock = makeRateLimiterMock();
    rateLimiterMock.check.mockResolvedValue({ allowed: true });
    rateLimiterMock.increment.mockResolvedValue(undefined);
    authServiceMock.signUp.mockResolvedValue({ ok: true });
    useCase = new SignUpUseCase(
      authServiceMock as unknown as AuthService,
      rateLimiterMock as unknown as RateLimiter
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('execute', () => {
    it('returns ok: true when authService.signUp succeeds', async () => {
      authServiceMock.signUp.mockResolvedValue({ ok: true });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(true);
    });

    it('returns ok: false kind: rate_limited with retryAfter when KV rate limit is exceeded', async () => {
      rateLimiterMock.check.mockResolvedValue({ allowed: false, retryAfter: 300 });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('rate_limited');
        expect(result.retryAfter).toBe(300);
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

    it('does not call authService.signUp when rate limit is exceeded', async () => {
      rateLimiterMock.check.mockResolvedValue({ allowed: false, retryAfter: 300 });

      await useCase.execute(defaultRequest);

      expect(authServiceMock.signUp).not.toHaveBeenCalled();
    });

    it('returns ok: false kind: email_taken when authService returns email_taken', async () => {
      authServiceMock.signUp.mockResolvedValue({ ok: false, kind: 'email_taken' });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('email_taken');
      }
    });

    it('returns ok: false kind: weak_password when authService returns weak_password', async () => {
      authServiceMock.signUp.mockResolvedValue({ ok: false, kind: 'weak_password' });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('weak_password');
      }
    });

    it('returns ok: false kind: rate_limited when authService returns rate_limited', async () => {
      authServiceMock.signUp.mockResolvedValue({ ok: false, kind: 'rate_limited' });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('rate_limited');
      }
    });

    it('returns ok: false kind: service_error when authService returns service_error', async () => {
      authServiceMock.signUp.mockResolvedValue({ ok: false, kind: 'service_error' });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('returns ok: false kind: password_too_common when authService returns password_too_common', async () => {
      authServiceMock.signUp.mockResolvedValue({ ok: false, kind: 'password_too_common' });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('password_too_common');
      }
    });

    it('returns ok: false kind: service_error when authService.signUp throws', async () => {
      authServiceMock.signUp.mockRejectedValue(new Error('DB unavailable'));

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('returns ok: false kind: service_error when rateLimiter.check throws', async () => {
      rateLimiterMock.check.mockRejectedValue(new Error('KV unavailable'));

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('increments rate limiter with correct key and window on email_taken', async () => {
      authServiceMock.signUp.mockResolvedValue({ ok: false, kind: 'email_taken' });

      await useCase.execute({ ...defaultRequest, ip: '5.6.7.8' });

      expect(rateLimiterMock.increment).toHaveBeenCalledWith(
        'ratelimit:register:5.6.7.8',
        REGISTER_WINDOW_SECONDS
      );
    });

    it('increments rate limiter with correct key and window on weak_password', async () => {
      authServiceMock.signUp.mockResolvedValue({ ok: false, kind: 'weak_password' });

      await useCase.execute({ ...defaultRequest, ip: '5.6.7.8' });

      expect(rateLimiterMock.increment).toHaveBeenCalledWith(
        'ratelimit:register:5.6.7.8',
        REGISTER_WINDOW_SECONDS
      );
    });

    it('does not increment rate limiter on successful sign-up', async () => {
      authServiceMock.signUp.mockResolvedValue({ ok: true });

      await useCase.execute(defaultRequest);

      expect(rateLimiterMock.increment).not.toHaveBeenCalled();
    });

    it('does not increment rate limiter on service_error', async () => {
      authServiceMock.signUp.mockResolvedValue({ ok: false, kind: 'service_error' });

      await useCase.execute(defaultRequest);

      expect(rateLimiterMock.increment).not.toHaveBeenCalled();
    });

    it('does not increment rate limiter on password_too_common', async () => {
      authServiceMock.signUp.mockResolvedValue({ ok: false, kind: 'password_too_common' });

      await useCase.execute(defaultRequest);

      expect(rateLimiterMock.increment).not.toHaveBeenCalled();
    });

    it('does not increment rate limiter when authService returns rate_limited', async () => {
      authServiceMock.signUp.mockResolvedValue({ ok: false, kind: 'rate_limited' });

      await useCase.execute(defaultRequest);

      expect(rateLimiterMock.increment).not.toHaveBeenCalled();
    });

    it('checks rate limiter with key ratelimit:register:{ip}', async () => {
      await useCase.execute({
        email: 'user@example.com',
        password: 'correcthorse12',
        ip: '9.8.7.6',
      });

      expect(rateLimiterMock.check).toHaveBeenCalledWith('ratelimit:register:9.8.7.6');
    });

    it('calls authService.signUp with email, password, name derived from email prefix, and ip', async () => {
      await useCase.execute({
        email: 'alice@example.com',
        password: 'correcthorse12',
        ip: '1.2.3.4',
      });

      expect(authServiceMock.signUp).toHaveBeenCalledWith({
        email: 'alice@example.com',
        password: 'correcthorse12',
        name: 'alice',
        ip: '1.2.3.4',
      });
    });
  });
});

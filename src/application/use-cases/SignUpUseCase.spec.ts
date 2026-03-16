import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  verifyDummyPassword: ReturnType<typeof vi.fn>;
} {
  return {
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    verifyDummyPassword: vi.fn().mockResolvedValue(undefined),
  };
}

/**
 * Creates a minimal RateLimiter mock with vi.fn() stubs.
 *
 * @returns An object with `vi.fn()` stubs for each RateLimiter method.
 */
function makeRateLimiterMock(): {
  check: ReturnType<typeof vi.fn>;
  increment: ReturnType<typeof vi.fn>;
  checkAndIncrement: ReturnType<typeof vi.fn>;
} {
  return {
    check: vi.fn(),
    increment: vi.fn(),
    checkAndIncrement: vi.fn(),
  };
}

describe('SignUpUseCase', () => {
  let authServiceMock: ReturnType<typeof makeAuthServiceMock>;
  let rateLimiterMock: ReturnType<typeof makeRateLimiterMock>;
  let useCase: SignUpUseCase;

  const defaultRequest = Object.freeze({
    email: 'user@example.com',
    password: 'correcthorse12',
    ip: '1.2.3.4',
  });

  beforeEach(() => {
    authServiceMock = makeAuthServiceMock();
    rateLimiterMock = makeRateLimiterMock();
    rateLimiterMock.checkAndIncrement.mockResolvedValue({ allowed: true });
    authServiceMock.signUp.mockResolvedValue({ ok: true });
    useCase = new SignUpUseCase(authServiceMock, rateLimiterMock as unknown as RateLimiter);
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

    it('returns ok: false kind: rate_limited with retryAfter when rate limit is exceeded', async () => {
      expect.assertions(3);
      rateLimiterMock.checkAndIncrement.mockResolvedValue({ allowed: false, retryAfter: 300 });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('rate_limited');
        expect(result.retryAfter).toBe(300);
      }
    });

    it('returns ok: false kind: rate_limited without retryAfter when checkAndIncrement omits retryAfter', async () => {
      expect.assertions(3);
      rateLimiterMock.checkAndIncrement.mockResolvedValue({ allowed: false });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('rate_limited');
        expect(result.retryAfter).toBeUndefined();
      }
    });

    it('does not call authService.signUp when rate limit is exceeded', async () => {
      rateLimiterMock.checkAndIncrement.mockResolvedValue({ allowed: false, retryAfter: 300 });

      await useCase.execute(defaultRequest);

      expect(authServiceMock.signUp).not.toHaveBeenCalled();
    });

    it('returns ok: false kind: email_taken when authService returns email_taken', async () => {
      expect.assertions(2);
      authServiceMock.signUp.mockResolvedValue({ ok: false, kind: 'email_taken' });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('email_taken');
      }
    });

    it('returns ok: false kind: weak_password when authService returns weak_password', async () => {
      expect.assertions(2);
      authServiceMock.signUp.mockResolvedValue({ ok: false, kind: 'weak_password' });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('weak_password');
      }
    });

    it('returns ok: false kind: rate_limited when authService returns rate_limited', async () => {
      expect.assertions(2);
      authServiceMock.signUp.mockResolvedValue({ ok: false, kind: 'rate_limited' });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('rate_limited');
      }
    });

    it('returns ok: false kind: service_error when authService returns service_error', async () => {
      expect.assertions(2);
      authServiceMock.signUp.mockResolvedValue({ ok: false, kind: 'service_error' });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('returns ok: false kind: password_too_common when password is in the common-password blocklist', async () => {
      expect.assertions(3);
      // 'password1234' is in COMMON_PASSWORDS and is 12 chars (meets auth length minimum).
      // The use case must short-circuit before calling authService.signUp.
      const result = await useCase.execute({ ...defaultRequest, password: 'password1234' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('password_too_common');
      }
      expect(authServiceMock.signUp).not.toHaveBeenCalled();
    });

    it('returns ok: false kind: service_error when authService.signUp throws', async () => {
      expect.assertions(2);
      authServiceMock.signUp.mockRejectedValue(new Error('DB unavailable'));

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('logs the error via console.error when authService.signUp throws', async () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('DB unavailable');
      authServiceMock.signUp.mockRejectedValue(error);

      await useCase.execute(defaultRequest);

      expect(spy).toHaveBeenCalledWith('SignUpUseCase: unexpected error during sign-up', error);
      spy.mockRestore();
    });

    it('returns ok: false kind: service_error when rateLimiter.checkAndIncrement throws', async () => {
      expect.assertions(2);
      rateLimiterMock.checkAndIncrement.mockRejectedValue(new Error('DO unavailable'));

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('logs the error via console.error when rateLimiter.checkAndIncrement throws', async () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('DO unavailable');
      rateLimiterMock.checkAndIncrement.mockRejectedValue(error);

      await useCase.execute(defaultRequest);

      expect(spy).toHaveBeenCalledWith('SignUpUseCase: unexpected error during sign-up', error);
      spy.mockRestore();
    });

    it('calls checkAndIncrement with key ratelimit:register:{ip} and REGISTER_WINDOW_SECONDS', async () => {
      await useCase.execute({
        email: 'user@example.com',
        password: 'correcthorse12',
        ip: '9.8.7.6',
      });

      expect(rateLimiterMock.checkAndIncrement).toHaveBeenCalledWith(
        'ratelimit:register:9.8.7.6',
        REGISTER_WINDOW_SECONDS
      );
    });

    it('uses shared sentinel key when IP is unknown so rate limiting is not bypassed', async () => {
      await useCase.execute({ ...defaultRequest, ip: 'unknown' });

      expect(rateLimiterMock.checkAndIncrement).toHaveBeenCalledWith(
        'ratelimit:register:unknown',
        REGISTER_WINDOW_SECONDS
      );
    });

    it('calls authService.signUp with email, password, and name derived from email prefix', async () => {
      await useCase.execute({
        email: 'alice@example.com',
        password: 'correcthorse12',
        ip: '1.2.3.4',
      });

      expect(authServiceMock.signUp).toHaveBeenCalledWith({
        email: 'alice@example.com',
        password: 'correcthorse12',
        name: 'alice',
      });
    });

    it('falls back to full email as name when email prefix is empty (e.g. @domain.com)', async () => {
      await useCase.execute({
        email: '@domain.com',
        password: 'correcthorse12',
        ip: '1.2.3.4',
      });

      expect(authServiceMock.signUp).toHaveBeenCalledWith({
        email: '@domain.com',
        password: 'correcthorse12',
        name: '@domain.com',
      });
    });
  });
});

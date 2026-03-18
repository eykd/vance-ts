import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthService } from '../ports/AuthService.js';
import type { Logger } from '../ports/Logger.js';
import type { RateLimiter } from '../ports/RateLimiter.js';
import { MAX_ATTEMPTS, REGISTER_WINDOW_SECONDS } from '../ports/RateLimiter.js';

import { SignUpUseCase } from './SignUpUseCase.js';

/**
 * Creates an AuthService mock with only the method SignUpUseCase calls.
 *
 * @returns An object with a `vi.fn()` stub for signUp.
 */
function makeAuthServiceMock(): {
  signUp: ReturnType<typeof vi.fn>;
} {
  return {
    signUp: vi.fn(),
  };
}

/**
 * Creates a RateLimiter mock with only the method SignUpUseCase calls.
 *
 * @returns An object with a `vi.fn()` stub for checkAndIncrement.
 */
function makeRateLimiterMock(): {
  checkAndIncrement: ReturnType<typeof vi.fn>;
} {
  return {
    checkAndIncrement: vi.fn(),
  };
}

/**
 * Creates a Logger mock with only the method SignUpUseCase calls.
 *
 * @returns An object with a `vi.fn()` stub for error.
 */
function makeLoggerMock(): {
  error: ReturnType<typeof vi.fn>;
} {
  return {
    error: vi.fn(),
  };
}

describe('SignUpUseCase', () => {
  let authServiceMock: ReturnType<typeof makeAuthServiceMock>;
  let rateLimiterMock: ReturnType<typeof makeRateLimiterMock>;
  let loggerMock: ReturnType<typeof makeLoggerMock>;
  let useCase: SignUpUseCase;

  const defaultRequest = Object.freeze({
    email: 'user@example.com',
    password: 'correcthorse12',
    ip: '1.2.3.4',
  });

  beforeEach(() => {
    authServiceMock = makeAuthServiceMock();
    rateLimiterMock = makeRateLimiterMock();
    loggerMock = makeLoggerMock();
    rateLimiterMock.checkAndIncrement.mockResolvedValue({ allowed: true });
    authServiceMock.signUp.mockResolvedValue({ ok: true });
    useCase = new SignUpUseCase(
      authServiceMock as unknown as AuthService,
      rateLimiterMock as unknown as RateLimiter,
      loggerMock as Logger
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

    it('returns ok: false kind: rate_limited with retryAfter when rate limit is exceeded', async () => {
      expect.assertions(2);
      rateLimiterMock.checkAndIncrement.mockResolvedValue({ allowed: false, retryAfter: 300 });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok && result.kind === 'rate_limited') {
        expect(result.retryAfter).toBe(300);
      }
    });

    it('returns ok: false kind: rate_limited without retryAfter when checkAndIncrement omits retryAfter', async () => {
      expect.assertions(2);
      rateLimiterMock.checkAndIncrement.mockResolvedValue({ allowed: false });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok && result.kind === 'rate_limited') {
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

    it('logs the error via Logger.error when authService.signUp throws', async () => {
      const error = new Error('DB unavailable');
      authServiceMock.signUp.mockRejectedValue(error);

      await useCase.execute(defaultRequest);

      expect(loggerMock.error).toHaveBeenCalledWith(
        'SignUpUseCase: unexpected error during sign-up',
        error
      );
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

    it('logs the error via Logger.error when rateLimiter.checkAndIncrement throws', async () => {
      const error = new Error('DO unavailable');
      rateLimiterMock.checkAndIncrement.mockRejectedValue(error);

      await useCase.execute(defaultRequest);

      expect(loggerMock.error).toHaveBeenCalledWith(
        'SignUpUseCase: unexpected error during sign-up',
        error
      );
    });

    it('calls checkAndIncrement with key ratelimit:register:{ip} and REGISTER_WINDOW_SECONDS', async () => {
      await useCase.execute({
        email: 'user@example.com',
        password: 'correcthorse12',
        ip: '9.8.7.6',
      });

      expect(rateLimiterMock.checkAndIncrement).toHaveBeenCalledWith(
        'ratelimit:register:9.8.7.6',
        REGISTER_WINDOW_SECONDS,
        MAX_ATTEMPTS
      );
    });

    it('uses shared sentinel key when IP is unknown so rate limiting is not bypassed', async () => {
      await useCase.execute({ ...defaultRequest, ip: 'unknown' });

      expect(rateLimiterMock.checkAndIncrement).toHaveBeenCalledWith(
        'ratelimit:register:unknown',
        REGISTER_WINDOW_SECONDS,
        MAX_ATTEMPTS
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

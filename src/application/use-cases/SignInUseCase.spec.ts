import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthService } from '../ports/AuthService.js';
import type { Logger } from '../ports/Logger.js';
import type { RateLimiter } from '../ports/RateLimiter.js';
import {
  MAX_ATTEMPTS,
  SIGN_IN_EMAIL_MAX_ATTEMPTS,
  SIGN_IN_EMAIL_WINDOW_SECONDS,
  SIGN_IN_WINDOW_SECONDS,
} from '../ports/RateLimiter.js';

import { SignInUseCase } from './SignInUseCase.js';

/**
 * Creates an AuthService mock with only the methods SignInUseCase calls.
 *
 * @returns An object with `vi.fn()` stubs for signIn and verifyDummyPassword.
 */
function makeAuthServiceMock(): {
  signIn: ReturnType<typeof vi.fn>;
  verifyDummyPassword: ReturnType<typeof vi.fn>;
} {
  return {
    signIn: vi.fn(),
    verifyDummyPassword: vi.fn().mockResolvedValue(undefined),
  };
}

/**
 * Creates a RateLimiter mock with the methods SignInUseCase calls.
 *
 * @returns An object with `vi.fn()` stubs for check, increment, and checkAndIncrement.
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

/**
 * Creates a Logger mock with only the method SignInUseCase calls.
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

describe('SignInUseCase', () => {
  let authServiceMock: ReturnType<typeof makeAuthServiceMock>;
  let rateLimiterMock: ReturnType<typeof makeRateLimiterMock>;
  let loggerMock: ReturnType<typeof makeLoggerMock>;
  let useCase: SignInUseCase;

  const defaultRequest = Object.freeze({
    email: 'user@example.com',
    password: 'correcthorse12',
    ip: '1.2.3.4',
  });

  beforeEach(() => {
    authServiceMock = makeAuthServiceMock();
    rateLimiterMock = makeRateLimiterMock();
    loggerMock = makeLoggerMock();
    rateLimiterMock.check.mockResolvedValue({ allowed: true });
    rateLimiterMock.increment.mockResolvedValue(undefined);
    rateLimiterMock.checkAndIncrement.mockResolvedValue({ allowed: true });
    useCase = new SignInUseCase(
      authServiceMock as unknown as AuthService,
      rateLimiterMock as unknown as RateLimiter,
      loggerMock as Logger
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('execute', () => {
    it('returns ok: true with sessionToken when sign-in succeeds', async () => {
      expect.assertions(2);
      authServiceMock.signIn.mockResolvedValue({ ok: true, sessionToken: 'abc123' });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.sessionToken).toBe('abc123');
      }
    });

    it('returns ok: false kind: rate_limited with retryAfter when rate limit is exceeded', async () => {
      expect.assertions(3);
      rateLimiterMock.checkAndIncrement.mockResolvedValue({ allowed: false, retryAfter: 900 });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('rate_limited');
        expect(result.retryAfter).toBe(900);
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

    it('returns rate_limited when IP rate limit is exceeded but email rate limit passes', async () => {
      expect.assertions(3);
      // First call (email): allowed
      rateLimiterMock.checkAndIncrement.mockResolvedValueOnce({ allowed: true });
      // Second call (IP): blocked
      rateLimiterMock.checkAndIncrement.mockResolvedValueOnce({ allowed: false, retryAfter: 600 });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('rate_limited');
        expect(result.retryAfter).toBe(600);
      }
    });

    it('does not call authService.signIn when rate limit is exceeded', async () => {
      rateLimiterMock.checkAndIncrement.mockResolvedValue({ allowed: false, retryAfter: 900 });

      await useCase.execute(defaultRequest);

      expect(authServiceMock.signIn).not.toHaveBeenCalled();
    });

    it('returns ok: false kind: invalid_credentials when auth returns invalid_credentials', async () => {
      expect.assertions(2);
      authServiceMock.signIn.mockResolvedValue({ ok: false, kind: 'invalid_credentials' });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('invalid_credentials');
      }
    });

    it('returns ok: false kind: rate_limited with retryAfter when auth service returns rate_limited', async () => {
      expect.assertions(3);
      authServiceMock.signIn.mockResolvedValue({
        ok: false,
        kind: 'rate_limited',
        retryAfter: 300,
      });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('rate_limited');
        expect(result.retryAfter).toBe(300);
      }
    });

    it('returns ok: false kind: service_error when auth returns service_error', async () => {
      expect.assertions(2);
      authServiceMock.signIn.mockResolvedValue({ ok: false, kind: 'service_error' });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('calls checkAndIncrement with key ratelimit:sign-in:{ip} and SIGN_IN_WINDOW_SECONDS and MAX_ATTEMPTS', async () => {
      authServiceMock.signIn.mockResolvedValue({ ok: true, sessionToken: 'abc' });

      await useCase.execute({ email: 'user@example.com', password: 'password12', ip: '9.8.7.6' });

      expect(rateLimiterMock.checkAndIncrement).toHaveBeenCalledWith(
        'ratelimit:sign-in:9.8.7.6',
        SIGN_IN_WINDOW_SECONDS,
        MAX_ATTEMPTS
      );
    });

    it('calls authService.signIn with email and password', async () => {
      authServiceMock.signIn.mockResolvedValue({ ok: true, sessionToken: 'abc' });

      await useCase.execute(defaultRequest);

      expect(authServiceMock.signIn).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'correcthorse12',
      });
    });

    it('calls authService.verifyDummyPassword with submitted password on invalid_credentials (FR-007)', async () => {
      authServiceMock.signIn.mockResolvedValue({ ok: false, kind: 'invalid_credentials' });

      await useCase.execute({ ...defaultRequest, password: 'wrongpassword12' });

      expect(authServiceMock.verifyDummyPassword).toHaveBeenCalledWith('wrongpassword12');
    });

    it('calls authService.verifyDummyPassword with submitted password on service_error (FR-007)', async () => {
      authServiceMock.signIn.mockResolvedValue({ ok: false, kind: 'service_error' });

      await useCase.execute({ ...defaultRequest, password: 'somepassword12' });

      expect(authServiceMock.verifyDummyPassword).toHaveBeenCalledWith('somepassword12');
    });

    it('does not call authService.verifyDummyPassword on successful sign-in', async () => {
      authServiceMock.signIn.mockResolvedValue({ ok: true, sessionToken: 'abc' });

      await useCase.execute(defaultRequest);

      expect(authServiceMock.verifyDummyPassword).not.toHaveBeenCalled();
    });

    it('does not call authService.verifyDummyPassword when rate limit is exceeded', async () => {
      rateLimiterMock.checkAndIncrement.mockResolvedValue({ allowed: false, retryAfter: 900 });

      await useCase.execute(defaultRequest);

      expect(authServiceMock.verifyDummyPassword).not.toHaveBeenCalled();
    });

    it('does not call authService.verifyDummyPassword on rate_limited from auth service', async () => {
      authServiceMock.signIn.mockResolvedValue({
        ok: false,
        kind: 'rate_limited',
        retryAfter: 300,
      });

      await useCase.execute(defaultRequest);

      expect(authServiceMock.verifyDummyPassword).not.toHaveBeenCalled();
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

    it('returns ok: false kind: service_error when authService.signIn throws', async () => {
      expect.assertions(2);
      authServiceMock.signIn.mockRejectedValue(new Error('DB connection failed'));

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('logs the error via Logger.error when authService.signIn throws', async () => {
      const error = new Error('DB connection failed');
      authServiceMock.signIn.mockRejectedValue(error);

      await useCase.execute(defaultRequest);

      expect(loggerMock.error).toHaveBeenCalledWith(
        'SignInUseCase: unexpected error during sign-in',
        error
      );
    });

    it('returns ok: false kind: service_error when authService.verifyDummyPassword throws', async () => {
      expect.assertions(2);
      authServiceMock.signIn.mockResolvedValue({ ok: false, kind: 'invalid_credentials' });
      authServiceMock.verifyDummyPassword.mockRejectedValue(new Error('crypto failure'));

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('uses shared sentinel key when IP is unknown so rate limiting is not bypassed', async () => {
      authServiceMock.signIn.mockResolvedValue({ ok: true, sessionToken: 'abc' });

      await useCase.execute({ ...defaultRequest, ip: 'unknown' });

      expect(rateLimiterMock.checkAndIncrement).toHaveBeenCalledWith(
        'ratelimit:sign-in:unknown',
        SIGN_IN_WINDOW_SECONDS,
        MAX_ATTEMPTS
      );
    });

    // --- Per-email rate limiting (FR-006) ---

    it('atomically checks and increments email rate limit using lowercase email key', async () => {
      authServiceMock.signIn.mockResolvedValue({ ok: true, sessionToken: 'abc' });

      await useCase.execute({ ...defaultRequest, email: 'User@Example.COM' });

      expect(rateLimiterMock.checkAndIncrement).toHaveBeenCalledWith(
        'ratelimit:sign-in-email:user@example.com',
        SIGN_IN_EMAIL_WINDOW_SECONDS,
        SIGN_IN_EMAIL_MAX_ATTEMPTS
      );
    });

    it('returns rate_limited when email rate limit is exceeded', async () => {
      expect.assertions(3);
      // First call (email) rejects; second call (IP) should not happen
      rateLimiterMock.checkAndIncrement.mockResolvedValueOnce({
        allowed: false,
        retryAfter: 1800,
      });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('rate_limited');
        expect(result.retryAfter).toBe(1800);
      }
    });

    it('does not call IP checkAndIncrement when email rate limit is exceeded', async () => {
      // First call (email) rejects
      rateLimiterMock.checkAndIncrement.mockResolvedValueOnce({
        allowed: false,
        retryAfter: 1800,
      });

      await useCase.execute(defaultRequest);

      // Only one call — the email check; no IP check
      expect(rateLimiterMock.checkAndIncrement).toHaveBeenCalledTimes(1);
    });

    it('does not call authService.signIn when email rate limit is exceeded', async () => {
      rateLimiterMock.checkAndIncrement.mockResolvedValueOnce({
        allowed: false,
        retryAfter: 1800,
      });

      await useCase.execute(defaultRequest);

      expect(authServiceMock.signIn).not.toHaveBeenCalled();
    });

    it('does not separately increment email counter on invalid_credentials (already incremented atomically)', async () => {
      authServiceMock.signIn.mockResolvedValue({ ok: false, kind: 'invalid_credentials' });

      await useCase.execute(defaultRequest);

      expect(rateLimiterMock.increment).not.toHaveBeenCalled();
    });

    it('does not call increment on successful sign-in', async () => {
      authServiceMock.signIn.mockResolvedValue({ ok: true, sessionToken: 'abc' });

      await useCase.execute(defaultRequest);

      expect(rateLimiterMock.increment).not.toHaveBeenCalled();
    });

    it('checks email rate limit before IP rate limit (ordering)', async () => {
      const callOrder: string[] = [];
      rateLimiterMock.checkAndIncrement.mockImplementation(
        (key: string, _ttl: number, _max: number) => {
          callOrder.push(key.includes('email') ? 'email' : 'ip');
          return Promise.resolve({ allowed: true });
        }
      );
      authServiceMock.signIn.mockResolvedValue({ ok: true, sessionToken: 'abc' });

      await useCase.execute(defaultRequest);

      expect(callOrder).toEqual(['email', 'ip']);
    });
  });
});

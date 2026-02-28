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

describe('SignInUseCase', () => {
  let authServiceMock: ReturnType<typeof makeAuthServiceMock>;
  let rateLimiterMock: ReturnType<typeof makeRateLimiterMock>;
  let useCase: SignInUseCase;

  const defaultRequest = { email: 'user@example.com', password: 'correcthorse12', ip: '1.2.3.4' };

  beforeEach(() => {
    authServiceMock = makeAuthServiceMock();
    rateLimiterMock = makeRateLimiterMock();
    rateLimiterMock.checkAndIncrement.mockResolvedValue({ allowed: true });
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

    it('returns ok: false kind: rate_limited with retryAfter when rate limit is exceeded', async () => {
      rateLimiterMock.checkAndIncrement.mockResolvedValue({ allowed: false, retryAfter: 900 });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('rate_limited');
        expect(result.retryAfter).toBe(900);
      }
    });

    it('returns ok: false kind: rate_limited without retryAfter when checkAndIncrement omits retryAfter', async () => {
      rateLimiterMock.checkAndIncrement.mockResolvedValue({ allowed: false });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('rate_limited');
        expect(result.retryAfter).toBeUndefined();
      }
    });

    it('does not call authService.signIn when rate limit is exceeded', async () => {
      rateLimiterMock.checkAndIncrement.mockResolvedValue({ allowed: false, retryAfter: 900 });

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

    it('returns ok: false kind: rate_limited with retryAfter when auth service returns rate_limited', async () => {
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
      authServiceMock.signIn.mockResolvedValue({ ok: false, kind: 'service_error' });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('calls checkAndIncrement with key ratelimit:sign-in:{ip} and SIGN_IN_WINDOW_SECONDS', async () => {
      authServiceMock.signIn.mockResolvedValue({ ok: true, sessionCookie: 'abc' });

      await useCase.execute({ email: 'user@example.com', password: 'password12', ip: '9.8.7.6' });

      expect(rateLimiterMock.checkAndIncrement).toHaveBeenCalledWith(
        'ratelimit:sign-in:9.8.7.6',
        SIGN_IN_WINDOW_SECONDS
      );
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
      authServiceMock.signIn.mockResolvedValue({ ok: true, sessionCookie: 'abc' });

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
      rateLimiterMock.checkAndIncrement.mockRejectedValue(new Error('DO unavailable'));

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('returns ok: false kind: service_error when authService.signIn throws', async () => {
      authServiceMock.signIn.mockRejectedValue(new Error('DB connection failed'));

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('returns ok: false kind: service_error when authService.verifyDummyPassword throws', async () => {
      authServiceMock.signIn.mockResolvedValue({ ok: false, kind: 'invalid_credentials' });
      authServiceMock.verifyDummyPassword.mockRejectedValue(new Error('crypto failure'));

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('does not use shared unknown bucket when IP is unknown', async () => {
      authServiceMock.signIn.mockResolvedValue({ ok: true, sessionCookie: 'abc' });

      await useCase.execute({ ...defaultRequest, ip: 'unknown' });

      expect(rateLimiterMock.checkAndIncrement).not.toHaveBeenCalledWith(
        'ratelimit:sign-in:unknown',
        expect.anything()
      );
    });

    it('uses a UUID-based key when IP is unknown', async () => {
      authServiceMock.signIn.mockResolvedValue({ ok: true, sessionCookie: 'abc' });

      let capturedKey = '';
      rateLimiterMock.checkAndIncrement.mockImplementation((key: unknown) => {
        capturedKey = String(key);
        return Promise.resolve({ allowed: true });
      });

      await useCase.execute({ ...defaultRequest, ip: 'unknown' });

      expect(capturedKey).not.toBe('ratelimit:sign-in:unknown');
      expect(capturedKey).toMatch(/^ratelimit:sign-in:[0-9a-f-]+$/);
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthService } from '../ports/AuthService.js';
import type { RateLimiter } from '../ports/RateLimiter.js';
import { SIGN_IN_WINDOW_SECONDS } from '../ports/RateLimiter.js';

import { SignInUseCase } from './SignInUseCase.js';

/**
 * Hoisted mock declarations — must be hoisted so they are available in the
 * vi.mock() factory function, which is executed before module imports.
 */
const mocks = vi.hoisted(() => ({
  verifyPassword: vi.fn<() => Promise<boolean>>().mockResolvedValue(false),
}));

vi.mock('../../domain/services/passwordHasher.js', () => ({
  verifyPassword: mocks.verifyPassword,
}));

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
  describe('DUMMY_HASH', () => {
    it('is a valid pbkdf2 format with 600000 iterations, 32-char salt, 64-char derived key', () => {
      expect(SignInUseCase.DUMMY_HASH).toMatch(/^pbkdf2\$600000\$[0-9a-f]{32}\$[0-9a-f]{64}$/);
    });
  });

  let authServiceMock: ReturnType<typeof makeAuthServiceMock>;
  let rateLimiterMock: ReturnType<typeof makeRateLimiterMock>;
  let useCase: SignInUseCase;

  const defaultRequest = { email: 'user@example.com', password: 'correcthorse12', ip: '1.2.3.4' };

  beforeEach(() => {
    authServiceMock = makeAuthServiceMock();
    rateLimiterMock = makeRateLimiterMock();
    rateLimiterMock.check.mockResolvedValue({ allowed: true });
    rateLimiterMock.increment.mockResolvedValue(undefined);
    mocks.verifyPassword.mockResolvedValue(false);
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
      authServiceMock.signIn.mockResolvedValue({
        ok: false,
        kind: 'rate_limited',
        retryAfter: 300,
      });

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

    it('calls verifyPassword with submitted password and DUMMY_HASH on invalid_credentials (FR-007)', async () => {
      authServiceMock.signIn.mockResolvedValue({ ok: false, kind: 'invalid_credentials' });

      await useCase.execute({ ...defaultRequest, password: 'wrongpassword12' });

      expect(mocks.verifyPassword).toHaveBeenCalledWith(
        'wrongpassword12',
        SignInUseCase.DUMMY_HASH
      );
    });

    it('calls verifyPassword with submitted password and DUMMY_HASH on service_error (FR-007)', async () => {
      authServiceMock.signIn.mockResolvedValue({ ok: false, kind: 'service_error' });

      await useCase.execute({ ...defaultRequest, password: 'somepassword12' });

      expect(mocks.verifyPassword).toHaveBeenCalledWith('somepassword12', SignInUseCase.DUMMY_HASH);
    });

    it('does not call verifyPassword on successful sign-in', async () => {
      authServiceMock.signIn.mockResolvedValue({ ok: true, sessionCookie: 'abc' });

      await useCase.execute(defaultRequest);

      expect(mocks.verifyPassword).not.toHaveBeenCalled();
    });

    it('does not call verifyPassword when KV rate limit is exceeded', async () => {
      rateLimiterMock.check.mockResolvedValue({ allowed: false, retryAfter: 900 });

      await useCase.execute(defaultRequest);

      expect(mocks.verifyPassword).not.toHaveBeenCalled();
    });

    it('does not call verifyPassword on rate_limited from auth service', async () => {
      authServiceMock.signIn.mockResolvedValue({
        ok: false,
        kind: 'rate_limited',
        retryAfter: 300,
      });

      await useCase.execute(defaultRequest);

      expect(mocks.verifyPassword).not.toHaveBeenCalled();
    });

    it('returns ok: false kind: service_error when rateLimiter.check throws', async () => {
      rateLimiterMock.check.mockRejectedValue(new Error('KV unavailable'));

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

    it('returns ok: false kind: service_error when rateLimiter.increment throws', async () => {
      authServiceMock.signIn.mockResolvedValue({ ok: false, kind: 'invalid_credentials' });
      rateLimiterMock.increment.mockRejectedValue(new Error('KV write failed'));

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('returns ok: false kind: service_error when verifyPassword throws', async () => {
      authServiceMock.signIn.mockResolvedValue({ ok: false, kind: 'invalid_credentials' });
      mocks.verifyPassword.mockRejectedValue(new Error('crypto failure'));

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });
  });
});

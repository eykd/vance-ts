import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthService } from '../../domain/interfaces/AuthService.js';
import type { Logger } from '../../domain/interfaces/Logger.js';
import type { RateLimiter } from '../../domain/interfaces/RateLimiter.js';

import { RequestPasswordResetUseCase } from './RequestPasswordResetUseCase.js';

/**
 * Creates an AuthService mock with only the method RequestPasswordResetUseCase calls.
 *
 * @returns An object with a `vi.fn()` stub for requestPasswordReset.
 */
function makeAuthServiceMock(): {
  requestPasswordReset: ReturnType<typeof vi.fn>;
} {
  return {
    requestPasswordReset: vi.fn().mockResolvedValue({ ok: true }),
  };
}

/**
 * Creates a RateLimiter mock with only the method RequestPasswordResetUseCase calls.
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
 * Creates a Logger mock with only the method RequestPasswordResetUseCase calls.
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

describe('RequestPasswordResetUseCase', () => {
  let authServiceMock: ReturnType<typeof makeAuthServiceMock>;
  let rateLimiterMock: ReturnType<typeof makeRateLimiterMock>;
  let loggerMock: ReturnType<typeof makeLoggerMock>;
  let useCase: RequestPasswordResetUseCase;

  const defaultRequest = Object.freeze({
    email: 'user@example.com',
    ip: '1.2.3.4',
  });

  beforeEach(() => {
    authServiceMock = makeAuthServiceMock();
    rateLimiterMock = makeRateLimiterMock();
    loggerMock = makeLoggerMock();
    rateLimiterMock.checkAndIncrement.mockResolvedValue({ allowed: true });
    useCase = new RequestPasswordResetUseCase(
      authServiceMock as unknown as AuthService,
      rateLimiterMock as unknown as RateLimiter,
      loggerMock as Logger
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('execute', () => {
    it('returns ok: true on successful password reset request', async () => {
      expect.assertions(1);

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(true);
    });

    it('passes email and redirectTo to authService.requestPasswordReset', async () => {
      await useCase.execute(defaultRequest);

      expect(authServiceMock.requestPasswordReset).toHaveBeenCalledWith({
        email: 'user@example.com',
        redirectTo: '/auth/reset-password',
      });
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

    it('returns ok: true even when auth service returns service_error', async () => {
      expect.assertions(1);
      authServiceMock.requestPasswordReset.mockResolvedValue({
        ok: false,
        kind: 'service_error',
      });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(true);
    });

    it('returns ok: true when auth service throws', async () => {
      expect.assertions(1);
      authServiceMock.requestPasswordReset.mockRejectedValue(new Error('DB unavailable'));

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(true);
    });

    it('logs the error via Logger.error when auth service throws', async () => {
      const error = new Error('DB unavailable');
      authServiceMock.requestPasswordReset.mockRejectedValue(error);

      await useCase.execute(defaultRequest);

      expect(loggerMock.error).toHaveBeenCalledWith(
        'RequestPasswordResetUseCase: unexpected error',
        error
      );
    });

    it('calls checkAndIncrement with key ratelimit:password-reset:{ip} and correct window and max', async () => {
      await useCase.execute({ email: 'user@example.com', ip: '9.8.7.6' });

      expect(rateLimiterMock.checkAndIncrement).toHaveBeenCalledWith(
        'ratelimit:password-reset:9.8.7.6',
        900,
        5
      );
    });

    it('does not call authService.requestPasswordReset when rate limit is exceeded', async () => {
      rateLimiterMock.checkAndIncrement.mockResolvedValue({ allowed: false, retryAfter: 900 });

      await useCase.execute(defaultRequest);

      expect(authServiceMock.requestPasswordReset).not.toHaveBeenCalled();
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthService } from '../ports/AuthService.js';
import type { Logger } from '../ports/Logger.js';

import { ResetPasswordUseCase } from './ResetPasswordUseCase.js';

/**
 * Creates an AuthService mock with only the method ResetPasswordUseCase calls.
 *
 * @returns An object with a `vi.fn()` stub for resetPassword.
 */
function makeAuthServiceMock(): {
  resetPassword: ReturnType<typeof vi.fn>;
} {
  return {
    resetPassword: vi.fn().mockResolvedValue({ ok: true }),
  };
}

/**
 * Creates a Logger mock with only the method ResetPasswordUseCase calls.
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

describe('ResetPasswordUseCase', () => {
  let authServiceMock: ReturnType<typeof makeAuthServiceMock>;
  let loggerMock: ReturnType<typeof makeLoggerMock>;
  let useCase: ResetPasswordUseCase;

  const defaultRequest = Object.freeze({
    token: 'valid-reset-token-abc123',
    newPassword: 'correcthorse12',
  });

  beforeEach(() => {
    authServiceMock = makeAuthServiceMock();
    loggerMock = makeLoggerMock();
    useCase = new ResetPasswordUseCase(
      authServiceMock as unknown as AuthService,
      loggerMock as Logger
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('execute', () => {
    it('returns ok: true on successful password reset', async () => {
      expect.assertions(1);

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(true);
    });

    it('passes token and newPassword to authService.resetPassword', async () => {
      await useCase.execute(defaultRequest);

      expect(authServiceMock.resetPassword).toHaveBeenCalledWith({
        token: 'valid-reset-token-abc123',
        newPassword: 'correcthorse12',
      });
    });

    it('returns ok: false kind: password_too_common for common password', async () => {
      expect.assertions(3);

      const result = await useCase.execute({ ...defaultRequest, newPassword: 'password1234' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('password_too_common');
      }
      expect(authServiceMock.resetPassword).not.toHaveBeenCalled();
    });

    it('performs case-insensitive common password check by lowercasing before lookup', async () => {
      expect.assertions(2);

      const result = await useCase.execute({ ...defaultRequest, newPassword: 'PASSWORD1234' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('password_too_common');
      }
    });

    it('returns ok: false kind: invalid_token when auth service returns invalid_token', async () => {
      expect.assertions(2);
      authServiceMock.resetPassword.mockResolvedValue({ ok: false, kind: 'invalid_token' });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('invalid_token');
      }
    });

    it('returns ok: false kind: weak_password when auth service returns weak_password', async () => {
      expect.assertions(2);
      authServiceMock.resetPassword.mockResolvedValue({ ok: false, kind: 'weak_password' });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('weak_password');
      }
    });

    it('returns ok: false kind: service_error when auth service throws', async () => {
      expect.assertions(2);
      authServiceMock.resetPassword.mockRejectedValue(new Error('DB unavailable'));

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('logs the error via Logger.error when auth service throws', async () => {
      const error = new Error('DB unavailable');
      authServiceMock.resetPassword.mockRejectedValue(error);

      await useCase.execute(defaultRequest);

      expect(loggerMock.error).toHaveBeenCalledWith(
        'ResetPasswordUseCase: unexpected error',
        error
      );
    });
  });
});

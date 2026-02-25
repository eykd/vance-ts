import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthService } from '../ports/AuthService.js';

import { SignOutUseCase } from './SignOutUseCase.js';

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

describe('SignOutUseCase', () => {
  let authServiceMock: ReturnType<typeof makeAuthServiceMock>;
  let useCase: SignOutUseCase;

  const defaultRequest = { sessionCookie: '__Host-better-auth.session-token=abc123' };

  beforeEach(() => {
    authServiceMock = makeAuthServiceMock();
    useCase = new SignOutUseCase(authServiceMock as unknown as AuthService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('execute', () => {
    it('returns ok: true with clearCookieHeader when authService.signOut succeeds', async () => {
      const clearCookieHeader =
        '__Host-better-auth.session-token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax; Secure';
      authServiceMock.signOut.mockResolvedValue({ ok: true, clearCookieHeader });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.clearCookieHeader).toBe(clearCookieHeader);
      }
    });

    it('returns ok: false kind: service_error when authService.signOut returns service_error', async () => {
      authServiceMock.signOut.mockResolvedValue({ ok: false, kind: 'service_error' });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('returns ok: false kind: service_error when authService.signOut throws', async () => {
      authServiceMock.signOut.mockRejectedValue(new Error('DB unavailable'));

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('calls authService.signOut with the sessionCookie from the request', async () => {
      authServiceMock.signOut.mockResolvedValue({
        ok: true,
        clearCookieHeader: 'clear-cookie-value',
      });

      await useCase.execute({ sessionCookie: 'session-token-xyz' });

      expect(authServiceMock.signOut).toHaveBeenCalledWith({ sessionCookie: 'session-token-xyz' });
    });
  });
});

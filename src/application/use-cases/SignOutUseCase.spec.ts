import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

describe('SignOutUseCase', () => {
  let authServiceMock: ReturnType<typeof makeAuthServiceMock>;
  let useCase: SignOutUseCase;

  const defaultRequest = Object.freeze({ sessionToken: 'abc123' });

  beforeEach(() => {
    authServiceMock = makeAuthServiceMock();
    useCase = new SignOutUseCase(authServiceMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('execute', () => {
    it('returns ok: true when authService.signOut succeeds', async () => {
      authServiceMock.signOut.mockResolvedValue({ ok: true });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(true);
    });

    it('returns ok: false kind: service_error when authService.signOut returns service_error', async () => {
      expect.assertions(2);
      authServiceMock.signOut.mockResolvedValue({ ok: false, kind: 'service_error' });

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('returns ok: false kind: service_error when authService.signOut throws', async () => {
      expect.assertions(2);
      authServiceMock.signOut.mockRejectedValue(new Error('DB unavailable'));

      const result = await useCase.execute(defaultRequest);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('calls authService.signOut with the sessionToken from the request', async () => {
      authServiceMock.signOut.mockResolvedValue({ ok: true });

      await useCase.execute({ sessionToken: 'session-token-xyz' });

      expect(authServiceMock.signOut).toHaveBeenCalledWith({ sessionToken: 'session-token-xyz' });
    });
  });
});

import type { betterAuth } from 'better-auth';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BetterAuthService } from './BetterAuthService';

/**
 * Hoisted mock declarations — must be hoisted so they are available in the
 * vi.mock() factory function, which is executed before module imports.
 */
const mocks = vi.hoisted(() => ({
  verifyPassword: vi.fn<() => Promise<boolean>>().mockResolvedValue(false),
}));

vi.mock('../domain/services/passwordHasher.js', () => ({
  verifyPassword: mocks.verifyPassword,
}));

/** Type alias for the better-auth instance type, used for casting test doubles. */
type AuthInstance = ReturnType<typeof betterAuth>;

/**
 * Creates a minimal auth mock with vi.fn() stubs for each API method used by
 * BetterAuthService. The returned object is cast to AuthInstance at the
 * constructor call site.
 *
 * @returns An object with `api` containing `vi.fn()` stubs for each auth API
 * method: signInEmail, signUpEmail, signOut, and getSession.
 */
function makeAuthMock(): {
  api: {
    signInEmail: ReturnType<typeof vi.fn>;
    signUpEmail: ReturnType<typeof vi.fn>;
    signOut: ReturnType<typeof vi.fn>;
    getSession: ReturnType<typeof vi.fn>;
  };
} {
  return {
    api: {
      signInEmail: vi.fn(),
      signUpEmail: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
  };
}

describe('BetterAuthService', () => {
  let authMock: ReturnType<typeof makeAuthMock>;
  let service: BetterAuthService;

  beforeEach(() => {
    authMock = makeAuthMock();
    service = new BetterAuthService(authMock as unknown as AuthInstance);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('signIn', () => {
    it('returns ok: true with sessionToken extracted from Set-Cookie header on 200', async () => {
      const setCookieValue = '__Host-better-auth.session_token=abc123; Path=/; HttpOnly';
      authMock.api.signInEmail.mockResolvedValue(
        new Response(null, {
          status: 200,
          headers: { 'set-cookie': setCookieValue },
        })
      );

      const result = await service.signIn({
        email: 'user@example.com',
        password: 'correcthorse12',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.sessionToken).toBe('abc123');
      }
    });

    it('passes email and password in the request body', async () => {
      authMock.api.signInEmail.mockResolvedValue(
        new Response(null, {
          status: 200,
          headers: { 'set-cookie': '__Host-better-auth.session_token=test; Path=/' },
        })
      );

      await service.signIn({
        email: 'user@example.com',
        password: 'correcthorse12',
      });

      expect(authMock.api.signInEmail).toHaveBeenCalledWith(
        expect.objectContaining({ body: { email: 'user@example.com', password: 'correcthorse12' } })
      );
    });

    it('calls auth.api.signInEmail with asResponse: true', async () => {
      authMock.api.signInEmail.mockResolvedValue(
        new Response(null, {
          status: 200,
          headers: { 'set-cookie': '__Host-better-auth.session_token=test; Path=/' },
        })
      );

      await service.signIn({
        email: 'user@example.com',
        password: 'correcthorse12',
      });

      expect(authMock.api.signInEmail).toHaveBeenCalledWith(
        expect.objectContaining({ asResponse: true })
      );
    });

    it('returns ok: false kind: invalid_credentials when response is 401', async () => {
      authMock.api.signInEmail.mockResolvedValue(new Response(null, { status: 401 }));

      const result = await service.signIn({
        email: 'user@example.com',
        password: 'wrongpassword12',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('invalid_credentials');
      }
    });

    it('returns ok: false kind: invalid_credentials when response is 400 (invalid email)', async () => {
      authMock.api.signInEmail.mockResolvedValue(new Response(null, { status: 400 }));

      const result = await service.signIn({
        email: 'not-an-email',
        password: 'correcthorse12',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('invalid_credentials');
      }
    });

    it('returns ok: false kind: rate_limited with retryAfter when response is 429 with Retry-After header', async () => {
      authMock.api.signInEmail.mockResolvedValue(
        new Response(null, { status: 429, headers: { 'retry-after': '900' } })
      );

      const result = await service.signIn({
        email: 'user@example.com',
        password: 'correcthorse12',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('rate_limited');
        expect(result.retryAfter).toBe(900);
      }
    });

    it('returns ok: false kind: rate_limited without retryAfter when 429 has no Retry-After header', async () => {
      authMock.api.signInEmail.mockResolvedValue(new Response(null, { status: 429 }));

      const result = await service.signIn({
        email: 'user@example.com',
        password: 'correcthorse12',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('rate_limited');
        expect(result.retryAfter).toBeUndefined();
      }
    });

    it('returns ok: false kind: service_error when response is 500', async () => {
      authMock.api.signInEmail.mockResolvedValue(new Response(null, { status: 500 }));

      const result = await service.signIn({
        email: 'user@example.com',
        password: 'correcthorse12',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('returns ok: false kind: service_error when auth.api.signInEmail throws', async () => {
      authMock.api.signInEmail.mockRejectedValue(new Error('D1 unavailable'));

      const result = await service.signIn({
        email: 'user@example.com',
        password: 'correcthorse12',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('returns ok: false kind: service_error when extracted session token is empty', async () => {
      authMock.api.signInEmail.mockResolvedValue(
        new Response(null, {
          status: 200,
          headers: { 'set-cookie': '__Host-better-auth.session_token=; Path=/' },
        })
      );

      const result = await service.signIn({
        email: 'user@example.com',
        password: 'correcthorse12',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('returns ok: false kind: service_error when Set-Cookie header has wrong cookie name', async () => {
      authMock.api.signInEmail.mockResolvedValue(
        new Response(null, {
          status: 200,
          headers: { 'set-cookie': 'wrong_cookie=abc123; Path=/; HttpOnly' },
        })
      );

      const result = await service.signIn({
        email: 'user@example.com',
        password: 'correcthorse12',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('returns ok: false kind: service_error when Set-Cookie header is absent on 200', async () => {
      authMock.api.signInEmail.mockResolvedValue(new Response(null, { status: 200 }));

      const result = await service.signIn({
        email: 'user@example.com',
        password: 'correcthorse12',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });
  });

  describe('signUp', () => {
    it('returns ok: true when response is 200', async () => {
      authMock.api.signUpEmail.mockResolvedValue(new Response(null, { status: 200 }));

      const result = await service.signUp({
        email: 'new@example.com',
        password: 'correcthorse12',
        name: 'Alice',
      });

      expect(result.ok).toBe(true);
    });

    it('passes email, password, and name in the request body', async () => {
      authMock.api.signUpEmail.mockResolvedValue(new Response(null, { status: 200 }));

      await service.signUp({
        email: 'new@example.com',
        password: 'correcthorse12',
        name: 'Alice',
      });

      expect(authMock.api.signUpEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { email: 'new@example.com', password: 'correcthorse12', name: 'Alice' },
        })
      );
    });

    it('calls auth.api.signUpEmail with asResponse: true', async () => {
      authMock.api.signUpEmail.mockResolvedValue(new Response(null, { status: 200 }));

      await service.signUp({
        email: 'new@example.com',
        password: 'correcthorse12',
        name: 'Alice',
      });

      expect(authMock.api.signUpEmail).toHaveBeenCalledWith(
        expect.objectContaining({ asResponse: true })
      );
    });

    it('returns ok: false kind: email_taken when response is 422', async () => {
      authMock.api.signUpEmail.mockResolvedValue(new Response(null, { status: 422 }));

      const result = await service.signUp({
        email: 'existing@example.com',
        password: 'correcthorse12',
        name: 'Bob',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('email_taken');
      }
    });

    it('returns ok: false kind: weak_password when response is 400', async () => {
      authMock.api.signUpEmail.mockResolvedValue(new Response(null, { status: 400 }));

      const result = await service.signUp({
        email: 'new@example.com',
        password: 'short',
        name: 'Carol',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('weak_password');
      }
    });

    it('returns ok: false kind: rate_limited when response is 429', async () => {
      authMock.api.signUpEmail.mockResolvedValue(new Response(null, { status: 429 }));

      const result = await service.signUp({
        email: 'new@example.com',
        password: 'correcthorse12',
        name: 'Dave',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('rate_limited');
      }
    });

    it('returns ok: false kind: service_error when response is 500', async () => {
      authMock.api.signUpEmail.mockResolvedValue(new Response(null, { status: 500 }));

      const result = await service.signUp({
        email: 'new@example.com',
        password: 'correcthorse12',
        name: 'Eve',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('returns ok: false kind: service_error when auth.api.signUpEmail throws', async () => {
      authMock.api.signUpEmail.mockRejectedValue(new Error('D1 unavailable'));

      const result = await service.signUp({
        email: 'new@example.com',
        password: 'correcthorse12',
        name: 'Frank',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });
  });

  describe('signOut', () => {
    it('returns ok: true on successful sign-out (200)', async () => {
      authMock.api.signOut.mockResolvedValue(
        new Response(null, {
          status: 200,
          headers: { 'set-cookie': '__Host-better-auth.session_token=; Max-Age=0' },
        })
      );

      const result = await service.signOut({ sessionToken: 'abc123' });

      expect(result.ok).toBe(true);
    });

    it('constructs the Cookie header from the session token', async () => {
      authMock.api.signOut.mockResolvedValue(new Response(null, { status: 200 }));

      await service.signOut({ sessionToken: 'abc123' });

      const call = authMock.api.signOut.mock.calls[0] as [
        { headers: Headers; asResponse: boolean },
      ];
      const passedHeaders = call[0]?.headers;
      expect(passedHeaders).toBeInstanceOf(Headers);
      expect(passedHeaders?.get('cookie')).toBe('__Host-better-auth.session_token=abc123');
    });

    it('calls auth.api.signOut with asResponse: true', async () => {
      authMock.api.signOut.mockResolvedValue(new Response(null, { status: 200 }));

      await service.signOut({ sessionToken: 'abc123' });

      expect(authMock.api.signOut).toHaveBeenCalledWith(
        expect.objectContaining({ asResponse: true })
      );
    });

    it('returns ok: false kind: service_error when response is not ok (500)', async () => {
      authMock.api.signOut.mockResolvedValue(new Response(null, { status: 500 }));

      const result = await service.signOut({ sessionToken: 'abc123' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('returns ok: false kind: service_error when auth.api.signOut throws', async () => {
      authMock.api.signOut.mockRejectedValue(new Error('network error'));

      const result = await service.signOut({ sessionToken: 'abc123' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });
  });

  describe('getSession', () => {
    it('returns null when auth.api.getSession returns null', async () => {
      authMock.api.getSession.mockResolvedValue(null);

      const result = await service.getSession({ sessionToken: 'tok-abc' });

      expect(result).toBeNull();
    });

    it('returns mapped AuthUser and AuthSession when auth.api.getSession returns data', async () => {
      const now = new Date('2026-02-25T00:00:00.000Z');
      const future = new Date('2026-03-27T00:00:00.000Z');

      authMock.api.getSession.mockResolvedValue({
        user: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'Alice',
          emailVerified: false,
          createdAt: now,
          updatedAt: now,
        },
        session: {
          id: 'session-1',
          token: 'tok-abc',
          userId: 'user-1',
          expiresAt: future,
          createdAt: now,
          updatedAt: now,
        },
      });

      const result = await service.getSession({ sessionToken: 'tok-abc' });

      expect(result).not.toBeNull();
      expect(result?.user.id).toBe('user-1');
      expect(result?.user.email).toBe('user@example.com');
      expect(result?.user.name).toBe('Alice');
      expect(result?.user.emailVerified).toBe(false);
      expect(result?.user.createdAt).toBe('2026-02-25T00:00:00.000Z');
      expect(result?.session.id).toBe('session-1');
      expect(result?.session.token).toBe('tok-abc');
      expect(result?.session.userId).toBe('user-1');
      expect(result?.session.expiresAt).toBe('2026-03-27T00:00:00.000Z');
      expect(result?.session.createdAt).toBe('2026-02-25T00:00:00.000Z');
    });

    it('constructs Cookie header from sessionToken and passes to auth.api.getSession', async () => {
      authMock.api.getSession.mockResolvedValue(null);

      await service.getSession({ sessionToken: 'tok-abc' });

      const call = authMock.api.getSession.mock.calls[0] as [{ headers: Headers }];
      const passedHeaders = call[0]?.headers;
      expect(passedHeaders).toBeInstanceOf(Headers);
      expect(passedHeaders?.get('cookie')).toBe('__Host-better-auth.session_token=tok-abc');
    });

    it('propagates errors thrown by auth.api.getSession', async () => {
      const error = new Error('D1 database unavailable');
      authMock.api.getSession.mockRejectedValue(error);

      await expect(service.getSession({ sessionToken: 'tok-abc' })).rejects.toThrow(
        'D1 database unavailable'
      );
    });
  });

  describe('DUMMY_HASH', () => {
    it('is a valid argon2id format with OWASP parameters, 32-char salt, 64-char derived key', () => {
      expect(BetterAuthService.DUMMY_HASH).toMatch(
        /^argon2id\$19456\$2\$1\$[0-9a-f]{32}\$[0-9a-f]{64}$/
      );
    });

    it('is not a fixed constant (generated at startup with random salt)', () => {
      expect(BetterAuthService.DUMMY_HASH).not.toBe(
        'argon2id$19456$2$1$00000000000000000000000000000000$0000000000000000000000000000000000000000000000000000000000000000'
      );
    });
  });

  describe('verifyDummyPassword', () => {
    it('calls verifyPassword with submitted password and DUMMY_HASH (FR-007)', async () => {
      mocks.verifyPassword.mockResolvedValue(false);

      await service.verifyDummyPassword('testpassword123');

      expect(mocks.verifyPassword).toHaveBeenCalledWith(
        'testpassword123',
        BetterAuthService.DUMMY_HASH
      );
    });

    it('resolves void regardless of verifyPassword result', async () => {
      mocks.verifyPassword.mockResolvedValue(true);

      await expect(service.verifyDummyPassword('anypassword')).resolves.toBeUndefined();
    });

    it('propagates errors thrown by verifyPassword', async () => {
      mocks.verifyPassword.mockRejectedValue(new Error('crypto failure'));

      await expect(service.verifyDummyPassword('anypassword')).rejects.toThrow('crypto failure');
    });
  });
});

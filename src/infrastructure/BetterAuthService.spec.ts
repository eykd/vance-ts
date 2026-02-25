import type { betterAuth } from 'better-auth';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BetterAuthService } from './BetterAuthService';

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
    it('returns ok: true with sessionCookie extracted from Set-Cookie header on 200', async () => {
      const sessionCookieValue = '__Host-better-auth.session-token=abc123; Path=/; HttpOnly';
      authMock.api.signInEmail.mockResolvedValue(
        new Response(null, {
          status: 200,
          headers: { 'set-cookie': sessionCookieValue },
        })
      );

      const result = await service.signIn({
        email: 'user@example.com',
        password: 'correcthorse12',
        ip: '1.2.3.4',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.sessionCookie).toBe(sessionCookieValue);
      }
    });

    it('passes email and password in the request body', async () => {
      authMock.api.signInEmail.mockResolvedValue(new Response(null, { status: 200 }));

      await service.signIn({
        email: 'user@example.com',
        password: 'correcthorse12',
        ip: '1.2.3.4',
      });

      expect(authMock.api.signInEmail).toHaveBeenCalledWith(
        expect.objectContaining({ body: { email: 'user@example.com', password: 'correcthorse12' } })
      );
    });

    it('calls auth.api.signInEmail with asResponse: true', async () => {
      authMock.api.signInEmail.mockResolvedValue(new Response(null, { status: 200 }));

      await service.signIn({
        email: 'user@example.com',
        password: 'correcthorse12',
        ip: '1.2.3.4',
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
        ip: '1.2.3.4',
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
        ip: '1.2.3.4',
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
        ip: '1.2.3.4',
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
        ip: '1.2.3.4',
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
        ip: '1.2.3.4',
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
        ip: '1.2.3.4',
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
        ip: '1.2.3.4',
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
        ip: '1.2.3.4',
      });

      expect(result.ok).toBe(true);
    });

    it('passes email, password, and name in the request body', async () => {
      authMock.api.signUpEmail.mockResolvedValue(new Response(null, { status: 200 }));

      await service.signUp({
        email: 'new@example.com',
        password: 'correcthorse12',
        name: 'Alice',
        ip: '1.2.3.4',
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
        ip: '1.2.3.4',
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
        ip: '1.2.3.4',
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
        ip: '1.2.3.4',
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
        ip: '1.2.3.4',
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
        ip: '1.2.3.4',
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
        ip: '1.2.3.4',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });
  });

  describe('signOut', () => {
    it('returns ok: true with clearCookieHeader extracted from Set-Cookie header on 200', async () => {
      const clearCookieValue = '__Host-better-auth.session-token=; Path=/; HttpOnly; Max-Age=0';
      authMock.api.signOut.mockResolvedValue(
        new Response(null, {
          status: 200,
          headers: { 'set-cookie': clearCookieValue },
        })
      );

      const result = await service.signOut({
        sessionCookie: '__Host-better-auth.session-token=abc123',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.clearCookieHeader).toBe(clearCookieValue);
      }
    });

    it('passes the sessionCookie as the Cookie request header', async () => {
      authMock.api.signOut.mockResolvedValue(new Response(null, { status: 200 }));
      const sessionCookie = '__Host-better-auth.session-token=abc123';

      await service.signOut({ sessionCookie });

      const call = authMock.api.signOut.mock.calls[0] as [
        { headers: Headers; asResponse: boolean },
      ];
      const passedHeaders = call[0]?.headers;
      expect(passedHeaders).toBeInstanceOf(Headers);
      expect(passedHeaders?.get('cookie')).toBe(sessionCookie);
    });

    it('calls auth.api.signOut with asResponse: true', async () => {
      authMock.api.signOut.mockResolvedValue(new Response(null, { status: 200 }));

      await service.signOut({ sessionCookie: '__Host-session=abc123' });

      expect(authMock.api.signOut).toHaveBeenCalledWith(
        expect.objectContaining({ asResponse: true })
      );
    });

    it('returns ok: false kind: service_error when Set-Cookie is absent on 200', async () => {
      authMock.api.signOut.mockResolvedValue(new Response(null, { status: 200 }));

      const result = await service.signOut({ sessionCookie: '__Host-session=abc123' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('returns ok: false kind: service_error when response is not ok (500)', async () => {
      authMock.api.signOut.mockResolvedValue(new Response(null, { status: 500 }));

      const result = await service.signOut({ sessionCookie: '__Host-session=abc123' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });

    it('returns ok: false kind: service_error when auth.api.signOut throws', async () => {
      authMock.api.signOut.mockRejectedValue(new Error('network error'));

      const result = await service.signOut({ sessionCookie: '__Host-session=abc123' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });
  });

  describe('getSession', () => {
    it('returns null when auth.api.getSession returns null', async () => {
      authMock.api.getSession.mockResolvedValue(null);

      const result = await service.getSession({ headers: new Headers() });

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

      const result = await service.getSession({
        headers: new Headers({ cookie: 'session=tok-abc' }),
      });

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

    it('passes the request headers to auth.api.getSession', async () => {
      authMock.api.getSession.mockResolvedValue(null);
      const headers = new Headers({ cookie: 'session=tok-abc' });

      await service.getSession({ headers });

      expect(authMock.api.getSession).toHaveBeenCalledWith(expect.objectContaining({ headers }));
    });

    it('propagates errors thrown by auth.api.getSession', async () => {
      const error = new Error('D1 database unavailable');
      authMock.api.getSession.mockRejectedValue(error);

      await expect(service.getSession({ headers: new Headers() })).rejects.toThrow(
        'D1 database unavailable'
      );
    });
  });
});

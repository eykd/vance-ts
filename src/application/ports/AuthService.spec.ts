import { describe, expect, it } from 'vitest';

import type { AuthService } from './AuthService';

/**
 * Contract tests for the AuthService port.
 *
 * Verifies the interface shape using test-doubles.
 * Adapter tests (BetterAuthService) live in src/infrastructure/BetterAuthService.spec.ts.
 */
describe('AuthService port', () => {
  describe('signIn', () => {
    it('can be satisfied by a test double returning ok: true with sessionCookie', async () => {
      const stub: AuthService = {
        signIn: (_params) => Promise.resolve({ ok: true, sessionCookie: 'session=abc123' }),
        signUp: (_params) => Promise.resolve({ ok: true }),
        signOut: (_params) =>
          Promise.resolve({ ok: true, clearCookieHeader: 'session=; Max-Age=0' }),
        getSession: (_params) => Promise.resolve(null),
      };

      const result = await stub.signIn({
        email: 'user@example.com',
        password: 'pass',
        ip: '1.2.3.4',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.sessionCookie).toBe('session=abc123');
      }
    });

    it('can be satisfied by a test double returning ok: false with invalid_credentials', async () => {
      const stub: AuthService = {
        signIn: (_params) => Promise.resolve({ ok: false, kind: 'invalid_credentials' }),
        signUp: (_params) => Promise.resolve({ ok: true }),
        signOut: (_params) =>
          Promise.resolve({ ok: true, clearCookieHeader: 'session=; Max-Age=0' }),
        getSession: (_params) => Promise.resolve(null),
      };

      const result = await stub.signIn({
        email: 'user@example.com',
        password: 'wrong',
        ip: '1.2.3.4',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('invalid_credentials');
        expect(result.retryAfter).toBeUndefined();
      }
    });

    it('can be satisfied by a test double returning ok: false with rate_limited and retryAfter', async () => {
      const stub: AuthService = {
        signIn: (_params) => Promise.resolve({ ok: false, kind: 'rate_limited', retryAfter: 900 }),
        signUp: (_params) => Promise.resolve({ ok: true }),
        signOut: (_params) =>
          Promise.resolve({ ok: true, clearCookieHeader: 'session=; Max-Age=0' }),
        getSession: (_params) => Promise.resolve(null),
      };

      const result = await stub.signIn({
        email: 'user@example.com',
        password: 'pass',
        ip: '1.2.3.4',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('rate_limited');
        expect(result.retryAfter).toBe(900);
      }
    });

    it('can be satisfied by a test double returning ok: false with service_error', async () => {
      const stub: AuthService = {
        signIn: (_params) => Promise.resolve({ ok: false, kind: 'service_error' }),
        signUp: (_params) => Promise.resolve({ ok: true }),
        signOut: (_params) =>
          Promise.resolve({ ok: true, clearCookieHeader: 'session=; Max-Age=0' }),
        getSession: (_params) => Promise.resolve(null),
      };

      const result = await stub.signIn({
        email: 'user@example.com',
        password: 'pass',
        ip: '1.2.3.4',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });
  });

  describe('signUp', () => {
    it('can be satisfied by a test double returning ok: true', async () => {
      const stub: AuthService = {
        signIn: (_params) => Promise.resolve({ ok: true, sessionCookie: 'session=abc123' }),
        signUp: (_params) => Promise.resolve({ ok: true }),
        signOut: (_params) =>
          Promise.resolve({ ok: true, clearCookieHeader: 'session=; Max-Age=0' }),
        getSession: (_params) => Promise.resolve(null),
      };

      const result = await stub.signUp({
        email: 'new@example.com',
        password: 'securepass123',
        name: 'Alice',
        ip: '1.2.3.4',
      });

      expect(result.ok).toBe(true);
    });

    it('can be satisfied by a test double returning ok: false with email_taken', async () => {
      const stub: AuthService = {
        signIn: (_params) => Promise.resolve({ ok: true, sessionCookie: 'session=abc123' }),
        signUp: (_params) => Promise.resolve({ ok: false, kind: 'email_taken' }),
        signOut: (_params) =>
          Promise.resolve({ ok: true, clearCookieHeader: 'session=; Max-Age=0' }),
        getSession: (_params) => Promise.resolve(null),
      };

      const result = await stub.signUp({
        email: 'existing@example.com',
        password: 'securepass123',
        name: 'Bob',
        ip: '1.2.3.4',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('email_taken');
      }
    });

    it('can be satisfied by a test double returning ok: false with weak_password', async () => {
      const stub: AuthService = {
        signIn: (_params) => Promise.resolve({ ok: true, sessionCookie: 'session=abc123' }),
        signUp: (_params) => Promise.resolve({ ok: false, kind: 'weak_password' }),
        signOut: (_params) =>
          Promise.resolve({ ok: true, clearCookieHeader: 'session=; Max-Age=0' }),
        getSession: (_params) => Promise.resolve(null),
      };

      const result = await stub.signUp({
        email: 'new@example.com',
        password: 'password123',
        name: 'Carol',
        ip: '1.2.3.4',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('weak_password');
      }
    });

    it('can be satisfied by a test double returning ok: false with rate_limited', async () => {
      const stub: AuthService = {
        signIn: (_params) => Promise.resolve({ ok: true, sessionCookie: 'session=abc123' }),
        signUp: (_params) => Promise.resolve({ ok: false, kind: 'rate_limited' }),
        signOut: (_params) =>
          Promise.resolve({ ok: true, clearCookieHeader: 'session=; Max-Age=0' }),
        getSession: (_params) => Promise.resolve(null),
      };

      const result = await stub.signUp({
        email: 'new@example.com',
        password: 'securepass123',
        name: 'Dave',
        ip: '1.2.3.4',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('rate_limited');
      }
    });

    it('can be satisfied by a test double returning ok: false with service_error', async () => {
      const stub: AuthService = {
        signIn: (_params) => Promise.resolve({ ok: true, sessionCookie: 'session=abc123' }),
        signUp: (_params) => Promise.resolve({ ok: false, kind: 'service_error' }),
        signOut: (_params) =>
          Promise.resolve({ ok: true, clearCookieHeader: 'session=; Max-Age=0' }),
        getSession: (_params) => Promise.resolve(null),
      };

      const result = await stub.signUp({
        email: 'new@example.com',
        password: 'securepass123',
        name: 'Eve',
        ip: '1.2.3.4',
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });
  });

  describe('signOut', () => {
    it('can be satisfied by a test double returning ok: true with clearCookieHeader', async () => {
      const stub: AuthService = {
        signIn: (_params) => Promise.resolve({ ok: true, sessionCookie: 'session=abc123' }),
        signUp: (_params) => Promise.resolve({ ok: true }),
        signOut: (_params) =>
          Promise.resolve({ ok: true, clearCookieHeader: 'session=; Max-Age=0; Path=/' }),
        getSession: (_params) => Promise.resolve(null),
      };

      const result = await stub.signOut({ sessionCookie: 'session=abc123' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.clearCookieHeader).toBe('session=; Max-Age=0; Path=/');
      }
    });

    it('can be satisfied by a test double returning ok: false with service_error', async () => {
      const stub: AuthService = {
        signIn: (_params) => Promise.resolve({ ok: true, sessionCookie: 'session=abc123' }),
        signUp: (_params) => Promise.resolve({ ok: true }),
        signOut: (_params) => Promise.resolve({ ok: false, kind: 'service_error' }),
        getSession: (_params) => Promise.resolve(null),
      };

      const result = await stub.signOut({ sessionCookie: 'session=abc123' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.kind).toBe('service_error');
      }
    });
  });

  describe('getSession', () => {
    it('can be satisfied by a test double returning null when no session exists', async () => {
      const stub: AuthService = {
        signIn: (_params) => Promise.resolve({ ok: true, sessionCookie: 'session=abc123' }),
        signUp: (_params) => Promise.resolve({ ok: true }),
        signOut: (_params) =>
          Promise.resolve({ ok: true, clearCookieHeader: 'session=; Max-Age=0' }),
        getSession: (_params) => Promise.resolve(null),
      };

      const result = await stub.getSession({ headers: new Headers() });

      expect(result).toBeNull();
    });

    it('can be satisfied by a test double returning user and session when authenticated', async () => {
      const now = '2026-02-25T00:00:00.000Z';
      const future = '2026-03-27T00:00:00.000Z';

      const stub: AuthService = {
        signIn: (_params) => Promise.resolve({ ok: true, sessionCookie: 'session=abc123' }),
        signUp: (_params) => Promise.resolve({ ok: true }),
        signOut: (_params) =>
          Promise.resolve({ ok: true, clearCookieHeader: 'session=; Max-Age=0' }),
        getSession: (_params) =>
          Promise.resolve({
            user: {
              id: 'user-1',
              email: 'user@example.com',
              name: 'Alice',
              emailVerified: false,
              createdAt: now,
            },
            session: {
              id: 'session-1',
              token: 'tok-abc',
              userId: 'user-1',
              expiresAt: future,
              createdAt: now,
            },
          }),
      };

      const headers = new Headers({ cookie: 'session=abc123' });
      const result = await stub.getSession({ headers });

      expect(result).not.toBeNull();
      expect(result?.user.id).toBe('user-1');
      expect(result?.user.email).toBe('user@example.com');
      expect(result?.session.userId).toBe('user-1');
      expect(result?.session.token).toBe('tok-abc');
    });
  });
});

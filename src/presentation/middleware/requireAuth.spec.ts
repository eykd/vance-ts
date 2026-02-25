import { Hono } from 'hono/tiny';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthService } from '../../application/ports/AuthService.js';

import { createRequireAuth } from './requireAuth.js';

/**
 * Creates a minimal AuthService mock with vi.fn() stubs.
 *
 * @returns An object with `vi.fn()` stubs for each AuthService method.
 */
function makeAuthServiceMock(): {
  getSession: ReturnType<typeof vi.fn>;
  signIn: ReturnType<typeof vi.fn>;
  signUp: ReturnType<typeof vi.fn>;
  signOut: ReturnType<typeof vi.fn>;
  verifyDummyPassword: ReturnType<typeof vi.fn>;
} {
  return {
    getSession: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    verifyDummyPassword: vi.fn().mockResolvedValue(undefined),
  };
}

/** Secret used in tests — 32-char minimum for HMAC-SHA256 derivation. */
const TEST_SECRET = 'a'.repeat(32);

/** A full AuthUser fixture satisfying the domain interface. */
const TEST_USER = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'test',
  emailVerified: false,
  createdAt: '2026-01-01T00:00:00.000Z',
} as const;

/** A full AuthSession fixture satisfying the domain interface. */
const TEST_SESSION = {
  id: 'sess-1',
  token: 'session-token-abc',
  userId: 'user-1',
  expiresAt: '2026-03-01T00:00:00.000Z',
  createdAt: '2026-02-01T00:00:00.000Z',
} as const;

describe('createRequireAuth', () => {
  let authServiceMock: ReturnType<typeof makeAuthServiceMock>;

  beforeEach(() => {
    authServiceMock = makeAuthServiceMock();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Builds a minimal Hono app with the requireAuth middleware applied to all
   * routes and one protected GET route for exercising the middleware.
   *
   * @returns A Hono app instance.
   */
  function makeTestApp(): Hono {
    const app = new Hono();
    const middleware = createRequireAuth(authServiceMock as unknown as AuthService, TEST_SECRET);
    app.use('*', middleware);
    app.get('/protected', (c) => c.text('protected content'));
    return app;
  }

  it('returns 503 with Retry-After: 30 when authService.getSession throws (D1 error)', async () => {
    authServiceMock.getSession.mockRejectedValue(new Error('D1 unavailable'));

    const app = makeTestApp();
    const res = await app.fetch(new Request('https://example.com/protected'));

    expect(res.status).toBe(503);
    expect(res.headers.get('Retry-After')).toBe('30');
  });

  it('redirects to /auth/sign-in with redirectTo when session is null (unauthenticated)', async () => {
    authServiceMock.getSession.mockResolvedValue(null);

    const app = makeTestApp();
    const res = await app.fetch(new Request('https://example.com/protected?q=1'));

    expect(res.status).toBe(302);
    const location = res.headers.get('Location') ?? '';
    expect(location).toContain('/auth/sign-in');
    expect(location).toContain('redirectTo=');
    expect(location).toContain(encodeURIComponent('/protected?q=1'));
  });

  it('redirects to /auth/sign-in when session has expired (null return from getSession)', async () => {
    authServiceMock.getSession.mockResolvedValue(null);

    const app = makeTestApp();
    const res = await app.fetch(new Request('https://example.com/protected'));

    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toContain('/auth/sign-in');
  });

  it('clears the session cookie when redirecting and a stale session cookie is present in the request', async () => {
    authServiceMock.getSession.mockResolvedValue(null);

    const app = makeTestApp();
    const res = await app.fetch(
      new Request('https://example.com/protected', {
        headers: { Cookie: '__Host-better-auth.session_token=stale-token' },
      })
    );

    expect(res.status).toBe(302);
    const setCookie = res.headers.get('Set-Cookie') ?? '';
    expect(setCookie).toContain('better-auth.session');
    expect(setCookie).toContain('Max-Age=0');
  });

  it('passes through to the next handler when session is valid (authenticated)', async () => {
    authServiceMock.getSession.mockResolvedValue({ user: TEST_USER, session: TEST_SESSION });

    const app = makeTestApp();
    const res = await app.fetch(new Request('https://example.com/protected'));

    expect(res.status).toBe(200);
    expect(await res.text()).toBe('protected content');
  });

  it('sets __Host-csrf cookie on valid session', async () => {
    authServiceMock.getSession.mockResolvedValue({ user: TEST_USER, session: TEST_SESSION });

    const app = makeTestApp();
    const res = await app.fetch(new Request('https://example.com/protected'));

    const setCookie = res.headers.get('Set-Cookie') ?? '';
    expect(setCookie).toContain('__Host-csrf=');
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('Secure');
    expect(setCookie).toContain('SameSite=Strict');
    expect(setCookie).toContain('Path=/');
    expect(setCookie).toContain('Max-Age=3600');
  });

  it('sets user, session, and csrfToken on Hono context for valid session', async () => {
    authServiceMock.getSession.mockResolvedValue({ user: TEST_USER, session: TEST_SESSION });

    let capturedUser: unknown;
    let capturedSession: unknown;
    let capturedCsrfToken: unknown;

    const app = new Hono();
    const middleware = createRequireAuth(authServiceMock as unknown as AuthService, TEST_SECRET);
    app.use('*', middleware);
    app.get('/protected', (c) => {
      capturedUser = c.get('user' as never);
      capturedSession = c.get('session' as never);
      capturedCsrfToken = c.get('csrfToken' as never);
      return c.text('ok');
    });

    await app.fetch(new Request('https://example.com/protected'));

    expect(capturedUser).toEqual(TEST_USER);
    expect(capturedSession).toEqual(TEST_SESSION);
    expect(typeof capturedCsrfToken).toBe('string');
    expect(capturedCsrfToken as string).toMatch(/^[0-9a-f]{64}$/);
  });
});

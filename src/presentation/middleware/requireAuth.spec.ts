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
} {
  return {
    getSession: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  };
}

/** Secret used in tests — 32-char minimum for HMAC-SHA256 derivation. */
const TEST_SECRET = 'a'.repeat(32);

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
    const middleware = createRequireAuth(
      authServiceMock as unknown as AuthService,
      TEST_SECRET
    );
    app.use('*', middleware);
    app.get('/protected', (c) => c.text('protected content'));
    return app;
  }

  it('redirects to /auth/sign-in when authService.getSession throws (fail-safe error handling)', async () => {
    authServiceMock.getSession.mockRejectedValue(new Error('D1 unavailable'));

    const app = makeTestApp();
    const res = await app.fetch(new Request('https://example.com/protected'));

    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toContain('/auth/sign-in');
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

  it('passes through to the next handler when session is valid (authenticated)', async () => {
    authServiceMock.getSession.mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'sess-1', userId: 'user-1' },
    });

    const app = makeTestApp();
    const res = await app.fetch(new Request('https://example.com/protected'));

    expect(res.status).toBe(200);
    expect(await res.text()).toBe('protected content');
  });
});

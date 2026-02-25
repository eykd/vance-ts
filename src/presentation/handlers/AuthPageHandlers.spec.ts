import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { SignInUseCase } from '../../application/use-cases/SignInUseCase.js';

import { AuthPageHandlers } from './AuthPageHandlers.js';

/**
 * Hoisted mock declarations — must be hoisted so they are available in the
 * vi.mock() factory function, which is executed before module imports.
 */
const mocks = vi.hoisted(() => ({
  verifyPassword: vi.fn<() => Promise<boolean>>().mockResolvedValue(false),
}));

vi.mock('../../domain/services/passwordHasher.js', () => ({
  verifyPassword: mocks.verifyPassword,
  hashPassword: vi.fn(),
}));

/** Fixed CSRF token used across test requests (64-char hex string). */
const TEST_CSRF = 'a'.repeat(64);

/** Cookie header containing the test CSRF token. */
const CSRF_COOKIE = `__Secure-csrf=${TEST_CSRF}`;

/**
 * Creates a minimal SignInUseCase mock with a vi.fn stub for execute.
 *
 * @returns An object with an `execute` vi.fn stub.
 */
function makeSignInUseCaseMock(): { execute: ReturnType<typeof vi.fn> } {
  return { execute: vi.fn() };
}

/**
 * Builds a POST /auth/sign-in request with CSRF token, cookie, and form body.
 *
 * @param options - Optional field overrides.
 * @param options.csrfToken - CSRF token in the form body (default: TEST_CSRF).
 * @param options.csrfCookie - CSRF token value in the Cookie header (default: TEST_CSRF).
 * @param options.email - Email address in the form body.
 * @param options.password - Password in the form body.
 * @param options.redirectTo - Optional redirectTo value in the form body.
 * @param options.contentType - Content-Type header value.
 * @param options.rawBody - If set, overrides the computed form body.
 * @returns A fully-formed POST Request.
 */
function makePostRequest(options?: {
  csrfToken?: string;
  csrfCookie?: string;
  email?: string;
  password?: string;
  redirectTo?: string;
  contentType?: string;
  rawBody?: string;
}): Request {
  const {
    csrfToken = TEST_CSRF,
    csrfCookie = TEST_CSRF,
    email = 'user@example.com',
    password = 'correcthorse12',
    redirectTo,
    contentType = 'application/x-www-form-urlencoded',
    rawBody,
  } = options ?? {};

  const params = new URLSearchParams({ _csrf: csrfToken, email, password });
  if (redirectTo !== undefined) {
    params.set('redirectTo', redirectTo);
  }

  return new Request('https://example.com/auth/sign-in', {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
      Cookie: `__Secure-csrf=${csrfCookie}`,
    },
    body: rawBody ?? params.toString(),
  });
}

describe('AuthPageHandlers', () => {
  let signInUseCaseMock: ReturnType<typeof makeSignInUseCaseMock>;
  let handlers: AuthPageHandlers;

  beforeEach(() => {
    signInUseCaseMock = makeSignInUseCaseMock();
    handlers = new AuthPageHandlers(signInUseCaseMock as unknown as SignInUseCase);
    mocks.verifyPassword.mockResolvedValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('DUMMY_HASH', () => {
    it('is a valid pbkdf2 format with 600000 iterations, 32-char salt, 64-char derived key', () => {
      expect(AuthPageHandlers.DUMMY_HASH).toMatch(/^pbkdf2\$600000\$[0-9a-f]{32}\$[0-9a-f]{64}$/);
    });
  });

  describe('handleGetSignIn', () => {
    it('returns 200 status', () => {
      const req = new Request('https://example.com/auth/sign-in');
      const res = handlers.handleGetSignIn(req);
      expect(res.status).toBe(200);
    });

    it('sets Content-Type to text/html', () => {
      const req = new Request('https://example.com/auth/sign-in');
      const res = handlers.handleGetSignIn(req);
      expect(res.headers.get('Content-Type')).toContain('text/html');
    });

    it('sets Cache-Control: no-store, no-cache', () => {
      const req = new Request('https://example.com/auth/sign-in');
      const res = handlers.handleGetSignIn(req);
      expect(res.headers.get('Cache-Control')).toBe('no-store, no-cache');
    });

    it('sets __Secure-csrf cookie with HttpOnly, Secure, SameSite=Strict, Path=/auth', () => {
      const req = new Request('https://example.com/auth/sign-in');
      const res = handlers.handleGetSignIn(req);
      const setCookie = res.headers.get('Set-Cookie') ?? '';
      expect(setCookie).toContain('__Secure-csrf=');
      expect(setCookie).toContain('HttpOnly');
      expect(setCookie).toContain('Secure');
      expect(setCookie).toContain('SameSite=Strict');
      expect(setCookie).toContain('Path=/auth');
    });

    it('applies security headers (X-Content-Type-Options, X-Frame-Options)', () => {
      const req = new Request('https://example.com/auth/sign-in');
      const res = handlers.handleGetSignIn(req);
      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('renders the sign-in form with email and password inputs', async () => {
      const req = new Request('https://example.com/auth/sign-in');
      const res = handlers.handleGetSignIn(req);
      const body = await res.text();
      expect(body).toContain('name="email"');
      expect(body).toContain('name="password"');
    });

    it('embeds the CSRF token in the form as a hidden _csrf field', async () => {
      const req = new Request('https://example.com/auth/sign-in');
      const res = handlers.handleGetSignIn(req);
      const setCookie = res.headers.get('Set-Cookie') ?? '';
      const match = /__Secure-csrf=([^;]+)/.exec(setCookie);
      const csrfToken = match?.[1];
      expect(csrfToken).toBeDefined();
      const body = await res.text();
      expect(body).toContain(`name="_csrf" value="${csrfToken ?? ''}"`);
    });

    it('does not show registered success banner by default', async () => {
      const req = new Request('https://example.com/auth/sign-in');
      const res = handlers.handleGetSignIn(req);
      const body = await res.text();
      expect(body).not.toContain('Account created successfully');
    });

    it('shows registered success banner when registered=true query param is set', async () => {
      const req = new Request('https://example.com/auth/sign-in?registered=true');
      const res = handlers.handleGetSignIn(req);
      const body = await res.text();
      expect(body).toContain('Account created successfully');
    });

    it('does not show registered success banner when registered=false', async () => {
      const req = new Request('https://example.com/auth/sign-in?registered=false');
      const res = handlers.handleGetSignIn(req);
      const body = await res.text();
      expect(body).not.toContain('Account created successfully');
    });

    it('includes redirectTo hidden field when redirectTo query param is present', async () => {
      const req = new Request('https://example.com/auth/sign-in?redirectTo=%2Fapp%2Fdashboard');
      const res = handlers.handleGetSignIn(req);
      const body = await res.text();
      expect(body).toContain('name="redirectTo"');
      expect(body).toContain('/app/dashboard');
    });

    it('does not include redirectTo hidden field when redirectTo query param is absent', async () => {
      const req = new Request('https://example.com/auth/sign-in');
      const res = handlers.handleGetSignIn(req);
      const body = await res.text();
      expect(body).not.toContain('name="redirectTo"');
    });
  });

  describe('handlePostSignIn', () => {
    describe('Content-Type validation', () => {
      it('returns 415 when Content-Type is application/json', async () => {
        const req = makePostRequest({ contentType: 'application/json' });
        const res = await handlers.handlePostSignIn(req);
        expect(res.status).toBe(415);
      });

      it('returns 415 when Content-Type is text/plain', async () => {
        const req = makePostRequest({ contentType: 'text/plain' });
        const res = await handlers.handlePostSignIn(req);
        expect(res.status).toBe(415);
      });

      it('returns 415 when Content-Type header is absent', async () => {
        const req = new Request('https://example.com/auth/sign-in', {
          method: 'POST',
          headers: { Cookie: CSRF_COOKIE },
          body: `_csrf=${TEST_CSRF}&email=user@example.com&password=pass12`,
        });
        const res = await handlers.handlePostSignIn(req);
        expect(res.status).toBe(415);
      });

      it('accepts Content-Type with charset suffix', async () => {
        signInUseCaseMock.execute.mockResolvedValue({
          ok: false,
          kind: 'rate_limited',
        });
        const req = makePostRequest({
          contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        });
        const res = await handlers.handlePostSignIn(req);
        expect(res.status).not.toBe(415);
      });
    });

    describe('body size validation', () => {
      it('returns 413 when body exceeds 4096 bytes', async () => {
        const oversizedBody = 'x'.repeat(4097);
        const req = new Request('https://example.com/auth/sign-in', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Cookie: CSRF_COOKIE,
          },
          body: oversizedBody,
        });
        const res = await handlers.handlePostSignIn(req);
        expect(res.status).toBe(413);
      });

      it('accepts body of exactly 4096 bytes', async () => {
        signInUseCaseMock.execute.mockResolvedValue({
          ok: false,
          kind: 'rate_limited',
        });
        const prefix = `_csrf=${TEST_CSRF}&email=u@b.co&password=pass12&pad=`;
        const paddedBody = prefix + 'x'.repeat(4096 - prefix.length);
        expect(paddedBody.length).toBe(4096);
        const req = new Request('https://example.com/auth/sign-in', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Cookie: CSRF_COOKIE,
          },
          body: paddedBody,
        });
        const res = await handlers.handlePostSignIn(req);
        expect(res.status).not.toBe(413);
      });
    });

    describe('CSRF validation', () => {
      it('returns 403 when the CSRF cookie is absent', async () => {
        const req = new Request('https://example.com/auth/sign-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `_csrf=${TEST_CSRF}&email=user@example.com&password=pass12`,
        });
        const res = await handlers.handlePostSignIn(req);
        expect(res.status).toBe(403);
      });

      it('returns 403 when form _csrf token does not match cookie token', async () => {
        const req = makePostRequest({ csrfToken: 'wrong-token', csrfCookie: TEST_CSRF });
        const res = await handlers.handlePostSignIn(req);
        expect(res.status).toBe(403);
      });

      it('returns 403 when form _csrf token is empty', async () => {
        const req = makePostRequest({ csrfToken: '' });
        const res = await handlers.handlePostSignIn(req);
        expect(res.status).toBe(403);
      });
    });

    describe('successful sign-in', () => {
      const sessionCookie = '__Host-better-auth.session-token=sess123; Path=/; HttpOnly; Secure';

      beforeEach(() => {
        signInUseCaseMock.execute.mockResolvedValue({ ok: true, sessionCookie });
      });

      it('returns 303 redirect', async () => {
        const req = makePostRequest();
        const res = await handlers.handlePostSignIn(req);
        expect(res.status).toBe(303);
      });

      it('redirects to / when no redirectTo is provided in the form', async () => {
        const req = makePostRequest();
        const res = await handlers.handlePostSignIn(req);
        expect(res.headers.get('Location')).toBe('/');
      });

      it('redirects to valid redirectTo path from form field', async () => {
        const req = makePostRequest({ redirectTo: '/app/dashboard' });
        const res = await handlers.handlePostSignIn(req);
        expect(res.headers.get('Location')).toBe('/app/dashboard');
      });

      it('forwards the session cookie from better-auth', async () => {
        const req = makePostRequest();
        const res = await handlers.handlePostSignIn(req);
        const setCookies = res.headers.get('Set-Cookie') ?? '';
        expect(setCookies).toContain('better-auth.session-token=sess123');
      });

      it('clears the CSRF cookie on success', async () => {
        const req = makePostRequest();
        const res = await handlers.handlePostSignIn(req);
        const setCookies = res.headers.get('Set-Cookie') ?? '';
        expect(setCookies).toContain('__Secure-csrf=');
        expect(setCookies).toContain('Max-Age=0');
      });

      it('does not call verifyPassword on successful sign-in', async () => {
        const req = makePostRequest();
        await handlers.handlePostSignIn(req);
        expect(mocks.verifyPassword).not.toHaveBeenCalled();
      });

      it('passes email, password, and IP to the sign-in use case', async () => {
        const req = makePostRequest({ email: 'alice@example.com', password: 'hunter2abcdef' });
        await handlers.handlePostSignIn(req);
        expect(signInUseCaseMock.execute).toHaveBeenCalledWith({
          email: 'alice@example.com',
          password: 'hunter2abcdef',
          ip: 'unknown', // extractClientIp returns 'unknown' when CF-Connecting-IP is absent
        });
      });
    });

    describe('invalid credentials', () => {
      beforeEach(() => {
        signInUseCaseMock.execute.mockResolvedValue({
          ok: false,
          kind: 'invalid_credentials',
        });
      });

      it('returns 200 with a generic error message', async () => {
        const req = makePostRequest();
        const res = await handlers.handlePostSignIn(req);
        expect(res.status).toBe(200);
        const body = await res.text();
        expect(body).toContain('Invalid email or password');
      });

      it('calls verifyPassword with the submitted password and DUMMY_HASH (FR-007)', async () => {
        const req = makePostRequest({ password: 'wrongpassword12' });
        await handlers.handlePostSignIn(req);
        expect(mocks.verifyPassword).toHaveBeenCalledWith(
          'wrongpassword12',
          AuthPageHandlers.DUMMY_HASH
        );
      });

      it('re-renders the login form with the submitted email pre-filled', async () => {
        const req = makePostRequest({ email: 'alice@example.com' });
        const res = await handlers.handlePostSignIn(req);
        const body = await res.text();
        expect(body).toContain('alice@example.com');
      });

      it('sets Cache-Control: no-store, no-cache on the error response', async () => {
        const req = makePostRequest();
        const res = await handlers.handlePostSignIn(req);
        expect(res.headers.get('Cache-Control')).toBe('no-store, no-cache');
      });

      it('sets a fresh CSRF cookie on the error response', () => {
        const req = makePostRequest();
        const res = handlers.handleGetSignIn(req);
        const setCookie = res.headers.get('Set-Cookie') ?? '';
        expect(setCookie).toContain('__Secure-csrf=');
        expect(setCookie).toContain('Max-Age=3600');
      });

      it('includes redirectTo in re-rendered form when original redirectTo was valid', async () => {
        const req = makePostRequest({ redirectTo: '/app/dashboard' });
        const res = await handlers.handlePostSignIn(req);
        const body = await res.text();
        expect(body).toContain('name="redirectTo"');
        expect(body).toContain('/app/dashboard');
      });

      it('does not include redirectTo in re-rendered form when redirectTo was absent', async () => {
        const req = makePostRequest();
        const res = await handlers.handlePostSignIn(req);
        const body = await res.text();
        expect(body).not.toContain('name="redirectTo"');
      });
    });

    describe('service error', () => {
      beforeEach(() => {
        signInUseCaseMock.execute.mockResolvedValue({
          ok: false,
          kind: 'service_error',
        });
      });

      it('returns 200 with a generic error message', async () => {
        const req = makePostRequest();
        const res = await handlers.handlePostSignIn(req);
        expect(res.status).toBe(200);
        const body = await res.text();
        expect(body).toContain('Invalid email or password');
      });

      it('calls verifyPassword with the submitted password and DUMMY_HASH (FR-007)', async () => {
        const req = makePostRequest({ password: 'somepassword12' });
        await handlers.handlePostSignIn(req);
        expect(mocks.verifyPassword).toHaveBeenCalledWith(
          'somepassword12',
          AuthPageHandlers.DUMMY_HASH
        );
      });
    });

    describe('rate limited', () => {
      it('returns 429 when the use case returns rate_limited', async () => {
        signInUseCaseMock.execute.mockResolvedValue({ ok: false, kind: 'rate_limited' });
        const req = makePostRequest();
        const res = await handlers.handlePostSignIn(req);
        expect(res.status).toBe(429);
      });

      it('includes Retry-After header when retryAfter is provided', async () => {
        signInUseCaseMock.execute.mockResolvedValue({
          ok: false,
          kind: 'rate_limited',
          retryAfter: 900,
        });
        const req = makePostRequest();
        const res = await handlers.handlePostSignIn(req);
        expect(res.headers.get('Retry-After')).toBe('900');
      });

      it('does not include Retry-After header when retryAfter is undefined', async () => {
        signInUseCaseMock.execute.mockResolvedValue({
          ok: false,
          kind: 'rate_limited',
        });
        const req = makePostRequest();
        const res = await handlers.handlePostSignIn(req);
        expect(res.headers.get('Retry-After')).toBeNull();
      });

      it('does not call verifyPassword on rate_limited (timing oracle defence skipped)', async () => {
        signInUseCaseMock.execute.mockResolvedValue({ ok: false, kind: 'rate_limited' });
        const req = makePostRequest();
        await handlers.handlePostSignIn(req);
        expect(mocks.verifyPassword).not.toHaveBeenCalled();
      });
    });

    describe('redirectTo validation in POST body', () => {
      beforeEach(() => {
        signInUseCaseMock.execute.mockResolvedValue({
          ok: true,
          sessionCookie: 'session=abc; Path=/; HttpOnly',
        });
      });

      it('redirects to / when redirectTo is absent from form', async () => {
        const req = makePostRequest();
        const res = await handlers.handlePostSignIn(req);
        expect(res.headers.get('Location')).toBe('/');
      });

      it('redirects to / when redirectTo is empty string', async () => {
        const req = makePostRequest({ redirectTo: '' });
        const res = await handlers.handlePostSignIn(req);
        expect(res.headers.get('Location')).toBe('/');
      });

      it('redirects to / when redirectTo starts with // (open redirect prevention)', async () => {
        const req = makePostRequest({ redirectTo: '//evil.com' });
        const res = await handlers.handlePostSignIn(req);
        expect(res.headers.get('Location')).toBe('/');
      });

      it('redirects to / when redirectTo starts with /api/ (blocked prefix)', async () => {
        const req = makePostRequest({ redirectTo: '/api/data' });
        const res = await handlers.handlePostSignIn(req);
        expect(res.headers.get('Location')).toBe('/');
      });

      it('redirects to / when redirectTo starts with /auth/ (blocked prefix)', async () => {
        const req = makePostRequest({ redirectTo: '/auth/sign-in' });
        const res = await handlers.handlePostSignIn(req);
        expect(res.headers.get('Location')).toBe('/');
      });

      it('extracts only the pathname from an absolute URL (no open redirect to external host)', async () => {
        // validateRedirectTo canonicalises via new URL(..., 'http://localhost'),
        // which discards the origin and returns only pathname + search.
        // 'https://evil.com/steal' → '/steal' (redirects to same server, not evil.com)
        const req = makePostRequest({ redirectTo: 'https://evil.com/steal' });
        const res = await handlers.handlePostSignIn(req);
        expect(res.headers.get('Location')).toBe('/steal');
      });

      it('redirects to validated path with query string preserved', async () => {
        const req = makePostRequest({ redirectTo: '/app/tasks?filter=active' });
        const res = await handlers.handlePostSignIn(req);
        expect(res.headers.get('Location')).toBe('/app/tasks?filter=active');
      });
    });
  });
});

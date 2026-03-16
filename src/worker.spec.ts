import type { Context, Next } from 'hono';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { AppEnv } from './presentation/types';
import type { Env } from './shared/env';
import app from './worker';

/**
 * Hoisted mock factories — must be hoisted so they are available in vi.mock()
 * factory functions, which run before module imports.
 */
const mocks = vi.hoisted(() => {
  const authHandlerFn = vi.fn<[Request], Promise<Response>>();
  const handleGetSignIn = vi.fn<[Request], Response>();
  const handlePostSignIn = vi.fn<[Request], Promise<Response>>();
  const handleGetSignUp = vi.fn<[Request], Response>();
  const handlePostSignUp = vi.fn<[Request], Promise<Response>>();
  const handlePostSignOut = vi.fn<[Request], Promise<Response>>();
  /** Default: passes through by calling next() (authenticated). */
  const requireAuthMiddlewareFn = vi.fn(
    async (_c: Context<AppEnv>, next: Next): Promise<Response | void> => next()
  );
  /** Default: passes through by calling next() (not rate limited). */
  const signInApiRateLimitMiddlewareFn = vi.fn(
    async (_c: Context<AppEnv>, next: Next): Promise<Response | void> => next()
  );
  /** Default: passes through by calling next() (not rate limited). */
  const signUpApiRateLimitMiddlewareFn = vi.fn(
    async (_c: Context<AppEnv>, next: Next): Promise<Response | void> => next()
  );

  const mockFactory = {
    authHandler: authHandlerFn,
    authPageHandlers: {
      handleGetSignIn,
      handlePostSignIn,
      handleGetSignUp,
      handlePostSignUp,
      handlePostSignOut,
    },
    requireAuthMiddleware: requireAuthMiddlewareFn,
    signInApiRateLimitMiddleware: signInApiRateLimitMiddlewareFn,
    signUpApiRateLimitMiddleware: signUpApiRateLimitMiddlewareFn,
  };

  return {
    authHandlerFn,
    handleGetSignIn,
    handlePostSignIn,
    handleGetSignUp,
    handlePostSignUp,
    handlePostSignOut,
    requireAuthMiddlewareFn,
    signInApiRateLimitMiddlewareFn,
    signUpApiRateLimitMiddlewareFn,
    mockFactory,
  };
});

vi.mock('./di/serviceFactory', () => ({
  getServiceFactory: vi.fn().mockReturnValue(mocks.mockFactory),
  resetServiceFactory: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

/**
 * Builds a mock Env with a spy for ASSETS.fetch.
 *
 * @param assetResponse - Optional Response to return from ASSETS.fetch.
 * @returns A mock Env with ASSETS.fetch as a Vitest spy.
 */
function mockEnv(assetResponse?: Response): Env {
  return {
    ASSETS: {
      fetch: vi.fn().mockResolvedValue(assetResponse ?? new Response('static')),
      connect: vi.fn(),
    } as unknown as Fetcher,
  } as unknown as Env;
}

describe('Worker', () => {
  describe('GET /api/health', () => {
    it('returns 200 JSON with status ok', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/health');

      const res = await app.fetch(req, env);

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ status: 'ok' });
    });

    it('includes security headers', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/health');

      const res = await app.fetch(req, env);

      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
      expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    });
  });

  describe('GET /api/nonexistent', () => {
    it('returns 404 JSON', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/nonexistent');

      const res = await app.fetch(req, env);

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: 'Not found' });
    });

    it('includes security headers on 404', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/nonexistent');

      const res = await app.fetch(req, env);

      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
      expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    });
  });

  describe('POST /app/_/nonexistent', () => {
    it('returns 404 JSON', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/app/_/nonexistent', { method: 'POST' });

      const res = await app.fetch(req, env);

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: 'Not found' });
    });

    it('includes security headers on 404', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/app/_/nonexistent', { method: 'POST' });

      const res = await app.fetch(req, env);

      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
      expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    });
  });

  describe('static asset fallthrough', () => {
    it('delegates non-API/app paths to env.ASSETS.fetch', async () => {
      const assetResponse = new Response('<html>homepage</html>', {
        headers: { 'Content-Type': 'text/html' },
      });
      const fetchSpy = vi.fn().mockResolvedValue(assetResponse);
      const env: Env = {
        ASSETS: {
          fetch: fetchSpy,
          connect: vi.fn(),
        } as unknown as Fetcher,
      } as unknown as Env;
      const req = new Request('https://example.com/about');

      const res = await app.fetch(req, env);

      expect(fetchSpy).toHaveBeenCalledWith(req);
      expect(res).toBe(assetResponse);
    });
  });

  describe('GET /auth/sign-in', () => {
    it('delegates to authPageHandlers.handleGetSignIn and returns the response', async () => {
      const env = mockEnv();
      const handlerResponse = new Response('<html>sign-in</html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });
      mocks.handleGetSignIn.mockReturnValue(handlerResponse);

      const req = new Request('https://example.com/auth/sign-in');
      const res = await app.fetch(req, env);

      expect(mocks.handleGetSignIn).toHaveBeenCalledWith(req);
      expect(res.status).toBe(200);
    });

    it('applies security headers to the response', async () => {
      const env = mockEnv();
      mocks.handleGetSignIn.mockReturnValue(new Response('<html>sign-in</html>', { status: 200 }));

      const req = new Request('https://example.com/auth/sign-in');
      const res = await app.fetch(req, env);

      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
      expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    });
  });

  describe('POST /auth/sign-in', () => {
    it('delegates to authPageHandlers.handlePostSignIn and returns the response', async () => {
      const env = mockEnv();
      const handlerResponse = new Response(null, {
        status: 303,
        headers: { Location: '/' },
      });
      mocks.handlePostSignIn.mockResolvedValue(handlerResponse);

      const req = new Request('https://example.com/auth/sign-in', { method: 'POST' });
      const res = await app.fetch(req, env);

      expect(mocks.handlePostSignIn).toHaveBeenCalledWith(req);
      expect(res.status).toBe(303);
    });

    it('applies security headers to the response', async () => {
      const env = mockEnv();
      mocks.handlePostSignIn.mockResolvedValue(
        new Response(null, { status: 303, headers: { Location: '/' } })
      );

      const req = new Request('https://example.com/auth/sign-in', { method: 'POST' });
      const res = await app.fetch(req, env);

      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
      expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    });
  });

  describe('GET /auth/sign-up', () => {
    it('delegates to authPageHandlers.handleGetSignUp and returns the response', async () => {
      const env = mockEnv();
      const handlerResponse = new Response('<html>sign-up</html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });
      mocks.handleGetSignUp.mockReturnValue(handlerResponse);

      const req = new Request('https://example.com/auth/sign-up');
      const res = await app.fetch(req, env);

      expect(mocks.handleGetSignUp).toHaveBeenCalledWith(req);
      expect(res.status).toBe(200);
    });

    it('applies security headers to the response', async () => {
      const env = mockEnv();
      mocks.handleGetSignUp.mockReturnValue(new Response('<html>sign-up</html>', { status: 200 }));

      const req = new Request('https://example.com/auth/sign-up');
      const res = await app.fetch(req, env);

      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
      expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    });
  });

  describe('POST /auth/sign-up', () => {
    it('delegates to authPageHandlers.handlePostSignUp and returns the response', async () => {
      const env = mockEnv();
      const handlerResponse = new Response(null, {
        status: 303,
        headers: { Location: '/' },
      });
      mocks.handlePostSignUp.mockResolvedValue(handlerResponse);

      const req = new Request('https://example.com/auth/sign-up', { method: 'POST' });
      const res = await app.fetch(req, env);

      expect(mocks.handlePostSignUp).toHaveBeenCalledWith(req);
      expect(res.status).toBe(303);
    });

    it('applies security headers to the response', async () => {
      const env = mockEnv();
      mocks.handlePostSignUp.mockResolvedValue(
        new Response(null, { status: 303, headers: { Location: '/' } })
      );

      const req = new Request('https://example.com/auth/sign-up', { method: 'POST' });
      const res = await app.fetch(req, env);

      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
      expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    });
  });

  describe('POST /auth/sign-out', () => {
    it('delegates to authPageHandlers.handlePostSignOut and returns the response', async () => {
      const env = mockEnv();
      const handlerResponse = new Response(null, {
        status: 303,
        headers: { Location: '/auth/sign-in' },
      });
      mocks.handlePostSignOut.mockResolvedValue(handlerResponse);

      const req = new Request('https://example.com/auth/sign-out', { method: 'POST' });
      const res = await app.fetch(req, env);

      expect(mocks.handlePostSignOut).toHaveBeenCalledWith(req);
      expect(res.status).toBe(303);
    });

    it('applies security headers to the response', async () => {
      const env = mockEnv();
      mocks.handlePostSignOut.mockResolvedValue(
        new Response(null, { status: 303, headers: { Location: '/auth/sign-in' } })
      );

      const req = new Request('https://example.com/auth/sign-out', { method: 'POST' });
      const res = await app.fetch(req, env);

      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
      expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    });
  });

  describe('405 Method Not Allowed on auth page routes', () => {
    it.each([
      { path: '/auth/sign-in', method: 'PUT', allow: 'GET, POST' },
      { path: '/auth/sign-in', method: 'DELETE', allow: 'GET, POST' },
      { path: '/auth/sign-in', method: 'PATCH', allow: 'GET, POST' },
      { path: '/auth/sign-up', method: 'PUT', allow: 'GET, POST' },
      { path: '/auth/sign-up', method: 'DELETE', allow: 'GET, POST' },
      { path: '/auth/sign-up', method: 'PATCH', allow: 'GET, POST' },
      { path: '/auth/sign-out', method: 'GET', allow: 'POST' },
      { path: '/auth/sign-out', method: 'PUT', allow: 'POST' },
      { path: '/auth/sign-out', method: 'DELETE', allow: 'POST' },
      { path: '/auth/sign-out', method: 'PATCH', allow: 'POST' },
    ])('returns 405 for $method $path with Allow: $allow', async ({ path, method, allow }) => {
      const env = mockEnv();
      const req = new Request(`https://example.com${path}`, { method });

      const res = await app.fetch(req, env);

      expect(res.status).toBe(405);
      expect(res.headers.get('Allow')).toBe(allow);
    });

    it('includes security headers on 405 responses', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/auth/sign-out', { method: 'PUT' });

      const res = await app.fetch(req, env);

      expect(res.status).toBe(405);
      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('does not delegate to auth page handlers for unsupported methods', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/auth/sign-out', { method: 'DELETE' });

      await app.fetch(req, env);

      expect(mocks.handlePostSignOut).not.toHaveBeenCalled();
      expect(mocks.handleGetSignIn).not.toHaveBeenCalled();
      expect(mocks.handlePostSignIn).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/auth/*', () => {
    it('delegates to authHandler before /api/* catch-all', async () => {
      const env = mockEnv();
      const authApiResponse = new Response(JSON.stringify({ session: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
      mocks.authHandlerFn.mockResolvedValue(authApiResponse);

      const req = new Request('https://example.com/api/auth/session');
      const res = await app.fetch(req, env);

      expect(mocks.authHandlerFn).toHaveBeenCalledWith(req);
      expect(res.status).toBe(200);
    });

    it('does not return 404 for /api/auth/* (delegated before catch-all)', async () => {
      const env = mockEnv();
      mocks.authHandlerFn.mockResolvedValue(new Response(null, { status: 200 }));

      const req = new Request('https://example.com/api/auth/session');
      const res = await app.fetch(req, env);

      expect(res.status).not.toBe(404);
    });

    it('applies security headers to /api/auth/* responses', async () => {
      const env = mockEnv();
      mocks.authHandlerFn.mockResolvedValue(
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const req = new Request('https://example.com/api/auth/session');
      const res = await app.fetch(req, env);

      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
      expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    });
  });

  describe('OAuth callback routing (US-5 extensibility)', () => {
    it('routes GET /api/auth/callback/:provider to authHandler via the /api/auth/* wildcard (no dedicated route needed)', async () => {
      const env = mockEnv();
      const callbackRedirect = new Response(null, {
        status: 302,
        headers: { Location: '/app' },
      });
      mocks.authHandlerFn.mockResolvedValue(callbackRedirect);

      const req = new Request('https://example.com/api/auth/callback/google');
      const res = await app.fetch(req, env);

      expect(mocks.authHandlerFn).toHaveBeenCalledWith(req);
      expect(res.status).toBe(302);
    });
  });

  describe('POST /api/auth/*', () => {
    it('delegates POST /api/auth/sign-in/email to authHandler', async () => {
      const env = mockEnv();
      mocks.authHandlerFn.mockResolvedValue(
        new Response(JSON.stringify({ token: 'abc' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const req = new Request('https://example.com/api/auth/sign-in/email', { method: 'POST' });
      const res = await app.fetch(req, env);

      expect(mocks.authHandlerFn).toHaveBeenCalledWith(req);
      expect(res.status).toBe(200);
    });

    it('applies security headers to POST /api/auth/* responses', async () => {
      const env = mockEnv();
      mocks.authHandlerFn.mockResolvedValue(new Response(null, { status: 200 }));

      const req = new Request('https://example.com/api/auth/sign-in/email', { method: 'POST' });
      const res = await app.fetch(req, env);

      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    });
  });

  describe('POST /api/auth/sign-in/* rate limiting', () => {
    it('returns 429 when signInApiRateLimitMiddleware short-circuits the request', async () => {
      const env = mockEnv();
      mocks.signInApiRateLimitMiddlewareFn.mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Too many requests' }), {
          status: 429,
          headers: { 'Retry-After': '60', 'Content-Type': 'application/json' },
        })
      );

      const req = new Request('https://example.com/api/auth/sign-in/email', { method: 'POST' });
      const res = await app.fetch(req, env);

      expect(res.status).toBe(429);
      expect(mocks.authHandlerFn).not.toHaveBeenCalled();
    });

    it('delegates to authHandler when rate limit middleware passes through', async () => {
      const env = mockEnv();
      mocks.authHandlerFn.mockResolvedValue(new Response(null, { status: 200 }));

      const req = new Request('https://example.com/api/auth/sign-in/email', { method: 'POST' });
      const res = await app.fetch(req, env);

      expect(mocks.signInApiRateLimitMiddlewareFn).toHaveBeenCalled();
      expect(mocks.authHandlerFn).toHaveBeenCalledWith(req);
      expect(res.status).toBe(200);
    });

    it('does not apply sign-in rate limiting to GET /api/auth/sign-in/* requests', async () => {
      const env = mockEnv();
      mocks.authHandlerFn.mockResolvedValue(new Response(null, { status: 200 }));

      const req = new Request('https://example.com/api/auth/sign-in/email', { method: 'GET' });
      await app.fetch(req, env);

      expect(mocks.signInApiRateLimitMiddlewareFn).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/sign-up/* rate limiting', () => {
    it('returns 429 when signUpApiRateLimitMiddleware short-circuits the request', async () => {
      const env = mockEnv();
      mocks.signUpApiRateLimitMiddlewareFn.mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Too many requests' }), {
          status: 429,
          headers: { 'Retry-After': '60', 'Content-Type': 'application/json' },
        })
      );

      const req = new Request('https://example.com/api/auth/sign-up/email', { method: 'POST' });
      const res = await app.fetch(req, env);

      expect(res.status).toBe(429);
      expect(mocks.authHandlerFn).not.toHaveBeenCalled();
    });

    it('delegates to authHandler when rate limit middleware passes through', async () => {
      const env = mockEnv();
      mocks.authHandlerFn.mockResolvedValue(new Response(null, { status: 200 }));

      const req = new Request('https://example.com/api/auth/sign-up/email', { method: 'POST' });
      const res = await app.fetch(req, env);

      expect(mocks.signUpApiRateLimitMiddlewareFn).toHaveBeenCalled();
      expect(mocks.authHandlerFn).toHaveBeenCalledWith(req);
      expect(res.status).toBe(200);
    });

    it('does not apply sign-up rate limiting to GET /api/auth/sign-up/* requests', async () => {
      const env = mockEnv();
      mocks.authHandlerFn.mockResolvedValue(new Response(null, { status: 200 }));

      const req = new Request('https://example.com/api/auth/sign-up/email', { method: 'GET' });
      await app.fetch(req, env);

      expect(mocks.signUpApiRateLimitMiddlewareFn).not.toHaveBeenCalled();
    });
  });

  describe('/dashboard/* requireAuth middleware', () => {
    it('invokes requireAuthMiddleware for /dashboard/ requests', async () => {
      const env = mockEnv();

      const req = new Request('https://example.com/dashboard/');
      await app.fetch(req, env);

      expect(mocks.requireAuthMiddlewareFn).toHaveBeenCalled();
    });

    it('applies security headers to /dashboard/ responses', async () => {
      const env = mockEnv();

      const req = new Request('https://example.com/dashboard/');
      const res = await app.fetch(req, env);

      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
      expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    });

    it('invokes requireAuthMiddleware for /dashboard (no trailing slash)', async () => {
      const env = mockEnv();

      const req = new Request('https://example.com/dashboard');
      await app.fetch(req, env);

      expect(mocks.requireAuthMiddlewareFn).toHaveBeenCalled();
    });

    it('applies security headers to /dashboard (no trailing slash)', async () => {
      const env = mockEnv();

      const req = new Request('https://example.com/dashboard');
      const res = await app.fetch(req, env);

      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
      expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    });
  });

  describe('/app/* requireAuth middleware', () => {
    it('redirects unauthenticated requests to /auth/sign-in', async () => {
      const env = mockEnv();
      mocks.requireAuthMiddlewareFn.mockImplementationOnce(
        (): Promise<Response> =>
          Promise.resolve(
            new Response(null, {
              status: 302,
              headers: { Location: '/auth/sign-in?redirectTo=%2Fapp%2Fdashboard' },
            })
          )
      );

      const req = new Request('https://example.com/app/dashboard');
      const res = await app.fetch(req, env);

      expect(res.status).toBe(302);
      expect(res.headers.get('Location')).toBe('/auth/sign-in?redirectTo=%2Fapp%2Fdashboard');
    });

    it('passes through authenticated requests to the next handler', async () => {
      const assetResponse = new Response('<html>app</html>', { status: 200 });
      const env = mockEnv(assetResponse);

      const req = new Request('https://example.com/app/dashboard');
      const res = await app.fetch(req, env);

      expect(res.status).toBe(200);
    });
  });
});

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
  const authHandlerFn = vi.fn<(req: Request) => Promise<Response>>();
  const handleGetSignIn = vi.fn<(req: Request) => Response>();
  const handlePostSignIn = vi.fn<(req: Request) => Promise<Response>>();
  const handleGetSignUp = vi.fn<(req: Request) => Response>();
  const handlePostSignUp = vi.fn<(req: Request) => Promise<Response>>();
  const handleGetSignOut = vi.fn<(req: Request) => Response>();
  const handlePostSignOut = vi.fn<(req: Request) => Promise<Response>>();
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
  /** Default: passes through by calling next() (authenticated). */
  const requireApiAuthMiddlewareFn = vi.fn(
    async (_c: unknown, next: unknown): Promise<Response | void> => (next as () => Promise<void>)()
  );
  /** Default: passes through by calling next() (workspace provisioned). */
  const requireWorkspaceMiddlewareFn = vi.fn(
    async (_c: unknown, next: unknown): Promise<Response | void> => (next as () => Promise<void>)()
  );
  /** Default: returns 200 OK. */
  const handleListAreas = vi.fn(
    (): Promise<Response> => Promise.resolve(new Response(null, { status: 200 }))
  );
  /** Default: returns 200 OK. */
  const handleListContexts = vi.fn(
    (): Promise<Response> => Promise.resolve(new Response(null, { status: 200 }))
  );
  /** Default: returns 201 Created. */
  const handleCaptureInboxItem = vi.fn(
    (): Promise<Response> => Promise.resolve(new Response(null, { status: 201 }))
  );
  /** Default: returns 200 OK. */
  const handleListInboxItems = vi.fn(
    (): Promise<Response> => Promise.resolve(new Response(null, { status: 200 }))
  );
  /** Default: returns 200 OK. */
  const handleClarify = vi.fn(
    (): Promise<Response> => Promise.resolve(new Response(null, { status: 200 }))
  );
  /** Default: returns 200 OK. */
  const handleActivate = vi.fn(
    (): Promise<Response> => Promise.resolve(new Response(null, { status: 200 }))
  );
  /** Default: returns 200 OK. */
  const handleComplete = vi.fn(
    (): Promise<Response> => Promise.resolve(new Response(null, { status: 200 }))
  );
  /** Default: returns 200 OK. */
  const handleListActions = vi.fn(
    (): Promise<Response> => Promise.resolve(new Response(null, { status: 200 }))
  );

  /** Default: returns 200 OK HTML. */
  const handleGetDashboard = vi.fn(
    (): Promise<Response> =>
      Promise.resolve(new Response('<html>dashboard</html>', { status: 200 }))
  );
  /** Default: returns 200 OK HTML. */
  const handleGetInbox = vi.fn(
    (): Promise<Response> => Promise.resolve(new Response('<html>inbox</html>', { status: 200 }))
  );
  /** Default: returns 200 OK HTML. */
  const handleGetActions = vi.fn(
    (): Promise<Response> => Promise.resolve(new Response('<html>actions</html>', { status: 200 }))
  );

  /** Default: returns 200 OK HTML. */
  const handleCaptureInbox = vi.fn(
    (): Promise<Response> => Promise.resolve(new Response('<li>captured</li>', { status: 200 }))
  );
  /** Default: returns 200 OK HTML. */
  const handleClarifyInbox = vi.fn(
    (): Promise<Response> => Promise.resolve(new Response('<li>clarified</li>', { status: 200 }))
  );
  /** Default: returns 200 OK HTML. */
  const handleActivateAction = vi.fn(
    (): Promise<Response> => Promise.resolve(new Response('<li>activated</li>', { status: 200 }))
  );
  /** Default: returns 200 OK HTML. */
  const handleCompleteAction = vi.fn(
    (): Promise<Response> => Promise.resolve(new Response('<li>completed</li>', { status: 200 }))
  );

  const loggerError = vi.fn();

  const mockFactory = {
    authHandler: authHandlerFn,
    authPageHandlers: {
      handleGetSignIn,
      handlePostSignIn,
      handleGetSignUp,
      handlePostSignUp,
      handleGetSignOut,
      handlePostSignOut,
    },
    logger: { error: loggerError },
    requireAuthMiddleware: requireAuthMiddlewareFn,
    signInApiRateLimitMiddleware: signInApiRateLimitMiddlewareFn,
    signUpApiRateLimitMiddleware: signUpApiRateLimitMiddlewareFn,
    requireApiAuthMiddleware: requireApiAuthMiddlewareFn,
    requireWorkspaceMiddleware: requireWorkspaceMiddlewareFn,
    areaApiHandlers: { handleListAreas },
    contextApiHandlers: { handleListContexts },
    inboxItemApiHandlers: { handleCaptureInboxItem, handleListInboxItems },
    actionApiHandlers: { handleClarify, handleActivate, handleComplete, handleListActions },
    appPageHandlers: { handleGetDashboard, handleGetInbox, handleGetActions },
    appPartialHandlers: {
      handleCaptureInbox,
      handleClarifyInbox,
      handleActivateAction,
      handleCompleteAction,
    },
  };

  return {
    authHandlerFn,
    handleGetSignIn,
    handlePostSignIn,
    handleGetSignUp,
    handlePostSignUp,
    handleGetSignOut,
    handlePostSignOut,
    loggerError,
    requireAuthMiddlewareFn,
    signInApiRateLimitMiddlewareFn,
    signUpApiRateLimitMiddlewareFn,
    requireApiAuthMiddlewareFn,
    requireWorkspaceMiddlewareFn,
    handleListAreas,
    handleListContexts,
    handleCaptureInboxItem,
    handleListInboxItems,
    handleClarify,
    handleActivate,
    handleComplete,
    handleListActions,
    handleGetDashboard,
    handleGetInbox,
    handleGetActions,
    handleCaptureInbox,
    handleClarifyInbox,
    handleActivateAction,
    handleCompleteAction,
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
    BETTER_AUTH_URL: 'https://example.com',
    ASSETS: {
      fetch: vi.fn().mockResolvedValue(assetResponse ?? new Response('static')),
      connect: vi.fn(),
    } as unknown as Fetcher,
  } as unknown as Env;
}

/** Same-origin Origin header value matching BETTER_AUTH_URL in mockEnv. */
const SAME_ORIGIN = 'https://example.com';

/**
 * Asserts that the response includes the expected security headers.
 *
 * @param res - The Response to check.
 */
function expectSecurityHeaders(res: Response): void {
  expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
  expect(res.headers.get('X-Frame-Options')).toBe('DENY');
  expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
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

      expectSecurityHeaders(res);
    });
  });

  describe('HEAD /api/health', () => {
    it('does not duplicate response headers', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/health', { method: 'HEAD' });

      const res = await app.fetch(req, env);

      expect(res.status).toBe(200);
      // Count occurrences of each header name — duplicates would appear as multiple entries
      const headerCounts = new Map<string, number>();
      res.headers.forEach((_value, name) => {
        headerCounts.set(name, (headerCounts.get(name) ?? 0) + 1);
      });
      for (const [name, count] of headerCounts) {
        expect(count, `header "${name}" appeared ${count} times`).toBe(1);
      }
    });

    it('includes security headers', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/health', { method: 'HEAD' });

      const res = await app.fetch(req, env);

      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
      expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    });

    it('returns an empty body', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/health', { method: 'HEAD' });

      const res = await app.fetch(req, env);

      expect(res.body).toBeNull();
    });
  });

  describe('HEAD /api/health', () => {
    it('does not duplicate response headers', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/health', { method: 'HEAD' });

      const res = await app.fetch(req, env);

      expect(res.status).toBe(200);
      // Count occurrences of each header name — duplicates would appear as multiple entries
      const headerCounts = new Map<string, number>();
      res.headers.forEach((_value, name) => {
        headerCounts.set(name, (headerCounts.get(name) ?? 0) + 1);
      });
      for (const [name, count] of headerCounts) {
        expect(count, `header "${name}" appeared ${count} times`).toBe(1);
      }
    });

    it('includes security headers', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/health', { method: 'HEAD' });

      const res = await app.fetch(req, env);

      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
      expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    });

    it('returns an empty body', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/health', { method: 'HEAD' });

      const res = await app.fetch(req, env);

      expect(res.body).toBeNull();
    });
  });

  describe('GET /api/nonexistent', () => {
    it('returns 404 JSON', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/nonexistent');

      const res = await app.fetch(req, env);

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: { code: 'not_found', message: 'Not found' } });
    });

    it('includes security headers on 404', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/nonexistent');

      const res = await app.fetch(req, env);

      expectSecurityHeaders(res);
    });
  });

  describe('POST /app/_/nonexistent', () => {
    it('returns 404 JSON', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/app/_/nonexistent', { method: 'POST' });

      const res = await app.fetch(req, env);

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: { code: 'not_found', message: 'Not found' } });
    });

    it('includes security headers on 404', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/app/_/nonexistent', { method: 'POST' });

      const res = await app.fetch(req, env);

      expectSecurityHeaders(res);
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
      expect(await res.text()).toBe('<html>homepage</html>');
    });

    it('applies security headers to static asset responses', async () => {
      const assetResponse = new Response('<html>page</html>', {
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

      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
      expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    });

    it('serves 404 page HTML when ASSETS returns empty 404', async () => {
      const emptyNotFound = new Response(null, {
        status: 404,
        headers: { 'Content-Length': '0' },
      });
      const notFoundPage = new Response('<html>404 page</html>', {
        headers: { 'Content-Type': 'text/html' },
      });
      const fetchSpy = vi
        .fn()
        .mockResolvedValueOnce(emptyNotFound)
        .mockResolvedValueOnce(notFoundPage);
      const env: Env = {
        ASSETS: {
          fetch: fetchSpy,
          connect: vi.fn(),
        } as unknown as Fetcher,
      } as unknown as Env;
      const req = new Request('https://example.com/nonexistent');

      const res = await app.fetch(req, env);

      expect(res.status).toBe(404);
      expect(await res.text()).toBe('<html>404 page</html>');
      expect(res.headers.get('Content-Type')).toContain('text/html');
      expectSecurityHeaders(res);
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

      expectSecurityHeaders(res);
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

      expectSecurityHeaders(res);
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

      expectSecurityHeaders(res);
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

      expectSecurityHeaders(res);
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

      expectSecurityHeaders(res);
    });
  });

  describe('GET /auth/sign-out', () => {
    it('delegates to authPageHandlers.handleGetSignOut and returns the response', async () => {
      const env = mockEnv();
      const handlerResponse = new Response('<html>sign-out</html>', { status: 200 });
      mocks.handleGetSignOut.mockReturnValue(handlerResponse);

      const req = new Request('https://example.com/auth/sign-out', { method: 'GET' });
      const res = await app.fetch(req, env);

      expect(mocks.handleGetSignOut).toHaveBeenCalledWith(req);
      expect(res.status).toBe(200);
    });

    it('applies security headers to the response', async () => {
      const env = mockEnv();
      mocks.handleGetSignOut.mockReturnValue(
        new Response('<html>sign-out</html>', { status: 200 })
      );

      const req = new Request('https://example.com/auth/sign-out', { method: 'GET' });
      const res = await app.fetch(req, env);

      expectSecurityHeaders(res);
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
      { path: '/auth/sign-out', method: 'PUT', allow: 'GET, POST' },
      { path: '/auth/sign-out', method: 'DELETE', allow: 'GET, POST' },
      { path: '/auth/sign-out', method: 'PATCH', allow: 'GET, POST' },
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

  describe('GET /api/auth/error', () => {
    it('returns a styled HTML error page instead of better-auth default', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/auth/error');

      const res = await app.fetch(req, env);

      expect(res.status).toBe(400);
      expect(res.headers.get('Content-Type')).toContain('text/html');
      const body = await res.text();
      expect(body).toMatch(/^<!DOCTYPE html>/);
      expect(body).toContain('Authentication Error');
    });

    it('does not delegate to authHandler', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/auth/error');

      await app.fetch(req, env);

      expect(mocks.authHandlerFn).not.toHaveBeenCalled();
    });

    it('does not reveal the auth framework name', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/auth/error');

      const res = await app.fetch(req, env);
      const body = await res.text();

      expect(body.toLowerCase()).not.toContain('better-auth');
    });

    it('does not contain external links', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/auth/error');

      const res = await app.fetch(req, env);
      const body = await res.text();

      expect(body).not.toMatch(/href="https?:\/\//);
    });

    it('includes security headers', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/auth/error');

      const res = await app.fetch(req, env);

      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
      expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    });

    it('includes Cache-Control: no-store, no-cache to prevent caching error pages', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/auth/error');

      const res = await app.fetch(req, env);

      expect(res.headers.get('Cache-Control')).toBe('no-store, no-cache');
    });

    it('renders the page with query parameters (e.g. ?error=state_not_found)', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/auth/error?error=state_not_found');

      const res = await app.fetch(req, env);

      expect(res.status).toBe(400);
      const body = await res.text();
      expect(body).toContain('Authentication Error');
    });

    it('returns 500 for internal_server_error', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/auth/error?error=internal_server_error');

      const res = await app.fetch(req, env);

      expect(res.status).toBe(500);
      const body = await res.text();
      expect(body).toContain('Authentication Error');
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

      expectSecurityHeaders(res);
    });
  });

  describe('HEAD /api/auth/*', () => {
    it('returns same status as GET (not 404)', async () => {
      const env = mockEnv();
      mocks.authHandlerFn.mockResolvedValue(new Response(null, { status: 200 }));

      const req = new Request('https://example.com/api/auth/session', { method: 'HEAD' });
      const res = await app.fetch(req, env);

      expect(res.status).toBe(200);
    });

    it('delegates to authHandler', async () => {
      const env = mockEnv();
      mocks.authHandlerFn.mockResolvedValue(new Response(null, { status: 200 }));

      const req = new Request('https://example.com/api/auth/session', { method: 'HEAD' });
      await app.fetch(req, env);

      expect(mocks.authHandlerFn).toHaveBeenCalled();
    });

    it('returns an empty body', async () => {
      const env = mockEnv();
      mocks.authHandlerFn.mockResolvedValue(
        new Response(JSON.stringify({ session: null }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const req = new Request('https://example.com/api/auth/session', { method: 'HEAD' });
      const res = await app.fetch(req, env);

      expect(res.body).toBeNull();
    });

    it('applies security headers', async () => {
      const env = mockEnv();
      mocks.authHandlerFn.mockResolvedValue(new Response(null, { status: 200 }));

      const req = new Request('https://example.com/api/auth/session', { method: 'HEAD' });
      const res = await app.fetch(req, env);

      expectSecurityHeaders(res);
    });
  });

  describe('/api/auth/* error handling', () => {
    it('returns 503 JSON when authHandler throws', async () => {
      const env = mockEnv();
      mocks.authHandlerFn.mockRejectedValue(new Error('D1 unavailable'));

      const req = new Request('https://example.com/api/auth/sign-in/email', {
        method: 'POST',
        headers: { Origin: SAME_ORIGIN },
      });
      const res = await app.fetch(req, env);

      expect(res.status).toBe(503);
      expect(res.headers.get('Content-Type')).toContain('application/json');
      expect(await res.json()).toEqual({
        error: { code: 'service_unavailable', message: 'Service unavailable' },
      });
    });

    it('includes Retry-After header when authHandler throws', async () => {
      const env = mockEnv();
      mocks.authHandlerFn.mockRejectedValue(new Error('D1 unavailable'));

      const req = new Request('https://example.com/api/auth/sign-in/email', {
        method: 'POST',
        headers: { Origin: SAME_ORIGIN },
      });
      const res = await app.fetch(req, env);

      expect(res.headers.get('Retry-After')).toBe('30');
    });

    it('applies security headers when authHandler throws', async () => {
      const env = mockEnv();
      mocks.authHandlerFn.mockRejectedValue(new Error('D1 unavailable'));

      const req = new Request('https://example.com/api/auth/sign-in/email', {
        method: 'POST',
        headers: { Origin: SAME_ORIGIN },
      });
      const res = await app.fetch(req, env);

      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('returns 503 JSON when authHandler throws on GET', async () => {
      const env = mockEnv();
      mocks.authHandlerFn.mockRejectedValue(new Error('connection error'));

      const req = new Request('https://example.com/api/auth/session');
      const res = await app.fetch(req, env);

      expect(res.status).toBe(503);
      expect(await res.json()).toEqual({
        error: { code: 'service_unavailable', message: 'Service unavailable' },
      });
    });

    it('logs the underlying exception via the Logger port', async () => {
      const env = mockEnv();
      const error = new Error('D1 unavailable');
      mocks.authHandlerFn.mockRejectedValue(error);

      const req = new Request('https://example.com/api/auth/sign-in/email', {
        method: 'POST',
        headers: { Origin: SAME_ORIGIN },
      });
      await app.fetch(req, env);

      expect(mocks.loggerError).toHaveBeenCalledWith('auth handler error', error);
    });

    it('returns 503 JSON when authHandler returns a 5xx response', async () => {
      const env = mockEnv();
      mocks.authHandlerFn.mockResolvedValue(new Response(null, { status: 500 }));

      const req = new Request('https://example.com/api/auth/sign-out', {
        method: 'POST',
        headers: { Origin: SAME_ORIGIN },
      });
      const res = await app.fetch(req, env);

      expect(res.status).toBe(503);
      expect(res.headers.get('Content-Type')).toContain('application/json');
      expect(await res.json()).toEqual({
        error: { code: 'service_unavailable', message: 'Service unavailable' },
      });
    });

    it('includes Retry-After header when authHandler returns a 5xx response', async () => {
      const env = mockEnv();
      mocks.authHandlerFn.mockResolvedValue(new Response(null, { status: 502 }));

      const req = new Request('https://example.com/api/auth/sign-out', {
        method: 'POST',
        headers: { Origin: SAME_ORIGIN },
      });
      const res = await app.fetch(req, env);

      expect(res.headers.get('Retry-After')).toBe('30');
    });

    it('logs the 5xx status when authHandler returns a server error response', async () => {
      const env = mockEnv();
      mocks.authHandlerFn.mockResolvedValue(new Response(null, { status: 500 }));

      const req = new Request('https://example.com/api/auth/sign-out', {
        method: 'POST',
        headers: { Origin: SAME_ORIGIN },
      });
      await app.fetch(req, env);

      expect(mocks.loggerError).toHaveBeenCalledOnce();
      const [label, error] = mocks.loggerError.mock.calls[0] as [string, Error];
      expect(label).toBe('auth handler error');
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain('500');
    });

    it('applies security headers when authHandler returns a 5xx response', async () => {
      const env = mockEnv();
      mocks.authHandlerFn.mockResolvedValue(new Response(null, { status: 500 }));

      const req = new Request('https://example.com/api/auth/sign-out', {
        method: 'POST',
        headers: { Origin: SAME_ORIGIN },
      });
      const res = await app.fetch(req, env);

      expectSecurityHeaders(res);
    });

    it('passes through 4xx responses from authHandler unchanged', async () => {
      const env = mockEnv();
      mocks.authHandlerFn.mockResolvedValue(
        new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const req = new Request('https://example.com/api/auth/session');
      const res = await app.fetch(req, env);

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ error: 'Unauthorized' });
    });
  });

  describe('/api/auth/* Set-Cookie Secure enforcement', () => {
    it('adds Secure flag to Set-Cookie headers from authHandler', async () => {
      const env = mockEnv();
      const cookieWithoutSecure =
        '__Host-better-auth.session_token=abc; HttpOnly; Path=/; SameSite=Lax; Max-Age=2592000';
      mocks.authHandlerFn.mockResolvedValue(
        new Response('{}', {
          status: 200,
          headers: { 'set-cookie': cookieWithoutSecure },
        })
      );

      const req = new Request('https://example.com/api/auth/sign-in/email', {
        method: 'POST',
        headers: {
          Origin: SAME_ORIGIN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'a@b.com', password: 'test' }),
      });
      const res = await app.fetch(req, env);

      const setCookie = res.headers.get('set-cookie') ?? '';
      expect(setCookie).toContain('; Secure');
    });

    it('does not duplicate Secure flag when authHandler already sets it', async () => {
      const env = mockEnv();
      const cookieWithSecure =
        '__Host-better-auth.session_token=abc; HttpOnly; Secure; Path=/; SameSite=Lax';
      mocks.authHandlerFn.mockResolvedValue(
        new Response('{}', {
          status: 200,
          headers: { 'set-cookie': cookieWithSecure },
        })
      );

      const req = new Request('https://example.com/api/auth/session');
      const res = await app.fetch(req, env);

      const setCookie = res.headers.get('set-cookie') ?? '';
      const secureCount = (setCookie.match(/Secure/gi) ?? []).length;
      expect(secureCount).toBe(1);
    });
  });

  describe('GET /api/auth/callback/* (unconfigured providers)', () => {
    it('returns 404 JSON for an unconfigured provider', async () => {
      const env = mockEnv();

      const req = new Request('https://example.com/api/auth/callback/google');
      const res = await app.fetch(req, env);

      expect(res.status).toBe(404);
      expect(res.headers.get('Content-Type')).toContain('application/json');
      expect(await res.json()).toEqual({ error: { code: 'not_found', message: 'Not found' } });
    });

    it('does not delegate to authHandler', async () => {
      const env = mockEnv();

      const req = new Request('https://example.com/api/auth/callback/google');
      await app.fetch(req, env);

      expect(mocks.authHandlerFn).not.toHaveBeenCalled();
    });

    it('returns 404 for any provider name', async () => {
      const env = mockEnv();

      const req = new Request('https://example.com/api/auth/callback/github');
      const res = await app.fetch(req, env);

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: { code: 'not_found', message: 'Not found' } });
    });

    it('includes security headers', async () => {
      const env = mockEnv();

      const req = new Request('https://example.com/api/auth/callback/google');
      const res = await app.fetch(req, env);

      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
      expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    });
  });

  describe('POST /api/auth/* malformed JSON', () => {
    it('returns 400 when sign-in body is malformed JSON', async () => {
      const env = mockEnv();

      const req = new Request('https://example.com/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: SAME_ORIGIN },
        body: '{not valid json',
      });
      const res = await app.fetch(req, env);

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({
        error: { code: 'invalid_json', message: 'Request body must be valid JSON' },
      });
    });

    it('returns 400 when sign-up body is malformed JSON', async () => {
      const env = mockEnv();

      const req = new Request('https://example.com/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: SAME_ORIGIN },
        body: '{not valid json',
      });
      const res = await app.fetch(req, env);

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({
        error: { code: 'invalid_json', message: 'Request body must be valid JSON' },
      });
    });

    it('does not call authHandler when body is malformed JSON', async () => {
      const env = mockEnv();

      const req = new Request('https://example.com/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: SAME_ORIGIN },
        body: '{not valid json',
      });
      await app.fetch(req, env);

      expect(mocks.authHandlerFn).not.toHaveBeenCalled();
    });

    it('applies security headers when body is malformed JSON', async () => {
      const env = mockEnv();

      const req = new Request('https://example.com/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: SAME_ORIGIN },
        body: '{not valid json',
      });
      const res = await app.fetch(req, env);

      expectSecurityHeaders(res);
    });

    it('does not validate JSON for POST without application/json content-type', async () => {
      const env = mockEnv();
      mocks.authHandlerFn.mockResolvedValue(new Response(null, { status: 200 }));

      const req = new Request('https://example.com/api/auth/sign-out', {
        method: 'POST',
        headers: { Origin: SAME_ORIGIN },
      });
      const res = await app.fetch(req, env);

      expect(mocks.authHandlerFn).toHaveBeenCalled();
      expect(res.status).toBe(200);
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

      const req = new Request('https://example.com/api/auth/sign-in/email', {
        method: 'POST',
        headers: { Origin: SAME_ORIGIN },
      });
      const res = await app.fetch(req, env);

      expect(mocks.authHandlerFn).toHaveBeenCalledWith(req);
      expect(res.status).toBe(200);
    });

    it('applies security headers to POST /api/auth/* responses', async () => {
      const env = mockEnv();
      mocks.authHandlerFn.mockResolvedValue(new Response(null, { status: 200 }));

      const req = new Request('https://example.com/api/auth/sign-in/email', {
        method: 'POST',
        headers: { Origin: SAME_ORIGIN },
      });
      const res = await app.fetch(req, env);

      expectSecurityHeaders(res);
    });
  });

  describe('POST /api/auth/* cross-origin protection', () => {
    it('returns 403 when Origin is a foreign domain on sign-up', async () => {
      const env = mockEnv();

      const req = new Request('https://example.com/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: 'http://evil.com' },
        body: JSON.stringify({ email: 'a@b.com', password: 'test12345678' }),
      });
      const res = await app.fetch(req, env);

      expect(res.status).toBe(403);
      const body = await res.json<{ error: { code: string } }>();
      expect(body.error.code).toBe('origin_not_allowed');
      expect(mocks.authHandlerFn).not.toHaveBeenCalled();
    });

    it('returns 403 when Origin is a foreign domain on sign-in', async () => {
      const env = mockEnv();

      const req = new Request('https://example.com/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: 'http://evil.com' },
        body: JSON.stringify({ email: 'a@b.com', password: 'test12345678' }),
      });
      const res = await app.fetch(req, env);

      expect(res.status).toBe(403);
      expect(mocks.authHandlerFn).not.toHaveBeenCalled();
    });

    it('returns 403 when Origin is missing on POST', async () => {
      const env = mockEnv();

      const req = new Request('https://example.com/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'a@b.com', password: 'test12345678' }),
      });
      const res = await app.fetch(req, env);

      expect(res.status).toBe(403);
    });

    it('does not block GET requests with a foreign Origin', async () => {
      const env = mockEnv();
      mocks.authHandlerFn.mockResolvedValue(new Response(null, { status: 200 }));

      const req = new Request('https://example.com/api/auth/session', {
        headers: { Origin: 'http://evil.com' },
      });
      const res = await app.fetch(req, env);

      expect(res.status).toBe(200);
    });

    it('includes security headers on 403 cross-origin responses', async () => {
      const env = mockEnv();

      const req = new Request('https://example.com/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: 'http://evil.com' },
        body: JSON.stringify({ email: 'a@b.com', password: 'test12345678' }),
      });
      const res = await app.fetch(req, env);

      expectSecurityHeaders(res);
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

      const req = new Request('https://example.com/api/auth/sign-in/email', {
        method: 'POST',
        headers: { Origin: SAME_ORIGIN },
      });
      const res = await app.fetch(req, env);

      expect(res.status).toBe(429);
      expect(mocks.authHandlerFn).not.toHaveBeenCalled();
    });

    it('delegates to authHandler when rate limit middleware passes through', async () => {
      const env = mockEnv();
      mocks.authHandlerFn.mockResolvedValue(new Response(null, { status: 200 }));

      const req = new Request('https://example.com/api/auth/sign-in/email', {
        method: 'POST',
        headers: { Origin: SAME_ORIGIN },
      });
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

      const req = new Request('https://example.com/api/auth/sign-up/email', {
        method: 'POST',
        headers: { Origin: SAME_ORIGIN },
      });
      const res = await app.fetch(req, env);

      expect(res.status).toBe(429);
      expect(mocks.authHandlerFn).not.toHaveBeenCalled();
    });

    it('delegates to authHandler when rate limit middleware passes through', async () => {
      const env = mockEnv();
      mocks.authHandlerFn.mockResolvedValue(new Response(null, { status: 200 }));

      const req = new Request('https://example.com/api/auth/sign-up/email', {
        method: 'POST',
        headers: { Origin: SAME_ORIGIN },
      });
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

  describe('GET /api/v1/areas', () => {
    it('delegates to areaApiHandlers.handleListAreas when authenticated', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/v1/areas');
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/v1/contexts', () => {
    it('delegates to contextApiHandlers.handleListContexts when authenticated', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/v1/contexts');
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/v1/inbox', () => {
    it('delegates to inboxItemApiHandlers.handleCaptureInboxItem when authenticated', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/v1/inbox', { method: 'POST' });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(201);
      expect(mocks.handleCaptureInboxItem).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/inbox', () => {
    it('delegates to inboxItemApiHandlers.handleListInboxItems when authenticated', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/v1/inbox');
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);
      expect(mocks.handleListInboxItems).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/inbox/:id/clarify', () => {
    it('delegates to actionApiHandlers.handleClarify when authenticated', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/v1/inbox/inbox-1/clarify', {
        method: 'POST',
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);
      expect(mocks.handleClarify).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/actions', () => {
    it('delegates to actionApiHandlers.handleListActions when authenticated', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/v1/actions');
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);
      expect(mocks.handleListActions).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/actions/:id/activate', () => {
    it('delegates to actionApiHandlers.handleActivate when authenticated', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/v1/actions/action-1/activate', {
        method: 'POST',
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);
      expect(mocks.handleActivate).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/actions/:id/complete', () => {
    it('delegates to actionApiHandlers.handleComplete when authenticated', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/v1/actions/action-1/complete', {
        method: 'POST',
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);
      expect(mocks.handleComplete).toHaveBeenCalled();
    });
  });

  describe('405 Method Not Allowed on /api/v1/* routes', () => {
    it.each([
      { path: '/api/v1/inbox', method: 'PUT', allow: 'GET, POST' },
      { path: '/api/v1/inbox', method: 'DELETE', allow: 'GET, POST' },
      { path: '/api/v1/inbox', method: 'PATCH', allow: 'GET, POST' },
      { path: '/api/v1/areas', method: 'PUT', allow: 'GET' },
      { path: '/api/v1/areas', method: 'POST', allow: 'GET' },
      { path: '/api/v1/areas', method: 'DELETE', allow: 'GET' },
      { path: '/api/v1/areas', method: 'PATCH', allow: 'GET' },
      { path: '/api/v1/contexts', method: 'PUT', allow: 'GET' },
      { path: '/api/v1/contexts', method: 'POST', allow: 'GET' },
      { path: '/api/v1/contexts', method: 'DELETE', allow: 'GET' },
      { path: '/api/v1/contexts', method: 'PATCH', allow: 'GET' },
      { path: '/api/v1/inbox/inbox-1/clarify', method: 'GET', allow: 'POST' },
      { path: '/api/v1/inbox/inbox-1/clarify', method: 'PUT', allow: 'POST' },
      { path: '/api/v1/inbox/inbox-1/clarify', method: 'DELETE', allow: 'POST' },
      { path: '/api/v1/actions', method: 'PUT', allow: 'GET' },
      { path: '/api/v1/actions', method: 'POST', allow: 'GET' },
      { path: '/api/v1/actions', method: 'DELETE', allow: 'GET' },
      { path: '/api/v1/actions/action-1/activate', method: 'GET', allow: 'POST' },
      { path: '/api/v1/actions/action-1/activate', method: 'PUT', allow: 'POST' },
      { path: '/api/v1/actions/action-1/activate', method: 'DELETE', allow: 'POST' },
      { path: '/api/v1/actions/action-1/complete', method: 'GET', allow: 'POST' },
      { path: '/api/v1/actions/action-1/complete', method: 'PUT', allow: 'POST' },
      { path: '/api/v1/actions/action-1/complete', method: 'DELETE', allow: 'POST' },
    ])('returns 405 for $method $path with Allow: $allow', async ({ path, method, allow }) => {
      const env = mockEnv();
      const req = new Request(`https://example.com${path}`, { method });

      const res = await app.fetch(req, env);

      expect(res.status).toBe(405);
      expect(res.headers.get('Allow')).toBe(allow);
    });

    it('includes security headers on 405 API responses', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/v1/inbox', { method: 'PUT' });

      const res = await app.fetch(req, env);

      expect(res.status).toBe(405);
      expectSecurityHeaders(res);
    });

    it('does not delegate to API handlers for unsupported methods', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/api/v1/inbox', { method: 'DELETE' });

      await app.fetch(req, env);

      expect(mocks.handleCaptureInboxItem).not.toHaveBeenCalled();
      expect(mocks.handleListInboxItems).not.toHaveBeenCalled();
    });
  });

  describe('/api/v1/* requireWorkspaceMiddleware', () => {
    it('returns 503 when requireWorkspaceMiddleware short-circuits a /api/v1/* request (workspace not provisioned)', async () => {
      // Constraint workspace-35c: requireWorkspaceMiddleware must guard all /api/v1/* routes
      // so that requests with a missing actor return 503, not fall through to handlers.
      mocks.requireWorkspaceMiddlewareFn.mockImplementationOnce(
        (): Promise<Response> =>
          Promise.resolve(
            new Response(
              JSON.stringify({
                error: { code: 'workspace_not_found', message: 'Workspace not provisioned.' },
              }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            )
          )
      );

      const env = mockEnv();
      const req = new Request('https://example.com/api/v1/areas');
      const res = await app.fetch(req, env);

      expect(res.status).toBe(503);
      expect(mocks.handleListAreas).not.toHaveBeenCalled();
    });
  });

  describe('global onError handler', () => {
    it('returns 500 with safe error envelope when a handler throws', async () => {
      const env = mockEnv();
      mocks.handleCaptureInboxItem.mockRejectedValue(new Error('kaboom'));

      const req = new Request('https://example.com/api/v1/inbox', { method: 'POST' });
      const res = await app.fetch(req, env);

      expect(res.status).toBe(500);
      const body = await res.json<{ error: { code: string; message: string } }>();
      expect(body.error.code).toBe('internal_error');
      expect(body.error.message).toBe('An unexpected error occurred');
    });

    it('does not leak stack traces or internal details', async () => {
      const env = mockEnv();
      mocks.handleCaptureInboxItem.mockRejectedValue(
        new Error('secret internal detail at /src/foo.ts:42')
      );

      const req = new Request('https://example.com/api/v1/inbox', { method: 'POST' });
      const res = await app.fetch(req, env);

      const text = await res.text();
      expect(text).not.toContain('secret');
      expect(text).not.toContain('kaboom');
      expect(text).not.toContain('/src/');
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

  describe('GET /app (dashboard page)', () => {
    it('delegates to appPageHandlers.handleGetDashboard', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/app');
      const res = await app.fetch(req, env);

      expect(mocks.handleGetDashboard).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });

    it('applies security headers', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/app');
      const res = await app.fetch(req, env);

      expectSecurityHeaders(res);
    });
  });

  describe('GET /app/inbox', () => {
    it('delegates to appPageHandlers.handleGetInbox', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/app/inbox');
      const res = await app.fetch(req, env);

      expect(mocks.handleGetInbox).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });

    it('applies security headers', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/app/inbox');
      const res = await app.fetch(req, env);

      expectSecurityHeaders(res);
    });
  });

  describe('GET /app/actions', () => {
    it('delegates to appPageHandlers.handleGetActions', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/app/actions');
      const res = await app.fetch(req, env);

      expect(mocks.handleGetActions).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });

    it('applies security headers', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/app/actions');
      const res = await app.fetch(req, env);

      expectSecurityHeaders(res);
    });
  });

  describe('POST /app/_/inbox/capture', () => {
    it('delegates to appPartialHandlers.handleCaptureInbox', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/app/_/inbox/capture', { method: 'POST' });
      const res = await app.fetch(req, env);

      expect(mocks.handleCaptureInbox).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });
  });

  describe('POST /app/_/inbox/:id/clarify', () => {
    it('delegates to appPartialHandlers.handleClarifyInbox', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/app/_/inbox/item-1/clarify', { method: 'POST' });
      const res = await app.fetch(req, env);

      expect(mocks.handleClarifyInbox).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });
  });

  describe('POST /app/_/actions/:id/activate', () => {
    it('delegates to appPartialHandlers.handleActivateAction', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/app/_/actions/action-1/activate', {
        method: 'POST',
      });
      const res = await app.fetch(req, env);

      expect(mocks.handleActivateAction).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });
  });

  describe('POST /app/_/actions/:id/complete', () => {
    it('delegates to appPartialHandlers.handleCompleteAction', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/app/_/actions/action-1/complete', {
        method: 'POST',
      });
      const res = await app.fetch(req, env);

      expect(mocks.handleCompleteAction).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });
  });

  describe('/app/* workspace middleware', () => {
    it('applies requireWorkspaceMiddleware to /app page routes', async () => {
      const env = mockEnv();
      const req = new Request('https://example.com/app');
      await app.fetch(req, env);

      expect(mocks.requireWorkspaceMiddlewareFn).toHaveBeenCalled();
    });

    it('returns 503 when workspace middleware short-circuits', async () => {
      mocks.requireWorkspaceMiddlewareFn.mockImplementationOnce(
        (): Promise<Response> =>
          Promise.resolve(
            new Response(
              JSON.stringify({
                error: { code: 'workspace_not_found', message: 'Workspace not provisioned.' },
              }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            )
          )
      );

      const env = mockEnv();
      const req = new Request('https://example.com/app');
      const res = await app.fetch(req, env);

      expect(res.status).toBe(503);
      expect(mocks.handleGetDashboard).not.toHaveBeenCalled();
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

import { afterEach, describe, expect, it, vi } from 'vitest';

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
    async (_c: unknown, next: unknown): Promise<Response | void> => (next as () => Promise<void>)()
  );
  /** Default: passes through by calling next() (not rate limited). */
  const signInApiRateLimitMiddlewareFn = vi.fn(
    async (_c: unknown, next: unknown): Promise<Response | void> => (next as () => Promise<void>)()
  );
  /** Default: passes through by calling next() (not rate limited). */
  const signUpApiRateLimitMiddlewareFn = vi.fn(
    async (_c: unknown, next: unknown): Promise<Response | void> => (next as () => Promise<void>)()
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
    requireApiAuthMiddleware: requireApiAuthMiddlewareFn,
    requireWorkspaceMiddleware: requireWorkspaceMiddlewareFn,
    areaApiHandlers: { handleListAreas },
    contextApiHandlers: { handleListContexts },
    inboxItemApiHandlers: { handleCaptureInboxItem, handleListInboxItems },
    actionApiHandlers: { handleClarify, handleActivate, handleComplete },
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
    requireApiAuthMiddlewareFn,
    requireWorkspaceMiddlewareFn,
    handleListAreas,
    handleListContexts,
    handleCaptureInboxItem,
    handleListInboxItems,
    handleClarify,
    handleActivate,
    handleComplete,
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

      expectSecurityHeaders(res);
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

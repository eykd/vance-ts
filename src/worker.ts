import type { Context } from 'hono';
import { Hono } from 'hono/tiny';
import type { MiddlewareHandler } from 'hono/types';

import { getServiceFactory } from './di/serviceFactory';
import { apiNotFound, healthCheck } from './presentation/handlers/ApiHandlers';
import { appPartialNotFound } from './presentation/handlers/AppPartialHandlers';
import { staticAssetFallthrough } from './presentation/handlers/StaticAssetHandler';
import { createBodyLimitMiddleware } from './presentation/middleware/bodyLimit';
import { authErrorPage } from './presentation/templates/pages/authError';
import type { AppEnv } from './presentation/types';
import { authErrorStatusCode } from './presentation/utils/authErrorStatus';
import { SECURITY_HEADERS } from './presentation/utils/securityHeaders';

// Durable Object class must be exported from the worker entry point so
// the Workers runtime can register it as a named DO binding.
export { RateLimitDO } from './infrastructure/RateLimitDO';

const app = new Hono<AppEnv>();

/**
 * Middleware: apply security headers after the downstream handler runs.
 *
 * Uses `c.header()` instead of `c.res = new Response(c.res.body, c.res)` to
 * avoid Hono's Context `res` setter header-merging logic that can duplicate
 * headers on HEAD requests (the setter copies headers from both the old and
 * new response, and Hono's HEAD dispatch wraps the result in yet another
 * `new Response(null, result)`).
 *
 * `c.header()` bypasses the setter by writing directly to the internal
 * response field, and handles immutable-header responses (e.g. from
 * ASSETS.fetch) by creating a mutable copy internally.
 *
 * Registered globally via `app.use('*', …)` so every new route automatically
 * receives security headers — no per-prefix registration required.
 *
 * @param c - The Hono context.
 * @param next - The next middleware function in the chain.
 */
const withSecurityHeaders: MiddlewareHandler<AppEnv> = async (c, next): Promise<void> => {
  await next();
  for (const [name, value] of SECURITY_HEADERS) {
    c.header(name, value);
  }
};

/**
 * Global error handler that catches unhandled exceptions.
 *
 * Returns a generic 500 JSON response for API routes without leaking
 * stack traces or internal details.
 *
 * @param _err - The caught error (intentionally unused to prevent leakage).
 * @param c - The Hono context.
 * @returns A safe 500 JSON response.
 */
app.onError((_err, c): Response => {
  return c.json(
    { error: { code: 'internal_error', message: 'An unexpected error occurred' } },
    500
  );
});

app.use('*', withSecurityHeaders);
app.use('*', createBodyLimitMiddleware());

/**
 * Middleware: require authentication before proceeding.
 *
 * Delegates to the ServiceFactory's requireAuthMiddleware which validates
 * the session cookie and redirects unauthenticated visitors to sign-in.
 *
 * @param c - The Hono context.
 * @param next - The next middleware function in the chain.
 * @returns A redirect response for unauthenticated visitors, or void if authenticated.
 */
const withRequireAuth: MiddlewareHandler<AppEnv> = async (c, next): Promise<Response | void> => {
  return getServiceFactory(c.env).requireAuthMiddleware(c as Context<AppEnv>, next);
};

app.use('/app/*', withRequireAuth);
app.use('/app/*', async (c, next): Promise<Response | void> => {
  return getServiceFactory(c.env).requireWorkspaceMiddleware(c as Context<AppEnv>, next);
});
app.use('/dashboard/*', withRequireAuth);

/** Health check endpoint. */
app.get('/api/health', healthCheck);

/**
 * Rate limit middleware for POST /api/auth/sign-in/*.
 *
 * better-auth's built-in rate limiter is disabled (see src/infrastructure/auth.ts).
 * This middleware applies the DurableObjectRateLimiter to the JSON API endpoint
 * that attackers can POST to directly, bypassing the HTML form handlers and
 * their use-case-level rate limiting.
 *
 * GET requests are passed through without rate limiting (not a brute-force vector).
 * The counter key matches SignInUseCase so API and form paths share one counter per IP.
 */
app.use('/api/auth/sign-in/*', async (c, next): Promise<Response | void> => {
  if (c.req.method !== 'POST') return next();
  return getServiceFactory(c.env).signInApiRateLimitMiddleware(c as Context<AppEnv>, next);
});

/**
 * Rate limit middleware for POST /api/auth/sign-up/*.
 *
 * Same rationale as the sign-in middleware above. The counter key matches
 * SignUpUseCase so API and form paths share one counter per IP.
 */
app.use('/api/auth/sign-up/*', async (c, next): Promise<Response | void> => {
  if (c.req.method !== 'POST') return next();
  return getServiceFactory(c.env).signUpApiRateLimitMiddleware(c as Context<AppEnv>, next);
});

/**
 * Intercepts better-auth's default error page at `/api/auth/error`.
 *
 * better-auth renders a styled HTML page with external links (to better-auth.com)
 * and an "Ask AI" button, revealing the auth framework in use. This route
 * replaces it with the application's auth layout for consistent branding and
 * to avoid leaking implementation details.
 *
 * Must be registered before the `/api/auth/*` catch-all so that this specific
 * path is handled here instead of being forwarded to better-auth.
 */
app.get('/api/auth/error', (c): Response => {
  const errorCode = c.req.query('error') ?? null;
  return new Response(authErrorPage(), {
    status: authErrorStatusCode(errorCode),
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store, no-cache' },
  });
});

/**
 * Blocks OAuth callback requests for unconfigured providers.
 *
 * No OAuth/social providers are currently configured in better-auth. Without
 * this guard, better-auth's catch-all would process the callback URL and
 * redirect to `/api/auth/error?state=state_not_found`, leaking information
 * about the auth infrastructure. Returns a clean 404 instead.
 *
 * When OAuth providers are added, replace this with provider-aware routing.
 */
app.get('/api/auth/callback/*', apiNotFound);

/**
 * better-auth API pass-through.
 *
 * Delegates all GET/HEAD/POST requests under `/api/auth/*` to the better-auth
 * handler via the ServiceFactory (so worker.ts never imports from
 * infrastructure directly). The response is reconstructed as a new Response
 * to expose mutable headers to the `/api/*` security-headers middleware.
 *
 * Must be registered before the `/api/*` catch-all so that auth API requests
 * are handled here rather than returning 404.
 */
app.on(['GET', 'HEAD', 'POST'], '/api/auth/*', async (c): Promise<Response> => {
  try {
    if (
      c.req.method === 'POST' &&
      c.req.header('content-type')?.includes('application/json') === true
    ) {
      try {
        await c.req.raw.clone().json();
      } catch {
        return c.json(
          { error: { code: 'invalid_json', message: 'Request body must be valid JSON' } },
          400
        );
      }
    }

    const authResponse = await getServiceFactory(c.env).authHandler(c.req.raw);
    if (authResponse.status >= 500) {
      getServiceFactory(c.env).logger.error(
        'auth handler error',
        new Error(`auth handler returned HTTP ${String(authResponse.status)}`)
      );
      return c.json(
        { error: { code: 'service_unavailable', message: 'Service unavailable' } },
        503,
        { 'Retry-After': '30' }
      );
    }
    return new Response(authResponse.body, authResponse);
  } catch (error: unknown) {
    getServiceFactory(c.env).logger.error('auth handler error', error);
    return c.json({ error: { code: 'service_unavailable', message: 'Service unavailable' } }, 503, {
      'Retry-After': '30',
    });
  }
});

/**
 * Middleware: require session authentication and workspace resolution for all
 * `/api/v1/*` routes. Returns JSON 401/503 on failure; populates
 * `c.var.workspaceId` on success.
 */
app.use('/api/v1/*', async (c, next): Promise<Response | void> => {
  return getServiceFactory(c.env).requireApiAuthMiddleware(c as Context<AppEnv>, next);
});

app.use('/api/v1/*', async (c, next): Promise<Response | void> => {
  return getServiceFactory(c.env).requireWorkspaceMiddleware(c as Context<AppEnv>, next);
});

/** Lists all areas in the authenticated user's workspace. */
app.get('/api/v1/areas', async (c): Promise<Response> => {
  return getServiceFactory(c.env).areaApiHandlers.handleListAreas(c as Context<AppEnv>);
});

/** Lists all contexts in the authenticated user's workspace. */
app.get('/api/v1/contexts', async (c): Promise<Response> => {
  return getServiceFactory(c.env).contextApiHandlers.handleListContexts(c as Context<AppEnv>);
});

/** Captures a new inbox item for the authenticated user. */
app.post('/api/v1/inbox', async (c): Promise<Response> => {
  return getServiceFactory(c.env).inboxItemApiHandlers.handleCaptureInboxItem(c as Context<AppEnv>);
});

/** Lists inbox items for the authenticated user's workspace. */
app.get('/api/v1/inbox', async (c): Promise<Response> => {
  return getServiceFactory(c.env).inboxItemApiHandlers.handleListInboxItems(c as Context<AppEnv>);
});

/** Clarifies an inbox item into an action. */
app.post('/api/v1/inbox/:id/clarify', async (c): Promise<Response> => {
  return getServiceFactory(c.env).actionApiHandlers.handleClarify(c as Context<AppEnv>);
});

/** Lists actions for the authenticated user's workspace. */
app.get('/api/v1/actions', async (c): Promise<Response> => {
  return getServiceFactory(c.env).actionApiHandlers.handleListActions(c as Context<AppEnv>);
});

/** Activates a ready action. */
app.post('/api/v1/actions/:id/activate', async (c): Promise<Response> => {
  return getServiceFactory(c.env).actionApiHandlers.handleActivate(c as Context<AppEnv>);
});

/** Completes an active action. */
app.post('/api/v1/actions/:id/complete', async (c): Promise<Response> => {
  return getServiceFactory(c.env).actionApiHandlers.handleComplete(c as Context<AppEnv>);
});

/**
 * Returns 405 Method Not Allowed for unsupported methods on API v1 routes.
 *
 * Registered after the specific method handlers so that only unhandled
 * methods (PUT, DELETE, PATCH, etc.) reach these catch-alls.
 */
app.all('/api/v1/inbox', (c): Response => {
  return c.body(null, 405, { Allow: 'GET, POST' });
});

app.all('/api/v1/areas', (c): Response => {
  return c.body(null, 405, { Allow: 'GET' });
});

app.all('/api/v1/contexts', (c): Response => {
  return c.body(null, 405, { Allow: 'GET' });
});

app.all('/api/v1/inbox/:id/clarify', (c): Response => {
  return c.body(null, 405, { Allow: 'POST' });
});

app.all('/api/v1/actions', (c): Response => {
  return c.body(null, 405, { Allow: 'GET' });
});

app.all('/api/v1/actions/:id/activate', (c): Response => {
  return c.body(null, 405, { Allow: 'POST' });
});

app.all('/api/v1/actions/:id/complete', (c): Response => {
  return c.body(null, 405, { Allow: 'POST' });
});

/** Catch-all for unimplemented API routes. */
app.all('/api/*', apiNotFound);

/** Renders the sign-in form page. */
app.get('/auth/sign-in', (c): Response => {
  return getServiceFactory(c.env).authPageHandlers.handleGetSignIn(c.req.raw);
});

/**
 * Authenticates the user and creates a session.
 *
 * Rate limiting is enforced via the DurableObjectRateLimiter inside SignInUseCase
 * (invoked by AuthPageHandlers.handlePostSignIn).
 */
app.post('/auth/sign-in', async (c): Promise<Response> => {
  return getServiceFactory(c.env).authPageHandlers.handlePostSignIn(c.req.raw);
});

/** Renders the registration form page. */
app.get('/auth/sign-up', (c): Response => {
  return getServiceFactory(c.env).authPageHandlers.handleGetSignUp(c.req.raw);
});

/**
 * Creates a new user account.
 *
 * Rate limiting is enforced via the DurableObjectRateLimiter inside SignUpUseCase
 * (invoked by AuthPageHandlers.handlePostSignUp).
 */
app.post('/auth/sign-up', async (c): Promise<Response> => {
  return getServiceFactory(c.env).authPageHandlers.handlePostSignUp(c.req.raw);
});

/** Renders the sign-out confirmation page. */
app.get('/auth/sign-out', (c): Response => {
  return getServiceFactory(c.env).authPageHandlers.handleGetSignOut(c.req.raw);
});

/** Terminates the authenticated user's session. */
app.post('/auth/sign-out', async (c): Promise<Response> => {
  return getServiceFactory(c.env).authPageHandlers.handlePostSignOut(c.req.raw);
});

/** Renders the forgot-password form page. */
app.get('/auth/forgot-password', (c): Response => {
  return getServiceFactory(c.env).authPageHandlers.handleGetForgotPassword(c.req.raw);
});

/** Requests a password reset for the submitted email address. */
app.post('/auth/forgot-password', async (c): Promise<Response> => {
  return getServiceFactory(c.env).authPageHandlers.handlePostForgotPassword(c.req.raw);
});

/** Renders the reset-password form page with the token from the URL. */
app.get('/auth/reset-password', (c): Response => {
  return getServiceFactory(c.env).authPageHandlers.handleGetResetPassword(c.req.raw);
});

/** Resets the user's password using the verification token. */
app.post('/auth/reset-password', async (c): Promise<Response> => {
  return getServiceFactory(c.env).authPageHandlers.handlePostResetPassword(c.req.raw);
});

/**
 * Returns 405 Method Not Allowed for unsupported methods on auth page routes.
 *
 * Registered after the specific GET/POST handlers so that only unhandled
 * methods (PUT, DELETE, PATCH, etc.) reach these catch-alls.
 */
app.all('/auth/sign-in', (c): Response => {
  return c.body(null, 405, { Allow: 'GET, POST' });
});

app.all('/auth/sign-up', (c): Response => {
  return c.body(null, 405, { Allow: 'GET, POST' });
});

app.all('/auth/sign-out', (c): Response => {
  return c.body(null, 405, { Allow: 'GET, POST' });
});

app.all('/auth/forgot-password', (c): Response => {
  return c.body(null, 405, { Allow: 'GET, POST' });
});

app.all('/auth/reset-password', (c): Response => {
  return c.body(null, 405, { Allow: 'GET, POST' });
});

/** Renders the dashboard page. */
app.get('/app', async (c): Promise<Response> => {
  return getServiceFactory(c.env).appPageHandlers.handleGetDashboard(c as Context<AppEnv>);
});

/** Renders the inbox page. */
app.get('/app/inbox', async (c): Promise<Response> => {
  return getServiceFactory(c.env).appPageHandlers.handleGetInbox(c as Context<AppEnv>);
});

/** Renders the actions page. */
app.get('/app/actions', async (c): Promise<Response> => {
  return getServiceFactory(c.env).appPageHandlers.handleGetActions(c as Context<AppEnv>);
});

/** Captures a new inbox item (HTMX partial). */
app.post('/app/_/inbox/capture', async (c): Promise<Response> => {
  return getServiceFactory(c.env).appPartialHandlers.handleCaptureInbox(c as Context<AppEnv>);
});

/** Clarifies an inbox item into an action (HTMX partial). */
app.post('/app/_/inbox/:id/clarify', async (c): Promise<Response> => {
  return getServiceFactory(c.env).appPartialHandlers.handleClarifyInbox(c as Context<AppEnv>);
});

/** Activates an action (HTMX partial). */
app.post('/app/_/actions/:id/activate', async (c): Promise<Response> => {
  return getServiceFactory(c.env).appPartialHandlers.handleActivateAction(c as Context<AppEnv>);
});

/** Completes an action (HTMX partial). */
app.post('/app/_/actions/:id/complete', async (c): Promise<Response> => {
  return getServiceFactory(c.env).appPartialHandlers.handleCompleteAction(c as Context<AppEnv>);
});

/** Catch-all for unimplemented app partial routes. */
app.all('/app/_/*', appPartialNotFound);

/**
 * Static asset fallthrough.
 *
 * Only reached if run_worker_first did not match the request path.
 * Delegates to the ASSETS binding which serves from hugo/public/.
 */
app.all('*', staticAssetFallthrough);

export default app;

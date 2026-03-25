import type { Context } from 'hono';
import { Hono } from 'hono/tiny';
import type { MiddlewareHandler } from 'hono/types';

import { getServiceFactory } from './di/serviceFactory';
import { apiNotFound, healthCheck } from './presentation/handlers/ApiHandlers';
import { appPartialNotFound } from './presentation/handlers/AppPartialHandlers';
import { htmxErrorFragment, serveErrorPage } from './presentation/handlers/ErrorPageHandlers';
import { staticAssetFallthrough } from './presentation/handlers/StaticAssetHandler';
import { authErrorPage } from './presentation/templates/pages/authError';
import type { AppEnv } from './presentation/types';
import { authErrorStatusCode } from './presentation/utils/authErrorStatus';
import { isApiRoute } from './presentation/utils/isApiRoute';
import { CACHE_CONTROL_NO_STORE, SECURITY_HEADERS } from './presentation/utils/securityHeaders';

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
 * Global error handler for unhandled exceptions in route handlers/middleware.
 *
 * Routes errors to the appropriate response format based on the request:
 * - `/api/*` paths → JSON `{ error: "Internal server error" }` with 500 status
 * - HTMX partial requests (HX-Request without HX-Boosted) → HTML error fragment
 * with HX-Retarget/#main-content and HX-Reswap/innerHTML headers
 * - All other requests (including HTMX boosted) → pre-built HTML 500 error page
 *
 * Logs the error with method and path context via the ServiceFactory logger.
 * No internal error details are exposed in any response (FR-005).
 *
 * @param err - The uncaught error
 * @param c - The Hono context
 * @returns An appropriate error response
 */
app.onError(async (err, c) => {
  getServiceFactory(c.env).logger.error(`unhandled error on ${c.req.method} ${c.req.path}`, err);

  if (isApiRoute(c.req.path)) {
    return c.json({ error: 'Internal server error' }, 500);
  }

  // HTMX partial requests (not boosted navigations) expect HTML fragments,
  // not full documents. HX-Boosted navigations are full-page loads and should
  // receive the full 500 error page instead.
  const isHtmxPartial =
    c.req.header('HX-Request') === 'true' && c.req.header('HX-Boosted') !== 'true';

  if (isHtmxPartial) {
    return c.html(htmxErrorFragment(), 500, {
      'HX-Retarget': '#main-content',
      'HX-Reswap': 'innerHTML',
    });
  }

  return serveErrorPage(c.env.ASSETS, 500);
});

app.use('*', withSecurityHeaders);

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
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': CACHE_CONTROL_NO_STORE,
    },
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
 * Delegates all GET/POST requests under `/api/auth/*` to the better-auth
 * handler via the ServiceFactory (so worker.ts never imports from
 * infrastructure directly). The response is reconstructed as a new Response
 * to expose mutable headers to the `/api/*` security-headers middleware.
 *
 * Must be registered before the `/api/*` catch-all so that auth API requests
 * are handled here rather than returning 404.
 */
app.on(['GET', 'POST'], '/api/auth/*', async (c): Promise<Response> => {
  try {
    const authResponse = await getServiceFactory(c.env).authHandler(c.req.raw);
    return new Response(authResponse.body, authResponse);
  } catch (error: unknown) {
    getServiceFactory(c.env).logger.error('auth handler error', error);
    return c.json({ error: 'Service Unavailable' }, 503, { 'Retry-After': '30' });
  }
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

/** Terminates the authenticated user's session. */
app.post('/auth/sign-out', async (c): Promise<Response> => {
  return getServiceFactory(c.env).authPageHandlers.handlePostSignOut(c.req.raw);
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
  return c.body(null, 405, { Allow: 'POST' });
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

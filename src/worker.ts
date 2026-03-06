import type { Context } from 'hono';
import { Hono } from 'hono/tiny';
import type { MiddlewareHandler } from 'hono/types';

import { getServiceFactory } from './di/serviceFactory';
import { apiNotFound, healthCheck } from './presentation/handlers/ApiHandlers';
import { appPartialNotFound } from './presentation/handlers/AppPartialHandlers';
import { staticAssetFallthrough } from './presentation/handlers/StaticAssetHandler';
import type { AppEnv } from './presentation/types';
import { applySecurityHeaders } from './presentation/utils/securityHeaders';

// Durable Object class must be exported from the worker entry point so
// the Workers runtime can register it as a named DO binding.
export { RateLimitDO } from './infrastructure/RateLimitDO';

const app = new Hono<AppEnv>();

/**
 * Middleware: apply security headers after the downstream handler runs.
 *
 * Static assets served via the [assets] config use the _headers file instead.
 *
 * @param c - The Hono context.
 * @param next - The next middleware function in the chain.
 */
const withSecurityHeaders: MiddlewareHandler<AppEnv> = async (c, next): Promise<void> => {
  await next();
  applySecurityHeaders(c.res.headers);
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

app.use('/api/*', withSecurityHeaders);
app.use('/app/_/*', withSecurityHeaders);
app.use('/auth/*', withSecurityHeaders);

/** Middleware: require authentication for all app routes. */
app.use('/app/*', async (c, next): Promise<Response | void> => {
  return getServiceFactory(c.env).requireAuthMiddleware(c as Context<AppEnv>, next);
});

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
  const authResponse = await getServiceFactory(c.env).authHandler(c.req.raw);
  return new Response(authResponse.body, authResponse);
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

/** Activates a ready action. */
app.post('/api/v1/actions/:id/activate', async (c): Promise<Response> => {
  return getServiceFactory(c.env).actionApiHandlers.handleActivate(c as Context<AppEnv>);
});

/** Completes an active action. */
app.post('/api/v1/actions/:id/complete', async (c): Promise<Response> => {
  return getServiceFactory(c.env).actionApiHandlers.handleComplete(c as Context<AppEnv>);
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

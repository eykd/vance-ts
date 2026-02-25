import type { Context } from 'hono';
import { Hono } from 'hono/tiny';

import { getServiceFactory } from './di/serviceFactory';
import { apiNotFound, healthCheck } from './presentation/handlers/ApiHandlers';
import { appPartialNotFound } from './presentation/handlers/AppPartialHandlers';
import { staticAssetFallthrough } from './presentation/handlers/StaticAssetHandler';
import type { AppEnv } from './presentation/types';
import { applySecurityHeaders } from './presentation/utils/securityHeaders';

const app = new Hono<AppEnv>();

/**
 * Middleware: apply security headers to all Worker-handled API routes.
 *
 * Static assets served via the [assets] config use the _headers file instead.
 */
app.use('/api/*', async (c, next): Promise<void> => {
  await next();
  applySecurityHeaders(c.res.headers);
});

/** Middleware: apply security headers to all app partial routes. */
app.use('/app/_/*', async (c, next): Promise<void> => {
  await next();
  applySecurityHeaders(c.res.headers);
});

/** Middleware: apply security headers to all auth page routes. */
app.use('/auth/*', async (c, next): Promise<void> => {
  await next();
  applySecurityHeaders(c.res.headers);
});

/** Middleware: require authentication for all app routes. */
app.use('/app/*', async (c, next): Promise<Response | void> => {
  return getServiceFactory(c.env).requireAuthMiddleware(c as Context<AppEnv>, next);
});

/** Health check endpoint. */
app.get('/api/health', healthCheck);

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

/** Catch-all for unimplemented API routes. */
app.all('/api/*', apiNotFound);

/** Renders the sign-in form page. */
app.get('/auth/sign-in', (c): Response => {
  return getServiceFactory(c.env).authPageHandlers.handleGetSignIn(c.req.raw);
});

/**
 * Authenticates the user and creates a session.
 *
 * Rate limiting is enforced via the KvRateLimiter inside SignInUseCase
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
 * Rate limiting is enforced via the KvRateLimiter inside SignUpUseCase
 * (invoked by AuthPageHandlers.handlePostSignUp).
 */
app.post('/auth/sign-up', async (c): Promise<Response> => {
  return getServiceFactory(c.env).authPageHandlers.handlePostSignUp(c.req.raw);
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

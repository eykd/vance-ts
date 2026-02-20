import { Hono } from 'hono/tiny';

import type { Env } from './infrastructure/env';
import { apiNotFound, healthCheck } from './presentation/handlers/ApiHandlers';
import { appPartialNotFound } from './presentation/handlers/AppPartialHandlers';
import { applySecurityHeaders } from './presentation/utils/securityHeaders';

/** Hono environment type binding Cloudflare Workers env. */
type AppEnv = { Bindings: Env };

const app = new Hono<AppEnv>();

/**
 * Middleware: apply security headers to all Worker-handled routes.
 *
 * Static assets served via the [assets] config use the _headers file instead.
 */
app.use('/api/*', async (c, next): Promise<void> => {
  await next();
  applySecurityHeaders(c.res.headers);
});
app.use('/app/_/*', async (c, next): Promise<void> => {
  await next();
  applySecurityHeaders(c.res.headers);
});

/** Health check endpoint. */
app.get('/api/health', healthCheck);

/** Catch-all for unimplemented API routes. */
app.all('/api/*', apiNotFound);

/** Catch-all for unimplemented app partial routes. */
app.all('/app/_/*', appPartialNotFound);

/**
 * Static asset fallthrough.
 *
 * Only reached if run_worker_first did not match the request path.
 * Delegates to the ASSETS binding which serves from hugo/public/.
 */
app.all('*', (c): Promise<Response> => c.env.ASSETS.fetch(c.req.raw));

export default app;

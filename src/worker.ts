import { Hono } from 'hono/tiny';

import { apiNotFound, healthCheck } from './presentation/handlers/ApiHandlers';
import { appPartialNotFound } from './presentation/handlers/AppPartialHandlers';
import { staticAssetFallthrough } from './presentation/handlers/StaticAssetHandler';
import type { AppEnv } from './presentation/types';
import { applySecurityHeaders } from './presentation/utils/securityHeaders';

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
app.all('*', staticAssetFallthrough);

export default app;

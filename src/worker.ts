import { Hono } from 'hono/tiny';

import { applySecurityHeaders } from './presentation/utils/securityHeaders';
import type { Env } from './types/env';

/** Hono environment type binding Cloudflare Workers env. */
type AppEnv = { Bindings: Env };

const app = new Hono<AppEnv>();

/**
 * Middleware: apply security headers to all Worker-handled routes.
 *
 * Static assets served via the [assets] config use the _headers file instead.
 */
app.use('/api/*', async (c, next) => {
  await next();
  applySecurityHeaders(c.res.headers);
});
app.use('/app/_/*', async (c, next) => {
  await next();
  applySecurityHeaders(c.res.headers);
});

/** Health check endpoint. */
app.get('/api/health', (c) => c.json({ status: 'ok' }));

/** Catch-all for unimplemented API routes. */
app.all('/api/*', (c) => c.json({ error: 'Not found' }, 404));

/** Catch-all for unimplemented app partial routes. */
app.all('/app/_/*', (c) => c.json({ error: 'Not found' }, 404));

/**
 * Static asset fallthrough.
 *
 * Only reached if run_worker_first did not match the request path.
 * Delegates to the ASSETS binding which serves from hugo/public/.
 */
app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;

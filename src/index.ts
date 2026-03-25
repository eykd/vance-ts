/**
 * Application entry point — wraps the Hono Worker app with Sentry.
 *
 * Wrangler reads `main = "./src/index.ts"` and uses the default export's
 * `fetch` method as the Worker handler.
 */
import * as Sentry from '@sentry/cloudflare';

import type { Env } from './shared/env';
import app from './worker';

// Durable Object class must be re-exported from the entry point so
// the Workers runtime can register it as a named DO binding.
export { RateLimitDO } from './infrastructure/RateLimitDO';

export default Sentry.withSentry(
  (env: Env) => ({
    dsn: env.SENTRY_DSN,
    sendDefaultPii: true,
  }),
  app
);

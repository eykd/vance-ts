/**
 * Application entry point — re-exports the Hono Worker app and Durable Objects.
 *
 * Wrangler reads `main = "./src/index.ts"` and uses the default export's
 * `fetch` method as the Worker handler. The RateLimitDO class must also be
 * exported here so Wrangler can bind it as a Durable Object.
 */
export { default } from './worker';
export { RateLimitDO } from './worker';

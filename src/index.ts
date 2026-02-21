/**
 * Application entry point — re-exports the Hono Worker app.
 *
 * Wrangler reads `main = "./src/index.ts"` and uses the default export's
 * `fetch` method as the Worker handler.
 */
export { default } from './worker';

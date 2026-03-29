/// <reference types="@cloudflare/workers-types" />

/**
 * Cloudflare Workers environment bindings.
 *
 * Extend this interface as D1, KV, or R2 bindings are added.
 */
export interface Env {
  /** Cloudflare static asset fetcher for serving Hugo-built files. */
  readonly ASSETS: Fetcher;
  /** D1 database for user/session storage. */
  readonly DB: D1Database;
  /** Public base URL (e.g., https://app.turtlebased.io). */
  readonly BETTER_AUTH_URL: string;
  /** MUST be >= 32 bytes of cryptographically random entropy — generate with: openssl rand -hex 32 */
  readonly BETTER_AUTH_SECRET: string;
  /** Durable Object namespace for atomic rate limiting. */
  readonly RATE_LIMIT: DurableObjectNamespace;
  /** Sentry DSN for error tracking. */
  readonly SENTRY_DSN: string;
}

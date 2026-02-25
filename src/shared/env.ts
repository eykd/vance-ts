/// <reference types="@cloudflare/workers-types" />

/**
 * Cloudflare Workers environment bindings.
 *
 * Extend this interface as D1, KV, or R2 bindings are added.
 */
export interface Env {
  readonly ASSETS: Fetcher;
  readonly DB: D1Database; // D1 database for user/session storage
  readonly BETTER_AUTH_URL: string; // Public base URL (e.g., https://app.turtlebased.io)
  readonly BETTER_AUTH_SECRET: string | undefined; // MUST be >= 32 bytes of cryptographically random entropy — generate with: openssl rand -hex 32
  readonly RATE_LIMIT: DurableObjectNamespace; // Durable Object namespace for atomic rate limiting
}

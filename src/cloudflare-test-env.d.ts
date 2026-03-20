/// <reference types="@cloudflare/vitest-pool-workers/types" />
/// <reference types="@cloudflare/workers-types" />

/**
 * Augments the `Cloudflare.Env` namespace interface so that
 * `import { env } from "cloudflare:test"` resolves `env.DB` (and any
 * other bindings declared in the project's `Env`) with full type safety.
 *
 * The `@cloudflare/vitest-pool-workers/types` reference above declares the
 * `cloudflare:test` module whose `env` export is typed as `Cloudflare.Env`.
 * By extending `Cloudflare.Env` here we surface the project's bindings to
 * every integration test that imports from `cloudflare:test`.
 */
declare namespace Cloudflare {
  interface Env {
    /** D1 database for user/session storage. */
    readonly DB: D1Database;
    /** Cloudflare static asset fetcher for serving Hugo-built files. */
    readonly ASSETS: Fetcher;
    /** Public base URL (e.g., https://app.turtlebased.io). */
    readonly BETTER_AUTH_URL: string;
    /** MUST be >= 32 bytes of cryptographically random entropy. */
    readonly BETTER_AUTH_SECRET: string;
    /** Durable Object namespace for atomic rate limiting. */
    readonly RATE_LIMIT: DurableObjectNamespace;
  }
}

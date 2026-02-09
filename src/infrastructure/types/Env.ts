import type { D1Database, KVNamespace } from './CloudflareTypes';

/**
 * Cloudflare Workers environment bindings.
 *
 * Passed as the second argument to the Worker fetch handler.
 */
export interface Env {
  /** D1 database binding for user persistence. */
  readonly DB: D1Database;

  /** KV namespace binding for session storage. */
  readonly SESSIONS: KVNamespace;

  /** KV namespace binding for rate limit state. */
  readonly RATE_LIMITS: KVNamespace;

  /** Runtime environment name (e.g., 'development', 'production'). */
  readonly ENVIRONMENT: string;
}

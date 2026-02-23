/// <reference types="@cloudflare/workers-types" />

/**
 * Cloudflare Workers environment bindings.
 *
 * Extend this interface as D1, KV, or R2 bindings are added.
 */
export interface Env {
  readonly ASSETS: Fetcher;
}

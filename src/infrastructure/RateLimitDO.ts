/**
 * Durable Object for atomic rate limit counting.
 *
 * Each instance of `RateLimitDO` represents a single rate limit window for
 * one key (e.g., one IP + endpoint combination). Because Durable Objects
 * process requests sequentially in a single-threaded event loop, concurrent
 * `increment` calls are automatically serialised — eliminating the
 * read-modify-write race that exists with plain KV storage.
 *
 * **Protocol** — the enclosing Worker calls this DO via HTTP:
 * - `GET  /check`               → `200 { count, resetAt } | null`
 * - `POST /increment`           → `204` (body: `{ ttlSeconds }`)
 * - `POST /check-and-increment` → `200 { allowed, retryAfter? }` (body: `{ ttlSeconds, maxAttempts }`)
 * - Anything else               → `404`
 *
 * @module
 */

import type { Env } from '../shared/env';

/** Shape of the rate limit entry persisted in Durable Object storage. */
interface RateLimitEntry {
  /** Number of attempts recorded within the current window. */
  count: number;
  /** Unix timestamp (ms) at which the current window expires. */
  resetAt: number;
}

/** Storage key used to persist the rate limit entry within the DO instance. */
const STORAGE_KEY = 'entry';

/**
 * Durable Object that holds one rate limit counter per isolate instance.
 *
 * Instantiated one-per-key by `DurableObjectRateLimiter` via
 * `namespace.idFromName(key)`. All requests for the same key are routed to
 * the same Durable Object instance and processed one at a time.
 *
 * @example
 * ```toml
 * # wrangler.toml
 * [[durable_objects.bindings]]
 * name = "RATE_LIMIT"
 * class_name = "RateLimitDO"
 *
 * [[migrations]]
 * tag = "v1"
 * new_classes = ["RateLimitDO"]
 * ```
 */
export class RateLimitDO implements DurableObject {
  private readonly state: DurableObjectState;

  /**
   * Creates a new RateLimitDO instance.
   *
   * @param state - The Durable Object state providing access to persistent storage.
   * @param _env - Cloudflare Workers environment bindings (unused by this DO).
   */
  constructor(state: DurableObjectState, _env: Env) {
    this.state = state;
  }

  /**
   * Routes incoming requests to the appropriate handler.
   *
   * @param request - The incoming HTTP request from the enclosing Worker.
   * @returns The HTTP response for the requested operation.
   */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/check') {
      return this.handleCheck();
    }

    if (request.method === 'POST' && url.pathname === '/increment') {
      return this.handleIncrement(request);
    }

    if (request.method === 'POST' && url.pathname === '/check-and-increment') {
      return this.handleCheckAndIncrement(request);
    }

    return new Response('Not found', { status: 404 });
  }

  /**
   * Returns the current rate limit entry, or `null` if absent or expired.
   *
   * @returns `200` with `{ count, resetAt }` for an active entry, or `null`.
   */
  private async handleCheck(): Promise<Response> {
    const entry = await this.state.storage.get<RateLimitEntry>(STORAGE_KEY);

    if (entry === undefined || entry.resetAt <= Date.now()) {
      return Response.json(null);
    }

    return Response.json(entry);
  }

  /**
   * Atomically increments the attempt counter.
   *
   * - **New / expired window**: resets `count` to `1` and sets `resetAt` based on `ttlSeconds`.
   * - **Active window**: increments `count` and preserves `resetAt`.
   *
   * Because this runs inside a Durable Object (single-threaded), the
   * read-then-write is atomic with respect to concurrent callers.
   *
   * @param request - The incoming POST request; body must be `{ ttlSeconds: number }`.
   * @returns `204 No Content` on success.
   */
  private async handleIncrement(request: Request): Promise<Response> {
    const { ttlSeconds } = await request.json<{ ttlSeconds: number }>();
    const entry = await this.state.storage.get<RateLimitEntry>(STORAGE_KEY);
    const now = Date.now();

    if (entry === undefined || entry.resetAt <= now) {
      await this.state.storage.put<RateLimitEntry>(STORAGE_KEY, {
        count: 1,
        resetAt: now + ttlSeconds * 1000,
      });
    } else {
      await this.state.storage.put<RateLimitEntry>(STORAGE_KEY, {
        count: entry.count + 1,
        resetAt: entry.resetAt,
      });
    }

    return new Response(null, { status: 204 });
  }

  /**
   * Atomically checks the rate limit and increments the counter in a single operation.
   *
   * Eliminates the TOCTOU race between a separate `check` and `increment` call:
   * because this entire read-check-write sequence executes inside the Durable Object's
   * single-threaded event loop, no two concurrent callers can both pass the check before
   * either increments.
   *
   * - If the active window has `count >= maxAttempts`: returns `{ allowed: false, retryAfter }`
   * **without** modifying storage.
   * - Otherwise (no entry, expired window, or count below limit): increments (or creates) the
   * counter and returns `{ allowed: true }`.
   *
   * @param request - The incoming POST request; body must be `{ ttlSeconds: number, maxAttempts: number }`.
   * @returns `200` with `{ allowed: boolean; retryAfter?: number }`.
   */
  private async handleCheckAndIncrement(request: Request): Promise<Response> {
    const { ttlSeconds, maxAttempts } = await request.json<{
      ttlSeconds: number;
      maxAttempts: number;
    }>();
    const entry = await this.state.storage.get<RateLimitEntry>(STORAGE_KEY);
    const now = Date.now();

    if (entry !== undefined && entry.resetAt > now && entry.count >= maxAttempts) {
      const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      return Response.json({ allowed: false, retryAfter });
    }

    if (entry === undefined || entry.resetAt <= now) {
      await this.state.storage.put<RateLimitEntry>(STORAGE_KEY, {
        count: 1,
        resetAt: now + ttlSeconds * 1000,
      });
    } else {
      await this.state.storage.put<RateLimitEntry>(STORAGE_KEY, {
        count: entry.count + 1,
        resetAt: entry.resetAt,
      });
    }

    return Response.json({ allowed: true });
  }
}

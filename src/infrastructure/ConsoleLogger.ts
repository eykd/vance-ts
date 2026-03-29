/**
 * ConsoleLogger — infrastructure adapter for the {@link Logger} port.
 *
 * Delegates to the global `console` object, which is available in
 * Cloudflare Workers (Web Standard API). Logs appear in `wrangler tail`
 * and the Workers dashboard.
 *
 * @module
 */

import type { Logger } from '../application/ports/Logger.js';

/**
 * Logger implementation backed by `console`.
 *
 * Suitable for Cloudflare Workers where `console.error` writes to the
 * Workers runtime log stream.
 */
export class ConsoleLogger implements Logger {
  /**
   * Logs an informational message via `console.info`.
   *
   * @param message - Human-readable description of the event.
   */
  info(message: string): void {
    // eslint-disable-next-line no-console
    console.info(message);
  }

  /**
   * Logs an error-level message with an optional cause via `console.error`.
   *
   * @param message - Human-readable description of the error context.
   * @param cause - The underlying error or value that triggered the log entry.
   */
  error(message: string, cause?: unknown): void {
    console.error(message, cause);
  }
}

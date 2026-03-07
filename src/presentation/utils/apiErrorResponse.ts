/**
 * Shared API error response mapper.
 *
 * Maps caught errors to consistent JSON error envelopes:
 * - {@link DomainError} → 422 with domain error code and message
 * - All other errors → 500 with generic service_error
 *
 * @module
 */

import type { Context } from 'hono';

import { DomainError } from '../../domain/errors/DomainError.js';

/**
 * Maps an unknown caught error to a JSON error response.
 *
 * @param c - Hono request context.
 * @param err - The caught error value.
 * @returns A JSON Response with appropriate status code and error envelope.
 */
export function apiErrorResponse(c: Context, err: unknown): Response {
  if (err instanceof DomainError) {
    return c.json({ error: { code: err.code, message: err.message } }, 422);
  }
  return c.json({ error: { code: 'service_error', message: 'An unexpected error occurred' } }, 500);
}

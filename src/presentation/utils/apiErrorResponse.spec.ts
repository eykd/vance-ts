/**
 * Tests for apiErrorResponse utility.
 */

import { describe, expect, it } from 'vitest';

import { DomainError } from '../../domain/errors/DomainError.js';

import { apiErrorResponse } from './apiErrorResponse.js';

/**
 * Creates a minimal Hono-like context for testing.
 *
 * @returns A stub context with a json() method that builds Response objects.
 */
function createStubContext(): {
  json: (body: unknown, status: number) => Response;
} {
  return {
    json(body: unknown, status: number): Response {
      return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  };
}

describe('apiErrorResponse', () => {
  it('returns 422 with code and message for DomainError', async () => {
    const c = createStubContext();
    const err = new DomainError('not_found', 'Item not found');

    const res = apiErrorResponse(c as never, err);

    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body).toEqual({
      error: { code: 'not_found', message: 'Item not found' },
    });
  });

  it('returns 500 with generic message for non-DomainError', async () => {
    const c = createStubContext();
    const err = new Error('db connection failed');

    const res = apiErrorResponse(c as never, err);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({
      error: { code: 'service_error', message: 'An unexpected error occurred' },
    });
  });

  it('returns 500 for non-Error throwables', async () => {
    const c = createStubContext();

    const res = apiErrorResponse(c as never, 'string error');

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({
      error: { code: 'service_error', message: 'An unexpected error occurred' },
    });
  });
});

/**
 * Shared helpers for acceptance tests running in the vitest-pool-workers environment.
 *
 * Import SELF and env from "cloudflare:test" in each test file, not here.
 * These helpers provide convenience wrappers for common acceptance test operations.
 */

import { SELF } from 'cloudflare:test';

/**
 * Makes a GET request to the Worker under test.
 *
 * @param path - The URL path to request (e.g. "/api/items").
 * @returns The Worker's Response.
 */
export async function get(path: string): Promise<Response> {
  return SELF.fetch(new Request(`https://example.com${path}`));
}

/**
 * Makes a POST request with a JSON body to the Worker under test.
 *
 * @param path - The URL path to request.
 * @param body - The JSON body to send.
 * @returns The Worker's Response.
 */
export async function post(path: string, body: unknown): Promise<Response> {
  return SELF.fetch(
    new Request(`https://example.com${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  );
}

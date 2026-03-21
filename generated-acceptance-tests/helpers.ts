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

/**
 * GETs an auth form page and extracts the CSRF token from the Set-Cookie header.
 *
 * @param path - The auth page path (e.g. "/auth/sign-up").
 * @returns The extracted CSRF token string.
 */
export async function getAuthForm(
  path: string
): Promise<{ csrfToken: string }> {
  const response = await SELF.fetch(
    new Request(`https://example.com${path}`, { redirect: 'manual' })
  );
  const setCookie = response.headers.get('Set-Cookie') ?? '';
  const match = setCookie.match(/__Host-csrf=([^;]+)/);
  const csrfToken = match?.[1] ?? '';
  return { csrfToken };
}

/**
 * POSTs an auth form with URL-encoded fields including the CSRF double-submit token.
 *
 * @param path - The auth form action path (e.g. "/auth/sign-up").
 * @param fields - Form fields to include (e.g. `{ email, password }`).
 * @param csrfToken - The CSRF token extracted from getAuthForm().
 * @param sessionCookie - Optional session cookie to include in the request.
 * @param ip - Optional IP address for the CF-Connecting-IP header.
 * @returns The Worker's Response (with redirect: "manual" so 3xx is visible).
 */
export async function submitAuthForm(
  path: string,
  fields: Record<string, string>,
  csrfToken: string,
  sessionCookie?: string,
  ip?: string
): Promise<Response> {
  const body = new URLSearchParams({ ...fields, _csrf: csrfToken });
  const headers = new Headers({
    'Content-Type': 'application/x-www-form-urlencoded',
    Cookie: `__Host-csrf=${csrfToken}${sessionCookie ? `; ${sessionCookie}` : ''}`,
  });
  if (ip !== undefined) {
    headers.set('CF-Connecting-IP', ip);
  }
  return SELF.fetch(
    new Request(`https://example.com${path}`, {
      method: 'POST',
      headers,
      body: body.toString(),
      redirect: 'manual',
    })
  );
}

/**
 * Extracts the session cookie string from a response's Set-Cookie header.
 *
 * @param response - A response from a sign-in request.
 * @returns The full `name=value` session cookie string, or empty string if not found.
 */
export function extractSessionCookie(response: Response): string {
  const setCookie = response.headers.get('Set-Cookie') ?? '';
  const match = setCookie.match(/(__Host-better-auth\.session_token=[^;]+)/);
  return match?.[1] ?? '';
}

/**
 * Signs in a user and returns the session cookie string.
 *
 * @param email - The user's email address.
 * @param password - The user's password.
 * @param ip - Optional IP address to use (useful for rate-limit test isolation).
 * @returns The session cookie string for use in subsequent requests.
 */
export async function signInAs(
  email: string,
  password: string,
  ip?: string
): Promise<string> {
  const { csrfToken } = await getAuthForm('/auth/sign-in');
  const res = await submitAuthForm(
    '/auth/sign-in',
    { email, password },
    csrfToken,
    undefined,
    ip
  );
  return extractSessionCookie(res);
}

/**
 * Registers a user, signs in, and returns the session cookie.
 *
 * @param email - User email.
 * @param ip - IP address for rate limit isolation.
 * @returns Session cookie string.
 */
export async function setupUser(email: string, ip: string): Promise<string> {
  const { csrfToken } = await getAuthForm('/auth/sign-up');
  await submitAuthForm('/auth/sign-up', { email, password: 'SuperSecure#Pass789', password_confirm: 'SuperSecure#Pass789' }, csrfToken, undefined, ip);
  return signInAs(email, 'SuperSecure#Pass789', ip);
}

/**
 * Captures an inbox item and returns its ID.
 *
 * @param sessionCookie - Session cookie for auth.
 * @param title - Inbox item title.
 * @returns The created inbox item ID.
 */
export async function captureInboxItem(sessionCookie: string, title: string): Promise<string> {
  const res = await SELF.fetch(
    new Request('https://example.com/api/v1/inbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({ title }),
    }),
  );
  const body = await res.json() as { id: string };
  return body.id;
}

/**
 * Gets the first area ID from the API.
 *
 * @param sessionCookie - Session cookie for auth.
 * @returns The first area ID.
 */
export async function getFirstAreaId(sessionCookie: string): Promise<string> {
  const res = await SELF.fetch(
    new Request('https://example.com/api/v1/areas', { headers: { Cookie: sessionCookie } }),
  );
  const areas = await res.json() as Array<{ id: string }>;
  return areas[0]!.id;
}

/**
 * Gets the first context ID from the API.
 *
 * @param sessionCookie - Session cookie for auth.
 * @returns The first context ID.
 */
export async function getFirstContextId(sessionCookie: string): Promise<string> {
  const res = await SELF.fetch(
    new Request('https://example.com/api/v1/contexts', { headers: { Cookie: sessionCookie } }),
  );
  const contexts = await res.json() as Array<{ id: string }>;
  return contexts[0]!.id;
}

/**
 * Captures an inbox item, clarifies it into an action, and returns the action ID.
 *
 * @param sessionCookie - Session cookie for auth.
 * @param title - Action title.
 * @returns The created action ID.
 */
export async function createReadyAction(sessionCookie: string, title: string): Promise<string> {
  const inboxItemId = await captureInboxItem(sessionCookie, title);
  const areaId = await getFirstAreaId(sessionCookie);
  const contextId = await getFirstContextId(sessionCookie);

  const clarifyRes = await SELF.fetch(
    new Request(`https://example.com/api/v1/inbox/${inboxItemId}/clarify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({ title, areaId, contextId }),
    }),
  );
  const action = await clarifyRes.json() as { id: string };
  return action.id;
}

/**
 * Global type declarations for acceptance test helpers.
 *
 * The helpers from ./helpers.ts are assigned to globalThis in setup.ts
 * so that bound test blocks can reference them without explicit imports.
 */

/* eslint-disable no-var */
declare global {
  /** Makes a GET request to the Worker under test. */
  var get: (path: string) => Promise<Response>;

  /** Makes a POST request with a JSON body to the Worker under test. */
  var post: (path: string, body: unknown) => Promise<Response>;

  /** GETs an auth form page and extracts the CSRF token. */
  var getAuthForm: (path: string) => Promise<{ csrfToken: string }>;

  /** POSTs an auth form with URL-encoded fields including the CSRF token. */
  var submitAuthForm: (
    path: string,
    fields: Record<string, string>,
    csrfToken: string,
    sessionCookie?: string,
    ip?: string
  ) => Promise<Response>;

  /** Extracts the session cookie string from a response's Set-Cookie header. */
  var extractSessionCookie: (response: Response) => string;

  /** Signs in a user and returns the session cookie string. */
  var signInAs: (
    email: string,
    password: string,
    ip?: string
  ) => Promise<string>;
}
/* eslint-enable no-var */

export {};

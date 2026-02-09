/**
 * Configuration for cookie naming and security attributes.
 *
 * Controls cookie name prefixes and the Secure attribute for
 * development vs production environments.
 */
export interface CookieOptions {
  /** Name used for the session cookie. */
  readonly sessionName: string;

  /** Name used for the CSRF cookie. */
  readonly csrfName: string;

  /** Whether to include the Secure attribute on cookies. */
  readonly secure: boolean;
}

/**
 * Production cookie options.
 *
 * Uses `__Host-` prefix for origin binding (requires HTTPS + no Domain attribute).
 * Secure attribute is enabled.
 */
export const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
  sessionName: '__Host-session',
  csrfName: '__Host-csrf',
  secure: true,
};

/**
 * Development cookie options.
 *
 * Omits `__Host-` prefix and Secure attribute for local HTTP development.
 */
export const DEV_COOKIE_OPTIONS: CookieOptions = {
  sessionName: 'session',
  csrfName: 'csrf',
  secure: false,
};

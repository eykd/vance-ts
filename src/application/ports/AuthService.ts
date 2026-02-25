/**
 * AuthService port interface.
 *
 * Defines the contract for authentication operations, decoupled from any
 * concrete infrastructure implementation (e.g., better-auth). Use cases
 * accept this interface — never the concrete adapter type.
 *
 * @module
 */

/**
 * Data Transfer Object representing an authenticated user at the application boundary.
 *
 * Presentation and application layers must use this type — never the domain
 * entity — to preserve Clean Architecture layer boundaries.
 */
export interface AuthUserDto {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly emailVerified: boolean;
  /** ISO 8601 UTC timestamp of account creation. */
  readonly createdAt: string;
}

/**
 * Data Transfer Object representing an active user session at the application boundary.
 *
 * Presentation and application layers must use this type — never the domain
 * entity — to preserve Clean Architecture layer boundaries.
 */
export interface AuthSessionDto {
  readonly id: string;
  /** Session token stored in the cookie; used for CSRF derivation. */
  readonly token: string;
  readonly userId: string;
  /** ISO 8601 UTC timestamp when the session expires. */
  readonly expiresAt: string;
  /** ISO 8601 UTC timestamp when the session was created. */
  readonly createdAt: string;
}

/**
 * Port interface for email/password authentication and session management.
 *
 * The adapter (`BetterAuthService`) lives in `src/infrastructure/` and
 * translates better-auth responses into these application DTO types.
 *
 * `Headers` is used in `getSession` because it is a Web Standard API
 * available at all runtime layers.
 */
export interface AuthService {
  /**
   * Attempts to sign in a user with email and password.
   *
   * @param params - Sign-in credentials and client IP for rate limiting.
   * @param params.email - The user's email address.
   * @param params.password - The user's plaintext password.
   * @param params.ip - Client IP address used for rate limiting.
   * @returns `{ ok: true, sessionCookie }` on success, or a typed failure.
   */
  signIn(params: { email: string; password: string; ip: string }): Promise<
    | { ok: true; sessionCookie: string }
    | {
        ok: false;
        kind: 'invalid_credentials' | 'rate_limited' | 'service_error';
        retryAfter?: number;
      }
  >;

  /**
   * Registers a new user account.
   *
   * **Result kind origins** (for implementors and callers):
   * - `email_taken` — `BetterAuthService`: better-auth HTTP 422.
   * - `weak_password` — `BetterAuthService`: better-auth HTTP 400 (password too short/long).
   * - `rate_limited` — `BetterAuthService`: better-auth HTTP 429 (not KV rate limiting).
   * - `service_error` — `BetterAuthService`: non-2xx/400/422/429 response or thrown exception.
   *
   * Note: `password_too_common` is NOT produced by this port — it is detected in
   * `SignUpUseCase` before calling this method, because better-auth v1.4.x provides
   * no password validation hook at registration time.
   *
   * @param params - Registration details and client IP for rate limiting.
   * @param params.email - The user's email address.
   * @param params.password - The user's plaintext password.
   * @param params.name - The user's display name.
   * @param params.ip - Client IP address used for rate limiting.
   * @returns `{ ok: true }` on success, or a typed failure.
   */
  signUp(params: {
    email: string;
    password: string;
    name: string;
    ip: string;
  }): Promise<
    | { ok: true }
    | { ok: false; kind: 'email_taken' | 'weak_password' | 'rate_limited' | 'service_error' }
  >;

  /**
   * Signs out the user associated with the given session cookie.
   *
   * @param params - Sign-out parameters.
   * @param params.sessionCookie - The session cookie value from the request.
   * @returns `{ ok: true, clearCookieHeader }` on success, or a typed failure.
   */
  signOut(params: {
    sessionCookie: string;
  }): Promise<{ ok: true; clearCookieHeader: string } | { ok: false; kind: 'service_error' }>;

  /**
   * Retrieves the authenticated user and session from request headers.
   *
   * Returns `null` when no valid session is present.
   *
   * @param params - Request parameters.
   * @param params.headers - Request headers containing the session cookie.
   */
  getSession(params: {
    headers: Headers;
  }): Promise<{ user: AuthUserDto; session: AuthSessionDto } | null>;

  /**
   * Performs a constant-time dummy password verification for timing oracle defence (FR-007).
   *
   * Runs the password hasher against an internal startup-generated dummy hash so that
   * the "email not found" code path takes the same wall-clock time as "email found,
   * wrong password". The result is discarded — callers await this for its timing effect only.
   *
   * @param password - The submitted plaintext password to verify against the dummy hash.
   */
  verifyDummyPassword(password: string): Promise<void>;
}

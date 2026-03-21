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
 * All methods are transport-agnostic: no HTTP headers, cookies, or response
 * objects appear in the signatures.
 */
export interface AuthService {
  /**
   * Attempts to sign in a user with email and password.
   *
   * @param params - Sign-in credentials.
   * @param params.email - The user's email address.
   * @param params.password - The user's plaintext password.
   * @returns `{ ok: true, sessionToken }` on success, or a typed failure.
   * The `sessionToken` is an opaque string; the presentation layer constructs
   * the Set-Cookie header from it using `buildSessionCookie`.
   */
  signIn(params: { email: string; password: string }): Promise<
    | { ok: true; sessionToken: string }
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
   * - `invalid_email` — `BetterAuthService`: better-auth HTTP 400 with `INVALID_EMAIL` code.
   * - `rate_limited` — `BetterAuthService`: better-auth HTTP 429 (not KV rate limiting).
   * - `service_error` — `BetterAuthService`: non-2xx/400/422/429 response or thrown exception.
   *
   * Note: `password_too_common` is NOT produced by this port — it is detected in
   * `SignUpUseCase` before calling this method, because better-auth v1.4.x provides
   * no password validation hook at registration time.
   *
   * @param params - Registration details.
   * @param params.email - The user's email address.
   * @param params.password - The user's plaintext password.
   * @param params.name - The user's display name.
   * @returns `{ ok: true }` on success, or a typed failure.
   */
  signUp(params: {
    email: string;
    password: string;
    name: string;
  }): Promise<
    | { ok: true }
    | { ok: false; kind: 'email_taken' | 'weak_password' | 'invalid_email' | 'service_error' }
    | { ok: false; kind: 'rate_limited'; retryAfter?: number }
  >;

  /**
   * Signs out the user associated with the given session token.
   *
   * @param params - Sign-out parameters.
   * @param params.sessionToken - The opaque session token value (not the full cookie string).
   * @returns `{ ok: true }` on success, or a typed failure. The presentation layer
   * is responsible for constructing the Set-Cookie header to clear the session cookie.
   */
  signOut(params: {
    sessionToken: string;
  }): Promise<{ ok: true } | { ok: false; kind: 'service_error' }>;

  /**
   * Retrieves the authenticated user and session for the given session token.
   *
   * Returns `null` when the token is invalid or expired.
   *
   * @param params - Session lookup parameters.
   * @param params.sessionToken - The opaque session token extracted from the request cookie.
   */
  getSession(params: {
    sessionToken: string;
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

  /**
   * Requests a password reset for the given email address.
   *
   * The underlying implementation generates a verification token, stores it,
   * and triggers the configured email delivery (or console log in development).
   * Returns the same success shape regardless of whether the email exists
   * to prevent email enumeration (FR-007).
   *
   * @param params - Password reset request parameters.
   * @param params.email - The email address requesting the reset.
   * @param params.redirectTo - Optional URL path to redirect to after token callback.
   * @returns `{ ok: true }` on success (always, to prevent enumeration), or a typed failure.
   */
  requestPasswordReset(params: {
    email: string;
    redirectTo?: string;
  }): Promise<{ ok: true } | { ok: false; kind: 'service_error' }>;

  /**
   * Resets a user's password using a valid verification token.
   *
   * @param params - Password reset parameters.
   * @param params.token - The verification token from the reset URL.
   * @param params.newPassword - The new password to set.
   * @returns Typed result indicating success or failure kind.
   */
  resetPassword(params: {
    token: string;
    newPassword: string;
  }): Promise<
    { ok: true } | { ok: false; kind: 'invalid_token' | 'weak_password' | 'service_error' }
  >;
}

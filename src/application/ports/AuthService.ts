/**
 * AuthService port interface.
 *
 * Defines the contract for authentication operations, decoupled from any
 * concrete infrastructure implementation (e.g., better-auth). Use cases
 * accept this interface — never the concrete adapter type.
 *
 * @module
 */

import type { AuthSession, AuthUser } from '../../domain/entities/auth.js';

/**
 * Port interface for email/password authentication and session management.
 *
 * The adapter (`BetterAuthService`) lives in `src/infrastructure/` and
 * translates better-auth responses into these domain result types.
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
  }): Promise<{ user: AuthUser; session: AuthSession } | null>;
}

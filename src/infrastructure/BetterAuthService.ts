/**
 * BetterAuth infrastructure adapter implementing the AuthService port.
 *
 * Delegates authentication and session operations to the better-auth library's
 * internal API (`auth.api.*`). Translates better-auth `Response` objects into
 * typed domain result types at the infrastructure boundary so that use cases
 * and presentation handlers remain decoupled from the auth library.
 *
 * @module
 */

import type { betterAuth } from 'better-auth';

import type { AuthService, AuthSessionDto, AuthUserDto } from '../application/ports/AuthService.js';
import { verifyPassword } from '../domain/services/passwordHasher.js';
import { toHex } from '../shared/hex.js';

/** Type alias for the better-auth instance returned by `getAuth(env)`. */
type AuthInstance = ReturnType<typeof betterAuth>;

/**
 * Generates a randomly-salted dummy Argon2id hash string on first access.
 *
 * The hash is in `argon2id$<memory_kb>$<time_cost>$<parallelism>$<salt-hex>$<filler-hex>`
 * format so that {@link verifyPassword} performs a full Argon2id computation
 * against it, equalising response time for non-existent-email vs wrong-password
 * paths (timing oracle defence, FR-007).
 *
 * Using fresh random bytes for both salt and filler ensures the value differs
 * on every Worker deployment, eliminating the timing-attack surface that a
 * hardcoded public constant would expose.
 *
 * @returns A valid-format Argon2id hash string with a fresh random salt.
 */
function generateDummyHash(): string {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const filler = crypto.getRandomValues(new Uint8Array(32));
  return `argon2id$19456$2$1$${toHex(salt)}$${toHex(filler)}`;
}

/**
 * BetterAuth adapter for the {@link AuthService} port.
 *
 * Constructed with the auth instance returned by `getAuth(env)` and wired
 * into the application layer via `src/di/serviceFactory.ts`.
 *
 * @example
 * ```typescript
 * const service = new BetterAuthService(getAuth(env));
 * const result = await service.signIn({ email, password });
 * ```
 */
export class BetterAuthService implements AuthService {
  /**
   * Lazily-initialised backing field for {@link BetterAuthService.DUMMY_HASH}.
   *
   * `null` until the first access, then populated by {@link generateDummyHash}.
   * Deferred to avoid calling `crypto.getRandomValues` at module-evaluation
   * time, which is forbidden in the Cloudflare Workers global scope.
   */
  private static dummyHashCache: string | null = null;

  /**
   * Per-startup Argon2id dummy hash for timing oracle defence (FR-007).
   *
   * `verifyPassword(submittedPassword, DUMMY_HASH)` is called on every
   * non-rate-limited authentication failure so that the "email not found"
   * (fast DB miss) code path takes the same wall-clock time as "email
   * found, wrong password" (full Argon2id computation), preventing
   * timing-based email enumeration attacks.
   *
   * Generated once on first access with a fresh random salt — changes per
   * Worker cold-start so the value is never observable in source code or binaries.
   *
   * @returns The cached dummy Argon2id hash string.
   */
  static get DUMMY_HASH(): string {
    BetterAuthService.dummyHashCache ??= generateDummyHash();
    return BetterAuthService.dummyHashCache;
  }

  /** The better-auth instance obtained from `getAuth(env)`. */
  private readonly auth: AuthInstance;

  /** The session cookie name matching better-auth's configured cookie prefix. */
  private readonly sessionCookieName: string;

  /**
   * Creates a new BetterAuthService wrapping the given better-auth instance.
   *
   * @param auth - The configured better-auth instance from `getAuth(env)`.
   * @param sessionCookieName - The session cookie name matching better-auth's configured prefix.
   */
  constructor(auth: AuthInstance, sessionCookieName: string) {
    this.auth = auth;
    this.sessionCookieName = sessionCookieName;
  }

  /**
   * Attempts to sign in a user with email and password.
   *
   * Delegates to `auth.api.signInEmail` with `asResponse: true` and
   * interprets the HTTP response status to produce a typed result:
   * - 200: success with session token extracted from `Set-Cookie` header
   * - 401: invalid credentials (wrong email or password)
   * - 400: invalid credentials (malformed email)
   * - 429: rate limited (optional `Retry-After` header parsed to seconds)
   * - other: service error
   * - throws: service error
   *
   * @param params - Sign-in credentials.
   * @param params.email - The user's email address.
   * @param params.password - The user's plaintext password.
   * @returns Typed result indicating success or failure kind.
   */
  async signIn(params: { email: string; password: string }): Promise<
    | { ok: true; sessionToken: string }
    | {
        ok: false;
        kind: 'invalid_credentials' | 'rate_limited' | 'service_error';
        retryAfter?: number;
      }
  > {
    try {
      const response = await this.auth.api.signInEmail({
        body: { email: params.email, password: params.password },
        asResponse: true,
      });

      if (response.ok) {
        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader === null) {
          return { ok: false, kind: 'service_error' };
        }
        // Validate the cookie belongs to the expected session cookie
        const expectedPrefix = this.sessionCookieName + '=';
        if (!setCookieHeader.startsWith(expectedPrefix)) {
          return { ok: false, kind: 'service_error' };
        }
        // Extract token value after "Name=" up to the first ";" (or end of string)
        const semiIdx = setCookieHeader.indexOf(';');
        const sessionToken = setCookieHeader.slice(
          expectedPrefix.length,
          semiIdx === -1 ? undefined : semiIdx
        );
        if (sessionToken === '') {
          return { ok: false, kind: 'service_error' };
        }
        return { ok: true, sessionToken };
      }

      if (response.status === 429) {
        const retryAfterHeader = response.headers.get('retry-after');
        const parsed = retryAfterHeader !== null ? parseInt(retryAfterHeader, 10) : Number.NaN;
        const retryAfter = !Number.isNaN(parsed) ? parsed : undefined;
        return { ok: false, kind: 'rate_limited', retryAfter };
      }

      if (response.status === 401 || response.status === 400) {
        return { ok: false, kind: 'invalid_credentials' };
      }

      console.error(`BetterAuthService.signIn: unexpected status ${String(response.status)}`);
      return { ok: false, kind: 'service_error' };
    } catch (error: unknown) {
      console.error('BetterAuthService.signIn: exception thrown', error);
      return { ok: false, kind: 'service_error' };
    }
  }

  /**
   * Registers a new user account.
   *
   * Delegates to `auth.api.signUpEmail` with `asResponse: true` and
   * interprets the HTTP response status to produce a typed result:
   * - 200: success
   * - 422: email already in use
   * - 400: weak password (too short or too long per better-auth config)
   * - 429: rate limited (optional `Retry-After` header parsed to seconds)
   * - other: service error
   * - throws: service error
   *
   * @param params - Registration details.
   * @param params.email - The user's email address.
   * @param params.password - The user's plaintext password.
   * @param params.name - The user's display name.
   * @returns Typed result indicating success or failure kind.
   */
  async signUp(params: {
    email: string;
    password: string;
    name: string;
  }): Promise<
    | { ok: true }
    | { ok: false; kind: 'email_taken' | 'weak_password' | 'service_error' }
    | { ok: false; kind: 'rate_limited'; retryAfter?: number }
  > {
    try {
      const response = await this.auth.api.signUpEmail({
        body: { email: params.email, password: params.password, name: params.name },
        asResponse: true,
      });

      if (response.ok) {
        return { ok: true };
      }

      if (response.status === 429) {
        const retryAfterHeader = response.headers.get('retry-after');
        const parsed = retryAfterHeader !== null ? parseInt(retryAfterHeader, 10) : Number.NaN;
        const retryAfter = !Number.isNaN(parsed) ? parsed : undefined;
        return { ok: false, kind: 'rate_limited', retryAfter };
      }

      if (response.status === 422) {
        return { ok: false, kind: 'email_taken' };
      }

      if (response.status === 400) {
        return { ok: false, kind: 'weak_password' };
      }

      console.error(`BetterAuthService.signUp: unexpected status ${String(response.status)}`);
      return { ok: false, kind: 'service_error' };
    } catch (error: unknown) {
      console.error('BetterAuthService.signUp: exception thrown', error);
      return { ok: false, kind: 'service_error' };
    }
  }

  /**
   * Signs out the user associated with the given session token.
   *
   * Delegates to `auth.api.signOut` with the session token used to construct the
   * `Cookie` request header and `asResponse: true`. Interprets the response:
   * - 200: success (session invalidated server-side)
   * - other: service error
   * - throws: service error
   *
   * The presentation layer is responsible for constructing the `Set-Cookie`
   * header to clear the session cookie in the browser (using `clearSessionCookie()`).
   *
   * @param params - Sign-out parameters.
   * @param params.sessionToken - The opaque session token value (not the full cookie string).
   * @returns `{ ok: true }` on success, or a typed failure.
   */
  async signOut(params: {
    sessionToken: string;
  }): Promise<{ ok: true } | { ok: false; kind: 'service_error' }> {
    try {
      const response = await this.auth.api.signOut({
        headers: new Headers({ cookie: `${this.sessionCookieName}=${params.sessionToken}` }),
        asResponse: true,
      });

      if (response.ok) {
        return { ok: true };
      }

      console.error(`BetterAuthService.signOut: unexpected status ${String(response.status)}`);
      return { ok: false, kind: 'service_error' };
    } catch (error: unknown) {
      console.error('BetterAuthService.signOut: exception thrown', error);
      return { ok: false, kind: 'service_error' };
    }
  }

  /**
   * Retrieves the authenticated user and session for the given session token.
   *
   * Constructs the `Cookie` header internally from `sessionToken` and delegates
   * to `auth.api.getSession`. Returns `null` when no valid session is present.
   * Better-auth `Date` objects are converted to ISO 8601 UTC strings to match
   * the domain entity contract.
   *
   * Unlike the other methods, this one does NOT swallow errors — a thrown
   * exception (e.g., D1 unavailable) propagates to the caller. The
   * `requireAuth` middleware is responsible for wrapping this in a try/catch
   * and returning an appropriate error response (503).
   *
   * @param params - Session lookup parameters.
   * @param params.sessionToken - The opaque session token extracted from the request cookie.
   * @returns The authenticated user and session, or `null` if no valid session.
   * @throws {Error} When better-auth encounters an infrastructure error (e.g.,
   * D1 database unavailable).
   */
  async getSession(params: {
    sessionToken: string;
  }): Promise<{ user: AuthUserDto; session: AuthSessionDto } | null> {
    const headers = new Headers({ cookie: `${this.sessionCookieName}=${params.sessionToken}` });
    const data = await this.auth.api.getSession({ headers });

    if (data === null) {
      return null;
    }

    const { user, session } = data;

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt.toISOString(),
      },
      session: {
        id: session.id,
        token: session.token,
        userId: session.userId,
        expiresAt: session.expiresAt.toISOString(),
        createdAt: session.createdAt.toISOString(),
      },
    };
  }

  /**
   * Performs a constant-time dummy password verification for timing oracle defence (FR-007).
   *
   * Calls {@link verifyPassword} against {@link BetterAuthService.DUMMY_HASH} so that the
   * "email not found" code path takes the same wall-clock time as "email found,
   * wrong password". The result is discarded — this method is awaited for its
   * timing effect only.
   *
   * @param password - The submitted plaintext password to verify against the dummy hash.
   */
  async verifyDummyPassword(password: string): Promise<void> {
    await verifyPassword(password, BetterAuthService.DUMMY_HASH);
  }
}

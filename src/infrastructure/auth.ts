/**
 * better-auth factory for Cloudflare Workers.
 *
 * Provides a module-level singleton (`getAuth`) scoped to the Workers isolate
 * lifetime and a `resetAuth` helper for test isolation.
 *
 * Normalisation of emails (toLowerCase/trim) is intentionally NOT delegated
 * to better-auth — the library does not expose a `normalizeEmail` option in
 * v1.4.x. Email normalisation must be applied in handlers before calling
 * `auth.api.*`.
 *
 * Common-password validation is NOT handled here — better-auth v1.4.x does
 * not expose a `password.validate` hook. Reject common passwords in the
 * application use-case layer before delegating to `auth.api.signUpEmail`.
 *
 * ## Token hashing
 *
 * `databaseHooks` hash `session.token` and `verification.value` before they
 * are written to D1, replacing plaintext token values with HMAC-SHA256 digests
 * keyed on `BETTER_AUTH_SECRET`. This limits the blast radius of a database
 * exfiltration: an attacker who obtains only the D1 dump cannot recover usable
 * token strings.
 *
 * **Session tokens**: better-auth derives the session cookie value from the
 * data returned by the `create` hook, so the cookie and the database row hold
 * the same HMAC digest. The signed-cookie layer (`better-call`) remains the
 * primary protection — an attacker still needs `BETTER_AUTH_SECRET` to forge
 * a valid signed cookie, even if they have the hash from the database.
 *
 * **Verification tokens** (`verification.value`): hashed before storage.
 * Note that password-reset and email-OTP flows (if enabled in future) store
 * functionally significant data in `value`; any plugin that reads `value`
 * after lookup will receive the hash, not the original. This is acceptable
 * because those features are not currently active and any future additions must
 * account for this hashing.
 *
 * @module
 */

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/d1';

import { hashPassword, verifyPassword } from '../domain/services/passwordHasher';
import type { Env } from '../shared/env';

import { hashToken } from './tokenHasher';

/**
 * Snapshot of the env bindings that were active when `_auth` was created.
 * Used to detect BETTER_AUTH_SECRET or DB rotation within the same isolate
 * lifetime (defensive guard; rotation normally forces a Worker restart).
 */
interface AuthEnvIdentity {
  /** The BETTER_AUTH_SECRET value active when the singleton was created. */
  secret: string;
  /** The D1Database binding reference active when the singleton was created. */
  db: D1Database;
}

/** Module-level singleton, lives for the lifetime of the Workers isolate. */
let _auth: ReturnType<typeof betterAuth> | null = null;

/** Env identity snapshot captured alongside `_auth`; null when no instance exists. */
let _authEnvIdentity: AuthEnvIdentity | null = null;

/**
 * Returns the better-auth instance for the given environment, creating it on
 * first call and caching it for the isolate lifetime (lazy singleton).
 *
 * The cache is invalidated when `BETTER_AUTH_SECRET` or the `DB` binding
 * reference changes, so a rotated secret or binding re-creation always
 * produces a fresh instance rather than serving stale configuration.
 *
 * @param env - Cloudflare Workers environment bindings.
 * @returns The configured better-auth instance.
 * @throws {Error} When `BETTER_AUTH_SECRET` is shorter than 32 characters.
 */
export function getAuth(env: Env): ReturnType<typeof betterAuth> {
  if (env.BETTER_AUTH_SECRET === undefined || env.BETTER_AUTH_SECRET.length < 32) {
    throw new Error('BETTER_AUTH_SECRET must be at least 32 characters');
  }

  // Invalidate the cached instance if BETTER_AUTH_SECRET or DB has been rotated.
  if (
    _auth !== null &&
    _authEnvIdentity !== null &&
    (env.BETTER_AUTH_SECRET !== _authEnvIdentity.secret || env.DB !== _authEnvIdentity.db)
  ) {
    _auth = null;
    _authEnvIdentity = null;
  }

  if (_auth === null) {
    // Capture the validated secret into a const so the databaseHooks closures
    // below can reference it without TypeScript requiring further narrowing.
    const secret: string = env.BETTER_AUTH_SECRET;

    _auth = betterAuth({
      database: drizzleAdapter(drizzle(env.DB), { provider: 'sqlite' }),
      baseURL: env.BETTER_AUTH_URL,
      secret,
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        minPasswordLength: 12,
        maxPasswordLength: 128,
        password: {
          hash: hashPassword,
          verify: ({ password, hash }: { password: string; hash: string }): Promise<boolean> =>
            verifyPassword(password, hash),
        },
      },
      session: {
        expiresIn: 2_592_000, // 30 days (60 * 60 * 24 * 30)
        updateAge: 86_400, // 1 day — refresh token when < 1 day remaining
      },
      advanced: {
        useSecureCookies: !env.BETTER_AUTH_URL.startsWith('http://localhost'),
        cookiePrefix: '__Host-',
        ipAddress: { ipAddressHeaders: ['CF-Connecting-IP'] },
      },
      rateLimit: {
        enabled: false, // KV-backed rate limiter handles this; built-in is in-memory only
      },
      databaseHooks: {
        session: {
          create: {
            /**
             * Hash the session token with HMAC-SHA256 before it is written to D1.
             * The cookie value is derived from the returned data, so the cookie and
             * the database row both hold the same digest.
             *
             * @param session - The session data being created, including the raw token.
             * @returns Updated session data with the HMAC-SHA256 hash of the token.
             */
            before: async (
              session: { token: string } & Record<string, unknown>
            ): Promise<{ data: { token: string } }> => ({
              data: { token: await hashToken(session.token, secret) },
            }),
          },
        },
        verification: {
          create: {
            /**
             * Hash the verification value with HMAC-SHA256 before it is written to D1.
             * Any feature that reads `verification.value` after a successful lookup will
             * receive the hash; future plugins that store sensitive tokens in this field
             * must account for this transform.
             *
             * @param verification - The verification data being created, including the raw value.
             * @returns Updated verification data with the HMAC-SHA256 hash of the value.
             */
            before: async (
              verification: { value: string } & Record<string, unknown>
            ): Promise<{ data: { value: string } }> => ({
              data: { value: await hashToken(verification.value, secret) },
            }),
          },
        },
      },
      // To add OAuth (e.g. Google sign-in), add a `socialProviders` block here
      // and expose GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET bindings in wrangler.toml
      // and env.ts. No structural changes to the auth layer are required (FR-010, SC-007):
      //
      //   socialProviders: {
      //     google: {
      //       clientId: env.GOOGLE_CLIENT_ID,
      //       clientSecret: env.GOOGLE_CLIENT_SECRET,
      //     },
      //   },
      //
      // better-auth v1.4.x automatically mounts GET /api/auth/callback/google
      // (and the corresponding redirect endpoint) once a provider is configured here.
    });
    _authEnvIdentity = { secret, db: env.DB };
  }

  return _auth;
}

/**
 * Clears the cached auth instance and its env identity snapshot.
 *
 * Call this in `afterEach` / `afterAll` test hooks to ensure test isolation.
 * In production Workers code, use `resetServiceFactory` which calls this
 * internally.
 */
export function resetAuth(): void {
  _auth = null;
  _authEnvIdentity = null;
}

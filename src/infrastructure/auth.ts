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
 * are written to D1, replacing plaintext token values with HMAC-SHA256 digests.
 * Each purpose uses a dedicated sub-key derived from `BETTER_AUTH_SECRET`:
 * `sessionSubKey = HMAC(secret, 'session-token-v1')` and
 * `verificationSubKey = HMAC(secret, 'verification-token-v1')`.
 *
 * This key-separation principle ensures that a digest stored under one purpose
 * cannot collide with a digest stored under another, even if an attacker knows
 * the master secret. It also limits the blast radius of a database exfiltration:
 * an attacker who obtains only the D1 dump cannot recover usable token strings.
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
import type { Auth, BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/d1';

import type { Logger } from '../domain/interfaces/Logger.js';
import { hashPassword, verifyPassword } from '../domain/services/passwordHasher';
import { isPlainHttpLocalhost } from '../shared/authCookieNames';
import type { Env } from '../shared/env';

import { account, session, user, verification } from './authSchema.js';
import { wrapD1ForDrizzle } from './d1DateProxy.js';
import { hashToken } from './tokenHasher';

/**
 * Callback port for workspace provisioning after user creation.
 *
 * Accepting this as a parameter decouples the infrastructure auth module
 * from the application-layer use case, keeping the dependency direction
 * clean (DI composition root → infrastructure, not infrastructure → application).
 *
 * @param userId - The newly created user's ID.
 */
export type OnUserCreated = (userId: string) => Promise<void>;

/**
 * Snapshot of the env bindings that were active when `_auth` was created.
 * Used to detect BETTER_AUTH_SECRET, BETTER_AUTH_URL, or DB rotation within
 * the same isolate lifetime (defensive guard; rotation normally forces a
 * Worker restart).
 */
interface AuthEnvIdentity {
  /** The BETTER_AUTH_SECRET value active when the singleton was created. */
  secret: string;
  /** The D1Database binding reference active when the singleton was created. */
  db: D1Database;
  /** The BETTER_AUTH_URL value active when the singleton was created. */
  url: string;
}

/** Module-level singleton, lives for the lifetime of the Workers isolate. */
let _auth: Auth<BetterAuthOptions> | null = null;

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
 * @param onUserCreated - Callback invoked after a new user is created (workspace provisioning).
 * @param logger - Logger port for structured logging.
 * @returns The configured better-auth instance.
 * @throws {Error} When `BETTER_AUTH_SECRET` is shorter than 32 characters.
 */
export function getAuth(
  env: Env,
  onUserCreated: OnUserCreated,
  logger: Logger
): Auth<BetterAuthOptions> {
  if (env.BETTER_AUTH_SECRET === undefined || env.BETTER_AUTH_SECRET.length < 32) {
    throw new Error('BETTER_AUTH_SECRET must be at least 32 characters');
  }

  // Invalidate the cached instance if BETTER_AUTH_SECRET, BETTER_AUTH_URL, or DB has been rotated.
  if (
    _auth !== null &&
    _authEnvIdentity !== null &&
    (env.BETTER_AUTH_SECRET !== _authEnvIdentity.secret ||
      env.DB !== _authEnvIdentity.db ||
      env.BETTER_AUTH_URL !== _authEnvIdentity.url)
  ) {
    _auth = null;
    _authEnvIdentity = null;
  }

  if (_auth === null) {
    // Capture the validated secret into a const so the databaseHooks closures
    // below can reference it without TypeScript requiring further narrowing.
    const secret: string = env.BETTER_AUTH_SECRET;

    _auth = betterAuth({
      database: drizzleAdapter(drizzle(wrapD1ForDrizzle(env.DB)), {
        provider: 'sqlite',
        schema: { account, session, user, verification },
      }),
      baseURL: env.BETTER_AUTH_URL,
      trustedOrigins: [new URL(env.BETTER_AUTH_URL).origin],
      secret,
      emailAndPassword: {
        enabled: true,
        // FR-013: users MUST be able to sign in immediately after registration —
        // email verification is intentionally disabled in this iteration.
        //
        // Accepted risk: an attacker could register with a victim's email address before
        // the legitimate owner does (account squatting). The practical impact is limited
        // because registration responses are identical for email_taken and success
        // (FR-007 anti-enumeration), so the attacker gains no confirmation the email was
        // taken. The victim can contact support to reclaim the address.
        //
        // When email delivery infrastructure (Resend or similar) is available, set this
        // to true and wire an emailVerification.sendVerificationEmail handler to
        // eliminate this risk entirely.
        requireEmailVerification: false,
        minPasswordLength: 12,
        maxPasswordLength: 128,
        // eslint-disable-next-line @typescript-eslint/require-await
        sendResetPassword: async ({ url: _url }, _request): Promise<void> => {
          // Email delivery infrastructure is not yet available. Log a redacted
          // confirmation so operators know a reset was triggered without exposing
          // the token. Replace this with a real email sender (e.g. Resend) when available.
          logger.info('[PasswordReset] Reset email triggered for token: [REDACTED]');
        },
        password: {
          hash: hashPassword,
          // Wrapper required: better-auth passes { password, hash } as a single object, but
          // verifyPassword takes positional args (password, stored). Cannot pass verifyPassword
          // directly.
          verify: ({ password, hash }: { password: string; hash: string }): Promise<boolean> =>
            verifyPassword(password, hash),
        },
      },
      session: {
        expiresIn: 2_592_000, // 30 days (60 * 60 * 24 * 30)
        updateAge: 86_400, // 1 day — refresh token when < 1 day remaining
      },
      advanced: {
        // better-auth prepends SECURE_COOKIE_PREFIX ("__Secure-") when useSecureCookies is
        // true, which would produce "__Secure-__Host-better-auth.session_token" — not a valid
        // __Host- cookie. We suppress this by setting useSecureCookies: false and instead
        // enforce the Secure attribute via defaultCookieAttributes below.
        useSecureCookies: false,
        // The __Host- cookie prefix requires Secure:true by spec (RFC 6265bis). Browsers that
        // strictly enforce this invariant silently drop __Host-* cookies when Secure is false,
        // causing silent auth failures in local dev. On localhost we drop the __Host- prefix
        // entirely so Secure can be false without violating the invariant.
        //
        // Production: "__Host-better-auth.session_token" — enforces Secure + Path=/ + no Domain.
        // Localhost:  "better-auth.session_token" — no special prefix; Secure=false is valid.
        cookiePrefix: isPlainHttpLocalhost(env.BETTER_AUTH_URL)
          ? 'better-auth'
          : '__Host-better-auth',
        defaultCookieAttributes: {
          secure: !isPlainHttpLocalhost(env.BETTER_AUTH_URL),
        },
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
             * Uses the dedicated 'session-token-v1' sub-key derived from the master
             * secret for key separation. The cookie value is derived from the returned
             * data, so the cookie and the database row both hold the same digest.
             *
             * @param session - The session data being created, including the raw token.
             * @returns Updated session data with the HMAC-SHA256 hash of the token.
             */
            before: async (
              session: { token: string } & Record<string, unknown>
            ): Promise<{ data: { token: string } }> => ({
              data: { token: await hashToken(session.token, secret, 'session-token-v1') },
            }),
          },
        },
        verification: {
          create: {
            /**
             * Hash the verification value with HMAC-SHA256 before it is written to D1.
             * Uses the dedicated 'verification-token-v1' sub-key derived from the master
             * secret for key separation.
             *
             * Password-reset verifications are excluded: better-auth stores the user ID
             * in `value` and reads it back by identifier lookup. Hashing the user ID
             * would cause `resetPassword` to receive a hash instead of a valid user ID,
             * breaking the password update. The token itself is stored in the `identifier`
             * field (not `value`), so skipping the hash does not expose it.
             *
             * @param verification - The verification data being created, including the raw value.
             * @returns Updated verification data, with the value hashed for non-password-reset verifications.
             */
            before: async (
              verification: { value: string; identifier?: string } & Record<string, unknown>
            ): Promise<{ data: { value: string } }> => {
              const identifier =
                typeof verification.identifier === 'string' ? verification.identifier : '';
              if (identifier.startsWith('reset-password:')) {
                return { data: { value: verification.value } };
              }
              return {
                data: {
                  value: await hashToken(verification.value, secret, 'verification-token-v1'),
                },
              };
            },
          },
        },
        user: {
          create: {
            /**
             * Provision a workspace for the newly registered user.
             *
             * Fires after the user row is committed to D1. Errors are caught and
             * logged rather than rethrown — better-auth has already committed the
             * user row, so propagating would surface a provisioning failure as a
             * sign-up error after the user was actually created.
             *
             * If provisioning fails, the user will receive a 503 from the
             * `requireWorkspace` middleware on first login. Manual recovery:
             * invoke the provisioning use case with the user's ID.
             *
             * @param user - The newly created user record from better-auth.
             */
            after: async (user: { id: string } & Record<string, unknown>): Promise<void> => {
              try {
                await onUserCreated(user.id);
              } catch (err: unknown) {
                console.error('[WorkspaceProvisioner] Failed to provision workspace', {
                  userId: user.id,
                  error: err instanceof Error ? err.message : String(err),
                });
              }
            },
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
    }) as unknown as Auth<BetterAuthOptions>;
    _authEnvIdentity = { secret, db: env.DB, url: env.BETTER_AUTH_URL };
  }

  // _auth is guaranteed non-null here: the block above always assigns it when _auth === null.
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

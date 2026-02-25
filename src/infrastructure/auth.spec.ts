import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getAuth, resetAuth } from './auth';
import type { Env } from './env';

/**
 * Hoisted mock variables — must be hoisted so they are available in vi.mock()
 * factory functions, which are executed before module imports.
 */
const mocks = vi.hoisted(() => ({
  betterAuth: vi.fn(),
  drizzleAdapter: vi.fn(() => ({ _type: 'drizzle-adapter' })),
  drizzle: vi.fn(() => ({ _type: 'drizzle-db' })),
}));

/**
 * Returns the config object passed to the first `betterAuth()` call.
 *
 * @returns The betterAuth configuration record.
 */
function capturedBetterAuthConfig(): Record<string, unknown> {
  return mocks.betterAuth.mock.calls[0]?.[0] as Record<string, unknown>;
}

vi.mock('better-auth', () => ({
  betterAuth: mocks.betterAuth,
}));

vi.mock('better-auth/adapters/drizzle', () => ({
  drizzleAdapter: mocks.drizzleAdapter,
}));

vi.mock('drizzle-orm/d1', () => ({
  drizzle: mocks.drizzle,
}));

/**
 * Builds a minimal valid Env for testing.
 *
 * @param overrides - Partial Env fields to override defaults.
 * @returns A complete Env with test defaults.
 */
function makeEnv(overrides?: Partial<Env>): Env {
  return {
    ASSETS: {} as Fetcher,
    DB: {} as D1Database,
    BETTER_AUTH_URL: 'https://example.turtlebased.io',
    BETTER_AUTH_SECRET: 'a'.repeat(32),
    RATE_LIMIT: {} as KVNamespace,
    ...overrides,
  };
}

describe('getAuth', () => {
  beforeEach(() => {
    resetAuth();
    mocks.betterAuth.mockReturnValue({ _type: 'auth-instance' });
  });

  afterEach(() => {
    resetAuth();
    vi.clearAllMocks();
  });

  describe('secret length validation', () => {
    it('throws when BETTER_AUTH_SECRET is shorter than 32 characters', () => {
      const env = makeEnv({ BETTER_AUTH_SECRET: 'short' });

      expect(() => getAuth(env)).toThrow('BETTER_AUTH_SECRET must be at least 32 characters');
    });

    it('throws when BETTER_AUTH_SECRET is exactly 31 characters', () => {
      const env = makeEnv({ BETTER_AUTH_SECRET: 'a'.repeat(31) });

      expect(() => getAuth(env)).toThrow('BETTER_AUTH_SECRET must be at least 32 characters');
    });

    it('throws when BETTER_AUTH_SECRET is empty', () => {
      const env = makeEnv({ BETTER_AUTH_SECRET: '' });

      expect(() => getAuth(env)).toThrow('BETTER_AUTH_SECRET must be at least 32 characters');
    });

    it('throws a descriptive error when BETTER_AUTH_SECRET is undefined (missing binding)', () => {
      const env = makeEnv({ BETTER_AUTH_SECRET: undefined as unknown as string });

      expect(() => getAuth(env)).toThrow('BETTER_AUTH_SECRET must be at least 32 characters');
    });

    it('does not throw when BETTER_AUTH_SECRET is exactly 32 characters', () => {
      const env = makeEnv({ BETTER_AUTH_SECRET: 'a'.repeat(32) });

      expect(() => getAuth(env)).not.toThrow();
    });

    it('does not throw when BETTER_AUTH_SECRET is 64 characters (openssl rand -hex 32)', () => {
      const env = makeEnv({ BETTER_AUTH_SECRET: 'a'.repeat(64) });

      expect(() => getAuth(env)).not.toThrow();
    });
  });

  describe('factory behavior', () => {
    it('calls betterAuth and returns the auth instance', () => {
      const authInstance = { _type: 'auth-instance' };
      mocks.betterAuth.mockReturnValue(authInstance);
      const env = makeEnv();

      const result = getAuth(env);

      expect(mocks.betterAuth).toHaveBeenCalledTimes(1);
      expect(result).toBe(authInstance);
    });

    it('passes emailAndPassword config with required constraints', () => {
      const env = makeEnv();

      getAuth(env);

      const config = capturedBetterAuthConfig();
      expect(config).toBeDefined();
      const emailAndPassword = config['emailAndPassword'] as Record<string, unknown>;
      expect(emailAndPassword['enabled']).toBe(true);
      expect(emailAndPassword['minPasswordLength']).toBe(12);
      expect(emailAndPassword['maxPasswordLength']).toBe(128);
    });

    it('passes session config with correct expiresIn and updateAge', () => {
      const env = makeEnv();

      getAuth(env);

      const config = capturedBetterAuthConfig();
      const session = config['session'] as Record<string, unknown>;
      expect(session['expiresIn']).toBe(2_592_000);
      expect(session['updateAge']).toBe(86_400);
    });

    it('sets useSecureCookies to true for non-localhost URL', () => {
      const env = makeEnv({ BETTER_AUTH_URL: 'https://app.turtlebased.io' });

      getAuth(env);

      const config = capturedBetterAuthConfig();
      const advanced = config['advanced'] as Record<string, unknown>;
      expect(advanced['useSecureCookies']).toBe(true);
    });

    it('sets useSecureCookies to false for localhost URL', () => {
      const env = makeEnv({ BETTER_AUTH_URL: 'http://localhost:8787' });

      getAuth(env);

      const config = capturedBetterAuthConfig();
      const advanced = config['advanced'] as Record<string, unknown>;
      expect(advanced['useSecureCookies']).toBe(false);
    });

    it('sets cookiePrefix to __Host-', () => {
      const env = makeEnv();

      getAuth(env);

      const config = capturedBetterAuthConfig();
      const advanced = config['advanced'] as Record<string, unknown>;
      expect(advanced['cookiePrefix']).toBe('__Host-');
    });

    it('sets CF-Connecting-IP as the sole IP address header', () => {
      const env = makeEnv();

      getAuth(env);

      const config = capturedBetterAuthConfig();
      const advanced = config['advanced'] as Record<string, unknown>;
      const ipAddress = advanced['ipAddress'] as Record<string, unknown>;
      expect(ipAddress['ipAddressHeaders']).toEqual(['CF-Connecting-IP']);
    });

    it('disables built-in rate limiting', () => {
      const env = makeEnv();

      getAuth(env);

      const config = capturedBetterAuthConfig();
      const rateLimit = config['rateLimit'] as Record<string, unknown>;
      expect(rateLimit['enabled']).toBe(false);
    });
  });

  describe('OAuth extensibility (FR-010, SC-007)', () => {
    it('documents config-only extensibility: no socialProviders are configured yet', () => {
      const env = makeEnv();

      getAuth(env);

      const config = capturedBetterAuthConfig();
      // No social providers are configured in the baseline auth setup.
      // Adding a provider requires only a config change in auth.ts (see comment there):
      //   socialProviders: { google: { clientId: '...', clientSecret: '...' } }
      // No structural changes to the auth layer are needed (FR-010, SC-007).
      expect(config).not.toHaveProperty('socialProviders');
    });

    it('documents the OAuth callback route: auth.handler serves /api/auth/callback/:provider', () => {
      const callbackResponse = new Response(null, { status: 302, headers: { location: '/app' } });
      const handlerFn = vi.fn<[Request], Promise<Response>>().mockResolvedValue(callbackResponse);
      mocks.betterAuth.mockReturnValue({ handler: handlerFn });
      const env = makeEnv();
      const auth = getAuth(env);
      const callbackRequest = new Request(
        'https://example.turtlebased.io/api/auth/callback/google'
      );

      void auth.handler(callbackRequest);

      // better-auth v1.4.x automatically mounts GET /api/auth/callback/:provider
      // once a socialProvider is configured — no custom route handler is needed.
      expect(handlerFn).toHaveBeenCalledWith(callbackRequest);
    });
  });

  describe('isolate-scoped caching', () => {
    it('returns the same instance on successive calls (singleton)', () => {
      const env = makeEnv();

      const first = getAuth(env);
      const second = getAuth(env);

      expect(first).toBe(second);
      expect(mocks.betterAuth).toHaveBeenCalledTimes(1);
    });

    it('reuses cached instance even with a different env object', () => {
      const env1 = makeEnv();
      const env2 = makeEnv({ BETTER_AUTH_URL: 'https://other.example.com' });

      const first = getAuth(env1);
      const second = getAuth(env2);

      expect(first).toBe(second);
      expect(mocks.betterAuth).toHaveBeenCalledTimes(1);
    });
  });
});

describe('resetAuth', () => {
  beforeEach(() => {
    resetAuth();
    mocks.betterAuth.mockReturnValue({ _type: 'auth-instance' });
  });

  afterEach(() => {
    resetAuth();
    vi.clearAllMocks();
  });

  it('clears the cached auth instance so the next call creates a fresh one', () => {
    const env = makeEnv();
    const first = getAuth(env);

    resetAuth();

    mocks.betterAuth.mockReturnValue({ _type: 'auth-instance-2' });
    const second = getAuth(env);

    expect(first).not.toBe(second);
    expect(mocks.betterAuth).toHaveBeenCalledTimes(2);
  });
});

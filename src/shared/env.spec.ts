import type { Env } from './env';

/**
 * Type-level tests for the Env interface.
 *
 * These assertions are checked by TypeScript's compiler (tsc --noEmit).
 * The runtime tests confirm that the spec file is importable and the
 * type assertions are syntactically valid.
 */
describe('Env', () => {
  it('has ASSETS binding of type Fetcher', () => {
    type EnvHasAssets = Env extends { ASSETS: Fetcher } ? true : false;
    const check: EnvHasAssets = true;
    expect(check).toBe(true);
  });

  it('has DB binding of type D1Database', () => {
    type EnvHasDb = Env extends { DB: D1Database } ? true : false;
    const check: EnvHasDb = true;
    expect(check).toBe(true);
  });

  it('has BETTER_AUTH_URL binding of type string', () => {
    type EnvHasBetterAuthUrl = Env extends { BETTER_AUTH_URL: string } ? true : false;
    const check: EnvHasBetterAuthUrl = true;
    expect(check).toBe(true);
  });

  it('has BETTER_AUTH_SECRET binding of type string', () => {
    type EnvHasBetterAuthSecret = Env extends { BETTER_AUTH_SECRET: string } ? true : false;
    const check: EnvHasBetterAuthSecret = true;
    expect(check).toBe(true);
  });

  it('has RATE_LIMIT binding of type DurableObjectNamespace', () => {
    type EnvHasRateLimit = Env extends { RATE_LIMIT: DurableObjectNamespace } ? true : false;
    const check: EnvHasRateLimit = true;
    expect(check).toBe(true);
  });
});

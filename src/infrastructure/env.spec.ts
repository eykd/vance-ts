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
    type _Check = Env extends { ASSETS: Fetcher } ? true : false;
    const _check: _Check = true;
    expect(_check).toBe(true);
  });

  it('has DB binding of type D1Database', () => {
    type _Check = Env extends { DB: D1Database } ? true : false;
    const _check: _Check = true;
    expect(_check).toBe(true);
  });

  it('has BETTER_AUTH_URL binding of type string', () => {
    type _Check = Env extends { BETTER_AUTH_URL: string } ? true : false;
    const _check: _Check = true;
    expect(_check).toBe(true);
  });

  it('has BETTER_AUTH_SECRET binding of type string', () => {
    type _Check = Env extends { BETTER_AUTH_SECRET: string } ? true : false;
    const _check: _Check = true;
    expect(_check).toBe(true);
  });

  it('has RATE_LIMIT binding of type KVNamespace', () => {
    type _Check = Env extends { RATE_LIMIT: KVNamespace } ? true : false;
    const _check: _Check = true;
    expect(_check).toBe(true);
  });
});

import { validateRedirectTo } from './redirectValidator';

describe('validateRedirectTo', () => {
  it('returns / for null input', () => {
    expect(validateRedirectTo(null)).toBe('/');
  });

  it('returns / for empty string', () => {
    expect(validateRedirectTo('')).toBe('/');
  });

  it('accepts a simple valid relative path', () => {
    expect(validateRedirectTo('/dashboard')).toBe('/dashboard');
  });

  it('accepts a path with query string', () => {
    expect(validateRedirectTo('/dashboard?tab=overview')).toBe('/dashboard?tab=overview');
  });

  it('returns / for a // prefix (open redirect)', () => {
    expect(validateRedirectTo('//evil.com')).toBe('/');
  });

  it('returns / for a /api/ prefix', () => {
    expect(validateRedirectTo('/api/users')).toBe('/');
  });

  it('returns / for a /auth/ prefix', () => {
    expect(validateRedirectTo('/auth/sign-in')).toBe('/');
  });

  it('returns / for an absolute URL with a protocol', () => {
    expect(validateRedirectTo('https://evil.com')).toBe('/');
  });

  it('canonicalises a non-leading-slash input to a relative path on the same origin', () => {
    // new URL('evil.com/path', 'http://localhost') resolves to /evil.com/path — same origin, safe
    expect(validateRedirectTo('evil.com/path')).toBe('/evil.com/path');
  });

  it('decodes URL-encoded bypass: %2F%2Fevil.com becomes //evil.com → rejected', () => {
    expect(validateRedirectTo('%2F%2Fevil.com')).toBe('/');
  });

  it('decodes URL-encoded bypass: %2Fapi%2Fusers becomes /api/users → rejected', () => {
    expect(validateRedirectTo('%2Fapi%2Fusers')).toBe('/');
  });

  it('decodes URL-encoded bypass: %2Fauth%2Fsign-in becomes /auth/sign-in → rejected', () => {
    expect(validateRedirectTo('%2Fauth%2Fsign-in')).toBe('/');
  });

  it('accepts a URL-encoded valid path', () => {
    expect(validateRedirectTo('%2Fdashboard')).toBe('/dashboard');
  });

  it('canonicalises by using only pathname and search (strips fragment)', () => {
    expect(validateRedirectTo('/dashboard#secret')).toBe('/dashboard');
  });

  it('canonicalises a path with both search and fragment', () => {
    expect(validateRedirectTo('/page?q=1#frag')).toBe('/page?q=1');
  });

  it('returns / for a malformed URL that cannot be decoded', () => {
    expect(validateRedirectTo('%')).toBe('/');
  });

  it('returns / for /api/ with exact prefix match', () => {
    expect(validateRedirectTo('/api/')).toBe('/');
  });

  it('returns / for /auth/ with exact prefix match', () => {
    expect(validateRedirectTo('/auth/')).toBe('/');
  });

  it('accepts a path that contains "api" but does not start with /api/', () => {
    expect(validateRedirectTo('/my-api-page')).toBe('/my-api-page');
  });

  it('accepts a path that contains "auth" but does not start with /auth/', () => {
    expect(validateRedirectTo('/my-auth-page')).toBe('/my-auth-page');
  });
});

import { validateRedirectTo } from './redirectValidator';

describe('validateRedirectTo', () => {
  describe('null and empty inputs', () => {
    it('returns / for null input', () => {
      expect(validateRedirectTo(null)).toBe('/');
    });

    it('returns / for empty string', () => {
      expect(validateRedirectTo('')).toBe('/');
    });
  });

  describe('allowlisted paths — accepted', () => {
    it('accepts the root path /', () => {
      expect(validateRedirectTo('/')).toBe('/');
    });

    it('accepts /app/ paths', () => {
      expect(validateRedirectTo('/app/dashboard')).toBe('/app/dashboard');
    });

    it('accepts /app/ paths with query string', () => {
      expect(validateRedirectTo('/app/dashboard?tab=overview')).toBe('/app/dashboard?tab=overview');
    });

    it('accepts /app without trailing slash', () => {
      expect(validateRedirectTo('/app')).toBe('/app');
    });

    it('accepts /posts/ paths', () => {
      expect(validateRedirectTo('/posts/sample-post')).toBe('/posts/sample-post');
    });

    it('accepts /posts/ paths with query string', () => {
      expect(validateRedirectTo('/posts/sample-post?q=1')).toBe('/posts/sample-post?q=1');
    });

    it('accepts /posts without trailing slash', () => {
      expect(validateRedirectTo('/posts')).toBe('/posts');
    });

    it('should accept /dashboard/ as a valid redirect destination', () => {
      expect(validateRedirectTo('/dashboard/')).toBe('/dashboard/');
    });

    it('accepts a URL-encoded allowlisted path: %2Fapp%2Fdashboard → /app/dashboard', () => {
      expect(validateRedirectTo('%2Fapp%2Fdashboard')).toBe('/app/dashboard');
    });

    it('strips fragment from allowlisted /app/ path', () => {
      expect(validateRedirectTo('/app/dashboard#section')).toBe('/app/dashboard');
    });

    it('strips fragment and preserves query string for allowlisted /posts/ path', () => {
      expect(validateRedirectTo('/posts/post?q=1#frag')).toBe('/posts/post?q=1');
    });
  });

  describe('paths not on allowlist — rejected with default /', () => {
    it('returns / for an arbitrary path not on the allowlist (/settings)', () => {
      expect(validateRedirectTo('/settings')).toBe('/');
    });

    it('returns / for /api/ paths (not on allowlist)', () => {
      expect(validateRedirectTo('/api/users')).toBe('/');
    });

    it('returns / for /auth/ paths (not on allowlist)', () => {
      expect(validateRedirectTo('/auth/sign-in')).toBe('/');
    });

    it('returns / for /api/ exact prefix', () => {
      expect(validateRedirectTo('/api/')).toBe('/');
    });

    it('returns / for /auth/ exact prefix', () => {
      expect(validateRedirectTo('/auth/')).toBe('/');
    });

    it('returns / for a path whose first segment is not on the allowlist (/about)', () => {
      expect(validateRedirectTo('/about')).toBe('/');
    });

    it('decodes and rejects %2Fapi%2Fusers (→ /api/users) as not on allowlist', () => {
      expect(validateRedirectTo('%2Fapi%2Fusers')).toBe('/');
    });

    it('decodes and rejects %2Fauth%2Fsign-in (→ /auth/sign-in) as not on allowlist', () => {
      expect(validateRedirectTo('%2Fauth%2Fsign-in')).toBe('/');
    });
  });

  describe('cross-origin URLs — rejected by origin check', () => {
    it('returns / for a // prefix (protocol-relative URL resolves to cross-origin)', () => {
      expect(validateRedirectTo('//evil.com')).toBe('/');
    });

    it('returns / for an absolute URL with a protocol', () => {
      expect(validateRedirectTo('https://evil.com')).toBe('/');
    });

    it('returns / for URL-encoded //: %2F%2Fevil.com → //evil.com → cross-origin rejected', () => {
      expect(validateRedirectTo('%2F%2Fevil.com')).toBe('/');
    });
  });

  describe('non-leading-slash inputs — resolved same-origin but not on allowlist', () => {
    it('returns / for a hostname-like input: evil.com/path → resolves to /evil.com/path → not on allowlist', () => {
      expect(validateRedirectTo('evil.com/path')).toBe('/');
    });
  });

  describe('malformed inputs', () => {
    it('returns / for a malformed percent-encoded string that cannot be decoded', () => {
      expect(validateRedirectTo('%')).toBe('/');
    });
  });
});

import { validateRedirectUrl } from './validateRedirectUrl';

describe('validateRedirectUrl', () => {
  it('returns "/" when url is undefined', () => {
    expect(validateRedirectUrl(undefined)).toBe('/');
  });

  it('returns "/" when url is empty string', () => {
    expect(validateRedirectUrl('')).toBe('/');
  });

  it('returns the url when it is a valid relative path', () => {
    expect(validateRedirectUrl('/dashboard')).toBe('/dashboard');
  });

  it('returns the url when it is a valid relative path with query params', () => {
    expect(validateRedirectUrl('/dashboard?tab=overview')).toBe('/dashboard?tab=overview');
  });

  it('returns the url when it is a valid relative path with hash', () => {
    expect(validateRedirectUrl('/settings#profile')).toBe('/settings#profile');
  });

  it('returns null when url does not start with "/"', () => {
    expect(validateRedirectUrl('dashboard')).toBeNull();
  });

  it('returns null when url starts with "//"', () => {
    expect(validateRedirectUrl('//evil.com/phishing')).toBeNull();
  });

  it('returns null when url contains "://"', () => {
    expect(validateRedirectUrl('/redirect?url=https://evil.com')).toBeNull();
  });

  it('returns null when url contains backslash', () => {
    expect(validateRedirectUrl('/path\\evil.com')).toBeNull();
  });

  it('returns null for absolute URL starting with http://', () => {
    expect(validateRedirectUrl('http://evil.com')).toBeNull();
  });

  it('returns null for absolute URL starting with https://', () => {
    expect(validateRedirectUrl('https://evil.com')).toBeNull();
  });

  describe('URL-encoded bypass prevention', () => {
    it('returns null when encoded as protocol-relative URL (//)', () => {
      expect(validateRedirectUrl('/%2Fevil.com')).toBeNull();
    });

    it('returns null when encoded with backslash', () => {
      expect(validateRedirectUrl('/%5Cevil.com')).toBeNull();
    });

    it('returns null when encoded with :// scheme', () => {
      expect(validateRedirectUrl('/redirect%3A%2F%2Fevil.com')).toBeNull();
    });

    it('returns null for malformed percent-encoding', () => {
      expect(validateRedirectUrl('/%ZZbadencoding')).toBeNull();
    });

    it('allows valid paths that contain safe percent-encoded characters', () => {
      expect(validateRedirectUrl('/path%20with%20spaces')).toBe('/path with spaces');
    });
  });
});

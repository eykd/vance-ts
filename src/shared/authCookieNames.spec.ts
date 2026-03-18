import {
  getAuthIndicatorCookieName,
  getCsrfCookieName,
  getSessionCookieName,
  isPlainHttpLocalhost,
} from './authCookieNames';

describe('isPlainHttpLocalhost', () => {
  it('returns true for http://localhost', () => {
    expect(isPlainHttpLocalhost('http://localhost')).toBe(true);
  });

  it('returns true for http://localhost with port', () => {
    expect(isPlainHttpLocalhost('http://localhost:8787')).toBe(true);
  });

  it('returns true for http://127.0.0.1', () => {
    expect(isPlainHttpLocalhost('http://127.0.0.1')).toBe(true);
  });

  it('returns true for http://127.0.0.1 with port', () => {
    expect(isPlainHttpLocalhost('http://127.0.0.1:8787')).toBe(true);
  });

  it('returns false for https://localhost', () => {
    expect(isPlainHttpLocalhost('https://localhost:8787')).toBe(false);
  });

  it('returns false for https production URLs', () => {
    expect(isPlainHttpLocalhost('https://example.com')).toBe(false);
  });
});

describe('getSessionCookieName', () => {
  it('returns __Host-better-auth.session_token for HTTPS production URLs', () => {
    expect(getSessionCookieName('https://example.com')).toBe('__Host-better-auth.session_token');
  });

  it('returns better-auth.session_token for http://localhost URLs', () => {
    expect(getSessionCookieName('http://localhost:8787')).toBe('better-auth.session_token');
  });

  it('returns better-auth.session_token for http://localhost without port', () => {
    expect(getSessionCookieName('http://localhost')).toBe('better-auth.session_token');
  });

  it('returns better-auth.session_token for http://127.0.0.1 URLs', () => {
    expect(getSessionCookieName('http://127.0.0.1:8787')).toBe('better-auth.session_token');
  });

  it('returns __Host-better-auth.session_token for https://localhost URLs', () => {
    expect(getSessionCookieName('https://localhost:8787')).toBe('__Host-better-auth.session_token');
  });
});

describe('getCsrfCookieName', () => {
  it('returns __Host-csrf for HTTPS production URLs', () => {
    expect(getCsrfCookieName('https://example.com')).toBe('__Host-csrf');
  });

  it('returns csrf for http://localhost URLs', () => {
    expect(getCsrfCookieName('http://localhost:8787')).toBe('csrf');
  });

  it('returns csrf for http://localhost without port', () => {
    expect(getCsrfCookieName('http://localhost')).toBe('csrf');
  });

  it('returns csrf for http://127.0.0.1 URLs', () => {
    expect(getCsrfCookieName('http://127.0.0.1:8787')).toBe('csrf');
  });

  it('returns __Host-csrf for https://localhost URLs', () => {
    expect(getCsrfCookieName('https://localhost:8787')).toBe('__Host-csrf');
  });
});

describe('getAuthIndicatorCookieName', () => {
  it('returns __Host-auth_status for HTTPS production URLs', () => {
    expect(getAuthIndicatorCookieName('https://example.com')).toBe('__Host-auth_status');
  });

  it('returns auth_status for http://localhost URLs', () => {
    expect(getAuthIndicatorCookieName('http://localhost:8787')).toBe('auth_status');
  });

  it('returns auth_status for http://localhost without port', () => {
    expect(getAuthIndicatorCookieName('http://localhost')).toBe('auth_status');
  });

  it('returns auth_status for http://127.0.0.1 URLs', () => {
    expect(getAuthIndicatorCookieName('http://127.0.0.1:8787')).toBe('auth_status');
  });

  it('returns __Host-auth_status for https://localhost URLs', () => {
    expect(getAuthIndicatorCookieName('https://localhost:8787')).toBe('__Host-auth_status');
  });
});

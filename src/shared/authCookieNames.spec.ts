import { getSessionCookieName } from './authCookieNames';

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

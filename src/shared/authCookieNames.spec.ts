import { SESSION_COOKIE_NAME } from './authCookieNames';

describe('SESSION_COOKIE_NAME', () => {
  it('equals the better-auth session cookie name with __Host- prefix', () => {
    expect(SESSION_COOKIE_NAME).toBe('__Host-better-auth.session_token');
  });
});

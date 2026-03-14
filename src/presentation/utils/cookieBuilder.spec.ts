import {
  buildAuthIndicatorCookie,
  buildCsrfCookie,
  buildSessionCookie,
  clearAuthIndicatorCookie,
  clearCsrfCookie,
  clearSessionCookie,
  deriveCsrfToken,
  extractCsrfTokenFromCookies,
  extractSessionToken,
  generateCsrfToken,
  hasSessionCookie,
} from './cookieBuilder';

describe('buildAuthIndicatorCookie', () => {
  it('sets cookie value to auth_status=1', () => {
    expect(buildAuthIndicatorCookie()).toMatch(/^auth_status=1;/);
  });

  it('includes Secure flag', () => {
    expect(buildAuthIndicatorCookie()).toContain('Secure');
  });

  it('includes SameSite=Lax', () => {
    expect(buildAuthIndicatorCookie()).toContain('SameSite=Lax');
  });

  it('includes Path=/', () => {
    expect(buildAuthIndicatorCookie()).toContain('Path=/');
  });

  it('includes Max-Age=2592000 (30 days, matching session cookie)', () => {
    expect(buildAuthIndicatorCookie()).toContain('Max-Age=2592000');
  });

  it('is NOT HttpOnly so client-side JS can read it', () => {
    expect(buildAuthIndicatorCookie()).not.toContain('HttpOnly');
  });
});

describe('clearAuthIndicatorCookie', () => {
  it('sets auth_status to empty with Max-Age=0', () => {
    const value = clearAuthIndicatorCookie();
    expect(value).toContain('auth_status=');
    expect(value).toContain('Max-Age=0');
  });

  it('includes Secure flag', () => {
    expect(clearAuthIndicatorCookie()).toContain('Secure');
  });

  it('includes SameSite=Lax', () => {
    expect(clearAuthIndicatorCookie()).toContain('SameSite=Lax');
  });

  it('includes Path=/', () => {
    expect(clearAuthIndicatorCookie()).toContain('Path=/');
  });

  it('is NOT HttpOnly so attributes match the build cookie', () => {
    expect(clearAuthIndicatorCookie()).not.toContain('HttpOnly');
  });
});

describe('generateCsrfToken', () => {
  it('returns a 64-character hex string', () => {
    const token = generateCsrfToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it('returns different values on subsequent calls', () => {
    const a = generateCsrfToken();
    const b = generateCsrfToken();
    expect(a).not.toBe(b);
  });
});

describe('deriveCsrfToken', () => {
  it('returns a 64-character hex string', async () => {
    const token = await deriveCsrfToken('csrf:v1:session-token', 'secret');
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it('returns the same value for the same inputs', async () => {
    const a = await deriveCsrfToken('csrf:v1:test', 'my-secret');
    const b = await deriveCsrfToken('csrf:v1:test', 'my-secret');
    expect(a).toBe(b);
  });

  it('returns different values for different messages', async () => {
    const a = await deriveCsrfToken('csrf:v1:token-a', 'secret');
    const b = await deriveCsrfToken('csrf:v1:token-b', 'secret');
    expect(a).not.toBe(b);
  });

  it('returns different values for different secrets', async () => {
    const a = await deriveCsrfToken('csrf:v1:token', 'secret-a');
    const b = await deriveCsrfToken('csrf:v1:token', 'secret-b');
    expect(a).not.toBe(b);
  });
});

describe('buildCsrfCookie', () => {
  it('returns a Set-Cookie header value with the token', () => {
    const value = buildCsrfCookie('abc123');
    expect(value).toContain('__Host-csrf=abc123');
  });

  it('includes HttpOnly flag', () => {
    expect(buildCsrfCookie('token')).toContain('HttpOnly');
  });

  it('includes Secure flag', () => {
    expect(buildCsrfCookie('token')).toContain('Secure');
  });

  it('includes SameSite=Strict', () => {
    expect(buildCsrfCookie('token')).toContain('SameSite=Strict');
  });

  it('includes Path=/ so the cookie is sent from all application routes', () => {
    expect(buildCsrfCookie('token')).toContain('Path=/');
  });

  it('does not restrict cookie to /auth path (must be available on /app/* routes)', () => {
    expect(buildCsrfCookie('token')).not.toContain('Path=/auth');
  });

  it('includes Max-Age=3600', () => {
    expect(buildCsrfCookie('token')).toContain('Max-Age=3600');
  });
});

describe('clearCsrfCookie', () => {
  it('returns a Set-Cookie header value that clears the cookie', () => {
    const value = clearCsrfCookie();
    expect(value).toContain('__Host-csrf=');
    expect(value).toContain('Max-Age=0');
  });

  it('includes HttpOnly flag', () => {
    expect(clearCsrfCookie()).toContain('HttpOnly');
  });

  it('includes Secure flag', () => {
    expect(clearCsrfCookie()).toContain('Secure');
  });

  it('includes SameSite=Strict', () => {
    expect(clearCsrfCookie()).toContain('SameSite=Strict');
  });

  it('includes Path=/ so the cookie is sent from all application routes', () => {
    expect(clearCsrfCookie()).toContain('Path=/');
  });

  it('does not restrict cookie to /auth path (must be clearable from /app/* routes)', () => {
    expect(clearCsrfCookie()).not.toContain('Path=/auth');
  });
});

describe('clearSessionCookie', () => {
  it('returns a Set-Cookie header value that clears the session cookie', () => {
    const value = clearSessionCookie();
    expect(value).toContain('__Host-better-auth.session_token=');
    expect(value).toContain('Max-Age=0');
  });

  it('includes HttpOnly flag', () => {
    expect(clearSessionCookie()).toContain('HttpOnly');
  });

  it('includes Secure flag', () => {
    expect(clearSessionCookie()).toContain('Secure');
  });

  it('includes SameSite=Lax', () => {
    expect(clearSessionCookie()).toContain('SameSite=Lax');
  });

  it('includes Path=/', () => {
    expect(clearSessionCookie()).toContain('Path=/');
  });
});

describe('hasSessionCookie', () => {
  it('returns false when cookieHeader is null', () => {
    expect(hasSessionCookie(null)).toBe(false);
  });

  it('returns false when cookieHeader is empty string', () => {
    expect(hasSessionCookie('')).toBe(false);
  });

  it('returns false when session cookie is absent from the header', () => {
    expect(hasSessionCookie('other=value; __Host-csrf=token')).toBe(false);
  });

  it('returns true when session cookie is present in the header', () => {
    expect(hasSessionCookie('__Host-better-auth.session_token=abc123')).toBe(true);
  });

  it('returns true when session cookie is present alongside other cookies', () => {
    expect(
      hasSessionCookie('other=value; __Host-better-auth.session_token=abc123; more=stuff')
    ).toBe(true);
  });
});

describe('extractCsrfTokenFromCookies', () => {
  it('extracts the __Host-csrf token from a cookie header', () => {
    const header = '__Host-csrf=mytoken123; other=value';
    expect(extractCsrfTokenFromCookies(header)).toBe('mytoken123');
  });

  it('returns null when the cookie header is null', () => {
    expect(extractCsrfTokenFromCookies(null)).toBeNull();
  });

  it('returns null when the __Host-csrf cookie is absent', () => {
    expect(extractCsrfTokenFromCookies('session=abc; other=xyz')).toBeNull();
  });

  it('handles a cookie header with only the CSRF cookie', () => {
    expect(extractCsrfTokenFromCookies('__Host-csrf=onlyone')).toBe('onlyone');
  });

  it('handles the CSRF cookie at the end of a multi-cookie header', () => {
    const header = 'session=abc; __Host-csrf=endtoken';
    expect(extractCsrfTokenFromCookies(header)).toBe('endtoken');
  });

  it('returns null for empty cookie header', () => {
    expect(extractCsrfTokenFromCookies('')).toBeNull();
  });
});

describe('buildSessionCookie', () => {
  it('returns a Set-Cookie header value with the token', () => {
    expect(buildSessionCookie('abc123')).toContain('__Host-better-auth.session_token=abc123');
  });

  it('includes HttpOnly flag', () => {
    expect(buildSessionCookie('tok')).toContain('HttpOnly');
  });

  it('includes Secure flag', () => {
    expect(buildSessionCookie('tok')).toContain('Secure');
  });

  it('includes SameSite=Lax', () => {
    expect(buildSessionCookie('tok')).toContain('SameSite=Lax');
  });

  it('includes Path=/', () => {
    expect(buildSessionCookie('tok')).toContain('Path=/');
  });

  it('includes Max-Age=2592000 (30 days)', () => {
    expect(buildSessionCookie('tok')).toContain('Max-Age=2592000');
  });
});

describe('extractSessionToken', () => {
  it('extracts the session token from a cookie header', () => {
    expect(extractSessionToken('__Host-better-auth.session_token=abc123')).toBe('abc123');
  });

  it('returns null when cookieHeader is null', () => {
    expect(extractSessionToken(null)).toBeNull();
  });

  it('returns null when cookieHeader is empty string', () => {
    expect(extractSessionToken('')).toBeNull();
  });

  it('returns null when session cookie is absent', () => {
    expect(extractSessionToken('__Host-csrf=token; other=value')).toBeNull();
  });

  it('extracts the token when session cookie is present alongside other cookies', () => {
    expect(
      extractSessionToken('__Host-csrf=xyz; __Host-better-auth.session_token=tok123; more=stuff')
    ).toBe('tok123');
  });

  it('handles the session cookie at the end of a multi-cookie header', () => {
    expect(extractSessionToken('other=abc; __Host-better-auth.session_token=endtok')).toBe(
      'endtok'
    );
  });
});

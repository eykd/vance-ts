import {
  SESSION_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  buildSessionCookie,
  buildCsrfCookie,
  clearSessionCookie,
  clearCsrfCookie,
  extractSessionIdFromCookies,
  extractCsrfTokenFromCookies,
} from './cookieBuilder';

describe('cookie constants', () => {
  it('uses __Host- prefix for session cookie name', () => {
    expect(SESSION_COOKIE_NAME).toBe('__Host-session');
  });

  it('uses __Host- prefix for CSRF cookie name', () => {
    expect(CSRF_COOKIE_NAME).toBe('__Host-csrf');
  });

  it('sets session max age to 7 days', () => {
    expect(SESSION_MAX_AGE_SECONDS).toBe(604800);
  });
});

describe('buildSessionCookie', () => {
  it('builds a session cookie with correct attributes', () => {
    const cookie = buildSessionCookie('abc-123', 3600);
    expect(cookie).toBe(
      '__Host-session=abc-123; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600'
    );
  });

  it('uses default max age when not specified', () => {
    const cookie = buildSessionCookie('sess-id');
    expect(cookie).toContain(`Max-Age=${SESSION_MAX_AGE_SECONDS}`);
  });

  it('includes HttpOnly to prevent JS access', () => {
    const cookie = buildSessionCookie('id');
    expect(cookie).toContain('HttpOnly');
  });
});

describe('buildCsrfCookie', () => {
  it('builds a CSRF cookie readable by JavaScript', () => {
    const cookie = buildCsrfCookie('token-abc', 3600);
    expect(cookie).toBe('__Host-csrf=token-abc; Secure; SameSite=Lax; Path=/; Max-Age=3600');
  });

  it('does NOT include HttpOnly (JS must read it)', () => {
    const cookie = buildCsrfCookie('token', 3600);
    expect(cookie).not.toContain('HttpOnly');
  });

  it('uses default max age when not specified', () => {
    const cookie = buildCsrfCookie('token');
    expect(cookie).toContain(`Max-Age=${SESSION_MAX_AGE_SECONDS}`);
  });
});

describe('clearSessionCookie', () => {
  it('clears the session cookie with Max-Age=0', () => {
    const cookie = clearSessionCookie();
    expect(cookie).toBe('__Host-session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
  });
});

describe('clearCsrfCookie', () => {
  it('clears the CSRF cookie with Max-Age=0', () => {
    const cookie = clearCsrfCookie();
    expect(cookie).toBe('__Host-csrf=; Secure; SameSite=Lax; Path=/; Max-Age=0');
  });
});

describe('extractSessionIdFromCookies', () => {
  it('extracts session ID from a cookie header', () => {
    const header = '__Host-session=my-session-id; __Host-csrf=my-csrf';
    expect(extractSessionIdFromCookies(header)).toBe('my-session-id');
  });

  it('returns null when session cookie is absent', () => {
    const header = '__Host-csrf=my-csrf; other=value';
    expect(extractSessionIdFromCookies(header)).toBeNull();
  });

  it('returns null for null cookie header', () => {
    expect(extractSessionIdFromCookies(null)).toBeNull();
  });

  it('returns null for empty cookie header', () => {
    expect(extractSessionIdFromCookies('')).toBeNull();
  });

  it('handles whitespace around values', () => {
    const header = ' __Host-session = my-session-id ; other=val';
    expect(extractSessionIdFromCookies(header)).toBe('my-session-id');
  });

  it('returns null when session cookie has empty value', () => {
    const header = '__Host-session=; other=val';
    expect(extractSessionIdFromCookies(header)).toBeNull();
  });
});

describe('extractCsrfTokenFromCookies', () => {
  it('extracts CSRF token from a cookie header', () => {
    const header = '__Host-session=sess; __Host-csrf=my-csrf-token';
    expect(extractCsrfTokenFromCookies(header)).toBe('my-csrf-token');
  });

  it('returns null when CSRF cookie is absent', () => {
    const header = '__Host-session=sess; other=val';
    expect(extractCsrfTokenFromCookies(header)).toBeNull();
  });

  it('returns null for null cookie header', () => {
    expect(extractCsrfTokenFromCookies(null)).toBeNull();
  });
});

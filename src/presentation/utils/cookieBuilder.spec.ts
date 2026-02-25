import {
  buildCsrfCookie,
  clearCsrfCookie,
  deriveCsrfToken,
  extractCsrfTokenFromCookies,
  generateCsrfToken,
} from './cookieBuilder';

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
    expect(value).toContain('__Secure-csrf=abc123');
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
    expect(value).toContain('__Secure-csrf=');
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

describe('extractCsrfTokenFromCookies', () => {
  it('extracts the __Secure-csrf token from a cookie header', () => {
    const header = '__Secure-csrf=mytoken123; other=value';
    expect(extractCsrfTokenFromCookies(header)).toBe('mytoken123');
  });

  it('returns null when the cookie header is null', () => {
    expect(extractCsrfTokenFromCookies(null)).toBeNull();
  });

  it('returns null when the __Secure-csrf cookie is absent', () => {
    expect(extractCsrfTokenFromCookies('session=abc; other=xyz')).toBeNull();
  });

  it('handles a cookie header with only the CSRF cookie', () => {
    expect(extractCsrfTokenFromCookies('__Secure-csrf=onlyone')).toBe('onlyone');
  });

  it('handles the CSRF cookie at the end of a multi-cookie header', () => {
    const header = 'session=abc; __Secure-csrf=endtoken';
    expect(extractCsrfTokenFromCookies(header)).toBe('endtoken');
  });

  it('returns null for empty cookie header', () => {
    expect(extractCsrfTokenFromCookies('')).toBeNull();
  });
});

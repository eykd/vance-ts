import {
  buildAuthIndicatorCookie,
  buildCsrfCookie,
  buildFlashRegisteredCookie,
  buildSessionCookie,
  clearAuthIndicatorCookie,
  clearCsrfCookie,
  clearFlashRegisteredCookie,
  clearSessionCookie,
  deriveCsrfToken,
  extractCsrfTokenFromCookies,
  extractSessionToken,
  generateCsrfToken,
  hasAuthIndicatorCookie,
  hasFlashRegisteredCookie,
  hasSessionCookie,
} from './cookieBuilder';

/** Production session cookie name used in tests. */
const PROD_COOKIE_NAME = '__Host-better-auth.session_token';

/** Production CSRF cookie name. */
const PROD_CSRF_NAME = '__Host-csrf';

/** Localhost CSRF cookie name (no __Host- prefix). */
const LOCAL_CSRF_NAME = 'csrf';

/** Production auth indicator cookie name. */
const PROD_INDICATOR_NAME = '__Host-auth_status';

/** Localhost auth indicator cookie name (no __Host- prefix). */
const LOCAL_INDICATOR_NAME = 'auth_status';

/** Production flash registered cookie name. */
const PROD_FLASH_REGISTERED_NAME = '__Host-flash_registered';

/** Localhost flash registered cookie name (no __Host- prefix). */
const LOCAL_FLASH_REGISTERED_NAME = 'flash_registered';

describe('buildAuthIndicatorCookie', () => {
  it('sets cookie value to __Host-auth_status=1 for production name', () => {
    expect(buildAuthIndicatorCookie(PROD_INDICATOR_NAME)).toMatch(/^__Host-auth_status=1;/);
  });

  it('includes Secure flag', () => {
    expect(buildAuthIndicatorCookie(PROD_INDICATOR_NAME)).toContain('Secure');
  });

  it('includes SameSite=Lax', () => {
    expect(buildAuthIndicatorCookie(PROD_INDICATOR_NAME)).toContain('SameSite=Lax');
  });

  it('includes Path=/', () => {
    expect(buildAuthIndicatorCookie(PROD_INDICATOR_NAME)).toContain('Path=/');
  });

  it('includes Max-Age=2592000 (30 days, matching session cookie)', () => {
    expect(buildAuthIndicatorCookie(PROD_INDICATOR_NAME)).toContain('Max-Age=2592000');
  });

  it('is NOT HttpOnly so client-side JS can read it', () => {
    expect(buildAuthIndicatorCookie(PROD_INDICATOR_NAME)).not.toContain('HttpOnly');
  });

  it('uses localhost cookie name when configured for localhost', () => {
    expect(buildAuthIndicatorCookie(LOCAL_INDICATOR_NAME)).toMatch(/^auth_status=1;/);
  });
});

describe('clearAuthIndicatorCookie', () => {
  it('sets auth_status to empty with Max-Age=0', () => {
    const value = clearAuthIndicatorCookie(PROD_INDICATOR_NAME);
    expect(value).toContain('__Host-auth_status=');
    expect(value).toContain('Max-Age=0');
  });

  it('includes Secure flag', () => {
    expect(clearAuthIndicatorCookie(PROD_INDICATOR_NAME)).toContain('Secure');
  });

  it('includes SameSite=Lax', () => {
    expect(clearAuthIndicatorCookie(PROD_INDICATOR_NAME)).toContain('SameSite=Lax');
  });

  it('includes Path=/', () => {
    expect(clearAuthIndicatorCookie(PROD_INDICATOR_NAME)).toContain('Path=/');
  });

  it('is NOT HttpOnly so attributes match the build cookie', () => {
    expect(clearAuthIndicatorCookie(PROD_INDICATOR_NAME)).not.toContain('HttpOnly');
  });

  it('uses localhost cookie name when configured for localhost', () => {
    const value = clearAuthIndicatorCookie(LOCAL_INDICATOR_NAME);
    expect(value).toContain('auth_status=');
    expect(value).not.toContain('__Host-');
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
    const value = buildCsrfCookie('abc123', PROD_CSRF_NAME);
    expect(value).toContain('__Host-csrf=abc123');
  });

  it('includes HttpOnly flag', () => {
    expect(buildCsrfCookie('token', PROD_CSRF_NAME)).toContain('HttpOnly');
  });

  it('includes Secure flag', () => {
    expect(buildCsrfCookie('token', PROD_CSRF_NAME)).toContain('Secure');
  });

  it('includes SameSite=Strict', () => {
    expect(buildCsrfCookie('token', PROD_CSRF_NAME)).toContain('SameSite=Strict');
  });

  it('includes Path=/ so the cookie is sent from all application routes', () => {
    expect(buildCsrfCookie('token', PROD_CSRF_NAME)).toContain('Path=/');
  });

  it('does not restrict cookie to /auth path (must be available on /app/* routes)', () => {
    expect(buildCsrfCookie('token', PROD_CSRF_NAME)).not.toContain('Path=/auth');
  });

  it('includes Max-Age=3600', () => {
    expect(buildCsrfCookie('token', PROD_CSRF_NAME)).toContain('Max-Age=3600');
  });

  it('uses localhost cookie name when configured for localhost', () => {
    const value = buildCsrfCookie('abc123', LOCAL_CSRF_NAME);
    expect(value).toContain('csrf=abc123');
    expect(value).not.toContain('__Host-');
  });
});

describe('clearCsrfCookie', () => {
  it('returns a Set-Cookie header value that clears the cookie', () => {
    const value = clearCsrfCookie(PROD_CSRF_NAME);
    expect(value).toContain('__Host-csrf=');
    expect(value).toContain('Max-Age=0');
  });

  it('includes HttpOnly flag', () => {
    expect(clearCsrfCookie(PROD_CSRF_NAME)).toContain('HttpOnly');
  });

  it('includes Secure flag', () => {
    expect(clearCsrfCookie(PROD_CSRF_NAME)).toContain('Secure');
  });

  it('includes SameSite=Strict', () => {
    expect(clearCsrfCookie(PROD_CSRF_NAME)).toContain('SameSite=Strict');
  });

  it('includes Path=/ so the cookie is sent from all application routes', () => {
    expect(clearCsrfCookie(PROD_CSRF_NAME)).toContain('Path=/');
  });

  it('does not restrict cookie to /auth path (must be clearable from /app/* routes)', () => {
    expect(clearCsrfCookie(PROD_CSRF_NAME)).not.toContain('Path=/auth');
  });

  it('uses localhost cookie name when configured for localhost', () => {
    const value = clearCsrfCookie(LOCAL_CSRF_NAME);
    expect(value).toContain('csrf=');
    expect(value).not.toContain('__Host-');
  });
});

describe('clearSessionCookie', () => {
  it('returns a Set-Cookie header value that clears the session cookie', () => {
    const value = clearSessionCookie(PROD_COOKIE_NAME);
    expect(value).toContain('__Host-better-auth.session_token=');
    expect(value).toContain('Max-Age=0');
  });

  it('includes HttpOnly flag', () => {
    expect(clearSessionCookie(PROD_COOKIE_NAME)).toContain('HttpOnly');
  });

  it('includes Secure flag', () => {
    expect(clearSessionCookie(PROD_COOKIE_NAME)).toContain('Secure');
  });

  it('includes SameSite=Lax', () => {
    expect(clearSessionCookie(PROD_COOKIE_NAME)).toContain('SameSite=Lax');
  });

  it('includes Path=/', () => {
    expect(clearSessionCookie(PROD_COOKIE_NAME)).toContain('Path=/');
  });
});

describe('hasSessionCookie', () => {
  it('returns false when cookieHeader is null', () => {
    expect(hasSessionCookie(null, PROD_COOKIE_NAME)).toBe(false);
  });

  it('returns false when cookieHeader is empty string', () => {
    expect(hasSessionCookie('', PROD_COOKIE_NAME)).toBe(false);
  });

  it('returns false when session cookie is absent from the header', () => {
    expect(hasSessionCookie('other=value; __Host-csrf=token', PROD_COOKIE_NAME)).toBe(false);
  });

  it('returns true when session cookie is present in the header', () => {
    expect(hasSessionCookie('__Host-better-auth.session_token=abc123', PROD_COOKIE_NAME)).toBe(
      true
    );
  });

  it('returns true when session cookie is present alongside other cookies', () => {
    expect(
      hasSessionCookie(
        'other=value; __Host-better-auth.session_token=abc123; more=stuff',
        PROD_COOKIE_NAME
      )
    ).toBe(true);
  });
});

describe('hasAuthIndicatorCookie', () => {
  it('returns false when cookieHeader is null', () => {
    expect(hasAuthIndicatorCookie(null, PROD_INDICATOR_NAME)).toBe(false);
  });

  it('returns false when cookieHeader is empty string', () => {
    expect(hasAuthIndicatorCookie('', PROD_INDICATOR_NAME)).toBe(false);
  });

  it('returns false when auth indicator cookie is absent from the header', () => {
    expect(hasAuthIndicatorCookie('other=value; __Host-csrf=token', PROD_INDICATOR_NAME)).toBe(
      false
    );
  });

  it('returns true when auth indicator cookie is present in the header', () => {
    expect(hasAuthIndicatorCookie('__Host-auth_status=1', PROD_INDICATOR_NAME)).toBe(true);
  });

  it('returns true when auth indicator cookie is present alongside other cookies', () => {
    expect(
      hasAuthIndicatorCookie('other=value; __Host-auth_status=1; more=stuff', PROD_INDICATOR_NAME)
    ).toBe(true);
  });

  it('detects localhost cookie name', () => {
    expect(hasAuthIndicatorCookie('auth_status=1', LOCAL_INDICATOR_NAME)).toBe(true);
  });
});

describe('extractCsrfTokenFromCookies', () => {
  it('extracts the __Host-csrf token from a cookie header', () => {
    const header = '__Host-csrf=mytoken123; other=value';
    expect(extractCsrfTokenFromCookies(header, PROD_CSRF_NAME)).toBe('mytoken123');
  });

  it('returns null when the cookie header is null', () => {
    expect(extractCsrfTokenFromCookies(null, PROD_CSRF_NAME)).toBeNull();
  });

  it('returns null when the __Host-csrf cookie is absent', () => {
    expect(extractCsrfTokenFromCookies('session=abc; other=xyz', PROD_CSRF_NAME)).toBeNull();
  });

  it('handles a cookie header with only the CSRF cookie', () => {
    expect(extractCsrfTokenFromCookies('__Host-csrf=onlyone', PROD_CSRF_NAME)).toBe('onlyone');
  });

  it('handles the CSRF cookie at the end of a multi-cookie header', () => {
    const header = 'session=abc; __Host-csrf=endtoken';
    expect(extractCsrfTokenFromCookies(header, PROD_CSRF_NAME)).toBe('endtoken');
  });

  it('returns null for empty cookie header', () => {
    expect(extractCsrfTokenFromCookies('', PROD_CSRF_NAME)).toBeNull();
  });

  it('extracts token using localhost cookie name', () => {
    expect(extractCsrfTokenFromCookies('csrf=localtoken', LOCAL_CSRF_NAME)).toBe('localtoken');
  });
});

describe('buildSessionCookie', () => {
  it('returns a Set-Cookie header value with the token', () => {
    expect(buildSessionCookie('abc123', PROD_COOKIE_NAME)).toContain(
      '__Host-better-auth.session_token=abc123'
    );
  });

  it('includes HttpOnly flag', () => {
    expect(buildSessionCookie('tok', PROD_COOKIE_NAME)).toContain('HttpOnly');
  });

  it('includes Secure flag', () => {
    expect(buildSessionCookie('tok', PROD_COOKIE_NAME)).toContain('Secure');
  });

  it('includes SameSite=Lax', () => {
    expect(buildSessionCookie('tok', PROD_COOKIE_NAME)).toContain('SameSite=Lax');
  });

  it('includes Path=/', () => {
    expect(buildSessionCookie('tok', PROD_COOKIE_NAME)).toContain('Path=/');
  });

  it('includes Max-Age=2592000 (30 days)', () => {
    expect(buildSessionCookie('tok', PROD_COOKIE_NAME)).toContain('Max-Age=2592000');
  });

  it('uses localhost cookie name when configured for localhost', () => {
    expect(buildSessionCookie('abc123', 'better-auth.session_token')).toContain(
      'better-auth.session_token=abc123'
    );
  });
});

describe('extractSessionToken', () => {
  it('extracts the session token from a cookie header', () => {
    expect(extractSessionToken('__Host-better-auth.session_token=abc123', PROD_COOKIE_NAME)).toBe(
      'abc123'
    );
  });

  it('returns null when cookieHeader is null', () => {
    expect(extractSessionToken(null, PROD_COOKIE_NAME)).toBeNull();
  });

  it('returns null when cookieHeader is empty string', () => {
    expect(extractSessionToken('', PROD_COOKIE_NAME)).toBeNull();
  });

  it('returns null when session cookie is absent', () => {
    expect(extractSessionToken('__Host-csrf=token; other=value', PROD_COOKIE_NAME)).toBeNull();
  });

  it('extracts the token when session cookie is present alongside other cookies', () => {
    expect(
      extractSessionToken(
        '__Host-csrf=xyz; __Host-better-auth.session_token=tok123; more=stuff',
        PROD_COOKIE_NAME
      )
    ).toBe('tok123');
  });

  it('handles the session cookie at the end of a multi-cookie header', () => {
    expect(
      extractSessionToken('other=abc; __Host-better-auth.session_token=endtok', PROD_COOKIE_NAME)
    ).toBe('endtok');
  });

  it('extracts token using localhost cookie name', () => {
    expect(
      extractSessionToken('better-auth.session_token=local-tok', 'better-auth.session_token')
    ).toBe('local-tok');
  });

  it('returns null when session cookie value is empty (e.g. session_token=; Path=/)', () => {
    expect(
      extractSessionToken('__Host-better-auth.session_token=; Path=/', PROD_COOKIE_NAME)
    ).toBeNull();
  });

  it('returns null when session cookie value is empty with no trailing attributes', () => {
    expect(extractSessionToken('__Host-better-auth.session_token=', PROD_COOKIE_NAME)).toBeNull();
  });
});

describe('buildFlashRegisteredCookie', () => {
  it('sets cookie value to __Host-flash_registered=1 for production name', () => {
    expect(buildFlashRegisteredCookie(PROD_FLASH_REGISTERED_NAME)).toMatch(
      /^__Host-flash_registered=1;/
    );
  });

  it('includes HttpOnly flag', () => {
    expect(buildFlashRegisteredCookie(PROD_FLASH_REGISTERED_NAME)).toContain('HttpOnly');
  });

  it('includes Secure flag', () => {
    expect(buildFlashRegisteredCookie(PROD_FLASH_REGISTERED_NAME)).toContain('Secure');
  });

  it('includes SameSite=Strict', () => {
    expect(buildFlashRegisteredCookie(PROD_FLASH_REGISTERED_NAME)).toContain('SameSite=Strict');
  });

  it('includes Path=/', () => {
    expect(buildFlashRegisteredCookie(PROD_FLASH_REGISTERED_NAME)).toContain('Path=/');
  });

  it('includes Max-Age=120 (2 minutes)', () => {
    expect(buildFlashRegisteredCookie(PROD_FLASH_REGISTERED_NAME)).toContain('Max-Age=120');
  });

  it('uses localhost cookie name when configured for localhost', () => {
    expect(buildFlashRegisteredCookie(LOCAL_FLASH_REGISTERED_NAME)).toMatch(/^flash_registered=1;/);
  });
});

describe('clearFlashRegisteredCookie', () => {
  it('sets flash_registered to empty with Max-Age=0', () => {
    const value = clearFlashRegisteredCookie(PROD_FLASH_REGISTERED_NAME);
    expect(value).toContain('__Host-flash_registered=');
    expect(value).toContain('Max-Age=0');
  });

  it('includes HttpOnly flag', () => {
    expect(clearFlashRegisteredCookie(PROD_FLASH_REGISTERED_NAME)).toContain('HttpOnly');
  });

  it('includes Secure flag', () => {
    expect(clearFlashRegisteredCookie(PROD_FLASH_REGISTERED_NAME)).toContain('Secure');
  });

  it('includes SameSite=Strict', () => {
    expect(clearFlashRegisteredCookie(PROD_FLASH_REGISTERED_NAME)).toContain('SameSite=Strict');
  });

  it('includes Path=/', () => {
    expect(clearFlashRegisteredCookie(PROD_FLASH_REGISTERED_NAME)).toContain('Path=/');
  });

  it('uses localhost cookie name when configured for localhost', () => {
    const value = clearFlashRegisteredCookie(LOCAL_FLASH_REGISTERED_NAME);
    expect(value).toContain('flash_registered=');
    expect(value).not.toContain('__Host-');
  });
});

describe('hasFlashRegisteredCookie', () => {
  it('returns false when cookieHeader is null', () => {
    expect(hasFlashRegisteredCookie(null, PROD_FLASH_REGISTERED_NAME)).toBe(false);
  });

  it('returns false when cookieHeader is empty string', () => {
    expect(hasFlashRegisteredCookie('', PROD_FLASH_REGISTERED_NAME)).toBe(false);
  });

  it('returns false when flash registered cookie is absent from the header', () => {
    expect(
      hasFlashRegisteredCookie('other=value; __Host-csrf=token', PROD_FLASH_REGISTERED_NAME)
    ).toBe(false);
  });

  it('returns true when flash registered cookie is present in the header', () => {
    expect(hasFlashRegisteredCookie('__Host-flash_registered=1', PROD_FLASH_REGISTERED_NAME)).toBe(
      true
    );
  });

  it('returns true when flash registered cookie is present alongside other cookies', () => {
    expect(
      hasFlashRegisteredCookie(
        'other=value; __Host-flash_registered=1; more=stuff',
        PROD_FLASH_REGISTERED_NAME
      )
    ).toBe(true);
  });

  it('detects localhost cookie name', () => {
    expect(hasFlashRegisteredCookie('flash_registered=1', LOCAL_FLASH_REGISTERED_NAME)).toBe(true);
  });
});

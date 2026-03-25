import { describe, expect, it } from 'vitest';

import { ensureSecureCookies } from './ensureSecureCookies';

describe('ensureSecureCookies', () => {
  it('adds Secure flag to Set-Cookie header missing it', () => {
    const response = new Response(null, {
      headers: {
        'set-cookie':
          '__Host-better-auth.session_token=abc123; HttpOnly; Path=/; SameSite=Lax; Max-Age=2592000',
      },
    });

    const result = ensureSecureCookies(response);

    const setCookie = result.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain('; Secure');
  });

  it('does not duplicate Secure flag when already present', () => {
    const response = new Response(null, {
      headers: {
        'set-cookie':
          '__Host-better-auth.session_token=abc123; HttpOnly; Secure; Path=/; SameSite=Lax',
      },
    });

    const result = ensureSecureCookies(response);

    const setCookie = result.headers.get('set-cookie') ?? '';
    const secureCount = (setCookie.match(/Secure/gi) ?? []).length;
    expect(secureCount).toBe(1);
  });

  it('handles case-insensitive Secure attribute detection', () => {
    const response = new Response(null, {
      headers: {
        'set-cookie':
          '__Host-better-auth.session_token=abc123; httponly; secure; path=/; samesite=lax',
      },
    });

    const result = ensureSecureCookies(response);

    const setCookie = result.headers.get('set-cookie') ?? '';
    const secureCount = (setCookie.match(/secure/gi) ?? []).length;
    expect(secureCount).toBe(1);
  });

  it('returns response unchanged when no Set-Cookie headers present', () => {
    const response = new Response('body', { status: 200 });

    const result = ensureSecureCookies(response);

    expect(result.headers.has('set-cookie')).toBe(false);
  });

  it('processes multiple Set-Cookie headers', () => {
    const response = new Response(null);
    response.headers.append(
      'set-cookie',
      '__Host-better-auth.session_token=abc; HttpOnly; Path=/; SameSite=Lax'
    );
    response.headers.append(
      'set-cookie',
      '__Host-better-auth.session_data=xyz; HttpOnly; Path=/; SameSite=Lax'
    );

    const result = ensureSecureCookies(response);

    const cookies = result.headers.getSetCookie();
    for (const cookie of cookies) {
      expect(cookie).toMatch(/;\s*Secure/i);
    }
  });

  it('preserves all other cookie attributes', () => {
    const original =
      '__Host-better-auth.session_token=abc123; HttpOnly; Path=/; SameSite=Lax; Max-Age=2592000';
    const response = new Response(null, {
      headers: { 'set-cookie': original },
    });

    const result = ensureSecureCookies(response);

    const setCookie = result.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('Path=/');
    expect(setCookie).toContain('SameSite=Lax');
    expect(setCookie).toContain('Max-Age=2592000');
    expect(setCookie).toContain('__Host-better-auth.session_token=abc123');
  });

  it('preserves non-Set-Cookie headers', () => {
    const response = new Response(null, {
      headers: {
        'content-type': 'application/json',
        'set-cookie': '__Host-better-auth.session_token=abc; Path=/',
      },
    });

    const result = ensureSecureCookies(response);

    expect(result.headers.get('content-type')).toBe('application/json');
  });
});

import { SECURITY_HEADERS, applySecurityHeaders, buildCspHeaderValue } from './securityHeaders';

describe('buildCspHeaderValue', () => {
  let csp: string;

  beforeEach(() => {
    csp = buildCspHeaderValue();
  });

  it('returns semicolon-separated directives', () => {
    const directives = csp.split(';').map((d) => d.trim());
    expect(directives.length).toBe(11);
  });

  it("includes default-src 'self'", () => {
    expect(csp).toContain("default-src 'self'");
  });

  it("includes script-src 'self' without unsafe-inline or unsafe-eval", () => {
    const scriptDirective = csp
      .split(';')
      .map((d) => d.trim())
      .find((d) => d.startsWith('script-src'));
    expect(scriptDirective).toBe("script-src 'self'");
  });

  it("includes style-src 'self' without unsafe-inline (x-show replaced by x-bind:class)", () => {
    const styleDirective = csp
      .split(';')
      .map((d) => d.trim())
      .find((d) => d.startsWith('style-src'));
    expect(styleDirective).toBe("style-src 'self'");
  });

  it("includes object-src 'none' to block plugin content", () => {
    expect(csp).toContain("object-src 'none'");
  });

  it("includes frame-ancestors 'none'", () => {
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it("includes form-action 'self'", () => {
    expect(csp).toContain("form-action 'self'");
  });

  it('includes upgrade-insecure-requests directive', () => {
    expect(csp).toContain('upgrade-insecure-requests');
  });

  it('does not reference any CDN domains', () => {
    expect(csp).not.toContain('cdn.tailwindcss.com');
    expect(csp).not.toContain('unpkg.com');
    expect(csp).not.toContain('cdn.jsdelivr.net');
  });
});

describe('SECURITY_HEADERS', () => {
  it('contains the same headers that applySecurityHeaders sets', () => {
    const headers = new Headers();
    applySecurityHeaders(headers);

    for (const [name, value] of SECURITY_HEADERS) {
      expect(headers.get(name)).toBe(value);
    }
  });

  it('has 8 entries', () => {
    expect(SECURITY_HEADERS).toHaveLength(8);
  });
});

describe('applySecurityHeaders', () => {
  let headers: Headers;

  beforeEach(() => {
    headers = new Headers();
    applySecurityHeaders(headers);
  });

  it('sets Content-Security-Policy header', () => {
    expect(headers.get('Content-Security-Policy')).toBe(buildCspHeaderValue());
  });

  it('sets X-Content-Type-Options to nosniff', () => {
    expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('sets X-Frame-Options to DENY', () => {
    expect(headers.get('X-Frame-Options')).toBe('DENY');
  });

  it('sets Referrer-Policy to strict-origin-when-cross-origin', () => {
    expect(headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  });

  it('sets HSTS with 2-year max-age, includeSubDomains, and preload', () => {
    expect(headers.get('Strict-Transport-Security')).toBe(
      'max-age=63072000; includeSubDomains; preload'
    );
  });

  it('sets X-Permitted-Cross-Domain-Policies to none', () => {
    expect(headers.get('X-Permitted-Cross-Domain-Policies')).toBe('none');
  });

  it('sets Permissions-Policy restricting sensitive APIs', () => {
    expect(headers.get('Permissions-Policy')).toBe(
      'geolocation=(), microphone=(), camera=(), payment=(), usb=()'
    );
  });

  it('sets Cross-Origin-Opener-Policy to same-origin', () => {
    expect(headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin');
  });

  it('does not set Cache-Control (handlers own their own caching policy)', () => {
    expect(headers.has('Cache-Control')).toBe(false);
  });

  it('preserves existing Cache-Control set by the handler', () => {
    const existing = new Headers({ 'Cache-Control': 'no-store, no-cache' });
    applySecurityHeaders(existing);
    expect(existing.get('Cache-Control')).toBe('no-store, no-cache');
  });

  it('preserves existing headers', () => {
    const existing = new Headers({ 'X-Custom': 'keep-me' });
    applySecurityHeaders(existing);
    expect(existing.get('X-Custom')).toBe('keep-me');
    expect(existing.get('Content-Security-Policy')).toBe(buildCspHeaderValue());
  });
});

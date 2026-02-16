import { applySecurityHeaders, buildCspHeaderValue } from './securityHeaders';

describe('buildCspHeaderValue', () => {
  let csp: string;

  beforeEach(() => {
    csp = buildCspHeaderValue();
  });

  it('returns semicolon-separated directives', () => {
    const directives = csp.split(';').map((d) => d.trim());
    expect(directives.length).toBeGreaterThanOrEqual(4);
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

  it("includes style-src 'self' 'unsafe-inline' for Alpine.js compatibility", () => {
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
  });

  it("includes frame-ancestors 'none'", () => {
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it("includes form-action 'self'", () => {
    expect(csp).toContain("form-action 'self'");
  });

  it('does not reference any CDN domains', () => {
    expect(csp).not.toContain('cdn.tailwindcss.com');
    expect(csp).not.toContain('unpkg.com');
    expect(csp).not.toContain('cdn.jsdelivr.net');
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

  it('sets Strict-Transport-Security with max-age and includeSubDomains', () => {
    expect(headers.get('Strict-Transport-Security')).toBe('max-age=31536000; includeSubDomains');
  });

  it('sets X-Permitted-Cross-Domain-Policies to none', () => {
    expect(headers.get('X-Permitted-Cross-Domain-Policies')).toBe('none');
  });

  it('preserves existing headers', () => {
    const existing = new Headers({ 'X-Custom': 'keep-me' });
    applySecurityHeaders(existing);
    expect(existing.get('X-Custom')).toBe('keep-me');
    expect(existing.get('Content-Security-Policy')).toBe(buildCspHeaderValue());
  });
});

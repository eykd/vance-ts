import { buildCspHeaderValue, applySecurityHeaders } from './securityHeaders';

describe('buildCspHeaderValue', () => {
  it('includes default-src self', () => {
    const csp = buildCspHeaderValue();
    expect(csp).toContain("default-src 'self'");
  });

  it('does not allow unsafe-inline in script-src', () => {
    const csp = buildCspHeaderValue();
    const scriptDirective = csp
      .split(';')
      .map((d) => d.trim())
      .find((d) => d.startsWith('script-src'));
    expect(scriptDirective).toBeDefined();
    expect(scriptDirective).not.toContain('unsafe-inline');
  });

  it('includes frame-ancestors none', () => {
    const csp = buildCspHeaderValue();
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it('includes form-action self', () => {
    const csp = buildCspHeaderValue();
    expect(csp).toContain("form-action 'self'");
  });

  it('uses self-only script-src with no external domains', () => {
    const csp = buildCspHeaderValue();
    const scriptDirective = csp
      .split(';')
      .map((d) => d.trim())
      .find((d) => d.startsWith('script-src'));
    expect(scriptDirective).toBe("script-src 'self'");
  });

  it('uses self-only style-src with no unsafe-inline or external domains', () => {
    const csp = buildCspHeaderValue();
    const styleDirective = csp
      .split(';')
      .map((d) => d.trim())
      .find((d) => d.startsWith('style-src'));
    expect(styleDirective).toBe("style-src 'self'");
  });

  it('does not contain any external CDN domains', () => {
    const csp = buildCspHeaderValue();
    expect(csp).not.toContain('cdn.tailwindcss.com');
    expect(csp).not.toContain('unpkg.com');
    expect(csp).not.toContain('cdn.jsdelivr.net');
  });

  it('includes img-src self', () => {
    const csp = buildCspHeaderValue();
    expect(csp).toContain("img-src 'self'");
  });

  it('includes connect-src self for HTMX', () => {
    const csp = buildCspHeaderValue();
    expect(csp).toContain("connect-src 'self'");
  });
});

describe('applySecurityHeaders', () => {
  it('sets Content-Security-Policy header', () => {
    const headers = new Headers();
    applySecurityHeaders(headers);
    expect(headers.get('Content-Security-Policy')).toBe(buildCspHeaderValue());
  });

  it('sets X-Content-Type-Options to nosniff', () => {
    const headers = new Headers();
    applySecurityHeaders(headers);
    expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('sets X-Frame-Options to DENY', () => {
    const headers = new Headers();
    applySecurityHeaders(headers);
    expect(headers.get('X-Frame-Options')).toBe('DENY');
  });

  it('sets Referrer-Policy to strict-origin-when-cross-origin', () => {
    const headers = new Headers();
    applySecurityHeaders(headers);
    expect(headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  });

  it('preserves existing headers', () => {
    const headers = new Headers({ 'X-Custom': 'value' });
    applySecurityHeaders(headers);
    expect(headers.get('X-Custom')).toBe('value');
    expect(headers.get('X-Content-Type-Options')).toBe('nosniff');
  });
});

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

  it('includes script-src self with CDN domains', () => {
    const csp = buildCspHeaderValue();
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain('https://cdn.tailwindcss.com');
    expect(csp).toContain('https://unpkg.com');
  });

  it('includes style-src self with unsafe-inline and jsdelivr CDN (required for Tailwind CDN play script)', () => {
    const csp = buildCspHeaderValue();
    expect(csp).toContain("style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net");
  });

  it('allows cdn.tailwindcss.com in script-src', () => {
    const csp = buildCspHeaderValue();
    const scriptDirective = csp
      .split(';')
      .map((d) => d.trim())
      .find((d) => d.startsWith('script-src'));
    expect(scriptDirective).toContain('https://cdn.tailwindcss.com');
  });

  it('allows unpkg.com in script-src', () => {
    const csp = buildCspHeaderValue();
    const scriptDirective = csp
      .split(';')
      .map((d) => d.trim())
      .find((d) => d.startsWith('script-src'));
    expect(scriptDirective).toContain('https://unpkg.com');
  });

  it('allows cdn.jsdelivr.net in style-src', () => {
    const csp = buildCspHeaderValue();
    const styleDirective = csp
      .split(';')
      .map((d) => d.trim())
      .find((d) => d.startsWith('style-src'));
    expect(styleDirective).toContain('https://cdn.jsdelivr.net');
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

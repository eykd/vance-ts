import { isHtmxRequest, redirectResponse } from './htmxResponse';

describe('isHtmxRequest', () => {
  it('returns true when HX-Request header is present', () => {
    const request = new Request('https://example.com', {
      headers: { 'HX-Request': 'true' },
    });
    expect(isHtmxRequest(request)).toBe(true);
  });

  it('returns false when HX-Request header is absent', () => {
    const request = new Request('https://example.com');
    expect(isHtmxRequest(request)).toBe(false);
  });
});

describe('redirectResponse', () => {
  it('returns 200 with HX-Redirect for HTMX requests', () => {
    const request = new Request('https://example.com', {
      headers: { 'HX-Request': 'true' },
    });
    const response = redirectResponse(request, '/dashboard');
    expect(response.status).toBe(200);
    expect(response.headers.get('HX-Redirect')).toBe('/dashboard');
    expect(response.headers.has('Location')).toBe(false);
  });

  it('returns 303 with Location for standard requests', () => {
    const request = new Request('https://example.com');
    const response = redirectResponse(request, '/dashboard');
    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('/dashboard');
    expect(response.headers.has('HX-Redirect')).toBe(false);
  });

  it('includes security headers in HTMX redirect', () => {
    const request = new Request('https://example.com', {
      headers: { 'HX-Request': 'true' },
    });
    const response = redirectResponse(request, '/');
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('includes security headers in standard redirect', () => {
    const request = new Request('https://example.com');
    const response = redirectResponse(request, '/');
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });
});

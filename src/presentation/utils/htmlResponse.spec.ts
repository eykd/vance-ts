import { htmlResponse } from './htmlResponse';
import { buildCspHeaderValue } from './securityHeaders';

describe('htmlResponse', () => {
  it('returns a Response with text/html content type', () => {
    const response = htmlResponse('<p>hello</p>');
    expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8');
  });

  it('defaults to 200 status', () => {
    const response = htmlResponse('<p>hello</p>');
    expect(response.status).toBe(200);
  });

  it('uses the provided status code', () => {
    const response = htmlResponse('<p>error</p>', 422);
    expect(response.status).toBe(422);
  });

  it('includes security headers', () => {
    const response = htmlResponse('<p>test</p>');
    expect(response.headers.get('Content-Security-Policy')).toBe(buildCspHeaderValue());
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  });

  it('includes extra headers when provided', () => {
    const extra = new Headers({ 'Set-Cookie': 'test=value' });
    const response = htmlResponse('<p>test</p>', 200, extra);
    expect(response.headers.get('Set-Cookie')).toBe('test=value');
  });

  it('preserves extra headers alongside security headers', () => {
    const extra = new Headers({ 'X-Custom': 'foo' });
    const response = htmlResponse('<p>test</p>', 200, extra);
    expect(response.headers.get('X-Custom')).toBe('foo');
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('returns the HTML body content', async () => {
    const response = htmlResponse('<p>body</p>');
    const body = await response.text();
    expect(body).toBe('<p>body</p>');
  });
});

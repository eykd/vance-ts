import { extractClientIp } from './extractClientIp';

/**
 * Creates a Request with the given headers.
 *
 * @param headers - Headers to set on the request
 * @returns A new Request instance
 */
function requestWithHeaders(headers: Record<string, string>): Request {
  return new Request('https://example.com', { headers });
}

describe('extractClientIp', () => {
  it('prefers CF-Connecting-IP header', () => {
    const request = requestWithHeaders({
      'CF-Connecting-IP': '1.2.3.4',
      'X-Real-IP': '5.6.7.8',
      'X-Forwarded-For': '9.10.11.12',
    });
    expect(extractClientIp(request)).toBe('1.2.3.4');
  });

  it('falls back to X-Real-IP when CF-Connecting-IP is absent', () => {
    const request = requestWithHeaders({
      'X-Real-IP': '5.6.7.8',
      'X-Forwarded-For': '9.10.11.12',
    });
    expect(extractClientIp(request)).toBe('5.6.7.8');
  });

  it('falls back to first X-Forwarded-For IP when other headers are absent', () => {
    const request = requestWithHeaders({
      'X-Forwarded-For': '10.0.0.1, 10.0.0.2, 10.0.0.3',
    });
    expect(extractClientIp(request)).toBe('10.0.0.1');
  });

  it('trims whitespace from X-Forwarded-For first value', () => {
    const request = requestWithHeaders({
      'X-Forwarded-For': ' 10.0.0.1 , 10.0.0.2',
    });
    expect(extractClientIp(request)).toBe('10.0.0.1');
  });

  it('returns "unknown" when no IP headers are present', () => {
    const request = requestWithHeaders({});
    expect(extractClientIp(request)).toBe('unknown');
  });

  it('handles X-Forwarded-For with a single IP', () => {
    const request = requestWithHeaders({
      'X-Forwarded-For': '192.168.1.1',
    });
    expect(extractClientIp(request)).toBe('192.168.1.1');
  });
});

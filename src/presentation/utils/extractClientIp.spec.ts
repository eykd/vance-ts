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
  it('returns CF-Connecting-IP when present', () => {
    const request = requestWithHeaders({
      'CF-Connecting-IP': '1.2.3.4',
    });
    expect(extractClientIp(request)).toBe('1.2.3.4');
  });

  it('ignores X-Real-IP header (spoofable)', () => {
    const request = requestWithHeaders({
      'X-Real-IP': '5.6.7.8',
    });
    expect(extractClientIp(request)).toBe('unknown');
  });

  it('ignores X-Forwarded-For header (spoofable)', () => {
    const request = requestWithHeaders({
      'X-Forwarded-For': '10.0.0.1, 10.0.0.2',
    });
    expect(extractClientIp(request)).toBe('unknown');
  });

  it('returns "unknown" when no headers are present', () => {
    const request = requestWithHeaders({});
    expect(extractClientIp(request)).toBe('unknown');
  });

  it('returns CF-Connecting-IP even when spoofable headers are also present', () => {
    const request = requestWithHeaders({
      'CF-Connecting-IP': '1.2.3.4',
      'X-Real-IP': '5.6.7.8',
      'X-Forwarded-For': '9.10.11.12',
    });
    expect(extractClientIp(request)).toBe('1.2.3.4');
  });
});

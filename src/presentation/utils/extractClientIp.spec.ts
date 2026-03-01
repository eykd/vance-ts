import { extractClientIp, sanitizeIp } from './extractClientIp';

describe('extractClientIp', () => {
  const makeRequest = (headers: Record<string, string>): Request =>
    new Request('https://example.com/', { headers });

  it('returns the CF-Connecting-IP value when present', () => {
    const req = makeRequest({ 'CF-Connecting-IP': '1.2.3.4' });
    expect(extractClientIp(req)).toBe('1.2.3.4');
  });

  it('returns unknown when CF-Connecting-IP is absent', () => {
    const req = makeRequest({});
    expect(extractClientIp(req)).toBe('unknown');
  });

  it('ignores X-Forwarded-For even when CF-Connecting-IP is absent', () => {
    const req = makeRequest({ 'X-Forwarded-For': '9.9.9.9' });
    expect(extractClientIp(req)).toBe('unknown');
  });

  it('uses CF-Connecting-IP and ignores a spoofed X-Forwarded-For', () => {
    const req = makeRequest({
      'CF-Connecting-IP': '1.2.3.4',
      'X-Forwarded-For': '9.9.9.9',
    });
    expect(extractClientIp(req)).toBe('1.2.3.4');
  });

  it('sanitizes the CF-Connecting-IP value by stripping spaces', () => {
    const req = makeRequest({ 'CF-Connecting-IP': '1.2.3.4 ' });
    expect(extractClientIp(req)).toBe('1.2.3.4');
  });

  it('returns unknown when CF-Connecting-IP contains only invalid chars', () => {
    const req = makeRequest({ 'CF-Connecting-IP': '!!!' });
    expect(extractClientIp(req)).toBe('unknown');
  });
});

describe('sanitizeIp', () => {
  it('passes through a valid IPv4 address', () => {
    expect(sanitizeIp('192.168.1.1')).toBe('192.168.1.1');
  });

  it('passes through a valid IPv6 address', () => {
    expect(sanitizeIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(
      '2001:0db8:85a3:0000:0000:8a2e:0370:7334'
    );
  });

  it('strips newline characters', () => {
    expect(sanitizeIp('1.2.3.4\n')).toBe('1.2.3.4');
  });

  it('strips tab characters', () => {
    expect(sanitizeIp('1.2.3.4\t')).toBe('1.2.3.4');
  });

  it('strips non-IP characters like spaces', () => {
    expect(sanitizeIp('1.2.3.4 ')).toBe('1.2.3.4');
  });

  it('returns unknown for empty string', () => {
    expect(sanitizeIp('')).toBe('unknown');
  });

  it('returns unknown when all chars are invalid', () => {
    expect(sanitizeIp('!@#$%^&*()')).toBe('unknown');
  });

  it('returns unknown for oversized input (>45 chars after stripping)', () => {
    // 46 valid IP chars — exceeds max length
    const oversized = '1'.repeat(46);
    expect(sanitizeIp(oversized)).toBe('unknown');
  });

  it('accepts a 45-char string (boundary length)', () => {
    // Max IPv6 is 39 chars; 45 is our ceiling. Build a valid-char 45-char string.
    const boundary = '1'.repeat(45);
    expect(sanitizeIp(boundary)).toBe(boundary);
  });
});

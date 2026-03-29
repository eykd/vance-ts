import { describe, expect, it } from 'vitest';

import { isApiRoute } from './isApiRoute';

describe('isApiRoute', () => {
  it('returns true for /api/ prefix', () => {
    expect(isApiRoute('/api/')).toBe(true);
  });

  it('returns true for paths starting with /api/', () => {
    expect(isApiRoute('/api/users')).toBe(true);
  });

  it('returns true for deeply nested api paths', () => {
    expect(isApiRoute('/api/v1/users/123')).toBe(true);
  });

  it('returns false for root path', () => {
    expect(isApiRoute('/')).toBe(false);
  });

  it('returns false for non-api paths', () => {
    expect(isApiRoute('/about')).toBe(false);
  });

  it('returns false for /api without trailing slash', () => {
    expect(isApiRoute('/api')).toBe(false);
  });

  it('returns false for paths containing api but not at start', () => {
    expect(isApiRoute('/not/api/route')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isApiRoute('')).toBe(false);
  });

  it('returns false for /API/ (case-sensitive)', () => {
    expect(isApiRoute('/API/users')).toBe(false);
  });

  it('returns false for /api-v2/ (similar prefix)', () => {
    expect(isApiRoute('/api-v2/users')).toBe(false);
  });
});

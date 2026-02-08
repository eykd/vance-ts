import { constantTimeEqual } from './constant-time-equal';

describe('constantTimeEqual', () => {
  it('returns true for equal strings', () => {
    expect(constantTimeEqual('hello', 'hello')).toBe(true);
  });

  it('returns false for different strings of same length', () => {
    expect(constantTimeEqual('hello', 'world')).toBe(false);
  });

  it('returns false for strings of different lengths', () => {
    expect(constantTimeEqual('short', 'longer-string')).toBe(false);
  });

  it('returns true for empty strings', () => {
    expect(constantTimeEqual('', '')).toBe(true);
  });

  it('returns false when only one string is empty', () => {
    expect(constantTimeEqual('', 'notempty')).toBe(false);
  });

  it('returns true for unicode strings that are equal', () => {
    expect(constantTimeEqual('héllo wörld', 'héllo wörld')).toBe(true);
  });

  it('returns false for unicode strings that differ', () => {
    expect(constantTimeEqual('héllo', 'hëllo')).toBe(false);
  });

  it('returns true for single character strings', () => {
    expect(constantTimeEqual('a', 'a')).toBe(true);
  });

  it('returns false for single character strings that differ', () => {
    expect(constantTimeEqual('a', 'b')).toBe(false);
  });
});

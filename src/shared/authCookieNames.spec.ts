import { isPlainHttpLocalhost } from './authCookieNames';

describe('isPlainHttpLocalhost', () => {
  it('returns true for http://localhost', () => {
    expect(isPlainHttpLocalhost('http://localhost')).toBe(true);
  });

  it('returns true for http://localhost with port', () => {
    expect(isPlainHttpLocalhost('http://localhost:8787')).toBe(true);
  });

  it('returns true for http://127.0.0.1', () => {
    expect(isPlainHttpLocalhost('http://127.0.0.1')).toBe(true);
  });

  it('returns true for http://127.0.0.1 with port', () => {
    expect(isPlainHttpLocalhost('http://127.0.0.1:8787')).toBe(true);
  });

  it('returns false for https://localhost', () => {
    expect(isPlainHttpLocalhost('https://localhost:8787')).toBe(false);
  });

  it('returns false for https production URLs', () => {
    expect(isPlainHttpLocalhost('https://example.com')).toBe(false);
  });
});

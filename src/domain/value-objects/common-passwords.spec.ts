import { COMMON_PASSWORDS } from './common-passwords';

describe('COMMON_PASSWORDS', () => {
  it('contains 100 passwords', () => {
    expect(COMMON_PASSWORDS.size).toBe(100);
  });

  it('includes well-known common passwords', () => {
    expect(COMMON_PASSWORDS.has('123456')).toBe(true);
    expect(COMMON_PASSWORDS.has('password')).toBe(true);
    expect(COMMON_PASSWORDS.has('qwerty')).toBe(true);
  });

  it('contains only lowercase strings', () => {
    for (const password of COMMON_PASSWORDS) {
      expect(typeof password).toBe('string');
      expect(password).toBe(password.toLowerCase());
    }
  });

  it('does not match passwords with different casing', () => {
    expect(COMMON_PASSWORDS.has('Password')).toBe(false);
    expect(COMMON_PASSWORDS.has('QWERTY')).toBe(false);
  });
});

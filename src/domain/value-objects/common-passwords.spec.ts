import { COMMON_PASSWORDS } from './common-passwords';

describe('COMMON_PASSWORDS', () => {
  it('contains 106 passwords', () => {
    expect(COMMON_PASSWORDS.size).toBe(106);
  });

  it('includes well-known common passwords', () => {
    expect(COMMON_PASSWORDS.has('123456')).toBe(true);
    expect(COMMON_PASSWORDS.has('password')).toBe(true);
    expect(COMMON_PASSWORDS.has('qwerty')).toBe(true);
  });

  it('includes common passwords that meet minimum length requirement', () => {
    expect(COMMON_PASSWORDS.has('passwordpassword')).toBe(true);
    expect(COMMON_PASSWORDS.has('password12345')).toBe(true);
    expect(COMMON_PASSWORDS.has('qwertyuiop123')).toBe(true);
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

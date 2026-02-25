import { COMMON_PASSWORDS } from './common-passwords';

describe('COMMON_PASSWORDS', () => {
  it('covers at least 1000 passwords from the OWASP common password list', () => {
    expect(COMMON_PASSWORDS.size).toBeGreaterThanOrEqual(1000);
  });

  it('includes well-known common passwords', () => {
    expect(COMMON_PASSWORDS.has('123456')).toBe(true);
    expect(COMMON_PASSWORDS.has('password')).toBe(true);
    expect(COMMON_PASSWORDS.has('qwerty')).toBe(true);
  });

  it('includes password123-style passwords', () => {
    expect(COMMON_PASSWORDS.has('password1')).toBe(true);
    expect(COMMON_PASSWORDS.has('password12345')).toBe(true);
    expect(COMMON_PASSWORDS.has('qwertyuiop123')).toBe(true);
  });

  it('includes long common passwords (12+ chars) that can bypass min-length checks', () => {
    // These passwords are >= 12 chars and would pass a min-length check,
    // so the blocklist is the only defence against them.
    expect(COMMON_PASSWORDS.has('iloveyou1234')).toBe(true);
    expect(COMMON_PASSWORDS.has('password12345')).toBe(true);
    expect(COMMON_PASSWORDS.has('qwerty123456')).toBe(true);
    expect(COMMON_PASSWORDS.has('1q2w3e4r5t6y')).toBe(true);
    expect(COMMON_PASSWORDS.has('passwordpassword')).toBe(true);
    expect(COMMON_PASSWORDS.has('sunshine12345')).toBe(true);
    expect(COMMON_PASSWORDS.has('football123456')).toBe(true);
    expect(COMMON_PASSWORDS.has('princess12345')).toBe(true);
    expect(COMMON_PASSWORDS.has('iloveyouforever')).toBe(true);
    expect(COMMON_PASSWORDS.has('basketball12345')).toBe(true);
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

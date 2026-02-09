import { makeUser } from './userFactory';

describe('makeUser', () => {
  it('creates a user with default values', () => {
    const user = makeUser();

    expect(user.id.toString()).toBe('00000000-0000-4000-a000-000000000001');
    expect(user.email.normalizedValue).toBe('alice@example.com');
    expect(user.passwordHash).toBe('hashed:correct-password');
    expect(user.failedLoginAttempts).toBe(0);
    expect(user.lockedUntil).toBeNull();
  });

  it('allows overriding id', () => {
    const user = makeUser({ id: '00000000-0000-4000-a000-000000000002' });

    expect(user.id.toString()).toBe('00000000-0000-4000-a000-000000000002');
  });

  it('allows overriding email', () => {
    const user = makeUser({ email: 'bob@example.com' });

    expect(user.email.normalizedValue).toBe('bob@example.com');
  });

  it('allows overriding passwordHash', () => {
    const user = makeUser({ passwordHash: 'custom-hash' });

    expect(user.passwordHash).toBe('custom-hash');
  });

  it('allows overriding failedAttempts', () => {
    const user = makeUser({ failedAttempts: 3 });

    expect(user.failedLoginAttempts).toBe(3);
  });

  it('allows zero failedAttempts explicitly', () => {
    const user = makeUser({ failedAttempts: 0 });

    expect(user.failedLoginAttempts).toBe(0);
  });

  it('creates a locked account when locked is true', () => {
    const user = makeUser({ locked: true });

    expect(user.lockedUntil).not.toBeNull();
    expect(user.failedLoginAttempts).toBe(5);
  });

  it('creates an unlocked account when locked is false', () => {
    const user = makeUser({ locked: false });

    expect(user.lockedUntil).toBeNull();
  });

  it('allows overriding multiple properties at once', () => {
    const user = makeUser({
      id: '00000000-0000-4000-a000-000000000003',
      email: 'test@example.com',
      passwordHash: 'test-hash',
      failedAttempts: 2,
    });

    expect(user.id.toString()).toBe('00000000-0000-4000-a000-000000000003');
    expect(user.email.normalizedValue).toBe('test@example.com');
    expect(user.passwordHash).toBe('test-hash');
    expect(user.failedLoginAttempts).toBe(2);
  });
});

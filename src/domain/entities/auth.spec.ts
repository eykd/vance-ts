import { describe, expect, it } from 'vitest';

import type { AuthSession, AuthUser } from './auth';

describe('AuthUser', () => {
  it('has the expected shape with all required readonly fields', () => {
    const user: AuthUser = {
      id: 'user-123',
      email: 'alice@example.com',
      name: 'Alice',
      emailVerified: false,
      createdAt: '2026-01-01T00:00:00.000Z',
    };

    expect(user.id).toBe('user-123');
    expect(user.email).toBe('alice@example.com');
    expect(user.name).toBe('Alice');
    expect(user.emailVerified).toBe(false);
    expect(user.createdAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('accepts emailVerified as true', () => {
    const user: AuthUser = {
      id: 'user-456',
      email: 'bob@example.com',
      name: 'Bob',
      emailVerified: true,
      createdAt: '2026-02-15T12:00:00.000Z',
    };

    expect(user.emailVerified).toBe(true);
  });
});

describe('AuthSession', () => {
  it('has the expected shape with all required readonly fields', () => {
    const session: AuthSession = {
      id: 'session-abc',
      token: 'tok_secret',
      userId: 'user-123',
      expiresAt: '2026-03-01T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
    };

    expect(session.id).toBe('session-abc');
    expect(session.token).toBe('tok_secret');
    expect(session.userId).toBe('user-123');
    expect(session.expiresAt).toBe('2026-03-01T00:00:00.000Z');
    expect(session.createdAt).toBe('2026-01-01T00:00:00.000Z');
  });
});

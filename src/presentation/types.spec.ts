import { describe, expect, it } from 'vitest';

import type { AppEnv } from './types';

describe('AppEnv', () => {
  it('Variables.user accepts the AuthUser shape', () => {
    const user: AppEnv['Variables']['user'] = {
      id: 'u1',
      email: 'user@example.com',
      name: 'Test User',
      emailVerified: true,
      createdAt: '2024-01-01T00:00:00Z',
    };

    expect(user.id).toBe('u1');
    expect(user.email).toBe('user@example.com');
    expect(user.name).toBe('Test User');
    expect(user.emailVerified).toBe(true);
    expect(user.createdAt).toBe('2024-01-01T00:00:00Z');
  });

  it('Variables.session accepts the AuthSession shape', () => {
    const session: AppEnv['Variables']['session'] = {
      id: 's1',
      token: 'session-token',
      userId: 'u1',
      expiresAt: '2024-12-31T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
    };

    expect(session.id).toBe('s1');
    expect(session.token).toBe('session-token');
    expect(session.userId).toBe('u1');
    expect(session.expiresAt).toBe('2024-12-31T00:00:00Z');
    expect(session.createdAt).toBe('2024-01-01T00:00:00Z');
  });

  it('Variables.csrfToken is a string', () => {
    const csrfToken: AppEnv['Variables']['csrfToken'] = 'csrf-token-value';

    expect(csrfToken).toBe('csrf-token-value');
  });
});

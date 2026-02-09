import type { AuthResult } from './AuthResult';

describe('AuthResult', () => {
  it('has userId, sessionId, csrfToken, and redirectTo properties', () => {
    const result: AuthResult = {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      sessionId: '660e8400-e29b-41d4-a716-446655440000',
      csrfToken: 'a'.repeat(64),
      redirectTo: '/dashboard',
    };

    expect(result.userId).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(result.sessionId).toBe('660e8400-e29b-41d4-a716-446655440000');
    expect(result.csrfToken).toBe('a'.repeat(64));
    expect(result.redirectTo).toBe('/dashboard');
  });
});

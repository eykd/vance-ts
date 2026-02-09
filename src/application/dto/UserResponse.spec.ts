import type { UserResponse } from './UserResponse';

describe('UserResponse', () => {
  it('has id, email, createdAt, and lastLoginAt properties', () => {
    const response: UserResponse = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'test@example.com',
      createdAt: '2025-01-15T00:00:00.000Z',
      lastLoginAt: '2025-01-16T12:00:00.000Z',
    };

    expect(response.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(response.email).toBe('test@example.com');
    expect(response.createdAt).toBe('2025-01-15T00:00:00.000Z');
    expect(response.lastLoginAt).toBe('2025-01-16T12:00:00.000Z');
  });

  it('allows lastLoginAt to be null', () => {
    const response: UserResponse = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'test@example.com',
      createdAt: '2025-01-15T00:00:00.000Z',
      lastLoginAt: null,
    };

    expect(response.lastLoginAt).toBeNull();
  });
});

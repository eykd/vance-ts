import type { LoginRequest } from './LoginRequest';

describe('LoginRequest', () => {
  it('has required email, password, ipAddress, and userAgent properties', () => {
    const request: LoginRequest = {
      email: 'test@example.com',
      password: 'securePassword123',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    };

    expect(request.email).toBe('test@example.com');
    expect(request.password).toBe('securePassword123');
    expect(request.ipAddress).toBe('127.0.0.1');
    expect(request.userAgent).toBe('Mozilla/5.0');
  });

  it('has optional redirectTo property', () => {
    const request: LoginRequest = {
      email: 'test@example.com',
      password: 'securePassword123',
      redirectTo: '/dashboard',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    };

    expect(request.redirectTo).toBe('/dashboard');
  });

  it('allows redirectTo to be undefined', () => {
    const request: LoginRequest = {
      email: 'test@example.com',
      password: 'securePassword123',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    };

    expect(request.redirectTo).toBeUndefined();
  });
});

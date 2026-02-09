import { makeLoginRequest } from './loginRequestFactory';

describe('makeLoginRequest', () => {
  it('creates a login request with default values', () => {
    const request = makeLoginRequest();

    expect(request.email).toBe('alice@example.com');
    expect(request.password).toBe('correct-password');
    expect(request.ipAddress).toBe('192.168.1.100');
    expect(request.userAgent).toBe('Mozilla/5.0 TestBrowser');
  });

  it('allows overriding email', () => {
    const request = makeLoginRequest({ email: 'bob@example.com' });

    expect(request.email).toBe('bob@example.com');
    expect(request.password).toBe('correct-password');
  });

  it('allows overriding password', () => {
    const request = makeLoginRequest({ password: 'new-password' });

    expect(request.password).toBe('new-password');
    expect(request.email).toBe('alice@example.com');
  });

  it('allows overriding ipAddress', () => {
    const request = makeLoginRequest({ ipAddress: '10.0.0.1' });

    expect(request.ipAddress).toBe('10.0.0.1');
  });

  it('allows overriding userAgent', () => {
    const request = makeLoginRequest({ userAgent: 'Custom Browser' });

    expect(request.userAgent).toBe('Custom Browser');
  });

  it('allows overriding redirectTo', () => {
    const request = makeLoginRequest({ redirectTo: '/dashboard' });

    expect(request.redirectTo).toBe('/dashboard');
  });

  it('allows overriding multiple properties at once', () => {
    const request = makeLoginRequest({
      email: 'test@example.com',
      password: 'test-pass',
      ipAddress: '127.0.0.1',
      userAgent: 'Test Agent',
      redirectTo: '/home',
    });

    expect(request.email).toBe('test@example.com');
    expect(request.password).toBe('test-pass');
    expect(request.ipAddress).toBe('127.0.0.1');
    expect(request.userAgent).toBe('Test Agent');
    expect(request.redirectTo).toBe('/home');
  });
});

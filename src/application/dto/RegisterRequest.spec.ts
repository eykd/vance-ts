import type { RegisterRequest } from './RegisterRequest';

describe('RegisterRequest', () => {
  it('has email, password, and confirmPassword properties', () => {
    const request: RegisterRequest = {
      email: 'test@example.com',
      password: 'securePassword123',
      confirmPassword: 'securePassword123',
    };

    expect(request.email).toBe('test@example.com');
    expect(request.password).toBe('securePassword123');
    expect(request.confirmPassword).toBe('securePassword123');
  });
});

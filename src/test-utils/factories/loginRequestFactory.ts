import type { LoginRequest } from '../../application/dto/LoginRequest';

/**
 * Creates a valid login request with sensible defaults.
 *
 * @param overrides - Properties to override
 * @returns A LoginRequest object
 */
export function makeLoginRequest(overrides: Partial<LoginRequest> = {}): LoginRequest {
  return {
    email: 'alice@example.com',
    password: 'correct-password',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 TestBrowser',
    ...overrides,
  };
}

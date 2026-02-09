import { constantTimeEqual } from '../../domain/value-objects/constant-time-equal';

import { validateDoubleSubmitCsrf } from './csrfProtection';

jest.mock('../../domain/value-objects/constant-time-equal', () => ({
  constantTimeEqual: jest.fn(),
}));

const mockedConstantTimeEqual = constantTimeEqual as jest.MockedFunction<typeof constantTimeEqual>;

describe('validateDoubleSubmitCsrf', () => {
  beforeEach(() => {
    mockedConstantTimeEqual.mockReset();
  });

  it('returns null when form token matches cookie token', () => {
    mockedConstantTimeEqual.mockReturnValue(true);
    const result = validateDoubleSubmitCsrf('token-abc', 'token-abc');
    expect(result).toBeNull();
    expect(mockedConstantTimeEqual).toHaveBeenCalledWith('token-abc', 'token-abc');
  });

  it('returns 403 Response when tokens do not match', () => {
    mockedConstantTimeEqual.mockReturnValue(false);
    const result = validateDoubleSubmitCsrf('token-abc', 'different');
    expect(result).not.toBeNull();
    expect(result?.status).toBe(403);
  });

  it('returns 403 Response when form token is null', () => {
    const result = validateDoubleSubmitCsrf(null, 'cookie-token');
    expect(result).not.toBeNull();
    expect(result?.status).toBe(403);
  });

  it('returns 403 Response when cookie token is null', () => {
    const result = validateDoubleSubmitCsrf('form-token', null);
    expect(result).not.toBeNull();
    expect(result?.status).toBe(403);
  });

  it('returns 403 Response when both tokens are null', () => {
    const result = validateDoubleSubmitCsrf(null, null);
    expect(result).not.toBeNull();
    expect(result?.status).toBe(403);
  });

  it('uses constant-time comparison for valid tokens', () => {
    mockedConstantTimeEqual.mockReturnValue(true);
    validateDoubleSubmitCsrf('a'.repeat(64), 'a'.repeat(64));
    expect(mockedConstantTimeEqual).toHaveBeenCalledTimes(1);
  });

  it('includes security headers in 403 response', () => {
    const result = validateDoubleSubmitCsrf(null, null);
    expect(result?.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });
});

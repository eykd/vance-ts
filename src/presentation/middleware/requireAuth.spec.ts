import type { UserResponse } from '../../application/dto/UserResponse';
import type { GetCurrentUserUseCase } from '../../application/use-cases/GetCurrentUserUseCase';
import { UnauthorizedError } from '../../domain/errors/UnauthorizedError';
import { ok, err } from '../../domain/types/Result';

import { requireAuth } from './requireAuth';

jest.mock('../../application/use-cases/GetCurrentUserUseCase');

/**
 * Creates a mock GetCurrentUserUseCase.
 *
 * @returns A mock use case instance
 */
function createMockUseCase(): jest.Mocked<GetCurrentUserUseCase> {
  return {
    execute: jest.fn(),
  } as unknown as jest.Mocked<GetCurrentUserUseCase>;
}

const mockUser: UserResponse = {
  id: '00000000-0000-4000-a000-000000000001',
  email: 'test@example.com',
  createdAt: '2025-01-01T00:00:00.000Z',
  lastLoginAt: '2025-01-02T00:00:00.000Z',
};

describe('requireAuth', () => {
  it('returns UserResponse when session is valid', async () => {
    const useCase = createMockUseCase();
    useCase.execute.mockResolvedValue(ok(mockUser));

    const request = new Request('https://example.com/dashboard', {
      headers: { Cookie: '__Host-session=valid-session-id' },
    });

    const result = await requireAuth(request, { getCurrentUserUseCase: useCase });
    expect(result).toEqual({ type: 'authenticated', user: mockUser });
  });

  it('returns redirect to login when no session cookie', async () => {
    const useCase = createMockUseCase();

    const request = new Request('https://example.com/dashboard');

    const result = await requireAuth(request, { getCurrentUserUseCase: useCase });
    expect(result.type).toBe('redirect');
    if (result.type === 'redirect') {
      expect(result.response.status).toBe(303);
      expect(result.response.headers.get('Location')).toBe('/auth/login');
    }
  });

  it('returns redirect to login when session is invalid', async () => {
    const useCase = createMockUseCase();
    useCase.execute.mockResolvedValue(err(new UnauthorizedError('Invalid session')));

    const request = new Request('https://example.com/dashboard', {
      headers: { Cookie: '__Host-session=invalid-session' },
    });

    const result = await requireAuth(request, { getCurrentUserUseCase: useCase });
    expect(result.type).toBe('redirect');
    if (result.type === 'redirect') {
      expect(result.response.status).toBe(303);
      expect(result.response.headers.get('Location')).toBe('/auth/login');
    }
  });

  it('calls use case with extracted session ID', async () => {
    const useCase = createMockUseCase();
    useCase.execute.mockResolvedValue(ok(mockUser));

    const request = new Request('https://example.com/dashboard', {
      headers: { Cookie: '__Host-session=my-sess-id; other=val' },
    });

    await requireAuth(request, { getCurrentUserUseCase: useCase });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(useCase.execute).toHaveBeenCalledWith('my-sess-id');
  });

  it('redirect response includes security headers', async () => {
    const useCase = createMockUseCase();

    const request = new Request('https://example.com/dashboard');

    const result = await requireAuth(request, { getCurrentUserUseCase: useCase });
    if (result.type === 'redirect') {
      expect(result.response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    }
  });
});

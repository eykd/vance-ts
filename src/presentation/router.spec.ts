import type { Logger } from '../domain/interfaces/Logger';
import type { RateLimiter } from '../domain/interfaces/RateLimiter';

import { handleRequest } from './router';

/** Mock auth handlers for testing. */
const mockAuthHandlers = {
  handleGetLogin: jest.fn().mockReturnValue(new Response('login page', { status: 200 })),
  handleGetRegister: jest.fn().mockReturnValue(new Response('register page', { status: 200 })),
  handlePostLogin: jest.fn().mockResolvedValue(new Response(null, { status: 303 })),
  handlePostRegister: jest.fn().mockResolvedValue(new Response(null, { status: 303 })),
  handlePostLogout: jest.fn().mockResolvedValue(new Response(null, { status: 303 })),
};

/** Mock requireAuth that returns authenticated by default. */
const mockRequireAuth = jest
  .fn()
  .mockResolvedValue({ type: 'authenticated', user: { id: 'u1', email: 'a@b.com' } });

/** Mock logger. */
const mockLogger: jest.Mocked<Logger> = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  security: jest.fn(),
};

/** Mock rate limiter. */
const mockRateLimiter: jest.Mocked<RateLimiter> = {
  checkLimit: jest.fn().mockResolvedValue({ allowed: true, remaining: 9, retryAfterSeconds: null }),
  reset: jest.fn().mockResolvedValue(undefined),
};

/** Dependencies for handleRequest. */
const deps = {
  authHandlers: mockAuthHandlers,
  getCurrentUserUseCase: { execute: jest.fn() },
  cookieOptions: { sessionName: '__Host-session', csrfName: '__Host-csrf', secure: true },
  logger: mockLogger,
  rateLimiter: mockRateLimiter,
  requireAuthFn: mockRequireAuth,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockRequireAuth.mockResolvedValue({
    type: 'authenticated',
    user: { id: 'u1', email: 'a@b.com' },
  });
});

describe('handleRequest', () => {
  describe('auth routes', () => {
    it('routes GET /auth/login to handleGetLogin', async () => {
      const request = new Request('https://example.com/auth/login');
      const response = await handleRequest(request, deps);
      expect(mockAuthHandlers.handleGetLogin).toHaveBeenCalledWith(request);
      expect(response.status).toBe(200);
    });

    it('routes POST /auth/login to handlePostLogin', async () => {
      const request = new Request('https://example.com/auth/login', { method: 'POST' });
      await handleRequest(request, deps);
      expect(mockAuthHandlers.handlePostLogin).toHaveBeenCalledWith(request);
    });

    it('routes GET /auth/register to handleGetRegister', async () => {
      const request = new Request('https://example.com/auth/register');
      const response = await handleRequest(request, deps);
      expect(mockAuthHandlers.handleGetRegister).toHaveBeenCalledWith(request);
      expect(response.status).toBe(200);
    });

    it('routes POST /auth/register to handlePostRegister', async () => {
      const request = new Request('https://example.com/auth/register', { method: 'POST' });
      await handleRequest(request, deps);
      expect(mockAuthHandlers.handlePostRegister).toHaveBeenCalledWith(request);
    });

    it('routes POST /auth/logout to handlePostLogout', async () => {
      const request = new Request('https://example.com/auth/logout', { method: 'POST' });
      await handleRequest(request, deps);
      expect(mockAuthHandlers.handlePostLogout).toHaveBeenCalledWith(request);
    });
  });

  describe('method not allowed', () => {
    it('returns 405 for PUT /auth/login', async () => {
      const request = new Request('https://example.com/auth/login', { method: 'PUT' });
      const response = await handleRequest(request, deps);
      expect(response.status).toBe(405);
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });

    it('returns 405 for DELETE /auth/register', async () => {
      const request = new Request('https://example.com/auth/register', { method: 'DELETE' });
      const response = await handleRequest(request, deps);
      expect(response.status).toBe(405);
    });

    it('returns 405 for GET /auth/logout', async () => {
      const request = new Request('https://example.com/auth/logout');
      const response = await handleRequest(request, deps);
      expect(response.status).toBe(405);
    });

    it('includes Allow header for login', async () => {
      const request = new Request('https://example.com/auth/login', { method: 'PUT' });
      const response = await handleRequest(request, deps);
      expect(response.headers.get('Allow')).toBe('GET, POST');
    });

    it('includes Allow header for logout', async () => {
      const request = new Request('https://example.com/auth/logout', { method: 'GET' });
      const response = await handleRequest(request, deps);
      expect(response.headers.get('Allow')).toBe('POST');
    });
  });

  describe('protected routes (/app/*)', () => {
    it('returns authenticated content for valid session', async () => {
      const request = new Request('https://example.com/app/dashboard');
      const response = await handleRequest(request, deps);
      expect(response.status).toBe(200);
      const body = await response.text();
      expect(body).toBe('OK');
    });

    it('redirects to login when not authenticated', async () => {
      mockRequireAuth.mockResolvedValue({
        type: 'redirect',
        response: new Response(null, { status: 303, headers: { Location: '/auth/login' } }),
      });

      const request = new Request('https://example.com/app/dashboard');
      const response = await handleRequest(request, deps);
      expect(response.status).toBe(303);
      expect(response.headers.get('Location')).toBe('/auth/login');
    });

    it('passes cookieOptions to requireAuth', async () => {
      const request = new Request('https://example.com/app/settings');
      await handleRequest(request, deps);
      expect(mockRequireAuth).toHaveBeenCalledWith(
        request,
        expect.objectContaining({ cookieOptions: deps.cookieOptions })
      );
    });
  });

  describe('not found', () => {
    it('returns 404 for unknown paths', async () => {
      const request = new Request('https://example.com/unknown');
      const response = await handleRequest(request, deps);
      expect(response.status).toBe(404);
    });

    it('includes security headers on 404', async () => {
      const request = new Request('https://example.com/unknown');
      const response = await handleRequest(request, deps);
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });

    it('returns generic 404 message', async () => {
      const request = new Request('https://example.com/unknown');
      const response = await handleRequest(request, deps);
      const body = await response.text();
      expect(body).toBe('Not Found');
    });
  });

  describe('error handling', () => {
    it('returns 500 on unexpected error', async () => {
      mockAuthHandlers.handleGetLogin.mockImplementationOnce(() => {
        throw new Error('unexpected');
      });

      const request = new Request('https://example.com/auth/login');
      const response = await handleRequest(request, deps);
      expect(response.status).toBe(500);
    });

    it('includes security headers on 500', async () => {
      mockAuthHandlers.handleGetLogin.mockImplementationOnce(() => {
        throw new Error('unexpected');
      });

      const request = new Request('https://example.com/auth/login');
      const response = await handleRequest(request, deps);
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });

    it('returns generic error message without stack trace', async () => {
      mockAuthHandlers.handleGetLogin.mockImplementationOnce(() => {
        throw new Error('secret internal error details');
      });

      const request = new Request('https://example.com/auth/login');
      const response = await handleRequest(request, deps);
      const body = await response.text();
      expect(body).toBe('Internal Server Error');
      expect(body).not.toContain('secret');
    });

    it('logs the error', async () => {
      const testError = new Error('test error');
      mockAuthHandlers.handleGetLogin.mockImplementationOnce(() => {
        throw testError;
      });

      const request = new Request('https://example.com/auth/login');
      await handleRequest(request, deps);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Unhandled request error',
        testError,
        expect.objectContaining({ url: 'https://example.com/auth/login' })
      );
    });

    it('handles non-Error throws gracefully', async () => {
      mockAuthHandlers.handleGetLogin.mockImplementationOnce(() => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw 'string error';
      });

      const request = new Request('https://example.com/auth/login');
      const response = await handleRequest(request, deps);
      expect(response.status).toBe(500);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Unhandled request error',
        expect.any(Error),
        expect.objectContaining({ url: 'https://example.com/auth/login' })
      );
    });
  });

  describe('default requireAuth', () => {
    it('uses default requireAuth when requireAuthFn is not provided', async () => {
      const depsWithoutOverride = {
        authHandlers: mockAuthHandlers,
        getCurrentUserUseCase: {
          execute: jest.fn().mockResolvedValue({
            success: false,
            error: new Error('Invalid session'),
          }),
        },
        cookieOptions: deps.cookieOptions,
        logger: mockLogger,
        rateLimiter: mockRateLimiter,
      };

      const request = new Request('https://example.com/app/dashboard');
      const response = await handleRequest(request, depsWithoutOverride);
      // Without a valid session, default requireAuth redirects to login
      expect(response.status).toBe(303);
    });
  });
});

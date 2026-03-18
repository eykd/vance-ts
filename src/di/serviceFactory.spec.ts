import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Env } from '../shared/env';

import { getServiceFactory, resetServiceFactory, ServiceFactory } from './serviceFactory';

/**
 * Hoisted mock variables — must be hoisted so they are available in vi.mock()
 * factory functions, which are executed before module imports.
 */
const mocks = vi.hoisted(() => ({
  getAuth: vi.fn(),
  resetAuth: vi.fn(),
  BetterAuthService: vi.fn(),
  ConsoleLogger: vi.fn(),
  DurableObjectRateLimiter: vi.fn(),
  SignInUseCase: vi.fn(),
  SignUpUseCase: vi.fn(),
  SignOutUseCase: vi.fn(),
  AuthPageHandlers: vi.fn(),
  createRequireAuth: vi.fn(),
  createApiAuthRateLimit: vi.fn(),
  authInstanceHandler: vi.fn(),
}));

vi.mock('../infrastructure/auth', () => ({
  getAuth: mocks.getAuth,
  resetAuth: mocks.resetAuth,
}));

vi.mock('../infrastructure/BetterAuthService', () => ({
  BetterAuthService: mocks.BetterAuthService,
}));

vi.mock('../infrastructure/ConsoleLogger', () => ({
  ConsoleLogger: mocks.ConsoleLogger,
}));

vi.mock('../infrastructure/DurableObjectRateLimiter', () => ({
  DurableObjectRateLimiter: mocks.DurableObjectRateLimiter,
}));

vi.mock('../application/use-cases/SignInUseCase', () => ({
  SignInUseCase: mocks.SignInUseCase,
}));

vi.mock('../application/use-cases/SignUpUseCase', () => ({
  SignUpUseCase: mocks.SignUpUseCase,
}));

vi.mock('../application/use-cases/SignOutUseCase', () => ({
  SignOutUseCase: mocks.SignOutUseCase,
}));

vi.mock('../presentation/handlers/AuthPageHandlers', () => ({
  AuthPageHandlers: mocks.AuthPageHandlers,
}));

vi.mock('../presentation/middleware/requireAuth', () => ({
  createRequireAuth: mocks.createRequireAuth,
}));

vi.mock('../presentation/middleware/apiAuthRateLimit', () => ({
  createApiAuthRateLimit: mocks.createApiAuthRateLimit,
}));

/**
 * Builds a minimal valid Env for testing.
 *
 * @param overrides - Partial Env fields to override defaults.
 * @returns A complete Env with test defaults.
 */
function makeEnv(overrides?: Partial<Env>): Env {
  return {
    ASSETS: {} as Fetcher,
    DB: {} as D1Database,
    BETTER_AUTH_URL: 'https://example.turtlebased.io',
    BETTER_AUTH_SECRET: 'a'.repeat(32),
    RATE_LIMIT: {} as DurableObjectNamespace,
    ...overrides,
  };
}

describe('getServiceFactory', () => {
  beforeEach(() => {
    resetServiceFactory();
    mocks.getAuth.mockReturnValue({
      handler: mocks.authInstanceHandler,
    });
  });

  afterEach(() => {
    resetServiceFactory();
    vi.clearAllMocks();
  });

  it('returns a ServiceFactory instance', () => {
    const env = makeEnv();
    const factory = getServiceFactory(env);
    expect(factory).toBeInstanceOf(ServiceFactory);
  });

  it('returns the same instance on successive calls (singleton)', () => {
    const env = makeEnv();
    const first = getServiceFactory(env);
    const second = getServiceFactory(env);
    expect(first).toBe(second);
  });

  it('reuses cached instance even with a different env object', () => {
    const env1 = makeEnv();
    const env2 = makeEnv({ BETTER_AUTH_URL: 'https://other.example.com' });
    const first = getServiceFactory(env1);
    const second = getServiceFactory(env2);
    expect(first).toBe(second);
  });
});

describe('resetServiceFactory', () => {
  beforeEach(() => {
    resetServiceFactory();
    mocks.getAuth.mockReturnValue({ handler: mocks.authInstanceHandler });
  });

  afterEach(() => {
    resetServiceFactory();
    vi.clearAllMocks();
  });

  it('clears the cached factory so the next call creates a fresh one', () => {
    const env = makeEnv();
    const first = getServiceFactory(env);
    resetServiceFactory();
    const second = getServiceFactory(env);
    expect(first).not.toBe(second);
  });

  it('calls resetAuth when resetting', () => {
    resetServiceFactory();
    expect(mocks.resetAuth).toHaveBeenCalled();
  });
});

describe('ServiceFactory', () => {
  beforeEach(() => {
    resetServiceFactory();
    mocks.getAuth.mockReturnValue({ handler: mocks.authInstanceHandler });
  });

  afterEach(() => {
    resetServiceFactory();
    vi.clearAllMocks();
  });

  describe('authHandler', () => {
    it('returns a function that delegates to the auth instance handler', async () => {
      const env = makeEnv();
      const fakeResponse = new Response('auth api response');
      mocks.authInstanceHandler.mockResolvedValue(fakeResponse);

      const factory = getServiceFactory(env);
      const req = new Request('https://example.com/api/auth/session');
      const result = await factory.authHandler(req);

      expect(mocks.authInstanceHandler).toHaveBeenCalledWith(req);
      expect(result).toBe(fakeResponse);
    });
  });

  describe('authPageHandlers', () => {
    it('returns an AuthPageHandlers instance', () => {
      const mockHandlers = { handleGetSignIn: vi.fn(), handlePostSignIn: vi.fn() };
      mocks.AuthPageHandlers.mockReturnValue(mockHandlers);

      const env = makeEnv();
      const factory = getServiceFactory(env);

      expect(factory.authPageHandlers).toBe(mockHandlers);
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockHandlers = { handleGetSignIn: vi.fn(), handlePostSignIn: vi.fn() };
      mocks.AuthPageHandlers.mockReturnValue(mockHandlers);

      const env = makeEnv();
      const factory = getServiceFactory(env);

      const first = factory.authPageHandlers;
      const second = factory.authPageHandlers;
      expect(first).toBe(second);
      expect(mocks.AuthPageHandlers).toHaveBeenCalledTimes(1);
    });
  });

  describe('authService', () => {
    it('returns a BetterAuthService instance', () => {
      const mockService = { signIn: vi.fn() };
      mocks.BetterAuthService.mockReturnValue(mockService);

      const env = makeEnv();
      const factory = getServiceFactory(env);

      expect(factory.authService).toBe(mockService);
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockService = { signIn: vi.fn() };
      mocks.BetterAuthService.mockReturnValue(mockService);

      const env = makeEnv();
      const factory = getServiceFactory(env);

      const first = factory.authService;
      const second = factory.authService;
      expect(first).toBe(second);
      expect(mocks.BetterAuthService).toHaveBeenCalledTimes(1);
    });
  });

  describe('signInUseCase', () => {
    it('returns a SignInUseCase instance', () => {
      const mockUseCase = { execute: vi.fn() };
      mocks.SignInUseCase.mockReturnValue(mockUseCase);

      const env = makeEnv();
      const factory = getServiceFactory(env);

      expect(factory.signInUseCase).toBe(mockUseCase);
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockUseCase = { execute: vi.fn() };
      mocks.SignInUseCase.mockReturnValue(mockUseCase);

      const env = makeEnv();
      const factory = getServiceFactory(env);

      const first = factory.signInUseCase;
      const second = factory.signInUseCase;
      expect(first).toBe(second);
      expect(mocks.SignInUseCase).toHaveBeenCalledTimes(1);
    });
  });

  describe('signUpUseCase', () => {
    it('returns a SignUpUseCase instance', () => {
      const mockUseCase = { execute: vi.fn() };
      mocks.SignUpUseCase.mockReturnValue(mockUseCase);

      const env = makeEnv();
      const factory = getServiceFactory(env);

      expect(factory.signUpUseCase).toBe(mockUseCase);
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockUseCase = { execute: vi.fn() };
      mocks.SignUpUseCase.mockReturnValue(mockUseCase);

      const env = makeEnv();
      const factory = getServiceFactory(env);

      const first = factory.signUpUseCase;
      const second = factory.signUpUseCase;
      expect(first).toBe(second);
      expect(mocks.SignUpUseCase).toHaveBeenCalledTimes(1);
    });
  });

  describe('signOutUseCase', () => {
    it('returns a SignOutUseCase instance', () => {
      const mockUseCase = { execute: vi.fn() };
      mocks.SignOutUseCase.mockReturnValue(mockUseCase);

      const env = makeEnv();
      const factory = getServiceFactory(env);

      expect(factory.signOutUseCase).toBe(mockUseCase);
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockUseCase = { execute: vi.fn() };
      mocks.SignOutUseCase.mockReturnValue(mockUseCase);

      const env = makeEnv();
      const factory = getServiceFactory(env);

      const first = factory.signOutUseCase;
      const second = factory.signOutUseCase;
      expect(first).toBe(second);
      expect(mocks.SignOutUseCase).toHaveBeenCalledTimes(1);
    });
  });

  describe('requireAuthMiddleware', () => {
    it('returns the result of createRequireAuth pre-injected with authService and secret', () => {
      const mockMiddleware = vi.fn();
      mocks.createRequireAuth.mockReturnValue(mockMiddleware);

      const env = makeEnv();
      const factory = getServiceFactory(env);

      const middleware = factory.requireAuthMiddleware;
      expect(middleware).toBe(mockMiddleware);
      expect(mocks.createRequireAuth).toHaveBeenCalledWith(
        expect.anything(), // authService instance
        env.BETTER_AUTH_SECRET,
        '__Host-better-auth.session_token', // sessionCookieName for non-localhost URL
        '__Host-csrf', // csrfCookieName for non-localhost URL
        '__Host-auth_status' // authIndicatorCookieName for non-localhost URL
      );
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockMiddleware = vi.fn();
      mocks.createRequireAuth.mockReturnValue(mockMiddleware);

      const env = makeEnv();
      const factory = getServiceFactory(env);

      const first = factory.requireAuthMiddleware;
      const second = factory.requireAuthMiddleware;
      expect(first).toBe(second);
      expect(mocks.createRequireAuth).toHaveBeenCalledTimes(1);
    });
  });

  describe('logger', () => {
    it('returns a ConsoleLogger instance', () => {
      const mockLogger = { error: vi.fn() };
      mocks.ConsoleLogger.mockReturnValue(mockLogger);

      const env = makeEnv();
      const factory = getServiceFactory(env);

      expect(factory.logger).toBe(mockLogger);
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockLogger = { error: vi.fn() };
      mocks.ConsoleLogger.mockReturnValue(mockLogger);

      const env = makeEnv();
      const factory = getServiceFactory(env);

      const first = factory.logger;
      const second = factory.logger;
      expect(first).toBe(second);
      expect(mocks.ConsoleLogger).toHaveBeenCalledTimes(1);
    });
  });

  describe('signInApiRateLimitMiddleware', () => {
    it('returns the result of createApiAuthRateLimit with sign-in endpoint config', () => {
      const mockMiddleware = vi.fn();
      mocks.createApiAuthRateLimit.mockReturnValue(mockMiddleware);

      const env = makeEnv();
      const factory = getServiceFactory(env);

      const middleware = factory.signInApiRateLimitMiddleware;
      expect(middleware).toBe(mockMiddleware);
      expect(mocks.createApiAuthRateLimit).toHaveBeenCalledWith(
        expect.anything(), // rateLimiter instance
        'sign-in',
        900 // SIGN_IN_WINDOW_SECONDS
      );
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockMiddleware = vi.fn();
      mocks.createApiAuthRateLimit.mockReturnValue(mockMiddleware);

      const env = makeEnv();
      const factory = getServiceFactory(env);

      const first = factory.signInApiRateLimitMiddleware;
      const second = factory.signInApiRateLimitMiddleware;
      expect(first).toBe(second);
      expect(mocks.createApiAuthRateLimit).toHaveBeenCalledTimes(1);
    });
  });

  describe('signUpApiRateLimitMiddleware', () => {
    it('returns the result of createApiAuthRateLimit with register endpoint config', () => {
      const mockMiddleware = vi.fn();
      mocks.createApiAuthRateLimit.mockReturnValue(mockMiddleware);

      const env = makeEnv();
      const factory = getServiceFactory(env);

      const middleware = factory.signUpApiRateLimitMiddleware;
      expect(middleware).toBe(mockMiddleware);
      expect(mocks.createApiAuthRateLimit).toHaveBeenCalledWith(
        expect.anything(), // rateLimiter instance
        'register',
        300 // REGISTER_WINDOW_SECONDS
      );
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockMiddleware = vi.fn();
      mocks.createApiAuthRateLimit.mockReturnValue(mockMiddleware);

      const env = makeEnv();
      const factory = getServiceFactory(env);

      const first = factory.signUpApiRateLimitMiddleware;
      const second = factory.signUpApiRateLimitMiddleware;
      expect(first).toBe(second);
      expect(mocks.createApiAuthRateLimit).toHaveBeenCalledTimes(1);
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getServiceFactory, resetServiceFactory, ServiceFactory } from './serviceFactory';

/**
 * Hoisted mock variables — must be hoisted so they are available in vi.mock()
 * factory functions, which are executed before module imports.
 */
const mocks = vi.hoisted(() => ({
  getAuth: vi.fn(),
  resetAuth: vi.fn(),
  BetterAuthService: vi.fn(),
  KvRateLimiter: vi.fn(),
  SignInUseCase: vi.fn(),
  SignUpUseCase: vi.fn(),
  SignOutUseCase: vi.fn(),
  AuthPageHandlers: vi.fn(),
  createRequireAuth: vi.fn(),
  authInstanceHandler: vi.fn(),
}));

vi.mock('../infrastructure/auth', () => ({
  getAuth: mocks.getAuth,
  resetAuth: mocks.resetAuth,
}));

vi.mock('../infrastructure/BetterAuthService', () => ({
  BetterAuthService: mocks.BetterAuthService,
}));

vi.mock('../infrastructure/KvRateLimiter', () => ({
  KvRateLimiter: mocks.KvRateLimiter,
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

/**
 * Builds a minimal valid Env for testing.
 *
 * @param overrides - Partial Env fields to override defaults.
 * @returns A complete Env with test defaults.
 */
function makeEnv(overrides?: Record<string, unknown>): unknown {
  return {
    ASSETS: {} as Fetcher,
    DB: {} as D1Database,
    BETTER_AUTH_URL: 'https://example.turtlebased.io',
    BETTER_AUTH_SECRET: 'a'.repeat(32),
    RATE_LIMIT: {} as KVNamespace,
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
    const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);
    expect(factory).toBeInstanceOf(ServiceFactory);
  });

  it('returns the same instance on successive calls (singleton)', () => {
    const env = makeEnv();
    const first = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);
    const second = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);
    expect(first).toBe(second);
  });

  it('reuses cached instance even with a different env object', () => {
    const env1 = makeEnv();
    const env2 = makeEnv({ BETTER_AUTH_URL: 'https://other.example.com' });
    const first = getServiceFactory(env1 as Parameters<typeof getServiceFactory>[0]);
    const second = getServiceFactory(env2 as Parameters<typeof getServiceFactory>[0]);
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
    const first = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);
    resetServiceFactory();
    const second = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);
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

      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);
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
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      expect(factory.authPageHandlers).toBe(mockHandlers);
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockHandlers = { handleGetSignIn: vi.fn(), handlePostSignIn: vi.fn() };
      mocks.AuthPageHandlers.mockReturnValue(mockHandlers);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

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
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      expect(factory.authService).toBe(mockService);
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockService = { signIn: vi.fn() };
      mocks.BetterAuthService.mockReturnValue(mockService);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

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
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      expect(factory.signInUseCase).toBe(mockUseCase);
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockUseCase = { execute: vi.fn() };
      mocks.SignInUseCase.mockReturnValue(mockUseCase);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

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
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      expect(factory.signUpUseCase).toBe(mockUseCase);
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockUseCase = { execute: vi.fn() };
      mocks.SignUpUseCase.mockReturnValue(mockUseCase);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

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
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      expect(factory.signOutUseCase).toBe(mockUseCase);
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockUseCase = { execute: vi.fn() };
      mocks.SignOutUseCase.mockReturnValue(mockUseCase);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

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
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      const middleware = factory.requireAuthMiddleware;
      expect(middleware).toBe(mockMiddleware);
      expect(mocks.createRequireAuth).toHaveBeenCalledWith(
        expect.anything(), // authService instance
        (env as { BETTER_AUTH_SECRET: string }).BETTER_AUTH_SECRET
      );
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockMiddleware = vi.fn();
      mocks.createRequireAuth.mockReturnValue(mockMiddleware);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      const first = factory.requireAuthMiddleware;
      const second = factory.requireAuthMiddleware;
      expect(first).toBe(second);
      expect(mocks.createRequireAuth).toHaveBeenCalledTimes(1);
    });
  });
});

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
  DurableObjectRateLimiter: vi.fn(),
  SignInUseCase: vi.fn(),
  SignUpUseCase: vi.fn(),
  SignOutUseCase: vi.fn(),
  AuthPageHandlers: vi.fn(),
  createRequireAuth: vi.fn(),
  createRequireWorkspace: vi.fn(),
  createApiAuthRateLimit: vi.fn(),
  authInstanceHandler: vi.fn(),
  D1WorkspaceRepository: vi.fn(),
  D1ActorRepository: vi.fn(),
  D1AreaRepository: vi.fn(),
  D1ContextRepository: vi.fn(),
  D1AuditEventRepository: vi.fn(),
  D1InboxItemRepository: vi.fn(),
  WorkspaceD1BatchAdapter: vi.fn(),
  ProvisionWorkspaceUseCase: vi.fn(),
  ListAreasUseCase: vi.fn(),
  ListContextsUseCase: vi.fn(),
  CaptureInboxItemUseCase: vi.fn(),
  ListInboxItemsUseCase: vi.fn(),
  createInboxItemApiHandlers: vi.fn(),
  D1ActionRepository: vi.fn(),
  ActivateActionUseCase: vi.fn(),
  ClarifyInboxItemToActionUseCase: vi.fn(),
  CompleteActionUseCase: vi.fn(),
  createActionApiHandlers: vi.fn(),
}));

vi.mock('../infrastructure/auth', () => ({
  getAuth: mocks.getAuth,
  resetAuth: mocks.resetAuth,
}));

vi.mock('../infrastructure/BetterAuthService', () => ({
  BetterAuthService: mocks.BetterAuthService,
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

vi.mock('../presentation/middleware/requireWorkspace', () => ({
  createRequireWorkspace: mocks.createRequireWorkspace,
}));

vi.mock('../presentation/middleware/apiAuthRateLimit', () => ({
  createApiAuthRateLimit: mocks.createApiAuthRateLimit,
}));

vi.mock('../infrastructure/repositories/D1WorkspaceRepository', () => ({
  D1WorkspaceRepository: mocks.D1WorkspaceRepository,
}));

vi.mock('../infrastructure/repositories/D1ActorRepository', () => ({
  D1ActorRepository: mocks.D1ActorRepository,
}));

vi.mock('../infrastructure/repositories/D1AreaRepository', () => ({
  D1AreaRepository: mocks.D1AreaRepository,
}));

vi.mock('../infrastructure/repositories/D1ContextRepository', () => ({
  D1ContextRepository: mocks.D1ContextRepository,
}));

vi.mock('../infrastructure/repositories/D1AuditEventRepository', () => ({
  D1AuditEventRepository: mocks.D1AuditEventRepository,
}));

vi.mock('../infrastructure/WorkspaceD1BatchAdapter', () => ({
  WorkspaceD1BatchAdapter: mocks.WorkspaceD1BatchAdapter,
}));

vi.mock('../application/use-cases/ProvisionWorkspaceUseCase', () => ({
  ProvisionWorkspaceUseCase: mocks.ProvisionWorkspaceUseCase,
}));

vi.mock('../application/use-cases/ListAreasUseCase', () => ({
  ListAreasUseCase: mocks.ListAreasUseCase,
}));

vi.mock('../application/use-cases/ListContextsUseCase', () => ({
  ListContextsUseCase: mocks.ListContextsUseCase,
}));

vi.mock('../application/use-cases/CaptureInboxItemUseCase', () => ({
  CaptureInboxItemUseCase: mocks.CaptureInboxItemUseCase,
}));

vi.mock('../application/use-cases/ListInboxItemsUseCase', () => ({
  ListInboxItemsUseCase: mocks.ListInboxItemsUseCase,
}));

vi.mock('../infrastructure/repositories/D1InboxItemRepository', () => ({
  D1InboxItemRepository: mocks.D1InboxItemRepository,
}));

vi.mock('../presentation/handlers/InboxItemApiHandlers', () => ({
  createInboxItemApiHandlers: mocks.createInboxItemApiHandlers,
}));

vi.mock('../infrastructure/repositories/D1ActionRepository', () => ({
  D1ActionRepository: mocks.D1ActionRepository,
}));

vi.mock('../application/use-cases/ActivateActionUseCase', () => ({
  ActivateActionUseCase: mocks.ActivateActionUseCase,
}));

vi.mock('../application/use-cases/ClarifyInboxItemToActionUseCase', () => ({
  ClarifyInboxItemToActionUseCase: mocks.ClarifyInboxItemToActionUseCase,
}));

vi.mock('../application/use-cases/CompleteActionUseCase', () => ({
  CompleteActionUseCase: mocks.CompleteActionUseCase,
}));

vi.mock('../presentation/handlers/ActionApiHandlers', () => ({
  createActionApiHandlers: mocks.createActionApiHandlers,
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

  describe('signInApiRateLimitMiddleware', () => {
    it('returns the result of createApiAuthRateLimit with sign-in endpoint config', () => {
      const mockMiddleware = vi.fn();
      mocks.createApiAuthRateLimit.mockReturnValue(mockMiddleware);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

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
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

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
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

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
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      const first = factory.signUpApiRateLimitMiddleware;
      const second = factory.signUpApiRateLimitMiddleware;
      expect(first).toBe(second);
      expect(mocks.createApiAuthRateLimit).toHaveBeenCalledTimes(1);
    });
  });

  describe('workspaceRepository', () => {
    it('returns a D1WorkspaceRepository instance', () => {
      const mockRepo = { save: vi.fn(), getByUserId: vi.fn(), getById: vi.fn() };
      mocks.D1WorkspaceRepository.mockReturnValue(mockRepo);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      expect(factory.workspaceRepository).toBe(mockRepo);
      expect(mocks.D1WorkspaceRepository).toHaveBeenCalledWith((env as { DB: D1Database }).DB);
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockRepo = { save: vi.fn(), getByUserId: vi.fn(), getById: vi.fn() };
      mocks.D1WorkspaceRepository.mockReturnValue(mockRepo);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      const first = factory.workspaceRepository;
      const second = factory.workspaceRepository;
      expect(first).toBe(second);
      expect(mocks.D1WorkspaceRepository).toHaveBeenCalledTimes(1);
    });
  });

  describe('actorRepository', () => {
    it('returns a D1ActorRepository instance', () => {
      const mockRepo = { save: vi.fn(), getById: vi.fn(), getHumanActorByWorkspaceId: vi.fn() };
      mocks.D1ActorRepository.mockReturnValue(mockRepo);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      expect(factory.actorRepository).toBe(mockRepo);
      expect(mocks.D1ActorRepository).toHaveBeenCalledWith((env as { DB: D1Database }).DB);
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockRepo = { save: vi.fn(), getById: vi.fn(), getHumanActorByWorkspaceId: vi.fn() };
      mocks.D1ActorRepository.mockReturnValue(mockRepo);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      const first = factory.actorRepository;
      const second = factory.actorRepository;
      expect(first).toBe(second);
      expect(mocks.D1ActorRepository).toHaveBeenCalledTimes(1);
    });
  });

  describe('areaRepository', () => {
    it('returns a D1AreaRepository instance', () => {
      const mockRepo = {
        save: vi.fn(),
        getById: vi.fn(),
        getActiveById: vi.fn(),
        listByWorkspaceId: vi.fn(),
      };
      mocks.D1AreaRepository.mockReturnValue(mockRepo);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      expect(factory.areaRepository).toBe(mockRepo);
      expect(mocks.D1AreaRepository).toHaveBeenCalledWith((env as { DB: D1Database }).DB);
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockRepo = {
        save: vi.fn(),
        getById: vi.fn(),
        getActiveById: vi.fn(),
        listByWorkspaceId: vi.fn(),
      };
      mocks.D1AreaRepository.mockReturnValue(mockRepo);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      const first = factory.areaRepository;
      const second = factory.areaRepository;
      expect(first).toBe(second);
      expect(mocks.D1AreaRepository).toHaveBeenCalledTimes(1);
    });
  });

  describe('contextRepository', () => {
    it('returns a D1ContextRepository instance', () => {
      const mockRepo = { save: vi.fn(), getById: vi.fn(), listByWorkspaceId: vi.fn() };
      mocks.D1ContextRepository.mockReturnValue(mockRepo);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      expect(factory.contextRepository).toBe(mockRepo);
      expect(mocks.D1ContextRepository).toHaveBeenCalledWith((env as { DB: D1Database }).DB);
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockRepo = { save: vi.fn(), getById: vi.fn(), listByWorkspaceId: vi.fn() };
      mocks.D1ContextRepository.mockReturnValue(mockRepo);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      const first = factory.contextRepository;
      const second = factory.contextRepository;
      expect(first).toBe(second);
      expect(mocks.D1ContextRepository).toHaveBeenCalledTimes(1);
    });
  });

  describe('auditEventRepository', () => {
    it('returns a D1AuditEventRepository instance', () => {
      const mockRepo = { save: vi.fn(), saveBatch: vi.fn() };
      mocks.D1AuditEventRepository.mockReturnValue(mockRepo);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      expect(factory.auditEventRepository).toBe(mockRepo);
      expect(mocks.D1AuditEventRepository).toHaveBeenCalledWith((env as { DB: D1Database }).DB);
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockRepo = { save: vi.fn(), saveBatch: vi.fn() };
      mocks.D1AuditEventRepository.mockReturnValue(mockRepo);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      const first = factory.auditEventRepository;
      const second = factory.auditEventRepository;
      expect(first).toBe(second);
      expect(mocks.D1AuditEventRepository).toHaveBeenCalledTimes(1);
    });
  });

  describe('provisionWorkspaceUseCase', () => {
    it('returns a ProvisionWorkspaceUseCase instance', () => {
      const mockUseCase = { execute: vi.fn() };
      mocks.ProvisionWorkspaceUseCase.mockReturnValue(mockUseCase);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      expect(
        (factory as unknown as { provisionWorkspaceUseCase: unknown }).provisionWorkspaceUseCase
      ).toBe(mockUseCase);
    });

    it('constructs WorkspaceD1BatchAdapter with env.DB as the database binding', () => {
      const mockAdapter = { provisionBatch: vi.fn() };
      mocks.WorkspaceD1BatchAdapter.mockReturnValue(mockAdapter);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      // Trigger the lazy getter to instantiate
      const _uc = (factory as unknown as { provisionWorkspaceUseCase: unknown })
        .provisionWorkspaceUseCase;
      expect(_uc).toBeDefined();

      expect(mocks.WorkspaceD1BatchAdapter).toHaveBeenCalledWith((env as { DB: D1Database }).DB);
    });
  });

  describe('listAreasUseCase', () => {
    it('returns a ListAreasUseCase instance', () => {
      const mockUseCase = { execute: vi.fn() };
      mocks.ListAreasUseCase.mockReturnValue(mockUseCase);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      expect(factory.listAreasUseCase).toBe(mockUseCase);
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockUseCase = { execute: vi.fn() };
      mocks.ListAreasUseCase.mockReturnValue(mockUseCase);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      const first = factory.listAreasUseCase;
      const second = factory.listAreasUseCase;
      expect(first).toBe(second);
      expect(mocks.ListAreasUseCase).toHaveBeenCalledTimes(1);
    });
  });

  describe('listContextsUseCase', () => {
    it('returns a ListContextsUseCase instance', () => {
      const mockUseCase = { execute: vi.fn() };
      mocks.ListContextsUseCase.mockReturnValue(mockUseCase);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      expect(factory.listContextsUseCase).toBe(mockUseCase);
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockUseCase = { execute: vi.fn() };
      mocks.ListContextsUseCase.mockReturnValue(mockUseCase);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      const first = factory.listContextsUseCase;
      const second = factory.listContextsUseCase;
      expect(first).toBe(second);
      expect(mocks.ListContextsUseCase).toHaveBeenCalledTimes(1);
    });
  });

  describe('inboxItemRepository', () => {
    it('returns a D1InboxItemRepository instance', () => {
      const mockRepo = { save: vi.fn(), getById: vi.fn(), listByWorkspaceId: vi.fn() };
      mocks.D1InboxItemRepository.mockReturnValue(mockRepo);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      expect(factory.inboxItemRepository).toBe(mockRepo);
      expect(mocks.D1InboxItemRepository).toHaveBeenCalledWith((env as { DB: D1Database }).DB);
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockRepo = { save: vi.fn(), getById: vi.fn(), listByWorkspaceId: vi.fn() };
      mocks.D1InboxItemRepository.mockReturnValue(mockRepo);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      const first = factory.inboxItemRepository;
      const second = factory.inboxItemRepository;
      expect(first).toBe(second);
      expect(mocks.D1InboxItemRepository).toHaveBeenCalledTimes(1);
    });
  });

  describe('captureInboxItemUseCase', () => {
    it('returns a CaptureInboxItemUseCase instance', () => {
      const mockUseCase = { execute: vi.fn() };
      mocks.CaptureInboxItemUseCase.mockReturnValue(mockUseCase);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      expect(factory.captureInboxItemUseCase).toBe(mockUseCase);
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockUseCase = { execute: vi.fn() };
      mocks.CaptureInboxItemUseCase.mockReturnValue(mockUseCase);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      const first = factory.captureInboxItemUseCase;
      const second = factory.captureInboxItemUseCase;
      expect(first).toBe(second);
      expect(mocks.CaptureInboxItemUseCase).toHaveBeenCalledTimes(1);
    });
  });

  describe('listInboxItemsUseCase', () => {
    it('returns a ListInboxItemsUseCase instance', () => {
      const mockUseCase = { execute: vi.fn() };
      mocks.ListInboxItemsUseCase.mockReturnValue(mockUseCase);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      expect(factory.listInboxItemsUseCase).toBe(mockUseCase);
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockUseCase = { execute: vi.fn() };
      mocks.ListInboxItemsUseCase.mockReturnValue(mockUseCase);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      const first = factory.listInboxItemsUseCase;
      const second = factory.listInboxItemsUseCase;
      expect(first).toBe(second);
      expect(mocks.ListInboxItemsUseCase).toHaveBeenCalledTimes(1);
    });
  });

  describe('inboxItemApiHandlers', () => {
    it('returns the result of createInboxItemApiHandlers wired with capture and list use cases', () => {
      const mockHandlers = { handleCaptureInboxItem: vi.fn(), handleListInboxItems: vi.fn() };
      mocks.createInboxItemApiHandlers.mockReturnValue(mockHandlers);

      const mockCaptureUseCase = { execute: vi.fn() };
      mocks.CaptureInboxItemUseCase.mockReturnValue(mockCaptureUseCase);

      const mockListUseCase = { execute: vi.fn() };
      mocks.ListInboxItemsUseCase.mockReturnValue(mockListUseCase);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      expect(factory.inboxItemApiHandlers).toBe(mockHandlers);
      expect(mocks.createInboxItemApiHandlers).toHaveBeenCalledWith(
        mockCaptureUseCase,
        mockListUseCase
      );
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockHandlers = { handleCaptureInboxItem: vi.fn(), handleListInboxItems: vi.fn() };
      mocks.createInboxItemApiHandlers.mockReturnValue(mockHandlers);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      const first = factory.inboxItemApiHandlers;
      const second = factory.inboxItemApiHandlers;
      expect(first).toBe(second);
      expect(mocks.createInboxItemApiHandlers).toHaveBeenCalledTimes(1);
    });
  });

  describe('actionRepository', () => {
    it('returns a D1ActionRepository instance', () => {
      const mockRepo = { save: vi.fn(), getById: vi.fn(), listByWorkspaceId: vi.fn() };
      mocks.D1ActionRepository.mockReturnValue(mockRepo);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      expect(factory.actionRepository).toBe(mockRepo);
      expect(mocks.D1ActionRepository).toHaveBeenCalledWith((env as { DB: D1Database }).DB);
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockRepo = { save: vi.fn(), getById: vi.fn(), listByWorkspaceId: vi.fn() };
      mocks.D1ActionRepository.mockReturnValue(mockRepo);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      const first = factory.actionRepository;
      const second = factory.actionRepository;
      expect(first).toBe(second);
      expect(mocks.D1ActionRepository).toHaveBeenCalledTimes(1);
    });
  });

  describe('clarifyInboxItemToActionUseCase', () => {
    it('returns a ClarifyInboxItemToActionUseCase instance', () => {
      const mockUseCase = { execute: vi.fn() };
      mocks.ClarifyInboxItemToActionUseCase.mockReturnValue(mockUseCase);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      expect(factory.clarifyInboxItemToActionUseCase).toBe(mockUseCase);
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockUseCase = { execute: vi.fn() };
      mocks.ClarifyInboxItemToActionUseCase.mockReturnValue(mockUseCase);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      const first = factory.clarifyInboxItemToActionUseCase;
      const second = factory.clarifyInboxItemToActionUseCase;
      expect(first).toBe(second);
      expect(mocks.ClarifyInboxItemToActionUseCase).toHaveBeenCalledTimes(1);
    });
  });

  describe('activateActionUseCase', () => {
    it('returns an ActivateActionUseCase instance', () => {
      const mockUseCase = { execute: vi.fn() };
      mocks.ActivateActionUseCase.mockReturnValue(mockUseCase);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      expect(factory.activateActionUseCase).toBe(mockUseCase);
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockUseCase = { execute: vi.fn() };
      mocks.ActivateActionUseCase.mockReturnValue(mockUseCase);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      const first = factory.activateActionUseCase;
      const second = factory.activateActionUseCase;
      expect(first).toBe(second);
      expect(mocks.ActivateActionUseCase).toHaveBeenCalledTimes(1);
    });
  });

  describe('completeActionUseCase', () => {
    it('returns a CompleteActionUseCase instance', () => {
      const mockUseCase = { execute: vi.fn() };
      mocks.CompleteActionUseCase.mockReturnValue(mockUseCase);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      expect(factory.completeActionUseCase).toBe(mockUseCase);
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockUseCase = { execute: vi.fn() };
      mocks.CompleteActionUseCase.mockReturnValue(mockUseCase);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      const first = factory.completeActionUseCase;
      const second = factory.completeActionUseCase;
      expect(first).toBe(second);
      expect(mocks.CompleteActionUseCase).toHaveBeenCalledTimes(1);
    });
  });

  describe('actionApiHandlers', () => {
    it('returns the result of createActionApiHandlers wired with use cases', () => {
      const mockHandlers = {
        handleClarify: vi.fn(),
        handleActivate: vi.fn(),
        handleComplete: vi.fn(),
      };
      mocks.createActionApiHandlers.mockReturnValue(mockHandlers);

      const mockClarify = { execute: vi.fn() };
      mocks.ClarifyInboxItemToActionUseCase.mockReturnValue(mockClarify);

      const mockActivate = { execute: vi.fn() };
      mocks.ActivateActionUseCase.mockReturnValue(mockActivate);

      const mockComplete = { execute: vi.fn() };
      mocks.CompleteActionUseCase.mockReturnValue(mockComplete);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      expect(factory.actionApiHandlers).toBe(mockHandlers);
      expect(mocks.createActionApiHandlers).toHaveBeenCalledWith(
        mockClarify,
        mockActivate,
        mockComplete
      );
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockHandlers = {
        handleClarify: vi.fn(),
        handleActivate: vi.fn(),
        handleComplete: vi.fn(),
      };
      mocks.createActionApiHandlers.mockReturnValue(mockHandlers);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      const first = factory.actionApiHandlers;
      const second = factory.actionApiHandlers;
      expect(first).toBe(second);
      expect(mocks.createActionApiHandlers).toHaveBeenCalledTimes(1);
    });
  });

  describe('requireWorkspaceMiddleware', () => {
    it('returns the result of createRequireWorkspace pre-injected with workspaceRepository and actorRepository', () => {
      const mockMiddleware = vi.fn();
      mocks.createRequireWorkspace.mockReturnValue(mockMiddleware);

      const mockWorkspaceRepo = { save: vi.fn(), getByUserId: vi.fn(), getById: vi.fn() };
      mocks.D1WorkspaceRepository.mockReturnValue(mockWorkspaceRepo);

      const mockActorRepo = {
        save: vi.fn(),
        getById: vi.fn(),
        getHumanActorByWorkspaceId: vi.fn(),
      };
      mocks.D1ActorRepository.mockReturnValue(mockActorRepo);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      // Constraint workspace-35c: ServiceFactory must expose requireWorkspaceMiddleware so that
      // worker.ts can protect /api/v1/* routes from missing actorId (silent data corruption).
      const middleware = factory.requireWorkspaceMiddleware;
      expect(middleware).toBe(mockMiddleware);
      expect(mocks.createRequireWorkspace).toHaveBeenCalledWith(mockWorkspaceRepo, mockActorRepo);
    });

    it('returns the same instance on successive calls (lazy singleton)', () => {
      const mockMiddleware = vi.fn();
      mocks.createRequireWorkspace.mockReturnValue(mockMiddleware);

      const env = makeEnv();
      const factory = getServiceFactory(env as Parameters<typeof getServiceFactory>[0]);

      const first = factory.requireWorkspaceMiddleware;
      const second = factory.requireWorkspaceMiddleware;
      expect(first).toBe(second);
      expect(mocks.createRequireWorkspace).toHaveBeenCalledTimes(1);
    });
  });
});

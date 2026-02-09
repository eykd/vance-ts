import type { AppConfig } from '../application/config/EnvironmentConfig';
import { createAppConfig } from '../application/config/EnvironmentConfig';
import type { D1Database, KVNamespace } from '../infrastructure/types/CloudflareTypes';
import type { Env } from '../infrastructure/types/Env';

import { ServiceFactory, getServiceFactory, resetServiceFactory } from './ServiceFactory';

/**
 * Creates a minimal mock Env for testing.
 *
 * @returns A mock Env with stub bindings
 */
function createMockEnv(): Env {
  const mockDB: D1Database = {
    prepare: jest.fn().mockReturnValue({
      bind: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(null),
      all: jest.fn().mockResolvedValue({ results: [], success: true }),
      run: jest.fn().mockResolvedValue({ results: [], success: true }),
    }),
  };

  const mockKV: KVNamespace = {
    get: jest.fn().mockResolvedValue(null),
    put: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  return {
    DB: mockDB,
    SESSIONS: { ...mockKV },
    RATE_LIMITS: { ...mockKV },
    ENVIRONMENT: 'production',
  };
}

describe('ServiceFactory', () => {
  let env: Env;
  let config: AppConfig;

  beforeEach(() => {
    env = createMockEnv();
    config = createAppConfig(env.ENVIRONMENT);
  });

  describe('singleton behavior', () => {
    it('returns the same logger on repeated access', () => {
      const factory = new ServiceFactory(env, config);
      const first = factory.logger;
      const second = factory.logger;
      expect(first).toBe(second);
    });

    it('returns the same timeProvider on repeated access', () => {
      const factory = new ServiceFactory(env, config);
      const first = factory.timeProvider;
      const second = factory.timeProvider;
      expect(first).toBe(second);
    });

    it('returns the same passwordHasher on repeated access', () => {
      const factory = new ServiceFactory(env, config);
      const first = factory.passwordHasher;
      const second = factory.passwordHasher;
      expect(first).toBe(second);
    });

    it('returns the same userRepository on repeated access', () => {
      const factory = new ServiceFactory(env, config);
      const first = factory.userRepository;
      const second = factory.userRepository;
      expect(first).toBe(second);
    });

    it('returns the same sessionRepository on repeated access', () => {
      const factory = new ServiceFactory(env, config);
      const first = factory.sessionRepository;
      const second = factory.sessionRepository;
      expect(first).toBe(second);
    });

    it('returns the same rateLimiter on repeated access', () => {
      const factory = new ServiceFactory(env, config);
      const first = factory.rateLimiter;
      const second = factory.rateLimiter;
      expect(first).toBe(second);
    });

    it('returns the same loginUseCase on repeated access', () => {
      const factory = new ServiceFactory(env, config);
      const first = factory.loginUseCase;
      const second = factory.loginUseCase;
      expect(first).toBe(second);
    });

    it('returns the same registerUseCase on repeated access', () => {
      const factory = new ServiceFactory(env, config);
      const first = factory.registerUseCase;
      const second = factory.registerUseCase;
      expect(first).toBe(second);
    });

    it('returns the same logoutUseCase on repeated access', () => {
      const factory = new ServiceFactory(env, config);
      const first = factory.logoutUseCase;
      const second = factory.logoutUseCase;
      expect(first).toBe(second);
    });

    it('returns the same getCurrentUserUseCase on repeated access', () => {
      const factory = new ServiceFactory(env, config);
      const first = factory.getCurrentUserUseCase;
      const second = factory.getCurrentUserUseCase;
      expect(first).toBe(second);
    });

    it('returns the same authHandlers on repeated access', () => {
      const factory = new ServiceFactory(env, config);
      const first = factory.authHandlers;
      const second = factory.authHandlers;
      expect(first).toBe(second);
    });
  });

  describe('correct wiring', () => {
    it('provides cookieOptions from config', () => {
      const factory = new ServiceFactory(env, config);
      expect(factory.cookieOptions).toEqual(config.cookie);
    });

    it('creates infrastructure services', () => {
      const factory = new ServiceFactory(env, config);
      expect(factory.logger).toBeDefined();
      expect(factory.timeProvider).toBeDefined();
      expect(factory.passwordHasher).toBeDefined();
    });

    it('creates repositories', () => {
      const factory = new ServiceFactory(env, config);
      expect(factory.userRepository).toBeDefined();
      expect(factory.sessionRepository).toBeDefined();
    });

    it('creates use cases', () => {
      const factory = new ServiceFactory(env, config);
      expect(factory.loginUseCase).toBeDefined();
      expect(factory.registerUseCase).toBeDefined();
      expect(factory.logoutUseCase).toBeDefined();
      expect(factory.getCurrentUserUseCase).toBeDefined();
    });

    it('creates auth handlers', () => {
      const factory = new ServiceFactory(env, config);
      expect(factory.authHandlers).toBeDefined();
    });
  });

  describe('development mode', () => {
    it('creates logger with development environment', () => {
      const devEnv: Env = { ...createMockEnv(), ENVIRONMENT: 'development' };
      const devConfig = createAppConfig(devEnv.ENVIRONMENT);
      const factory = new ServiceFactory(devEnv, devConfig);
      expect(factory.logger).toBeDefined();
    });
  });
});

describe('getServiceFactory', () => {
  afterEach(() => {
    resetServiceFactory();
  });

  it('returns the same factory for the same env', () => {
    const env = createMockEnv();
    const first = getServiceFactory(env);
    const second = getServiceFactory(env);
    expect(first).toBe(second);
  });

  it('returns a new factory after reset', () => {
    const env = createMockEnv();
    const first = getServiceFactory(env);
    resetServiceFactory();
    const second = getServiceFactory(env);
    expect(first).not.toBe(second);
  });
});

describe('resetServiceFactory', () => {
  it('clears the cached factory', () => {
    const env = createMockEnv();
    getServiceFactory(env);
    resetServiceFactory();
    // After reset, a new call should create a new factory
    const factory = getServiceFactory(env);
    expect(factory).toBeDefined();
  });
});

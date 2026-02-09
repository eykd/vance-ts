import { GetCurrentUserUseCase } from '../application/use-cases/GetCurrentUserUseCase';
import { LoginUseCase } from '../application/use-cases/LoginUseCase';
import { LogoutUseCase } from '../application/use-cases/LogoutUseCase';
import { RegisterUseCase } from '../application/use-cases/RegisterUseCase';
import { createAppConfig } from '../config/EnvironmentConfig';
import type { AppConfig } from '../config/EnvironmentConfig';
import type { Logger } from '../domain/interfaces/Logger';
import type { PasswordHasher } from '../domain/interfaces/PasswordHasher';
import type { RateLimiter } from '../domain/interfaces/RateLimiter';
import type { SessionRepository } from '../domain/interfaces/SessionRepository';
import type { TimeProvider } from '../domain/interfaces/TimeProvider';
import type { UserRepository } from '../domain/interfaces/UserRepository';
import { D1UserRepository } from '../infrastructure/repositories/D1UserRepository';
import { KVSessionRepository } from '../infrastructure/repositories/KVSessionRepository';
import { Argon2PasswordHasher } from '../infrastructure/services/Argon2PasswordHasher';
import { ConsoleLogger } from '../infrastructure/services/ConsoleLogger';
import { KVRateLimiter } from '../infrastructure/services/KVRateLimiter';
import { SystemTimeProvider } from '../infrastructure/services/SystemTimeProvider';
import type { CookieOptions } from '../infrastructure/types/CookieOptions';
import type { Env } from '../infrastructure/types/Env';
import { AuthHandlers } from '../presentation/handlers/AuthHandlers';

/**
 * Dependency injection container that lazily creates and caches services.
 *
 * Lives outside all Clean Architecture layers as the composition root.
 * This is the only place allowed to import from all layers.
 */
export class ServiceFactory {
  private readonly env: Env;
  private readonly config: AppConfig;

  private _logger: Logger | null = null;
  private _timeProvider: TimeProvider | null = null;
  private _passwordHasher: PasswordHasher | null = null;
  private _userRepository: UserRepository | null = null;
  private _sessionRepository: SessionRepository | null = null;
  private _rateLimiter: RateLimiter | null = null;
  private _loginUseCase: LoginUseCase | null = null;
  private _registerUseCase: RegisterUseCase | null = null;
  private _logoutUseCase: LogoutUseCase | null = null;
  private _getCurrentUserUseCase: GetCurrentUserUseCase | null = null;
  private _authHandlers: AuthHandlers | null = null;

  /**
   * Creates a new ServiceFactory.
   *
   * @param env - Cloudflare Workers environment bindings
   * @param config - Application configuration
   */
  constructor(env: Env, config: AppConfig) {
    this.env = env;
    this.config = config;
  }

  /**
   * Cookie naming and security options from config.
   *
   * @returns The cookie options
   */
  get cookieOptions(): CookieOptions {
    return this.config.cookie;
  }

  /**
   * Console-based logger.
   *
   * @returns The logger instance
   */
  get logger(): Logger {
    this._logger ??= new ConsoleLogger(this.config.isDevelopment ? 'development' : 'production');
    return this._logger;
  }

  /**
   * System clock time provider.
   *
   * @returns The time provider instance
   */
  get timeProvider(): TimeProvider {
    this._timeProvider ??= new SystemTimeProvider();
    return this._timeProvider;
  }

  /**
   * Argon2id password hasher.
   *
   * @returns The password hasher instance
   */
  get passwordHasher(): PasswordHasher {
    this._passwordHasher ??= new Argon2PasswordHasher();
    return this._passwordHasher;
  }

  /**
   * D1-backed user repository.
   *
   * @returns The user repository instance
   */
  get userRepository(): UserRepository {
    this._userRepository ??= new D1UserRepository(this.env.DB);
    return this._userRepository;
  }

  /**
   * KV-backed session repository.
   *
   * @returns The session repository instance
   */
  get sessionRepository(): SessionRepository {
    this._sessionRepository ??= new KVSessionRepository(this.env.SESSIONS, this.timeProvider);
    return this._sessionRepository;
  }

  /**
   * KV-backed rate limiter.
   *
   * @returns The rate limiter instance
   */
  get rateLimiter(): RateLimiter {
    this._rateLimiter ??= new KVRateLimiter(this.env.RATE_LIMITS, this.logger, this.timeProvider);
    return this._rateLimiter;
  }

  /**
   * Login authentication use case.
   *
   * @returns The login use case instance
   */
  get loginUseCase(): LoginUseCase {
    this._loginUseCase ??= new LoginUseCase(
      this.userRepository,
      this.sessionRepository,
      this.passwordHasher,
      this.timeProvider,
      this.rateLimiter
    );
    return this._loginUseCase;
  }

  /**
   * User registration use case.
   *
   * @returns The register use case instance
   */
  get registerUseCase(): RegisterUseCase {
    this._registerUseCase ??= new RegisterUseCase(
      this.userRepository,
      this.passwordHasher,
      this.timeProvider
    );
    return this._registerUseCase;
  }

  /**
   * Session termination use case.
   *
   * @returns The logout use case instance
   */
  get logoutUseCase(): LogoutUseCase {
    this._logoutUseCase ??= new LogoutUseCase(this.sessionRepository);
    return this._logoutUseCase;
  }

  /**
   * Current user retrieval use case.
   *
   * @returns The get current user use case instance
   */
  get getCurrentUserUseCase(): GetCurrentUserUseCase {
    this._getCurrentUserUseCase ??= new GetCurrentUserUseCase(
      this.userRepository,
      this.sessionRepository,
      this.timeProvider
    );
    return this._getCurrentUserUseCase;
  }

  /**
   * HTTP auth handlers wired with all dependencies.
   *
   * @returns The auth handlers instance
   */
  get authHandlers(): AuthHandlers {
    this._authHandlers ??= new AuthHandlers(
      this.loginUseCase,
      this.registerUseCase,
      this.logoutUseCase,
      this.rateLimiter,
      this.logger,
      this.cookieOptions,
      this.config.loginRateLimit,
      this.config.registerRateLimit
    );
    return this._authHandlers;
  }
}

/** Module-level cached factory for isolate-level reuse. */
let cachedFactory: ServiceFactory | null = null;

/**
 * Returns a cached ServiceFactory for the given environment bindings.
 *
 * Creates a new factory on first call, then returns the cached instance.
 * Use `resetServiceFactory()` to clear the cache (e.g., in tests).
 *
 * @param env - Cloudflare Workers environment bindings
 * @returns The cached ServiceFactory instance
 */
export function getServiceFactory(env: Env): ServiceFactory {
  cachedFactory ??= new ServiceFactory(env, createAppConfig(env.ENVIRONMENT));
  return cachedFactory;
}

/**
 * Clears the cached ServiceFactory.
 *
 * Useful for testing to ensure a fresh factory on each test run.
 */
export function resetServiceFactory(): void {
  cachedFactory = null;
}

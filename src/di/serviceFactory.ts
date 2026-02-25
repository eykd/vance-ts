/**
 * Composition root for the auth feature.
 *
 * Provides lazy-initialized factory instances for all auth dependencies.
 * This is the single place where infrastructure adapters, use cases, and
 * presentation handlers are wired together.
 *
 * Placed at `src/di/` (outside the layer hierarchy) because it imports from
 * both infrastructure and presentation layers — a cross-cutting concern that
 * would violate clean architecture boundaries if placed in either layer.
 *
 * @module
 */

import type { AuthService } from '../application/ports/AuthService';
import type { RateLimiter } from '../application/ports/RateLimiter';
import { SignInUseCase } from '../application/use-cases/SignInUseCase';
import { SignOutUseCase } from '../application/use-cases/SignOutUseCase';
import { SignUpUseCase } from '../application/use-cases/SignUpUseCase';
import { getAuth, resetAuth } from '../infrastructure/auth';
import { BetterAuthService } from '../infrastructure/BetterAuthService';
import { KvRateLimiter } from '../infrastructure/KvRateLimiter';
import { AuthPageHandlers } from '../presentation/handlers/AuthPageHandlers';
import { createRequireAuth } from '../presentation/middleware/requireAuth';
import type { Env } from '../shared/env';

/**
 * Composition root that lazily wires auth dependencies.
 *
 * Each getter returns the same instance on repeated calls (lazy singleton
 * per factory instance). The module-level {@link getServiceFactory} ensures
 * one factory per isolate lifetime.
 */
export class ServiceFactory {
  /** Cloudflare Workers environment bindings. */
  private readonly env: Env;

  /** better-auth instance, initialised in constructor to validate the secret. */
  private readonly _authInstance: ReturnType<typeof getAuth>;

  /** Validated secret extracted after getAuth confirms it is a non-empty string. */
  private readonly _validatedSecret: string;

  /** Cached AuthService adapter. */
  private _authService: AuthService | null = null;

  /** Cached RateLimiter adapter. */
  private _rateLimiter: RateLimiter | null = null;

  /** Cached SignInUseCase. */
  private _signInUseCase: SignInUseCase | null = null;

  /** Cached SignUpUseCase. */
  private _signUpUseCase: SignUpUseCase | null = null;

  /** Cached SignOutUseCase. */
  private _signOutUseCase: SignOutUseCase | null = null;

  /** Cached AuthPageHandlers. */
  private _authPageHandlers: AuthPageHandlers | null = null;

  /** Cached requireAuth middleware. */
  private _requireAuthMiddleware: ReturnType<typeof createRequireAuth> | null = null;

  /**
   * Creates a new ServiceFactory and initialises the better-auth instance.
   *
   * @param env - Cloudflare Workers environment bindings.
   * @throws {Error} When `BETTER_AUTH_SECRET` is shorter than 32 characters.
   */
  constructor(env: Env) {
    this.env = env;
    this._authInstance = getAuth(env); // validates BETTER_AUTH_SECRET, throws if invalid
    this._validatedSecret = env.BETTER_AUTH_SECRET as string; // safe: getAuth validated above
  }

  private get _authServiceInstance(): AuthService {
    this._authService ??= new BetterAuthService(this._authInstance);
    return this._authService;
  }

  private get _rateLimiterInstance(): RateLimiter {
    this._rateLimiter ??= new KvRateLimiter(this.env.RATE_LIMIT);
    return this._rateLimiter;
  }

  /**
   * The AuthService port adapter (BetterAuthService).
   *
   * @returns The lazily-initialised AuthService instance.
   */
  get authService(): AuthService {
    return this._authServiceInstance;
  }

  /**
   * The sign-in use case orchestrator.
   *
   * @returns The lazily-initialised SignInUseCase instance.
   */
  get signInUseCase(): SignInUseCase {
    this._signInUseCase ??= new SignInUseCase(this._authServiceInstance, this._rateLimiterInstance);
    return this._signInUseCase;
  }

  /**
   * The sign-up use case orchestrator.
   *
   * @returns The lazily-initialised SignUpUseCase instance.
   */
  get signUpUseCase(): SignUpUseCase {
    this._signUpUseCase ??= new SignUpUseCase(this._authServiceInstance, this._rateLimiterInstance);
    return this._signUpUseCase;
  }

  /**
   * The sign-out use case orchestrator.
   *
   * @returns The lazily-initialised SignOutUseCase instance.
   */
  get signOutUseCase(): SignOutUseCase {
    this._signOutUseCase ??= new SignOutUseCase(this._authServiceInstance);
    return this._signOutUseCase;
  }

  /**
   * Hono middleware that guards routes behind session authentication.
   *
   * Pre-injects the AuthService and BETTER_AUTH_SECRET so that `worker.ts`
   * only needs: `app.use('/app/*', (c, next) => factory.requireAuthMiddleware(c, next))`.
   *
   * Lazily created and cached on first access (same pattern as other singletons
   * in this factory) to avoid re-allocating the closure on every request.
   *
   * @returns A Hono middleware function created by {@link createRequireAuth}.
   */
  get requireAuthMiddleware(): ReturnType<typeof createRequireAuth> {
    this._requireAuthMiddleware ??= createRequireAuth(
      this._authServiceInstance,
      this._validatedSecret
    );
    return this._requireAuthMiddleware;
  }

  /**
   * HTML auth page handlers for sign-in and sign-up form rendering and submission.
   *
   * @returns The lazily-initialised AuthPageHandlers instance.
   */
  get authPageHandlers(): AuthPageHandlers {
    this._authPageHandlers ??= new AuthPageHandlers(
      this.signInUseCase,
      this.signUpUseCase,
      this.signOutUseCase
    );
    return this._authPageHandlers;
  }

  /**
   * better-auth HTTP handler for `/api/auth/*` delegation.
   *
   * Returns a function rather than calling the handler directly, so
   * `worker.ts` can invoke it without importing from `infrastructure/auth`.
   *
   * @returns A function that delegates a Request to the better-auth handler.
   */
  get authHandler(): (req: Request) => Promise<Response> {
    return (req: Request): Promise<Response> => this._authInstance.handler(req);
  }
}

/** Module-level singleton for the isolate lifetime. */
let _factory: ServiceFactory | null = null;

/**
 * Returns the singleton ServiceFactory for the given Cloudflare Workers env.
 *
 * Creates the factory on first call; returns the cached instance on subsequent
 * calls regardless of the env argument (isolate-scoped singleton).
 *
 * @param env - Cloudflare Workers environment bindings.
 * @returns The singleton ServiceFactory.
 */
export function getServiceFactory(env: Env): ServiceFactory {
  _factory ??= new ServiceFactory(env);
  return _factory;
}

/**
 * Resets the singleton ServiceFactory and the cached better-auth instance.
 *
 * Call in `afterEach`/`afterAll` test hooks to ensure test isolation between
 * tests that exercise auth or the composition root.
 */
export function resetServiceFactory(): void {
  _factory = null;
  resetAuth();
}

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
import type { Logger } from '../application/ports/Logger';
import type { RateLimiter } from '../application/ports/RateLimiter';
import { REGISTER_WINDOW_SECONDS, SIGN_IN_WINDOW_SECONDS } from '../application/ports/RateLimiter';
import { ActivateActionUseCase } from '../application/use-cases/ActivateActionUseCase';
import { CaptureInboxItemUseCase } from '../application/use-cases/CaptureInboxItemUseCase';
import { ClarifyInboxItemToActionUseCase } from '../application/use-cases/ClarifyInboxItemToActionUseCase';
import { CompleteActionUseCase } from '../application/use-cases/CompleteActionUseCase';
import { ListActionsUseCase } from '../application/use-cases/ListActionsUseCase';
import { ListAreasUseCase } from '../application/use-cases/ListAreasUseCase';
import { ListContextsUseCase } from '../application/use-cases/ListContextsUseCase';
import { ListInboxItemsUseCase } from '../application/use-cases/ListInboxItemsUseCase';
import { ProvisionWorkspaceUseCase } from '../application/use-cases/ProvisionWorkspaceUseCase';
import { RequestPasswordResetUseCase } from '../application/use-cases/RequestPasswordResetUseCase';
import { ResetPasswordUseCase } from '../application/use-cases/ResetPasswordUseCase';
import { SignInUseCase } from '../application/use-cases/SignInUseCase';
import { SignOutUseCase } from '../application/use-cases/SignOutUseCase';
import { SignUpUseCase } from '../application/use-cases/SignUpUseCase';
import type { ActionRepository } from '../domain/interfaces/ActionRepository';
import type { ActorRepository } from '../domain/interfaces/ActorRepository';
import type { AreaRepository } from '../domain/interfaces/AreaRepository';
import type { AuditEventRepository } from '../domain/interfaces/AuditEventRepository';
import type { ContextRepository } from '../domain/interfaces/ContextRepository';
import type { InboxItemRepository } from '../domain/interfaces/InboxItemRepository';
import type { WorkspaceRepository } from '../domain/interfaces/WorkspaceRepository';
import { getAuth, resetAuth } from '../infrastructure/auth';
import {
  getAuthIndicatorCookieName,
  getCsrfCookieName,
  getSessionCookieName,
} from '../infrastructure/authCookieNames';
import { BetterAuthService } from '../infrastructure/BetterAuthService';
import { ClarifyInboxItemD1BatchAdapter } from '../infrastructure/ClarifyInboxItemD1BatchAdapter';
import { ConsoleLogger } from '../infrastructure/ConsoleLogger';
import { DurableObjectRateLimiter } from '../infrastructure/DurableObjectRateLimiter';
import { D1ActionRepository } from '../infrastructure/repositories/D1ActionRepository';
import { D1ActorRepository } from '../infrastructure/repositories/D1ActorRepository';
import { D1AreaRepository } from '../infrastructure/repositories/D1AreaRepository';
import { D1AuditEventRepository } from '../infrastructure/repositories/D1AuditEventRepository';
import { D1ContextRepository } from '../infrastructure/repositories/D1ContextRepository';
import { D1InboxItemRepository } from '../infrastructure/repositories/D1InboxItemRepository';
import { D1WorkspaceRepository } from '../infrastructure/repositories/D1WorkspaceRepository';
import { WorkspaceD1BatchAdapter } from '../infrastructure/WorkspaceD1BatchAdapter';
import { createActionApiHandlers } from '../presentation/handlers/ActionApiHandlers';
import { AppPageHandlers } from '../presentation/handlers/AppPageHandlers';
import { AppPartialHandlers } from '../presentation/handlers/AppPartialHandlers';
import { createAreaApiHandlers } from '../presentation/handlers/AreaApiHandlers';
import { AuthPageHandlers } from '../presentation/handlers/AuthPageHandlers';
import { createContextApiHandlers } from '../presentation/handlers/ContextApiHandlers';
import { createInboxItemApiHandlers } from '../presentation/handlers/InboxItemApiHandlers';
import { createApiAuthRateLimit } from '../presentation/middleware/apiAuthRateLimit';
import { createRequireApiAuth } from '../presentation/middleware/requireApiAuth';
import { createRequireAuth } from '../presentation/middleware/requireAuth';
import { createRequireWorkspace } from '../presentation/middleware/requireWorkspace';
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

  /** Session cookie name derived from BETTER_AUTH_URL. */
  private readonly _sessionCookieName: string;

  /** CSRF cookie name derived from BETTER_AUTH_URL. */
  private readonly _csrfCookieName: string;

  /** Auth indicator cookie name derived from BETTER_AUTH_URL. */
  private readonly _authIndicatorCookieName: string;

  /** Cached AuthService adapter. */
  private _authService: AuthService | null = null;

  /** Cached Logger adapter. */
  private _logger: Logger | null = null;

  /** Cached RateLimiter adapter. */
  private _rateLimiter: RateLimiter | null = null;

  /** Cached SignInUseCase. */
  private _signInUseCase: SignInUseCase | null = null;

  /** Cached SignUpUseCase. */
  private _signUpUseCase: SignUpUseCase | null = null;

  /** Cached SignOutUseCase. */
  private _signOutUseCase: SignOutUseCase | null = null;

  /** Cached RequestPasswordResetUseCase. */
  private _requestPasswordResetUseCase: RequestPasswordResetUseCase | null = null;

  /** Cached ResetPasswordUseCase. */
  private _resetPasswordUseCase: ResetPasswordUseCase | null = null;

  /** Cached AuthPageHandlers. */
  private _authPageHandlers: AuthPageHandlers | null = null;

  /** Cached requireAuth middleware. */
  private _requireAuthMiddleware: ReturnType<typeof createRequireAuth> | null = null;

  /** Cached API rate limit middleware for POST /api/auth/sign-in/*. */
  private _signInApiRateLimitMiddleware: ReturnType<typeof createApiAuthRateLimit> | null = null;

  /** Cached API rate limit middleware for POST /api/auth/sign-up/*. */
  private _signUpApiRateLimitMiddleware: ReturnType<typeof createApiAuthRateLimit> | null = null;

  /** Cached WorkspaceRepository adapter. */
  private _workspaceRepository: WorkspaceRepository | null = null;

  /** Cached ActorRepository adapter. */
  private _actorRepository: ActorRepository | null = null;

  /** Cached AreaRepository adapter. */
  private _areaRepository: AreaRepository | null = null;

  /** Cached ContextRepository adapter. */
  private _contextRepository: ContextRepository | null = null;

  /** Cached AuditEventRepository adapter. */
  private _auditEventRepository: AuditEventRepository | null = null;

  /** Cached ListAreasUseCase. */
  private _listAreasUseCase: ListAreasUseCase | null = null;

  /** Cached ListContextsUseCase. */
  private _listContextsUseCase: ListContextsUseCase | null = null;

  /** Cached ProvisionWorkspaceUseCase. */
  private _provisionWorkspaceUseCase: ProvisionWorkspaceUseCase | null = null;

  /** Cached requireApiAuth middleware. */
  private _requireApiAuthMiddleware: ReturnType<typeof createRequireApiAuth> | null = null;

  /** Cached area API handlers. */
  private _areaApiHandlers: ReturnType<typeof createAreaApiHandlers> | null = null;

  /** Cached context API handlers. */
  private _contextApiHandlers: ReturnType<typeof createContextApiHandlers> | null = null;

  /** Cached InboxItemRepository adapter. */
  private _inboxItemRepository: InboxItemRepository | null = null;

  /** Cached CaptureInboxItemUseCase. */
  private _captureInboxItemUseCase: CaptureInboxItemUseCase | null = null;

  /** Cached ListInboxItemsUseCase. */
  private _listInboxItemsUseCase: ListInboxItemsUseCase | null = null;

  /** Cached inbox item API handlers. */
  private _inboxItemApiHandlers: ReturnType<typeof createInboxItemApiHandlers> | null = null;

  /** Cached ActionRepository adapter. */
  private _actionRepository: ActionRepository | null = null;

  /** Cached ClarifyInboxItemToActionUseCase. */
  private _clarifyInboxItemToActionUseCase: ClarifyInboxItemToActionUseCase | null = null;

  /** Cached ActivateActionUseCase. */
  private _activateActionUseCase: ActivateActionUseCase | null = null;

  /** Cached CompleteActionUseCase. */
  private _completeActionUseCase: CompleteActionUseCase | null = null;

  /** Cached ListActionsUseCase. */
  private _listActionsUseCase: ListActionsUseCase | null = null;

  /** Cached action API handlers. */
  private _actionApiHandlers: ReturnType<typeof createActionApiHandlers> | null = null;

  /** Cached requireWorkspace middleware. */
  private _requireWorkspaceMiddleware: ReturnType<typeof createRequireWorkspace> | null = null;

  /** Cached AppPageHandlers. */
  private _appPageHandlers: AppPageHandlers | null = null;

  /** Cached AppPartialHandlers. */
  private _appPartialHandlers: AppPartialHandlers | null = null;

  /**
   * Creates a new ServiceFactory and initialises the better-auth instance.
   *
   * @param env - Cloudflare Workers environment bindings.
   * @throws {Error} When `BETTER_AUTH_SECRET` is shorter than 32 characters.
   */
  constructor(env: Env) {
    this.env = env;
    this._authInstance = getAuth(env); // validates BETTER_AUTH_SECRET, throws if invalid
    this._validatedSecret = env.BETTER_AUTH_SECRET;
    this._sessionCookieName = getSessionCookieName(env.BETTER_AUTH_URL);
    this._csrfCookieName = getCsrfCookieName(env.BETTER_AUTH_URL);
    this._authIndicatorCookieName = getAuthIndicatorCookieName(env.BETTER_AUTH_URL);
  }

  /**
   * Lazily initialises and returns the AuthService implementation.
   *
   * @returns The lazily-initialised BetterAuthService instance.
   */
  private get _authServiceInstance(): AuthService {
    this._authService ??= new BetterAuthService(
      this._authInstance,
      this._sessionCookieName,
      this._loggerInstance
    );
    return this._authService;
  }

  /**
   * Lazily initialises and returns the Logger implementation.
   *
   * @returns The lazily-initialised ConsoleLogger instance.
   */
  private get _loggerInstance(): Logger {
    this._logger ??= new ConsoleLogger();
    return this._logger;
  }

  /**
   * Lazily initialises and returns the RateLimiter implementation.
   *
   * @returns The lazily-initialised DurableObjectRateLimiter instance.
   */
  private get _rateLimiterInstance(): RateLimiter {
    this._rateLimiter ??= new DurableObjectRateLimiter(this.env.RATE_LIMIT);
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
   * The Logger port adapter (ConsoleLogger).
   *
   * @returns The lazily-initialised Logger instance.
   */
  get logger(): Logger {
    return this._loggerInstance;
  }

  /**
   * The sign-in use case orchestrator.
   *
   * @returns The lazily-initialised SignInUseCase instance.
   */
  get signInUseCase(): SignInUseCase {
    this._signInUseCase ??= new SignInUseCase(
      this._authServiceInstance,
      this._rateLimiterInstance,
      this._loggerInstance
    );
    return this._signInUseCase;
  }

  /**
   * The sign-up use case orchestrator.
   *
   * @returns The lazily-initialised SignUpUseCase instance.
   */
  get signUpUseCase(): SignUpUseCase {
    this._signUpUseCase ??= new SignUpUseCase(
      this._authServiceInstance,
      this._rateLimiterInstance,
      this._loggerInstance
    );
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
   * The request-password-reset use case orchestrator.
   *
   * @returns The lazily-initialised RequestPasswordResetUseCase instance.
   */
  get requestPasswordResetUseCase(): RequestPasswordResetUseCase {
    this._requestPasswordResetUseCase ??= new RequestPasswordResetUseCase(
      this._authServiceInstance,
      this._rateLimiterInstance,
      this._loggerInstance
    );
    return this._requestPasswordResetUseCase;
  }

  /**
   * The reset-password use case orchestrator.
   *
   * @returns The lazily-initialised ResetPasswordUseCase instance.
   */
  get resetPasswordUseCase(): ResetPasswordUseCase {
    this._resetPasswordUseCase ??= new ResetPasswordUseCase(
      this._authServiceInstance,
      this._loggerInstance
    );
    return this._resetPasswordUseCase;
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
      this._validatedSecret,
      this._sessionCookieName,
      this._csrfCookieName,
      this._authIndicatorCookieName
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
      this.signOutUseCase,
      this.requestPasswordResetUseCase,
      this.resetPasswordUseCase,
      this._sessionCookieName,
      this._csrfCookieName,
      this._authIndicatorCookieName
    );
    return this._authPageHandlers;
  }

  /**
   * Rate limit middleware for `POST /api/auth/sign-in/*` API endpoints.
   *
   * Applies the DurableObjectRateLimiter using the same key format as
   * {@link SignInUseCase} (`ratelimit:sign-in:<ip>`), so API and form-based
   * attack vectors share a single counter per IP.
   *
   * @returns The lazily-initialised rate limit middleware for sign-in.
   */
  get signInApiRateLimitMiddleware(): ReturnType<typeof createApiAuthRateLimit> {
    this._signInApiRateLimitMiddleware ??= createApiAuthRateLimit(
      this._rateLimiterInstance,
      'sign-in',
      SIGN_IN_WINDOW_SECONDS
    );
    return this._signInApiRateLimitMiddleware;
  }

  /**
   * Rate limit middleware for `POST /api/auth/sign-up/*` API endpoints.
   *
   * Applies the DurableObjectRateLimiter using the same key format as
   * {@link SignUpUseCase} (`ratelimit:register:<ip>`), so API and form-based
   * attack vectors share a single counter per IP.
   *
   * @returns The lazily-initialised rate limit middleware for sign-up.
   */
  get signUpApiRateLimitMiddleware(): ReturnType<typeof createApiAuthRateLimit> {
    this._signUpApiRateLimitMiddleware ??= createApiAuthRateLimit(
      this._rateLimiterInstance,
      'register',
      REGISTER_WINDOW_SECONDS
    );
    return this._signUpApiRateLimitMiddleware;
  }

  /**
   * The D1-backed WorkspaceRepository implementation.
   *
   * @returns The lazily-initialised WorkspaceRepository instance.
   */
  get workspaceRepository(): WorkspaceRepository {
    this._workspaceRepository ??= new D1WorkspaceRepository(this.env.DB);
    return this._workspaceRepository;
  }

  /**
   * The D1-backed ActorRepository implementation.
   *
   * @returns The lazily-initialised ActorRepository instance.
   */
  get actorRepository(): ActorRepository {
    this._actorRepository ??= new D1ActorRepository(this.env.DB);
    return this._actorRepository;
  }

  /**
   * The D1-backed AreaRepository implementation.
   *
   * @returns The lazily-initialised AreaRepository instance.
   */
  get areaRepository(): AreaRepository {
    this._areaRepository ??= new D1AreaRepository(this.env.DB);
    return this._areaRepository;
  }

  /**
   * The D1-backed ContextRepository implementation.
   *
   * @returns The lazily-initialised ContextRepository instance.
   */
  get contextRepository(): ContextRepository {
    this._contextRepository ??= new D1ContextRepository(this.env.DB);
    return this._contextRepository;
  }

  /**
   * The D1-backed AuditEventRepository implementation.
   *
   * @returns The lazily-initialised AuditEventRepository instance.
   */
  get auditEventRepository(): AuditEventRepository {
    this._auditEventRepository ??= new D1AuditEventRepository(this.env.DB);
    return this._auditEventRepository;
  }

  /**
   * The list-areas use case orchestrator.
   *
   * @returns The lazily-initialised ListAreasUseCase instance.
   */
  get listAreasUseCase(): ListAreasUseCase {
    this._listAreasUseCase ??= new ListAreasUseCase(this.areaRepository);
    return this._listAreasUseCase;
  }

  /**
   * The list-contexts use case orchestrator.
   *
   * @returns The lazily-initialised ListContextsUseCase instance.
   */
  get listContextsUseCase(): ListContextsUseCase {
    this._listContextsUseCase ??= new ListContextsUseCase(this.contextRepository);
    return this._listContextsUseCase;
  }

  /**
   * The provision-workspace use case orchestrator.
   *
   * @returns The lazily-initialised ProvisionWorkspaceUseCase instance.
   */
  get provisionWorkspaceUseCase(): ProvisionWorkspaceUseCase {
    this._provisionWorkspaceUseCase ??= new ProvisionWorkspaceUseCase(
      new WorkspaceD1BatchAdapter(this.env.DB)
    );
    return this._provisionWorkspaceUseCase;
  }

  /**
   * Hono middleware that guards `/api/v1/*` routes behind session authentication
   * and workspace resolution.
   *
   * Returns JSON 401 for unauthenticated requests, JSON 503 on infrastructure
   * errors, and populates `c.var.user`, `c.var.session`, and `c.var.workspaceId`
   * on success.
   *
   * @returns A Hono middleware function created by {@link createRequireApiAuth}.
   */
  get requireApiAuthMiddleware(): ReturnType<typeof createRequireApiAuth> {
    this._requireApiAuthMiddleware ??= createRequireApiAuth(
      this._authServiceInstance,
      this.workspaceRepository,
      this._sessionCookieName
    );
    return this._requireApiAuthMiddleware;
  }

  /**
   * JSON API handlers for the Areas resource.
   *
   * @returns The lazily-initialised area API handlers object.
   */
  get areaApiHandlers(): ReturnType<typeof createAreaApiHandlers> {
    this._areaApiHandlers ??= createAreaApiHandlers(this.listAreasUseCase);
    return this._areaApiHandlers;
  }

  /**
   * JSON API handlers for the Contexts resource.
   *
   * @returns The lazily-initialised context API handlers object.
   */
  get contextApiHandlers(): ReturnType<typeof createContextApiHandlers> {
    this._contextApiHandlers ??= createContextApiHandlers(this.listContextsUseCase);
    return this._contextApiHandlers;
  }

  /**
   * The D1-backed InboxItemRepository implementation.
   *
   * @returns The lazily-initialised InboxItemRepository instance.
   */
  get inboxItemRepository(): InboxItemRepository {
    this._inboxItemRepository ??= new D1InboxItemRepository(this.env.DB);
    return this._inboxItemRepository;
  }

  /**
   * The capture-inbox-item use case orchestrator.
   *
   * @returns The lazily-initialised CaptureInboxItemUseCase instance.
   */
  get captureInboxItemUseCase(): CaptureInboxItemUseCase {
    this._captureInboxItemUseCase ??= new CaptureInboxItemUseCase(
      this.inboxItemRepository,
      this.auditEventRepository
    );
    return this._captureInboxItemUseCase;
  }

  /**
   * The list-inbox-items use case orchestrator.
   *
   * @returns The lazily-initialised ListInboxItemsUseCase instance.
   */
  get listInboxItemsUseCase(): ListInboxItemsUseCase {
    this._listInboxItemsUseCase ??= new ListInboxItemsUseCase(this.inboxItemRepository);
    return this._listInboxItemsUseCase;
  }

  /**
   * JSON API handlers for the Inbox resource.
   *
   * @returns The lazily-initialised inbox item API handlers object.
   */
  get inboxItemApiHandlers(): ReturnType<typeof createInboxItemApiHandlers> {
    this._inboxItemApiHandlers ??= createInboxItemApiHandlers(
      this.captureInboxItemUseCase,
      this.listInboxItemsUseCase
    );
    return this._inboxItemApiHandlers;
  }

  /**
   * The D1-backed ActionRepository implementation.
   *
   * @returns The lazily-initialised ActionRepository instance.
   */
  get actionRepository(): ActionRepository {
    this._actionRepository ??= new D1ActionRepository(this.env.DB);
    return this._actionRepository;
  }

  /**
   * The clarify-inbox-item-to-action use case orchestrator.
   *
   * @returns The lazily-initialised ClarifyInboxItemToActionUseCase instance.
   */
  get clarifyInboxItemToActionUseCase(): ClarifyInboxItemToActionUseCase {
    this._clarifyInboxItemToActionUseCase ??= new ClarifyInboxItemToActionUseCase(
      this.inboxItemRepository,
      new ClarifyInboxItemD1BatchAdapter(this.env.DB),
      this.areaRepository,
      this.contextRepository
    );
    return this._clarifyInboxItemToActionUseCase;
  }

  /**
   * The activate-action use case orchestrator.
   *
   * @returns The lazily-initialised ActivateActionUseCase instance.
   */
  get activateActionUseCase(): ActivateActionUseCase {
    this._activateActionUseCase ??= new ActivateActionUseCase(
      this.actionRepository,
      this.auditEventRepository
    );
    return this._activateActionUseCase;
  }

  /**
   * The complete-action use case orchestrator.
   *
   * @returns The lazily-initialised CompleteActionUseCase instance.
   */
  get completeActionUseCase(): CompleteActionUseCase {
    this._completeActionUseCase ??= new CompleteActionUseCase(
      this.actionRepository,
      this.auditEventRepository
    );
    return this._completeActionUseCase;
  }

  /**
   * The list-actions use case orchestrator.
   *
   * @returns The lazily-initialised ListActionsUseCase instance.
   */
  get listActionsUseCase(): ListActionsUseCase {
    this._listActionsUseCase ??= new ListActionsUseCase(this.actionRepository);
    return this._listActionsUseCase;
  }

  /**
   * JSON API handlers for the Actions resource.
   *
   * @returns The lazily-initialised action API handlers object.
   */
  get actionApiHandlers(): ReturnType<typeof createActionApiHandlers> {
    this._actionApiHandlers ??= createActionApiHandlers(
      this.clarifyInboxItemToActionUseCase,
      this.activateActionUseCase,
      this.completeActionUseCase,
      this.listActionsUseCase
    );
    return this._actionApiHandlers;
  }

  /**
   * Hono middleware that guards `/api/v1/*` and `/app/*` routes behind workspace resolution.
   *
   * Returns JSON 503 when the workspace or human actor is missing (provisioning failure).
   * Sets `c.var.workspaceId` and `c.var.actorId` on success.
   *
   * Must be registered after `requireAuth` or `requireApiAuth`.
   *
   * @returns A Hono middleware function created by {@link createRequireWorkspace}.
   */
  get requireWorkspaceMiddleware(): ReturnType<typeof createRequireWorkspace> {
    this._requireWorkspaceMiddleware ??= createRequireWorkspace(
      this.workspaceRepository,
      this.actorRepository
    );
    return this._requireWorkspaceMiddleware;
  }

  /**
   * HTML page handlers for authenticated application pages (dashboard, inbox, actions).
   *
   * @returns The lazily-initialised AppPageHandlers instance.
   */
  get appPageHandlers(): AppPageHandlers {
    this._appPageHandlers ??= new AppPageHandlers(
      this.listInboxItemsUseCase,
      this.listActionsUseCase
    );
    return this._appPageHandlers;
  }

  /**
   * HTMX partial handlers for application interactions (capture, clarify, activate, complete).
   *
   * @returns The lazily-initialised AppPartialHandlers instance.
   */
  get appPartialHandlers(): AppPartialHandlers {
    this._appPartialHandlers ??= new AppPartialHandlers(
      this.captureInboxItemUseCase,
      this.clarifyInboxItemToActionUseCase,
      this.activateActionUseCase,
      this.completeActionUseCase
    );
    return this._appPartialHandlers;
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

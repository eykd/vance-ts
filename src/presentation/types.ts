import type { AuthSessionDto, AuthUserDto } from '../domain/interfaces/AuthService';
import type { Env } from '../shared/env';

/**
 * Hono environment type for this application.
 *
 * Centralised here to avoid circular imports: presentation-layer middleware
 * (e.g. requireAuth) imports AppEnv from this file rather than from
 * ../../worker, which would create a dependency cycle.
 */
export interface AppEnv {
  /** Cloudflare Workers environment bindings (D1, KV, secrets, etc.). */
  Bindings: Env;

  /** Per-request variables set by Hono middleware. */
  Variables: {
    /** The authenticated user, populated by requireAuth or requireApiAuth middleware. */
    user: AuthUserDto;

    /** The active session, populated by requireAuth or requireApiAuth middleware. */
    session: AuthSessionDto;

    /** Session-bound CSRF token derived via HMAC-SHA256, set by requireAuth. */
    csrfToken: string;

    /**
     * The authenticated user's workspace ID, populated by requireWorkspace middleware.
     */
    workspaceId: string;

    /**
     * The human actor ID for the authenticated user's workspace, populated by
     * requireWorkspace middleware.
     */
    actorId: string;
  };
}

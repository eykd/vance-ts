import type { CsrfToken } from '../../domain/value-objects/CsrfToken';
import type { SessionId } from '../../domain/value-objects/SessionId';
import type { UserId } from '../../domain/value-objects/UserId';

/**
 * Result DTO returned after successful authentication.
 *
 * The presentation layer MUST apply the following cookie security attributes
 * when setting the session cookie from the `sessionId` field:
 *
 * ```
 * Set-Cookie: __Host-sessionId=${sessionId.toString()}; HttpOnly; Secure; SameSite=Lax; Path=/
 * ```
 *
 * - `__Host-` prefix: Binds cookie to the secure origin, preventing subdomain attacks
 * - `HttpOnly`: Prevents JavaScript access (mitigates XSS cookie theft)
 * - `Secure`: Cookie only sent over HTTPS
 * - `SameSite=Lax`: Prevents cross-site request forgery for state-changing requests
 * - `Path=/`: Required by the `__Host-` prefix
 */
export interface AuthResult {
  /** Unique identifier of the authenticated user. */
  readonly userId: UserId;

  /**
   * Session identifier to be set as a secure HTTP-only cookie.
   *
   * @see AuthResult (interface-level docs) for required cookie attributes.
   */
  readonly sessionId: SessionId;

  /** CSRF protection token to include in subsequent state-changing requests. */
  readonly csrfToken: CsrfToken;

  /** Validated relative URL to redirect the user to after login. */
  readonly redirectTo: string;
}

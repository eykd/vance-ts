import { Session } from '../../domain/entities/Session';
import { CsrfToken } from '../../domain/value-objects/CsrfToken';
import { SessionId } from '../../domain/value-objects/SessionId';
import { UserId } from '../../domain/value-objects/UserId';

/**
 * Fluent builder for creating Session entity test instances.
 *
 * Provides sensible defaults and chainable methods for overriding specific
 * properties. Each call to build() returns a new Session entity.
 *
 * @example
 * ```typescript
 * const session = new SessionBuilder()
 *   .withSessionId('550e8400-e29b-41d4-a716-446655440000')
 *   .withUserId('user-456')
 *   .expired()
 *   .build();
 * ```
 */
export class SessionBuilder {
  private sessionId = '00000000-0000-4000-a000-000000000001';
  private userId = '00000000-0000-4000-a000-000000000001';
  private csrfToken = 'a'.repeat(64);
  private expiresAt = '2025-12-31T23:59:59.000Z';
  private lastActivityAt = '2025-01-15T00:00:00.000Z';
  private ipAddress = '127.0.0.1';
  private userAgent = 'Mozilla/5.0 (compatible; TestAgent/1.0)';
  private createdAt = '2025-01-15T00:00:00.000Z';

  /**
   * Sets the session ID (must be a valid UUID).
   *
   * @param sessionId - The session ID to set
   * @returns This builder for chaining
   */
  withSessionId(sessionId: string): this {
    this.sessionId = sessionId;
    return this;
  }

  /**
   * Sets the user ID associated with this session.
   *
   * @param userId - The user ID to set
   * @returns This builder for chaining
   */
  withUserId(userId: string): this {
    this.userId = userId;
    return this;
  }

  /**
   * Sets the CSRF token (must be a 64-character lowercase hex string).
   *
   * @param csrfToken - The CSRF token to set
   * @returns This builder for chaining
   */
  withCsrfToken(csrfToken: string): this {
    this.csrfToken = csrfToken;
    return this;
  }

  /**
   * Sets the session expiry to a specific timestamp.
   *
   * @param expiresAt - UTC ISO 8601 timestamp for session expiry
   * @returns This builder for chaining
   */
  withExpiry(expiresAt: string): this {
    this.expiresAt = expiresAt;
    return this;
  }

  /**
   * Sets the session expiry to a past date, making the session expired.
   *
   * @returns This builder for chaining
   */
  expired(): this {
    this.expiresAt = '2024-01-01T00:00:00.000Z';
    return this;
  }

  /**
   * Sets the last activity timestamp for this session.
   *
   * @param lastActivityAt - UTC ISO 8601 timestamp for last activity
   * @returns This builder for chaining
   */
  withLastActivity(lastActivityAt: string): this {
    this.lastActivityAt = lastActivityAt;
    return this;
  }

  /**
   * Sets the IP address for this session.
   *
   * @param ipAddress - The IP address to set
   * @returns This builder for chaining
   */
  withIpAddress(ipAddress: string): this {
    this.ipAddress = ipAddress;
    return this;
  }

  /**
   * Sets the user agent for this session.
   *
   * @param userAgent - The user agent string to set
   * @returns This builder for chaining
   */
  withUserAgent(userAgent: string): this {
    this.userAgent = userAgent;
    return this;
  }

  /**
   * Builds and returns a new Session entity with current settings.
   *
   * @returns A Session entity instance
   */
  build(): Session {
    const sessionIdVo = SessionId.fromString(this.sessionId);
    const csrfTokenVo = CsrfToken.fromString(this.csrfToken);

    return Session.reconstitute({
      sessionId: sessionIdVo,
      userId: UserId.fromString(this.userId),
      csrfToken: csrfTokenVo,
      expiresAt: this.expiresAt,
      lastActivityAt: this.lastActivityAt,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      createdAt: this.createdAt,
    });
  }
}

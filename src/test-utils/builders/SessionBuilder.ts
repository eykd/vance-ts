/**
 * Shape of a Session data object for testing purposes.
 *
 * Matches the expected Session entity structure before the entity is implemented.
 * All timestamps are in UTC ISO 8601 format.
 */
export interface SessionProps {
  /** Unique session identifier. */
  readonly sessionId: string;
  /** ID of the user who owns this session. */
  readonly userId: string;
  /** CSRF protection token for this session. */
  readonly csrfToken: string;
  /** UTC ISO 8601 timestamp when the session expires. */
  readonly expiresAt: string;
  /** UTC ISO 8601 timestamp of the last activity in this session. */
  readonly lastActivityAt: string;
  /** IP address from which the session was created. */
  readonly ipAddress: string;
  /** User agent string from the session's originating request. */
  readonly userAgent: string;
  /** UTC ISO 8601 timestamp when the session was created. */
  readonly createdAt: string;
}

/**
 * Fluent builder for creating Session test data objects.
 *
 * Provides sensible defaults and chainable methods for overriding specific
 * properties. Each call to build() returns a new object.
 *
 * @example
 * ```typescript
 * const session = new SessionBuilder()
 *   .withSessionId('sess-123')
 *   .withUserId('user-456')
 *   .expired()
 *   .build();
 * ```
 */
export class SessionBuilder {
  private sessionId = 'session-default-id';
  private userId = 'user-default-id';
  private csrfToken = 'csrf-default-token';
  private expiresAt = '2025-12-31T23:59:59.000Z';
  private lastActivityAt = '2025-01-15T00:00:00.000Z';
  private ipAddress = '127.0.0.1';
  private userAgent = 'Mozilla/5.0 (compatible; TestAgent/1.0)';
  private createdAt = '2025-01-15T00:00:00.000Z';

  /**
   * Sets the session ID.
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
   * Sets the CSRF token for this session.
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
   * Builds and returns a new SessionProps object with current settings.
   *
   * @returns A frozen SessionProps object
   */
  build(): SessionProps {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      csrfToken: this.csrfToken,
      expiresAt: this.expiresAt,
      lastActivityAt: this.lastActivityAt,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      createdAt: this.createdAt,
    };
  }
}

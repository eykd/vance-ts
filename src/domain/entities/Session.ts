import type { CsrfToken } from '../value-objects/CsrfToken';
import type { SessionId } from '../value-objects/SessionId';
import type { UserId } from '../value-objects/UserId';

interface SessionProps {
  readonly sessionId: SessionId;
  readonly userId: UserId;
  readonly csrfToken: CsrfToken;
  readonly expiresAt: string;
  readonly lastActivityAt: string;
  readonly ipAddress: string;
  readonly userAgent: string;
  readonly createdAt: string;
}

/**
 * Entity representing an authenticated user session.
 *
 * Tracks session expiry, activity, and CSRF token validation.
 * All mutations return a new Session instance (immutable).
 */
export class Session {
  /** Session duration in milliseconds (24 hours). */
  static readonly SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

  /** Activity refresh threshold in milliseconds (5 minutes). */
  static readonly REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

  private constructor(private readonly props: SessionProps) {}

  /**
   * Creates a new Session with the provided expiry.
   *
   * @param params - The creation parameters
   * @param params.sessionId - Unique session identifier
   * @param params.userId - UserId value object of the owning user
   * @param params.csrfToken - CSRF protection token
   * @param params.ipAddress - IP address of the request
   * @param params.userAgent - User agent string of the request
   * @param params.now - Current UTC ISO 8601 timestamp
   * @param params.expiresAt - Pre-computed UTC ISO 8601 expiry (now + SESSION_DURATION_MS)
   * @returns A new Session instance
   */
  static create(params: {
    sessionId: SessionId;
    userId: UserId;
    csrfToken: CsrfToken;
    ipAddress: string;
    userAgent: string;
    now: string;
    expiresAt: string;
  }): Session {
    return new Session({
      sessionId: params.sessionId,
      userId: params.userId,
      csrfToken: params.csrfToken,
      expiresAt: params.expiresAt,
      lastActivityAt: params.now,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      createdAt: params.now,
    });
  }

  /**
   * Reconstitutes a Session from persisted data without validation.
   *
   * @param props - The stored session properties
   * @param props.sessionId - Unique session identifier
   * @param props.userId - UserId value object of the owning user
   * @param props.csrfToken - CSRF protection token
   * @param props.expiresAt - UTC ISO 8601 expiry timestamp
   * @param props.lastActivityAt - UTC ISO 8601 last activity timestamp
   * @param props.ipAddress - IP address of the session
   * @param props.userAgent - User agent string of the session
   * @param props.createdAt - UTC ISO 8601 creation timestamp
   * @returns A Session instance
   */
  static reconstitute(props: {
    sessionId: SessionId;
    userId: UserId;
    csrfToken: CsrfToken;
    expiresAt: string;
    lastActivityAt: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
  }): Session {
    return new Session(props);
  }

  /**
   * Returns the session identifier value object.
   *
   * @returns The SessionId value object
   */
  get sessionId(): SessionId {
    return this.props.sessionId;
  }

  /**
   * Returns the owning user's ID.
   *
   * @returns The UserId value object
   */
  get userId(): UserId {
    return this.props.userId;
  }

  /**
   * Returns the CSRF protection token.
   *
   * @returns The CsrfToken value object
   */
  get csrfToken(): CsrfToken {
    return this.props.csrfToken;
  }

  /**
   * Returns the UTC ISO 8601 expiry timestamp.
   *
   * @returns The expiry timestamp
   */
  get expiresAt(): string {
    return this.props.expiresAt;
  }

  /**
   * Returns the UTC ISO 8601 last activity timestamp.
   *
   * @returns The last activity timestamp
   */
  get lastActivityAt(): string {
    return this.props.lastActivityAt;
  }

  /**
   * Returns the IP address of the session.
   *
   * @returns The IP address string
   */
  get ipAddress(): string {
    return this.props.ipAddress;
  }

  /**
   * Returns the user agent of the session.
   *
   * @returns The user agent string
   */
  get userAgent(): string {
    return this.props.userAgent;
  }

  /**
   * Returns the UTC ISO 8601 creation timestamp.
   *
   * @returns The creation timestamp
   */
  get createdAt(): string {
    return this.props.createdAt;
  }

  /**
   * Checks whether the session has expired.
   *
   * @param now - Current UTC ISO 8601 timestamp
   * @returns True if the session has expired (now >= expiresAt)
   */
  isExpired(now: string): boolean {
    return now >= this.props.expiresAt;
  }

  /**
   * Checks whether the session needs an activity refresh.
   *
   * @param elapsedSinceLastActivityMs - Milliseconds elapsed since last activity
   * @returns True if elapsed time >= refresh threshold
   */
  needsRefresh(elapsedSinceLastActivityMs: number): boolean {
    return elapsedSinceLastActivityMs >= Session.REFRESH_THRESHOLD_MS;
  }

  /**
   * Returns a new Session with updated last activity timestamp.
   *
   * @param now - Current UTC ISO 8601 timestamp
   * @returns A new Session with the updated activity time
   */
  withUpdatedActivity(now: string): Session {
    return new Session({
      ...this.props,
      lastActivityAt: now,
    });
  }

  /**
   * Validates a CSRF token against this session's token.
   *
   * @param token - The CsrfToken to validate
   * @returns True if the token matches (constant-time comparison)
   */
  validateCsrfToken(token: CsrfToken): boolean {
    return this.props.csrfToken.equals(token);
  }
}

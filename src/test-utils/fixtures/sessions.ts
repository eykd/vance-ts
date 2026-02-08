import { SessionBuilder } from '../builders/SessionBuilder';
import type { SessionProps } from '../builders/SessionBuilder';

/**
 * An active session with a future expiry.
 *
 * Use this fixture for tests involving valid, active sessions.
 */
export const validSession: SessionProps = new SessionBuilder()
  .withSessionId('session-valid-001')
  .withUserId('user-valid-001')
  .withCsrfToken('csrf-valid-token-001')
  .withIpAddress('192.168.1.100')
  .build();

/**
 * An expired session with a past expiry date.
 *
 * Use this fixture for tests involving session expiration logic.
 */
export const expiredSession: SessionProps = new SessionBuilder()
  .withSessionId('session-expired-001')
  .withUserId('user-valid-001')
  .withCsrfToken('csrf-expired-token-001')
  .withIpAddress('192.168.1.100')
  .expired()
  .build();

/**
 * A session with recent lastActivityAt timestamp.
 *
 * Use this fixture for tests involving session activity tracking.
 */
export const recentlyActiveSession: SessionProps = new SessionBuilder()
  .withSessionId('session-recent-001')
  .withUserId('user-valid-001')
  .withCsrfToken('csrf-recent-token-001')
  .withIpAddress('192.168.1.100')
  .withExpiry('2025-12-31T23:59:59.000Z')
  .withLastActivity('2025-01-15T11:55:00.000Z')
  .build();

import type { Session } from '../../domain/entities/Session';
import { SessionBuilder } from '../builders/SessionBuilder';

/**
 * An active session with a future expiry.
 *
 * Use this fixture for tests involving valid, active sessions.
 */
export const validSession: Session = new SessionBuilder()
  .withSessionId('00000000-0000-4000-a000-000000000010')
  .withUserId('00000000-0000-4000-a000-000000000101')
  .withCsrfToken('ab'.repeat(32))
  .withIpAddress('192.168.1.100')
  .build();

/**
 * An expired session with a past expiry date.
 *
 * Use this fixture for tests involving session expiration logic.
 */
export const expiredSession: Session = new SessionBuilder()
  .withSessionId('00000000-0000-4000-a000-000000000020')
  .withUserId('00000000-0000-4000-a000-000000000101')
  .withCsrfToken('cd'.repeat(32))
  .withIpAddress('192.168.1.100')
  .expired()
  .build();

/**
 * A session with recent lastActivityAt timestamp.
 *
 * Use this fixture for tests involving session activity tracking.
 */
export const recentlyActiveSession: Session = new SessionBuilder()
  .withSessionId('00000000-0000-4000-a000-000000000030')
  .withUserId('00000000-0000-4000-a000-000000000101')
  .withCsrfToken('ef'.repeat(32))
  .withIpAddress('192.168.1.100')
  .withExpiry('2025-12-31T23:59:59.000Z')
  .withLastActivity('2025-01-15T11:55:00.000Z')
  .build();

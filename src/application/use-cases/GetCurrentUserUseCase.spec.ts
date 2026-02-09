import { UnauthorizedError } from '../../domain/errors/UnauthorizedError';
import type { TimeProvider } from '../../domain/interfaces/TimeProvider';
import { SessionBuilder } from '../../test-utils/builders/SessionBuilder';
import { UserBuilder } from '../../test-utils/builders/UserBuilder';
import { MockSessionRepository } from '../../test-utils/mocks/MockSessionRepository';
import { MockUserRepository } from '../../test-utils/mocks/MockUserRepository';

import { GetCurrentUserUseCase } from './GetCurrentUserUseCase';

describe('GetCurrentUserUseCase', () => {
  const USER_ID = '00000000-0000-4000-a000-000000000001';
  const SESSION_ID = '550e8400-e29b-41d4-a716-446655440000';
  const fixedTime = new Date('2025-06-15T10:30:00.000Z').getTime();
  const timeProvider: TimeProvider = { now: (): number => fixedTime };

  let userRepository: MockUserRepository;
  let sessionRepository: MockSessionRepository;
  let useCase: GetCurrentUserUseCase;

  beforeEach(() => {
    userRepository = new MockUserRepository();
    sessionRepository = new MockSessionRepository();
    useCase = new GetCurrentUserUseCase(userRepository, sessionRepository, timeProvider);
  });

  it('returns ok with UserResponse for a valid session', async () => {
    const user = new UserBuilder().withId(USER_ID).withEmail('alice@example.com').build();
    const session = new SessionBuilder().withSessionId(SESSION_ID).withUserId(USER_ID).build();
    userRepository.addUser(user);
    sessionRepository.addSession(session);

    const result = await useCase.execute(SESSION_ID);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.id.toString()).toBe(USER_ID);
      expect(result.value.email).toBe('alice@example.com');
    }
  });

  it('returns err for an invalid session ID', async () => {
    const result = await useCase.execute('not-a-uuid');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(UnauthorizedError);
    }
  });

  it('returns err when session is not found', async () => {
    const result = await useCase.execute(SESSION_ID);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(UnauthorizedError);
    }
  });

  it('returns err when session is expired', async () => {
    const user = new UserBuilder().withId(USER_ID).build();
    const session = new SessionBuilder()
      .withSessionId(SESSION_ID)
      .withUserId(USER_ID)
      .expired()
      .build();
    userRepository.addUser(user);
    sessionRepository.addSession(session);

    const result = await useCase.execute(SESSION_ID);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(UnauthorizedError);
      expect(result.error.message).toBe('Session expired');
    }
  });

  it('returns err when user is not found (orphaned session)', async () => {
    const session = new SessionBuilder().withSessionId(SESSION_ID).withUserId(USER_ID).build();
    sessionRepository.addSession(session);

    const result = await useCase.execute(SESSION_ID);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(UnauthorizedError);
    }
  });

  it('maps all UserResponse fields correctly', async () => {
    const user = new UserBuilder()
      .withId(USER_ID)
      .withEmail('Bob@Example.COM')
      .withLastLogin()
      .build();
    const session = new SessionBuilder().withSessionId(SESSION_ID).withUserId(USER_ID).build();
    userRepository.addUser(user);
    sessionRepository.addSession(session);

    const result = await useCase.execute(SESSION_ID);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.id.toString()).toBe(USER_ID);
      expect(result.value.email).toBe('Bob@Example.COM');
      expect(result.value.createdAt).toBe('2025-01-15T00:00:00.000Z');
      expect(result.value.lastLoginAt).toBe('2025-01-14T12:00:00.000Z');
    }
  });

  it('returns null lastLoginAt when user has never logged in', async () => {
    const user = new UserBuilder().withId(USER_ID).build();
    const session = new SessionBuilder().withSessionId(SESSION_ID).withUserId(USER_ID).build();
    userRepository.addUser(user);
    sessionRepository.addSession(session);

    const result = await useCase.execute(SESSION_ID);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.lastLoginAt).toBeNull();
    }
  });

  describe('session activity refresh', () => {
    it('updates activity when session needs refresh', async () => {
      // Default lastActivityAt is '2025-01-15T00:00:00.000Z', fixedTime is '2025-06-15T10:30:00.000Z'
      // That's well over 5 minutes, so needsRefresh should be true
      const user = new UserBuilder().withId(USER_ID).build();
      const session = new SessionBuilder().withSessionId(SESSION_ID).withUserId(USER_ID).build();
      userRepository.addUser(user);
      sessionRepository.addSession(session);

      await useCase.execute(SESSION_ID);

      const updatedSession = sessionRepository.getById(SESSION_ID);
      expect(updatedSession?.lastActivityAt).toBe('2025-06-15T10:30:00.000Z');
    });

    it('does not update activity when session was recently active', async () => {
      const user = new UserBuilder().withId(USER_ID).build();
      // Set lastActivityAt to 1 minute before fixedTime (within 5 min threshold)
      const recentActivity = new Date(fixedTime - 60_000).toISOString();
      const session = new SessionBuilder()
        .withSessionId(SESSION_ID)
        .withUserId(USER_ID)
        .withLastActivity(recentActivity)
        .build();
      userRepository.addUser(user);
      sessionRepository.addSession(session);

      await useCase.execute(SESSION_ID);

      const updatedSession = sessionRepository.getById(SESSION_ID);
      expect(updatedSession?.lastActivityAt).toBe(recentActivity);
    });

    it('still returns user data even if activity update fails', async () => {
      const user = new UserBuilder().withId(USER_ID).withEmail('alice@example.com').build();
      const session = new SessionBuilder().withSessionId(SESSION_ID).withUserId(USER_ID).build();
      userRepository.addUser(user);
      sessionRepository.addSession(session);

      // Make updateActivity throw
      const originalUpdateActivity = sessionRepository.updateActivity.bind(sessionRepository);
      sessionRepository.updateActivity = (): Promise<void> =>
        Promise.reject(new Error('KV failure'));

      const result = await useCase.execute(SESSION_ID);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.id.toString()).toBe(USER_ID);
        expect(result.value.email).toBe('alice@example.com');
      }

      // Restore
      sessionRepository.updateActivity = originalUpdateActivity;
    });
  });
});

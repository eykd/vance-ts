import { Session } from '../../domain/entities/Session';
import { CsrfToken } from '../../domain/value-objects/CsrfToken';
import { SessionId } from '../../domain/value-objects/SessionId';
import { UserId } from '../../domain/value-objects/UserId';
import type { KVNamespace } from '../types/CloudflareTypes';

import { KVSessionRepository } from './KVSessionRepository';

/** Fixed test timestamps. */
const NOW = '2025-06-01T00:00:00.000Z';
const EXPIRES = '2025-06-02T00:00:00.000Z';
const SESSION_ID = '550e8400-e29b-41d4-a716-446655440000';
const USER_ID = '660e8400-e29b-41d4-a716-446655440000';
const CSRF_TOKEN = 'a'.repeat(64);

/**
 * Creates a test session record as stored in KV.
 *
 * @returns A serialized session record object
 */
function createTestRecord(): Record<string, string> {
  return {
    sessionId: SESSION_ID,
    userId: USER_ID,
    csrfToken: CSRF_TOKEN,
    expiresAt: EXPIRES,
    lastActivityAt: NOW,
    ipAddress: '192.168.1.1',
    userAgent: 'TestAgent/1.0',
    createdAt: NOW,
  };
}

/**
 * Creates a test Session entity.
 *
 * @returns A Session entity for testing
 */
function createTestSession(): Session {
  return Session.reconstitute({
    sessionId: SessionId.fromString(SESSION_ID),
    userId: UserId.fromString(USER_ID),
    csrfToken: CsrfToken.fromString(CSRF_TOKEN),
    expiresAt: EXPIRES,
    lastActivityAt: NOW,
    ipAddress: '192.168.1.1',
    userAgent: 'TestAgent/1.0',
    createdAt: NOW,
  });
}

/**
 * Creates a mock KV namespace for testing.
 *
 * @returns A mock KVNamespace with jest mocks
 */
function createMockKV(): KVNamespace & {
  get: jest.Mock<Promise<string | null>, [string]>;
  put: jest.Mock<Promise<void>, [string, string, unknown?]>;
  delete: jest.Mock<Promise<void>, [string]>;
} {
  return {
    get: jest.fn<Promise<string | null>, [string]>().mockResolvedValue(null),
    put: jest.fn<Promise<void>, [string, string, unknown?]>().mockResolvedValue(undefined),
    delete: jest.fn<Promise<void>, [string]>().mockResolvedValue(undefined),
  };
}

describe('KVSessionRepository', () => {
  let dateNowSpy: jest.SpyInstance;

  beforeEach(() => {
    // Fix Date.now to 2025-06-01T00:00:00.000Z (1748736000000)
    dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(Date.parse(NOW));
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
  });

  describe('save', () => {
    it('stores session JSON with correct key and TTL', async () => {
      const kv = createMockKV();
      const repo = new KVSessionRepository(kv);
      const session = createTestSession();

      await repo.save(session);

      expect(kv.put).toHaveBeenCalledWith(
        `session:${SESSION_ID}`,
        JSON.stringify(createTestRecord()),
        { expirationTtl: 86400 }
      );
    });

    it('updates user session index', async () => {
      const kv = createMockKV();
      const repo = new KVSessionRepository(kv);
      const session = createTestSession();

      await repo.save(session);

      expect(kv.get).toHaveBeenCalledWith(`user_sessions:${USER_ID}`);
      expect(kv.put).toHaveBeenCalledWith(
        `user_sessions:${USER_ID}`,
        JSON.stringify([SESSION_ID]),
        { expirationTtl: 86400 }
      );
    });

    it('appends to existing user session index', async () => {
      const kv = createMockKV();
      const existingSessionId = '11111111-1111-1111-1111-111111111111';
      kv.get.mockImplementation((key: string) => {
        if (key === `user_sessions:${USER_ID}`) {
          return Promise.resolve(JSON.stringify([existingSessionId]));
        }
        return Promise.resolve(null);
      });
      const repo = new KVSessionRepository(kv);
      const session = createTestSession();

      await repo.save(session);

      expect(kv.put).toHaveBeenCalledWith(
        `user_sessions:${USER_ID}`,
        JSON.stringify([existingSessionId, SESSION_ID]),
        { expirationTtl: 86400 }
      );
    });

    it('does not duplicate session ID in user index', async () => {
      const kv = createMockKV();
      kv.get.mockImplementation((key: string) => {
        if (key === `user_sessions:${USER_ID}`) {
          return Promise.resolve(JSON.stringify([SESSION_ID]));
        }
        return Promise.resolve(null);
      });
      const repo = new KVSessionRepository(kv);
      const session = createTestSession();

      await repo.save(session);

      expect(kv.put).toHaveBeenCalledWith(
        `user_sessions:${USER_ID}`,
        JSON.stringify([SESSION_ID]),
        { expirationTtl: 86400 }
      );
    });

    it('handles corrupt user index by starting fresh', async () => {
      const kv = createMockKV();
      kv.get.mockImplementation((key: string) => {
        if (key === `user_sessions:${USER_ID}`) {
          return Promise.resolve('not-valid-json');
        }
        return Promise.resolve(null);
      });
      const repo = new KVSessionRepository(kv);
      const session = createTestSession();

      await repo.save(session);

      expect(kv.put).toHaveBeenCalledWith(
        `user_sessions:${USER_ID}`,
        JSON.stringify([SESSION_ID]),
        { expirationTtl: 86400 }
      );
    });

    it('uses minimum TTL of 1 when session is nearly expired', async () => {
      const kv = createMockKV();
      const repo = new KVSessionRepository(kv);
      // Session that expires 100ms from now
      const nearlyExpired = Session.reconstitute({
        sessionId: SessionId.fromString(SESSION_ID),
        userId: UserId.fromString(USER_ID),
        csrfToken: CsrfToken.fromString(CSRF_TOKEN),
        expiresAt: new Date(Date.parse(NOW) + 100).toISOString(),
        lastActivityAt: NOW,
        ipAddress: '192.168.1.1',
        userAgent: 'TestAgent/1.0',
        createdAt: NOW,
      });

      await repo.save(nearlyExpired);

      const putCall = kv.put.mock.calls[0];
      const options = putCall?.[2] as { expirationTtl: number } | undefined;
      expect(options?.expirationTtl).toBe(1);
    });
  });

  describe('findById', () => {
    it('returns a Session when found', async () => {
      const kv = createMockKV();
      kv.get.mockResolvedValue(JSON.stringify(createTestRecord()));
      const repo = new KVSessionRepository(kv);
      const id = SessionId.fromString(SESSION_ID);

      const session = await repo.findById(id);

      expect(session).not.toBeNull();
      expect(session?.sessionId.toString()).toBe(SESSION_ID);
      expect(session?.userId.toString()).toBe(USER_ID);
      expect(session?.csrfToken.toString()).toBe(CSRF_TOKEN);
      expect(session?.expiresAt).toBe(EXPIRES);
      expect(session?.lastActivityAt).toBe(NOW);
      expect(session?.ipAddress).toBe('192.168.1.1');
      expect(session?.userAgent).toBe('TestAgent/1.0');
      expect(session?.createdAt).toBe(NOW);

      expect(kv.get).toHaveBeenCalledWith(`session:${SESSION_ID}`);
    });

    it('returns null when not found', async () => {
      const kv = createMockKV();
      const repo = new KVSessionRepository(kv);
      const id = SessionId.fromString(SESSION_ID);

      const session = await repo.findById(id);

      expect(session).toBeNull();
    });

    it('returns null and cleans up corrupt data', async () => {
      const kv = createMockKV();
      kv.get.mockResolvedValue('not-valid-json');
      const repo = new KVSessionRepository(kv);
      const id = SessionId.fromString(SESSION_ID);

      const session = await repo.findById(id);

      expect(session).toBeNull();
      expect(kv.delete).toHaveBeenCalledWith(`session:${SESSION_ID}`);
    });
  });

  describe('delete', () => {
    it('removes session key and updates user index', async () => {
      const kv = createMockKV();
      const record = createTestRecord();
      kv.get.mockImplementation((key: string) => {
        if (key === `session:${SESSION_ID}`) {
          return Promise.resolve(JSON.stringify(record));
        }
        if (key === `user_sessions:${USER_ID}`) {
          return Promise.resolve(JSON.stringify([SESSION_ID]));
        }
        return Promise.resolve(null);
      });
      const repo = new KVSessionRepository(kv);
      const id = SessionId.fromString(SESSION_ID);

      await repo.delete(id);

      expect(kv.delete).toHaveBeenCalledWith(`session:${SESSION_ID}`);
      // User index should be deleted when last session removed
      expect(kv.delete).toHaveBeenCalledWith(`user_sessions:${USER_ID}`);
    });

    it('handles non-existent session gracefully', async () => {
      const kv = createMockKV();
      const repo = new KVSessionRepository(kv);
      const id = SessionId.fromString(SESSION_ID);

      await repo.delete(id);

      expect(kv.delete).toHaveBeenCalledWith(`session:${SESSION_ID}`);
    });

    it('preserves other sessions in user index', async () => {
      const kv = createMockKV();
      const otherSessionId = '11111111-1111-1111-1111-111111111111';
      kv.get.mockImplementation((key: string) => {
        if (key === `session:${SESSION_ID}`) {
          return Promise.resolve(JSON.stringify(createTestRecord()));
        }
        if (key === `user_sessions:${USER_ID}`) {
          return Promise.resolve(JSON.stringify([SESSION_ID, otherSessionId]));
        }
        return Promise.resolve(null);
      });
      const repo = new KVSessionRepository(kv);
      const id = SessionId.fromString(SESSION_ID);

      await repo.delete(id);

      expect(kv.put).toHaveBeenCalledWith(
        `user_sessions:${USER_ID}`,
        JSON.stringify([otherSessionId]),
        { expirationTtl: 86400 }
      );
    });

    it('handles corrupt session data during delete', async () => {
      const kv = createMockKV();
      kv.get.mockResolvedValue('not-valid-json');
      const repo = new KVSessionRepository(kv);
      const id = SessionId.fromString(SESSION_ID);

      await repo.delete(id);

      // Should still delete the session key
      expect(kv.delete).toHaveBeenCalledWith(`session:${SESSION_ID}`);
    });

    it('handles missing user index during delete', async () => {
      const kv = createMockKV();
      kv.get.mockImplementation((key: string) => {
        if (key === `session:${SESSION_ID}`) {
          return Promise.resolve(JSON.stringify(createTestRecord()));
        }
        // user_sessions index returns null
        return Promise.resolve(null);
      });
      const repo = new KVSessionRepository(kv);
      const id = SessionId.fromString(SESSION_ID);

      await repo.delete(id);

      expect(kv.delete).toHaveBeenCalledWith(`session:${SESSION_ID}`);
    });

    it('handles corrupt user index during delete', async () => {
      const kv = createMockKV();
      kv.get.mockImplementation((key: string) => {
        if (key === `session:${SESSION_ID}`) {
          return Promise.resolve(JSON.stringify(createTestRecord()));
        }
        if (key === `user_sessions:${USER_ID}`) {
          return Promise.resolve('not-valid-json');
        }
        return Promise.resolve(null);
      });
      const repo = new KVSessionRepository(kv);
      const id = SessionId.fromString(SESSION_ID);

      await repo.delete(id);

      expect(kv.delete).toHaveBeenCalledWith(`session:${SESSION_ID}`);
      expect(kv.delete).toHaveBeenCalledWith(`user_sessions:${USER_ID}`);
    });
  });

  describe('deleteAllForUser', () => {
    it('deletes all sessions and the user index', async () => {
      const kv = createMockKV();
      const sessionId2 = '11111111-1111-1111-1111-111111111111';
      kv.get.mockImplementation((key: string) => {
        if (key === `user_sessions:${USER_ID}`) {
          return Promise.resolve(JSON.stringify([SESSION_ID, sessionId2]));
        }
        return Promise.resolve(null);
      });
      const repo = new KVSessionRepository(kv);
      const userId = UserId.fromString(USER_ID);

      await repo.deleteAllForUser(userId);

      expect(kv.delete).toHaveBeenCalledWith(`session:${SESSION_ID}`);
      expect(kv.delete).toHaveBeenCalledWith(`session:${sessionId2}`);
      expect(kv.delete).toHaveBeenCalledWith(`user_sessions:${USER_ID}`);
    });

    it('handles empty user index', async () => {
      const kv = createMockKV();
      const repo = new KVSessionRepository(kv);
      const userId = UserId.fromString(USER_ID);

      await repo.deleteAllForUser(userId);

      expect(kv.delete).toHaveBeenCalledWith(`user_sessions:${USER_ID}`);
    });

    it('handles corrupt user index', async () => {
      const kv = createMockKV();
      kv.get.mockResolvedValue('not-valid-json');
      const repo = new KVSessionRepository(kv);
      const userId = UserId.fromString(USER_ID);

      await repo.deleteAllForUser(userId);

      expect(kv.delete).toHaveBeenCalledWith(`user_sessions:${USER_ID}`);
    });
  });

  describe('updateActivity', () => {
    it('updates lastActivityAt and re-saves with TTL', async () => {
      const kv = createMockKV();
      kv.get.mockResolvedValue(JSON.stringify(createTestRecord()));
      const repo = new KVSessionRepository(kv);
      const id = SessionId.fromString(SESSION_ID);
      const newNow = '2025-06-01T01:00:00.000Z';

      await repo.updateActivity(id, newNow);

      const expectedRecord = { ...createTestRecord(), lastActivityAt: newNow };
      expect(kv.put).toHaveBeenCalledWith(`session:${SESSION_ID}`, JSON.stringify(expectedRecord), {
        expirationTtl: 86400,
      });
    });

    it('no-ops when session does not exist', async () => {
      const kv = createMockKV();
      const repo = new KVSessionRepository(kv);
      const id = SessionId.fromString(SESSION_ID);

      await repo.updateActivity(id, NOW);

      expect(kv.put).not.toHaveBeenCalled();
    });

    it('cleans up corrupt session data', async () => {
      const kv = createMockKV();
      kv.get.mockResolvedValue('not-valid-json');
      const repo = new KVSessionRepository(kv);
      const id = SessionId.fromString(SESSION_ID);

      await repo.updateActivity(id, NOW);

      expect(kv.delete).toHaveBeenCalledWith(`session:${SESSION_ID}`);
      expect(kv.put).not.toHaveBeenCalled();
    });
  });
});

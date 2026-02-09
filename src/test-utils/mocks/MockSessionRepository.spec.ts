import { SessionId } from '../../domain/value-objects/SessionId';
import { UserId } from '../../domain/value-objects/UserId';
import { SessionBuilder } from '../builders/SessionBuilder';

import { MockSessionRepository } from './MockSessionRepository';

describe('MockSessionRepository', () => {
  describe('findById', () => {
    it('returns session when found', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const session = new SessionBuilder().withSessionId(id).build();
      const repo = new MockSessionRepository();
      repo.addSession(session);

      const found = await repo.findById(SessionId.fromString(id));

      expect(found).not.toBeNull();
      expect(found?.sessionId.toString()).toBe(id);
    });

    it('returns null when not found', async () => {
      const repo = new MockSessionRepository();

      const found = await repo.findById(
        SessionId.fromString('550e8400-e29b-41d4-a716-446655440000')
      );

      expect(found).toBeNull();
    });
  });

  describe('save', () => {
    it('stores a new session', async () => {
      const repo = new MockSessionRepository();
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const session = new SessionBuilder().withSessionId(id).build();

      await repo.save(session);

      const found = repo.getById(id);
      expect(found).not.toBeUndefined();
      expect(found?.sessionId.toString()).toBe(id);
    });

    it('overwrites existing session', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const original = new SessionBuilder().withSessionId(id).withIpAddress('10.0.0.1').build();
      const repo = new MockSessionRepository();
      repo.addSession(original);

      const updated = new SessionBuilder().withSessionId(id).withIpAddress('10.0.0.2').build();
      await repo.save(updated);

      const found = repo.getById(id);
      expect(found?.ipAddress).toBe('10.0.0.2');
    });
  });

  describe('delete', () => {
    it('removes existing session and records call', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const session = new SessionBuilder().withSessionId(id).build();
      const repo = new MockSessionRepository();
      repo.addSession(session);

      await repo.delete(SessionId.fromString(id));

      expect(repo.getById(id)).toBeUndefined();
      expect(repo.deleteCalls).toEqual([id]);
    });

    it('records call for non-existent session', async () => {
      const repo = new MockSessionRepository();
      const id = '550e8400-e29b-41d4-a716-446655440000';

      await repo.delete(SessionId.fromString(id));

      expect(repo.deleteCalls).toEqual([id]);
    });
  });

  describe('deleteAllForUser', () => {
    it('removes sessions for correct user', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const session1 = new SessionBuilder()
        .withSessionId('660e8400-e29b-41d4-a716-446655440001')
        .withUserId(userId)
        .build();
      const session2 = new SessionBuilder()
        .withSessionId('660e8400-e29b-41d4-a716-446655440002')
        .withUserId(userId)
        .build();
      const repo = new MockSessionRepository();
      repo.addSession(session1);
      repo.addSession(session2);

      await repo.deleteAllForUser(UserId.fromString(userId));

      expect(repo.getById('660e8400-e29b-41d4-a716-446655440001')).toBeUndefined();
      expect(repo.getById('660e8400-e29b-41d4-a716-446655440002')).toBeUndefined();
      expect(repo.deleteAllForUserCalls).toEqual([userId]);
    });

    it('does not remove other users sessions', async () => {
      const userId1 = '550e8400-e29b-41d4-a716-446655440000';
      const userId2 = '770e8400-e29b-41d4-a716-446655440000';
      const session1 = new SessionBuilder()
        .withSessionId('660e8400-e29b-41d4-a716-446655440001')
        .withUserId(userId1)
        .build();
      const session2 = new SessionBuilder()
        .withSessionId('660e8400-e29b-41d4-a716-446655440002')
        .withUserId(userId2)
        .build();
      const repo = new MockSessionRepository();
      repo.addSession(session1);
      repo.addSession(session2);

      await repo.deleteAllForUser(UserId.fromString(userId1));

      expect(repo.getById('660e8400-e29b-41d4-a716-446655440001')).toBeUndefined();
      expect(repo.getById('660e8400-e29b-41d4-a716-446655440002')).not.toBeUndefined();
    });
  });

  describe('updateActivity', () => {
    it('updates existing session', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const session = new SessionBuilder()
        .withSessionId(id)
        .withLastActivity('2025-01-15T00:00:00.000Z')
        .build();
      const repo = new MockSessionRepository();
      repo.addSession(session);

      const newTime = '2025-01-15T01:00:00.000Z';
      await repo.updateActivity(SessionId.fromString(id), newTime);

      const updated = repo.getById(id);
      expect(updated?.lastActivityAt).toBe(newTime);
    });

    it('is no-op for non-existent session', async () => {
      const repo = new MockSessionRepository();
      const id = '550e8400-e29b-41d4-a716-446655440000';

      await repo.updateActivity(SessionId.fromString(id), '2025-01-15T01:00:00.000Z');

      expect(repo.getById(id)).toBeUndefined();
    });
  });
});

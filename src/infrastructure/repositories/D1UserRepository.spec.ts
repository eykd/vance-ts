import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { UserId } from '../../domain/value-objects/UserId';
import type { D1Result } from '../types/CloudflareTypes';

import { D1UserRepository } from './D1UserRepository';

/**
 * Creates a mock D1 database and statement for testing.
 *
 * @param options - Mock return values
 * @param options.firstResult - Value returned by first()
 * @returns Mock objects with accessible jest mock references
 */
function createMockD1(options?: { firstResult?: unknown }): {
  prepareMock: jest.Mock;
  bindMock: jest.Mock;
  firstMock: jest.Mock;
  runMock: jest.Mock;
  db: { prepare: jest.Mock };
} {
  const firstMock = jest.fn<Promise<unknown>, []>().mockResolvedValue(options?.firstResult ?? null);
  const runMock = jest
    .fn<Promise<D1Result<unknown>>, []>()
    .mockResolvedValue({ results: [], success: true });
  const allMock = jest
    .fn<Promise<D1Result<unknown>>, []>()
    .mockResolvedValue({ results: [], success: true });

  const bindMock = jest.fn<unknown, unknown[]>();
  const statement = { bind: bindMock, first: firstMock, all: allMock, run: runMock };
  bindMock.mockReturnValue(statement);

  const prepareMock = jest.fn<unknown, [string]>().mockReturnValue(statement);
  const db = { prepare: prepareMock };

  return { prepareMock, bindMock, firstMock, runMock, db };
}

/** Test user row matching the database schema. */
const testUserRow = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'Test@Example.com',
  email_normalized: 'test@example.com',
  password_hash: '$argon2id$v=19$m=19456,t=2,p=1$salt$hash',
  failed_login_attempts: 0,
  locked_until: null,
  last_login_at: null,
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
  password_changed_at: '2025-01-01T00:00:00.000Z',
  last_login_ip: null,
  last_login_user_agent: null,
};

describe('D1UserRepository', () => {
  describe('findByEmail', () => {
    it('returns a User when found', async () => {
      const { prepareMock, bindMock, db } = createMockD1({ firstResult: testUserRow });
      const repo = new D1UserRepository(db);
      const email = Email.create('test@example.com');

      const user = await repo.findByEmail(email);

      expect(user).not.toBeNull();
      expect(user?.id.toString()).toBe(testUserRow.id);
      expect(user?.email.value).toBe(testUserRow.email);
      expect(user?.email.normalizedValue).toBe(testUserRow.email_normalized);
      expect(user?.passwordHash).toBe(testUserRow.password_hash);
      expect(user?.failedLoginAttempts).toBe(0);
      expect(user?.lockedUntil).toBeNull();
      expect(user?.lastLoginAt).toBeNull();
      expect(user?.createdAt).toBe(testUserRow.created_at);
      expect(user?.updatedAt).toBe(testUserRow.updated_at);
      expect(user?.passwordChangedAt).toBe(testUserRow.password_changed_at);
      expect(user?.lastLoginIp).toBeNull();
      expect(user?.lastLoginUserAgent).toBeNull();

      expect(prepareMock).toHaveBeenCalledWith('SELECT * FROM users WHERE email_normalized = ?');
      expect(bindMock).toHaveBeenCalledWith('test@example.com');
    });

    it('returns null when not found', async () => {
      const { bindMock, db } = createMockD1({ firstResult: null });
      const repo = new D1UserRepository(db);
      const email = Email.create('notfound@example.com');

      const user = await repo.findByEmail(email);

      expect(user).toBeNull();
      expect(bindMock).toHaveBeenCalledWith('notfound@example.com');
    });
  });

  describe('findById', () => {
    it('returns a User when found', async () => {
      const { prepareMock, bindMock, db } = createMockD1({ firstResult: testUserRow });
      const repo = new D1UserRepository(db);
      const id = UserId.fromString(testUserRow.id);

      const user = await repo.findById(id);

      expect(user).not.toBeNull();
      expect(user?.id.toString()).toBe(testUserRow.id);
      expect(user?.email.normalizedValue).toBe(testUserRow.email_normalized);

      expect(prepareMock).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?');
      expect(bindMock).toHaveBeenCalledWith(testUserRow.id);
    });

    it('returns null when not found', async () => {
      const { bindMock, db } = createMockD1({ firstResult: null });
      const repo = new D1UserRepository(db);
      const id = UserId.fromString('00000000-0000-0000-0000-000000000000');

      const user = await repo.findById(id);

      expect(user).toBeNull();
      expect(bindMock).toHaveBeenCalledWith('00000000-0000-0000-0000-000000000000');
    });
  });

  describe('save', () => {
    it('executes upsert with all 12 bind parameters in correct order', async () => {
      const { prepareMock, bindMock, runMock, db } = createMockD1();
      const repo = new D1UserRepository(db);

      const user = User.reconstitute({
        id: UserId.fromString('550e8400-e29b-41d4-a716-446655440000'),
        email: Email.reconstitute('Test@Example.com', 'test@example.com'),
        passwordHash: '$argon2id$hash',
        failedLoginAttempts: 3,
        lockedUntil: '2025-06-01T00:15:00.000Z',
        lastLoginAt: '2025-06-01T00:00:00.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-06-01T00:00:00.000Z',
        passwordChangedAt: '2025-03-01T00:00:00.000Z',
        lastLoginIp: '192.168.1.1',
        lastLoginUserAgent: 'Mozilla/5.0',
      });

      await repo.save(user);

      expect(prepareMock).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO users'));
      expect(prepareMock).toHaveBeenCalledWith(
        expect.stringContaining('ON CONFLICT(id) DO UPDATE')
      );
      expect(bindMock).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        'Test@Example.com',
        'test@example.com',
        '$argon2id$hash',
        3,
        '2025-06-01T00:15:00.000Z',
        '2025-06-01T00:00:00.000Z',
        '2025-01-01T00:00:00.000Z',
        '2025-06-01T00:00:00.000Z',
        '2025-03-01T00:00:00.000Z',
        '192.168.1.1',
        'Mozilla/5.0'
      );
      expect(runMock).toHaveBeenCalled();
    });

    it('passes null for nullable fields when not set', async () => {
      const { bindMock, db } = createMockD1();
      const repo = new D1UserRepository(db);

      const user = User.create({
        id: UserId.fromString('550e8400-e29b-41d4-a716-446655440000'),
        email: Email.create('new@example.com'),
        passwordHash: '$argon2id$newhash',
        now: '2025-01-01T00:00:00.000Z',
      });

      await repo.save(user);

      expect(bindMock).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        'new@example.com',
        'new@example.com',
        '$argon2id$newhash',
        0,
        null,
        null,
        '2025-01-01T00:00:00.000Z',
        '2025-01-01T00:00:00.000Z',
        '2025-01-01T00:00:00.000Z',
        null,
        null
      );
    });
  });

  describe('emailExists', () => {
    it('returns true when email exists', async () => {
      const { prepareMock, bindMock, db } = createMockD1({ firstResult: { '1': 1 } });
      const repo = new D1UserRepository(db);
      const email = Email.create('exists@example.com');

      const exists = await repo.emailExists(email);

      expect(exists).toBe(true);
      expect(prepareMock).toHaveBeenCalledWith('SELECT 1 FROM users WHERE email_normalized = ?');
      expect(bindMock).toHaveBeenCalledWith('exists@example.com');
    });

    it('returns false when email does not exist', async () => {
      const { db } = createMockD1({ firstResult: null });
      const repo = new D1UserRepository(db);
      const email = Email.create('notfound@example.com');

      const exists = await repo.emailExists(email);

      expect(exists).toBe(false);
    });
  });
});

import { Email } from '../../domain/value-objects/Email';
import { UserId } from '../../domain/value-objects/UserId';
import { UserBuilder } from '../builders/UserBuilder';

import { MockUserRepository } from './MockUserRepository';

describe('MockUserRepository', () => {
  describe('findByEmail', () => {
    it('returns user when found', async () => {
      const user = new UserBuilder().withEmail('alice@example.com').build();
      const repo = new MockUserRepository([user]);

      const found = await repo.findByEmail(Email.create('alice@example.com'));

      expect(found).not.toBeNull();
      expect(found?.email.normalizedValue).toBe('alice@example.com');
    });

    it('returns null when not found', async () => {
      const user = new UserBuilder().withEmail('alice@example.com').build();
      const repo = new MockUserRepository([user]);

      const found = await repo.findByEmail(Email.create('nobody@example.com'));

      expect(found).toBeNull();
    });
  });

  describe('findById', () => {
    it('returns user when found', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const user = new UserBuilder().withId(id).build();
      const repo = new MockUserRepository([user]);

      const found = await repo.findById(UserId.fromString(id));

      expect(found).not.toBeNull();
      expect(found?.id.toString()).toBe(id);
    });

    it('returns null when not found', async () => {
      const repo = new MockUserRepository();

      const found = await repo.findById(UserId.fromString('550e8400-e29b-41d4-a716-446655440000'));

      expect(found).toBeNull();
    });
  });

  describe('save', () => {
    it('stores a new user', async () => {
      const repo = new MockUserRepository();
      const user = new UserBuilder()
        .withId('550e8400-e29b-41d4-a716-446655440000')
        .withEmail('alice@example.com')
        .build();

      await repo.save(user);

      const found = repo.getById('550e8400-e29b-41d4-a716-446655440000');
      expect(found).not.toBeUndefined();
      expect(found?.email.normalizedValue).toBe('alice@example.com');
    });

    it('overwrites existing user', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const original = new UserBuilder().withId(id).withEmail('old@example.com').build();
      const repo = new MockUserRepository([original]);

      const updated = new UserBuilder().withId(id).withEmail('new@example.com').build();
      await repo.save(updated);

      const found = repo.getById(id);
      expect(found?.email.normalizedValue).toBe('new@example.com');
    });
  });

  describe('emailExists', () => {
    it('returns true when exists', async () => {
      const user = new UserBuilder().withEmail('alice@example.com').build();
      const repo = new MockUserRepository([user]);

      const exists = await repo.emailExists(Email.create('alice@example.com'));

      expect(exists).toBe(true);
    });

    it('returns false when not exists', async () => {
      const user = new UserBuilder().withEmail('alice@example.com').build();
      const repo = new MockUserRepository([user]);

      const exists = await repo.emailExists(Email.create('nobody@example.com'));

      expect(exists).toBe(false);
    });
  });

  describe('constructor seeding', () => {
    it('populates map from seed array', async () => {
      const user1 = new UserBuilder()
        .withId('550e8400-e29b-41d4-a716-446655440000')
        .withEmail('alice@example.com')
        .build();
      const user2 = new UserBuilder()
        .withId('660e8400-e29b-41d4-a716-446655440000')
        .withEmail('bob@example.com')
        .build();
      const repo = new MockUserRepository([user1, user2]);

      const found1 = await repo.findById(UserId.fromString('550e8400-e29b-41d4-a716-446655440000'));
      const found2 = await repo.findById(UserId.fromString('660e8400-e29b-41d4-a716-446655440000'));

      expect(found1).not.toBeNull();
      expect(found2).not.toBeNull();
    });
  });

  describe('addUser and getById helpers', () => {
    it('addUser stores and getById retrieves correctly', () => {
      const repo = new MockUserRepository();
      const user = new UserBuilder()
        .withId('550e8400-e29b-41d4-a716-446655440000')
        .withEmail('alice@example.com')
        .build();

      repo.addUser(user);

      const found = repo.getById('550e8400-e29b-41d4-a716-446655440000');
      expect(found).not.toBeUndefined();
      expect(found?.email.normalizedValue).toBe('alice@example.com');
    });
  });
});

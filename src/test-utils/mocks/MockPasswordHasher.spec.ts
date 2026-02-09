import { MockPasswordHasher } from './MockPasswordHasher';

describe('MockPasswordHasher', () => {
  let hasher: MockPasswordHasher;

  beforeEach(() => {
    hasher = new MockPasswordHasher();
  });

  describe('hash', () => {
    it('returns "hashed:{password}" format', async () => {
      const result = await hasher.hash('myPassword');

      expect(result).toBe('hashed:myPassword');
    });

    it('records call in hashCalls', async () => {
      await hasher.hash('myPassword');

      expect(hasher.hashCalls).toEqual(['myPassword']);
    });
  });

  describe('verify', () => {
    it('returns true for matching hash', async () => {
      const result = await hasher.verify('myPassword', 'hashed:myPassword');

      expect(result).toBe(true);
    });

    it('returns false for non-matching hash', async () => {
      const result = await hasher.verify('myPassword', 'hashed:wrongPassword');

      expect(result).toBe(false);
    });

    it('records call in verifyCalls', async () => {
      await hasher.verify('myPassword', 'hashed:myPassword');

      expect(hasher.verifyCalls).toEqual([{ password: 'myPassword', hash: 'hashed:myPassword' }]);
    });
  });

  describe('call tracking', () => {
    it('accumulates calls across multiple invocations', async () => {
      await hasher.hash('first');
      await hasher.hash('second');
      await hasher.verify('first', 'hashed:first');
      await hasher.verify('second', 'hashed:wrong');

      expect(hasher.hashCalls).toEqual(['first', 'second']);
      expect(hasher.verifyCalls).toEqual([
        { password: 'first', hash: 'hashed:first' },
        { password: 'second', hash: 'hashed:wrong' },
      ]);
    });
  });
});

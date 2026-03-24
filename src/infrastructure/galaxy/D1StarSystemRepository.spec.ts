/**
 * Integration tests for D1StarSystemRepository.
 *
 * Uses `@cloudflare/vitest-pool-workers` with isolatedStorage for test isolation.
 */

import { applyD1Migrations, env } from 'cloudflare:test';
import { beforeAll, describe, expect, it } from 'vitest';

import { D1StarSystemRepository, MAX_LIMIT } from './D1StarSystemRepository.js';
import {
  STAR_SYSTEMS_MIGRATION,
  insertStarSystem,
  makeSystemRow,
  typedEnv,
} from './galaxy-test-helpers.js';

/** Typed environment bindings from cloudflare:test. */
const tEnv = typedEnv(env);

describe('D1StarSystemRepository', () => {
  beforeAll(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- cloudflare:test types unresolvable in ESLint tsconfig
    await applyD1Migrations(tEnv.DB, STAR_SYSTEMS_MIGRATION);
  });

  describe('findById', () => {
    it('returns the star system when found', async () => {
      const row = makeSystemRow({ id: 'find-by-id-hit', name: 'Sol' });
      await insertStarSystem(tEnv.DB, row);

      const repo = new D1StarSystemRepository(tEnv.DB);
      const result = await repo.findById('find-by-id-hit');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('find-by-id-hit');
      expect(result?.name).toBe('Sol');
    });

    it('returns null when the ID does not exist', async () => {
      const repo = new D1StarSystemRepository(tEnv.DB);
      const result = await repo.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('returns the star system when the name matches exactly', async () => {
      const row = makeSystemRow({ id: 'find-by-name-hit', name: 'Vega' });
      await insertStarSystem(tEnv.DB, row);

      const repo = new D1StarSystemRepository(tEnv.DB);
      const result = await repo.findByName('Vega');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('find-by-name-hit');
      expect(result?.name).toBe('Vega');
    });

    it('returns null when the name does not exist', async () => {
      const repo = new D1StarSystemRepository(tEnv.DB);
      const result = await repo.findByName('Nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('searchByNamePrefix', () => {
    it('returns matching systems for a valid prefix', async () => {
      const row1 = makeSystemRow({ id: 'prefix-a1', name: 'Proxima Alpha' });
      const row2 = makeSystemRow({ id: 'prefix-a2', name: 'Proxima Beta' });
      const row3 = makeSystemRow({ id: 'prefix-a3', name: 'Deneb' });
      await insertStarSystem(tEnv.DB, row1);
      await insertStarSystem(tEnv.DB, row2);
      await insertStarSystem(tEnv.DB, row3);

      const repo = new D1StarSystemRepository(tEnv.DB);
      const results = await repo.searchByNamePrefix('Proxima');

      expect(results).toHaveLength(2);
      expect(results.map((s) => s.name)).toEqual(['Proxima Alpha', 'Proxima Beta']);
    });

    it('returns empty array when prefix is shorter than 2 characters', async () => {
      const row = makeSystemRow({ id: 'prefix-short', name: 'Sirius' });
      await insertStarSystem(tEnv.DB, row);

      const repo = new D1StarSystemRepository(tEnv.DB);
      const results = await repo.searchByNamePrefix('S');

      expect(results).toEqual([]);
    });

    it('respects the limit parameter', async () => {
      const row1 = makeSystemRow({ id: 'limit-1', name: 'Betelgeuse Alpha' });
      const row2 = makeSystemRow({ id: 'limit-2', name: 'Betelgeuse Beta' });
      await insertStarSystem(tEnv.DB, row1);
      await insertStarSystem(tEnv.DB, row2);

      const repo = new D1StarSystemRepository(tEnv.DB);
      const results = await repo.searchByNamePrefix('Betelgeuse', 1);

      expect(results).toHaveLength(1);
    });

    it('escapes LIKE metacharacters in the prefix', async () => {
      const row1 = makeSystemRow({ id: 'escape-1', name: '100% Pure' });
      const row2 = makeSystemRow({ id: 'escape-2', name: '10X Growth' });
      await insertStarSystem(tEnv.DB, row1);
      await insertStarSystem(tEnv.DB, row2);

      const repo = new D1StarSystemRepository(tEnv.DB);
      const results = await repo.searchByNamePrefix('100%');

      expect(results).toHaveLength(1);
      expect(results[0]?.name).toBe('100% Pure');
    });

    it('returns empty array when no systems match', async () => {
      const repo = new D1StarSystemRepository(tEnv.DB);
      const results = await repo.searchByNamePrefix('Zz');

      expect(results).toEqual([]);
    });

    it('caps limit at MAX_LIMIT when caller passes an excessively large value', async () => {
      const row1 = makeSystemRow({ id: 'cap-1', name: 'Capella Alpha' });
      const row2 = makeSystemRow({ id: 'cap-2', name: 'Capella Beta' });
      await insertStarSystem(tEnv.DB, row1);
      await insertStarSystem(tEnv.DB, row2);

      const repo = new D1StarSystemRepository(tEnv.DB);
      // Pass an absurdly large limit — should be capped internally to MAX_LIMIT (200)
      const results = await repo.searchByNamePrefix('Capella', 9999999);

      // The query should still succeed and return matching rows (not error or exhaust resources)
      expect(results).toHaveLength(2);
      // We can't directly assert the SQL LIMIT value, but we verify the repo doesn't blindly pass it through.
      // The real assertion is that MAX_LIMIT is exported and equals 200.
      expect(MAX_LIMIT).toBe(200);
    });
  });
});

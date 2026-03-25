import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  extractInlinedMigrations,
  extractInlinedQueries,
  parseMigrationSql,
  verifyMigrationSync,
} from './check-migration-sync.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('check-migration-sync', () => {
  describe('parseMigrationSql', () => {
    it('splits SQL file content into individual statements', () => {
      const sql = `CREATE TABLE foo (id text);

CREATE TABLE bar (name text);`;
      const result = parseMigrationSql(sql);
      expect(result).toEqual(['CREATE TABLE foo (id text)', 'CREATE TABLE bar (name text)']);
    });

    it('normalizes multi-line statements to single lines', () => {
      const sql = `CREATE TABLE foo (
  id text NOT NULL,
  name text
);`;
      const result = parseMigrationSql(sql);
      expect(result).toEqual(['CREATE TABLE foo (id text NOT NULL, name text)']);
    });

    it('ignores empty statements and trailing semicolons', () => {
      const sql = `CREATE TABLE foo (id text);
;
`;
      const result = parseMigrationSql(sql);
      expect(result).toEqual(['CREATE TABLE foo (id text)']);
    });

    it('preserves inline spacing within statements', () => {
      const sql = 'CREATE INDEX idx_foo ON foo(bar);';
      const result = parseMigrationSql(sql);
      expect(result).toEqual(['CREATE INDEX idx_foo ON foo(bar)']);
    });

    it('splits on semicolons inside string literals (known limitation)', () => {
      // parseMigrationSql uses a naive .split(';') which cannot distinguish
      // statement-terminating semicolons from those inside SQL string literals.
      // This is acceptable because our migration files (DDL) never contain
      // string literals with semicolons. If that changes, the parser must be
      // upgraded to a state-machine approach.
      const sql = "INSERT INTO foo (val) VALUES ('a;b');";
      const result = parseMigrationSql(sql);
      // A correct parser would return: ["INSERT INTO foo (val) VALUES ('a;b')"]
      // Instead, the naive split produces two fragments:
      expect(result).toEqual(["INSERT INTO foo (val) VALUES ('a", "b')"]);
    });
  });

  describe('extractInlinedMigrations', () => {
    it('extracts multiple named migration blocks', () => {
      const content = `const ALL_MIGRATIONS = [
  {
    name: '0001_auth.sql',
    queries: [
      "CREATE TABLE user (id text)",
    ],
  },
  {
    name: '0002_workspace.sql',
    queries: [
      'CREATE TABLE workspace (id text)',
      'CREATE INDEX idx ON workspace(id)',
    ],
  },
];`;
      const result = extractInlinedMigrations(content);
      expect(result).toEqual([
        { name: '0001_auth.sql', queries: ['CREATE TABLE user (id text)'] },
        {
          name: '0002_workspace.sql',
          queries: ['CREATE TABLE workspace (id text)', 'CREATE INDEX idx ON workspace(id)'],
        },
      ]);
    });

    it('throws if no migration blocks are found', () => {
      const content = 'const x = 1;';
      expect(() => extractInlinedMigrations(content)).toThrow(/No migration blocks found/i);
    });
  });

  describe('extractInlinedQueries (deprecated compat)', () => {
    it('extracts string literals from first queries array', () => {
      const content = `const ALL_MIGRATIONS = [
  {
    name: '0001_better_auth_schema.sql',
    queries: [
      "CREATE TABLE foo (id text)",
      'CREATE TABLE bar (name text)',
    ],
  },
];`;
      const result = extractInlinedQueries(content);
      expect(result).toEqual(['CREATE TABLE foo (id text)', 'CREATE TABLE bar (name text)']);
    });

    it('handles single-quoted and double-quoted strings', () => {
      const content = `const ALL_MIGRATIONS = [
  {
    name: '0001.sql',
    queries: [
      'CREATE TABLE a (id text)',
      "CREATE TABLE b (id text)",
    ],
  },
];`;
      const result = extractInlinedQueries(content);
      expect(result).toEqual(['CREATE TABLE a (id text)', 'CREATE TABLE b (id text)']);
    });

    it('throws if queries array is not found', () => {
      const content = 'const x = 1;';
      expect(() => extractInlinedQueries(content)).toThrow(/No migration blocks found/i);
    });
  });

  describe('verifyMigrationSync', () => {
    it('returns ok when migration and inlined queries match', () => {
      const migrationSql = 'CREATE TABLE foo (id text);\nCREATE TABLE bar (name text);';
      const inlinedQueries = ['CREATE TABLE foo (id text)', 'CREATE TABLE bar (name text)'];
      const result = verifyMigrationSync(migrationSql, inlinedQueries, '0001.sql');
      expect(result.ok).toBe(true);
    });

    it('returns error when statements differ', () => {
      const migrationSql = 'CREATE TABLE foo (id text);\nCREATE TABLE bar (name text);';
      const inlinedQueries = ['CREATE TABLE foo (id text)', 'CREATE TABLE baz (name text)'];
      const result = verifyMigrationSync(migrationSql, inlinedQueries, 'my_migration.sql');
      expect(result.ok).toBe(false);
      expect(result.message).toContain('diverged');
      expect(result.message).toContain('my_migration.sql');
    });

    it('returns error when statement count differs', () => {
      const migrationSql = 'CREATE TABLE foo (id text);';
      const inlinedQueries = ['CREATE TABLE foo (id text)', 'CREATE TABLE bar (name text)'];
      const result = verifyMigrationSync(migrationSql, inlinedQueries, '0001.sql');
      expect(result.ok).toBe(false);
      expect(result.message).toContain('count');
    });
  });

  describe('integration: actual files', () => {
    const setupPath = path.resolve(__dirname, '..', 'generated-acceptance-tests', 'setup.ts');
    const setupContent = fs.readFileSync(setupPath, 'utf-8');
    const inlinedMigrations = extractInlinedMigrations(setupContent);

    /** All migration SQL files that should be inlined in setup.ts. */
    const migrationFiles = [
      '0001_better_auth_schema.sql',
      '0002_workspace.sql',
      '0003_actor.sql',
      '0004_area.sql',
      '0005_context.sql',
      '0006_inbox_item.sql',
      '0007_action.sql',
      '0008_audit_event.sql',
    ];

    it('setup.ts contains all expected migration blocks', () => {
      const inlinedNames = inlinedMigrations.map((m) => m.name);
      expect(inlinedNames).toEqual(migrationFiles);
    });

    for (const migrationFilename of migrationFiles) {
      it(`${migrationFilename} is in sync with setup.ts`, () => {
        const migrationPath = path.resolve(__dirname, '..', 'migrations', migrationFilename);
        const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

        const inlined = inlinedMigrations.find((m) => m.name === migrationFilename);
        expect(
          inlined,
          `Migration block for ${migrationFilename} not found in setup.ts`
        ).toBeDefined();

        const result = verifyMigrationSync(migrationSql, inlined!.queries, migrationFilename);
        expect(result.ok, result.message ?? 'migration sync failed').toBe(true);
      });
    }
  });
});

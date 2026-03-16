import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
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
  });

  describe('extractInlinedQueries', () => {
    it('extracts string literals from queries array', () => {
      const content = `const AUTH_MIGRATIONS = [
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
      const content = `const AUTH_MIGRATIONS = [
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
      expect(() => extractInlinedQueries(content)).toThrow(/queries array not found/i);
    });
  });

  describe('verifyMigrationSync', () => {
    it('returns ok when migration and inlined queries match', () => {
      const migrationSql = 'CREATE TABLE foo (id text);\nCREATE TABLE bar (name text);';
      const setupContent = `const AUTH_MIGRATIONS = [
  {
    name: '0001.sql',
    queries: [
      "CREATE TABLE foo (id text)",
      "CREATE TABLE bar (name text)",
    ],
  },
];`;
      const result = verifyMigrationSync(migrationSql, setupContent, '0001.sql');
      expect(result.ok).toBe(true);
    });

    it('returns error when statements differ', () => {
      const migrationSql = 'CREATE TABLE foo (id text);\nCREATE TABLE bar (name text);';
      const setupContent = `const AUTH_MIGRATIONS = [
  {
    name: '0001.sql',
    queries: [
      "CREATE TABLE foo (id text)",
      "CREATE TABLE baz (name text)",
    ],
  },
];`;
      const result = verifyMigrationSync(migrationSql, setupContent, 'my_migration.sql');
      expect(result.ok).toBe(false);
      expect(result.message).toContain('diverged');
      expect(result.message).toContain('my_migration.sql');
    });

    it('returns error when statement count differs', () => {
      const migrationSql = 'CREATE TABLE foo (id text);';
      const setupContent = `const AUTH_MIGRATIONS = [
  {
    name: '0001.sql',
    queries: [
      "CREATE TABLE foo (id text)",
      "CREATE TABLE bar (name text)",
    ],
  },
];`;
      const result = verifyMigrationSync(migrationSql, setupContent, '0001.sql');
      expect(result.ok).toBe(false);
      expect(result.message).toContain('count');
    });
  });

  describe('integration: actual files', () => {
    it('migration file and setup.ts inlined SQL are in sync', () => {
      const migrationFilename = '0001_better_auth_schema.sql';
      const migrationPath = path.resolve(__dirname, '..', 'migrations', migrationFilename);
      const setupPath = path.resolve(__dirname, '..', 'generated-acceptance-tests', 'setup.ts');

      const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
      const setupContent = fs.readFileSync(setupPath, 'utf-8');

      const result = verifyMigrationSync(migrationSql, setupContent, migrationFilename);
      expect(result.ok, result.message ?? 'migration sync failed').toBe(true);
    });
  });
});

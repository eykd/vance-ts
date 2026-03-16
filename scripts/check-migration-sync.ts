/**
 * Build-time check: verifies that inlined AUTH_MIGRATIONS SQL in
 * generated-acceptance-tests/setup.ts matches the source migration file.
 *
 * Can be run standalone: npx tsx scripts/check-migration-sync.ts
 * Also tested via: npx vitest run scripts/check-migration-sync.spec.ts
 */

export interface SyncResult {
  /** Whether the inlined SQL matches the source migration. */
  ok: boolean;
  /** Human-readable explanation when ok is false. */
  message?: string;
}

/**
 * Parse a SQL migration file into individual normalized statements.
 * Splits on semicolons, collapses whitespace, and trims each statement.
 */
export function parseMigrationSql(sql: string): string[] {
  return sql
    .split(';')
    .map((stmt) =>
      stmt
        .replace(/\s+/g, ' ')
        .replace(/\(\s+/g, '(')
        .replace(/\s+\)/g, ')')
        .trim(),
    )
    .filter((stmt) => stmt.length > 0);
}

/**
 * Extract the query strings from the AUTH_MIGRATIONS queries array
 * in the acceptance test setup file content.
 */
export function extractInlinedQueries(content: string): string[] {
  const queriesMatch = content.match(/queries:\s*\[([^\]]+)\]/s);
  if (!queriesMatch?.[1]) {
    throw new Error('queries array not found in setup file content');
  }

  const queriesBlock = queriesMatch[1];
  const strings: string[] = [];

  // Match both single-quoted and double-quoted string literals
  const stringPattern = /(['"])((?:(?!\1).)*)\1/g;
  let match: RegExpExecArray | null;
  while ((match = stringPattern.exec(queriesBlock)) !== null) {
    if (match[2] !== undefined) {
      strings.push(match[2]);
    }
  }

  return strings;
}

/**
 * Verify that a migration SQL file and the inlined setup.ts queries are in sync.
 */
export function verifyMigrationSync(
  migrationSql: string,
  setupContent: string,
): SyncResult {
  const migrationStatements = parseMigrationSql(migrationSql);
  const inlinedQueries = extractInlinedQueries(setupContent);

  if (migrationStatements.length !== inlinedQueries.length) {
    return {
      ok: false,
      message:
        `Statement count mismatch: migration has ${migrationStatements.length} ` +
        `statements, setup.ts has ${inlinedQueries.length} inlined queries.`,
    };
  }

  // Normalize inlined queries the same way we normalize migration statements
  const normalizedInlined = inlinedQueries.map((q) =>
    q.replace(/\s+/g, ' ').trim(),
  );

  for (let i = 0; i < migrationStatements.length; i++) {
    if (migrationStatements[i] !== normalizedInlined[i]) {
      return {
        ok: false,
        message:
          `Inlined AUTH_MIGRATIONS has diverged from migrations/0001_better_auth_schema.sql ` +
          `at statement ${i + 1}.\n` +
          `  Migration: ${migrationStatements[i]}\n` +
          `  Inlined:   ${normalizedInlined[i]}`,
      };
    }
  }

  return { ok: true };
}

/** Run the sync check as a standalone CLI script. */
function main(): void {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const fs = require('node:fs') as typeof import('node:fs');
  const path = require('node:path') as typeof import('node:path');
  /* eslint-enable @typescript-eslint/no-require-imports */

  const root = path.dirname(path.resolve(process.argv[1] ?? __filename));
  const migrationPath = path.resolve(
    root,
    '..',
    'migrations',
    '0001_better_auth_schema.sql',
  );
  const setupPath = path.resolve(
    root,
    '..',
    'generated-acceptance-tests',
    'setup.ts',
  );

  const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
  const setupContent = fs.readFileSync(setupPath, 'utf-8');

  const result = verifyMigrationSync(migrationSql, setupContent);

  if (result.ok) {
    console.log('✅ Migration sync check passed.');
  } else {
    console.error('❌ Migration sync check FAILED:');
    console.error(result.message);
    process.exit(1);
  }
}

// Standalone CLI execution
if (
  typeof process !== 'undefined' &&
  process.argv[1]?.endsWith('check-migration-sync.ts')
) {
  main();
}

/**
 * Build-time check: verifies that inlined AUTH_MIGRATIONS SQL in
 * generated-acceptance-tests/setup.ts matches the source migration file.
 *
 * Tested via: npx vitest run scripts/check-migration-sync.spec.ts
 * Runs as part of: npx vitest run (node project)
 */

/** Result of comparing migration SQL against inlined queries. */
export interface SyncResult {
  /** Whether the inlined SQL matches the source migration. */
  ok: boolean;
  /** Human-readable explanation when ok is false. */
  message?: string;
}

/**
 * Parse a SQL migration file into individual normalized statements.
 * Splits on semicolons, collapses whitespace, normalizes paren spacing, and trims.
 *
 * @param sql - raw SQL file content
 *
 * @returns array of normalized SQL statement strings
 */
export function parseMigrationSql(sql: string): string[] {
  return sql
    .split(';')
    .map((stmt) => stmt.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim())
    .filter((stmt) => stmt.length > 0);
}

/**
 * Extract the query strings from the AUTH_MIGRATIONS queries array
 * in the acceptance test setup file content.
 *
 * @param content - TypeScript source of the setup file
 *
 * @returns array of query strings found in the queries array
 */
export function extractInlinedQueries(content: string): string[] {
  const queriesMatch = content.match(/queries:\s*\[([^\]]+)\]/s);
  const queriesBlock = queriesMatch?.[1];
  if (queriesBlock === undefined) {
    throw new Error('queries array not found in setup file content');
  }

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
 *
 * @param migrationSql - raw SQL content from the migration file
 * @param setupContent - TypeScript source of the acceptance test setup file
 * @param migrationFilename - display name of the migration file for error messages
 *
 * @returns sync result with ok flag and optional error message
 */
export function verifyMigrationSync(
  migrationSql: string,
  setupContent: string,
  migrationFilename: string
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
  const normalizedInlined = inlinedQueries.map((q) => q.replace(/\s+/g, ' ').trim());

  for (let i = 0; i < migrationStatements.length; i++) {
    if (migrationStatements[i] !== normalizedInlined[i]) {
      return {
        ok: false,
        message:
          `Inlined AUTH_MIGRATIONS has diverged from ` +
          `${migrationFilename} at statement ${i + 1}.\n` +
          `  Migration: ${migrationStatements[i]}\n` +
          `  Inlined:   ${normalizedInlined[i]}`,
      };
    }
  }

  return { ok: true };
}

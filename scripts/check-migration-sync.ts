/**
 * Build-time check: verifies that inlined ALL_MIGRATIONS SQL in
 * generated-acceptance-tests/setup.ts matches the source migration files.
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

/** A named migration block extracted from the setup file. */
export interface InlinedMigration {
  /** The migration file name (e.g. '0001_better_auth_schema.sql'). */
  name: string;
  /** The SQL query strings from the queries array. */
  queries: string[];
}

/**
 * Parse a SQL migration file into individual normalized statements.
 * Splits on semicolons, collapses whitespace, normalizes paren spacing, and trims.
 *
 * **Limitation:** Uses a naive `.split(';')` which will incorrectly split on
 * semicolons inside SQL string literals (e.g. `DEFAULT 'foo;bar'`). This is
 * acceptable for DDL-only migrations. If migrations start containing string
 * literals with semicolons, upgrade to a state-machine parser.
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
 * Extract string literals from a queries array block.
 *
 * @param queriesBlock - the content inside the queries: [...] brackets
 *
 * @returns array of extracted string values
 */
function extractStringsFromBlock(queriesBlock: string): string[] {
  const strings: string[] = [];
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
 * Extract all named migration blocks from the setup file content.
 *
 * Finds each `{ name: '...', queries: [...] }` block in the ALL_MIGRATIONS array.
 *
 * **Limitation:** Uses `[^\]]+` to match the queries array block, which will
 * truncate at the first `]` inside SQL content. This is acceptable while migrations
 * contain only DDL without bracket characters.
 *
 * @param content - TypeScript source of the setup file
 *
 * @returns array of inlined migration blocks with name and queries
 */
export function extractInlinedMigrations(content: string): InlinedMigration[] {
  const migrations: InlinedMigration[] = [];
  const blockPattern = /name:\s*['"]([^'"]+)['"]\s*,\s*queries:\s*\[([^\]]+)\]/gs;
  let match: RegExpExecArray | null;
  while ((match = blockPattern.exec(content)) !== null) {
    const name = match[1];
    const queriesBlock = match[2];
    if (name !== undefined && queriesBlock !== undefined) {
      migrations.push({ name, queries: extractStringsFromBlock(queriesBlock) });
    }
  }
  if (migrations.length === 0) {
    throw new Error('No migration blocks found in setup file content');
  }
  return migrations;
}

/**
 * Extract the query strings from the first queries array in the setup file content.
 *
 * @deprecated Use extractInlinedMigrations for multi-migration support.
 * @param content - TypeScript source of the setup file
 *
 * @returns array of query strings found in the queries array
 */
export function extractInlinedQueries(content: string): string[] {
  const migrations = extractInlinedMigrations(content);
  if (migrations.length === 0) {
    throw new Error('queries array not found in setup file content');
  }
  return migrations[0]!.queries;
}

/**
 * Verify that a migration SQL file matches the corresponding inlined block in setup.ts.
 *
 * @param migrationSql - raw SQL content from the migration file
 * @param inlinedQueries - query strings extracted from the setup file for this migration
 * @param migrationFilename - display name of the migration file for error messages
 *
 * @returns sync result with ok flag and optional error message
 */
export function verifyMigrationSync(
  migrationSql: string,
  inlinedQueries: string[],
  migrationFilename: string
): SyncResult {
  const migrationStatements = parseMigrationSql(migrationSql);

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
          `Inlined ALL_MIGRATIONS has diverged from ` +
          `${migrationFilename} at statement ${i + 1}.\n` +
          `  Migration: ${migrationStatements[i]}\n` +
          `  Inlined:   ${normalizedInlined[i]}`,
      };
    }
  }

  return { ok: true };
}

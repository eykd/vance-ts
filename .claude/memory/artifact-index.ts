import BetterSqlite3, { type Database } from 'better-sqlite3';

/**
 * Search result from the artifact index
 */
export interface SearchResult {
  path: string;
  content: string;
  rank: number;
}

/**
 * ArtifactIndex provides full-text search over handoff artifacts using SQLite FTS5
 */
export class ArtifactIndex {
  private db: Database;

  /**
   * Creates or opens an artifact index database
   *
   * @param dbPath - Path to the SQLite database file
   */
  constructor(dbPath: string) {
    this.db = new BetterSqlite3(dbPath);

    // Create FTS5 virtual table for full-text search
    this.db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS artifacts USING fts5(
        path UNINDEXED,
        content,
        tokenize = 'porter ascii'
      );
    `);
  }

  /**
   * Indexes a handoff file for full-text search
   *
   * @param path - Path to the handoff file
   * @param content - Content of the handoff file
   */
  indexHandoff(path: string, content: string): void {
    const stmt = this.db.prepare('INSERT INTO artifacts (path, content) VALUES (?, ?)');
    stmt.run(path, content);
  }

  /**
   * Searches indexed artifacts using full-text search
   *
   * @param query - Search query string
   * @returns Array of search results ranked by relevance
   */
  search(query: string): SearchResult[] {
    const stmt = this.db.prepare(`
      SELECT path, content, rank
      FROM artifacts
      WHERE artifacts MATCH ?
      ORDER BY rank
    `);

    const results = stmt.all(query) as SearchResult[];
    return results;
  }

  /**
   * Closes the database connection
   */
  close(): void {
    this.db.close();
  }
}

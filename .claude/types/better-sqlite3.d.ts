declare module 'better-sqlite3' {
  /**
   * Database interface for better-sqlite3
   */
  export interface Database {
    exec(source: string): void;
    prepare(source: string): Statement;
    close(): void;
  }

  /**
   * Statement interface for prepared SQL statements
   */
  export interface Statement {
    run(...params: unknown[]): void;
    all(...params: unknown[]): unknown[];
  }

  interface DatabaseConstructor {
    new (filename: string, options?: unknown): Database;
    (filename: string, options?: unknown): Database;
  }

  const BetterSqlite3: DatabaseConstructor;
  export default BetterSqlite3;
}

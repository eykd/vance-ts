/**
 * D1 date-serialisation proxy for use with Drizzle ORM.
 *
 * D1 (Cloudflare's SQLite wrapper) only accepts strings, numbers, and null as
 * query parameter values. `better-auth` passes JavaScript `Date` objects for
 * timestamp fields, and `drizzle-orm/sqlite-core`'s `text` column has no
 * `mapToDriverValue` that converts `Date` to a string (only `mode: 'json'` is
 * supported, not `mode: 'date'`).
 *
 * `wrapD1ForDrizzle` returns a `D1Database`-shaped wrapper. It delegates all
 * methods to the original binding, except `prepare()`, which returns a
 * statement wrapper whose `bind()` converts every `Date` argument to an
 * ISO-8601 UTC string before delegating to the real prepared statement.
 *
 * @module
 */

/**
 * Converts any `Date` element in `params` to an ISO-8601 string; passes all
 * other values through unchanged.
 *
 * @param params - Raw bind parameters that may include `Date` objects.
 * @returns A new array with every `Date` replaced by its `.toISOString()` value.
 */
function serialiseDates(params: unknown[]): unknown[] {
  return params.map((p) => (p instanceof Date ? p.toISOString() : p));
}

/**
 * Wraps a `D1PreparedStatement` so that `bind()` converts `Date` objects to
 * ISO-8601 strings before delegating to the original statement.
 *
 * @param stmt - The original statement returned by `db.prepare()`.
 * @returns A statement with date-aware `bind()`.
 */
function wrapStatement(stmt: D1PreparedStatement): D1PreparedStatement {
  return new Proxy(stmt, {
    get(target, prop): unknown {
      if (prop === 'bind') {
        return (...params: unknown[]): D1PreparedStatement =>
          target.bind(...serialiseDates(params));
      }
      return Reflect.get(target, prop, target) as unknown;
    },
  });
}

/**
 * Wraps a `D1Database` binding so that `Date` objects in query parameters are
 * serialised to ISO-8601 strings before reaching D1.
 *
 * Pass the returned value to `drizzle(wrapD1ForDrizzle(env.DB))` instead of
 * `drizzle(env.DB)` when the schema contains timestamp fields that `better-auth`
 * populates with `Date` objects.
 *
 * @param db - The original D1Database binding from the Workers environment.
 * @returns A wrapped database whose `prepare()` returns a date-aware statement.
 */
export function wrapD1ForDrizzle(db: D1Database): D1Database {
  return new Proxy(db, {
    get(target, prop): unknown {
      if (prop === 'prepare') {
        return (sql: string): D1PreparedStatement => wrapStatement(target.prepare(sql));
      }
      return Reflect.get(target, prop, target) as unknown;
    },
  });
}

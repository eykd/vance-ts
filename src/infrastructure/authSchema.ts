/**
 * Drizzle ORM schema definitions for the better-auth authentication tables.
 *
 * These definitions must match the SQL schema in `migrations/0001_better_auth_schema.sql`
 * exactly. The `drizzleAdapter` used by better-auth looks up tables by their exported
 * names (`user`, `session`, `account`, `verification`), so the export names are
 * significant.
 *
 * Timestamp columns are plain `text` columns. Date-to-ISO-string serialisation is
 * handled by the `wrapD1ForDrizzle` proxy in `d1DateProxy.ts`, which intercepts
 * `D1PreparedStatement.bind()` and converts `Date` objects to ISO-8601 strings before
 * they reach D1. The drizzle-orm sqlite-core `text` column does not support
 * `mode: 'date'` — only `mode: 'json'` is valid.
 *
 * @module
 */

import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * The `user` table — stores registered user accounts.
 *
 * Fields mirror the better-auth default user model.
 */
export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified').notNull().default(0),
  image: text('image'),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
});

/**
 * The `session` table — stores active user sessions.
 *
 * `token` is stored as an HMAC-SHA256 hash (see `auth.ts` `databaseHooks`).
 * `expiresAt` is an ISO-8601 UTC timestamp string written via the D1 date proxy.
 */
export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: text('expiresAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
});

/**
 * The `account` table — stores OAuth provider accounts linked to users.
 *
 * Reserved for future OAuth provider integrations (e.g. Google Sign-In via FR-010).
 * Currently unpopulated in the email-password-only baseline.
 */
export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: text('accessTokenExpiresAt'),
  refreshTokenExpiresAt: text('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
});

/**
 * The `verification` table — stores email verification and password-reset tokens.
 *
 * `value` is stored as an HMAC-SHA256 hash (see `auth.ts` `databaseHooks`).
 * `expiresAt` is an ISO-8601 UTC timestamp string written via the D1 date proxy.
 * Reserved for future email-verification and password-reset flows.
 */
export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: text('expiresAt').notNull(),
  createdAt: text('createdAt'),
  updatedAt: text('updatedAt'),
});

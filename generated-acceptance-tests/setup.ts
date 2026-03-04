/**
 * Vitest setup file for acceptance tests.
 * Registered via vitest.config.ts for the acceptance project.
 */

import { applyD1Migrations, env } from 'cloudflare:test';
import { beforeAll, beforeEach } from 'vitest';

/**
 * Auth schema migration, inlined to avoid Node.js file-system access from the Workers runtime.
 *
 * SOURCE OF TRUTH: migrations/0001_better_auth_schema.sql
 *
 * This constant duplicates the SQL from that file and MUST be kept in sync manually.
 * If you update migrations/0001_better_auth_schema.sql, update the queries array below
 * to match, or acceptance tests will run against a stale schema without any warning.
 */
const AUTH_MIGRATIONS = [
  {
    name: '0001_better_auth_schema.sql',
    queries: [
      "CREATE TABLE `user` (`id` text NOT NULL, `name` text NOT NULL, `email` text NOT NULL UNIQUE, `emailVerified` integer NOT NULL DEFAULT 0, `image` text, `createdAt` text NOT NULL, `updatedAt` text NOT NULL, PRIMARY KEY(`id`))",
      "CREATE TABLE `session` (`id` text NOT NULL, `userId` text NOT NULL REFERENCES `user`(`id`) ON DELETE CASCADE, `token` text NOT NULL UNIQUE, `expiresAt` text NOT NULL, `ipAddress` text, `userAgent` text, `createdAt` text NOT NULL, `updatedAt` text NOT NULL, PRIMARY KEY(`id`))",
      'CREATE INDEX idx_session_userId ON session(userId)',
      "CREATE TABLE `account` (`id` text NOT NULL, `userId` text NOT NULL REFERENCES `user`(`id`) ON DELETE CASCADE, `accountId` text NOT NULL, `providerId` text NOT NULL, `accessToken` text, `refreshToken` text, `idToken` text, `accessTokenExpiresAt` text, `refreshTokenExpiresAt` text, `scope` text, `password` text, `createdAt` text NOT NULL, `updatedAt` text NOT NULL, PRIMARY KEY(`id`))",
      'CREATE INDEX idx_account_userId ON account(userId)',
      "CREATE TABLE `verification` (`id` text NOT NULL, `identifier` text NOT NULL, `value` text NOT NULL, `expiresAt` text NOT NULL, `createdAt` text, `updatedAt` text, PRIMARY KEY(`id`))",
    ],
  },
];

/**
 * Domain schema migrations, inlined to avoid Node.js file-system access from the Workers runtime.
 *
 * SOURCE OF TRUTH: migrations/0002_workspace.sql through migrations/0008_audit_event.sql
 *
 * This constant duplicates the SQL from those files and MUST be kept in sync manually.
 */
const DOMAIN_MIGRATIONS = [
  {
    name: '0002_workspace.sql',
    queries: [
      'CREATE TABLE workspace (id TEXT PRIMARY KEY, user_id TEXT NOT NULL UNIQUE REFERENCES user(id) ON DELETE CASCADE, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)',
    ],
  },
  {
    name: '0003_actor.sql',
    queries: [
      "CREATE TABLE actor (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE, user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE, type TEXT NOT NULL CHECK (type IN ('human', 'agent')), created_at TEXT NOT NULL)",
      'CREATE INDEX idx_actor_workspace_id ON actor(workspace_id)',
    ],
  },
  {
    name: '0004_area.sql',
    queries: [
      "CREATE TABLE area (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')), created_at TEXT NOT NULL, updated_at TEXT NOT NULL)",
      'CREATE INDEX idx_area_workspace_id ON area(workspace_id)',
    ],
  },
  {
    name: '0005_context.sql',
    queries: [
      'CREATE TABLE context (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE, name TEXT NOT NULL, created_at TEXT NOT NULL)',
      'CREATE INDEX idx_context_workspace_id ON context(workspace_id)',
    ],
  },
  {
    name: '0006_inbox_item.sql',
    queries: [
      "CREATE TABLE inbox_item (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE, title TEXT NOT NULL, description TEXT, status TEXT NOT NULL DEFAULT 'inbox' CHECK (status IN ('inbox', 'clarified')), clarified_into_type TEXT CHECK (clarified_into_type IN ('action')), clarified_into_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)",
      'CREATE INDEX idx_inbox_item_workspace_id ON inbox_item(workspace_id)',
    ],
  },
  {
    name: '0007_action.sql',
    queries: [
      "CREATE TABLE action (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE, created_by_actor_id TEXT NOT NULL REFERENCES actor(id), title TEXT NOT NULL, description TEXT, status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('ready', 'active', 'done', 'waiting', 'scheduled', 'archived')), area_id TEXT NOT NULL REFERENCES area(id), context_id TEXT NOT NULL REFERENCES context(id), project_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)",
      'CREATE INDEX idx_action_workspace_id ON action(workspace_id)',
      'CREATE INDEX idx_action_workspace_status ON action(workspace_id, status)',
    ],
  },
  {
    name: '0008_audit_event.sql',
    queries: [
      'CREATE TABLE audit_event (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspace(id) ON DELETE CASCADE, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, event_type TEXT NOT NULL, actor_id TEXT NOT NULL REFERENCES actor(id), payload TEXT NOT NULL, created_at TEXT NOT NULL)',
      'CREATE INDEX idx_audit_event_workspace_id ON audit_event(workspace_id)',
      'CREATE INDEX idx_audit_event_entity ON audit_event(entity_type, entity_id)',
    ],
  },
];

// Apply all schema migrations once per worker isolate (i.e., once per test file).
beforeAll(async () => {
  await applyD1Migrations(env.DB, AUTH_MIGRATIONS);
  await applyD1Migrations(env.DB, DOMAIN_MIGRATIONS);
});

beforeEach(async () => {
  // Clear all tables before each test to ensure isolation.
  // Delete order respects FK constraints (children before parent).
  await env.DB.exec('DELETE FROM audit_event');
  await env.DB.exec('DELETE FROM action');
  await env.DB.exec('DELETE FROM inbox_item');
  await env.DB.exec('DELETE FROM context');
  await env.DB.exec('DELETE FROM area');
  await env.DB.exec('DELETE FROM actor');
  await env.DB.exec('DELETE FROM workspace');
  await env.DB.exec('DELETE FROM session');
  await env.DB.exec('DELETE FROM account');
  await env.DB.exec('DELETE FROM verification');
  await env.DB.exec('DELETE FROM user');
});

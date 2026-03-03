/**
 * Drizzle ORM schema definitions for the clawtask domain tables.
 *
 * These definitions must match the SQL schema in the migration files
 * (0002_workspace.sql through 0008_audit_event.sql) exactly.
 * Timestamp columns use plain `text` columns storing ISO-8601 UTC strings.
 *
 * @see specs/012-clawtask-vertical-slice/data-model.md
 * @module
 */

import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * The `workspace` table — tenant boundary, one per user account.
 */
export const workspaceTable = sqliteTable('workspace', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

/**
 * The `actor` table — identity within a workspace that can author mutations.
 */
export const actorTable = sqliteTable(
  'actor',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull(),
    userId: text('user_id').notNull(),
    type: text('type', { enum: ['human', 'agent'] }).notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [index('idx_actor_workspace_id').on(table.workspaceId)],
);

/**
 * The `area` table — sphere of responsibility (e.g. Work, Personal).
 */
export const areaTable = sqliteTable(
  'area',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull(),
    name: text('name').notNull(),
    status: text('status', { enum: ['active', 'archived'] }).notNull().default('active'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('idx_area_workspace_id').on(table.workspaceId)],
);

/**
 * The `context` table — situational tag indicating where/how an action can be done.
 */
export const contextTable = sqliteTable(
  'context',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull(),
    name: text('name').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [index('idx_context_workspace_id').on(table.workspaceId)],
);

/**
 * The `inbox_item` table — raw captured thought; lifecycle: inbox → clarified.
 */
export const inboxItemTable = sqliteTable(
  'inbox_item',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status', { enum: ['inbox', 'clarified'] }).notNull().default('inbox'),
    clarifiedIntoType: text('clarified_into_type', { enum: ['action'] }),
    clarifiedIntoId: text('clarified_into_id'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('idx_inbox_item_workspace_id').on(table.workspaceId)],
);

/**
 * The `action` table — concrete, single next step.
 */
export const actionTable = sqliteTable(
  'action',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull(),
    createdByActorId: text('created_by_actor_id').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status', {
      enum: ['ready', 'active', 'done', 'waiting', 'scheduled', 'archived'],
    })
      .notNull()
      .default('ready'),
    areaId: text('area_id').notNull(),
    contextId: text('context_id').notNull(),
    projectId: text('project_id'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_action_workspace_id').on(table.workspaceId),
    index('idx_action_workspace_status').on(table.workspaceId, table.status),
  ],
);

/**
 * The `audit_event` table — immutable, append-only record of every state-changing mutation.
 */
export const auditEventTable = sqliteTable(
  'audit_event',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    eventType: text('event_type').notNull(),
    actorId: text('actor_id').notNull(),
    payload: text('payload').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('idx_audit_event_workspace_id').on(table.workspaceId),
    index('idx_audit_event_entity').on(table.entityType, table.entityId),
  ],
);

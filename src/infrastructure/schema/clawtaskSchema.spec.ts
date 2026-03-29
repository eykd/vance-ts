/**
 * Tests for the Drizzle ORM schema definitions for clawtask domain tables.
 *
 * These tests verify that each table constant exports the correct SQL table name
 * and column structure as defined in specs/012-clawtask-vertical-slice/data-model.md.
 *
 * @module
 */

import { getTableConfig } from 'drizzle-orm/sqlite-core';
import type { ForeignKey } from 'drizzle-orm/sqlite-core';
import { describe, expect, it } from 'vitest';

import {
  actionTable,
  actorTable,
  areaTable,
  auditEventTable,
  contextTable,
  inboxItemTable,
  workspaceTable,
} from './clawtaskSchema';

/**
 * Finds a foreign key by the source column name in the given table config.
 *
 * @param foreignKeys - the foreign keys from getTableConfig
 * @param columnName - the source column name to search for
 * @returns the FK target info, or undefined if not found
 */
function findFk(
  foreignKeys: readonly ForeignKey[],
  columnName: string
): { tableName: string; columnName: string; onDelete: string | undefined } | undefined {
  for (const fk of foreignKeys) {
    const ref = fk.reference();
    const srcCol = ref.columns.find((c) => c.name === columnName);
    if (srcCol !== undefined) {
      return {
        tableName: getTableConfig(ref.foreignTable).name,
        columnName: ref.foreignColumns[0]?.name ?? '',
        onDelete: fk.onDelete,
      };
    }
  }
  return undefined;
}

describe('workspaceTable', () => {
  it('has the correct SQL table name', () => {
    const config = getTableConfig(workspaceTable);
    expect(config.name).toBe('workspace');
  });

  it('has all required columns', () => {
    const config = getTableConfig(workspaceTable);
    const columnNames = config.columns.map((c) => c.name);
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('user_id');
    expect(columnNames).toContain('created_at');
    expect(columnNames).toContain('updated_at');
  });

  it('has user_id as unique', () => {
    const config = getTableConfig(workspaceTable);
    const userIdCol = config.columns.find((c) => c.name === 'user_id');
    expect(userIdCol?.isUnique).toBe(true);
  });

  it('has user_id FK referencing user(id) ON DELETE CASCADE', () => {
    const config = getTableConfig(workspaceTable);
    const fk = findFk(config.foreignKeys, 'user_id');
    expect(fk).toEqual({ tableName: 'user', columnName: 'id', onDelete: 'cascade' });
  });
});

describe('actorTable', () => {
  it('has the correct SQL table name', () => {
    const config = getTableConfig(actorTable);
    expect(config.name).toBe('actor');
  });

  it('has all required columns', () => {
    const config = getTableConfig(actorTable);
    const columnNames = config.columns.map((c) => c.name);
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('workspace_id');
    expect(columnNames).toContain('user_id');
    expect(columnNames).toContain('type');
    expect(columnNames).toContain('created_at');
  });

  it('has type column with human/agent enum', () => {
    const config = getTableConfig(actorTable);
    const typeCol = config.columns.find((c) => c.name === 'type');
    expect(typeCol?.enumValues).toEqual(['human', 'agent']);
  });

  it('has workspace_id FK referencing workspace(id) ON DELETE CASCADE', () => {
    const config = getTableConfig(actorTable);
    const fk = findFk(config.foreignKeys, 'workspace_id');
    expect(fk).toEqual({ tableName: 'workspace', columnName: 'id', onDelete: 'cascade' });
  });

  it('has user_id FK referencing user(id) ON DELETE CASCADE', () => {
    const config = getTableConfig(actorTable);
    const fk = findFk(config.foreignKeys, 'user_id');
    expect(fk).toEqual({ tableName: 'user', columnName: 'id', onDelete: 'cascade' });
  });
});

describe('areaTable', () => {
  it('has the correct SQL table name', () => {
    const config = getTableConfig(areaTable);
    expect(config.name).toBe('area');
  });

  it('has all required columns', () => {
    const config = getTableConfig(areaTable);
    const columnNames = config.columns.map((c) => c.name);
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('workspace_id');
    expect(columnNames).toContain('name');
    expect(columnNames).toContain('status');
    expect(columnNames).toContain('created_at');
    expect(columnNames).toContain('updated_at');
  });

  it('has status column with active/archived enum and default active', () => {
    const config = getTableConfig(areaTable);
    const statusCol = config.columns.find((c) => c.name === 'status');
    expect(statusCol?.enumValues).toEqual(['active', 'archived']);
    expect(statusCol?.default).toBe('active');
  });

  it('has workspace_id FK referencing workspace(id) ON DELETE CASCADE', () => {
    const config = getTableConfig(areaTable);
    const fk = findFk(config.foreignKeys, 'workspace_id');
    expect(fk).toEqual({ tableName: 'workspace', columnName: 'id', onDelete: 'cascade' });
  });
});

describe('contextTable', () => {
  it('has the correct SQL table name', () => {
    const config = getTableConfig(contextTable);
    expect(config.name).toBe('context');
  });

  it('has all required columns', () => {
    const config = getTableConfig(contextTable);
    const columnNames = config.columns.map((c) => c.name);
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('workspace_id');
    expect(columnNames).toContain('name');
    expect(columnNames).toContain('created_at');
  });

  it('has workspace_id FK referencing workspace(id) ON DELETE CASCADE', () => {
    const config = getTableConfig(contextTable);
    const fk = findFk(config.foreignKeys, 'workspace_id');
    expect(fk).toEqual({ tableName: 'workspace', columnName: 'id', onDelete: 'cascade' });
  });
});

describe('inboxItemTable', () => {
  it('has the correct SQL table name', () => {
    const config = getTableConfig(inboxItemTable);
    expect(config.name).toBe('inbox_item');
  });

  it('has all required columns', () => {
    const config = getTableConfig(inboxItemTable);
    const columnNames = config.columns.map((c) => c.name);
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('workspace_id');
    expect(columnNames).toContain('title');
    expect(columnNames).toContain('description');
    expect(columnNames).toContain('status');
    expect(columnNames).toContain('clarified_into_type');
    expect(columnNames).toContain('clarified_into_id');
    expect(columnNames).toContain('created_at');
    expect(columnNames).toContain('updated_at');
  });

  it('has status column with inbox/clarified enum and default inbox', () => {
    const config = getTableConfig(inboxItemTable);
    const statusCol = config.columns.find((c) => c.name === 'status');
    expect(statusCol?.enumValues).toEqual(['inbox', 'clarified']);
    expect(statusCol?.default).toBe('inbox');
  });

  it('has clarified_into_type column with action enum', () => {
    const config = getTableConfig(inboxItemTable);
    const col = config.columns.find((c) => c.name === 'clarified_into_type');
    expect(col?.enumValues).toEqual(['action']);
  });

  it('has workspace_id FK referencing workspace(id) ON DELETE CASCADE', () => {
    const config = getTableConfig(inboxItemTable);
    const fk = findFk(config.foreignKeys, 'workspace_id');
    expect(fk).toEqual({ tableName: 'workspace', columnName: 'id', onDelete: 'cascade' });
  });
});

describe('actionTable', () => {
  it('has the correct SQL table name', () => {
    const config = getTableConfig(actionTable);
    expect(config.name).toBe('action');
  });

  it('has all required columns', () => {
    const config = getTableConfig(actionTable);
    const columnNames = config.columns.map((c) => c.name);
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('workspace_id');
    expect(columnNames).toContain('created_by_actor_id');
    expect(columnNames).toContain('title');
    expect(columnNames).toContain('description');
    expect(columnNames).toContain('status');
    expect(columnNames).toContain('area_id');
    expect(columnNames).toContain('context_id');
    expect(columnNames).toContain('project_id');
    expect(columnNames).toContain('created_at');
    expect(columnNames).toContain('updated_at');
  });

  it('has status column with correct enum values and default ready', () => {
    const config = getTableConfig(actionTable);
    const statusCol = config.columns.find((c) => c.name === 'status');
    expect(statusCol?.enumValues).toEqual([
      'ready',
      'active',
      'done',
      'waiting',
      'scheduled',
      'archived',
    ]);
    expect(statusCol?.default).toBe('ready');
  });

  it('has workspace_id FK referencing workspace(id) ON DELETE CASCADE', () => {
    const config = getTableConfig(actionTable);
    const fk = findFk(config.foreignKeys, 'workspace_id');
    expect(fk).toEqual({ tableName: 'workspace', columnName: 'id', onDelete: 'cascade' });
  });

  it('has created_by_actor_id FK referencing actor(id) ON DELETE CASCADE', () => {
    const config = getTableConfig(actionTable);
    const fk = findFk(config.foreignKeys, 'created_by_actor_id');
    expect(fk).toEqual({ tableName: 'actor', columnName: 'id', onDelete: 'cascade' });
  });

  it('has area_id FK referencing area(id) with no cascade', () => {
    const config = getTableConfig(actionTable);
    const fk = findFk(config.foreignKeys, 'area_id');
    expect(fk).toEqual({ tableName: 'area', columnName: 'id', onDelete: undefined });
  });

  it('has context_id FK referencing context(id) with no cascade', () => {
    const config = getTableConfig(actionTable);
    const fk = findFk(config.foreignKeys, 'context_id');
    expect(fk).toEqual({ tableName: 'context', columnName: 'id', onDelete: undefined });
  });
});

describe('auditEventTable', () => {
  it('has the correct SQL table name', () => {
    const config = getTableConfig(auditEventTable);
    expect(config.name).toBe('audit_event');
  });

  it('has all required columns', () => {
    const config = getTableConfig(auditEventTable);
    const columnNames = config.columns.map((c) => c.name);
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('workspace_id');
    expect(columnNames).toContain('entity_type');
    expect(columnNames).toContain('entity_id');
    expect(columnNames).toContain('event_type');
    expect(columnNames).toContain('actor_id');
    expect(columnNames).toContain('payload');
    expect(columnNames).toContain('created_at');
  });

  it('has workspace_id FK referencing workspace(id) ON DELETE CASCADE', () => {
    const config = getTableConfig(auditEventTable);
    const fk = findFk(config.foreignKeys, 'workspace_id');
    expect(fk).toEqual({ tableName: 'workspace', columnName: 'id', onDelete: 'cascade' });
  });

  it('has actor_id FK referencing actor(id) ON DELETE CASCADE', () => {
    const config = getTableConfig(auditEventTable);
    const fk = findFk(config.foreignKeys, 'actor_id');
    expect(fk).toEqual({ tableName: 'actor', columnName: 'id', onDelete: 'cascade' });
  });
});

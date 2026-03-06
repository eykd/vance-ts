import { describe, expect, it } from 'vitest';

import { InboxItem } from './InboxItem.js';

/** UUID v4 pattern. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Builds InboxItem fields with sensible defaults, allowing selective overrides.
 *
 * @param overrides - Optional field overrides.
 * @returns A complete InboxItem with defaults merged.
 */
function buildFields(overrides: Partial<InboxItem> = {}): InboxItem {
  return {
    id: crypto.randomUUID(),
    workspaceId: 'ws-1',
    title: 'Default title',
    description: null,
    status: 'inbox',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    clarifiedIntoType: null,
    clarifiedIntoId: null,
    ...overrides,
  };
}

describe('InboxItem.create', () => {
  it('generates a UUID id', () => {
    const item = InboxItem.create('ws-1', 'Buy milk');

    expect(item.id).toMatch(UUID_RE);
  });

  it('sets status to inbox', () => {
    const item = InboxItem.create('ws-1', 'Buy milk');

    expect(item.status).toBe('inbox');
  });

  it('sets workspaceId and title from arguments', () => {
    const item = InboxItem.create('ws-42', 'Call dentist');

    expect(item.workspaceId).toBe('ws-42');
    expect(item.title).toBe('Call dentist');
  });

  it('defaults description to null', () => {
    const item = InboxItem.create('ws-1', 'Buy milk');

    expect(item.description).toBeNull();
  });

  it('accepts an explicit description', () => {
    const item = InboxItem.create('ws-1', 'Buy milk', 'Whole milk from store');

    expect(item.description).toBe('Whole milk from store');
  });

  it('sets clarifiedIntoType and clarifiedIntoId to null', () => {
    const item = InboxItem.create('ws-1', 'Buy milk');

    expect(item.clarifiedIntoType).toBeNull();
    expect(item.clarifiedIntoId).toBeNull();
  });
});

describe('InboxItem.clarify', () => {
  it('transitions status from inbox to clarified', () => {
    const item = InboxItem.create('ws-1', 'Buy milk');
    const clarified = InboxItem.clarify(item, 'task', 'task-1');

    expect(clarified.status).toBe('clarified');
    expect(clarified.clarifiedIntoType).toBe('task');
    expect(clarified.clarifiedIntoId).toBe('task-1');
  });

  it('rejects clarifying an already-clarified item', () => {
    const item = InboxItem.create('ws-1', 'Buy milk');
    const clarified = InboxItem.clarify(item, 'task', 'task-1');

    expect(() => InboxItem.clarify(clarified, 'task', 'task-2')).toThrowError('already_clarified');
  });

  it('rejects clarifying with an empty clarifiedIntoType', () => {
    const item = InboxItem.create('ws-1', 'Buy milk');

    expect(() => InboxItem.clarify(item, '', 'task-1')).toThrowError('clarified_type_required');
  });

  it('rejects clarifying with an empty clarifiedIntoId', () => {
    const item = InboxItem.create('ws-1', 'Buy milk');

    expect(() => InboxItem.clarify(item, 'task', '')).toThrowError('clarified_id_required');
  });

  it('does not mutate the original item', () => {
    const item = InboxItem.create('ws-1', 'Buy milk');
    const clarified = InboxItem.clarify(item, 'task', 'task-1');

    expect(item.status).toBe('inbox');
    expect(clarified).not.toBe(item);
  });

  it('updates updatedAt to a later timestamp', () => {
    const fields = buildFields({
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    });
    const item = InboxItem.reconstitute(fields);
    const clarified = InboxItem.clarify(item, 'task', 'task-1');

    expect(clarified.updatedAt).not.toBe(item.updatedAt);
    expect(new Date(clarified.updatedAt).getTime()).toBeGreaterThan(
      new Date(item.updatedAt).getTime()
    );
  });

  it('preserves original id, workspaceId, title, and description', () => {
    const item = InboxItem.create('ws-1', 'Buy milk', 'Whole milk');
    const clarified = InboxItem.clarify(item, 'task', 'task-1');

    expect(clarified.id).toBe(item.id);
    expect(clarified.workspaceId).toBe(item.workspaceId);
    expect(clarified.title).toBe(item.title);
    expect(clarified.description).toBe(item.description);
    expect(clarified.createdAt).toBe(item.createdAt);
  });

  it('rejects clarifying with a whitespace-only clarifiedIntoType', () => {
    const item = InboxItem.create('ws-1', 'Buy milk');

    expect(() => InboxItem.clarify(item, '   ', 'task-1')).toThrowError('clarified_type_required');
  });

  it('rejects clarifying with a whitespace-only clarifiedIntoId', () => {
    const item = InboxItem.create('ws-1', 'Buy milk');

    expect(() => InboxItem.clarify(item, 'task', '   ')).toThrowError('clarified_id_required');
  });
});

describe('InboxItem.create validation', () => {
  it('rejects an empty title', () => {
    expect(() => InboxItem.create('ws-1', '')).toThrowError('title_required');
  });

  it('rejects a whitespace-only title', () => {
    expect(() => InboxItem.create('ws-1', '   ')).toThrowError('title_required');
  });

  it('rejects a title exceeding 500 characters', () => {
    expect(() => InboxItem.create('ws-1', 'a'.repeat(501))).toThrowError('title_too_long');
  });

  it('rejects a description exceeding 2000 characters', () => {
    expect(() => InboxItem.create('ws-1', 'Valid', 'a'.repeat(2001))).toThrowError(
      'description_too_long'
    );
  });

  it('rejects an empty workspaceId', () => {
    expect(() => InboxItem.create('', 'Buy milk')).toThrowError('workspace_id_required');
  });

  it('rejects a whitespace-only workspaceId', () => {
    expect(() => InboxItem.create('   ', 'Buy milk')).toThrowError('workspace_id_required');
  });

  it('rejects a whitespace-only description', () => {
    expect(() => InboxItem.create('ws-1', 'Buy milk', '   ')).toThrowError('description_required');
  });
});

describe('InboxItem.reconstitute', () => {
  it('hydrates a valid inbox item', () => {
    const original = InboxItem.create('ws-1', 'Buy milk');
    const hydrated = InboxItem.reconstitute(original);

    expect(hydrated).toEqual(original);
  });

  it('rejects a clarified item missing clarifiedIntoType', () => {
    expect(() => InboxItem.reconstitute(buildFields({ status: 'clarified' }))).toThrowError(
      'clarified_missing_target'
    );
  });

  it('rejects a clarified item with clarifiedIntoType but missing clarifiedIntoId', () => {
    expect(() =>
      InboxItem.reconstitute(buildFields({ status: 'clarified', clarifiedIntoType: 'task' }))
    ).toThrowError('clarified_missing_target');
  });

  it('rejects a clarified item with clarifiedIntoId but missing clarifiedIntoType', () => {
    expect(() =>
      InboxItem.reconstitute(buildFields({ status: 'clarified', clarifiedIntoId: 'task-1' }))
    ).toThrowError('clarified_missing_target');
  });

  it('rejects an inbox item that has clarifiedIntoType set', () => {
    expect(() => InboxItem.reconstitute(buildFields({ clarifiedIntoType: 'task' }))).toThrowError(
      'inbox_has_clarified_fields'
    );
  });
});

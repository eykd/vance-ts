/**
 * InboxItem entity unit tests.
 *
 * @module
 */

import { describe, expect, it } from 'vitest';

import type { DomainError } from '../errors/DomainError.js';

import { InboxItem } from './InboxItem.js';

/** UUID v4 pattern. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Helper to unwrap a successful Result or fail the test.
 *
 * @param result - The Result to unwrap.
 * @returns The success value.
 */
function unwrap<T>(
  result: { success: true; value: T } | { success: false; error: DomainError }
): T {
  if (!result.success) {
    throw new Error(`Unexpected failure: ${result.error.code}`);
  }
  return result.value;
}

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
    const item = unwrap(InboxItem.create('ws-1', 'Buy milk'));

    expect(item.id).toMatch(UUID_RE);
  });

  it('sets status to inbox', () => {
    const item = unwrap(InboxItem.create('ws-1', 'Buy milk'));

    expect(item.status).toBe('inbox');
  });

  it('sets workspaceId and title from arguments', () => {
    const item = unwrap(InboxItem.create('ws-42', 'Call dentist'));

    expect(item.workspaceId).toBe('ws-42');
    expect(item.title).toBe('Call dentist');
  });

  it('defaults description to null', () => {
    const item = unwrap(InboxItem.create('ws-1', 'Buy milk'));

    expect(item.description).toBeNull();
  });

  it('accepts an explicit description', () => {
    const item = unwrap(InboxItem.create('ws-1', 'Buy milk', 'Whole milk from store'));

    expect(item.description).toBe('Whole milk from store');
  });

  it('sets clarifiedIntoType and clarifiedIntoId to null', () => {
    const item = unwrap(InboxItem.create('ws-1', 'Buy milk'));

    expect(item.clarifiedIntoType).toBeNull();
    expect(item.clarifiedIntoId).toBeNull();
  });
});

describe('InboxItem.clarify', () => {
  it('transitions status from inbox to clarified', () => {
    const item = unwrap(InboxItem.create('ws-1', 'Buy milk'));
    const clarified = unwrap(InboxItem.clarify(item, 'task', 'task-1'));

    expect(clarified.status).toBe('clarified');
    expect(clarified.clarifiedIntoType).toBe('task');
    expect(clarified.clarifiedIntoId).toBe('task-1');
  });

  it('rejects clarifying an already-clarified item', () => {
    const item = unwrap(InboxItem.create('ws-1', 'Buy milk'));
    const clarified = unwrap(InboxItem.clarify(item, 'task', 'task-1'));
    const result = InboxItem.clarify(clarified, 'task', 'task-2');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('already_clarified');
    }
  });

  it('rejects clarifying with an empty clarifiedIntoType', () => {
    const item = unwrap(InboxItem.create('ws-1', 'Buy milk'));
    const result = InboxItem.clarify(item, '', 'task-1');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('clarified_type_required');
    }
  });

  it('rejects clarifying with an empty clarifiedIntoId', () => {
    const item = unwrap(InboxItem.create('ws-1', 'Buy milk'));
    const result = InboxItem.clarify(item, 'task', '');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('clarified_id_required');
    }
  });

  it('does not mutate the original item', () => {
    const item = unwrap(InboxItem.create('ws-1', 'Buy milk'));
    const clarified = unwrap(InboxItem.clarify(item, 'task', 'task-1'));

    expect(item.status).toBe('inbox');
    expect(clarified).not.toBe(item);
  });

  it('updates updatedAt to a later timestamp', () => {
    const fields = buildFields({
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    });
    const item = unwrap(InboxItem.reconstitute(fields));
    const clarified = unwrap(InboxItem.clarify(item, 'task', 'task-1'));

    expect(clarified.updatedAt).not.toBe(item.updatedAt);
    expect(new Date(clarified.updatedAt).getTime()).toBeGreaterThan(
      new Date(item.updatedAt).getTime()
    );
  });

  it('preserves original id, workspaceId, title, and description', () => {
    const item = unwrap(InboxItem.create('ws-1', 'Buy milk', 'Whole milk'));
    const clarified = unwrap(InboxItem.clarify(item, 'task', 'task-1'));

    expect(clarified.id).toBe(item.id);
    expect(clarified.workspaceId).toBe(item.workspaceId);
    expect(clarified.title).toBe(item.title);
    expect(clarified.description).toBe(item.description);
    expect(clarified.createdAt).toBe(item.createdAt);
  });

  it('rejects clarifying with a whitespace-only clarifiedIntoType', () => {
    const item = unwrap(InboxItem.create('ws-1', 'Buy milk'));
    const result = InboxItem.clarify(item, '   ', 'task-1');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('clarified_type_required');
    }
  });

  it('rejects clarifying with a whitespace-only clarifiedIntoId', () => {
    const item = unwrap(InboxItem.create('ws-1', 'Buy milk'));
    const result = InboxItem.clarify(item, 'task', '   ');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('clarified_id_required');
    }
  });
});

describe('InboxItem.create validation', () => {
  it('rejects an empty title', () => {
    const result = InboxItem.create('ws-1', '');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('title_required');
    }
  });

  it('rejects a whitespace-only title', () => {
    const result = InboxItem.create('ws-1', '   ');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('title_required');
    }
  });

  it('rejects a title exceeding 500 characters', () => {
    const result = InboxItem.create('ws-1', 'a'.repeat(501));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('title_too_long');
    }
  });

  it('rejects a description exceeding 2000 characters', () => {
    const result = InboxItem.create('ws-1', 'Valid', 'a'.repeat(2001));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('description_too_long');
    }
  });

  it('rejects an empty workspaceId', () => {
    const result = InboxItem.create('', 'Buy milk');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('workspace_id_required');
    }
  });

  it('rejects a whitespace-only workspaceId', () => {
    const result = InboxItem.create('   ', 'Buy milk');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('workspace_id_required');
    }
  });

  it('rejects a whitespace-only description', () => {
    const result = InboxItem.create('ws-1', 'Buy milk', '   ');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('description_required');
    }
  });
});

describe('InboxItem.reconstitute', () => {
  it('hydrates a valid inbox item', () => {
    const original = unwrap(InboxItem.create('ws-1', 'Buy milk'));
    const hydrated = unwrap(InboxItem.reconstitute(original));

    expect(hydrated).toEqual(original);
  });

  it('rejects a clarified item missing clarifiedIntoType', () => {
    const result = InboxItem.reconstitute(buildFields({ status: 'clarified' }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('clarified_missing_target');
    }
  });

  it('rejects a clarified item with clarifiedIntoType but missing clarifiedIntoId', () => {
    const result = InboxItem.reconstitute(
      buildFields({ status: 'clarified', clarifiedIntoType: 'task' })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('clarified_missing_target');
    }
  });

  it('rejects a clarified item with clarifiedIntoId but missing clarifiedIntoType', () => {
    const result = InboxItem.reconstitute(
      buildFields({ status: 'clarified', clarifiedIntoId: 'task-1' })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('clarified_missing_target');
    }
  });

  it('rejects an inbox item that has clarifiedIntoType set', () => {
    const result = InboxItem.reconstitute(buildFields({ clarifiedIntoType: 'task' }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('inbox_has_clarified_fields');
    }
  });
});

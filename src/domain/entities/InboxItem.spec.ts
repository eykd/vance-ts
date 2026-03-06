import { describe, expect, it } from 'vitest';

import { InboxItem } from './InboxItem.js';

/** UUID v4 pattern. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
});

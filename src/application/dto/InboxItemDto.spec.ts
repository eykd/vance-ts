/**
 * Unit tests for InboxItemDto.
 *
 * @module
 */

import { describe, expect, it } from 'vitest';

import type { InboxItem } from '../../domain/entities/InboxItem.js';

import { toInboxItemDto } from './InboxItemDto.js';

describe('InboxItemDto', () => {
  it('maps an InboxItem entity to a DTO without workspaceId', () => {
    const entity: InboxItem = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      workspaceId: '660e8400-e29b-41d4-a716-446655440000',
      title: 'Buy groceries',
      description: null,
      status: 'inbox',
      createdAt: '2026-03-06T12:00:00.000Z',
      updatedAt: '2026-03-06T12:00:00.000Z',
      clarifiedIntoType: null,
      clarifiedIntoId: null,
    };

    const dto = toInboxItemDto(entity);

    expect(dto).toEqual({
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Buy groceries',
      description: null,
      status: 'inbox',
      clarifiedIntoType: null,
      clarifiedIntoId: null,
      createdAt: '2026-03-06T12:00:00.000Z',
      updatedAt: '2026-03-06T12:00:00.000Z',
    });
    expect(dto).not.toHaveProperty('workspaceId');
  });
});

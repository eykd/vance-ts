/**
 * Unit tests for ContextDto.
 *
 * @module
 */

import { describe, expect, it } from 'vitest';

import type { Context } from '../../domain/entities/Context.js';

import { toContextDto } from './ContextDto.js';

describe('ContextDto', () => {
  it('maps a Context entity to a DTO without workspaceId', () => {
    const entity: Context = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      workspaceId: '660e8400-e29b-41d4-a716-446655440000',
      name: 'Computer',
      createdAt: '2026-03-06T12:00:00.000Z',
    };

    const dto = toContextDto(entity);

    expect(dto).toEqual({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Computer',
      createdAt: '2026-03-06T12:00:00.000Z',
    });
    expect(dto).not.toHaveProperty('workspaceId');
  });
});

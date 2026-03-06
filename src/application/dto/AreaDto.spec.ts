/**
 * Unit tests for AreaDto.
 *
 * @module
 */

import { describe, expect, it } from 'vitest';

import type { Area } from '../../domain/entities/Area.js';

import { toAreaDto } from './AreaDto.js';

describe('AreaDto', () => {
  it('maps an Area entity to a DTO without workspaceId', () => {
    const entity: Area = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      workspaceId: '660e8400-e29b-41d4-a716-446655440000',
      name: 'Work',
      status: 'active',
      createdAt: '2026-03-06T12:00:00.000Z',
      updatedAt: '2026-03-06T12:00:00.000Z',
    };

    const dto = toAreaDto(entity);

    expect(dto).toEqual({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Work',
      status: 'active',
      createdAt: '2026-03-06T12:00:00.000Z',
      updatedAt: '2026-03-06T12:00:00.000Z',
    });
    expect(dto).not.toHaveProperty('workspaceId');
  });
});

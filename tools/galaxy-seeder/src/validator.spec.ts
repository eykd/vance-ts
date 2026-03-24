/**
 * Tests for the galaxy seeder input validator.
 *
 * @module validator.spec
 */

import { describe, it, expect } from 'vitest';

import { validateInput } from './validator.js';

describe('validateInput', () => {
  it('should return an error when metadata is null', () => {
    const result = validateInput({
      metadata: null,
      routes: { routes: [] },
      systems: [],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain('metadata is missing');
    }
  });
});

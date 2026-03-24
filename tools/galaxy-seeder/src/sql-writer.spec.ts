/**
 * Tests for SQL writer module.
 *
 * @module sql-writer.spec
 */

import { describe, expect, it } from 'vitest';

import { escapeSQL } from './sql-writer.js';

describe('escapeSQL', () => {
  it('doubles single quotes', () => {
    expect(escapeSQL("O'Brien's Star")).toBe("O''Brien''s Star");
  });
});

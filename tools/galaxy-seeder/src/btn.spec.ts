/**
 * Tests for BTN (Bilateral Trade Number) computation.
 *
 * @module btn.spec
 */

import { describe, it, expect } from 'vitest';

import { distanceModifier } from './btn.js';

/* ========== distanceModifier ========== */

describe('distanceModifier', () => {
  it('returns 0 for 1 hop (direct neighbours)', () => {
    expect(distanceModifier(1)).toBe(0);
  });
});

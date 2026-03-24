/**
 * Tests for BTN (Bilateral Trade Number) computation.
 *
 * @module btn.spec
 */

import { describe, it, expect } from 'vitest';

import { computeBtn, distanceModifier } from './btn.js';

/* ========== distanceModifier ========== */

describe('distanceModifier', () => {
  it('returns 0 for 1 hop (direct neighbours)', () => {
    expect(distanceModifier(1)).toBe(0);
  });

  it('returns 0.5 for 2 hops', () => {
    expect(distanceModifier(2)).toBe(0.5);
  });

  it('returns 1.0 for 3 hops', () => {
    expect(distanceModifier(3)).toBe(1.0);
  });

  it('returns 1.0 for 4 hops', () => {
    expect(distanceModifier(4)).toBe(1.0);
  });

  it('returns 1.0 for 5 hops', () => {
    expect(distanceModifier(5)).toBe(1.0);
  });
});

/* ========== computeBtn ========== */

describe('computeBtn', () => {
  it('computes BTN for direct neighbours with equal WTN', () => {
    // BTN = clamp(5 + 5 - 0, 0, min(5, 5) + 5) = clamp(10, 0, 10) = 10
    expect(computeBtn(5, 5, 1)).toBe(10);
  });

  it('computes BTN for 2-hop pair', () => {
    // BTN = clamp(5 + 5 - 0.5, 0, min(5, 5) + 5) = clamp(9.5, 0, 10) = 9.5
    expect(computeBtn(5, 5, 2)).toBe(9.5);
  });

  it('computes BTN for 3-hop pair', () => {
    // BTN = clamp(5 + 5 - 1.0, 0, min(5, 5) + 5) = clamp(9, 0, 10) = 9
    expect(computeBtn(5, 5, 3)).toBe(9);
  });

  it('applies upper cap of min(wtnA, wtnB) + 5', () => {
    // BTN = clamp(10 + 3 - 0, 0, min(10, 3) + 5) = clamp(13, 0, 8) = 8
    expect(computeBtn(10, 3, 1)).toBe(8);
  });

  it('applies upper cap regardless of argument order', () => {
    // BTN = clamp(3 + 10 - 0, 0, min(3, 10) + 5) = clamp(13, 0, 8) = 8
    expect(computeBtn(3, 10, 1)).toBe(8);
  });

  it('returns 0 when WTN sum minus modifier is zero', () => {
    // BTN = clamp(0.5 + 0 - 0.5, 0, min(0.5, 0) + 5) = clamp(0, 0, 5) = 0
    expect(computeBtn(0.5, 0, 2)).toBe(0);
  });

  it('clamps negative result to 0', () => {
    // BTN = clamp(0 + 0 - 1.0, 0, min(0, 0) + 5) = clamp(-1, 0, 5) = 0
    expect(computeBtn(0, 0, 3)).toBe(0);
  });

  it('handles asymmetric WTN values', () => {
    // BTN = clamp(8 + 3 - 0.5, 0, min(8, 3) + 5) = clamp(10.5, 0, 8) = 8
    expect(computeBtn(8, 3, 2)).toBe(8);
  });

  it('handles boundary case where raw BTN equals cap', () => {
    // BTN = clamp(4 + 4 - 1.0, 0, min(4, 4) + 5) = clamp(7, 0, 9) = 7
    expect(computeBtn(4, 4, 3)).toBe(7);
  });

  it('throws for non-finite wtnA', () => {
    expect(() => computeBtn(NaN, 5, 1)).toThrow('wtnA must be a finite number');
  });

  it('throws for non-finite wtnB', () => {
    expect(() => computeBtn(5, Infinity, 1)).toThrow('wtnB must be a finite number');
  });

  it('throws for non-finite wtnA (negative infinity)', () => {
    expect(() => computeBtn(-Infinity, 5, 1)).toThrow('wtnA must be a finite number');
  });
});

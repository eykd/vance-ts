/**
 * RenderedString value object unit tests.
 *
 * @module
 */

import { describe, expect, it } from 'vitest';

import { createRenderedString } from './renderedString.js';

describe('createRenderedString', () => {
  it('wraps text and source rule name', () => {
    const rs = createRenderedString('A distant star.', 'main');

    expect(rs.text).toBe('A distant star.');
    expect(rs.ruleName).toBe('main');
  });

  it('is readonly (text cannot be reassigned)', () => {
    const rs = createRenderedString('hello', 'greeting');

    // Object.freeze prevents mutation — throws in strict mode (Workers runtime)
    expect(() => {
      (rs as Record<string, unknown>)['text'] = 'changed';
    }).toThrow(TypeError);
    expect(rs.text).toBe('hello');
  });

  it('preserves empty text', () => {
    const rs = createRenderedString('', 'empty_rule');

    expect(rs.text).toBe('');
    expect(rs.ruleName).toBe('empty_rule');
  });

  it('two RenderedStrings with the same content are equal by value', () => {
    const a = createRenderedString('same', 'rule1');
    const b = createRenderedString('same', 'rule1');

    expect(a.text).toBe(b.text);
    expect(a.ruleName).toBe(b.ruleName);
  });

  it('toString returns the rendered text', () => {
    const rs = createRenderedString('output text', 'rule');

    expect(rs.toString()).toBe('output text');
  });
});

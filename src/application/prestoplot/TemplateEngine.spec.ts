import { describe, expect, it } from 'vitest';

import type { TemplateEnginePort } from './TemplateEngine.js';

describe('TemplateEnginePort', () => {
  /**
   * Inline stub implementing TemplateEnginePort with trivial passthrough.
   *
   * @returns A TemplateEnginePort that returns templates unchanged.
   */
  function createStub(): TemplateEnginePort {
    return {
      evaluate(
        template: string,
        _context: Readonly<Record<string, string>>,
        _depth: number
      ): string {
        return template;
      },
    };
  }

  it('should be implementable with evaluate method', () => {
    const port: TemplateEnginePort = createStub();
    expect(port).toBeDefined();
  });

  it('evaluate accepts template, context, and depth', () => {
    const port = createStub();
    const result = port.evaluate('hello {{ name }}', { name: 'world' }, 0);
    expect(typeof result).toBe('string');
  });
});

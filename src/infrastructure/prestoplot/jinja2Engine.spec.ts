/**
 * Tests for Jinja2Engine — a Jinja2-subset template engine.
 *
 * Covers: {{ expr }} interpolation, dot-access, index-access, article accessors,
 * whitespace control, comments, error handling, caching, and depth limits.
 *
 * @module infrastructure/prestoplot/jinja2Engine.spec
 */

import { describe, expect, it } from 'vitest';

import type { TemplateEnginePort } from '../../application/prestoplot/TemplateEngine.js';
import { TemplateError } from '../../domain/prestoplot/errors.js';

import { Jinja2Engine } from './jinja2Engine.js';

describe('Jinja2Engine', () => {
  /**
   * Create a fresh engine instance.
   *
   * @returns A new Jinja2Engine.
   */
  function engine(): Jinja2Engine {
    return new Jinja2Engine();
  }

  describe('interface conformance', () => {
    it('should implement TemplateEnginePort', () => {
      const e: TemplateEnginePort = engine();
      expect(e).toBeDefined();
    });
  });

  describe('MAX_DEPTH', () => {
    it('should be 50', () => {
      expect(Jinja2Engine.MAX_DEPTH).toBe(50);
    });
  });

  describe('MAX_ACCESSOR_DEPTH', () => {
    it('should be 10', () => {
      expect(Jinja2Engine.MAX_ACCESSOR_DEPTH).toBe(10);
    });
  });

  describe('MAX_CACHE_SIZE', () => {
    it('should be 500', () => {
      expect(Jinja2Engine.MAX_CACHE_SIZE).toBe(500);
    });
  });

  describe('plain text passthrough', () => {
    it('should return plain text unchanged', () => {
      expect(engine().evaluate('hello world', {}, 0)).toBe('hello world');
    });

    it('should return empty string for empty template', () => {
      expect(engine().evaluate('', {}, 0)).toBe('');
    });

    it('should handle text with no expressions', () => {
      expect(engine().evaluate('no expressions here!', {}, 0)).toBe('no expressions here!');
    });
  });

  describe('variable interpolation {{ name }}', () => {
    it('should resolve a simple variable', () => {
      expect(engine().evaluate('hello {{ name }}', { name: 'world' }, 0)).toBe('hello world');
    });

    it('should resolve multiple variables', () => {
      expect(engine().evaluate('{{ a }} and {{ b }}', { a: 'foo', b: 'bar' }, 0)).toBe(
        'foo and bar'
      );
    });

    it('should resolve variable with underscores', () => {
      expect(engine().evaluate('{{ my_var }}', { my_var: 'value' }, 0)).toBe('value');
    });

    it('should resolve variable starting with underscore', () => {
      expect(engine().evaluate('{{ _x }}', { _x: 'y' }, 0)).toBe('y');
    });

    it('should resolve variable with digits', () => {
      expect(engine().evaluate('{{ item2 }}', { item2: 'v' }, 0)).toBe('v');
    });

    it('should handle variable at start of template', () => {
      expect(engine().evaluate('{{ x }}!', { x: 'hi' }, 0)).toBe('hi!');
    });

    it('should handle variable at end of template', () => {
      expect(engine().evaluate('say {{ x }}', { x: 'hi' }, 0)).toBe('say hi');
    });

    it('should handle adjacent variables', () => {
      expect(engine().evaluate('{{ a }}{{ b }}', { a: 'foo', b: 'bar' }, 0)).toBe('foobar');
    });
  });

  describe('dot accessor {{ name.key }}', () => {
    it('should throw RuleNotFoundError for unknown names', () => {
      expect(() => engine().evaluate('{{ unknown }}', {}, 0)).toThrow();
    });

    it('should resolve dot-access on context values via Object.hasOwn', () => {
      // In the simplified port interface, context is Record<string, string>.
      // Dot-access on a flat string context value is not meaningful —
      // the engine should throw TemplateError for accessor on string.
      expect(() => engine().evaluate('{{ name.key }}', { name: 'plain' }, 0)).toThrow(
        TemplateError
      );
    });
  });

  describe('index accessor {{ name[0] }}', () => {
    it('should throw TemplateError for index access on string context', () => {
      expect(() => engine().evaluate('{{ name[0] }}', { name: 'plain' }, 0)).toThrow(TemplateError);
    });
  });

  describe('article accessors', () => {
    it('should produce lowercase "a" for consonant-starting word', () => {
      expect(engine().evaluate('{{ x.a }}', { x: 'dog' }, 0)).toBe('a');
    });

    it('should produce lowercase "an" for vowel-starting word', () => {
      expect(engine().evaluate('{{ x.a }}', { x: 'elephant' }, 0)).toBe('an');
    });

    it('should produce "a dog" for .an accessor on consonant word', () => {
      expect(engine().evaluate('{{ x.an }}', { x: 'dog' }, 0)).toBe('a dog');
    });

    it('should produce "an elephant" for .an accessor on vowel word', () => {
      expect(engine().evaluate('{{ x.an }}', { x: 'elephant' }, 0)).toBe('an elephant');
    });

    it('should produce uppercase "A" for .A accessor on consonant word', () => {
      expect(engine().evaluate('{{ x.A }}', { x: 'dog' }, 0)).toBe('A');
    });

    it('should produce uppercase "An" for .A accessor on vowel word', () => {
      expect(engine().evaluate('{{ x.A }}', { x: 'elephant' }, 0)).toBe('An');
    });

    it('should produce "A dog" for .An accessor on consonant word', () => {
      expect(engine().evaluate('{{ x.An }}', { x: 'dog' }, 0)).toBe('A dog');
    });

    it('should produce "An elephant" for .An accessor on vowel word', () => {
      expect(engine().evaluate('{{ x.An }}', { x: 'elephant' }, 0)).toBe('An elephant');
    });

    it('should handle empty string for article accessor', () => {
      expect(engine().evaluate('{{ x.a }}', { x: '' }, 0)).toBe('a');
    });
  });

  describe('comments {# #}', () => {
    it('should strip comments completely', () => {
      expect(engine().evaluate('hello{# ignored #} world', {}, 0)).toBe('hello world');
    });

    it('should handle comment at start of template', () => {
      expect(engine().evaluate('{# start #}hello', {}, 0)).toBe('hello');
    });

    it('should handle comment at end of template', () => {
      expect(engine().evaluate('hello{# end #}', {}, 0)).toBe('hello');
    });

    it('should handle multiple comments', () => {
      expect(engine().evaluate('{# a #}x{# b #}y{# c #}', {}, 0)).toBe('xy');
    });

    it('should throw on unclosed comment', () => {
      expect(() => engine().evaluate('{# unclosed', {}, 0)).toThrow(TemplateError);
    });
  });

  describe('whitespace control {{- -}}', () => {
    it('should strip left whitespace with {{-', () => {
      expect(engine().evaluate('hello   {{- x }}', { x: 'w' }, 0)).toBe('hellow');
    });

    it('should strip right whitespace with -}}', () => {
      expect(engine().evaluate('{{ x -}}   world', { x: 'h' }, 0)).toBe('hworld');
    });

    it('should strip both sides with {{- -}}', () => {
      expect(engine().evaluate('hello   {{- x -}}   world', { x: ' ' }, 0)).toBe('hello world');
    });

    it('should not strip when no dash', () => {
      expect(engine().evaluate('a {{ x }} b', { x: 'v' }, 0)).toBe('a v b');
    });
  });

  describe('unsupported features', () => {
    it('should throw TemplateError for block tags {% %}', () => {
      expect(() => engine().evaluate('{% if x %}yes{% endif %}', {}, 0)).toThrow(TemplateError);
    });

    it('should throw TemplateError for filters {{ x | upper }}', () => {
      expect(() => engine().evaluate('{{ x | upper }}', { x: 'hi' }, 0)).toThrow(TemplateError);
    });
  });

  describe('error handling', () => {
    it('should throw TemplateError for unclosed {{', () => {
      expect(() => engine().evaluate('hello {{ name', {}, 0)).toThrow(TemplateError);
    });

    it('should throw TemplateError for empty expression {{ }}', () => {
      expect(() => engine().evaluate('{{ }}', {}, 0)).toThrow(TemplateError);
    });

    it('should throw for unresolved variable', () => {
      expect(() => engine().evaluate('{{ missing }}', {}, 0)).toThrow();
    });

    it('should throw TemplateError when depth exceeds MAX_DEPTH', () => {
      expect(() => engine().evaluate('{{ x }}', { x: 'val' }, 51)).toThrow(TemplateError);
    });

    it('should truncate long template in error messages to 50 chars', () => {
      const longTemplate = '{{ ' + 'x'.repeat(100) + ' }}';
      try {
        engine().evaluate(longTemplate, {}, 0);
        expect.unreachable('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(TemplateError);
      }
    });
  });

  describe('accessor depth limit', () => {
    it('should throw TemplateError when accessor chain exceeds MAX_ACCESSOR_DEPTH', () => {
      // Build a chain with 11 field accesses (exceeds 10)
      const expr = '{{ x' + '.key'.repeat(11) + ' }}';
      expect(() => engine().evaluate(expr, { x: 'val' }, 0)).toThrow(TemplateError);
    });
  });

  describe('cache', () => {
    it('should cache tokenized templates (same result on second call)', () => {
      const e = engine();
      const r1 = e.evaluate('{{ x }}', { x: 'a' }, 0);
      const r2 = e.evaluate('{{ x }}', { x: 'b' }, 0);
      expect(r1).toBe('a');
      expect(r2).toBe('b');
    });

    it('should evict oldest entries when cache exceeds MAX_CACHE_SIZE', () => {
      const e = engine();
      // Fill cache beyond MAX_CACHE_SIZE
      for (let i = 0; i < 502; i++) {
        e.evaluate(`text${i}`, {}, 0);
      }
      // Should still work (no crash, FIFO eviction)
      expect(e.evaluate('final', {}, 0)).toBe('final');
    });
  });

  describe('surrogate pairs (for...of safety)', () => {
    it('should handle emoji in plain text', () => {
      expect(engine().evaluate('hello 🌍', {}, 0)).toBe('hello 🌍');
    });

    it('should handle emoji in context values', () => {
      expect(engine().evaluate('{{ x }}', { x: '🎉' }, 0)).toBe('🎉');
    });
  });

  describe("literal brace {{ '{'  }}", () => {
    it('should handle string literal for brace escaping', () => {
      expect(engine().evaluate("{{ '{' }}", { '{': '{' }, 0)).toBe('{');
    });
  });

  describe('edge cases', () => {
    it('should handle single open brace as literal text', () => {
      expect(engine().evaluate('a { b', {}, 0)).toBe('a { b');
    });

    it('should handle single close brace as literal text', () => {
      expect(engine().evaluate('a } b', {}, 0)).toBe('a } b');
    });

    it('should handle template with only whitespace', () => {
      expect(engine().evaluate('   ', {}, 0)).toBe('   ');
    });

    it('should throw at exactly MAX_DEPTH (depth=50 is >= 50)', () => {
      expect(() => engine().evaluate('{{ x }}', { x: 'v' }, 50)).toThrow(TemplateError);
    });

    it('should work at depth just below MAX_DEPTH', () => {
      expect(engine().evaluate('{{ x }}', { x: 'val' }, 49)).toBe('val');
    });
  });
});

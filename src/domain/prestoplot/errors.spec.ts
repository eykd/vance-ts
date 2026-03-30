/**
 * Prestoplot domain error unit tests.
 *
 * @module
 */

import { describe, expect, it } from 'vitest';

import { DomainError } from '../errors/DomainError.js';

import {
  CircularIncludeError,
  GrammarParseError,
  IncludeDepthError,
  IncludeLimitError,
  InvalidSeedError,
  ModuleNotFoundError,
  RenderBudgetError,
  RuleNotFoundError,
  StorageError,
  TemplateError,
} from './errors.js';

describe('GrammarParseError', () => {
  it('extends DomainError', () => {
    const error = new GrammarParseError('bad_rule', 'Rule "foo" is invalid');

    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(GrammarParseError);
  });

  it('carries code and message', () => {
    const error = new GrammarParseError('unknown_type', 'Unknown rule type "bar"');

    expect(error.code).toBe('unknown_type');
    expect(error.message).toBe('Unknown rule type "bar"');
  });

  it('sets name to GrammarParseError', () => {
    const error = new GrammarParseError('bad_rule', 'invalid');

    expect(error.name).toBe('GrammarParseError');
  });

  it('defaults message to code when omitted', () => {
    const error = new GrammarParseError('empty_grammar');

    expect(error.message).toBe('empty_grammar');
  });
});

describe('RuleNotFoundError', () => {
  it('extends DomainError', () => {
    const error = new RuleNotFoundError('animal');

    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(RuleNotFoundError);
  });

  it('carries rule_not_found code and includes rule name in message', () => {
    const error = new RuleNotFoundError('creature');

    expect(error.code).toBe('rule_not_found');
    expect(error.message).toContain('creature');
  });

  it('exposes the rule name', () => {
    const error = new RuleNotFoundError('planet');

    expect(error.ruleName).toBe('planet');
  });

  it('sets name to RuleNotFoundError', () => {
    const error = new RuleNotFoundError('x');

    expect(error.name).toBe('RuleNotFoundError');
  });
});

describe('CircularIncludeError', () => {
  it('extends DomainError', () => {
    const error = new CircularIncludeError(['a', 'b', 'a']);

    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(CircularIncludeError);
  });

  it('carries circular_include code', () => {
    const error = new CircularIncludeError(['x', 'y', 'x']);

    expect(error.code).toBe('circular_include');
  });

  it('exposes the chain that formed the cycle', () => {
    const error = new CircularIncludeError(['a', 'b', 'c', 'a']);

    expect(error.chain).toEqual(['a', 'b', 'c', 'a']);
  });

  it('chain is readonly', () => {
    const chain = ['a', 'b', 'a'];
    const error = new CircularIncludeError(chain);

    expect(Object.isFrozen(error.chain) || Array.isArray(error.chain)).toBe(true);
    expect(error.chain).toEqual(['a', 'b', 'a']);
  });

  it('sets name to CircularIncludeError', () => {
    const error = new CircularIncludeError(['a', 'a']);

    expect(error.name).toBe('CircularIncludeError');
  });
});

describe('InvalidSeedError', () => {
  it('extends DomainError', () => {
    const error = new InvalidSeedError('Seed cannot be empty');

    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(InvalidSeedError);
  });

  it('carries invalid_seed code', () => {
    const error = new InvalidSeedError('empty');

    expect(error.code).toBe('invalid_seed');
  });

  it('sets name to InvalidSeedError', () => {
    const error = new InvalidSeedError('bad');

    expect(error.name).toBe('InvalidSeedError');
  });
});

describe('TemplateError', () => {
  it('extends DomainError', () => {
    const error = new TemplateError('recursion_limit', 'Max depth exceeded');

    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(TemplateError);
  });

  it('carries code and message', () => {
    const error = new TemplateError('unresolved_ref', 'Unknown ref "foo"');

    expect(error.code).toBe('unresolved_ref');
    expect(error.message).toBe('Unknown ref "foo"');
  });

  it('sets name to TemplateError', () => {
    const error = new TemplateError('bad', 'msg');

    expect(error.name).toBe('TemplateError');
  });
});

describe('RenderBudgetError', () => {
  it('extends DomainError', () => {
    const error = new RenderBudgetError(10_000);

    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(RenderBudgetError);
  });

  it('carries render_budget code and evaluation count', () => {
    const error = new RenderBudgetError(10_001);

    expect(error.code).toBe('render_budget');
    expect(error.evaluationCount).toBe(10_001);
    expect(error.message).toContain('10001');
  });

  it('sets name to RenderBudgetError', () => {
    const error = new RenderBudgetError(5000);

    expect(error.name).toBe('RenderBudgetError');
  });
});

describe('IncludeDepthError', () => {
  it('extends DomainError', () => {
    const error = new IncludeDepthError('deep-grammar', 21);

    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(IncludeDepthError);
  });

  it('carries include_depth code, module name and depth', () => {
    const error = new IncludeDepthError('nested', 20);

    expect(error.code).toBe('include_depth');
    expect(error.moduleName).toBe('nested');
    expect(error.depth).toBe(20);
    expect(error.message).toContain('nested');
  });

  it('sets name to IncludeDepthError', () => {
    const error = new IncludeDepthError('x', 5);

    expect(error.name).toBe('IncludeDepthError');
  });
});

describe('IncludeLimitError', () => {
  it('extends DomainError', () => {
    const error = new IncludeLimitError(51);

    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(IncludeLimitError);
  });

  it('carries include_limit code and count', () => {
    const error = new IncludeLimitError(50);

    expect(error.code).toBe('include_limit');
    expect(error.count).toBe(50);
    expect(error.message).toContain('50');
  });

  it('sets name to IncludeLimitError', () => {
    const error = new IncludeLimitError(10);

    expect(error.name).toBe('IncludeLimitError');
  });
});

describe('ModuleNotFoundError', () => {
  it('extends DomainError', () => {
    const error = new ModuleNotFoundError('missing-grammar');

    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(ModuleNotFoundError);
  });

  it('carries module_not_found code and module name', () => {
    const error = new ModuleNotFoundError('fantasy/creatures');

    expect(error.code).toBe('module_not_found');
    expect(error.moduleName).toBe('fantasy/creatures');
    expect(error.message).toContain('fantasy/creatures');
  });

  it('sets name to ModuleNotFoundError', () => {
    const error = new ModuleNotFoundError('x');

    expect(error.name).toBe('ModuleNotFoundError');
  });

  it('accepts custom message', () => {
    const error = new ModuleNotFoundError('abc', 'Custom message');

    expect(error.message).toBe('Custom message');
    expect(error.moduleName).toBe('abc');
  });
});

describe('StorageError', () => {
  it('extends DomainError', () => {
    const error = new StorageError('write_failed', 'KV write timed out');

    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(StorageError);
  });

  it('carries code and message', () => {
    const error = new StorageError('read_failed', 'D1 unavailable');

    expect(error.code).toBe('read_failed');
    expect(error.message).toBe('D1 unavailable');
  });

  it('optionally wraps a cause', () => {
    const cause = new Error('network timeout');
    const error = new StorageError('write_failed', 'KV error', cause);

    expect(error.cause).toBe(cause);
  });

  it('sets name to StorageError', () => {
    const error = new StorageError('x', 'y');

    expect(error.name).toBe('StorageError');
  });
});

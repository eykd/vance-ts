# Domain Model

## Overview

The prestoplot domain is a pure TypeScript layer with zero external dependencies. All
types use `readonly` properties. Discriminated unions replace the Python class hierarchy.

## Enumerations

### SelectionMode

```typescript
/**
 * Determines how items are selected from a ListRule or used for generation.
 *
 * - REUSE: uniform random with replacement (seeded, items recursively rendered).
 * - PICK: uniform random without replacement; items are depleted and reshuffled
 *   on exhaustion (stateful per render, seeded). Items are recursively rendered.
 * - RATCHET: sequential cycling with wraparound. Items are plain strings (not
 *   recursively rendered). Stateless index derived from call count.
 * - MARKOV: character-level Markov chain generation from the corpus of items.
 *   Items are plain strings (training corpus only, not emitted directly).
 * - LIST: indexed access; no selection logic. Items are plain strings. Returns
 *   the full list as a Datalist.
 */
export enum SelectionMode {
  REUSE = 'reuse',
  PICK = 'pick',
  RATCHET = 'ratchet',
  MARKOV = 'markov',
  LIST = 'list',
}
```

### RenderStrategy

```typescript
/**
 * Template engine used for rendering TextRule templates.
 *
 * - FTEMPLATE: custom interpolation engine using `{expression}` syntax.
 * - JINJA2: Jinja2-subset interpreter using `{{ expression }}` syntax.
 */
export enum RenderStrategy {
  FTEMPLATE = 'ftemplate',
  JINJA2 = 'jinja2',
}
```

## Rule Types

Rules are discriminated by the `kind` field. The union is exhaustive.

```typescript
/**
 * A rule that contains a single template string.
 *
 * Rendered by the grammar's configured RenderStrategy.
 * Text is normalized at parse time: dedent (remove common leading whitespace)
 * then strip (remove leading/trailing whitespace).
 */
export interface TextRule {
  readonly kind: 'text';
  readonly template: string;
}

/**
 * A rule containing an ordered list of items with a selection strategy.
 *
 * The `mode` field determines how items are selected at render time.
 * Items in REUSE and PICK modes are template strings subject to recursive
 * rendering. Items in RATCHET, MARKOV, and LIST modes are plain strings.
 */
export interface ListRule {
  readonly kind: 'list';
  readonly mode: SelectionMode;
  /** For MARKOV mode: the n-gram order. Default 2. Must be >= 1. */
  readonly order?: number;
  readonly items: readonly string[];
}

/**
 * A rule containing a key-value map.
 *
 * Values are template strings rendered by the grammar's RenderStrategy.
 * Accessing a key scopes the seed (see: 06-seed-and-context.md).
 */
export interface StructRule {
  readonly kind: 'struct';
  readonly fields: Readonly<Record<string, string>>;
}

/** Discriminated union of all rule types. */
export type Rule = TextRule | ListRule | StructRule;
```

## Grammar

```typescript
/**
 * The Grammar aggregate root.
 *
 * Contains the rule map, render strategy, and included module names.
 * Grammars are immutable once created. Rendering operates against a
 * mutable RenderContext (see: 06-seed-and-context.md).
 *
 * @remarks
 * Grammar does not evaluate rules — it is a pure data structure.
 * Evaluation is performed by the RenderEngine application service.
 */
export interface Grammar {
  /**
   * Map from rule name to Rule definition.
   * Rule names are case-sensitive.
   */
  readonly rules: Readonly<Record<string, Rule>>;

  /** Template render strategy used for TextRule and StructRule values. */
  readonly renderStrategy: RenderStrategy;

  /**
   * Names of grammar modules to include (resolved at render time).
   * Included modules are merged into the rule namespace; local rules shadow
   * included rules on name collision.
   */
  readonly includes: readonly string[];
}
```

## Runtime Wrappers

Runtime wrappers carry evaluated state. They are created during rendering and are not
stored in the Grammar itself.

```typescript
/**
 * A rendered string value with article-generation accessors.
 *
 * Returned by the template engine; consumed by template expressions.
 * All article properties are eagerly computed on construction.
 */
export interface RenderedString {
  /** The raw rendered content. */
  readonly value: string;

  /** Lowercase indefinite article: "a" or "an". */
  readonly a: string;

  /** Uppercase indefinite article: "A" or "An". */
  readonly A: string;

  /** Full "a {value}" or "an {value}" (lowercase article). */
  readonly an: string;

  /** Full "A {value}" or "An {value}" (uppercase article). */
  readonly An: string;
}

/**
 * A dict-like wrapper providing scoped-seed access to a StructRule's fields.
 *
 * Key access scopes the seed via ScopedSeed before rendering the field value.
 * See 06-seed-and-context.md for scoping rules.
 */
export interface Databag {
  readonly kind: 'databag';
  /** Access a field by key, scoping the seed to "{base}-{key}". */
  get(key: string): RenderedString | undefined;
  /** Enumerate all field names. */
  keys(): readonly string[];
}

/**
 * An ordered list wrapper for RATCHET/LIST ListRule items.
 *
 * Supports indexed access; selection is the caller's responsibility.
 * Items are plain strings (no recursive rendering).
 */
export interface Datalist {
  readonly kind: 'datalist';
  /** Total number of items. */
  readonly length: number;
  /** Access item by zero-based index. Returns undefined if out of range. */
  get(index: number): string | undefined;
  /** All items as a readonly array. */
  items(): readonly string[];
}

/**
 * Internal cache descriptor for a ListRule.
 *
 * Used by the RenderEngine to cache per-render Markov models and
 * depletion state. Not exported from the domain layer.
 *
 * @internal
 */
export interface Database {
  readonly kind: 'database';
  /** "{moduleName}.{ruleName}" — unique cache key for this render. */
  readonly cacheKey: string;
  readonly rule: ListRule;
}
```

## Deviations from Python

- Python's lazy evaluation via `__str__` is replaced by an explicit `render()` call in
  the template engine, which returns a `RenderedString`. TypeScript has no `__str__`
  equivalent; implicit coercion via `toString()` would be error-prone with strict types.
- Python's class hierarchy (`TextRule extends Rule`) is replaced by a discriminated union.
  TypeScript discriminated unions give exhaustive type narrowing at zero runtime cost.
- `Database` in Python wraps `ListRule` with caching on the rule object itself. Here the
  cache layer is explicit in `RenderEngine`'s per-render maps rather than on the rule,
  keeping the `Grammar` type a pure value with no mutable state.
- `ListRule` includes an optional `order` field for MARKOV mode. Python encodes this in
  the options object at parse time but loses it in the intermediate representation; here
  it is preserved on the domain type.

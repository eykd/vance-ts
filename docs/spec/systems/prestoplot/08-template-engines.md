# Template Engines

## Overview

Two template engines are supported, selected per-grammar via the `render` key in
the grammar file (see: 03-grammar-file-format.md):

- **ftemplate** (default): custom interpolation using `{expression}` syntax.
- **jinja2**: Jinja2-subset interpreter using `{{ expression }}` syntax.

Both implement `TemplateEnginePort` and return `RenderedString`.

## FtemplateEngine

### Syntax

`{expression}` where `expression` supports:

| Pattern | Meaning |
|---------|---------|
| `{name}` | Render rule `name` from merged grammar; or userVar `name` |
| `{name.key}` | Access field `key` of StructRule `name` (Databag) |
| `{name[0]}` | Access item at index `0` of ListRule `name` in LIST mode (Datalist) |
| `{name.a}` | Lowercase article ("a" or "an") for the rendered value |
| `{name.an}` | Full "a word" / "an apple" form (lowercase article) |
| `{name.A}` | Uppercase article ("A" or "An") |
| `{name.An}` | Full "A word" / "An apple" form (uppercase article) |
| `{{` | Literal `{` character (escape) |
| `}}` | Literal `}` character (escape) |

### Expression Grammar (informal BNF)

```
expression  ::= identifier accessor*
accessor    ::= "." identifier
              | "[" index "]"
              | ".a" | ".an" | ".A" | ".An"
identifier  ::= [A-Za-z_][A-Za-z0-9_]*
index       ::= [0-9]+
```

Article accessors (`.a`, `.an`, `.A`, `.An`) are **terminal** — they cannot be chained
further (e.g., `{name.key.a}` accesses field `key` then takes the article).

### Resolution Order

For name `N` in `{N}`, `{N.key}`, `{N[idx]}`, or `{N.article}`:

1. Check `RenderContext.userVars` for key `N`. If found, return as `RenderedString`.
2. Check the merged rule map for rule name `N`. If found, render the rule.
3. Throw `RuleNotFoundError(N)`.

### Recursive Rendering

Template expressions may reference rules that themselves contain `{...}` expressions.
Recursion depth is bounded by `FtemplateEngine.MAX_DEPTH = 50`. Exceeding this limit
throws `TemplateError` with message `"Maximum recursion depth exceeded"`.

### Implementation

```typescript
/**
 * FtemplateEngine implements TemplateEnginePort using a custom iterative
 * tokenizer and evaluator for `{expression}` interpolation.
 *
 * The engine is stateless with respect to RenderContext; context is passed
 * per call. Tokenized templates are cached on the engine instance by template
 * string for performance (safe to share across render calls).
 */
export class FtemplateEngine implements TemplateEnginePort {
  /**
   * Maximum recursion depth for rule references within a template.
   * Exceeding this limit throws TemplateError.
   */
  static readonly MAX_DEPTH = 50;

  render(template: string, sourcePath: string, context: RenderContext): RenderedString;
}
```

### Tokenizer

The ftemplate tokenizer walks the template string character-by-character (iterative,
no regex). It produces an array of tokens that are cached on the engine instance:

```typescript
/** A literal text segment between interpolation expressions. */
interface LiteralToken {
  readonly kind: 'literal';
  readonly value: string;
}

/** A parsed interpolation expression to evaluate. */
interface ExprToken {
  readonly kind: 'expr';
  readonly name: string;
  readonly accessors: readonly Accessor[];
}

type Accessor =
  | { readonly kind: 'field'; readonly key: string }
  | { readonly kind: 'index'; readonly idx: number }
  | { readonly kind: 'article'; readonly form: 'a' | 'an' | 'A' | 'An' };

type FtemplateToken = LiteralToken | ExprToken;
```

**Template cache**: `Map<string, FtemplateToken[]>` on the `FtemplateEngine` instance,
keyed by template string. Safe to share across render calls (tokens are immutable).
The cache avoids re-tokenizing the same template on repeated rule invocations within
a render session or across sessions.

### Error Handling

- Unclosed `{` → `TemplateError` with message `"Unclosed '{' in template"`
- Unmatched `}` → `TemplateError` with message `"Unexpected '}' in template"`
- Empty expression `{}` → `TemplateError` with message `"Empty expression"`
- Unknown name → `RuleNotFoundError(name)`
- Recursion exceeded → `TemplateError` with message `"Maximum recursion depth exceeded"`

## Jinja2Engine (subset)

### Motivation

Jinja2 is the Python standard template engine. A subset is specified here for
compatibility with grammars authored for the Python prestoplot system. Full Jinja2
(control flow, macros, inheritance, filters) is NOT required and NOT implemented.

### Supported Subset

| Feature | Syntax | Notes |
|---------|--------|-------|
| Variable interpolation | `{{ name }}` | Same resolution order as ftemplate |
| Field access | `{{ name.key }}` | Databag access |
| Index access | `{{ name[0] }}` | Datalist access |
| Article access | `{{ name.a }}` | `.a`, `.an`, `.A`, `.An` |
| Whitespace control | `{{- expr -}}` | Strip adjacent whitespace |
| Comment | `{# comment text #}` | Rendered as empty string |
| Literal brace | `{{ '{' }}` | Standard Jinja2 string literal approach |

### Unsupported (throw TemplateError on encounter)

The following Jinja2 features are NOT supported. If encountered, throw `TemplateError`
rather than silently producing incorrect output:

- Block tags: `{% if %}`, `{% for %}`, `{% block %}`, `{% extends %}`, `{% macro %}`
- Filters: `{{ value | upper }}`, `{{ value | replace('a', 'b') }}`
- Tests: `{% if x is defined %}`, `{% if x is none %}`
- Template inheritance: `{% extends "base.html" %}`

### Implementation

```typescript
/**
 * Jinja2-subset template engine.
 *
 * Implements `{{ expression }}` interpolation with the same resolution
 * logic as FtemplateEngine. The tokenizer differs only in delimiter recognition
 * (`{{ }}` vs `{ }`). Unsupported Jinja2 features throw TemplateError rather
 * than silently no-oping.
 *
 * Template caching follows the same strategy as FtemplateEngine.
 */
export class Jinja2Engine implements TemplateEnginePort {
  static readonly MAX_DEPTH = 50;

  render(template: string, sourcePath: string, context: RenderContext): RenderedString;
}
```

## Deviations from Python

- Python's ftemplate uses Python's expression evaluation (`getattr`, `__getitem__`,
  f-string formatting). TypeScript implements a minimal AST evaluator covering only
  the subset of expression forms actually used in prestoplot grammars. Arbitrary
  Python expressions (`{x if condition else y}`, `{name.upper()}`) are NOT supported.
- Python's Jinja2 template uses the full Jinja2 library. TypeScript implements a
  compatible subset; grammars using unsupported Jinja2 features will fail loudly
  (TemplateError) rather than silently misbehave.
- Template caching (in-memory per engine instance) is a TypeScript addition for
  performance. Python's template caching is handled by Jinja2's built-in Environment.
- The ftemplate tokenizer is iterative (char-by-char) rather than regex-based to
  avoid regex overhead and ensure predictable CF Workers performance.

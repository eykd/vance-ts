/**
 * Jinja2-subset template engine.
 *
 * Implements `{{ expression }}` interpolation with dot-access, index-access,
 * and article accessors. Uses a char-by-char tokenizer (ReDoS-safe) with
 * for...of iteration for surrogate safety.
 *
 * Unsupported Jinja2 features (block tags, filters, tests, inheritance)
 * throw {@link TemplateError} rather than silently producing incorrect output.
 *
 * @module infrastructure/prestoplot/jinja2Engine
 */

import { getArticle } from '../../domain/prestoplot/articleGeneration.js';
import { TemplateError } from '../../domain/prestoplot/errors.js';
import type { TemplateEnginePort } from '../../domain/prestoplot/templateEnginePort.js';

/** Maximum characters shown in error message template excerpts. */
const ERROR_TRUNCATE = 50;

/** Maximum number of accessors in a single expression chain. */
const MAX_ACCESSOR_DEPTH = 10;

/** A literal text segment between interpolation expressions. */
interface LiteralToken {
  readonly kind: 'literal';
  readonly value: string;
}

/** A comment token (rendered as empty string). */
interface CommentToken {
  readonly kind: 'comment';
}

/** A whitespace-stripping marker on an expression. */
interface StripDirective {
  readonly left: boolean;
  readonly right: boolean;
}

/** A parsed interpolation expression to evaluate. */
interface ExprToken {
  readonly kind: 'expr';
  readonly name: string;
  readonly accessors: readonly Accessor[];
  readonly strip: StripDirective;
}

/** Accessor types for field, index, and article access. */
type Accessor =
  | { readonly kind: 'field'; readonly key: string }
  | { readonly kind: 'index'; readonly idx: number }
  | { readonly kind: 'article'; readonly form: 'a' | 'an' | 'A' | 'An' };

/** Union of all token types produced by the tokenizer. */
type Jinja2Token = LiteralToken | CommentToken | ExprToken;

/**
 * Truncate a template string for error messages.
 *
 * @param template - The template string to truncate.
 * @returns The truncated string (max 50 chars with ellipsis).
 */
function truncate(template: string): string {
  if (template.length <= ERROR_TRUNCATE) {
    return template;
  }
  return template.slice(0, ERROR_TRUNCATE) + '...';
}

/**
 * Check if a character is a valid identifier start character.
 *
 * @param ch - The character to check.
 * @returns True if the character can start an identifier.
 */
function isIdentStart(ch: string): boolean {
  return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_';
}

/**
 * Check if a character is a valid identifier continuation character.
 *
 * @param ch - The character to check.
 * @returns True if the character can continue an identifier.
 */
function isIdentCont(ch: string): boolean {
  return isIdentStart(ch) || (ch >= '0' && ch <= '9');
}

/**
 * Check if a character is a digit.
 *
 * @param ch - The character to check.
 * @returns True if the character is a digit.
 */
function isDigit(ch: string): boolean {
  return ch >= '0' && ch <= '9';
}

/**
 * Parse an expression string into a name and accessor chain.
 *
 * @param raw - The raw expression string (trimmed).
 * @param template - The full template (for error messages).
 * @returns An object with name and accessors.
 * @throws {TemplateError} On syntax errors or unsupported features.
 */
function parseExpression(
  raw: string,
  template: string
): { name: string; accessors: readonly Accessor[] } {
  const chars = [...raw];
  let pos = 0;

  // Check for filter pipe (unsupported)
  if (raw.includes('|')) {
    throw new TemplateError(
      'unsupported_feature',
      `Unsupported Jinja2 feature: filters in "${truncate(template)}"`
    );
  }

  // Parse identifier
  if (pos >= chars.length || !isIdentStart(chars[pos] ?? '')) {
    // Could be a string literal like '{'
    if (chars[pos] === "'" || chars[pos] === '"') {
      const quote = chars[pos]!;
      pos++;
      let literal = '';
      while (pos < chars.length && chars[pos] !== quote) {
        literal += chars[pos];
        pos++;
      }
      if (pos >= chars.length) {
        throw new TemplateError(
          'syntax_error',
          `Unclosed string literal in "${truncate(template)}"`
        );
      }
      // Return the literal content as the name with no accessors
      return { name: literal, accessors: [] };
    }
    throw new TemplateError('syntax_error', `Invalid expression in "${truncate(template)}"`);
  }

  let name = '';
  while (pos < chars.length && isIdentCont(chars[pos] ?? '')) {
    name += chars[pos];
    pos++;
  }

  const accessors: Accessor[] = [];

  while (pos < chars.length) {
    const ch = chars[pos];
    if (ch === '.') {
      pos++;
      if (pos >= chars.length) {
        throw new TemplateError(
          'syntax_error',
          `Trailing dot in expression in "${truncate(template)}"`
        );
      }

      // Check for article accessors
      let ident = '';
      while (pos < chars.length && isIdentCont(chars[pos] ?? '')) {
        ident += chars[pos];
        pos++;
      }

      if (ident === '') {
        throw new TemplateError(
          'syntax_error',
          `Empty accessor after dot in "${truncate(template)}"`
        );
      }

      if (ident === 'a' || ident === 'an' || ident === 'A' || ident === 'An') {
        accessors.push({ kind: 'article', form: ident });
        // Article is terminal — no further accessors allowed
        break;
      }

      accessors.push({ kind: 'field', key: ident });
    } else if (ch === '[') {
      pos++;
      let idx = '';
      while (pos < chars.length && isDigit(chars[pos] ?? '')) {
        idx += chars[pos];
        pos++;
      }
      if (pos >= chars.length || chars[pos] !== ']') {
        throw new TemplateError(
          'syntax_error',
          `Unclosed index accessor in "${truncate(template)}"`
        );
      }
      pos++; // skip ']'
      accessors.push({ kind: 'index', idx: Number(idx) });
    } else {
      throw new TemplateError(
        'syntax_error',
        `Unexpected character "${ch}" in expression in "${truncate(template)}"`
      );
    }

    if (accessors.length > MAX_ACCESSOR_DEPTH) {
      throw new TemplateError(
        'accessor_depth_exceeded',
        `Accessor chain exceeds maximum depth of ${String(MAX_ACCESSOR_DEPTH)}`
      );
    }
  }

  return { name, accessors: Object.freeze(accessors) };
}

/**
 * Tokenize a Jinja2-subset template string.
 *
 * Uses char-by-char iteration with for...of for surrogate safety.
 * Detects `{{ }}`, `{# #}`, and `{% %}` (unsupported → error).
 *
 * @param template - The template string to tokenize.
 * @returns An array of tokens.
 * @throws {TemplateError} On syntax errors or unsupported features.
 */
function tokenize(template: string): readonly Jinja2Token[] {
  const tokens: Jinja2Token[] = [];
  const codePoints = [...template];
  const len = codePoints.length;
  let i = 0;
  let literal = '';

  while (i < len) {
    const ch = codePoints[i]!;

    if (ch === '{' && i + 1 < len) {
      const next = codePoints[i + 1]!;

      if (next === '{') {
        // Expression start {{ ... }}
        if (literal.length > 0) {
          tokens.push({ kind: 'literal', value: literal });
          literal = '';
        }

        i += 2; // skip {{
        let stripLeft = false;
        if (i < len && codePoints[i] === '-') {
          stripLeft = true;
          i++;
        }

        // Collect until }}
        let expr = '';
        let found = false;
        while (i < len) {
          if (
            codePoints[i] === '-' &&
            i + 1 < len &&
            codePoints[i + 1] === '}' &&
            i + 2 < len &&
            codePoints[i + 2] === '}'
          ) {
            // Strip right: -}}
            tokens.push(buildExprToken(expr.trim(), template, { left: stripLeft, right: true }));
            i += 3;
            found = true;
            break;
          }
          if (codePoints[i] === '}' && i + 1 < len && codePoints[i + 1] === '}') {
            tokens.push(buildExprToken(expr.trim(), template, { left: stripLeft, right: false }));
            i += 2;
            found = true;
            break;
          }
          expr += codePoints[i];
          i++;
        }

        if (!found) {
          throw new TemplateError(
            'unclosed_expr',
            `Unclosed '{{' in template "${truncate(template)}"`
          );
        }
        continue;
      }

      if (next === '#') {
        // Comment {# ... #}
        if (literal.length > 0) {
          tokens.push({ kind: 'literal', value: literal });
          literal = '';
        }

        i += 2; // skip {#
        let found = false;
        while (i < len) {
          if (codePoints[i] === '#' && i + 1 < len && codePoints[i + 1] === '}') {
            tokens.push({ kind: 'comment' });
            i += 2;
            found = true;
            break;
          }
          i++;
        }

        if (!found) {
          throw new TemplateError(
            'unclosed_comment',
            `Unclosed '{#' in template "${truncate(template)}"`
          );
        }
        continue;
      }

      if (next === '%') {
        // Block tag — unsupported
        throw new TemplateError(
          'unsupported_feature',
          `Unsupported Jinja2 feature: block tags in "${truncate(template)}"`
        );
      }
    }

    literal += ch;
    i++;
  }

  if (literal.length > 0) {
    tokens.push({ kind: 'literal', value: literal });
  }

  return Object.freeze(tokens);
}

/**
 * Build an ExprToken from a trimmed expression string.
 *
 * @param trimmedExpr - The expression content, already trimmed.
 * @param template - The full template (for error messages).
 * @param strip - The whitespace strip directives.
 * @returns An ExprToken.
 * @throws {TemplateError} On empty or invalid expressions.
 */
function buildExprToken(trimmedExpr: string, template: string, strip: StripDirective): ExprToken {
  if (trimmedExpr.length === 0) {
    throw new TemplateError('empty_expr', `Empty expression in "${truncate(template)}"`);
  }

  const { name, accessors } = parseExpression(trimmedExpr, template);

  return Object.freeze({
    kind: 'expr' as const,
    name,
    accessors,
    strip,
  });
}

/**
 * Jinja2-subset template engine implementing TemplateEnginePort.
 *
 * Supports `{{ expression }}` interpolation with dot-access, index-access,
 * and article accessors. Comments `{# #}` are stripped. Unsupported Jinja2
 * features throw TemplateError. Tokenized templates are cached per instance
 * with FIFO eviction at MAX_CACHE_SIZE.
 */
export class Jinja2Engine implements TemplateEnginePort {
  /** Maximum recursion depth for template evaluation. */
  static readonly MAX_DEPTH = 50;

  /** Maximum number of accessors in a single expression chain. */
  static readonly MAX_ACCESSOR_DEPTH = MAX_ACCESSOR_DEPTH;

  /** Maximum number of cached tokenized templates (FIFO eviction). */
  static readonly MAX_CACHE_SIZE = 500;

  /** Cache of tokenized templates keyed by template string. */
  private readonly cache = new Map<string, readonly Jinja2Token[]>();

  /**
   * Evaluate template expressions in the given text.
   *
   * Resolves references against the provided context. Returns plain text
   * with all expressions replaced and comments removed.
   *
   * @param template - The text containing template expressions.
   * @param context - Map of variable names to already-rendered string values.
   * @param depth - Current recursion depth for cycle detection.
   * @returns Plain text with all expressions resolved.
   * @throws {TemplateError} On syntax errors, unsupported features, or depth exceeded.
   */
  evaluate(template: string, context: Readonly<Record<string, string>>, depth: number): string {
    if (depth >= Jinja2Engine.MAX_DEPTH) {
      throw new TemplateError('max_depth_exceeded', 'Maximum recursion depth exceeded');
    }

    const tokens = this.tokenizeWithCache(template);
    return this.render(tokens, context);
  }

  /**
   * Tokenize a template, using cache if available.
   *
   * @param template - The template string to tokenize.
   * @returns The array of tokens.
   */
  private tokenizeWithCache(template: string): readonly Jinja2Token[] {
    const cached = this.cache.get(template);
    if (cached !== undefined) {
      return cached;
    }

    const tokens = tokenize(template);

    // FIFO eviction when cache is full
    if (this.cache.size >= Jinja2Engine.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next();
      if (firstKey.done !== true) {
        this.cache.delete(firstKey.value);
      }
    }

    this.cache.set(template, tokens);
    return tokens;
  }

  /**
   * Render tokenized template against context.
   *
   * @param tokens - The tokenized template.
   * @param context - Variable context for resolution.
   * @returns The rendered string.
   */
  private render(
    tokens: readonly Jinja2Token[],
    context: Readonly<Record<string, string>>
  ): string {
    const parts: string[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]!;

      if (token.kind === 'literal') {
        let value = token.value;

        // Check if next token is an expr with left-strip
        const next = tokens[i + 1];
        if (next?.kind === 'expr' && next.strip.left) {
          value = value.replace(/\s+$/, '');
        }

        // Check if previous token was an expr with right-strip
        const prev = i > 0 ? tokens[i - 1] : undefined;
        if (prev?.kind === 'expr' && prev.strip.right) {
          value = value.replace(/^\s+/, '');
        }

        parts.push(value);
      } else if (token.kind === 'expr') {
        parts.push(this.resolveExpr(token, context));
      }
      // comment tokens produce no output
    }

    return parts.join('');
  }

  /**
   * Resolve an expression token against the context.
   *
   * @param token - The expression token to resolve.
   * @param context - Variable context for resolution.
   * @returns The resolved string value.
   * @throws {TemplateError} On unresolvable references or invalid accessor chains.
   */
  private resolveExpr(token: ExprToken, context: Readonly<Record<string, string>>): string {
    if (!Object.hasOwn(context, token.name)) {
      throw new TemplateError('rule_not_found', `Rule "${token.name}" not found`);
    }

    const value = context[token.name]!;

    if (token.accessors.length === 0) {
      return value;
    }

    // Process accessors on the resolved value
    for (const accessor of token.accessors) {
      if (accessor.kind === 'article') {
        const article = getArticle(value);
        switch (accessor.form) {
          case 'a':
            return article;
          case 'an':
            return `${article} ${value}`;
          case 'A':
            return article === 'a' ? 'A' : 'An';
          case 'An':
            return `${article === 'a' ? 'A' : 'An'} ${value}`;
        }
      }

      // Field and index accessors on a plain string context are invalid
      throw new TemplateError(
        'invalid_accessor',
        `Cannot apply ${accessor.kind} accessor to string value "${truncate(value)}"`
      );
    }

    return value;
  }
}

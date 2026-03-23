# Application Services

## RenderStoryService

The primary entry point for grammar rendering. Accepts all ports via constructor
injection. Never throws — all errors are returned as typed result variants.

```typescript
/**
 * Input parameters for RenderStoryService.render.
 */
export interface RenderStoryRequest {
  /** Root module name (grammar file to render). */
  readonly moduleName: string;

  /**
   * Rule name to start rendering from. Defaults to "Begin" if not provided.
   * Must exist in the resolved grammar or an included module.
   */
  readonly start?: string;

  /**
   * Seed string (32-char hex). If not provided, a fresh seed is generated
   * via SHA-256(crypto.getRandomValues(32 bytes)) → first 32 hex chars.
   */
  readonly seed?: string;

  /**
   * User-supplied variables available in template expressions as top-level names.
   * Values are plain strings; they are NOT recursively rendered.
   */
  readonly userVars?: Readonly<Record<string, string>>;
}

/**
 * Result of RenderStoryService.render.
 * Never throws; always returns one of these variants.
 */
export type RenderStoryResult =
  | { readonly ok: true; readonly text: string; readonly seed: string }
  | { readonly ok: false; readonly kind: 'module_not_found'; readonly moduleName: string }
  | { readonly ok: false; readonly kind: 'rule_not_found'; readonly ruleName: string }
  | { readonly ok: false; readonly kind: 'circular_include'; readonly chain: readonly string[] }
  | { readonly ok: false; readonly kind: 'template_error'; readonly sourcePath: string; readonly message: string }
  | { readonly ok: false; readonly kind: 'storage_error'; readonly message: string };

/**
 * Application service for grammar-based text generation.
 *
 * Orchestrates: seed generation, module resolution, include merging,
 * context construction, rule selection, and template rendering.
 *
 * @example
 * ```typescript
 * const service = new RenderStoryService(storage, templateEngine, random, logger);
 * const result = await service.render({ moduleName: 'intro', seed: 'abc123...' });
 * if (result.ok) {
 *   return result.text;
 * }
 * ```
 */
export class RenderStoryService {
  constructor(
    private readonly storage: StoragePort,
    private readonly templateEngine: TemplateEnginePort,
    private readonly random: RandomPort,
    private readonly logger: Logger,
  ) {}

  /**
   * Renders a story from the named grammar module.
   *
   * Flow:
   * 1. Generate or validate seed.
   * 2. Resolve the root module via StoragePort.
   * 3. Resolve all included modules recursively; local rules shadow included rules
   *    (breadth-first, first-definition-wins).
   * 4. Construct a RenderContext with seed and userVars.
   * 5. Resolve the start rule (default: "Begin").
   * 6. Render the start rule to a string.
   * 7. Return { ok: true, text, seed }.
   *
   * Never throws. All errors are returned as typed failure variants.
   *
   * @param request - Render parameters.
   * @returns Typed result.
   */
  async render(request: RenderStoryRequest): Promise<RenderStoryResult>;
}
```

## GrammarParser

```typescript
/**
 * Parses YAML grammar source into the Grammar domain type.
 *
 * Lives in the application layer; depends on a YAML parsing library
 * (js-yaml 4.x or equivalent) that is CF-compatible.
 *
 * @remarks
 * js-yaml 4.x is CF-compatible (no Node.js dependency in its browser bundle).
 * The YAML library MUST NOT require `fs`, `path`, or any Node.js modules.
 */
export interface GrammarParser {
  /**
   * Parses YAML grammar source.
   *
   * @param source - Raw YAML string.
   * @param moduleName - Used in error messages only.
   * @returns Parsed Grammar.
   * @throws {GrammarParseError} on invalid YAML, unrecognized mode values,
   *   invalid order values, or invalid render strategy.
   */
  parse(source: string, moduleName: string): Grammar;
}

/**
 * Thrown by GrammarParser.parse on invalid grammar source.
 */
export class GrammarParseError extends Error {
  readonly moduleName: string;

  constructor(moduleName: string, message: string) {
    super(`Grammar parse error in ${moduleName}: ${message}`);
    this.name = 'GrammarParseError';
    this.moduleName = moduleName;
  }
}
```

## RenderEngine (internal)

The `RenderEngine` is a stateful, per-render helper constructed by `RenderStoryService`
for each `render()` call. It is NOT exported from the application layer; callers use
`RenderStoryService` only.

```typescript
/**
 * Per-render execution engine.
 *
 * Constructed fresh for each render call. Maintains the merged rule map
 * (root + all transitive includes), the RenderContext, and per-render
 * caches (Markov models, seed-to-int results).
 *
 * @internal
 */
class RenderEngine {
  /**
   * Resolves a rule by name from the merged rule map.
   *
   * @throws {RuleNotFoundError} if the rule is absent from all grammars.
   */
  resolveRule(name: string): Rule;

  /**
   * Renders a Rule to a RenderedString, Databag, or Datalist.
   *
   * Dispatches based on Rule.kind:
   * - text: delegates to TemplateEnginePort.render
   * - list: runs selection algorithm (see 05-selection-modes.md)
   * - struct: returns a Databag; fields are rendered lazily on access
   *
   * @param rule - Rule to render.
   * @param ruleName - Rule name (used for seed scoping and cache keys).
   */
  renderRule(rule: Rule, ruleName: string): Promise<RenderedString | Databag | Datalist>;
}
```

## Include Resolution Rules

1. Includes are resolved **recursively** — an included module may itself include others.
2. Resolution order: **breadth-first, left-to-right** within the `includes` array.
3. Name collision: the **first** definition wins. Root grammar rules shadow all includes;
   earlier includes shadow later ones.
4. Circular includes (A → B → A) MUST be detected before resolution begins and result
   in a `CircularIncludeError` (returned as `{ ok: false, kind: 'circular_include' }`).

```typescript
/**
 * Thrown when a circular include chain is detected.
 */
export class CircularIncludeError extends Error {
  /** The module names in the circular chain, in order of resolution. */
  readonly chain: readonly string[];

  constructor(chain: readonly string[]) {
    super(`Circular include: ${chain.join(' → ')}`);
    this.name = 'CircularIncludeError';
    this.chain = chain;
  }
}
```

## Generating Multiple Results

To generate N independent results from the same grammar, call `RenderStoryService.render`
N times with `seed` omitted (auto-generated). Each call produces a distinct seed and
thus a distinct output. If the caller supplies the same seed to multiple calls, all
results will be identical.

There is no built-in "generate N" method; callers compose this themselves.

## Deviations from Python

- Python's `render_story` is a module-level function. TypeScript uses a class for DI
  consistency with the project's use-case pattern.
- Include resolution in Python is handled at grammar construction time. Here it is
  deferred to render time to keep `Grammar` a pure value type and avoid `StoragePort`
  access in the domain layer.
- Python silently skips circular includes. TypeScript detects and surfaces them as a
  typed error variant.
- Python's `render_story` returns a plain string (raises on error). TypeScript returns a
  discriminated union result; the service never throws.

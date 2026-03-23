# Ports and Adapters

Prestoplot follows hexagonal architecture. The domain and application layers depend only
on these port interfaces. Infrastructure adapters live in `src/infrastructure/prestoplot/`.

## StoragePort

```typescript
/**
 * Port interface for grammar module storage.
 *
 * Implementations: KVStorage, D1Storage, InMemoryStorage, CachedStorage.
 *
 * Each implementation returns a fresh copy of the Grammar on each call so that
 * per-render RenderContext mutations do not affect the stored data.
 */
export interface StoragePort {
  /**
   * Resolves a grammar module by name.
   *
   * Returns a fresh Grammar on each call (shallow copy is sufficient since
   * Grammar and all Rule types are readonly value objects).
   *
   * @param name - Module name (case-sensitive).
   * @returns Parsed Grammar.
   * @throws {ModuleNotFoundError} if the module does not exist.
   * @throws {StorageError} on I/O or parse failure.
   */
  resolveModule(name: string): Promise<Grammar>;

  /**
   * Lists all available module names, sorted alphabetically.
   *
   * @returns Alphabetically sorted array of module names (no extensions).
   */
  listModules(): Promise<readonly string[]>;
}
```

## TemplateEnginePort

```typescript
/**
 * Port interface for template rendering.
 *
 * Implementations: FtemplateEngine (ftemplate), Jinja2Engine (jinja2 subset).
 *
 * The engine is stateless with respect to RenderContext — context is passed
 * per call. Engines MAY cache tokenized templates internally (keyed by
 * template string) across render calls for performance.
 */
export interface TemplateEnginePort {
  /**
   * Renders a template string against a RenderContext.
   *
   * @param template - The raw template string.
   * @param sourcePath - Module name + "." + rule name, for error context.
   * @param context - Mutable render context with seed and user variables.
   * @returns The rendered RenderedString.
   * @throws {TemplateError} on syntax errors or maximum recursion depth exceeded.
   * @throws {RuleNotFoundError} on unresolvable name references.
   */
  render(template: string, sourcePath: string, context: RenderContext): RenderedString;
}
```

## RandomPort

```typescript
/**
 * Pseudorandom number generator factory.
 *
 * The seed string is hashed to a 32-bit integer (see: 06-seed-and-context.md)
 * to initialize the Mulberry32 PRNG. Implementations are deterministic:
 * identical seed strings always produce the same sequence.
 *
 * @remarks
 * getRng is async because seed hashing uses crypto.subtle.digest, which is
 * async in the Cloudflare Workers runtime. See 06-seed-and-context.md for
 * the recommended performance approach (pre-compute seeds before rendering).
 */
export interface RandomPort {
  /**
   * Creates a new RNG instance seeded from the given string.
   *
   * @param seed - Seed or ScopedSeed string (typically 32-char hex, but
   *   may be longer for scoped seeds like "deadbeef...-Begin").
   * @returns A seeded Rng instance.
   */
  getRng(seed: string): Promise<Rng>;
}

/**
 * Seeded random number generator instance.
 *
 * Wraps Mulberry32 from src/domain/galaxy/prng.ts.
 * Methods are synchronous; async work is done in RandomPort.getRng.
 */
export interface Rng {
  /**
   * Returns a uniform random integer in [min, max] inclusive.
   *
   * @param min - Lower bound (inclusive).
   * @param max - Upper bound (inclusive).
   */
  randint(min: number, max: number): number;

  /**
   * Returns a uniform random float in [0, 1).
   */
  random(): number;

  /**
   * Picks a uniformly random element from an array.
   *
   * @param items - Non-empty array to pick from.
   * @returns Selected element.
   * @throws {RangeError} if items is empty.
   */
  choice<T>(items: readonly T[]): T;
}
```

## Error Types

```typescript
/**
 * Thrown by StoragePort.resolveModule when a module is not found.
 */
export class ModuleNotFoundError extends Error {
  /** The module name that was not found. */
  readonly moduleName: string;

  constructor(moduleName: string) {
    super(`Module not found: ${moduleName}`);
    this.name = 'ModuleNotFoundError';
    this.moduleName = moduleName;
  }
}

/**
 * Thrown by TemplateEnginePort.render on syntax or evaluation errors,
 * or when the maximum recursion depth is exceeded.
 */
export class TemplateError extends Error {
  /** The source path (module.rule) where the error occurred. */
  readonly sourcePath: string;

  constructor(sourcePath: string, message: string) {
    super(`Template error in ${sourcePath}: ${message}`);
    this.name = 'TemplateError';
    this.sourcePath = sourcePath;
  }
}

/**
 * Thrown by the render engine when a rule name cannot be resolved from
 * the merged grammar (root + all transitive includes).
 */
export class RuleNotFoundError extends Error {
  readonly ruleName: string;

  constructor(ruleName: string) {
    super(`Rule not found: ${ruleName}`);
    this.name = 'RuleNotFoundError';
    this.ruleName = ruleName;
  }
}

/**
 * Thrown by storage adapters on I/O failures unrelated to missing modules
 * (e.g., KV network error, JSON parse failure, D1 query error).
 */
export class StorageError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'StorageError';
  }
}
```

## Main Entry Point

The primary port contract is `RenderStoryService.render` (see: 04-application-services.md).
It accepts all driving ports via constructor injection and never throws — all errors are
returned as typed result variants.

## Deviations from Python

- Python's `render_story` is a module-level function. TypeScript uses a class
  (`RenderStoryService`) for DI consistency with the project's use-case pattern.
- `RandomPort.getRng` is async because `crypto.subtle.digest` is async in Workers.
  Python's MT19937 seeding is synchronous.
- Include resolution in Python occurs at grammar construction time. Here it is deferred
  to render time, keeping Grammar a pure value type and avoiding `StoragePort` access
  in the domain layer.

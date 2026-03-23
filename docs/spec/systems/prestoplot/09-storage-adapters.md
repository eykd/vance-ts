# Storage Adapters

## Overview

Three concrete storage adapters implement `StoragePort`. All adapters store grammars
as serialized `GrammarDto` JSON. A `CachedStorage` decorator wraps any adapter to add
KV-based caching for cross-request persistence.

See 03-grammar-file-format.md for the `GrammarDto` type definition.

## InMemoryStorage

```typescript
/**
 * In-memory storage adapter for testing and embedded grammars.
 *
 * Accepts a pre-built map of module name → Grammar. Returns a fresh shallow
 * copy of each Grammar on every `resolveModule` call to prevent cross-render
 * state mutation. Since Grammar is a readonly value type, shallow copy is sufficient.
 *
 * This is the primary adapter for unit and integration tests.
 *
 * @example
 * ```typescript
 * const storage = new InMemoryStorage(new Map([
 *   ['intro', {
 *     rules: { Begin: { kind: 'text', template: 'Hello {Name}.' } },
 *     renderStrategy: RenderStrategy.FTEMPLATE,
 *     includes: [],
 *   }],
 * ]));
 * ```
 */
export class InMemoryStorage implements StoragePort {
  constructor(modules: ReadonlyMap<string, Grammar>);

  /**
   * Returns a shallow copy of the stored Grammar.
   *
   * @throws {ModuleNotFoundError} if the name is not in the map.
   */
  async resolveModule(name: string): Promise<Grammar>;

  /**
   * Returns all keys sorted alphabetically.
   */
  async listModules(): Promise<readonly string[]>;
}
```

## KVStorage

```typescript
/**
 * Cloudflare KV storage adapter.
 *
 * Grammars are stored as JSON-serialized `GrammarDto` values.
 * KV key format: `grammar:{moduleName}` (module names normalized to lowercase
 * for KV key consistency; KV is case-sensitive).
 *
 * Module listing uses KV prefix scan: `kv.list({ prefix: 'grammar:' })`.
 * Returns names sorted alphabetically after stripping the `grammar:` prefix.
 *
 * @example
 * ```typescript
 * // In wrangler.toml:
 * // [[kv_namespaces]]
 * // binding = "GRAMMARS"
 * // id = "..."
 *
 * const storage = new KVStorage(env.GRAMMARS);
 * ```
 */
export class KVStorage implements StoragePort {
  /** @param kv - Cloudflare KV namespace binding. */
  constructor(kv: KVNamespace);

  /**
   * @throws {ModuleNotFoundError} if the key does not exist in KV.
   * @throws {StorageError} on KV read failure or JSON parse error.
   */
  async resolveModule(name: string): Promise<Grammar>;

  async listModules(): Promise<readonly string[]>;
}
```

### KV Schema

```
Key:   grammar:{moduleName}    (moduleName lowercase)
Value: JSON.stringify(GrammarDto)
```

### Error Handling

- KV returns `null` for missing keys → throw `ModuleNotFoundError(name)`.
- JSON parse failure → throw `StorageError("Failed to parse grammar: {name}", cause)`.
- KV network/runtime failure → throw `StorageError("KV read failed: {name}", cause)`.

## D1Storage

```typescript
/**
 * Cloudflare D1 storage adapter.
 *
 * Grammars are stored in a `grammars` table. See migration below.
 * The `data` column stores JSON-serialized `GrammarDto`.
 *
 * @example
 * ```typescript
 * const storage = new D1Storage(env.DB);
 * ```
 */
export class D1Storage implements StoragePort {
  /** @param db - Cloudflare D1 database binding. */
  constructor(db: D1Database);

  /**
   * Executes: `SELECT data FROM grammars WHERE name = ?`
   *
   * @throws {ModuleNotFoundError} if no row with the given name exists.
   * @throws {StorageError} on D1 query failure or JSON parse error.
   */
  async resolveModule(name: string): Promise<Grammar>;

  /**
   * Executes: `SELECT name FROM grammars ORDER BY name ASC`
   */
  async listModules(): Promise<readonly string[]>;
}
```

### D1 Schema Migration

```sql
-- migrations/prestoplot_001_grammars.sql
CREATE TABLE IF NOT EXISTS grammars (
  name TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS grammars_name_idx ON grammars (name);
```

## CachedStorage

```typescript
/**
 * Caching decorator for StoragePort.
 *
 * Wraps any StoragePort implementation and caches resolved Grammars in
 * a Cloudflare KV namespace with a configurable TTL. Useful when the
 * backing store is D1 (higher latency) and grammars change infrequently.
 *
 * Cache key format: `prestoplot-cache:{moduleName}`.
 * Cache value: JSON-serialized GrammarDto.
 *
 * Cache misses and KV write failures are logged at WARN but do NOT cause the
 * overall resolveModule call to fail — the backing store result is returned.
 *
 * @example
 * ```typescript
 * const d1Storage = new D1Storage(env.DB);
 * const storage = new CachedStorage(d1Storage, env.GRAMMAR_CACHE, 3600);
 * ```
 */
export class CachedStorage implements StoragePort {
  /**
   * @param backing - The underlying StoragePort to delegate cache misses to.
   * @param cache - KV namespace for the grammar cache.
   * @param ttlSeconds - Cache TTL in seconds. Default: 3600 (1 hour).
   */
  constructor(backing: StoragePort, cache: KVNamespace, ttlSeconds?: number);

  /**
   * Attempts KV cache lookup first. On miss, delegates to `backing.resolveModule`,
   * stores the result in KV (best-effort), and returns it.
   */
  async resolveModule(name: string): Promise<Grammar>;

  /**
   * Always delegates to the backing store (listing is not cached).
   */
  async listModules(): Promise<readonly string[]>;
}
```

## GrammarDto ↔ Grammar Conversion

Each storage adapter is responsible for converting `GrammarDto` ↔ `Grammar`. The
conversion logic is extracted into a shared utility in the application layer:

```typescript
/**
 * Converts a GrammarDto (storage format) to a Grammar (domain type).
 *
 * @throws {StorageError} if the DTO contains invalid SelectionMode or
 *   RenderStrategy values that cannot be coerced to their enum counterparts.
 */
export function grammarFromDto(dto: GrammarDto): Grammar;

/**
 * Converts a Grammar (domain type) to a GrammarDto (storage format).
 */
export function grammarToDto(grammar: Grammar): GrammarDto;
```

Location: `src/application/prestoplot/dto.ts`

## Deviations from Python

- Python's `FileStorage` (reads `.yaml` files from disk) is removed. No filesystem
  exists in Cloudflare Workers.
- Python's `CachedStorage` caches in-process (Python dict, per-process lifetime).
  TypeScript's `CachedStorage` caches in KV for cross-request persistence within
  the same Worker deployment. This is a meaningful behavioral difference: Python's
  cache is lost on process restart; KV cache persists across requests and deployments
  until TTL expires.
- KV key normalization (lowercase module names) prevents case-sensitivity bugs.
  KV is case-sensitive but grammars are typically named case-insensitively by authors.
- `CompilingFileStorage` and `CompilingCachedFileStorage` (Python's MessagePack
  binary cache adapters) have no equivalent; KV JSON serialization serves this role.

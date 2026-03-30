# Contract: StoragePort

**Layer**: Application (port interface)
**File**: `src/application/prestoplot/ports.ts`

## Interface

```typescript
/** Port for loading and persisting grammar data. */
interface StoragePort {
  /** Load a grammar DTO by key. Returns null if not found. */
  load(key: string): Promise<GrammarDto | null>;

  /** Save a grammar DTO. Overwrites if key exists. */
  save(key: string, grammar: GrammarDto): Promise<void>;

  /** Delete a grammar by key. No-op if not found. */
  delete(key: string): Promise<void>;

  /** List all stored grammar keys. */
  keys(): Promise<readonly string[]>;
}
```

## Implementations

| Adapter         | File                                               | Storage Backend                            |
| --------------- | -------------------------------------------------- | ------------------------------------------ |
| InMemoryStorage | `src/infrastructure/prestoplot/inMemoryStorage.ts` | Map<string, GrammarDto>                    |
| KVStorage       | `src/infrastructure/prestoplot/kvStorage.ts`       | Cloudflare KV namespace                    |
| D1Storage       | `src/infrastructure/prestoplot/d1Storage.ts`       | Cloudflare D1 database                     |
| CachedStorage   | `src/infrastructure/prestoplot/cachedStorage.ts`   | Wraps any StoragePort + Map cache with TTL |

## Error Handling

- `load()` returns `null` for missing keys (not an error)
- `save()` throws `StorageError` on write failure
- Network/binding errors wrapped in `StorageError` with original cause

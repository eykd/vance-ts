# Test Specification

## Testing Requirements

All prestoplot code must satisfy:

- **100% branch, function, line, and statement coverage** enforced by Vitest `--coverage`.
- Tests colocated with source files using `.spec.ts` suffix.
- Tests run in the **workers** Vitest project (`src/**/*.spec.ts`), executed via
  `@cloudflare/vitest-pool-workers` for CF Workers runtime accuracy.
- All tests must pass in the Cloudflare Workers runtime.

## Test Organization

```
src/domain/prestoplot/
  grammar.spec.ts             — Rule type narrowing, Grammar construction, SelectionMode enum
  renderedString.spec.ts      — makeRenderedString, RenderedString property correctness
  seed.spec.ts                — makeSeed, generateSeed, scopeSeed, seedToInt
  articleGeneration.spec.ts   — getArticle: vowels, consonants, special cases, edge cases
  markovChain.spec.ts         — trainMarkovChain, generateMarkov, MarkovDeadEndError
  selectionModes.spec.ts      — PickState, SelectionState, PICK Fisher-Yates correctness
  errors.spec.ts              — Error class construction, name/message properties

src/application/prestoplot/
  renderStoryService.spec.ts  — Full render pipeline with InMemoryStorage
  grammarParser.spec.ts       — YAML → Grammar, TextRule/ListRule/StructRule, error cases
  includeResolution.spec.ts   — Include merging, shadowing, circular detection
  dto.spec.ts                 — grammarFromDto, grammarToDto round-trips

src/infrastructure/prestoplot/
  inMemoryStorage.spec.ts     — InMemoryStorage: resolveModule, listModules, copy isolation
  kvStorage.spec.ts           — KVStorage with miniflare KV binding
  d1Storage.spec.ts           — D1Storage with miniflare D1 binding
  cachedStorage.spec.ts       — CachedStorage: cache hit, miss, TTL, write-failure resilience
  ftemplateEngine.spec.ts     — Tokenizer, evaluator, cache, MAX_DEPTH, error cases
  jinja2Engine.spec.ts        — Subset support, unsupported-feature errors
  mulberry32Random.spec.ts    — RandomPort adapter: getRng, Rng.choice/randint/random
  seedHasher.spec.ts          — seedToInt: pipeline correctness, caching behavior
```

## Seed / PRNG Test Vectors

The following test vectors MUST be computed once during initial implementation of
`seedToInt` and `Mulberry32` and recorded here permanently. They define the conformance
contract for the seeding pipeline.

### seedToInt Test Vectors

Algorithm: `SHA-256(UTF-8(seedString))` → bytes 0–3 as big-endian uint32.

| Input seed string | Expected uint32 (hex) | Expected uint32 (decimal) |
|-------------------|-----------------------|--------------------------|
| `"00000000000000000000000000000000"` | **TBD** | **TBD** |
| `"deadbeefdeadbeefdeadbeefdeadbeef"` | **TBD** | **TBD** |
| `"ffffffffffffffffffffffffffffffff"` | **TBD** | **TBD** |
| `"00000000000000000000000000000000-Begin"` | **TBD** | **TBD** |
| `"00000000000000000000000000000000-Hero-reuse"` | **TBD** | **TBD** |

**Action for implementor**: Run `seedToInt(input)` for each row and record the uint32
result here before marking any seed test as complete. These values become the permanent
normative test vectors for this implementation.

### Mulberry32 PRNG Vectors

Inherited from `src/domain/galaxy/prng.ts`. Prestoplot MUST use the same `Mulberry32`
class without modification. The prestoplot tests MUST verify the shared instance produces
these exact values (do NOT duplicate the implementation).

| Seed (uint32) | Call 1 `.random()` | Call 2 `.random()` | Call 1 `.randint(0, 9)` |
|--------------|--------------------|--------------------|------------------------|
| `0` | **TBD** | **TBD** | **TBD** |
| `1` | **TBD** | **TBD** | **TBD** |
| `0x12345678` | **TBD** | **TBD** | **TBD** |

**Action for implementor**: Read existing `prng.spec.ts` to verify these values are
already tested there. If not, add them there (not here). Prestoplot tests import the
same module and trust its conformance.

### ScopedSeed Vectors

ScopedSeeds are plain string concatenation — no hashing at the `scopeSeed` call site.

| Base seed | Key | Expected ScopedSeed string |
|-----------|-----|---------------------------|
| `"deadbeefdeadbeefdeadbeefdeadbeef"` | `"Begin"` | `"deadbeefdeadbeefdeadbeefdeadbeef-Begin"` |
| `"deadbeefdeadbeefdeadbeefdeadbeef"` | `"Stats"` | `"deadbeefdeadbeefdeadbeefdeadbeef-Stats"` |
| `"deadbeefdeadbeefdeadbeefdeadbeef-Hero"` | `"name"` | `"deadbeefdeadbeefdeadbeefdeadbeef-Hero-name"` |

## Selection Mode Test Cases

### REUSE Mode

```typescript
describe('REUSE mode', () => {
  it('returns the same item for the same seed and rule name', () => {
    // Two renderings with same seed + same rule → same RenderedString.value
  });

  it('may select the same item on consecutive calls within one render', () => {
    // No depletion; replacement is allowed
  });

  it('renders items as templates (recursive)', () => {
    // Item containing "{OtherRule}" causes OtherRule to be evaluated
  });

  it('uses ScopedSeed("{base}-{ruleName}-reuse") for PRNG initialization', () => {
    // Verify scoped seed is used (spy on getRng or verify via determinism)
  });
});
```

### PICK Mode

```typescript
describe('PICK mode', () => {
  it('selects all N items before repeating any within a single render', () => {
    // After N calls with N items, all items have appeared exactly once
  });

  it('reshuffles on exhaustion using a new epoch seed', () => {
    // N+1st call starts epoch 1 with different shuffle order (high probability)
  });

  it('epoch 0 and epoch 1 produce different orders (statistical test)', () => {
    // Use a large item list; verify the two epoch orders differ
  });

  it('does not share state across different render calls', () => {
    // Two separate RenderContext instances each start from epoch 0
  });
});
```

### RATCHET Mode

```typescript
describe('RATCHET mode', () => {
  it('returns items in sequential order', () => {
    const items = ['red', 'blue', 'green'];
    // Call 0 → 'red'; call 1 → 'blue'; call 2 → 'green'; call 3 → 'red'
  });

  it('wraps around after the last item', () => {
    // Call N → item[N % items.length]
  });

  it('does NOT render items as templates', () => {
    // Item "{OtherRule}" is returned as the literal string "{OtherRule}"
  });

  it('cycles independently per rule name within the same render', () => {
    // RuleA ratchet counter does not affect RuleB ratchet counter
  });
});
```

### MARKOV Mode

```typescript
describe('MARKOV mode', () => {
  it('generates a string not necessarily in the corpus', () => {
    // Output may be a novel combination of characters from training data
  });

  it('is deterministic for the same seed and corpus', () => {
    // Same seed + same corpus + same order → same generated string
  });

  it('terminates at MARKOV_END sentinel or maxLength', () => {
    // Output length <= maxLength
  });

  it('throws MarkovDeadEndError if generation reaches a dead-end state', () => {
    // Force a dead end by constructing a minimal corpus with a gap
  });

  it('uses the per-render RenderEngine Markov model cache', () => {
    // Two calls with same rule name reuse the same MarkovChainModel instance
  });
});
```

### LIST Mode

```typescript
describe('LIST mode', () => {
  it('returns a Datalist, not a RenderedString', () => {
    // result.kind === 'datalist'
  });

  it('exposes all items by zero-based index', () => {
    // result.get(0) === items[0]; result.get(2) === items[2]
  });

  it('returns undefined for out-of-range index', () => {
    // result.get(items.length) === undefined
  });

  it('does NOT render items as templates', () => {
    // Items containing "{Rule}" are returned as literal strings
  });
});
```

## Article Generation Test Cases

```typescript
describe('getArticle', () => {
  describe('vowel-initial words', () => {
    it.each(['apple', 'elephant', 'igloo', 'orange', 'umbrella'])(
      'returns "an" for "%s"', (word) => {
        expect(getArticle(word)).toBe('an');
      },
    );
  });

  describe('consonant-initial words', () => {
    it.each(['banana', 'solar panel', 'cat', 'tree'])(
      'returns "a" for "%s"', (word) => {
        expect(getArticle(word)).toBe('a');
      },
    );
  });

  describe('special case: "you" sound', () => {
    it('returns "a" for "uni-" words', () => {
      expect(getArticle('university')).toBe('a');
      expect(getArticle('uniform')).toBe('a');
      expect(getArticle('unicorn')).toBe('a');
    });

    it('returns "a" for "use-" words', () => {
      expect(getArticle('user')).toBe('a');
      expect(getArticle('useful')).toBe('a');
    });

    it('returns "a" for "eu-" words', () => {
      expect(getArticle('European')).toBe('a');
      expect(getArticle('eulogy')).toBe('a');
    });
  });

  describe('special case: silent "h"', () => {
    it('returns "an" for "hour-" words', () => {
      expect(getArticle('hour')).toBe('an');
      expect(getArticle('hourly')).toBe('an');
    });

    it('returns "an" for "heir-" words', () => {
      expect(getArticle('heir')).toBe('an');
      expect(getArticle('heiress')).toBe('an');
    });

    it('returns "an" for "hon-" words', () => {
      expect(getArticle('honor')).toBe('an');
      expect(getArticle('honest')).toBe('an');
    });
  });

  describe('edge cases', () => {
    it('returns "a" for empty string', () => {
      expect(getArticle('')).toBe('a');
    });

    it('is case-insensitive for the general rule', () => {
      expect(getArticle('Apple')).toBe('an');
      expect(getArticle('UMBRELLA')).toBe('an');
    });

    it('is case-insensitive for special cases', () => {
      expect(getArticle('University')).toBe('a');
      expect(getArticle('HONOR')).toBe('an');
    });

    it('strips leading whitespace before checking', () => {
      expect(getArticle('  apple')).toBe('an');
    });
  });
});
```

## RenderStoryService Integration Tests

```typescript
describe('RenderStoryService', () => {
  it('renders a simple TextRule', async () => {
    // Grammar: { Begin: { kind: 'text', template: 'Hello world.' } }
    // result.ok === true; result.text === 'Hello world.'
  });

  it('resolves rule references in templates', async () => {
    // Grammar: { Begin: '{Greeting} world.', Greeting: 'Hello' }
    // result.text === 'Hello world.'
  });

  it('merges included grammars with local rules shadowing', async () => {
    // Root includes 'lib'; lib has rule 'Foo'; root also has 'Foo'
    // Root's 'Foo' is used, not lib's 'Foo'
  });

  it('defaults start rule to "Begin"', async () => {
    // No start specified; renders the "Begin" rule
  });

  it('respects explicit start rule', async () => {
    // start: "Intro" renders the "Intro" rule instead
  });

  it('returns module_not_found when module does not exist', async () => {
    // result.ok === false; result.kind === 'module_not_found'
  });

  it('returns rule_not_found when start rule does not exist', async () => {
    // result.ok === false; result.kind === 'rule_not_found'
  });

  it('returns circular_include when a circular include chain is detected', async () => {
    // Module A includes B; B includes A
    // result.ok === false; result.kind === 'circular_include'
  });

  it('is deterministic with the same seed', async () => {
    // Two calls with the same seed → same result.text
  });

  it('generates a fresh seed when none is provided', async () => {
    // result.seed is a 32-char lowercase hex string
  });

  it('injects userVars into template expressions', async () => {
    // userVars: { name: 'World' }; template: 'Hello {name}.'
    // result.text === 'Hello World.'
  });
});
```

## GrammarParser Tests

```typescript
describe('GrammarParser', () => {
  it('parses a TextRule from a YAML string value', () => {});
  it('parses a ListRule from a YAML array value with options object', () => {});
  it('parses a ListRule with default mode REUSE when no options object', () => {});
  it('parses a StructRule from a YAML mapping value', () => {});
  it('parses the include list', () => {});
  it('parses the render strategy', () => {});
  it('defaults render strategy to FTEMPLATE when not specified', () => {});
  it('throws GrammarParseError on invalid mode value', () => {});
  it('throws GrammarParseError on invalid render strategy', () => {});
  it('throws GrammarParseError on order < 1 in markov options', () => {});
  it('normalizes TextRule templates (dedent + strip)', () => {});
  it('normalizes StructRule field values (dedent + strip)', () => {});
  it('does not include "include" or "render" keys as rules', () => {});
});
```

## Markov Chain Tests

```typescript
describe('trainMarkovChain', () => {
  it('builds a non-empty transition table from a single-string corpus', () => {});
  it('includes MARKOV_START and MARKOV_END transitions', () => {});
  it('accumulates frequency counts for repeated successors', () => {});
  it('throws RangeError on empty corpus', () => {});
  it('throws RangeError on order < 1', () => {});
  it('handles single-character corpus strings', () => {});
  it('defaults to order 2', () => {});
});

describe('generateMarkov', () => {
  it('generates a non-empty string from a trained model', () => {});
  it('respects maxLength', () => {});
  it('is deterministic for the same rng seed and model', () => {});
  it('throws MarkovDeadEndError on missing transition (constructed dead end)', () => {});
  it('handles the start parameter (continues from partial string)', () => {});
  it('does not include MARKOV_START or MARKOV_END in output', () => {});
});
```

## FtemplateEngine Tests

```typescript
describe('FtemplateEngine', () => {
  describe('tokenizer', () => {
    it('produces LiteralToken for plain text', () => {});
    it('produces ExprToken for {name}', () => {});
    it('produces ExprToken with field accessor for {name.key}', () => {});
    it('produces ExprToken with index accessor for {name[0]}', () => {});
    it('produces ExprToken with article accessor for {name.a}', () => {});
    it('handles {{ as literal "{"', () => {});
    it('handles }} as literal "}"', () => {});
    it('throws TemplateError on unclosed "{"', () => {});
    it('throws TemplateError on empty expression "{}"', () => {});
  });

  describe('evaluator', () => {
    it('renders plain string unchanged', () => {});
    it('resolves {name} from grammar rules', () => {});
    it('resolves {name} from userVars (takes priority)', () => {});
    it('accesses {name.key} via Databag.get', () => {});
    it('accesses {name[0]} via Datalist.get', () => {});
    it('renders article {name.a}', () => {});
    it('renders article {name.An}', () => {});
    it('throws RuleNotFoundError for unknown name', () => {});
    it('throws TemplateError on MAX_DEPTH exceeded', () => {});
  });

  describe('caching', () => {
    it('reuses tokenized template on second call with same template string', () => {
      // Spy on tokenizer; verify it is only called once for two renders
    });
  });
});
```

## Performance Guard

The following benchmark is NOT a hard assertion but SHOULD be logged as a warning if
exceeded. Its purpose is to catch regressions in the async seed pipeline.

```typescript
it('renders a 20-rule grammar 100 times within 5 seconds', async () => {
  const start = Date.now();
  for (let i = 0; i < 100; i++) {
    await service.render({ moduleName: 'benchmark' });
  }
  const elapsed = Date.now() - start;
  if (elapsed > 5000) {
    console.warn(`Performance regression: 100 renders took ${elapsed}ms (> 5000ms)`);
  }
  // Hard assertion: not more than 30 seconds (catches catastrophic regressions only)
  expect(elapsed).toBeLessThan(30_000);
});
```

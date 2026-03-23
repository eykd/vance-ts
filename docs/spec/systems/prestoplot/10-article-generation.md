# Article Generation

## Overview

English indefinite article ("a" vs "an") generation for rendered strings. Accessible
via properties on `RenderedString` (`.a`, `.an`, `.A`, `.An`).

## Rules

The article preceding a word is determined by the **initial sound** of the word. For
the purposes of this library (procedural text generation without phonetic analysis),
the following simplified rules apply. They are applied in the order listed; the first
matching rule wins.

### Priority Rules (Applied First)

| Prefix (case-insensitive) | Article | Rationale |
|--------------------------|---------|-----------|
| `uni` | "a" | "university", "uniform" — initial "you" sound |
| `use` | "a" | "user", "useful" — initial "you" sound |
| `eu` | "a" | "European", "eulogy" — initial "you" sound |
| `hour` | "an" | "hour", "hourly" — silent "h" |
| `heir` | "an" | "heir", "heiress" — silent "h" |
| `hon` | "an" | "honor", "honest" — silent "h" |

### General Rule

After the priority rules above:

1. Strip leading whitespace from the rendered value.
2. Take the first character.
3. Lowercase it.
4. If the character is in `{a, e, i, o, u}` → article is "an".
5. Otherwise → article is "a".

### Edge Cases

- **Empty string**: returns "a" (fallback).
- **Non-ASCII first character**: treated as consonant → "a".
- **Digits or punctuation first**: treated as consonant → "a".

## TypeScript Implementation

```typescript
/**
 * Determines the appropriate indefinite article for an English word.
 *
 * Applies simplified phonetic rules covering the most common cases
 * encountered in procedural game text generation.
 *
 * Priority special cases are checked before the general vowel rule.
 *
 * @param word - The word to determine the article for (leading whitespace stripped).
 * @returns 'a' or 'an'.
 */
export function getArticle(word: string): 'a' | 'an';

/**
 * Creates a RenderedString with all article accessors populated.
 *
 * @param value - The rendered string content.
 * @returns RenderedString with .a, .an, .A, .An populated.
 */
export function makeRenderedString(value: string): RenderedString;
```

## RenderedString Properties

| Property | Format | Example (value = "apple") | Example (value = "user") |
|----------|--------|--------------------------|--------------------------|
| `.value` | raw string | `"apple"` | `"user"` |
| `.a` | article only, lowercase | `"an"` | `"a"` |
| `.A` | article only, uppercase | `"An"` | `"A"` |
| `.an` | `"{article} {value}"` | `"an apple"` | `"a user"` |
| `.An` | `"{Article} {value}"` | `"An apple"` | `"A user"` |

Note: `.a` and `.an` are aliases for the same article form (lowercase). `.A` and `.An`
are aliases for the uppercase form. (The Python spec defines `.a == .an` and `.A == .An`;
this spec uses the same aliasing convention but distinguishes "article only" vs "article
+ value" for clarity.)

## Usage in Templates

```yaml
Begin: "She found {Treasure.An} in the hold."

Treasure:
  - {mode: pick}
  - apple
  - orange
  - unit of fuel
  - honor medallion
  - European coin
```

Outputs:
- "She found an apple in the hold."
- "She found an orange in the hold."
- "She found a unit of fuel in the hold."
- "She found an honor medallion in the hold."
- "She found a European coin in the hold."

## Deviation from Python

The Python implementation uses a simpler vowel-only check without the special cases
for "uni-", "use-", "eu-", "hour-", "heir-", "hon-". This TypeScript specification
adds these special cases to produce more natural game text. The additional rules were
designed from standard English grammar guidance; implementors should not add further
special cases without updating this specification.

The vowel set `{a, e, i, o, u}` is identical to the Python implementation (ASCII only,
case-insensitive). The behavior for non-ASCII, digit, and punctuation first characters
is also identical: treated as consonant → "a".

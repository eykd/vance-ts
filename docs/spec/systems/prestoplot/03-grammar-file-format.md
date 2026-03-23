# Grammar File Format

## Overview

Grammars are authored as YAML and stored in the Workers storage backend. YAML is parsed
at load time into the `Grammar` domain type. The `StoragePort` implementations are
responsible for parsing; the domain layer never touches raw YAML.

## Top-Level Structure

```yaml
# Optional: list of module names to include
include:
  - module-name
  - other-module

# Optional: template engine. Default: ftemplate
render: ftemplate   # or: jinja2

# Rule definitions follow (all top-level keys not named 'include' or 'render')
RuleName: "template string"

SomeList:
  - {mode: pick}    # First item with 'mode' key = options object (consumed by parser)
  - item1
  - item2

SomeStruct:
  key1: value1
  key2: value2
```

## Rule Type Detection

The parser infers rule type from the YAML value type:

| YAML value type | Detected rule type | Notes |
|-----------------|--------------------|-------|
| `string` | `TextRule` | Direct template string |
| `sequence` (array) | `ListRule` | First item MAY be options object |
| `mapping` (object) | `StructRule` | All values must be strings |

## Options Object for ListRule

The first element of a sequence rule is an **options object** if it is a YAML mapping
with a `mode` key. The options object is consumed by the parser and does NOT appear
in `ListRule.items`.

```yaml
MyList:
  - {mode: pick}    # Options object: sets mode to PICK
  - apple
  - banana
  - cherry
```

Valid `mode` values (case-insensitive): `reuse`, `pick`, `ratchet`, `markov`, `list`.

If the first item is not a mapping with a `mode` key, it is treated as a regular list
item and the mode defaults to `REUSE`.

### MARKOV Mode Options

The options object for `markov` mode also accepts an `order` key:

```yaml
Names:
  - {mode: markov, order: 3}
  - Aldebaran
  - Procyon
  - Rigel
  - Betelgeuse
```

`order` is an integer >= 1. Default: 2. See 07-markov-chain.md.

## Reserved Top-Level Keys

| Key | Purpose |
|-----|---------|
| `include` | Module include list (sequence of strings) |
| `render` | Render strategy: `ftemplate` or `jinja2` |

All other top-level keys are rule names. Rule names are case-sensitive. The names
`include` and `render` MUST NOT be used as rule names.

## Text Normalization

TextRule template strings and StructRule field values are normalized at parse time:

1. **Dedent**: remove the longest common leading whitespace from all lines.
2. **Strip**: remove leading and trailing whitespace from the result.

This allows multi-line YAML strings to be indented naturally:

```yaml
Begin: |
  The traveler stood at the gate.
  She wore {Color} boots.
```

After normalization: `"The traveler stood at the gate.\nShe wore {Color} boots."`

## Storage Format (JSON)

KV and D1 storage backends store grammars as serialized JSON (`GrammarDto`), not raw
YAML. The `GrammarParser` application service parses YAML → `Grammar`; the storage
adapters serialize to/from `GrammarDto` JSON.

```typescript
/**
 * Data Transfer Object for serialized grammar storage.
 *
 * YAML is parsed to Grammar by GrammarParser (application layer).
 * Storage adapters convert Grammar ↔ GrammarDto for persistence.
 */
export interface GrammarDto {
  readonly renderStrategy: 'ftemplate' | 'jinja2';
  readonly includes: readonly string[];
  readonly rules: Readonly<Record<string, RuleDto>>;
}

/** Serialized TextRule. */
export interface TextRuleDto {
  readonly kind: 'text';
  readonly template: string;
}

/** Serialized ListRule. */
export interface ListRuleDto {
  readonly kind: 'list';
  readonly mode: string;   // Validated to SelectionMode on deserialization
  readonly order?: number;
  readonly items: readonly string[];
}

/** Serialized StructRule. */
export interface StructRuleDto {
  readonly kind: 'struct';
  readonly fields: Readonly<Record<string, string>>;
}

/** Discriminated union for serialized rules. */
export type RuleDto = TextRuleDto | ListRuleDto | StructRuleDto;
```

## YAML Parsing Responsibility

- The YAML parser lives in the application layer: `GrammarParser.parse(yaml: string, moduleName: string): Grammar`.
- It MUST validate all `mode` values against `SelectionMode` and throw `GrammarParseError`
  on unrecognized values.
- It MUST validate `order` as an integer >= 1 when present.
- It MUST NOT be imported by the domain layer.
- `js-yaml` 4.x is the recommended parser — CF-compatible (no Node.js dependency in
  its browser bundle).
- Grammars stored in KV/D1 are stored as pre-parsed `GrammarDto` JSON. The storage
  adapter converts `GrammarDto` → `Grammar` on `resolveModule`.

## Full Example

```yaml
include:
  - vocabulary

render: ftemplate

Begin: "{Hero} traveled to {Destination}."

Hero:
  - {mode: pick}
  - a bold navigator
  - a cautious merchant
  - an exiled noble

Destination:
  - {mode: reuse}
  - the outer rim
  - the spinward frontier
  - a forgotten world

HeroNames:
  - {mode: markov, order: 2}
  - Aldric
  - Beren
  - Calidwen
  - Davan

Stats:
  speed: fast
  range: long
```

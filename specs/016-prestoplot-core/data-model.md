# Data Model: Prestoplot Core

**Branch**: `016-prestoplot-core` | **Date**: 2026-03-24

## Entity Relationship Overview

```
Grammar (aggregate root)
├── has many → Rule (TextRule | ListRule | StructRule)
│   ├── TextRule has → WeightedAlternative[]
│   ├── ListRule has → items[], SelectionMode
│   └── StructRule has → fields{}, template
├── has → includes[] (grammar keys for transitive includes)
└── identified by → key (string)

Seed (value object)
└── derives → ScopedSeed (baseSeed + scopeKey)

RenderedString (value object)
├── wraps → text (string)
└── tracks → source rule name, seed used

RenderContext (runtime, not persisted)
├── holds → Grammar (resolved, with includes merged)
├── holds → Seed (base)
├── holds → seedIntCache (Map<string, number>)
├── holds → selectionState (Map<string, SelectionState>)
├── holds → markovCache (Map<string, MarkovChainModel>)
├── tracks → recursionDepth (number)
└── tracks → evaluationCount (number, capped at MAX_EVALUATIONS = 10,000)
```

## Domain Entities

### Grammar (Aggregate Root)

| Field    | Type                      | Constraints                                     |
| -------- | ------------------------- | ----------------------------------------------- |
| key      | string                    | Unique identifier, non-empty                    |
| rules    | ReadonlyMap<string, Rule> | At least one rule required                      |
| includes | readonly string[]         | Grammar keys to include (resolved transitively) |
| entry    | string                    | Default rule name to render                     |

### Rule (Union Type)

**TextRule**:

| Field        | Type                           | Constraints              |
| ------------ | ------------------------------ | ------------------------ |
| name         | string                         | Unique within grammar    |
| type         | "text"                         | Discriminant             |
| alternatives | readonly WeightedAlternative[] | At least one alternative |
| strategy     | RenderStrategy                 | TEMPLATE or PLAIN        |

**ListRule**:

| Field         | Type              | Constraints                        |
| ------------- | ----------------- | ---------------------------------- |
| name          | string            | Unique within grammar              |
| type          | "list"            | Discriminant                       |
| items         | readonly string[] | At least one item                  |
| selectionMode | SelectionMode     | REUSE, PICK, RATCHET, MARKOV, LIST |
| strategy      | RenderStrategy    | TEMPLATE or PLAIN                  |

**StructRule**:

| Field    | Type                        | Constraints                       |
| -------- | --------------------------- | --------------------------------- |
| name     | string                      | Unique within grammar             |
| type     | "struct"                    | Discriminant                      |
| fields   | ReadonlyMap<string, string> | Field name → rule name/value      |
| template | string                      | Template string with {field} refs |

### WeightedAlternative

| Field  | Type   | Constraints                   |
| ------ | ------ | ----------------------------- |
| text   | string | Template string or plain text |
| weight | number | Positive number, default 1    |

### Seed (Value Object)

| Field | Type   | Constraints                                                         |
| ----- | ------ | ------------------------------------------------------------------- |
| value | string | Branded type, non-empty required (empty rejected with invalid_seed) |

### ScopedSeed (Value Object)

| Field    | Type   | Constraints                     |
| -------- | ------ | ------------------------------- |
| baseSeed | string | Original seed value             |
| scopeKey | string | Scope identifier                |
| combined | string | Format: "{baseSeed}-{scopeKey}" |

### RenderedString (Value Object)

| Field    | Type   | Constraints         |
| -------- | ------ | ------------------- |
| text     | string | The rendered output |
| ruleName | string | Source rule name    |

## Enumerations

### SelectionMode

| Member  | Description                                          |
| ------- | ---------------------------------------------------- |
| REUSE   | With replacement — items may repeat                  |
| PICK    | Without replacement — Fisher-Yates shuffle per epoch |
| RATCHET | Sequential cycling — 0, 1, 2, ..., 0, 1, 2, ...      |
| MARKOV  | Character-level Markov chain generation              |
| LIST    | Index access only — returns item at given index      |

### RenderStrategy

| Member   | Description                             |
| -------- | --------------------------------------- |
| TEMPLATE | Text contains expressions to evaluate   |
| PLAIN    | Text is literal, no template processing |

## Storage Schema (GrammarDto)

Serialized as JSON in KV/D1:

```json
{
  "version": 1,
  "key": "system-descriptions",
  "entry": "main",
  "includes": ["shared-names", "shared-adjectives"],
  "rules": {
    "main": {
      "type": "text",
      "alternatives": [{ "text": "A {adjective} {noun}.", "weight": 1 }],
      "strategy": "template"
    }
  }
}
```

`version` is required (forward-compatibility). Only `1` is accepted in Phase 1; unrecognized versions throw `StorageError`.

### D1 Schema (if needed)

```sql
CREATE TABLE IF NOT EXISTS grammars (
  key TEXT PRIMARY KEY,
  data TEXT NOT NULL,       -- JSON-serialized GrammarDto
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

## State Transitions

### RenderEngine Lifecycle (per request)

```
INIT → LOADING → RESOLVING_INCLUDES → RENDERING → COMPLETE
  │                    │                    │
  └── error ───────────┴── error ───────────┴── FAILED
```

- **INIT**: RenderEngine created with grammar key and seed
- **LOADING**: Grammar loaded from storage
- **RESOLVING_INCLUDES**: Transitive includes merged (circular detection here)
- **RENDERING**: Rules evaluated, templates expanded, selections made
- **COMPLETE**: RenderedString returned
- **FAILED**: Error returned (ModuleNotFoundError, CircularIncludeError, etc.)

### PICK Mode Epoch Lifecycle

```
FRESH → SHUFFLED → DEPLETING → EXHAUSTED → RESHUFFLED (new epoch)
```

- Items shuffled via Fisher-Yates using scoped seed
- Each pick removes from available pool
- When pool empty, new epoch begins with fresh shuffle (new seed = baseSeed + epochCounter)

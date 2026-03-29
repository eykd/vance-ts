# Feature Specification: Prestoplot Core

**Feature Branch**: `016-prestoplot-core`
**Created**: 2026-03-24
**Status**: Red-teamed
**Beads Epic**: `turtlebased-s9rk`
**Beads Phase Tasks**:

- clarify: `turtlebased-s9rk.1`
- plan: `turtlebased-s9rk.2`
- red-team: `turtlebased-s9rk.3`
- tasks: `turtlebased-s9rk.4`
- analyze: `turtlebased-s9rk.5`
- implement: `turtlebased-s9rk.6`
- security-review: `turtlebased-s9rk.7`
- architecture-review: `turtlebased-s9rk.8`
- code-quality-review: `turtlebased-s9rk.9`

**Input**: User description: "Let's prepare Phase 1: Prestoplot Core."

## User Scenarios & Testing

### User Story 1 - Render a Grammar from Seed (Priority: P1)

A content author writes a YAML grammar file defining text rules with weighted alternatives. The system parses the grammar and renders it using a deterministic seed, producing the same output every time for the same seed.

**Why this priority**: This is the core capability — without grammar rendering, nothing else in Prestoplot works. It enables system descriptions, crew chatter, and all procedurally generated narrative text.

**Independent Test**: Can be fully tested by loading a grammar YAML file and rendering it with a fixed seed, verifying deterministic output matches expected text.

**Acceptance Scenarios**:

1. **Given** a valid YAML grammar with text rules, **When** rendered with seed "alpha", **Then** the output is a specific deterministic string that never changes for that seed.
2. **Given** the same grammar rendered with seed "beta", **When** compared to seed "alpha", **Then** the outputs differ.
3. **Given** a grammar with nested rule references (e.g., `{{ animal }}` inside a `{{ creature }}` rule), **When** rendered, **Then** nested references are fully resolved to plain text.
4. **Given** a grammar with template expressions (e.g., `{{ name }}` inside rendered text), **When** rendered, **Then** template expressions are evaluated and replaced.

---

### User Story 2 - Selection Modes for Variety (Priority: P1)

A content author uses different selection modes (REUSE, PICK, RATCHET, LIST, MARKOV) to control how alternatives are chosen from lists, producing varied but controlled text output.

**Why this priority**: Selection modes are fundamental to text variety. Without them, grammars can only pick randomly with replacement, producing repetitive output.

**Independent Test**: Can be tested by rendering a grammar with each selection mode multiple times and verifying the selection behavior matches the mode's contract.

**Acceptance Scenarios**:

1. **Given** a rule with REUSE mode, **When** rendered multiple times from the same seed, **Then** items are selected with replacement (repeats allowed).
2. **Given** a rule with PICK mode, **When** rendered N times (where N equals the item count), **Then** each item appears exactly once before any repeats (Fisher-Yates shuffle per epoch).
3. **Given** a rule with RATCHET mode, **When** rendered sequentially, **Then** items cycle in order (0, 1, 2, ..., 0, 1, 2, ...).
4. **Given** a rule with LIST mode and an index, **When** rendered, **Then** the specific item at that index is returned.
5. **Given** a rule with MARKOV mode and training data, **When** rendered, **Then** a novel string is generated using character-level Markov chain probabilities.

---

### User Story 3 - Scoped Deterministic Randomness (Priority: P1)

The system produces deterministic output from a seed value, so that the same galaxy location always generates the same description. Sub-decisions within a render use scoped seeds derived from the base seed, ensuring each random choice is independently reproducible.

**Why this priority**: Determinism is essential for a game where system descriptions must be consistent across visits. Scoped seeds prevent one rule's expansion from affecting another's output.

**Independent Test**: Can be tested by rendering with a fixed seed, changing one rule's content, and verifying that unrelated rules produce the same output as before.

**Acceptance Scenarios**:

1. **Given** a seed string "sol-42", **When** converted to an integer via SHA-256 hashing, **Then** the result is deterministic and consistent across renders.
2. **Given** a base seed and two different scope keys, **When** scoped seeds are derived, **Then** each produces a different but deterministic PRNG sequence.
3. **Given** a grammar rendered with seed "sol-42", **When** a new unrelated rule is added to the grammar, **Then** existing rules produce the same output as before.

---

### User Story 4 - Grammar File Parsing (Priority: P2)

A content author writes grammar files in YAML format following a defined schema. The system parses these files into internal grammar objects, detecting and reporting errors for invalid grammars.

**Why this priority**: Content authoring depends on a clear, validated grammar format. Errors caught at parse time save debugging during rendering.

**Independent Test**: Can be tested by parsing valid and invalid YAML grammar files and verifying correct grammar objects or clear error messages.

**Acceptance Scenarios**:

1. **Given** a valid YAML grammar file with text, list, and struct rules, **When** parsed, **Then** a Grammar object is produced with all rules correctly typed.
2. **Given** a YAML file with an unknown rule type, **When** parsed, **Then** a clear error message identifies the invalid rule.
3. **Given** a YAML file referencing a non-existent rule, **When** parsed, **Then** a validation error reports the missing reference.
4. **Given** a YAML file with circular includes, **When** parsed, **Then** a circular dependency error is raised (not an infinite loop).

---

### User Story 5 - Template Expression Evaluation (Priority: P2)

Rendered text can contain template expressions that reference other rules or context values. The system evaluates these expressions using `{{ expression }}` syntax (jinja2 subset).

**Why this priority**: Templates connect rules together and allow dynamic text composition. Without templates, each rule is isolated.

**Independent Test**: Can be tested by rendering text with template expressions and verifying correct substitution from rule outputs and context values.

**Acceptance Scenarios**:

1. **Given** text containing `{{ animal }}` and a rule named "animal", **When** rendered, **Then** `{{ animal }}` is replaced with the rendered output of the "animal" rule.
2. **Given** text containing `{{ planet.name }}` and a struct rule "planet" with a "name" field, **When** rendered, **Then** the expression is replaced with the planet's name value.
3. **Given** text containing a reference to a non-existent rule, **When** rendered, **Then** a clear error identifies the missing reference.

---

### User Story 6 - Indefinite Article Generation (Priority: P3)

The system automatically generates correct English indefinite articles ("a" or "an") for rendered text, handling special cases like words starting with silent-h, "uni-" prefix, and other English pronunciation exceptions.

**Why this priority**: Natural-sounding generated text requires correct articles. Without this, text reads as robotic.

**Independent Test**: Can be tested by generating articles for a list of test words and verifying correct "a" or "an" output for each.

**Acceptance Scenarios**:

1. **Given** the word "apple", **When** an article is generated, **Then** the result is "an apple".
2. **Given** the word "university", **When** an article is generated, **Then** the result is "a university" (sounds like "yoo-").
3. **Given** the word "hour", **When** an article is generated, **Then** the result is "an hour" (silent h).
4. **Given** the word "European", **When** an article is generated, **Then** the result is "a European" (sounds like "yoo-").

---

### User Story 7 - Grammar Storage and Retrieval (Priority: P2)

Grammars are stored in and retrieved from Cloudflare KV, D1, or in-memory storage via a common storage port interface. This enables content to be loaded at runtime without filesystem access.

**Why this priority**: The Workers runtime has no filesystem. Grammars must be loadable from KV/D1 for production use. In-memory storage enables fast unit tests.

**Independent Test**: Can be tested by storing a grammar, retrieving it, and verifying the round-trip produces an identical grammar object.

**Acceptance Scenarios**:

1. **Given** a parsed grammar, **When** stored in KV and retrieved, **Then** the retrieved grammar is identical to the original.
2. **Given** a grammar key that does not exist, **When** retrieved, **Then** a "grammar not found" error is returned.
3. **Given** multiple grammars stored, **When** listing available grammars, **Then** all stored grammar keys are returned.

---

### User Story 8 - Grammar Includes (Priority: P3)

A grammar file can include rules from other grammar files, enabling content reuse and modular grammar composition. Circular includes are detected and rejected.

**Why this priority**: Modular grammars prevent duplication and allow shared vocabulary (e.g., a "names" grammar included by multiple content grammars).

**Independent Test**: Can be tested by creating two grammars where one includes the other, rendering, and verifying cross-grammar rule resolution works.

**Acceptance Scenarios**:

1. **Given** grammar A that includes grammar B, **When** grammar A is rendered, **Then** rules from grammar B are available for reference.
2. **Given** grammar A includes B and B includes A, **When** parsing, **Then** a circular include error is raised.
3. **Given** grammar A includes B which includes C, **When** rendered, **Then** rules from all three grammars are available (transitive includes).

---

### Edge Cases

- What happens when a grammar has zero rules? → Error: grammar must contain at least one rule.
- What happens when a PICK mode rule has been fully exhausted and requests continue? → A new epoch begins (reshuffled).
- What happens when a MARKOV chain has insufficient training data? → Rejected at parse time with a clear error if corpus is empty; dead-end states during generation raise an error.
- What happens when template recursion is too deep? → Recursion depth limit prevents stack overflow; error raised at limit.
- What happens when seed string is empty? → Rejected as `invalid_seed` error (empty seed has a publicly known hash, making output predictable).
- What happens when a grammar includes itself? → Detected as circular include; error raised.

## Requirements

### Functional Requirements

- **FR-001**: System MUST parse YAML grammar files into internal grammar objects with text, list, and struct rule types.
- **FR-002**: System MUST render a grammar from a given seed, producing deterministic text output — same seed always yields same output.
- **FR-003**: System MUST support five selection modes: REUSE (with replacement), PICK (without replacement, Fisher-Yates), RATCHET (sequential cycling), LIST (index access), and MARKOV (character-level chain generation).
- **FR-004**: System MUST derive sub-random sequences from scoped seeds using SHA-256 hashing, so that each rule's random choices are independently reproducible.
- **FR-005**: System MUST evaluate template expressions in rendered text using `{{ expression }}` syntax (jinja2 subset).
- **FR-006**: System MUST generate correct English indefinite articles ("a"/"an") with special-case handling for silent-h, "uni-" prefix, "eu-" prefix, and similar pronunciation exceptions.
- **FR-007**: System MUST store and retrieve grammars from Cloudflare KV, D1, or in-memory storage via a common storage port interface.
- **FR-008**: System MUST support grammar includes (one grammar referencing rules from another) with circular include detection.
- **FR-009**: System MUST use the Mulberry32 PRNG (reusing existing `src/domain/galaxy/prng.ts`) for all random number generation.
- **FR-010**: System MUST validate grammar files at parse time, reporting clear errors for invalid structure, missing references, and circular dependencies.
- **FR-011**: System MUST enforce a recursion depth limit for template evaluation to prevent stack overflow.
- **FR-012**: System MUST use `crypto.subtle` for SHA-256 seed hashing (Web Standard API, not Node.js crypto).

### Key Entities

- **Grammar**: The aggregate root — a named collection of rules that together produce rendered text. Identified by a unique key. Contains an `entry` rule name (default rule to render) and an optional `includes` list of other grammar keys.
- **Rule**: A named text generation rule within a grammar. Comes in three types: TextRule (weighted alternatives), ListRule (ordered items with a selection mode), StructRule (key-value fields rendered as a template).
- **Seed**: A value object wrapping a string that determines all random choices during rendering. Converted to an integer via SHA-256 hashing.
- **ScopedSeed**: A derived seed combining a base seed with a scope key, producing an independent PRNG stream for each rule evaluation.
- **SelectionMode**: An enumeration (REUSE, PICK, RATCHET, MARKOV, LIST) controlling how alternatives are chosen from a list.
- **RenderedString**: A wrapper around generated text that preserves rendering metadata (which rule produced it).
- **RenderContext**: The runtime state during a render pass, holding the current seed, resolved rules, template engine, and recursion depth counter.
- **GrammarDto**: The serialization format for storing/retrieving grammars from KV or D1.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Given any seed string, rendering the same grammar produces identical output 100% of the time (determinism guarantee).
- **SC-002**: Content authors can write a new grammar YAML file and see rendered output without modifying any application code.
- **SC-003**: All five selection modes produce output matching their documented behavioral contracts when tested with known seeds.
- **SC-004**: Grammar parse errors provide actionable messages that identify the specific rule name causing the issue.
- **SC-005**: Indefinite article generation is correct for all documented English special cases (at least 20 test words covering edge cases).
- **SC-006**: Grammar includes resolve transitively (A includes B includes C) and circular includes are detected and reported as an error before rendering begins.
- **SC-007**: Template expressions are fully resolved — no unresolved `{...}` or `{{ ... }}` markers appear in final rendered output.
- **SC-008**: Grammar storage round-trips (store → retrieve → render) produce identical output to rendering from the original parsed grammar.

## Assumptions

- Grammar YAML schema follows the format defined in `docs/spec/systems/prestoplot/03-grammar-file-format.md`.
- The existing Mulberry32 PRNG in `src/domain/galaxy/prng.ts` is suitable for all Prestoplot random number needs.
- SHA-256 hashing via `crypto.subtle` is available in the Cloudflare Workers runtime (confirmed by platform documentation).
- Content grammars will be authored by the development team (not end users), so parse error messages can be developer-oriented.
- The jinja2 template engine subset does not include control flow (if/for) or filters — only expression evaluation and dot-access.
- KV storage is the primary production storage adapter; D1 and in-memory are for flexibility and testing.

## Scope Boundaries

**In scope:**

- Grammar parsing (YAML → Grammar objects)
- Deterministic rendering with seed-based PRNG
- Five selection modes (REUSE, PICK, RATCHET, MARKOV, LIST)
- Template expression evaluation (jinja2 subset)
- Indefinite article generation
- Storage adapters (InMemory, KV, D1, Cached)
- Grammar includes with circular detection
- Comprehensive test coverage

**Out of scope:**

- Grammar authoring UI or editor
- Content files (grammars for system descriptions, crew chatter, etc. — authored in Phase 4+)
- Integration with the game turn loop (Phase 4)
- Runtime grammar hot-reloading
- Grammar versioning or migration
- Localization/i18n (English only)

## Interview

### Open Questions

(No open questions — the existing Prestoplot specification documents in `docs/spec/systems/prestoplot/` provide comprehensive detail for all aspects of this feature.)

### Answer Log

_No questions were needed — the roadmap and 11 detailed spec documents provided sufficient context._

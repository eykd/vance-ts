# Ravel Language Specification

**Version**: 0.2 (Draft)
**Status**: Working specification derived from implementation analysis + research integration

---

## 1. Introduction

Ravel is a YAML-based domain-specific language for authoring **Quality-Based Narratives (QBN)**—an interactive fiction paradigm pioneered by Failbetter Games (Fallen London, Sunless Sea). The language draws inspiration from Inkle's Ink language while targeting the storylet/quality model rather than linear branching narratives.

### 1.1 Design Goals

From the project README:

- Provide a flexible engine for authoring, testing, and running QBNs
- Provide a simple, text-based authoring format that is easy to work with, yet doesn't require special tools
- Export QBNs to a portable format that can be read from any environment
- Provide a simple reference implementation of a VM that can perform a Ravel-based QBN

**Language Design Principles:**

- **Declarative authoring**: Stories are defined as collections of situations with predicate-based activation
- **Quality-driven flow**: Story progression is controlled by testing and modifying qualities (variables)
- **Modular composition**: Stories can be split across multiple files with include directives
- **Human-readable**: YAML syntax allows non-programmers to author content
- **Extensible concepts**: Support for custom narrative concepts beyond built-in Situations
- **Typed qualities**: Qualities are explicitly declared with type metadata, enforcing distinct behaviors for different narrative roles

### 1.2 Core Paradigm

Unlike traditional branching narratives with explicit goto/jump statements, Ravel uses a **predicate-matching** model:

1. The runtime maintains a set of **qualities** (declared, typed variables)
2. **Situations** (storylets) define predicates that must be satisfied for activation
3. Each turn, **compels** are evaluated first, then all matching situations are presented as available choices
4. Player selection triggers situation display and quality modifications
5. Modified qualities change which situations match on subsequent turns
6. **Interjections** inject content into active situations when quality conditions are met

---

## 2. File Format

### 2.1 File Extension and Encoding

- Extension: `.ravel`
- Encoding: UTF-8
- Format: YAML/SYML (YAML with multiline string improvements)

### 2.2 Rulebook Structure

A Ravel file (rulebook) consists of two sections:

1. **Preamble**: Optional metadata and configuration directives
2. **Rules**: Named situation definitions

```yaml
# ========== PREAMBLE ==========
include:
  - other_rulebook
  - another_rulebook

qualities:
  Fuel:
    type: resource
    min: 0
    max: 100
    initial: 50

given:
  - "Another Quality" = 5

when:
  - GlobalCondition >= 1

about:
  author: "Author Name"
  version: "1.0"

# ========== RULES ==========
rule-name:
  - Situation                    # Concept declaration
  - when:                        # Rule-specific predicates
    - Quality > threshold
  - Intro text here              # Directives begin
  - More content...
```

### 2.3 Entry Point

By convention, the entry rulebook is named `begin.ravel`. The runtime loads this file first, following any `include` directives to build the complete rulebook.

---

## 3. Preamble Directives

### 3.1 `include`

Imports other rulebook files into the current rulebook. Included files are merged, with rules from later includes taking precedence for same-named locations.

```yaml
include:
  - foyer # Loads foyer.ravel
  - cloakroom # Loads cloakroom.ravel
  - bar-dark
  - bar-light
```

- File extension (`.ravel`) is implied
- Include order matters for rule ordering
- Circular includes are not permitted

### 3.2 `qualities`

Declares qualities with type metadata. All qualities used in a rulebook should be declared in a `qualities:` block before use. Undeclared quality references produce a compiler warning (configurable to error via strict mode).

```yaml
qualities:
  Fuel:
    type: resource
    min: 0
    max: 100
    initial: 50

  Hunger:
    type: meter
    decay: +1 per watch
    min: 0
    max: 10
    initial: 0

  'Notorious Smuggler':
    type: identity
    initial: 1

  'Merchant Guild Standing':
    type: reputation
    min: 0
    max: 10
    tiers:
      novice: 1-3
      member: 4-6
      elder: 7-9
      master: 10

  'Ship Damage':
    type: consequence
    decay: -1 per session
    min: 0

  'Scouted Route':
    type: situation
    expires: on-location-change
    max-stack: 3

  'Lucky Break':
    type: momentum
    expires: on-use
```

#### 3.2.1 Quality Types

Seven quality types define distinct narrative roles and runtime behaviors:

| Type          | Lifespan            | Behavior                                               | Examples                                      |
| ------------- | ------------------- | ------------------------------------------------------ | --------------------------------------------- |
| `identity`    | Permanent           | Defines who/what something is; rarely changes          | Captain traits, ship class, faction alignment |
| `resource`    | Scarce, tradeable   | Consumed and replenished; drives economic pressure     | Fuel, food, currency, cargo                   |
| `meter`       | Continuous, ticking | Rises/falls over time via `decay`; creates pressure    | Hunger, loneliness, boredom, filth            |
| `reputation`  | Slow-moving         | Changes through observed actions; gates social access  | Faction standing, notoriety, trust            |
| `consequence` | Multi-session decay | Imposed by events; heals over time via `decay`         | Ship damage, crew injury, legal trouble       |
| `situation`   | Scene-duration      | Created by circumstances; expires when context changes | "Scouted the route", "storm warning"          |
| `momentum`    | One-shot            | Gained and spent in a single interaction               | Prep bonuses, lucky breaks                    |

If `type` is omitted, the quality defaults to `generic` for backward compatibility. Generic qualities have no special lifecycle behavior.

Source: FATE aspect lifespan taxonomy + Kennedy's critique of undifferentiated qualities.

#### 3.2.2 Quality Properties

| Property    | Applies To              | Description                                                              |
| ----------- | ----------------------- | ------------------------------------------------------------------------ |
| `type`      | All                     | Quality type (see above). Default: `generic`                             |
| `min`       | All                     | Minimum allowed value. Operations are clamped.                           |
| `max`       | All                     | Maximum allowed value. Operations are clamped.                           |
| `initial`   | All                     | Value at story start. Default: `0`                                       |
| `decay`     | `meter`, `consequence`  | Automatic change per time unit (e.g., `+1 per watch`, `-1 per session`)  |
| `expires`   | `situation`, `momentum` | Expiry trigger (e.g., `on-location-change`, `on-use`, `after 3 watches`) |
| `max-stack` | `situation`             | Maximum simultaneous instances. Default: `1`                             |
| `tiers`     | `reputation`, any       | Named value ranges for tiered potency (see §3.3)                         |

#### 3.2.3 Declaration Merging

Multiple rulebooks can contribute `qualities:` declarations. If the same quality is declared in multiple files, declarations are merged (later properties override earlier ones for the same quality). Conflicting `type` declarations produce a compiler error.

### 3.3 Tiered Quality Potency

Qualities with `tiers:` define named value ranges that produce different narrative effects at different thresholds. This prevents the "all qualities feel the same" anti-pattern.

```yaml
qualities:
  'Merchant Guild Standing':
    type: reputation
    min: 0
    max: 10
    tiers:
      novice: 1-3
      member: 4-6
      elder: 7-9
      master: 10
```

Tier ranges are inclusive. A single value (e.g., `10`) denotes a range of exactly that value. Ranges must not overlap and must cover contiguous values within `min`..`max`. Values outside all tier ranges (including `0`) have no tier.

Tiers are used in predicates (§6.4) and conditional text (§9.1).

### 3.4 `given`

Initializes qualities at story start. Each entry is an operation that sets an initial value.

```yaml
given:
  - Location = "Intro"
  - "Wearing Cloak" = 1
  - Health = 100
  - Visited = 0
```

- `given:` is sugar for setting the `initial` property on declared qualities
- If a quality appears in `given:` but not in `qualities:`, the compiler warns (the quality is implicitly declared as `generic`)
- Multiple rulebooks can contribute `given` values (later values override)
- String values must be quoted

**Backward compatibility:** Existing rulebooks that use `given:` without a `qualities:` block remain valid. All such qualities are treated as `generic` type with a compiler warning recommending explicit declaration.

### 3.5 `when`

Defines predicates that apply to ALL rules in this file. File-level `when` conditions are combined with rule-level conditions using AND logic.

```yaml
when:
  - Location = "Cloakroom"
  - "Game Started" >= 1
```

This is useful for grouping related situations in a file—e.g., all cloakroom situations share `Location = "Cloakroom"`.

### 3.6 `about`

Metadata key-value pairs. Not used by the runtime but available for tooling and documentation.

```yaml
about:
  author: 'Interactive Fiction Author'
  title: 'Cloak of Darkness'
  version: '1.0'
  ifid: 'UUID-HERE'
```

---

## 4. Quality System

Qualities are the core state mechanism in Ravel. They are declared, typed variables that store numeric or string values.

### 4.1 Quality Names

Three naming formats are supported:

| Format    | Syntax               | Example                             |
| --------- | -------------------- | ----------------------------------- |
| Simple    | `Name`               | `Location`, `Health`, `Score`       |
| Quoted    | `"Name With Spaces"` | `"Wearing Cloak"`, `"Man of Honor"` |
| Bracketed | `[Name With Spaces]` | `[Wearing Cloak]`, `[Score]`        |

**Rules:**

- Simple names cannot contain whitespace
- Quoted names use double quotes
- Bracketed names use square brackets
- Names are case-sensitive
- Reserved words cannot be used as simple quality names (see Appendix A)

### 4.2 Quality Values

Qualities can hold:

| Type    | Examples                        |
| ------- | ------------------------------- |
| Integer | `0`, `1`, `42`, `-5`            |
| Float   | `3.14`, `0.5`, `-2.7`           |
| String  | `"Intro"`, `"Foyer"`, `'hello'` |

**String Quoting Styles:**

Six quoting styles are supported for string literals:

| Style           | Example         |
| --------------- | --------------- |
| Double quotes   | `"hello"`       |
| Single quotes   | `'hello'`       |
| Backticks       | `` `hello` ``   |
| Triple double   | `"""hello"""`   |
| Triple single   | `'''hello'''`   |
| Triple backtick | ` ```hello``` ` |

**Note:** When a quality is tested but has never been set, it defaults to `0`.

### 4.3 The `value` Keyword

In expressions, the special keyword `value` refers to the quality's current value:

```yaml
effect:
  - Score += value * 2 # Double the current Score
  - Health -= value / 10 # Reduce Health by 10% of itself
```

### 4.4 Quality Lifecycle

Qualities with lifecycle properties (`decay`, `expires`, `max-stack`) are managed automatically by the runtime:

- **Decay**: At the end of each time unit specified in `decay`, the quality's value is adjusted by the decay amount. Decay respects `min`/`max` bounds. Decay emits a `QualityDecayed` event.
- **Expiry**: When the trigger condition in `expires` is met, the quality is reset to `0` and a `QualityExpired` event is emitted.
- **Max-stack**: For `situation` qualities, the value cannot exceed `max-stack`. Attempts to increment beyond this are silently clamped.

See §11.1 for where lifecycle ticks occur in the turn structure.

---

## 5. Expressions

### 5.1 Arithmetic Expressions

Expressions support standard arithmetic with proper precedence:

| Operator | Meaning        | Precedence |
| -------- | -------------- | ---------- |
| `+`      | Addition       | Low        |
| `-`      | Subtraction    | Low        |
| `*`      | Multiplication | Medium     |
| `/`      | Division       | Medium     |
| `//`     | Floor Division | Medium     |
| `%`      | Modulo         | Medium     |
| `()`     | Grouping       | Highest    |

**Examples:**

```
5 + 3           → 8
10 - 4 * 2      → 2  (multiplication first)
(10 - 4) * 2    → 12 (parentheses override)
7 // 2          → 3  (floor division)
7 % 3           → 1  (modulo)
```

### 5.2 Expression Terms

Expressions can include:

- **Literals**: `42`, `3.14`, `"string"`
- **Quality references**: `Score`, `"Wearing Cloak"`, `[Health]`
- **The value keyword**: `value`
- **Nested expressions**: `(Score + 5) * 2`

---

## 6. Comparisons and Predicates

### 6.1 Comparison Operators

| Operator | Meaning               |
| -------- | --------------------- |
| `=`      | Equal to              |
| `==`     | Equal to (synonym)    |
| `!=`     | Not equal to          |
| `>`      | Greater than          |
| `>=`     | Greater than or equal |
| `<`      | Less than             |
| `<=`     | Less than or equal    |

### 6.2 Comparison Syntax

```
Quality comparator Expression
```

**Examples:**

```yaml
- Location = "Foyer"
- "Wearing Cloak" >= 1
- Health > 0
- Score <= 100
- Visited != 0
```

### 6.3 Predicates in Rules

Predicates determine when a rule/situation is available:

```yaml
look-around:
  - when:
      - Location = "Foyer"
      - Visited >= 1
  - You look around the familiar foyer.
```

**Evaluation:**

- All predicates in a rule must be TRUE for the rule to match (AND logic)
- Missing qualities are treated as `0`
- More predicates = higher specificity score (used for ordering)

### 6.4 Tier Predicates

The `tier` predicate tests whether a quality's current value falls within a named tier (see §3.3):

```yaml
- when:
  - "Merchant Guild Standing" tier member
  - Location = "Guild Hall"
- Welcome back, guild member.
```

**Syntax:**

```
Quality tier TierName
```

The predicate is true when the quality's numeric value falls within the range defined for that tier in the quality's `tiers:` declaration. If the quality has no `tiers:` declaration, or the tier name is not found, the predicate evaluates to false.

---

## 7. Operations and Effects

### 7.1 Assignment Operators

| Operator | Meaning                     |
| -------- | --------------------------- |
| `=`      | Set to value                |
| `+=`     | Add to current value        |
| `-=`     | Subtract from current value |
| `*=`     | Multiply current value      |
| `/=`     | Divide current value        |
| `//=`    | Floor divide current value  |
| `%=`     | Modulo current value        |

### 7.2 Operation Syntax

```
Quality operator Expression [constraint]
```

**Examples:**

```yaml
effect:
  - Location = "Bar"
  - Health -= 10
  - Score += 50
  - "Wearing Cloak" = 0
```

### 7.3 Constraints

Operations can include min/max constraints to bound the result:

```yaml
effect:
  - Health -= 10 min 0 # Cannot go below 0
  - Score += 100 max 1000 # Cannot exceed 1000
  - Reputation += 5 min 0 # Clamp at 0
```

**Syntax:**

```
Quality operator Expression min N
Quality operator Expression max N
```

Note: If the quality has `min`/`max` properties in its declaration, those bounds are always enforced in addition to any inline constraint. The effective bound is the more restrictive of the two.

### 7.4 The `consume` Keyword

The `consume` keyword is a semantic operation for spending situation and momentum qualities. Unlike `-=`, `consume` emits a `QualityConsumed` lifecycle event and respects the quality's lifecycle semantics.

```yaml
effect:
  - consume "Scouted Route" 1
  - consume "Lucky Break" # Consumes entire value (equivalent to setting to 0)
```

**Syntax:**

```
consume Quality [Expression]
```

If the expression is omitted, the entire quality value is consumed (set to `0`).

**Semantics:**

- `consume` checks that the quality has sufficient value before consuming. If the quality's value is less than the amount requested, the operation fails silently (no partial consume) and emits no event.
- `consume` emits a `QualityConsumed` event with the amount consumed.
- `consume` is the idiomatic way to spend `situation` and `momentum` qualities. Using `-=` on these types produces a compiler warning recommending `consume` instead.

**Distinction from `-=`:**

- `-=` is a raw arithmetic decrement. It always succeeds and emits `QualityChanged`.
- `consume` is a lifecycle-aware spend. It is atomic (all-or-nothing) and emits `QualityConsumed`.

---

## 8. Rules and Situations

### 8.1 Rule Structure

A rule is a named entry in the rulebook with associated predicates and content:

```yaml
rule-name:
  - Concept # Optional: defaults to "Situation"
  - tags: [tag1, tag2] # Optional: tags for interjection targeting
  - when: # Optional: rule-specific predicates
      - predicate1
      - predicate2
  - directive1 # Content begins here
  - directive2
  - ...
```

The `tags:` directive is an optional list of string tags that identifies this rule as a target for interjection injection (see §8.5). Tags are arbitrary strings defined by the author. A rule without `tags:` cannot receive interjections.

### 8.2 Concepts

The first list item can declare a concept type:

| Concept        | Purpose                                          |
| -------------- | ------------------------------------------------ |
| `Situation`    | Standard narrative situation (default)           |
| `Compel`       | System-initiated complication (see §8.4)         |
| `Interjection` | Content injected into other storylets (see §8.5) |

Custom concepts can be registered via the compiler's handler system.

### 8.3 Location Names

Each rule compiles to a **location** in the rulebook. Locations are hierarchical, using `::` as separator:

```
rulebook-name::rule-name
rulebook-name::rule-name::choice-name
```

**Example:**

```
begin::intro
begin::intro::press-onward
foyer::look-around
```

### 8.4 Compels

A `Compel` is a system-initiated storylet that the engine surfaces proactively when quality conditions are met. Compels represent complications tied to the player's own qualities, offering a reward for accepting a setback.

```yaml
imperial-inspection:
  - Compel
  - when:
    - "Notorious Smuggler" >= 3
    - "Port Law Level" >= 5
  - urgency: high
  - cooldown: 3 watches
  - [Imperial customs officers approach.]They demand to inspect your cargo holds.

  - choice:
    - [Submit to inspection]You lose a day and some cargo, but avoid worse trouble.
    - effect:
      - Fuel -= 5
      - "Merchant Guild Standing" += 1

  - choice:
    - [Attempt to bribe them]You slide a pouch of credits across the table.
    - effect:
      - Credits -= 50
      - "Notorious Smuggler" += 1
```

#### Compel Directives

| Directive   | Required | Description                                                                                                                     |
| ----------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `urgency:`  | No       | Priority level: `low`, `normal` (default), `high`, `critical`. Higher urgency compels preempt lower ones and normal situations. |
| `cooldown:` | No       | Minimum time between activations of this compel (e.g., `3 watches`, `1 session`). Default: no cooldown.                         |

#### Compel Design Rules

- **Every important quality should gate both beneficial AND complicating storylets.** The engine enforces the dual-edge that players struggle to self-impose.
- **Compel rewards must be diegetic** — in-world resources, not meta-currency.
- **The player always has a choice.** Compels present options, not punishments.

#### Compel Evaluation

Compels are evaluated before standard situations in the turn structure (see §11.1). When multiple compels match, the highest-urgency compel is presented. If no compels match (or all are on cooldown), the normal situation query proceeds.

Source: FATE compel economy, adapted for QBN with diegetic rewards.

### 8.5 Interjections

An `Interjection` is a content fragment injected into other storylets when quality conditions are met. Interjections implement the "qualities as active agents" pattern — strong qualities comment on, interrupt, or add options to situations they are relevant to.

```yaml
paranoid-commentary:
  - Interjection
  - when:
    - Paranoia >= 7
  - into: social
  - priority: 3
  - [Your instinct screams.]They know. They all know.

smuggler-option:
  - Interjection
  - when:
    - "Notorious Smuggler" >= 3
  - into: trade
  - choice:
    - [Suggest an unofficial arrangement]
    - effect:
      - "Contraband Deal" = 1
```

#### Interjection Directives

| Directive   | Required | Description                                                                                                               |
| ----------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| `into:`     | Yes      | Target tag. The interjection is injected into situations that have this tag in their `tags:` list.                        |
| `priority:` | No       | Numeric priority for ordering when multiple interjections target the same tag. Higher values display first. Default: `0`. |

#### Interjection Content

An interjection can contain:

- **Text directives**: Injected as additional narrative text within the target situation.
- **Choice directives**: Injected as additional choices in the target situation's choice menu.

An interjection cannot contain standalone `effect:` blocks (effects must be inside choices).

#### Interjection Resolution

When a situation with `tags:` is entered, the runtime queries all `Interjection` rules whose `into:` matches one of the situation's tags and whose `when:` predicates are satisfied. Matching interjections are sorted by `priority:` (descending) and their content is injected into the situation after the situation's own content but before the final choice menu.

Source: Disco Elysium's skill interjection pattern, adapted for QBN.

---

## 9. Directives

Directives are the content within a situation. They appear after the `when:` block (if present) or directly after the concept declaration.

### 9.1 Text Directives

#### Plain Text

Simple narrative text:

```yaml
- You stand in a spacious hall, splendidly decorated in red and gold.
- The rain pours down outside.
```

#### Intro Text (Bracket Syntax)

The first text element in a situation uses special bracket syntax for variant forms:

```
Text before[suffix]Text after
```

This produces two forms:

- **Intro form**: `Text before` + `suffix` (shown in choice lists)
- **Tail form**: `Text before` + `Text after` (shown when situation displays)

**Examples:**

```yaml
- You enter the bar[.] # Intro: "You enter the bar."
  # Tail: "You enter the bar."

- The room is dark[!], almost pitch black.
  # Intro: "The room is dark!"
  # Tail: "The room is dark, almost pitch black."

- [The foyer stretches before you.]
  # Intro: "The foyer stretches before you."
  # Tail: "" (empty)
```

#### Conditional Text

Text with a predicate prefix—only displayed if condition is true:

```yaml
- {"Wearing Cloak" >= 1}Your cloak drips readily on the carpet.
- {Health < 50}You feel weak and tired.
- {Visited == 0}This is your first time here.
```

**Syntax:**

```
{comparison}Text content
```

#### Tier Conditional Text

Text conditioned on a quality's tier. This provides narrative variation based on quality potency:

```yaml
- {tier "Merchant Guild Standing" novice}The clerk ignores you.
- {tier "Merchant Guild Standing" member}The clerk nods in greeting.
- {tier "Merchant Guild Standing" elder}The clerk bows respectfully.
- {tier "Merchant Guild Standing" master}The clerk rushes to attend you personally.
```

**Syntax:**

```
{tier Quality TierName}Text content
```

Only the text for the tier matching the quality's current value is displayed. If the quality's value does not fall within any tier range, none of the tier-conditioned text blocks for that quality are displayed.

#### Sticky Text (Glue)

The `<>` marker at the end of text indicates it should "glue" to the next text element (no line break):

```yaml
- You see a door<>
- {Open >= 1} (open)
- {Open == 0} (closed)
- .
```

### 9.2 Choice Directives

Choices present options to the player within a situation:

```yaml
- choice:
  - [Go to the bar]You head toward the neon sign advertising the bar.
  - effect:
    - Location = "Bar"
```

**Structure:**

```yaml
- choice:
  - [Choice Text]Description after choosing
  - text: (optional additional text)
  - effect:
    - operation1
    - operation2
```

**Choice Text**: The bracketed text `[...]` appears as the selectable option.

**Post-Choice Text**: Text after the bracket is displayed when the choice is selected.

**Effects**: Quality modifications that occur when this choice is selected.

#### Multiple Choices

Multiple `choice:` blocks in sequence create a choice menu:

```yaml
- choice:
  - [Head north]You walk northward.
  - effect:
    - Location = "North"

- choice:
  - [Head south]You turn and walk south.
  - effect:
    - Location = "South"

- choice:
  - [Stay here]You decide to remain.
```

### 9.3 Effect Directives

Standalone effects outside of choices:

```yaml
- effect:
  - Visited += 1
  - "Has Seen Intro" = 1

- effect: Score += 10    # Single-line form

- effect:
  - consume "Scouted Route" 1    # Lifecycle-aware consume
```

---

## 10. Complete Syntax Reference

### 10.1 Grammar Summary (PEG Notation)

```peg
# Qualities
quality         = bracketed_quality / quoted_quality / simple_quality
simple_quality  = ~'[^\s]+'
quoted_quality  = ~'"[^"]+"'
bracketed_quality = ~'\[[^\]]+\]'

# Values
value           = number / string / quality_ref / "value"
number          = float / integer
integer         = ~'-?[0-9]+'
float           = ~'-?[0-9]+\.[0-9]+'
string          = '"' ~'[^"]*' '"' / "'" ~"[^']*" "'"

# Expressions
expression      = additive
additive        = multiplicative (('+' / '-') multiplicative)*
multiplicative  = primary (('*' / '/' / '//' / '%') primary)*
primary         = value / '(' expression ')'

# Comparisons
comparison      = quality comparator expression
comparator      = '>=' / '>' / '<=' / '<' / '!=' / '==' / '='

# Tier predicate
tier_predicate  = quality 'tier' tier_name
tier_name       = ~'[a-z][a-z0-9_-]*'

# Operations
operation       = consume_op / quality setter expression constraint?
setter          = '+=' / '-=' / '*=' / '//=' / '/=' / '%=' / '='
constraint      = ('min' / 'max') number
consume_op      = 'consume' quality expression?

# Text
intro_text      = head ('[' suffix ']' tail)?
conditional_text = '{' (comparison / tier_conditional) '}' text glue?
tier_conditional = 'tier' quality tier_name
glue            = '<>'

# Quality declaration (preamble)
quality_decl    = quality_name ':' quality_props
quality_props   = '{' (type_prop / min_prop / max_prop / initial_prop
                      / decay_prop / expires_prop / max_stack_prop
                      / tiers_prop)* '}'
type_prop       = 'type' ':' quality_type
quality_type    = 'identity' / 'resource' / 'meter' / 'reputation'
                / 'consequence' / 'situation' / 'momentum' / 'generic'
tiers_prop      = 'tiers' ':' '{' (tier_name ':' tier_range)+ '}'
tier_range      = integer ('-' integer)?
decay_prop      = 'decay' ':' sign integer 'per' time_unit
sign            = '+' / '-'
time_unit       = 'watch' / 'session' / 'turn'
expires_prop    = 'expires' ':' expiry_trigger
expiry_trigger  = 'on-location-change' / 'on-use' / 'after' integer time_unit
max_stack_prop  = 'max-stack' ':' integer

# Rule directives
concept         = 'Situation' / 'Compel' / 'Interjection'
tags_directive  = 'tags' ':' '[' (string (',' string)*)? ']'
urgency_dir     = 'urgency' ':' urgency_level
urgency_level   = 'low' / 'normal' / 'high' / 'critical'
cooldown_dir    = 'cooldown' ':' integer time_unit
into_dir        = 'into' ':' string
priority_dir    = 'priority' ':' integer
```

### 10.2 YAML Structure

```yaml
# Preamble (all optional)
include: [rulebook_name, ...]
qualities:
  QualityName:
    type: quality_type
    min: number
    max: number
    initial: value
    decay: sign number per time_unit
    expires: expiry_trigger
    max-stack: number
    tiers:
      tier_name: range
given: [operation, ...]
when: [comparison, ...]
about: {key: value, ...}

# Situation rules
rule-name:
  - Situation                    # Optional, defaults to Situation
  - tags: [tag1, tag2]           # Optional, for interjection targeting
  - when:                        # Optional predicates
    - comparison
    - comparison
  - text directive               # First text uses intro syntax
  - {comparison}conditional text
  - {tier Quality tier_name}tier text
  - choice:
    - [choice text]result text
    - effect:
      - operation
  - effect:
    - operation

# Compel rules
compel-name:
  - Compel
  - when:
    - comparison
  - urgency: level
  - cooldown: duration
  - text and choice directives...

# Interjection rules
interjection-name:
  - Interjection
  - when:
    - comparison
  - into: tag_name
  - priority: number
  - text and/or choice directives...
```

---

## 11. Execution Model

### 11.1 Turn Structure

1. **Decay/Expiry Tick**: Process automatic decay and expiry for all qualities with lifecycle properties
2. **Compel Phase**: Evaluate all `Compel` rules. If a compel matches (predicates pass, not on cooldown), present it to the player. If accepted, execute the compel situation. If no compels fire, continue.
3. **Query Phase**: Find all `Situation` rules whose predicates match current qualities
4. **Display Phase**: Show available situations as choices (using intro text)
5. **Input Phase**: Wait for player selection
6. **Execute Phase**: Display selected situation's directives in order, resolving interjections
7. **Loop**: Return to step 1

### 11.2 Situation Execution

Within a situation, directives execute sequentially:

1. **Interjection Resolution**: If the situation has `tags:`, query matching interjections and inject their content
2. **Text**: Display (if predicate passes)
3. **Injected Text**: Display interjection text (in priority order)
4. **Choice Block**: Collect situation choices + injected choices, display menu, wait for selection
5. **Effect**: Modify qualities

When a choice is selected, its sub-situation executes, then control returns to the parent situation (if more directives remain) or to the Query Phase.

### 11.3 State Stack

The runtime maintains a stack of execution states:

```
┌─────────────────────────┐
│ DisplaySituation(bar)   │ ← Current
├─────────────────────────┤
│ DisplaySituation(foyer) │ ← Paused
├─────────────────────────┤
│ DisplayPossibleSits     │ ← Base
└─────────────────────────┘
```

This allows nested situations (choices within choices) with proper return semantics.

### 11.4 Rule Matching and Scoring

When multiple situations match:

1. All predicates for each rule are tested
2. Rules with failing predicates are excluded
3. Remaining rules are scored by predicate count (more = higher priority)
4. All matching rules are presented as available choices

**Example:**

```yaml
# Score: 1 (one predicate)
generic-look:
  - when:
    - Location = "Bar"
  - The bar is dimly lit.

# Score: 2 (two predicates)
dark-bar-look:
  - when:
    - Location = "Bar"
    - "Has Light" = 0
  - The bar is pitch black. You cannot see a thing.
```

If `Location = "Bar"` and `"Has Light" = 0`, both rules match, but `dark-bar-look` scores higher and appears first.

---

## 12. Example: Cloak of Darkness

The classic IF demonstration game, implemented in Ravel. This example predates quality declarations and remains valid — undeclared qualities default to `generic` with compiler warnings.

### begin.ravel

```yaml
include:
  - foyer
  - cloakroom
  - bar-dark
  - bar-light

given:
  - Location = "Intro"
  - "Wearing Cloak" = 1
  - Fumbled = 0

when:
  - Location = "Intro"

intro:
  - Hurrying through the rainswept November night[…], you're glad to see
    the bright lights of the Opera House.

  - {"Wearing Cloak" == 0}The rain drenches you. Boy, you sure do wish
    you'd worn your opera cloak.

  - choice:
    - [Press onward!]You press onward to the entrance.
    - effect:
      - Location = "Foyer"
```

### foyer.ravel

```yaml
when:
  - Location = "Foyer"

foyer:
  - You are standing in a spacious hall[.], splendidly decorated in red
    and gold, with glittering chandeliers overhead.

  - choice:
    - [Go to the cloakroom]You head toward the small room off the hall.
    - effect:
      - Location = "Cloakroom"

  - choice:
    - [Go to the bar]The neon sign beckons.
    - effect:
      - Location = "Bar"
```

### cloakroom.ravel

```yaml
when:
  - Location = "Cloakroom"

look:
  - [The cloakroom is small.]The walls are lined with hooks.
  - {"Wearing Cloak" == 0}Your velvet cloak hangs on a brass hook.

hang-up-cloak:
  - when:
    - "Wearing Cloak" >= 1
  - [Hang up your cloak.]You hang your cloak on the hook.
  - effect:
    - "Wearing Cloak" = 0

return-to-foyer:
  - [Return to the foyer]You step back into the main hall.
  - effect:
    - Location = "Foyer"
```

---

## 13. Example: Smuggler's Port (New Features)

A short example demonstrating quality declarations, tiers, compels, interjections, and consume:

### smuggler-port.ravel

```yaml
include:
  - port-trade
  - port-compels

qualities:
  Fuel:
    type: resource
    min: 0
    max: 100
    initial: 50

  Credits:
    type: resource
    min: 0
    initial: 200

  'Notorious Smuggler':
    type: identity
    initial: 3

  'Merchant Guild Standing':
    type: reputation
    min: 0
    max: 10
    initial: 2
    tiers:
      novice: 1-3
      member: 4-6
      elder: 7-9
      master: 10

  'Scouted Route':
    type: situation
    expires: on-location-change
    max-stack: 3

  'Lucky Break':
    type: momentum
    expires: on-use

  Location:
    type: generic
    initial: 'Port'

given:
  - Location = "Port"

about:
  title: "Smuggler's Port"
  version: '0.1'
```

### port-trade.ravel

```yaml
when:
  - Location = "Port"

guild-hall:
  - Situation
  - tags: [trade, social]
  - when:
    - "Merchant Guild Standing" >= 1
  - [Visit the Merchant Guild hall.]The heavy doors swing open.

  - {tier "Merchant Guild Standing" novice}The clerk barely acknowledges you.
  - {tier "Merchant Guild Standing" member}The clerk nods and checks your account.
  - {tier "Merchant Guild Standing" elder}The clerk bows and offers refreshment.

  - choice:
    - [Browse the job board]You scan the posted contracts.
    - effect:
      - "Merchant Guild Standing" += 1 max 10

scout-route:
  - Situation
  - when:
    - Fuel >= 10
    - "Scouted Route" < 3
  - [Scout a trade route.]You spend fuel mapping nearby systems.
  - effect:
    - Fuel -= 10
    - "Scouted Route" += 1

use-route:
  - Situation
  - when:
    - "Scouted Route" >= 1
  - [Follow scouted route.]You follow your charts through the shortcut.
  - effect:
    - consume "Scouted Route" 1
    - Credits += 30
```

### port-compels.ravel

```yaml
when:
  - Location = "Port"

imperial-inspection:
  - Compel
  - when:
    - "Notorious Smuggler" >= 3
  - urgency: normal
  - cooldown: 3 watches
  - [Imperial customs officers approach.]They demand to inspect your cargo.

  - choice:
    - [Submit to inspection]You lose time and some cargo.
    - effect:
      - Fuel -= 5
      - "Merchant Guild Standing" += 1

  - choice:
    - [Attempt to bribe them]You slide credits across the table.
    - effect:
      - Credits -= 50
      - "Notorious Smuggler" += 1

paranoid-commentary:
  - Interjection
  - when:
    - "Notorious Smuggler" >= 5
  - into: social
  - priority: 3
  - Everyone in here is watching you. Or are they?

smuggler-deal:
  - Interjection
  - when:
    - "Notorious Smuggler" >= 3
  - into: trade
  - choice:
    - [Suggest an off-the-books arrangement]A knowing look passes between you.
    - effect:
      - Credits += 40
      - "Notorious Smuggler" += 1
```

---

## 14. Appendices

### A. Reserved Words

The following are reserved in expression contexts:

- `value` - Current quality value
- `min` - Constraint keyword
- `max` - Constraint keyword
- `consume` - Lifecycle-aware quality consumption
- `tier` - Tier predicate keyword

The following are reserved as concept names:

- `Situation` - Standard concept
- `Compel` - System-initiated concept
- `Interjection` - Injection concept

The following are reserved as directive keywords:

- `tags` - Interjection targeting
- `into` - Interjection target tag
- `priority` - Interjection ordering
- `urgency` - Compel priority
- `cooldown` - Compel rate limiting

### B. File Organization Best Practices

```
story/
├── begin.ravel          # Entry point with intro + quality declarations
├── locations/
│   ├── foyer.ravel      # Foyer situations
│   ├── bar.ravel        # Bar situations
│   └── garden.ravel     # Garden situations
├── characters/
│   ├── alice.ravel      # Alice interactions
│   └── bob.ravel        # Bob interactions
├── events/
│   ├── weather.ravel    # Weather events
│   └── time.ravel       # Time-based events
└── compels/
    ├── reputation.ravel # Reputation-based compels
    └── smuggling.ravel  # Smuggling compels + interjections
```

### C. Quality Naming Conventions

| Pattern    | Use Case           | Recommended Type         | Example               |
| ---------- | ------------------ | ------------------------ | --------------------- |
| `Location` | Current location   | `generic`                | `Location = "Foyer"`  |
| `Has X`    | Boolean possession | `situation` or `generic` | `"Has Key" = 1`       |
| `X Count`  | Numeric counter    | `generic`                | `"Visit Count" += 1`  |
| `Is X`     | Boolean state      | `identity` or `generic`  | `"Is Tired" = 1`      |
| `X Level`  | Scaled value       | `reputation` or `meter`  | `"Trust Level" >= 50` |
| `X Damage` | Harm tracking      | `consequence`            | `"Ship Damage" -= 1`  |

### D. Comparison with Ink

| Feature           | Ink                         | Ravel                                  |
| ----------------- | --------------------------- | -------------------------------------- |
| File format       | Custom syntax               | YAML                                   |
| Flow control      | Knots/stitches with diverts | Predicate matching                     |
| Variables         | Global variables            | Typed qualities                        |
| Conditionals      | Inline `{ }` blocks         | Predicate prefixes + tier conditionals |
| Choices           | `* [text]` or `+ [text]`    | `choice:` blocks                       |
| State model       | Sequential with jumps       | Quality-based matching                 |
| Use case          | Linear branching            | Quality-based narratives               |
| Proactive content | None                        | Compels + Interjections                |

### E. Quality Type Reference

| Type          | Typical `min` | Typical `max` | Supports `decay` | Supports `expires` | Supports `max-stack` | Supports `tiers` |
| ------------- | ------------- | ------------- | ---------------- | ------------------ | -------------------- | ---------------- |
| `identity`    | N/A           | N/A           | No               | No                 | No                   | No               |
| `resource`    | 0             | Varies        | No               | No                 | No                   | No               |
| `meter`       | 0             | Varies        | Yes              | No                 | No                   | Yes              |
| `reputation`  | 0             | Varies        | No               | No                 | No                   | Yes              |
| `consequence` | 0             | Varies        | Yes              | No                 | No                   | Yes              |
| `situation`   | 0             | N/A           | No               | Yes                | Yes                  | No               |
| `momentum`    | 0             | N/A           | No               | Yes                | No                   | No               |
| `generic`     | N/A           | N/A           | No               | No                 | No                   | Yes              |

"N/A" means the property is not commonly used with that type but is not prohibited.

---

## 15. Version History

| Version | Date | Changes                                                                                                                                      |
| ------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1     | 2025 | Initial specification draft                                                                                                                  |
| 0.2     | 2026 | Quality declarations with types, tiers, lifecycle; Compel and Interjection concepts; `consume` keyword; tier predicates and conditional text |

---

_This specification was derived from analysis of the Ravel implementation codebase and refined with insights from FATE RPG research, Kennedy's resource narrative critique, and the Disco Elysium active-agent pattern._

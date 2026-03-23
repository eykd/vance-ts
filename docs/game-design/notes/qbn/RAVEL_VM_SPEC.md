# Ravel Narrative VM Specification

**Version**: 0.2 (Draft)
**Status**: Design specification for Ravel narrative engine

---

## 1. Introduction

This document specifies a Virtual Machine (VM) for executing compiled Ravel rulebooks. The architecture cleanly separates:

1. **Compilation Target**: Serializable Intermediate Representation (IR)
2. **Execution Context**: Stateless VM with reconstructible state
3. **Presentation Context**: Event subscribers (out of scope)

### 1.1 Design Goals

- **Portable**: Serializable IR for distribution and caching
- **Reconstructible**: Capture and restore VM state at any point
- **Decoupled**: Event-driven architecture for UI flexibility
- **Flexible**: Support realtime, HATEOAS, and hybrid execution modes

### 1.2 Execution Model

The VM implements a **pushdown automaton**:

1. A **stack of frames** tracks active situation execution
2. Each frame executes a **flow-chart state machine** (instruction sequence)
3. When the stack is empty, the VM **evaluates compels**, then **queries** for applicable top-level situations
4. Player choices **manipulate the stack** (push, pop, replace, clear)
5. All operations **emit events** for external subscribers
6. **Interjections** are resolved when entering tagged situations
7. **Decay and expiry** are ticked at the start of each turn

---

## 2. Domain Model

### 2.1 Value Objects (Immutable)

#### QualityValue

A quality value is one of:

- **Integer**: `0`, `42`, `-5`
- **Float**: `3.14`, `0.5`
- **String**: `"Foyer"`, `"Wearing Cloak"`

```
QualityValue = int | float | str
```

Default value for unset qualities: `0` (integer)

#### QualityName

A validated quality identifier supporting three formats:

- **Simple**: `Location`, `Health`, `Score`
- **Quoted**: `"Wearing Cloak"`, `"Man of Honor"`
- **Bracketed**: `[Wearing Cloak]`, `[Score]`

Canonical form strips quotes/brackets and preserves original casing.

#### QualityType

An enumeration of quality type classifications:

```
QualityType = "identity" | "resource" | "meter" | "reputation"
            | "consequence" | "situation" | "momentum" | "generic"
```

Each type implies distinct lifecycle behaviors (see §2.1 QualityDeclaration).

#### QualityDeclaration

A compiled quality declaration with type metadata and lifecycle properties:

```
QualityDeclaration = {
  name: QualityName,
  type: QualityType,
  min: QualityValue | None,
  max: QualityValue | None,
  initial: QualityValue,
  decay: DecaySpec | None,
  expires: ExpiryTrigger | None,
  max_stack: int | None,
  tiers: list[TierDef] | None
}

DecaySpec = {
  amount: int,                        # Signed: +1 or -1
  per: TimeUnit
}

ExpiryTrigger = "on-location-change" | "on-use" | AfterDuration

AfterDuration = {
  count: int,
  unit: TimeUnit
}

TimeUnit = "watch" | "session" | "turn"
```

#### TierDef

A named value range within a quality:

```
TierDef = {
  name: str,
  min_value: int,
  max_value: int                      # Inclusive
}
```

Tier ranges must not overlap and must cover contiguous values.

#### LocationId

A unique situation identifier as a tuple of path segments:

```
LocationId = tuple[str, ...]

Examples:
  ("begin", "intro")                    → "begin::intro"
  ("begin", "intro", "press-onward")    → "begin::intro::press-onward"
  ("foyer", "cloakroom", "hang-cloak")  → "foyer::cloakroom::hang-cloak"
```

#### Expression

An arithmetic expression tree:

```
Expression =
  | Literal(value: QualityValue)
  | QualityRef(quality: QualityName)
  | ValueRef()                              # Current quality value
  | BinaryOp(op: Operator, left: Expression, right: Expression)

Operator = "+" | "-" | "*" | "/" | "//" | "%"
```

Evaluation: `evaluate(expression, qualities, current_value) → QualityValue`

#### Comparator

```
Comparator = "=" | "==" | "!=" | ">" | ">=" | "<" | "<="
```

Note: `=` and `==` are equivalent for comparisons.

#### Constraint

A bound applied after quality operations:

```
Constraint =
  | Min(bound: QualityValue)
  | Max(bound: QualityValue)
```

Application:

- `Min(0)`: Result cannot go below 0
- `Max(100)`: Result cannot exceed 100

---

### 2.2 Entities

#### Predicate

A condition testing quality state:

```
Predicate = {
  quality: QualityName,
  comparator: Comparator,
  expression: Expression
}
```

Evaluation: `evaluate(predicate, qualities) → bool`

#### TierPredicate

A condition testing whether a quality falls within a named tier:

```
TierPredicate = {
  quality: QualityName,
  tier_name: str
}
```

Evaluation: looks up the quality's `TierDef` list and returns true if the current value falls within the named tier's range.

#### Instruction

An atomic VM operation:

```
Instruction = {
  opcode: InstructionOpcode,
  operands: dict[str, Any]
}
```

See Section 4 for the complete instruction set.

#### SituationDef

A compiled situation definition:

```
SituationDef = {
  location: LocationId,
  concept: ConceptType,
  predicates: list[Predicate],
  intro_text: str,
  tail_text: str,
  instructions: list[Instruction],
  tags: list[str],
  urgency: UrgencyLevel | None,
  cooldown: CooldownSpec | None
}

ConceptType = "Situation" | "Compel" | "Interjection"

UrgencyLevel = "low" | "normal" | "high" | "critical"

CooldownSpec = {
  count: int,
  unit: TimeUnit
}
```

Properties:

- `predicate_score`: Number of predicates (for ranking)
- `matches(qualities)`: True if all predicates pass

Compel-specific fields (`urgency`, `cooldown`) are `None` for non-Compel concepts.

#### InterjectionDef

A compiled interjection definition (extends SituationDef with injection metadata):

```
InterjectionDef = SituationDef & {
  into_tag: str,
  priority: int
}
```

---

### 2.3 Aggregates

#### Rulebook (Aggregate Root)

The compiled story—an immutable artifact:

```
Rulebook = {
  version: str,
  metadata: dict[str, str],
  quality_declarations: dict[QualityName, QualityDeclaration],
  initial_qualities: list[(QualityName, Expression)],
  situations: dict[LocationId, SituationDef],
  situation_index: dict[str, list[LocationId]],    # concept → locations
  interjection_index: dict[str, list[LocationId]]  # tag → interjection locations
}
```

Operations:

- `get_situation(location) → SituationDef`
- `query_situations(concept, qualities) → list[SituationDef]`
- `query_compels(qualities, cooldown_state) → list[SituationDef]`
- `query_interjections(tags, qualities) → list[InterjectionDef]`
- `get_quality_declaration(quality) → QualityDeclaration | None`

#### StackFrame

Execution context for an active situation:

```
StackFrame = {
  location: LocationId,
  instruction_pointer: int,              # Default: 0
  local_state: dict[str, Any]            # Frame-local variables
}
```

Operations:

- `advance(delta=1) → StackFrame`: New frame with IP += delta
- `with_local(key, value) → StackFrame`: New frame with updated local

#### QualityLayer

An immutable quality state layer:

```
QualityLayer = {
  layer_id: str,
  qualities: dict[QualityName, QualityValue]
}
```

#### QualityState (Aggregate Root)

Layered quality storage with precedence resolution:

```
QualityState = {
  layers: list[QualityLayer]    # Ordered by precedence (first = highest)
}
```

**Layer Types**:

| Layer      | Scope               | Persistence  | Default Write |
| ---------- | ------------------- | ------------ | ------------- |
| `location` | Active frame        | Frame-scoped | No            |
| `session`  | Current playthrough | Ephemeral    | Yes           |
| `player`   | Player profile      | Persistent   | No            |
| `global`   | World constants     | Read-only    | No            |

**Resolution Order**: `location → session → player → global → 0`

Operations:

- `get(quality) → QualityValue`: Resolve through layers
- `set(layer_id, quality, value) → QualityState`: New state with update
- `get_layer(layer_id) → QualityLayer`

#### CooldownState

Tracks when compels were last activated:

```
CooldownState = {
  last_activated: dict[LocationId, Timestamp]
}
```

Operations:

- `is_on_cooldown(location, cooldown_spec, current_time) → bool`
- `record_activation(location, current_time) → CooldownState`

#### VMState (Aggregate Root)

Complete VM state—fully serializable:

```
VMState = {
  stack: list[StackFrame],
  qualities: QualityState,
  cooldowns: CooldownState,
  pending_events: list[VMEvent],
  status: VMStatus,
  waiting_context: dict | None
}

VMStatus = "running" | "waiting_input" | "halted"
```

Properties:

- `current_frame`: Top of stack or None

Operations:

- `push_frame(frame) → VMState`
- `pop_frame() → VMState`
- `replace_frame(frame) → VMState`
- `with_qualities(qualities) → VMState`
- `with_cooldowns(cooldowns) → VMState`
- `with_status(status) → VMState`
- `emit_event(event) → VMState`
- `clear_events() → VMState`

---

## 3. Quality State Layering

### 3.1 Layer Semantics

**Global Layer** (`global`):

- World constants, story flags shared across all players
- Read-only at runtime (set during rulebook compilation)
- Example: `MaxHealth = 100`, `StoryVersion = 2`

**Player Layer** (`player`):

- Persistent player profile data
- Survives across sessions
- Example: `Achievements`, `Unlocks`, `TotalPlaytime`

**Session Layer** (`session`):

- Current playthrough state
- Ephemeral—lost when session ends
- Default target for quality writes
- Example: `Location`, `Health`, `Inventory`

**Location Layer** (`location`):

- Frame-local variables
- Scoped to the active situation
- Automatically cleared when frame pops
- Example: `VisitCount`, `LocalFlags`

### 3.2 Write Targeting

By default, quality operations write to the `session` layer. Future Ravel syntax may support explicit layer targeting:

```yaml
effect:
  - Location = "Bar"                # session (default)
  - @player.Achievement = 1         # player layer
  - @location.Visited += 1          # location layer
```

### 3.3 Resolution Example

```
qualities:
  global:   {MaxHealth: 100}
  player:   {Achievement: 1}
  session:  {Health: 75, Location: "Foyer"}
  location: {Visited: 2}

get("Health")      → 75       (from session)
get("MaxHealth")   → 100      (from global)
get("Achievement") → 1        (from player)
get("Visited")     → 2        (from location)
get("Unknown")     → 0        (default)
```

---

## 4. Instruction Set

### 4.1 Instruction Format

```
Instruction = {
  opcode: str,
  operands: dict[str, Any]
}
```

### 4.2 Stack Operations

| Opcode    | Operands                 | Description                  |
| --------- | ------------------------ | ---------------------------- |
| `PUSH`    | `{location: LocationId}` | Push new frame onto stack    |
| `POP`     | `{}`                     | Pop current frame from stack |
| `REPLACE` | `{location: LocationId}` | Pop then push (tail call)    |
| `CLEAR`   | `{}`                     | Clear stack until empty      |

**Semantics**:

```
PUSH(location):
  frame = StackFrame(location, ip=0, local_state={})
  state = state.push_frame(frame)
  emit StackPushed(location, len(state.stack))
  emit SituationEntered(location)

POP:
  old_frame = state.current_frame
  state = state.pop_frame()
  emit StackPopped(old_frame.location, len(state.stack))
  emit SituationExited(old_frame.location)

REPLACE(location):
  execute POP
  execute PUSH(location)

CLEAR:
  while state.stack is not empty:
    execute POP
```

### 4.3 Display Operations

| Opcode           | Operands                                           | Description                        |
| ---------------- | -------------------------------------------------- | ---------------------------------- |
| `DISPLAY_TEXT`   | `{text: str, sticky: bool, predicate: Predicate?}` | Display narrative text             |
| `DISPLAY_INTRO`  | `{location: LocationId}`                           | Display situation intro text       |
| `BEGIN_CHOICES`  | `{}`                                               | Signal start of choice block       |
| `DISPLAY_CHOICE` | `{index: int, location: LocationId, text: str}`    | Display choice option              |
| `END_CHOICES`    | `{}`                                               | Signal end of choice block         |
| `INJECT_TEXT`    | `{source: LocationId, text: str, priority: int}`   | Display injected interjection text |

**Semantics**:

```
DISPLAY_TEXT(text, sticky, predicate):
  if predicate is None or predicate.evaluate(state.qualities):
    emit TextDisplayed(text, sticky)
  advance IP

DISPLAY_INTRO(location):
  situation = rulebook.get_situation(location)
  emit TextDisplayed(situation.intro_text, sticky=False)
  advance IP

BEGIN_CHOICES:
  emit ChoicesBegin()
  advance IP

DISPLAY_CHOICE(index, location, text):
  emit ChoiceDisplayed(index, location, text)
  advance IP

END_CHOICES:
  emit ChoicesEnd()
  advance IP

INJECT_TEXT(source, text, priority):
  emit InterjectionInjected(source, text, priority)
  advance IP
```

### 4.4 Quality Operations

| Opcode            | Operands                                                                              | Description             |
| ----------------- | ------------------------------------------------------------------------------------- | ----------------------- |
| `SET_QUALITY`     | `{layer: str, quality: QualityName, expression: Expression, constraint: Constraint?}` | Set quality to value    |
| `INC_QUALITY`     | `{layer: str, quality: QualityName, expression: Expression, constraint: Constraint?}` | Add to quality          |
| `DEC_QUALITY`     | `{layer: str, quality: QualityName, expression: Expression, constraint: Constraint?}` | Subtract from quality   |
| `CONSUME_QUALITY` | `{quality: QualityName, expression: Expression?}`                                     | Lifecycle-aware consume |

**Semantics**:

```
SET_QUALITY(layer, quality, expression, constraint):
  current = state.qualities.get(quality)
  value = expression.evaluate(state.qualities, current)
  value = apply_declaration_bounds(quality, value)
  if constraint:
    value = constraint.apply(value)
  state = state.with_qualities(state.qualities.set(layer, quality, value))
  emit QualityChanged(quality, layer, current, value)
  advance IP

INC_QUALITY(layer, quality, expression, constraint):
  current = state.qualities.get(quality)
  delta = expression.evaluate(state.qualities, current)
  value = current + delta
  value = apply_declaration_bounds(quality, value)
  if constraint:
    value = constraint.apply(value)
  state = state.with_qualities(state.qualities.set(layer, quality, value))
  emit QualityChanged(quality, layer, current, value)
  advance IP

DEC_QUALITY(layer, quality, expression, constraint):
  # Same as INC_QUALITY with subtraction
  current = state.qualities.get(quality)
  delta = expression.evaluate(state.qualities, current)
  value = current - delta
  value = apply_declaration_bounds(quality, value)
  if constraint:
    value = constraint.apply(value)
  state = state.with_qualities(state.qualities.set(layer, quality, value))
  emit QualityChanged(quality, layer, current, value)
  advance IP

CONSUME_QUALITY(quality, expression):
  current = state.qualities.get(quality)
  amount = expression.evaluate(state.qualities, current) if expression else current
  if current < amount:
    # Insufficient value — no-op
    advance IP
    return
  value = current - amount
  state = state.with_qualities(state.qualities.set("session", quality, value))
  emit QualityConsumed(quality, amount, current, value)
  advance IP

apply_declaration_bounds(quality, value):
  decl = rulebook.get_quality_declaration(quality)
  if decl is None:
    return value
  if decl.min is not None and value < decl.min:
    value = decl.min
  if decl.max is not None and value > decl.max:
    value = decl.max
  if decl.max_stack is not None and value > decl.max_stack:
    value = decl.max_stack
  return value
```

### 4.5 Control Flow Operations

| Opcode      | Operands                              | Description                 |
| ----------- | ------------------------------------- | --------------------------- |
| `BRANCH_IF` | `{predicate: Predicate, offset: int}` | Conditional relative jump   |
| `JUMP`      | `{offset: int}`                       | Unconditional relative jump |
| `YIELD`     | `{kind: str, context: dict}`          | Pause, wait for input       |
| `HALT`      | `{reason: str?}`                      | Terminate VM                |
| `NOP`       | `{}`                                  | No operation                |

**Semantics**:

```
BRANCH_IF(predicate, offset):
  if predicate.evaluate(state.qualities):
    advance IP by offset
  else:
    advance IP by 1

JUMP(offset):
  advance IP by offset

YIELD(kind, context):
  state = state.with_status("waiting_input")
  state = state.with_waiting_context({kind: kind, **context})
  emit WaitingForInput(kind, context)
  # Do NOT advance IP - resume continues from here

HALT(reason):
  state = state.with_status("halted")
  emit VMHalted(reason)

NOP:
  advance IP
```

### 4.6 Query Operations

| Opcode                | Operands                                                     | Description                                |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------ |
| `QUERY_SITUATIONS`    | `{concept: str}`                                             | Find matching situations                   |
| `QUERY_COMPELS`       | `{}`                                                         | Find matching compels respecting cooldowns |
| `QUERY_INTERJECTIONS` | `{tags: list[str]}`                                          | Find matching interjections for tags       |
| `CHECK_PREDICATE`     | `{predicate: Predicate, jump_if_false: int}`                 | Test and branch                            |
| `CHECK_TIER`          | `{quality: QualityName, tier_name: str, jump_if_false: int}` | Test tier membership and branch            |

**Semantics**:

```
QUERY_SITUATIONS(concept):
  matches = rulebook.query_situations(concept, state.qualities)
  sorted_matches = sort by predicate_score descending
  frame = frame.with_local("query_results", sorted_matches)
  advance IP

QUERY_COMPELS:
  matches = rulebook.query_compels(state.qualities, state.cooldowns)
  sorted_matches = sort by urgency descending, then predicate_score descending
  frame = frame.with_local("compel_results", sorted_matches)
  advance IP

QUERY_INTERJECTIONS(tags):
  matches = rulebook.query_interjections(tags, state.qualities)
  sorted_matches = sort by priority descending
  frame = frame.with_local("interjection_results", sorted_matches)
  advance IP

CHECK_PREDICATE(predicate, jump_if_false):
  if not predicate.evaluate(state.qualities):
    advance IP by jump_if_false
  else:
    advance IP by 1

CHECK_TIER(quality, tier_name, jump_if_false):
  decl = rulebook.get_quality_declaration(quality)
  current = state.qualities.get(quality)
  if decl is None or decl.tiers is None:
    advance IP by jump_if_false
    return
  tier = find tier in decl.tiers where tier.name == tier_name
  if tier is None or current < tier.min_value or current > tier.max_value:
    advance IP by jump_if_false
  else:
    advance IP by 1
```

### 4.7 Lifecycle Operations

| Opcode         | Operands                   | Description                                              |
| -------------- | -------------------------- | -------------------------------------------------------- |
| `TICK_DECAY`   | `{unit: TimeUnit}`         | Process decay for all qualities with matching decay spec |
| `CHECK_EXPIRY` | `{trigger: ExpiryTrigger}` | Check and process expiry for matching qualities          |

**Semantics**:

```
TICK_DECAY(unit):
  for quality, decl in rulebook.quality_declarations:
    if decl.decay is not None and decl.decay.per == unit:
      current = state.qualities.get(quality)
      value = current + decl.decay.amount
      value = apply_declaration_bounds(quality, value)
      if value != current:
        state = state.with_qualities(state.qualities.set("session", quality, value))
        emit QualityDecayed(quality, current, value, decl.decay)
  advance IP

CHECK_EXPIRY(trigger):
  for quality, decl in rulebook.quality_declarations:
    if decl.expires is not None and decl.expires matches trigger:
      current = state.qualities.get(quality)
      if current != 0:
        state = state.with_qualities(state.qualities.set("session", quality, 0))
        emit QualityExpired(quality, current, trigger)
  advance IP
```

---

## 5. Event Schema

### 5.1 Event Base

```
VMEvent = {
  timestamp: float,     # Unix timestamp
  sequence: int         # Monotonic sequence number
}
```

### 5.2 Quality Events

```
QualityChanged = VMEvent & {
  type: "quality_changed",
  quality: QualityName,
  layer: str,
  old_value: QualityValue,
  new_value: QualityValue
}

QualityConsumed = VMEvent & {
  type: "quality_consumed",
  quality: QualityName,
  amount: QualityValue,
  old_value: QualityValue,
  new_value: QualityValue
}

QualityDecayed = VMEvent & {
  type: "quality_decayed",
  quality: QualityName,
  old_value: QualityValue,
  new_value: QualityValue,
  decay_spec: DecaySpec
}

QualityExpired = VMEvent & {
  type: "quality_expired",
  quality: QualityName,
  old_value: QualityValue,
  trigger: ExpiryTrigger
}
```

### 5.3 Display Events

```
TextDisplayed = VMEvent & {
  type: "text_displayed",
  text: str,
  sticky: bool
}

ChoicesBegin = VMEvent & {
  type: "choices_begin"
}

ChoiceDisplayed = VMEvent & {
  type: "choice_displayed",
  index: int,
  location: LocationId,
  text: str
}

ChoicesEnd = VMEvent & {
  type: "choices_end"
}

InterjectionInjected = VMEvent & {
  type: "interjection_injected",
  source: LocationId,
  text: str,
  priority: int
}
```

### 5.4 Situation Events

```
SituationEntered = VMEvent & {
  type: "situation_entered",
  location: LocationId
}

SituationExited = VMEvent & {
  type: "situation_exited",
  location: LocationId
}

CompelTriggered = VMEvent & {
  type: "compel_triggered",
  location: LocationId,
  urgency: UrgencyLevel
}
```

### 5.5 Control Events

```
WaitingForInput = VMEvent & {
  type: "waiting_for_input",
  kind: "choice" | "text" | "confirm",
  context: dict
}

VMHalted = VMEvent & {
  type: "vm_halted",
  reason: str | None
}
```

### 5.6 Stack Events

```
StackPushed = VMEvent & {
  type: "stack_pushed",
  location: LocationId,
  depth: int
}

StackPopped = VMEvent & {
  type: "stack_popped",
  location: LocationId,
  depth: int
}
```

---

## 6. Serialization Format

### 6.1 Design Principles

- **Portable**: JSON primary, MessagePack for performance
- **Versioned**: Schema version for forward compatibility
- **Human-readable**: JSON for debugging and tooling

### 6.2 Rulebook Schema (JSON)

```json
{
  "$schema": "https://ravel-lang.org/schemas/rulebook/v2",
  "version": "2.0.0",
  "metadata": {
    "title": "Smuggler's Port",
    "author": "Author Name"
  },
  "qualityDeclarations": {
    "Fuel": {
      "type": "resource",
      "min": 0,
      "max": 100,
      "initial": 50,
      "decay": null,
      "expires": null,
      "maxStack": null,
      "tiers": null
    },
    "Merchant Guild Standing": {
      "type": "reputation",
      "min": 0,
      "max": 10,
      "initial": 2,
      "decay": null,
      "expires": null,
      "maxStack": null,
      "tiers": [
        { "name": "novice", "minValue": 1, "maxValue": 3 },
        { "name": "member", "minValue": 4, "maxValue": 6 },
        { "name": "elder", "minValue": 7, "maxValue": 9 },
        { "name": "master", "minValue": 10, "maxValue": 10 }
      ]
    },
    "Scouted Route": {
      "type": "situation",
      "min": 0,
      "max": null,
      "initial": 0,
      "decay": null,
      "expires": "on-location-change",
      "maxStack": 3,
      "tiers": null
    }
  },
  "initialQualities": [
    {
      "quality": "Location",
      "expression": { "kind": "literal", "value": "Port" }
    },
    {
      "quality": "Fuel",
      "expression": { "kind": "literal", "value": 50 }
    }
  ],
  "situations": {
    "port-trade::guild-hall": {
      "concept": "Situation",
      "tags": ["trade", "social"],
      "urgency": null,
      "cooldown": null,
      "predicates": [
        {
          "quality": "Location",
          "comparator": "=",
          "expression": { "kind": "literal", "value": "Port" }
        },
        {
          "quality": "Merchant Guild Standing",
          "comparator": ">=",
          "expression": { "kind": "literal", "value": 1 }
        }
      ],
      "introText": "Visit the Merchant Guild hall.",
      "tailText": "The heavy doors swing open.",
      "instructions": [
        {
          "opcode": "DISPLAY_TEXT",
          "operands": { "text": "The heavy doors swing open.", "sticky": false, "predicate": null }
        },
        {
          "opcode": "QUERY_INTERJECTIONS",
          "operands": { "tags": ["trade", "social"] }
        },
        {
          "opcode": "CHECK_TIER",
          "operands": {
            "quality": "Merchant Guild Standing",
            "tier_name": "novice",
            "jump_if_false": 2
          }
        },
        {
          "opcode": "DISPLAY_TEXT",
          "operands": {
            "text": "The clerk barely acknowledges you.",
            "sticky": false,
            "predicate": null
          }
        },
        {
          "opcode": "JUMP",
          "operands": { "offset": 5 }
        },
        {
          "opcode": "CHECK_TIER",
          "operands": {
            "quality": "Merchant Guild Standing",
            "tier_name": "member",
            "jump_if_false": 2
          }
        },
        {
          "opcode": "DISPLAY_TEXT",
          "operands": {
            "text": "The clerk nods and checks your account.",
            "sticky": false,
            "predicate": null
          }
        },
        {
          "opcode": "JUMP",
          "operands": { "offset": 3 }
        },
        {
          "opcode": "CHECK_TIER",
          "operands": {
            "quality": "Merchant Guild Standing",
            "tier_name": "elder",
            "jump_if_false": 2
          }
        },
        {
          "opcode": "DISPLAY_TEXT",
          "operands": {
            "text": "The clerk bows and offers refreshment.",
            "sticky": false,
            "predicate": null
          }
        },
        {
          "opcode": "BEGIN_CHOICES",
          "operands": {}
        },
        {
          "opcode": "DISPLAY_CHOICE",
          "operands": {
            "index": 0,
            "location": "port-trade::guild-hall::browse-jobs",
            "text": "Browse the job board"
          }
        },
        {
          "opcode": "END_CHOICES",
          "operands": {}
        },
        {
          "opcode": "YIELD",
          "operands": { "kind": "choice", "context": {} }
        }
      ]
    },
    "port-compels::imperial-inspection": {
      "concept": "Compel",
      "tags": [],
      "urgency": "normal",
      "cooldown": { "count": 3, "unit": "watch" },
      "predicates": [
        {
          "quality": "Location",
          "comparator": "=",
          "expression": { "kind": "literal", "value": "Port" }
        },
        {
          "quality": "Notorious Smuggler",
          "comparator": ">=",
          "expression": { "kind": "literal", "value": 3 }
        }
      ],
      "introText": "Imperial customs officers approach.",
      "tailText": "They demand to inspect your cargo.",
      "instructions": []
    }
  },
  "situationIndex": {
    "Situation": ["port-trade::guild-hall", "port-trade::scout-route"],
    "Compel": ["port-compels::imperial-inspection"],
    "Interjection": ["port-compels::paranoid-commentary", "port-compels::smuggler-deal"]
  },
  "interjectionIndex": {
    "social": ["port-compels::paranoid-commentary"],
    "trade": ["port-compels::smuggler-deal"]
  }
}
```

### 6.3 VMState Schema (JSON)

```json
{
  "$schema": "https://ravel-lang.org/schemas/vmstate/v2",
  "version": "2.0.0",
  "rulebookId": "smugglers-port",
  "stack": [
    {
      "location": "port-trade::guild-hall",
      "instructionPointer": 5,
      "localState": {}
    }
  ],
  "qualities": {
    "global": {},
    "player": {},
    "session": {
      "Location": "Port",
      "Fuel": 50,
      "Merchant Guild Standing": 2
    },
    "location": {}
  },
  "cooldowns": {
    "lastActivated": {}
  },
  "pendingEvents": [],
  "status": "waiting_input",
  "waitingContext": {
    "kind": "choice",
    "choices": ["port-trade::guild-hall::browse-jobs"]
  }
}
```

### 6.4 Expression Schema

```json
// Literal
{"kind": "literal", "value": 42}
{"kind": "literal", "value": "Foyer"}

// Quality reference
{"kind": "quality_ref", "quality": "Health"}

// Current value reference
{"kind": "value_ref"}

// Binary operation
{
  "kind": "binary_op",
  "operator": "+",
  "left": {"kind": "quality_ref", "quality": "Score"},
  "right": {"kind": "literal", "value": 10}
}
```

### 6.5 Predicate Schema

```json
{
  "quality": "Location",
  "comparator": "=",
  "expression": { "kind": "literal", "value": "Foyer" }
}
```

### 6.6 Constraint Schema

```json
{"kind": "min", "bound": 0}
{"kind": "max", "bound": 100}
```

### 6.7 Quality Declaration Schema

```json
{
  "name": "Merchant Guild Standing",
  "type": "reputation",
  "min": 0,
  "max": 10,
  "initial": 2,
  "decay": null,
  "expires": null,
  "maxStack": null,
  "tiers": [
    { "name": "novice", "minValue": 1, "maxValue": 3 },
    { "name": "member", "minValue": 4, "maxValue": 6 },
    { "name": "elder", "minValue": 7, "maxValue": 9 },
    { "name": "master", "minValue": 10, "maxValue": 10 }
  ]
}
```

---

## 7. VM Execution

### 7.1 Executor Interface

```python
class VMExecutor:
    """Stateless VM executor - all state passed explicitly."""

    def __init__(self, rulebook: Rulebook): ...

    def step(self, state: VMState) -> VMState:
        """Execute one instruction, return new state."""

    def run_until_yield(self, state: VMState) -> VMState:
        """Execute until YIELD or HALT."""

    def resume(self, state: VMState, input_data: dict) -> VMState:
        """Resume from YIELD with player input."""
```

### 7.2 Step Execution

```
step(state):
  if state.status != "running":
    return state

  frame = state.current_frame
  if frame is None:
    return enter_turn_start(state)

  situation = rulebook.get_situation(frame.location)
  if frame.instruction_pointer >= len(situation.instructions):
    return execute_implicit_pop(state)

  instruction = situation.instructions[frame.instruction_pointer]
  return execute_instruction(state, instruction)
```

### 7.3 Turn Start: Decay, Expiry, and Compel Evaluation

When the stack is empty, the VM enters turn start:

```
enter_turn_start(state):
  # Step 1: Tick decay for all qualifying qualities
  state = tick_decay(state, current_time_unit)

  # Step 2: Check expiry triggers
  state = check_expiry(state, current_trigger)

  # Step 3: Evaluate compels
  compels = rulebook.query_compels(state.qualities, state.cooldowns)
  if compels is not empty:
    # Present highest-urgency compel
    best_compel = compels[0]  # Already sorted by urgency desc
    emit CompelTriggered(best_compel.location, best_compel.urgency)
    state = state.with_cooldowns(
      state.cooldowns.record_activation(best_compel.location, now())
    )
    # Present compel as a situation (player must choose a response)
    return present_compel(state, best_compel)

  # Step 4: Normal situation query
  return enter_query_mode(state)
```

### 7.4 Query Mode

When no compels fire, the VM enters standard query mode:

```
enter_query_mode(state):
  matches = rulebook.query_situations("Situation", state.qualities)
  sorted_matches = sort by predicate_score descending

  emit ChoicesBegin()
  for i, situation in enumerate(sorted_matches):
    emit ChoiceDisplayed(i, situation.location, situation.intro_text)
  emit ChoicesEnd()

  state = state.with_status("waiting_input")
  state = state.with_waiting_context({
    kind: "choice",
    choices: [s.location for s in sorted_matches]
  })
  emit WaitingForInput("choice", state.waiting_context)
  return state
```

### 7.5 Resume from Input

```
resume(state, input_data):
  if state.status != "waiting_input":
    raise VMError("Not waiting for input")

  kind = state.waiting_context["kind"]

  if kind == "choice":
    location = LocationId.parse(input_data["choice"])
    state = state.with_status("running")
    state = state.push_frame(StackFrame(location))
    emit SituationEntered(location)

    # Display tail text
    situation = rulebook.get_situation(location)
    emit TextDisplayed(situation.tail_text, sticky=False)

  return run_until_yield(state)
```

### 7.6 Interjection Resolution

When a situation with `tags` is entered, interjections are resolved:

```
resolve_interjections(state, situation):
  if situation.tags is empty:
    return state

  interjections = rulebook.query_interjections(situation.tags, state.qualities)
  # Already sorted by priority descending

  for interjection in interjections:
    # Inject text directives
    for instruction in interjection.instructions:
      if instruction.opcode == "DISPLAY_TEXT":
        emit InterjectionInjected(interjection.location, instruction.operands.text,
                                  interjection.priority)
      elif instruction.opcode in ("BEGIN_CHOICES", "DISPLAY_CHOICE", "END_CHOICES"):
        # Injected choices are appended to the situation's choice block
        state = execute_instruction(state, instruction)

  return state
```

### 7.7 Decay and Expiry Tick

Processed at the start of each turn:

```
tick_decay(state, time_unit):
  for quality, decl in rulebook.quality_declarations:
    if decl.decay is not None and decl.decay.per == time_unit:
      current = state.qualities.get(quality)
      value = current + decl.decay.amount
      value = apply_declaration_bounds(quality, value)
      if value != current:
        state = state.with_qualities(state.qualities.set("session", quality, value))
        emit QualityDecayed(quality, current, value, decl.decay)
  return state

check_expiry(state, trigger):
  for quality, decl in rulebook.quality_declarations:
    if decl.expires is not None and decl.expires matches trigger:
      current = state.qualities.get(quality)
      if current != 0:
        state = state.with_qualities(state.qualities.set("session", quality, 0))
        emit QualityExpired(quality, current, trigger)
  return state
```

### 7.8 Execution Modes

#### Realtime Mode (In-Memory)

```python
executor = VMExecutor(rulebook)
state = VMState.initial(rulebook)

while True:
    state = executor.run_until_yield(state)

    for event in state.pending_events:
        ui.handle_event(event)
    state = state.clear_events()

    if state.status == "halted":
        break

    user_input = ui.get_input(state.waiting_context)
    state = executor.resume(state, user_input)
```

#### HATEOAS Mode (Stateless Server)

```python
@app.post("/game/{game_id}/action")
async def game_action(game_id: str, input_data: dict):
    state = await storage.load_state(game_id)
    rulebook = await storage.load_rulebook(state.rulebook_id)

    executor = VMExecutor(rulebook)
    state = executor.resume(state, input_data)

    await storage.save_state(game_id, state)

    return {
        "events": [e.to_dict() for e in state.pending_events],
        "status": state.status,
        "waiting": state.waiting_context
    }
```

#### Hybrid Mode

```python
class HybridRunner:
    def __init__(self, rulebook, checkpoint_interval=10):
        self.executor = VMExecutor(rulebook)
        self.checkpoint_interval = checkpoint_interval
        self.steps = 0

    async def step(self, state, input_data=None):
        if input_data:
            state = self.executor.resume(state, input_data)
        else:
            state = self.executor.run_until_yield(state)

        self.steps += 1
        if self.steps >= self.checkpoint_interval:
            await self.checkpoint_to_server(state)
            self.steps = 0

        return state
```

---

## 8. Compilation Target

### 8.1 Compilation Pipeline

```
.ravel files → Parser (SYML) → Analyzer → Codegen → Rulebook (IR)
```

The Analyzer phase now includes:

- **Quality declaration validation**: Check that all quality references resolve to declarations; emit warnings for undeclared qualities
- **Tier validation**: Verify tier ranges are contiguous and non-overlapping
- **Compel/Interjection validation**: Verify `into:` tags reference existing `tags:` in the rulebook
- **Cooldown validation**: Verify cooldown time units are valid

### 8.2 Situation Compilation

Source (`begin.ravel`):

```yaml
intro:
  - Hurrying through the rainswept November night[…], you're glad to see
    the bright lights of the Opera House.
  - {"Wearing Cloak" == 0}The rain drenches you.
  - choice:
    - [Press onward!]You press onward to the entrance.
    - effect:
      - Location = "Foyer"
```

Compiled instructions:

```
SituationDef("begin::intro"):
  concept: "Situation"
  tags: []
  urgency: null
  cooldown: null
  predicates: [Location = "Intro"]
  intro_text: "Hurrying through the rainswept November night..."
  tail_text: "Hurrying through the rainswept November night, you're glad to see the bright lights of the Opera House."
  instructions:
    [0] DISPLAY_TEXT(text="Hurrying through...", sticky=false, predicate=null)
    [1] DISPLAY_TEXT(text="The rain drenches you.", sticky=false,
                     predicate={quality="Wearing Cloak", comparator="=", value=0})
    [2] BEGIN_CHOICES
    [3] DISPLAY_CHOICE(index=0, location="begin::intro::press-onward", text="Press onward!")
    [4] END_CHOICES
    [5] YIELD(kind="choice")

SituationDef("begin::intro::press-onward"):
  concept: "Situation"
  tags: []
  urgency: null
  cooldown: null
  predicates: []
  intro_text: "Press onward!"
  tail_text: "You press onward to the entrance."
  instructions:
    [0] DISPLAY_TEXT(text="You press onward to the entrance.", sticky=false)
    [1] SET_QUALITY(layer="session", quality="Location", value="Foyer")
```

### 8.3 Compel Compilation

Source:

```yaml
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
```

Compiled:

```
SituationDef("port-compels::imperial-inspection"):
  concept: "Compel"
  tags: []
  urgency: "normal"
  cooldown: {count: 3, unit: "watch"}
  predicates: [
    {quality: "Location", comparator: "=", value: "Port"},
    {quality: "Notorious Smuggler", comparator: ">=", value: 3}
  ]
  intro_text: "Imperial customs officers approach."
  tail_text: "They demand to inspect your cargo."
  instructions:
    [0] DISPLAY_TEXT(text="They demand to inspect your cargo.", ...)
    [1] BEGIN_CHOICES
    [2] DISPLAY_CHOICE(index=0, location="..::submit", text="Submit to inspection")
    [3] END_CHOICES
    [4] YIELD(kind="choice")
```

### 8.4 Interjection Compilation

Source:

```yaml
paranoid-commentary:
  - Interjection
  - when:
    - "Notorious Smuggler" >= 5
  - into: social
  - priority: 3
  - Everyone in here is watching you. Or are they?
```

Compiled:

```
InterjectionDef("port-compels::paranoid-commentary"):
  concept: "Interjection"
  into_tag: "social"
  priority: 3
  tags: []
  urgency: null
  cooldown: null
  predicates: [
    {quality: "Notorious Smuggler", comparator: ">=", value: 5}
  ]
  intro_text: ""
  tail_text: ""
  instructions:
    [0] INJECT_TEXT(source="port-compels::paranoid-commentary",
                    text="Everyone in here is watching you. Or are they?",
                    priority=3)
```

---

## 9. Application Ports

### 9.1 Port Interfaces

```python
class VMExecutorPort(Protocol):
    def step(self, state: VMState) -> VMState: ...
    def run_until_yield(self, state: VMState) -> VMState: ...
    def resume(self, state: VMState, input_data: dict) -> VMState: ...

class StateRepositoryPort(Protocol):
    async def load(self, state_id: str) -> VMState: ...
    async def save(self, state_id: str, state: VMState) -> None: ...
    async def delete(self, state_id: str) -> None: ...

class RulebookRepositoryPort(Protocol):
    async def load(self, rulebook_id: str) -> Rulebook: ...
    async def save(self, rulebook_id: str, rulebook: Rulebook) -> None: ...

class EventPublisherPort(Protocol):
    def publish(self, event: VMEvent) -> None: ...
    def subscribe(self, handler: Callable[[VMEvent], None]) -> Subscription: ...
```

---

## 10. Acceptance Tests

### 10.1 Value Object Tests

#### AT-VO-1: QualityValue Arithmetic

```
GIVEN QualityValue(10) and QualityValue(5)
WHEN added together
THEN result is QualityValue(15)

GIVEN QualityValue(10) and QualityValue(3)
WHEN subtracted
THEN result is QualityValue(7)

GIVEN QualityValue("hello") and QualityValue(5)
WHEN added together
THEN TypeError is raised
```

#### AT-VO-2: QualityName Parsing

```
GIVEN raw string "Location"
WHEN parsed as QualityName
THEN canonical name is "Location"

GIVEN raw string '"Wearing Cloak"'
WHEN parsed as QualityName
THEN canonical name is "Wearing Cloak"

GIVEN raw string "[Score]"
WHEN parsed as QualityName
THEN canonical name is "Score"
```

#### AT-VO-3: LocationId Operations

```
GIVEN LocationId(("begin", "intro"))
WHEN qualified_name is accessed
THEN result is "begin::intro"

GIVEN LocationId(("begin", "intro"))
WHEN child("press-onward") is called
THEN result is LocationId(("begin", "intro", "press-onward"))
```

#### AT-VO-4: Expression Evaluation

```
GIVEN Expression(Literal(5))
WHEN evaluated with qualities={}, current_value=0
THEN result is 5

GIVEN Expression(QualityRef("Health"))
WHEN evaluated with qualities={"Health": 75}, current_value=0
THEN result is 75

GIVEN Expression(BinaryOp("+", QualityRef("Score"), Literal(10)))
WHEN evaluated with qualities={"Score": 50}, current_value=0
THEN result is 60

GIVEN Expression(ValueRef())
WHEN evaluated with qualities={}, current_value=42
THEN result is 42
```

#### AT-VO-5: Constraint Application

```
GIVEN Constraint(Min(0)) and value -5
WHEN constraint is applied
THEN result is 0

GIVEN Constraint(Max(100)) and value 150
WHEN constraint is applied
THEN result is 100

GIVEN Constraint(Min(0)) and value 50
WHEN constraint is applied
THEN result is 50 (unchanged)
```

#### AT-VO-6: QualityType Enumeration

```
GIVEN QualityType "identity"
WHEN validated
THEN result is a valid QualityType

GIVEN QualityType "unknown"
WHEN validated
THEN error is raised (invalid type)
```

#### AT-VO-7: TierDef Validation

```
GIVEN TierDef(name="novice", min_value=1, max_value=3)
WHEN validated
THEN result is valid

GIVEN TierDef(name="invalid", min_value=5, max_value=3)
WHEN validated
THEN error is raised (min > max)
```

#### AT-VO-8: QualityDeclaration Validation

```
GIVEN QualityDeclaration with type="reputation" and tiers=[novice:1-3, member:4-6]
WHEN validated
THEN result is valid

GIVEN QualityDeclaration with type="reputation" and tiers=[low:1-5, high:3-8]
WHEN validated
THEN error is raised (overlapping tier ranges)
```

### 10.2 Predicate Tests

#### AT-PR-1: Predicate Evaluation

```
GIVEN Predicate(quality="Location", comparator="=", expression=Literal("Foyer"))
WHEN evaluated with qualities={"Location": "Foyer"}
THEN result is true

GIVEN Predicate(quality="Health", comparator=">", expression=Literal(50))
WHEN evaluated with qualities={"Health": 75}
THEN result is true

GIVEN Predicate(quality="Health", comparator=">", expression=Literal(50))
WHEN evaluated with qualities={"Health": 25}
THEN result is false

GIVEN Predicate(quality="Unknown", comparator="=", expression=Literal(0))
WHEN evaluated with qualities={}
THEN result is true (unset qualities default to 0)
```

#### AT-PR-2: Tier Predicate Evaluation

```
GIVEN TierPredicate(quality="Merchant Guild Standing", tier_name="member")
AND QualityDeclaration with tiers=[novice:1-3, member:4-6, elder:7-9]
AND qualities={"Merchant Guild Standing": 5}
WHEN evaluated
THEN result is true (5 is within member range 4-6)

GIVEN TierPredicate(quality="Merchant Guild Standing", tier_name="elder")
AND qualities={"Merchant Guild Standing": 5}
WHEN evaluated
THEN result is false (5 is not within elder range 7-9)

GIVEN TierPredicate(quality="Undeclared", tier_name="any")
WHEN evaluated
THEN result is false (no declaration found)
```

### 10.3 Stack Operation Tests

#### AT-SO-1: PUSH Instruction

```
GIVEN VMState with empty stack
WHEN PUSH("begin::intro") is executed
THEN stack has one frame with location="begin::intro", ip=0
AND SituationEntered event is emitted
AND StackPushed event is emitted with depth=1
```

#### AT-SO-2: POP Instruction

```
GIVEN VMState with stack=[Frame("begin::intro")]
WHEN POP is executed
THEN stack is empty
AND SituationExited event is emitted
AND StackPopped event is emitted with depth=0
```

#### AT-SO-3: REPLACE Instruction

```
GIVEN VMState with stack=[Frame("begin::intro")]
WHEN REPLACE("foyer::look") is executed
THEN stack has one frame with location="foyer::look", ip=0
AND SituationExited event for "begin::intro" is emitted
AND SituationEntered event for "foyer::look" is emitted
```

#### AT-SO-4: CLEAR Instruction

```
GIVEN VMState with stack=[Frame("a"), Frame("b"), Frame("c")]
WHEN CLEAR is executed
THEN stack is empty
AND three SituationExited events are emitted (c, b, a order)
```

### 10.4 Display Operation Tests

#### AT-DO-1: DISPLAY_TEXT without Predicate

```
GIVEN DISPLAY_TEXT(text="Hello world", sticky=false, predicate=null)
WHEN executed
THEN TextDisplayed event is emitted with text="Hello world", sticky=false
AND instruction pointer advances by 1
```

#### AT-DO-2: DISPLAY_TEXT with Passing Predicate

```
GIVEN DISPLAY_TEXT(text="You have the key", predicate={quality="HasKey", comparator=">=", value=1})
AND qualities={"HasKey": 1}
WHEN executed
THEN TextDisplayed event is emitted
AND instruction pointer advances by 1
```

#### AT-DO-3: DISPLAY_TEXT with Failing Predicate

```
GIVEN DISPLAY_TEXT(text="You have the key", predicate={quality="HasKey", comparator=">=", value=1})
AND qualities={"HasKey": 0}
WHEN executed
THEN no TextDisplayed event is emitted
AND instruction pointer advances by 1
```

#### AT-DO-4: Choice Block Sequence

```
GIVEN instructions:
  [0] BEGIN_CHOICES
  [1] DISPLAY_CHOICE(0, "choice-a", "Go left")
  [2] DISPLAY_CHOICE(1, "choice-b", "Go right")
  [3] END_CHOICES
WHEN executed in sequence
THEN events are emitted in order:
  ChoicesBegin
  ChoiceDisplayed(0, "choice-a", "Go left")
  ChoiceDisplayed(1, "choice-b", "Go right")
  ChoicesEnd
```

#### AT-DO-5: INJECT_TEXT

```
GIVEN INJECT_TEXT(source="compels::paranoid", text="They're watching.", priority=3)
WHEN executed
THEN InterjectionInjected event is emitted with source, text, and priority
AND instruction pointer advances by 1
```

### 10.5 Quality Operation Tests

#### AT-QO-1: SET_QUALITY

```
GIVEN SET_QUALITY(layer="session", quality="Location", expression=Literal("Bar"))
AND qualities.session={"Location": "Foyer"}
WHEN executed
THEN qualities.session={"Location": "Bar"}
AND QualityChanged event is emitted with old="Foyer", new="Bar"
```

#### AT-QO-2: INC_QUALITY

```
GIVEN INC_QUALITY(layer="session", quality="Score", expression=Literal(10))
AND qualities.session={"Score": 50}
WHEN executed
THEN qualities.session={"Score": 60}
AND QualityChanged event is emitted with old=50, new=60
```

#### AT-QO-3: DEC_QUALITY with Constraint

```
GIVEN DEC_QUALITY(layer="session", quality="Health", expression=Literal(30), constraint=Min(0))
AND qualities.session={"Health": 20}
WHEN executed
THEN qualities.session={"Health": 0} (constrained from -10)
AND QualityChanged event is emitted with old=20, new=0
```

#### AT-QO-4: Quality Layer Targeting

```
GIVEN SET_QUALITY(layer="player", quality="Achievement", expression=Literal(1))
AND qualities.player={}
WHEN executed
THEN qualities.player={"Achievement": 1}
AND qualities.session is unchanged
```

#### AT-QO-5: CONSUME_QUALITY with Sufficient Value

```
GIVEN CONSUME_QUALITY(quality="Scouted Route", expression=Literal(1))
AND qualities.session={"Scouted Route": 3}
WHEN executed
THEN qualities.session={"Scouted Route": 2}
AND QualityConsumed event is emitted with amount=1, old=3, new=2
```

#### AT-QO-6: CONSUME_QUALITY with Insufficient Value

```
GIVEN CONSUME_QUALITY(quality="Scouted Route", expression=Literal(2))
AND qualities.session={"Scouted Route": 1}
WHEN executed
THEN qualities.session={"Scouted Route": 1} (unchanged — insufficient)
AND no QualityConsumed event is emitted
```

#### AT-QO-7: CONSUME_QUALITY without Expression (Full Consume)

```
GIVEN CONSUME_QUALITY(quality="Lucky Break", expression=None)
AND qualities.session={"Lucky Break": 1}
WHEN executed
THEN qualities.session={"Lucky Break": 0}
AND QualityConsumed event is emitted with amount=1, old=1, new=0
```

#### AT-QO-8: Declaration Bounds Enforcement

```
GIVEN INC_QUALITY(layer="session", quality="Fuel", expression=Literal(200))
AND QualityDeclaration for Fuel with max=100
AND qualities.session={"Fuel": 50}
WHEN executed
THEN qualities.session={"Fuel": 100} (clamped to declaration max)
```

### 10.6 Control Flow Tests

#### AT-CF-1: BRANCH_IF with True Condition

```
GIVEN BRANCH_IF(predicate={quality="Flag", comparator="=", value=1}, offset=3)
AND qualities={"Flag": 1}
AND current IP=5
WHEN executed
THEN IP becomes 8 (5 + 3)
```

#### AT-CF-2: BRANCH_IF with False Condition

```
GIVEN BRANCH_IF(predicate={quality="Flag", comparator="=", value=1}, offset=3)
AND qualities={"Flag": 0}
AND current IP=5
WHEN executed
THEN IP becomes 6 (5 + 1)
```

#### AT-CF-3: YIELD

```
GIVEN YIELD(kind="choice", context={choices: ["a", "b"]})
AND status="running"
WHEN executed
THEN status becomes "waiting_input"
AND waiting_context is {kind: "choice", choices: ["a", "b"]}
AND WaitingForInput event is emitted
AND IP does NOT advance
```

#### AT-CF-4: HALT

```
GIVEN HALT(reason="game over")
AND status="running"
WHEN executed
THEN status becomes "halted"
AND VMHalted event is emitted with reason="game over"
```

### 10.7 Query Tests

#### AT-QR-1: QUERY_SITUATIONS

```
GIVEN rulebook with situations:
  - "a" with predicates [Location="X"]
  - "b" with predicates [Location="X", Flag>=1]
  - "c" with predicates [Location="Y"]
AND qualities={"Location": "X", "Flag": 1}
WHEN QUERY_SITUATIONS("Situation") is executed
THEN local_state["query_results"] contains ["b", "a"] (b first due to higher score)
AND "c" is not included (predicate fails)
```

#### AT-QR-2: CHECK_PREDICATE True

```
GIVEN CHECK_PREDICATE(predicate={quality="HasKey", comparator=">=", value=1}, jump_if_false=5)
AND qualities={"HasKey": 1}
AND IP=10
WHEN executed
THEN IP becomes 11
```

#### AT-QR-3: CHECK_PREDICATE False

```
GIVEN CHECK_PREDICATE(predicate={quality="HasKey", comparator=">=", value=1}, jump_if_false=5)
AND qualities={"HasKey": 0}
AND IP=10
WHEN executed
THEN IP becomes 15 (10 + 5)
```

#### AT-QR-4: CHECK_TIER True

```
GIVEN CHECK_TIER(quality="Merchant Guild Standing", tier_name="member", jump_if_false=3)
AND QualityDeclaration with tiers=[novice:1-3, member:4-6, elder:7-9]
AND qualities={"Merchant Guild Standing": 5}
AND IP=10
WHEN executed
THEN IP becomes 11
```

#### AT-QR-5: CHECK_TIER False

```
GIVEN CHECK_TIER(quality="Merchant Guild Standing", tier_name="elder", jump_if_false=3)
AND qualities={"Merchant Guild Standing": 5}
AND IP=10
WHEN executed
THEN IP becomes 13 (10 + 3)
```

#### AT-QR-6: QUERY_COMPELS

```
GIVEN rulebook with compels:
  - "inspection" with predicates ["Notorious Smuggler" >= 3], urgency="normal"
  - "ambush" with predicates ["Notorious Smuggler" >= 5], urgency="high"
AND qualities={"Notorious Smuggler": 5}
AND no cooldowns active
WHEN QUERY_COMPELS is executed
THEN local_state["compel_results"] contains ["ambush", "inspection"]
  (ambush first due to higher urgency)
```

#### AT-QR-7: QUERY_COMPELS with Cooldown

```
GIVEN rulebook with compels:
  - "inspection" with predicates ["Notorious Smuggler" >= 3], cooldown=3 watches
AND qualities={"Notorious Smuggler": 5}
AND cooldown for "inspection" was activated 1 watch ago
WHEN QUERY_COMPELS is executed
THEN local_state["compel_results"] is empty (on cooldown)
```

#### AT-QR-8: QUERY_INTERJECTIONS

```
GIVEN rulebook with interjections:
  - "paranoid" with into="social", priority=3, predicates [Paranoia >= 7]
  - "smuggler" with into="trade", priority=1, predicates ["Notorious Smuggler" >= 3]
AND qualities={"Paranoia": 8, "Notorious Smuggler": 4}
AND tags=["social", "trade"]
WHEN QUERY_INTERJECTIONS(tags) is executed
THEN local_state["interjection_results"] contains ["paranoid", "smuggler"]
  (paranoid first due to higher priority)
```

### 10.8 Lifecycle Tests

#### AT-LC-1: TICK_DECAY

```
GIVEN QualityDeclaration for "Hunger" with decay=+1 per watch
AND qualities.session={"Hunger": 3}
WHEN TICK_DECAY(unit="watch") is executed
THEN qualities.session={"Hunger": 4}
AND QualityDecayed event is emitted with old=3, new=4
```

#### AT-LC-2: TICK_DECAY with Bounds

```
GIVEN QualityDeclaration for "Hunger" with decay=+1 per watch, max=10
AND qualities.session={"Hunger": 10}
WHEN TICK_DECAY(unit="watch") is executed
THEN qualities.session={"Hunger": 10} (unchanged, at max)
AND no QualityDecayed event is emitted
```

#### AT-LC-3: CHECK_EXPIRY

```
GIVEN QualityDeclaration for "Scouted Route" with expires=on-location-change
AND qualities.session={"Scouted Route": 2}
WHEN CHECK_EXPIRY(trigger="on-location-change") is executed
THEN qualities.session={"Scouted Route": 0}
AND QualityExpired event is emitted with old=2, trigger="on-location-change"
```

#### AT-LC-4: CHECK_EXPIRY No Match

```
GIVEN QualityDeclaration for "Scouted Route" with expires=on-location-change
AND qualities.session={"Scouted Route": 2}
WHEN CHECK_EXPIRY(trigger="on-use") is executed
THEN qualities.session={"Scouted Route": 2} (unchanged — wrong trigger)
AND no QualityExpired event is emitted
```

### 10.9 Execution Flow Tests

#### AT-EF-1: Empty Stack Enters Turn Start

```
GIVEN VMState with empty stack and status="running"
WHEN step() is called
THEN VM enters turn start (decay/expiry tick, then compel evaluation)
```

#### AT-EF-2: Compel Preempts Situation Query

```
GIVEN VMState with empty stack
AND compel "inspection" matches (predicates pass, not on cooldown)
WHEN step() is called
THEN CompelTriggered event is emitted
AND compel is presented as a situation
AND cooldown is recorded
```

#### AT-EF-3: No Compels Falls Through to Query

```
GIVEN VMState with empty stack
AND no compels match
WHEN step() is called
THEN VM enters query mode
AND matching situations are displayed as choices
AND status becomes "waiting_input"
```

#### AT-EF-4: Resume from Choice

```
GIVEN VMState with status="waiting_input"
AND waiting_context={kind: "choice", choices: ["begin::intro"]}
WHEN resume(state, {choice: "begin::intro"}) is called
THEN stack contains Frame("begin::intro")
AND SituationEntered event is emitted
AND status becomes "running"
AND execution continues until next YIELD
```

#### AT-EF-5: End of Situation Pops Frame

```
GIVEN VMState with stack=[Frame("a", ip=5)]
AND situation "a" has 5 instructions (indices 0-4)
WHEN step() is called with ip=5 (past end)
THEN frame is popped
AND SituationExited event is emitted
```

#### AT-EF-6: run_until_yield Executes Multiple Steps

```
GIVEN VMState at start of situation with 3 instructions then YIELD
WHEN run_until_yield() is called
THEN all 3 instructions execute
AND YIELD is executed
AND status is "waiting_input"
```

#### AT-EF-7: Interjection Resolution on Tagged Situation

```
GIVEN situation "guild-hall" with tags=["social", "trade"]
AND interjection "paranoid-commentary" with into="social", priority=3
AND interjection predicates pass
WHEN situation "guild-hall" is entered
THEN InterjectionInjected event is emitted with paranoid-commentary content
AND interjection text appears after situation text
```

### 10.10 Serialization Tests

#### AT-SR-1: Rulebook Round-Trip

```
GIVEN a compiled Rulebook with quality declarations, compels, and interjections
WHEN serialized to JSON
AND deserialized back
THEN resulting Rulebook is equivalent to original
AND all situations, predicates, instructions, quality declarations are preserved
AND interjection_index is preserved
```

#### AT-SR-2: VMState Round-Trip

```
GIVEN a VMState with:
  - stack with 2 frames
  - qualities in multiple layers
  - cooldowns with entries
  - status="waiting_input"
  - waiting_context with choices
WHEN serialized to JSON
AND deserialized back
THEN resulting VMState is equivalent to original
AND execution can continue correctly
```

#### AT-SR-3: Expression Serialization

```
GIVEN Expression(BinaryOp("+", QualityRef("A"), BinaryOp("*", Literal(2), ValueRef())))
WHEN serialized to JSON
AND deserialized back
THEN expression evaluates identically to original
```

### 10.11 Quality Layer Tests

#### AT-QL-1: Layer Resolution Order

```
GIVEN QualityState with:
  - global: {"A": 1}
  - player: {"A": 2}
  - session: {"A": 3}
  - location: {"A": 4}
WHEN get("A") is called
THEN result is 4 (location layer wins)
```

#### AT-QL-2: Layer Resolution Fallthrough

```
GIVEN QualityState with:
  - global: {"A": 1}
  - player: {}
  - session: {}
  - location: {}
WHEN get("A") is called
THEN result is 1 (falls through to global)
```

#### AT-QL-3: Layer Write Isolation

```
GIVEN QualityState with session={"A": 1}, player={}
WHEN set("session", "A", 5) is called
THEN session={"A": 5}
AND player={} (unchanged)
```

### 10.12 Integration Tests

#### AT-INT-1: Cloak of Darkness Intro (Backward Compatibility)

```
GIVEN compiled Cloak of Darkness rulebook (no quality declarations)
AND fresh VMState
WHEN executed until first YIELD
THEN events include:
  - ChoicesBegin
  - ChoiceDisplayed for "begin::intro"
  - ChoicesEnd
  - WaitingForInput(kind="choice")
AND qualities include Location="Intro", "Wearing Cloak"=1
AND compiler emitted warnings for undeclared qualities
```

#### AT-INT-2: Cloak of Darkness Choice Navigation

```
GIVEN VMState after intro display
WHEN resume with choice="begin::intro"
AND resume with choice="begin::intro::press-onward"
THEN qualities include Location="Foyer"
AND next YIELD shows foyer situations
```

#### AT-INT-3: State Persistence Across Execution

```
GIVEN VMState mid-execution
WHEN serialized
AND server restarted
AND deserialized
AND execution resumed
THEN narrative continues correctly
AND no events are lost or duplicated
```

#### AT-INT-4: Predicate Conditional Text

```
GIVEN situation with conditional text:
  - DISPLAY_TEXT("You have the cloak", predicate={"Wearing Cloak" >= 1})
AND qualities={"Wearing Cloak": 0}
WHEN situation executes
THEN conditional text is NOT displayed

WHEN qualities changed to {"Wearing Cloak": 1}
AND situation re-executes
THEN conditional text IS displayed
```

#### AT-INT-5: Compel-to-Situation Flow

```
GIVEN smuggler's port rulebook with compel "imperial-inspection"
AND qualities with "Notorious Smuggler"=3, Location="Port"
AND fresh VMState (no cooldowns)
WHEN turn starts
THEN CompelTriggered event is emitted for "imperial-inspection"
AND compel choices are presented
WHEN player selects "Submit to inspection"
THEN Fuel decreases by 5
AND "Merchant Guild Standing" increases by 1
AND next turn proceeds to normal situation query
```

#### AT-INT-6: Interjection Injection into Tagged Situation

```
GIVEN smuggler's port rulebook
AND qualities with "Notorious Smuggler"=5, "Merchant Guild Standing"=2, Location="Port"
WHEN player enters "guild-hall" situation (tags: [trade, social])
THEN "smuggler-deal" interjection injects a choice (into: trade)
AND "paranoid-commentary" does not inject (requires Paranoia >= 7, not present)
```

#### AT-INT-7: Consume and Expiry Lifecycle

```
GIVEN "Scouted Route" declared as situation type, expires=on-location-change, max-stack=3
AND qualities with "Scouted Route"=2
WHEN consume "Scouted Route" 1 is executed
THEN "Scouted Route" becomes 1
AND QualityConsumed event is emitted

WHEN location changes
THEN "Scouted Route" becomes 0
AND QualityExpired event is emitted
```

---

## 11. Glossary

| Term                    | Definition                                                                        |
| ----------------------- | --------------------------------------------------------------------------------- |
| **Compel**              | System-initiated storylet surfaced when quality conditions warrant a complication |
| **Consume**             | Lifecycle-aware quality spend that is atomic and emits dedicated events           |
| **Cooldown**            | Minimum time between activations of a compel                                      |
| **Decay**               | Automatic periodic change to a quality's value                                    |
| **Expiry**              | Automatic zeroing of a quality when a trigger condition is met                    |
| **Frame**               | Stack entry for active situation execution                                        |
| **Instruction**         | Atomic VM operation                                                               |
| **Interjection**        | Content fragment injected into a tagged situation when quality conditions are met |
| **Layer**               | Quality state scope (global/session/player/location)                              |
| **Location**            | Unique situation identifier (`rulebook::situation::choice`)                       |
| **Predicate**           | Condition testing quality state                                                   |
| **Quality**             | Declared, typed variable in narrative state                                       |
| **Quality Declaration** | Metadata defining a quality's type, bounds, and lifecycle                         |
| **Rulebook**            | Compiled story (situations + quality declarations + metadata)                     |
| **Situation**           | Narrative unit with predicates, text, and instructions                            |
| **Tier**                | Named value range within a quality, producing distinct narrative effects          |
| **Urgency**             | Priority level for compels (low/normal/high/critical)                             |
| **Yield**               | VM pause waiting for external input                                               |

---

## 12. Version History

| Version | Date | Changes                                                                                                                                                                                                                                                                  |
| ------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0.1     | 2025 | Initial specification draft                                                                                                                                                                                                                                              |
| 0.2     | 2026 | Quality declarations, types, tiers; Compel and Interjection concepts; CONSUME_QUALITY, CHECK_TIER, QUERY_COMPELS, QUERY_INTERJECTIONS, INJECT_TEXT, TICK_DECAY, CHECK_EXPIRY opcodes; lifecycle events; compel evaluation and interjection resolution in execution model |

---

_This specification defines the Ravel Narrative VM, designed for Clean Architecture and Domain-Driven Design principles. Version 0.2 integrates findings from FATE RPG research (compel economy, aspect taxonomy) and Kennedy's resource narrative critique._

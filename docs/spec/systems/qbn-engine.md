# QBN Engine

> The narrative operating system. All game state is qualities; all content is storylets.

## Overview

Quality-Based Narrative (QBN) is the engine that drives every interaction in the game. Rather than scripted quest lines, the game presents **storylets** — self-contained narrative units that become available when the player's **qualities** (numeric values representing state) meet specific thresholds. Storylets modify qualities, which unlocks new storylets, creating an emergent narrative unique to each player.

This is the foundation that Failbetter Games built for Fallen London and Sunless Skies. Our adaptation extends it with the yarnball meter system and faction-specific behaviors.

## Core Design

### Qualities

_TODO: Define quality types, value ranges, visibility rules_

- Player qualities (stats, skills, reputation)
- Ship qualities (condition, cargo, module state)
- Crew qualities (mood, loyalty, skill)
- World qualities (faction state, economic conditions)
- Meter qualities (yarnball: hunger, loneliness, boredom, etc.)

### Storylets

_TODO: Define storylet structure, availability rules, outcomes_

- Availability conditions (quality gates)
- Urgency/priority system
- Outcome branches and quality modifications
- Sticky vs. one-shot storylets
- Location-gated vs. universal storylets

### The Ravel Language

_TODO: Integrate existing Ravel spec from notes/qbn/_

Existing spec: `docs/game-design/notes/qbn/RAVEL_LANGUAGE_SPEC.md`

### Quality-Based Gating Patterns

_TODO: Integrate patterns from Emily Short's analysis and QBN pattern docs_

Existing docs:

- `docs/game-design/notes/qbn/QBN Structures and Patterns.md`
- `docs/game-design/notes/qbn/QBN System Design and Narrative Patterns.md`
- `docs/game-design/notes/emily_short_five_elements_abstracted.md`

## Connections

- **Yarnball**: Meter values are qualities; module effects are quality modifiers
- **Economy**: Currency, cargo, trade state are all qualities
- **Factions**: Reputation is a quality; faction storylets gate on it
- **Combat**: Combat encounters are storylets with quality-gated outcomes
- **All systems**: Everything talks through QBN

## Open Questions

- How do we handle storylet authoring at scale for an MMO?
- What's the right balance between hand-authored and procedurally generated storylets?
- How does multiplayer state map to qualities? (shared vs. per-player)
- Performance: how do we evaluate thousands of availability checks efficiently?

## Sources

- `docs/game-design/notes/qbn/` — existing QBN specs and patterns
- `docs/game-design/notes/emily_short_five_elements_abstracted.md`
- `docs/game-design/notes/emily short procedural generation elements.md`
- Failbetter Games / Fallen London — QBN originator
- Alexis Kennedy — resource narrative philosophy

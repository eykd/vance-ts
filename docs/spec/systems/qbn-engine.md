# QBN Engine

> The narrative operating system. All game state is qualities; all content is storylets.

## Overview

Quality-Based Narrative (QBN) is the engine that drives every interaction in the game. Rather than scripted quest lines, the game presents **storylets** — self-contained narrative units that become available when the player's **qualities** (numeric values representing state) meet specific thresholds. Storylets modify qualities, which unlocks new storylets, creating an emergent narrative unique to each player.

This is the foundation that Failbetter Games built for Fallen London and Sunless Skies. Our adaptation extends it with the yarnball meter system and faction-specific behaviors.

## Core Design

### The Fractal Principle

Everything in the game — characters, ships, factions, locations, abstract threats — is modeled with the same quality/storylet framework. A faction's "Militant" quality works the same way as a character's "Aggressive" quality or a location's "Dangerous" quality. This is borrowed from FATE's Bronze Rule ("anything can be treated like a character") but expressed through typed numeric qualities rather than free-form text aspects.

The fractal reduces cognitive load (one interaction model at every scale) and enables emergent cross-scale interactions: a faction's rising "Paranoia" quality can gate storylets that affect crew morale, which affects ship meters, which gates player encounter options — all through the same quality/storylet mechanism.

Source: [FATE RPG research](../../research/2026-03-23_fate-rpg-qbn-lessons/synthesis.md) — the fractal principle

### Quality Taxonomy

Not all qualities are equal. Early QBN (and FATE) made the mistake of treating all qualities/aspects as interchangeable, which "erases potentially useful distinctions" (Kennedy). Qualities must be **typed** with different behaviors:

| Type            | Lifespan            | Behavior                                               | Examples                                               |
| --------------- | ------------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| **Identity**    | Permanent           | Defines who/what something is; rarely changes          | Captain traits, ship class, faction alignment          |
| **Resource**    | Scarce, tradeable   | Consumed and replenished; drives economic pressure     | Fuel, food, currency, cargo                            |
| **Meter**       | Continuous, ticking | Rises/falls over time; creates yarnball pressure       | Hunger, loneliness, boredom, filth                     |
| **Reputation**  | Slow-moving         | Changes through observed actions; gates social access  | Faction standing, notoriety, trust                     |
| **Consequence** | Multi-session decay | Imposed by events; heals over time                     | Ship damage, crew injury, legal trouble                |
| **Situation**   | Scene-duration      | Created by circumstances; expires when context changes | "Scouted the route", "storm warning", "docked at port" |
| **Momentum**    | One-shot            | Gained and spent in a single interaction               | Prep bonuses, lucky breaks, temporary advantages       |

Each type interacts differently with storylets. Identity qualities gate large storylet pools. Resources create economic storylets. Meters generate yarnball pressure storylets. Consequences create recovery arcs. Situations enable prep-and-payoff chains. Momentum rewards tactical play.

Source: FATE's five aspect lifespans + Kennedy's critique of undifferentiated qualities

### Qualities as Active Agents

Qualities should not be passive gates that merely lock/unlock storylets. High-value qualities should **inject themselves** into other storylets — adding commentary, alternative options, or complications. A "Paranoid" quality shouldn't just unlock paranoia storylets; it should insert paranoid interpretation options into trade negotiations, crew conversations, and faction encounters.

This pattern comes from Disco Elysium, where skills function as autonomous narrative voices that interject during dialogue. In QBN terms: storylets check not just "does the player qualify?" but "which of the player's strong qualities want to comment on this situation?"

_TODO: Define the injection/interjection mechanic in Ravel_

Source: [FATE research — Disco Elysium pattern](../../research/2026-03-23_fate-rpg-qbn-lessons/synthesis.md)

### Quality Ownership

_TODO: Define quality scoping and visibility rules_

The fractal means qualities exist on every entity:

- Player qualities (stats, skills, reputation, traits)
- Ship qualities (condition, cargo, module state, meters)
- Crew qualities (mood, loyalty, skill, personality)
- Faction qualities (power, paranoia, militancy, wealth)
- Location qualities (danger, prosperity, law level, culture)
- World qualities (economic conditions, political climate)

### Storylets

_TODO: Define storylet structure, availability rules, outcomes_

- Availability conditions (quality gates)
- Urgency/priority system
- Outcome branches and quality modifications
- Sticky vs. one-shot storylets
- Location-gated vs. universal storylets

### Compel Storylets (System-Initiated Complications)

The engine should proactively surface **compel storylets** — complications tied to the player's own qualities that offer a reward for accepting a setback. This is the QBN equivalent of FATE's compel mechanic, but automated: the designer authors the compel; the engine decides when to present it.

Example: A player with high "Notorious Smuggler" identity quality docks at a lawful port. The engine surfaces a compel storylet: _"Imperial customs officers recognize your vessel. They propose a thorough inspection — losing a day and some cargo — or you can attempt to bribe them."_ Accepting the inspection costs time and goods (meter ticks, resource loss) but earns faction standing or avoids worse consequences.

Key design rules for compels:

- **Every important quality must gate both beneficial AND complicating storylets.** The engine enforces the dual-edge that FATE players struggle to self-impose. "Notorious Smuggler" unlocks lucrative black-market jobs AND attracts imperial attention.
- **Compel rewards must be diegetic** — in-world resources, not meta-currency. The player earns fuel, reputation, information, or meter relief, not abstract "fate points."
- **The player always has a choice.** Compels present options, not punishments. Refusing a compel should have a cost (spend resources to avoid the complication) but should never feel unfair.

Source: [FATE research — compel economy](../../research/2026-03-23_fate-rpg-qbn-lessons/synthesis.md)

### Prep-and-Payoff Chains

Storylets can create **situation qualities** that are consumed by later storylets, creating a two-phase tactical loop: prepare, then exploit.

Example: "Scout the asteroid field" storylet creates a "Mapped Asteroid Field" situation quality. A later "Navigate the shortcut" storylet consumes it for a safe passage that would otherwise be risky. The situation quality expires if you leave the system without using it.

Rules:

- Situation qualities stack within limits (prevent infinite prep)
- First use of a situation quality is "free" (bonus); subsequent uses cost resources
- Unused situation qualities decay when context changes

Source: FATE's maneuver mechanic / Diaspora's "one tag per scope" rule

### Tiered Quality Potency

Quality values should produce **diverse effects at different thresholds**, not uniform bonuses. Low values provide narrative color; medium values unlock standard options; high values unlock transformative branches.

Example for "Reputation: Merchant Guild":

- 1-3: NPCs acknowledge your membership (flavor text)
- 4-6: Access to guild job boards and discounted docking
- 7-9: Can call in favors, access restricted trade routes
- 10+: Guild politics storylets, leadership opportunities, enemies

This prevents the "all qualities feel the same" anti-pattern identified in both FATE (+2 treadmill) and early QBN (Kennedy's critique).

Source: FATE System Toolkit's scaled invocation

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
- How exactly should the quality-injection mechanic work in Ravel? (Disco Elysium pattern)
- What's the right compel frequency? Too many = annoying; too few = no pressure
- Should players ever author qualities? (FATE research says no — exploit vector in MMO)
- How do situation qualities interact across scales? (fractal implications)

## Sources

- `docs/game-design/notes/qbn/` — existing QBN specs and patterns
- `docs/game-design/notes/emily_short_five_elements_abstracted.md`
- `docs/game-design/notes/emily short procedural generation elements.md`
- Failbetter Games / Fallen London — QBN originator
- Alexis Kennedy — resource narrative philosophy, quality-type critique
- `docs/research/2026-03-23_fate-rpg-qbn-lessons/synthesis.md` — fractal principle, quality taxonomy, compels, prep-and-payoff, tiered potency
- Disco Elysium — qualities as active agents pattern

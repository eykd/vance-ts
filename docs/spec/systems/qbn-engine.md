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

In Ravel, this is implemented as **Interjections** — a third concept type alongside Situations and Compels. When the player enters a tagged situation, the engine scans for Interjection definitions whose predicates pass and whose tags match the host situation. Qualifying interjections inject additional choice options, commentary text, or alternative interpretations into the host situation. Interjections have a `priority` field for ranking when multiple qualities compete to comment.

Example: A "Trade Negotiation" situation tagged `[trade, social]` is entered. The player has `Paranoia >= 7`. An Interjection gated on `Paranoia >= 5` with tag `social` injects an additional choice: _"You notice the merchant's eyes flicker toward the door. Something about this deal feels wrong."_ — offering a paranoid exit option that wouldn't exist for a trusting captain.

Source: [FATE research — Disco Elysium pattern](../../research/2026-03-23_fate-rpg-qbn-lessons/synthesis.md)

### Quality Ownership

The fractal means qualities exist on every entity. The Ravel VM implements a **4-layer scoping model** with precedence resolution that maps naturally to game entities:

| Layer      | Scope                          | Persistence               | Default Write |
| ---------- | ------------------------------ | ------------------------- | ------------- |
| `global`   | World constants, shared state  | Read-only at runtime      | No            |
| `player`   | Player profile across sessions | Persistent                | No            |
| `session`  | Current playthrough state      | Ephemeral (per session)   | Yes (default) |
| `location` | Frame-local, situation-scoped  | Cleared on context change | No            |

**Resolution order**: `location → session → player → global → 0` (unset qualities default to 0).

**Entity-to-layer mapping**: The four Ravel layers cover the core cases, but the fractal principle means qualities also live on non-player entities. These map to the layer model through namespacing:

- **Player qualities** (stats, skills, reputation, traits) → `player` + `session` layers
- **Ship qualities** (condition, cargo, module state, meters) → `session` layer, namespaced (e.g., `Ship.FuelLevel`, `Ship.HullCondition`)
- **Crew qualities** (mood, loyalty, skill, personality) → `session` layer, namespaced per crew member (e.g., `Crew.Mara.Loneliness`, `Crew.Jax.Loyalty`)
- **Faction qualities** (power, paranoia, militancy, wealth) → `global` layer for shared MMO state; `player` layer for per-player faction standing
- **Location qualities** (danger, prosperity, law level, culture) → `global` layer (world-gen derived) + `location` layer for visit-specific state
- **World qualities** (economic conditions, political climate) → `global` layer, updated by server-side economic simulation

**Write targeting**: By default, quality writes go to the `session` layer. Explicit layer targeting uses `@layer.Quality` syntax:

```yaml
effect:
  - Location = "Bar"              # session (default)
  - @player.Achievement = 1       # player layer (persistent)
  - @location.Visited += 1        # location layer (frame-scoped)
```

**Visibility rules**: Not all qualities should be exposed to the player. The design principle: players see effects through narrative, not raw numbers.

- **Exposed** (player sees values): Resources (fuel, credits, cargo), Meters (hunger, boredom — via crew chatter and UI indicators), Reputation (faction standing tiers, not raw numbers)
- **Partially exposed** (player sees effects, not internals): Consequences (injury effects visible, healing progress shown narratively), Identity (expressed through storylet availability, not stat screens)
- **Hidden** (designer-only): Situation qualities (prep-and-payoff state), Momentum (consumed immediately), internal story flags, faction AI qualities

For exposed qualities, names must be diegetic: "Notoriety" not "Flag7"; "Guild Standing" not "FactionRep_03".

### Storylets

A storylet is a self-contained narrative unit with quality-gated availability, branching outcomes, and quality-modifying effects. Storylets are the atoms of content — everything the player experiences is a storylet or part of one.

#### Storylet Structure (Ravel `SituationDef`)

Each compiled storylet has:

```
SituationDef = {
  location:     LocationId,           # Hierarchical path (e.g., "port::tavern::rumor")
  concept:      "Situation" | "Compel" | "Interjection",
  predicates:   list[Predicate],      # All must pass for availability
  intro_text:   str,                  # Displayed when storylet activates
  tail_text:    str,                  # Displayed after resolution
  instructions: list[Instruction],    # Outcome logic (quality changes, branching)
  tags:         list[str],            # For filtering and interjection targeting
  urgency:      "low" | "normal" | "high" | "critical" | None,
  cooldown:     CooldownSpec | None   # Prevents re-triggering too soon
}
```

#### Three Concept Types

- **Situation**: Standard player-facing storylet. Surfaces when predicates pass; player selects from available situations.
- **Compel**: System-initiated complication tied to Identity/Reputation qualities (see Compel Storylets below). Evaluated first each turn, before regular situations. Uses urgency levels to interrupt normal flow.
- **Interjection**: A quality's "voice" that injects itself into an active situation. When a player enters a tagged situation, the engine checks for interjections whose predicates pass and whose tags match; qualifying interjections add options, commentary, or alternative interpretations to the host situation.

#### Availability Rules

A storylet is available when **all** its predicates pass against the current quality state. Predicates test quality values against thresholds:

```yaml
when:
  - Location == "Tavern"
  - Nightfall == True
  - Suspicion < 3
  - Reputation: Merchant Guild >= 4
```

**Predicate scoring**: When multiple storylets are available, those with more predicates rank higher — a storylet gated on 5 qualities is more specific (and therefore more relevant) than one gated on 2. This is the engine's primary relevance-ranking mechanism.

**Urgency levels** override predicate scoring for compels and high-priority events:

| Urgency    | Behavior                                                                 |
| ---------- | ------------------------------------------------------------------------ |
| `critical` | Forces immediate presentation; interrupts current activity               |
| `high`     | Presented before normal storylets; player must address before proceeding |
| `normal`   | Standard presentation alongside other available storylets                |
| `low`      | Background option; available but not highlighted                         |

**Cooldowns** prevent over-triggering: a storylet with `cooldown: {count: 3, unit: "turn"}` cannot fire again for 3 turns after its last activation.

#### Presentation Patterns

How available storylets reach the player:

- **List selection**: All qualifying storylets presented as a menu. Used for port activities, dialogue options, and other moments where the player surveys their options.
- **Card draw / opportunity deck**: A random subset of qualifying storylets presented as "encounters." Used for inter-jump events, random encounters, and the Beyond's surprises. The deck metaphor controls pacing — not everything available is presented every turn.

The choice between list and deck is per-context: ports use lists (player is browsing), travel uses decks (events happen to the player).

#### Outcome Branches

Each storylet contains branching logic via Ravel instructions. Outcomes modify qualities and can push new situations onto the stack:

- **Direct effects**: `Fuel -= 10`, `Reputation: Smugglers += 2`
- **Conditional branches**: Different outcomes based on quality checks at resolution time (e.g., crew skill check determines success/failure branch)
- **Stack manipulation**: Outcomes can push nested situations (entering a multi-step encounter), pop back to a parent (completing a sub-task), or clear the stack (resolving a major event)

#### Sticky vs. One-Shot Storylets

- **Sticky** (repeatable): Remain available as long as predicates pass. Used for routine activities — visiting the tavern, checking the job board, talking to a crew member. Most storylets are sticky.
- **One-shot**: After firing once, an exclusion quality prevents re-activation. Used for unique discoveries, key narrative moments, and quest milestones. Implemented via a "Mark of Cain" pattern: the storylet's outcome sets a quality that its own predicates exclude.
- **Limited**: Fire N times, then lock out. Used for exhaustible resources and diminishing-returns content (e.g., a contact who has three favors to give).

#### Location-Gated vs. Universal Storylets

- **Location-gated**: Require a specific `Location` quality value. "Tavern brawl" only fires in taverns. These form the local texture of each place.
- **Universal**: No location predicate. "Crew argument about food" can fire anywhere the crew is together. These form the portable narrative layer.
- **Region-gated**: Require a location within a set (e.g., any Oikumene port, any Beyond system). These capture regional character without tying to a single place.

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

Ravel is the domain-specific language for authoring QBN content. It compiles to a serializable Intermediate Representation (IR) executed by the Ravel VM. Full specifications:

- **Language spec**: `docs/game-design/notes/qbn/RAVEL_LANGUAGE_SPEC.md` — syntax, quality declarations, situation definitions
- **VM spec**: `docs/game-design/notes/qbn/RAVEL_VM_SPEC.md` — execution model, layered quality state, instruction set

#### Key Design Principles

- **Declarative**: Stories are authored as collections of situations with predicates, not imperative scripts. The engine decides what to present based on state.
- **Quality-driven flow**: Progression happens through testing and modifying qualities, not through explicit scene transitions.
- **Modular composition**: Multiple `.ravel` files with include directives. Quality declarations merge across files. This enables team authoring and content packs.
- **Human-readable YAML syntax**: Content authors (not just programmers) can write storylets.

#### Authoring Example

```yaml
quality:
  Suspicion:
    type: meter
    min: 0
    max: 10
    decay: { amount: -1, per: turn }
    tiers:
      - { name: "unnoticed", min: 0, max: 2 }
      - { name: "watched", min: 3, max: 6 }
      - { name: "hunted", min: 7, max: 10 }

situation "Customs Inspection":
  when:
    - Location == "Starport"
    - Suspicion is "watched"       # Tier predicate
    - Contraband > 0
  intro: |
    A customs officer studies your cargo manifest with theatrical care.
  choice "Submit to inspection":
    effect:
      - Contraband -= Contraband   # Lose all contraband
      - Suspicion -= 3
    tail: "The officer confiscates your goods with a satisfied nod."
  choice "Offer a bribe":
    when:
      - Credits >= 500
    effect:
      - Credits -= 500
      - Suspicion -= 1
      - @player.BriberyRecord += 1
    tail: "The officer pockets the credits and waves you through."
```

#### Execution Model

The Ravel VM is a **pushdown automaton** with a stack of frames:

1. Each turn: decay and expiry tick first, then compels evaluated, then qualifying situations queried
2. Player choices manipulate the stack (push nested situations, pop completed ones)
3. All operations emit events for the presentation layer (UI, prestoplot text rendering)
4. Interjections resolve when entering tagged situations — strong qualities inject their "voice"

The VM is **stateless and reconstructible**: game state can be captured and restored at any point, which is essential for the Cloudflare Workers architecture (request-response, not long-lived processes).

### Quality-Based Gating Patterns

Canonical patterns for structuring QBN content, synthesized from Failbetter practice, Emily Short's analysis, and FATE research. Full pattern documentation in `docs/game-design/notes/qbn/QBN Structures and Patterns.md` and `docs/game-design/notes/qbn/QBN System Design and Narrative Patterns.md`.

#### Structural Patterns

| Pattern                        | Mechanism                                                                                                              | Game Use                                             |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Gauntlet** (linear sequence) | Progress quality increments through stages; fail-condition qualities (menaces) can divert to failure branches          | Tutorial sequences, faction initiation rites         |
| **Branch-and-Bottleneck**      | Choice sets a quality flag; branches diverge then reconverge at a required quality threshold                           | Multi-path quests that reach the same destination    |
| **Sorting Hat**                | Early choice sets a permanent Identity quality that gates large storylet pools for the rest of the game                | Starting faction choice, captain background          |
| **Parallel Objectives**        | Multiple independent progress qualities; finale requires all above threshold                                           | Gathering resources/allies before a major expedition |
| **Storylet Chains**            | Mini-narrative arcs using a chain-specific progress counter; each link is a storylet gated on the counter              | Multi-stop delivery quests, investigation arcs       |
| **Loops and Cycles**           | Progress quality resets after reaching a cap, but a separate "cycle count" quality persists; each loop changes context | Seasonal trade cycles, recurring faction crises      |

#### Pacing Patterns

| Pattern                        | Mechanism                                                                             | Game Use                                  |
| ------------------------------ | ------------------------------------------------------------------------------------- | ----------------------------------------- |
| **Opportunity Deck**           | Random draw from qualifying storylets; deck size controls encounter density           | Inter-jump events, Beyond exploration     |
| **One-Shot / Mark of Cain**    | Storylet sets an exclusion quality on first fire; own predicates exclude that quality | Unique discoveries, first-contact moments |
| **Grinding with Diminishment** | Repeatable storylet with escalating difficulty or diminishing returns per repetition  | Skill training, resource extraction       |
| **Geographic Unlock**          | Location quality gates regional storylet pools; entering a region "opens" its content | Oikumene vs. Beyond content separation    |

#### Prep-and-Payoff Chains (detailed)

The two-phase tactical loop using Situation qualities (see also §Prep-and-Payoff Chains above):

1. **Prep storylet**: Creates a Situation quality (e.g., "Mapped Asteroid Field")
2. **Payoff storylet**: Consumes the Situation quality for a bonus outcome
3. **Decay**: Unused Situation qualities expire on context change (leaving the system)
4. **Stacking limits**: `max_stack` prevents infinite prep accumulation
5. **Diminishing returns**: First use is free; subsequent uses of the same prep type cost resources

#### Emily Short's Five Elements (Location Atmosphere)

Procedural generation of location atmosphere uses five abstract scores mapped from Emily Short's Sunless Skies elements:

| Element      | Abstract Score | What It Drives                                                   | Scale |
| ------------ | -------------- | ---------------------------------------------------------------- | ----- |
| Salt (Peril) | **Peril**      | Danger, combat likelihood, hazard encounters                     | 0–100 |
| Venom        | **Isolation**  | Hostility, mistrust, alienation; affects social storylet gates   | 0–100 |
| Mushroom     | **Wonder**     | Mystery, strangeness, discovery; triggers exploration storylets  | 0–100 |
| Beeswax      | **Community**  | Cooperation, societal cohesion; affects trade and faction access | 0–100 |
| Egg          | **Mundanity**  | Familiarity, routine, stability; reduces encounter frequency     | 0–100 |

These scores are set during galaxy generation and stored as Location qualities. They gate regional storylet pools: a high-Wonder, low-Mundanity system offers exploration and discovery storylets; a high-Community, low-Peril system offers trade and social storylets.

Source: `docs/game-design/notes/emily_short_five_elements_abstracted.md`

## Connections

- **Yarnball**: Meter values are qualities; module effects are quality modifiers
- **Economy**: Currency, cargo, trade state are all qualities
- **Factions**: Reputation is a quality; faction storylets gate on it
- **Combat**: Combat encounters are storylets with quality-gated outcomes
- **Prestoplot**: Text rendering layer beneath QBN. Storylets decide what happens; prestoplot renders the prose. Operates in two modes: (1) **direct rendering** — grammar templates produce player-facing text deterministically from a seed, and (2) **LLM prompt generation** — grammar templates produce structured prompts that an LLM expands into richer narrative. Quality state can parameterize grammar selection and seed derivation.
- **All systems**: Everything talks through QBN

## Open Questions

- How do we handle storylet authoring at scale for an MMO?
- What's the right balance between hand-authored and procedurally generated storylets?
- ~~How does multiplayer state map to qualities? (shared vs. per-player)~~ **Resolved**: 4-layer model — `global` for shared world state (faction power, market prices), `player` for persistent per-player state (reputation, achievements), `session` for current playthrough (ship state, active quests), `location` for frame-scoped state.
- Performance: how do we evaluate thousands of availability checks efficiently?
- ~~How exactly should the quality-injection mechanic work in Ravel? (Disco Elysium pattern)~~ **Resolved**: Interjection concept type — tagged situations trigger interjection evaluation; qualifying interjections inject options/commentary based on strong qualities. Priority field ranks competing interjections.
- What's the right compel frequency? Too many = annoying; too few = no pressure. Cooldown specs provide the tuning knob.
- ~~Should players ever author qualities? (FATE research says no — exploit vector in MMO)~~ **Resolved**: No. Players express themselves through choices within authored storylets. Quality creation is designer-only.
- How do situation qualities interact across scales? (fractal implications — e.g., can a faction-level Situation quality gate a player-level storylet?)

## Sources

- `docs/game-design/notes/qbn/` — existing QBN specs and patterns
- `docs/game-design/notes/emily_short_five_elements_abstracted.md`
- `docs/game-design/notes/emily short procedural generation elements.md`
- Failbetter Games / Fallen London — QBN originator
- Alexis Kennedy — resource narrative philosophy, quality-type critique
- `docs/research/2026-03-23_fate-rpg-qbn-lessons/synthesis.md` — fractal principle, quality taxonomy, compels, prep-and-payoff, tiered potency
- Disco Elysium — qualities as active agents pattern

# Yarnball

> Interlocking meters that generate emergent narrative through player tradeoffs.

## Overview

The yarnball is Craig Perko's metaphor for game systems that are "big, soft, messy challenges" — interlocking meters and modular systems that generate emergent narrative through player choices. Instead of binary pass/fail survival, the yarnball creates a web of competing pressures where managing one thread tightens another, and the resulting tradeoffs _are_ the story.

> "My goal is to turn survival into a yarnball. A soft, complicated challenge that interlaces with a lot of other things. I also want to make sure that it unfolds into a narrative according to the choices the player makes."
> — Perko, "Space Survival Gameplay" (2019-06-18)

**Key insight**: The designer doesn't write the narrative — the system does. Meters are not optimization targets. They are narrative generators.

## Core Design

### Meters

Sims-like meters that tick upward with each jump. Each represents a pressure the player must manage:

_TODO: Define final meter list, tick rates, threshold effects_

Draft meters from Perko's design:

- **Hunger** — food supply depletion
- **Filth** — hygiene degradation
- **Loneliness** — social isolation
- **Claustrophobia** — confinement stress
- **Boredom** — stimulation deficit

### Ship Modules

Modules passively reduce meter growth rates. Active use gives temporary boosts at resource cost.

_TODO: Define module types, passive/active effects, slot system_

Example from Perko:

- Kitchenette → 90% slower hunger growth
- Full kitchen → zero hunger growth until food runs out
- Gym → reduces claustrophobia and boredom
- Media console → reduces boredom (different narrative than gym)
- Robot companion → reduces loneliness (different narrative than crew)

### Narrative Emergence

The player's module choices define their story:

- Solo explorer who swaps gym for media console + robot companion = different narrative
- Full crew who replaces gym with video games + relies on social interaction = different narrative
- "We didn't write those narratives: we allow the challenges to be faced in a way that turns them into narratives."

_TODO: Define how meter states trigger specific storylets_

### The Dossier System

Faction rank grants a dossier with "hardpoints" for NPCs (diplomats, lawyers, fences) that reduce negative meters (criminality, distrust). Different factions impose culturally distinct meter behaviors.

_TODO: Define dossier structure, hardpoint types, faction meter curves_

Example from Perko:

- Vulcan-like faction: never gains disinterest, but gives bonus distrust for selling science data
- Klingon-like faction: loses interest rapidly, but never gives criminality

## Genealogy

The yarnball concept developed over 14 years in Perko's writing. Two threads merged:

1. **Soft challenge** (2007→2015→2017): attrition-based, weathered-not-defeated, spectrum-not-binary
2. **Modular narrative divergence** (2005→2013→2016): functional customization that changes gameplay and stories

The 2018 breakthrough: The Sims provided the missing model — meters as narrative generators in a low-stress facility. Setbacks become personal narratives, not system failures.

Full genealogy: `docs/game-design/notes/yarnball_genealogy.md`

## Connections

- **QBN Engine**: Each meter is a quality; meter states gate storylets
- **Ship**: Module choices shape the meter landscape
- **Crew**: Crew composition affects social meters; crew needs add meter pressure
- **Travel**: Each jump ticks meters; route length = accumulated pressure
- **Factions**: Faction-specific meter curves make each faction feel different
- **Economy**: Resource scarcity (food, fuel) feeds meter pressure

## Open Questions

- What's the right number of meters? Too few = shallow; too many = overwhelming
- How do meters interact with multiplayer? (shared ship meters vs. personal meters)
- What's the meter ceiling? What happens when a meter maxes out?
- How do we prevent optimal solutions from collapsing the yarnball?
- Should meters have positive states too, or only negative pressure?

## Sources

- Perko, "Boiling the Yarnball" (2019-06-11) — concept debut
- Perko, "Space Survival Gameplay" (2019-06-18) — full application
- Perko, "The Sims vs Rimworld" (2018-01-09) — theoretical breakthrough
- Perko, "Basebuilding With People" (2015-02-23) — proto-yarnball
- `docs/game-design/notes/yarnball_genealogy.md` — full concept genealogy
- `docs/research/2026-03-23_perko-scifi-game-design/synthesis.md`

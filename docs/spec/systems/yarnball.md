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

### Bidirectional Pressure (from FATE)

Every yarnball meter must generate **both** beneficial and complicating storylets. This is the compel economy applied to meters:

- **High hunger** doesn't just threaten starvation — it unlocks desperate-measures storylets (raid a derelict, negotiate with pirates for supplies, discover an edible alien species) that create memorable stories and grant rewards unavailable to well-fed captains
- **High loneliness** doesn't just debuff — it unlocks introspective storylets, discovery of hidden ship features, or unique encounters with strange entities that only visit solitary travelers
- **High boredom** unlocks creative mischief storylets, crew pranks, and experimental tinkering that can produce unexpected breakthroughs

The yarnball collapses if meters are purely negative. Players will simply optimize them away. Meters must be **narrative generators in both directions** — comfort produces one kind of story; deprivation produces another, equally interesting kind.

This is the key lesson from FATE's compel economy: setbacks must earn future advantages. In the yarnball, the advantage isn't meta-currency — it's access to storylets that only fire under pressure.

Source: [FATE research — bidirectional pressure](../../research/2026-03-23_fate-rpg-qbn-lessons/synthesis.md)

### Diegetic Pacing Rhythm

FATE uses fate points as a metagame pacing mechanism — depletion during action, recovery through accepting complications. The yarnball should achieve the same dramatic rhythm through **diegetic resource scarcity cycles**:

1. **Departure**: Resources full, meters low. Player chooses ambitious routes and risky jobs.
2. **Accumulation**: Meters rise over jumps. Resources deplete. Pressure builds.
3. **Crisis**: High meters unlock complication storylets. Accepting them provides relief (resources, meter reduction) at narrative cost.
4. **Resolution**: Dock at port. Spend money to reset meters. Sell cargo. Cycle restarts.

The rhythm should feel like a natural voyage arc, not a mechanical loop. Each cycle produces different stories because the player's quality state is different every time.

Source: FATE's fate point economy adapted as diegetic resource cycles

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
- ~~How do we prevent optimal solutions from collapsing the yarnball?~~ → Answered by bidirectional pressure: optimal isn't "meters at zero" because high-meter storylets are uniquely valuable
- ~~Should meters have positive states too, or only negative pressure?~~ → Answered: meters generate both beneficial and complicating storylets across their full range
- What's the right balance of complication vs. reward storylets at each meter level?
- How do we signal to players that high meters unlock unique content, not just punishment?

## Sources

- Perko, "Boiling the Yarnball" (2019-06-11) — concept debut
- Perko, "Space Survival Gameplay" (2019-06-18) — full application
- Perko, "The Sims vs Rimworld" (2018-01-09) — theoretical breakthrough
- Perko, "Basebuilding With People" (2015-02-23) — proto-yarnball
- `docs/game-design/notes/yarnball_genealogy.md` — full concept genealogy
- `docs/research/2026-03-23_perko-scifi-game-design/synthesis.md`
- `docs/research/2026-03-23_fate-rpg-qbn-lessons/synthesis.md` — bidirectional pressure, diegetic pacing

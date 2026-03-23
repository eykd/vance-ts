# Travel

> Three scales of movement that pace the game and tick the yarnball.

## Overview

Travel is the pacing mechanism. Each jump ticks yarnball meters, consumes fuel, and moves the player through the trade network. Three scales of movement create nested loops of increasing granularity.

## Core Design

### Interstellar Travel

_TODO: Define jump mechanics, range constraints, route planning_

- Jump navigation from system to system, constrained by ship range
- Route planning across the Oikumene trade network
- Longer or riskier routes into the Beyond
- Each jump = one "turn" that ticks all meters

### Interplanetary Travel

_TODO: Define in-system movement, points of interest_

- Moving between planets, stations, and other features within a system
- Lower-stakes movement; fewer meter ticks

### Surface/Station Travel

_TODO: Define local movement, encounter triggers_

- Player-character movement on planet surfaces and stations
- Drives local encounters and commerce
- Where most storylets fire

## Connections

- **Yarnball**: Each jump ticks meters; route length = accumulated pressure
- **Economy**: Trade routes are travel routes; distance affects profitability
- **Ship**: Range limits travel options; fuel capacity constrains routes
- **QBN**: Location qualities gate storylet availability

## Open Questions

- Is interstellar travel deterministic or does it have random encounters?
- How does the Beyond differ mechanically from Oikumene travel?
- What's the turn cadence? Free-form or time-gated?
- How do we make route planning itself interesting (not just A→B)?

## Sources

- Traveller RPG — jump navigation model
- Perko — keyframe ship simulation between jumps
- `docs/game-design/notes/spaaace/` — galaxy generation specs
- `docs/game-design/notes/setting/interstellar_travel_and_corridors.md`
- `docs/game-design/notes/setting/navigation_hazards_and_chokepoints.md`

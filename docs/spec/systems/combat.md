# Combat

> Abstract, handled through QBN encounters. Not a separate tactical layer.

## Overview

Combat is rare in the Oikumene (quickly quenched by law enforcement) and more common in the Beyond. It's handled through the same QBN encounter system as everything else — no separate combat mini-game. The drama comes from the consequences, not the tactics.

## Core Design

### Ship Combat

_TODO: Define encounter structure, outcome determination, consequences_

- QBN encounters with combat-tagged storylets
- Ship qualities (weapons, shields, crew skill) affect outcome probabilities
- Outcomes range from clean escape to catastrophic damage
- Damage feeds back into yarnball (repairs, meter spikes, crew morale)

### Personal Combat

_TODO: Define personal encounter structure_

- Same QBN pattern as ship combat
- Player and crew qualities determine options
- Abstract resolution — no hit points or combat rounds

### Combat Frequency

_TODO: Define encounter rates by region_

- Oikumene: very rare, law enforcement intervenes
- Beyond: more common, higher stakes
- Combat avoidance should be a viable and often preferable strategy

## Connections

- **QBN**: Combat encounters are storylets
- **Ship**: Ship qualities affect combat outcomes
- **Crew**: Crew skills unlock combat options
- **Yarnball**: Combat consequences spike meters
- **Travel**: Region determines combat frequency

## Open Questions

- How do we make combat feel consequential without a tactical layer?
- Is PvP possible? Under what circumstances?
- How does combat interact with faction reputation?
- Should combat have a "preparation" phase (quality-gated options before the encounter)?

## Sources

- Perko CRPG research — "kill classes, use archetypes"
- Perko — "less freedom, more agency" in encounter design

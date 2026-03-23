# Culture PCG

> Procedural culture generation using Holly Lisle's method within the Oikumene milieu.

## Overview

Each inhabited world in the Oikumene has a distinct culture, but we can't hand-author thousands of them. The procedural culture generation system uses Holly Lisle's culture-building framework to generate culturally coherent, narratively rich worlds. The exemplar planet dossiers in `concept-art/` demonstrate the range and quality target.

## The Holly Lisle Method

Holly Lisle's "Create a Culture" framework provides a systematic checklist for building internally consistent cultures. Our PCG system walks through these dimensions, making choices constrained by the world's physical characteristics, faction alignment, and position in the Oikumene.

### Foundation (7 Characteristics)

_TODO: Define which Holly Lisle dimensions are PCG-relevant and how they map to game mechanics_

Key dimensions from the framework:

- Geography/environment → planet physical characteristics
- Economy → trade codes, resource availability
- Government → law level, political structure
- Religion → belief systems, social norms
- Social structure → class, family, gender roles
- Technology → tech level, specializations
- History → founding story, formative events

### Mechanical Integration

_TODO: Define how culture affects game systems_

- Culture → meter curve modifiers (how a culture's values affect yarnball)
- Culture → storylet pools (culturally-specific encounters)
- Culture → trade goods (what's valued, what's taboo)
- Culture → NPC behavior patterns

## Constraints

Cultures generate within the Oikumene milieu:

- The broad, thematic setting notes define the overall feel
- Individual cultures vary within that space
- Faction alignment constrains but doesn't determine culture
- Physical planet characteristics (from planet PCG) constrain options

## Concept Art

The exemplar planet dossiers (`concept-art/`) are "concept art" — they show the range, theme, and possibility space of what PCG should produce. They are design targets, not canonical locations.

## Connections

- **Planet PCG**: Physical characteristics feed culture generation
- **Factions (setting)**: Faction alignment constrains cultural parameters
- **QBN Engine**: Culture generates quality-gated storylet pools
- **Yarnball**: Cultural values create distinct meter curve profiles
- **Tone & Style**: Cultural descriptions must maintain Vancean voice

## Sources

- `docs/game-design/notes/holly_lisle_create_a_culture.md` — full framework
- `docs/game-design/notes/planets/` — 10 exemplar dossiers
- `docs/game-design/notes/setting/culture_and_art_at_scale.md`
- `docs/game-design/notes/setting/demography_and_population_patterns.md`

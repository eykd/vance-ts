# Planet & System PCG

> Procedural world generation pipeline: stars, planets, trade codes, and physical characteristics.

## Overview

The galaxy generation pipeline creates the physical substrate that everything else builds on. Star types, planet characteristics, and trade codes determine what's possible at each location — which in turn constrains culture generation, economic activity, and narrative possibilities.

## Core Design

_TODO: Synthesize from existing galaxy generation specs_

### Star System Generation

- Star types and characteristics
- Number and type of planetary bodies
- System features (asteroid belts, gas giants, stations)

### Planet Characteristics

- Atmosphere, hydrosphere, biosphere
- Population, tech level, government type
- Trade codes (agricultural, industrial, etc.)
- Starport quality

### Trade Code System

_TODO: Define trade codes and their mechanical effects_

From Traveller research: trade codes drive speculative trade modifiers. Agricultural worlds buy manufactured goods; industrial worlds buy raw materials.

## Existing Specs

- `docs/game-design/notes/spaaace/galaxy-generation-spec-final.md`
- `docs/game-design/notes/spaaace/galaxy-generator-spec.md`
- `docs/game-design/notes/spaaace/star_cluster_guide.md`
- `docs/game-design/notes/spaaace/cavern-cellular-automata.md`
- `docs/game-design/notes/star_system_creation_guide.md`
- `docs/game-design/galaxy-generation-spec.md`

## Connections

- **Culture PCG**: Physical characteristics constrain culture generation
- **Economy**: Trade codes drive economic activity
- **Travel**: System positions define the route network
- **The Beyond**: Beyond uses different generation parameters

## Sources

- Traveller RPG — Universal World Profile (UWP)
- `docs/research/2026-03-23_traveller-economy/synthesis.md` — gravity trade model
- Galaxy generation specs listed above

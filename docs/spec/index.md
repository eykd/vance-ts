# Game Design Specification

A design bible for a text-only, QBN-driven MMORPG set in a baptized-Vance galaxy. Organized as two parallel tracks — **systems** (game mechanics) and **setting** (worldbuilding) — that cross-reference each other.

## How to Read This Spec

**Start here**, then follow your interest:

- For **how the game works**: [Systems Index](systems/index.md)
- For **what the world is**: [Setting Index](setting/index.md)
- For **research backing decisions**: [Research Index](#research)

Each spec file follows a common structure:

1. **Overview** — what this is and why it matters
2. **Core Design** — the mechanics or content
3. **Connections** — how it relates to other spec files
4. **Open Questions** — unresolved design decisions
5. **Sources** — research, Perko posts, reference docs that informed the design

## Three Pillars

Everything in this game hangs off three core systems. All other systems are downstream.

```
                    ┌─────────────┐
                    │  QBN Engine  │
                    │  (narrative) │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────┴─────┐     │     ┌──────┴─────┐
        │  Yarnball  │     │     │  Economy   │
        │  (meters)  │     │     │  (trade)   │
        └─────┬─────┘     │     └──────┬─────┘
              │            │            │
              └────────────┼────────────┘
                           │
              ┌────────────┼────────────┐
              │     │      │      │     │
           Travel  Ship   Crew  Jobs  Factions
              │     │      │      │     │
              └────────────┼────────────┘
                           │
                    ┌──────┴──────┐
                    │  Combat     │
                    │  Character  │
                    │  Multiplayer│
                    └─────────────┘
```

- **QBN Engine** — the narrative substrate. Qualities gate storylets; storylets modify qualities. Every system talks through QBN.
- **Yarnball** — interlocking meters (hunger, loneliness, boredom, etc.) that generate emergent narrative through tradeoffs. Ship modules shape the meter landscape.
- **Economy** — trade routes, currency flow, faucet-sink equilibrium. The economic pressure that drives the player loop.

## Systems Files

| File                                              | Status  | Description                                                              |
| ------------------------------------------------- | ------- | ------------------------------------------------------------------------ |
| [QBN Engine](systems/qbn-engine.md)               | Outline | Quality-based narrative engine: storylets, qualities, availability rules |
| [Yarnball](systems/yarnball.md)                   | Outline | Meter system, ship modules, narrative emergence, dossier system          |
| [Economy](systems/economy.md)                     | Outline | Trade, currency, faucet-sink, speculative trade, mortgage                |
| [Travel](systems/travel.md)                       | Outline | Interstellar jumps, interplanetary movement, surface exploration         |
| [Ship](systems/ship.md)                           | Outline | Modules, maintenance, upgrades, the ship as character                    |
| [Crew](systems/crew.md)                           | Outline | NPC crew, moods, social dynamics, hiring, crew composition               |
| [Factions](systems/factions.md)                   | Outline | Reputation, dossier hardpoints, faction-specific meter curves            |
| [Jobs](systems/jobs.md)                           | Outline | Courier contracts, quest generation, job boards                          |
| [Combat](systems/combat.md)                       | Outline | Abstract ship and personal combat through QBN                            |
| [Character](systems/character.md)                 | Outline | Player identity, progression, advancement                                |
| [Multiplayer](systems/multiplayer.md)             | Outline | MMO layer, shared state, async interaction                               |
| [Design Principles](systems/design-principles.md) | Outline | Engagement strategy, pacing, turn structure, tone                        |
| [Prestoplot](systems/prestoplot/README.md)        | Spec    | Seeded grammar-based text generation: direct rendering + LLM prompt gen  |

## Setting Files

| File                                         | Status    | Description                                                 |
| -------------------------------------------- | --------- | ----------------------------------------------------------- |
| [Oikumene](setting/oikumene.md)              | Outline   | The civilized galaxy: structure, trade network, law         |
| [The Beyond](setting/beyond.md)              | Outline   | The frontier: mystery, danger, discovery                    |
| [Factions](setting/factions.md)              | Outline   | Major powers, organizations, criminal syndicates            |
| [Culture PCG](setting/culture-pcg.md)        | Outline   | Procedural culture generation via Holly Lisle method        |
| [Planet & System PCG](setting/planet-pcg.md) | Outline   | Procedural world generation pipeline                        |
| [Tone & Style](setting/tone-and-style.md)    | Outline   | Vancean voice, writing guidelines, prose style              |
| [History](setting/history.md)                | Outline   | Timeline, eras, formative events                            |
| [Concept Art](setting/concept-art/index.md)  | Reference | Exemplar planets and cultures showing the possibility space |

## Research

Completed research syntheses that inform this spec:

| Research                                                                                | Key Takeaways                                                              |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [Perko Sci-Fi Game Design](../research/2026-03-23_perko-scifi-game-design/synthesis.md) | Yarnball survival, CRPG archetypes, location density, NPC mood system      |
| [Sunless Sea/Skies Economy](../research/2026-03-23_sunless-economy/synthesis.md)        | Resource narrative, Bargains+Prospects, affiliation system                 |
| [Traveller Economy](../research/2026-03-23_traveller-economy/synthesis.md)              | Mortgage-driven loop, speculative trade, gravity trade model               |
| [MMORPG Economy](../research/2026-03-23_mmorpg-economy/synthesis.md)                    | Faucet-sink model, mudflation prevention, transaction taxes                |
| [FATE RPG & QBN](../research/2026-03-23_fate-rpg-qbn-lessons/synthesis.md)              | Compel economy, fractal principle, quality lifespans; avoid free-form tags |

## Source Material

Raw notes, reference documents, and concept art live in `docs/game-design/notes/`. The spec synthesizes from these; the notes remain as source material.

Key references:

- `notes.md` — original vision document
- `notes/yarnball_genealogy.md` — genealogy of the yarnball concept
- `notes/art_of_game_design_summary.md` — Schell's 113 lenses
- `notes/holly_lisle_create_a_culture.md` — culture-building framework for PCG
- `notes/star_system_creation_guide.md` — star system generation reference
- `notes/qbn/` — QBN engine guides and Ravel language spec
- `notes/spaaace/` — galaxy generation specs

# Systems Index

Game mechanics organized around three core pillars with downstream systems that depend on them.

## Core Pillars

These three systems are load-bearing. Every other system communicates through them.

1. **[QBN Engine](qbn-engine.md)** — The narrative substrate. All game state is expressed as qualities; all content is delivered as storylets gated by quality checks. This is the "operating system" of the game.

2. **[Yarnball](yarnball.md)** — Interlocking survival/social meters that generate emergent narrative through player tradeoffs. Ship modules shape the meter landscape. The yarnball is what makes each player's experience feel like a unique story rather than an optimization puzzle.

3. **[Economy](economy.md)** — Trade routes, currency, faucet-sink equilibrium. The economic pressure that forces players to make interesting decisions about where to go and what to haul. Includes the mortgage mechanic that makes trading survival, not tourism.

## Downstream Systems

These systems plug into the three pillars:

4. **[Travel](travel.md)** — Three scales of movement (interstellar, interplanetary, surface). Travel is the pacing mechanism — each jump ticks yarnball meters and consumes resources.

5. **[Ship](ship.md)** — The ship as character: modules define your yarnball profile, cargo capacity constrains your economy, range limits your travel. Module choices are the primary expression of player identity.

6. **[Crew](crew.md)** — NPC crew with moods, social needs, and emergent personalities. Crew composition shapes which storylets fire and how meters behave. 4-7 active crew as the sweet spot.

7. **[Factions](factions.md)** — Reputation, dossier hardpoints, faction-specific meter curves. Factions are the social dimension of the yarnball — each imposes culturally distinct mechanical behaviors.

8. **[Jobs](jobs.md)** — Courier contracts and QBN-generated quests. The immediate "what do I do next?" layer that feeds into economy and travel.

9. **[Combat](combat.md)** — Abstract, handled through QBN encounters. Rare in the Oikumene, common in the Beyond. Not a separate tactical layer.

10. **[Character](character.md)** — Player identity and progression. Advancement through expanding capabilities (ship, crew, routes, faction access) rather than stat inflation.

11. **[Multiplayer](multiplayer.md)** — The MMO layer: shared economy, faction dynamics, player-to-player trade, asynchronous interaction.

12. **[Design Principles](design-principles.md)** — Engagement strategy (Octalysis), turn-based pacing, Vancean tone, anti-patterns to avoid.

## Infrastructure Systems

These systems support the pillars and downstream systems without being gameplay systems themselves:

13. **[Prestoplot](prestoplot/README.md)** — Seeded, deterministic grammar-based text generation library. Operates in two modes: (1) direct text rendering for player-facing prose, and (2) LLM prompt generation for richer narrative synthesis. The text layer beneath QBN — storylets decide _what happens_; prestoplot decides _how to describe it_.

## System Dependencies

```
QBN Engine ← everything (all systems express state as qualities)
Prestoplot ← QBN Engine (renders storylet text), Tone & Style (Vancean grammars)
Yarnball ← Travel (meter ticks per jump), Ship (modules reduce meters), Crew (social meters)
Economy ← Travel (trade routes), Ship (cargo capacity), Jobs (income), Multiplayer (shared market)
Factions ← Yarnball (faction meter curves), Economy (faction trade modifiers), Crew (faction NPCs)
```

## Key Design Decisions (from research)

| Decision                                                                | Source                  | Affects                 |
| ----------------------------------------------------------------------- | ----------------------- | ----------------------- |
| Fractal: everything modeled with same quality/storylet framework        | FATE research           | QBN Engine, all systems |
| Quality taxonomy: 7 types with distinct lifespans and behaviors         | FATE + Kennedy critique | QBN Engine              |
| Bidirectional pressure: meters generate content at both ends            | FATE compel economy     | Yarnball                |
| Compel storylets: system-initiated complications with rewards           | FATE compels            | QBN Engine, Yarnball    |
| Diegetic pacing: resource scarcity cycles, not metagame tokens          | FATE adaptation         | Yarnball, Economy       |
| Prep-and-payoff chains: situation qualities consumed by later storylets | FATE maneuvers          | QBN Engine              |
| Tiered quality potency: diverse effects at different thresholds         | FATE scaled invocation  | QBN Engine              |
| No player-authored qualities: choices within authored content only      | FATE MMO adaptation     | QBN Engine, Multiplayer |

## Sources

- [Perko research synthesis](../../research/2026-03-23_perko-scifi-game-design/synthesis.md)
- [FATE RPG research](../../research/2026-03-23_fate-rpg-qbn-lessons/synthesis.md)
- [Economy research](../../research/2026-03-23_mmorpg-economy/synthesis.md) | [Traveller](../../research/2026-03-23_traveller-economy/synthesis.md) | [Sunless](../../research/2026-03-23_sunless-economy/synthesis.md)
- [Original vision](../../game-design/notes.md)

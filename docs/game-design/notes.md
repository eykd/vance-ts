# Game Design Notes — Vance MMORPG

## Vision

A web-based, text-only MMORPG set in a baptized-Vance galaxy. The Oikumene — a civilized network of systems connected by trade routes along a spiral arm — contrasts with the mysterious Beyond, full of adventure, surprises, and dangers.

Play is turn-based, inspired by quality-based (resource-based) narratives like Fallen London. The QBN engine (see `QBN_Engine_Implementation_Guide.md`) drives encounters, story progression, and systemic interactions.

## Player Fantasy

You are the captain of a small merchant vessel, making your way through the Oikumene as a tramp trader. You start solo with a ship of limited range (Traveller-style jump navigation adapted to the setting). Over time you upgrade your ship, hire NPC crew, build faction relationships, and — if you dare — venture into the Beyond.

## Core Systems

### Travel

Three scales of movement:

1. **Interstellar travel** — Jump navigation from system to system, constrained by ship range. Route planning across the Oikumene trade network; longer or riskier routes into the Beyond.
2. **Interplanetary travel** — Moving between planets, stations, and other features within a system.
3. **Surface/station travel** — Player-character movement on planet surfaces and stations, driving local encounters and commerce.

### Jobs

- **Courier contracts** — Tramp merchant jobs available in each Oikumene system with preassigned destinations. The bread-and-butter income loop.
- **Quests** — RPG-style jobs that emerge from player choices, faction alignment, reputation, and story progression. Driven by QBN availability rules.

### Ship

- **Maintenance and repair** — Ship systems degrade and require upkeep, creating resource pressure.
- **Upgrades** — Improve range, cargo capacity, defenses, crew quarters, etc.
- **Crew** — Hire NPC crew members over time, each with qualities that affect encounters and capabilities.

### Combat

- **Ship battles** — Abstract, handled through the QBN encounter system rather than a separate tactical layer. Rare in the Oikumene (quickly quenched by law enforcement), more common in the Beyond.
- **Personal combat** — Also abstract, following the same QBN encounter patterns. No separate combat mini-game.

## Key Concepts

### The Yarnball (from Craig Perko)

Survival and resource systems should be designed as a **yarnball** — "a soft, complicated challenge that interlaces with a lot of other things" that "unfolds into a narrative according to the choices the player makes."

The core idea: instead of survival as a binary threat (you have food or you don't), use **interlocking meters** (hunger, loneliness, boredom, claustrophobia, filth) that tick upward with each jump. Ship **modules** passively reduce meter growth rates (kitchenette = 90% slower hunger; full kitchen = zero growth until food runs out). Active module use gives temporary boosts at resource cost.

The key insight is that **the designer doesn't write the narrative — the system does.** A solo explorer who swaps their gym for a media console and buys a robot companion has a different story than a crew who replaces the gym with video games and relies on social interaction. "We didn't write those narratives: we allow the challenges to be faced in a way that turns them into narratives."

This extends to factions via the **dossier** system: faction rank gives you a dossier with "hardpoints" for NPCs (diplomats, lawyers, fences) that reduce negative meters (criminality, distrust). Different factions impose culturally distinct meter behaviors — a Vulcan-like faction never gains disinterest but gives bonus distrust for selling science data; a Klingon-like faction loses interest rapidly but never gives criminality.

**Why this matters for our game**: The yarnball maps directly to QBN. Each meter is a quality, ship module choices gate which storylets fire, and faction-specific meter curves make each faction's narrative space feel mechanically different. This gives us emergent narrative from systems rather than scripted content — essential for a text MMORPG that needs to sustain long-term play.

Source: Perko, "Space Survival Gameplay" (2019-06-18). See `docs/research/2026-03-23_perko-scifi-game-design/synthesis.md` for full analysis.

## Design Principles

### Engagement Strategy (Octalysis Framework)

Majoring on white-hat core drives for sustainable, intrinsic motivation:

| Core Drive                            | Role                                                                                         | Priority |
| ------------------------------------- | -------------------------------------------------------------------------------------------- | -------- |
| **CD1: Epic Meaning**                 | You're a captain carving your path through a vast galaxy; the Beyond holds genuine mysteries | High     |
| **CD2: Development & Accomplishment** | Ship upgrades, crew growth, faction reputation, route mastery                                | High     |
| **CD3: Empowerment of Creativity**    | Route planning, trade strategy, crew composition, quest choices                              | High     |
| **CD5: Social Influence**             | MMO interactions, faction politics, reputation that other players can see                    | Medium   |
| **CD7: Unpredictability & Curiosity** | QBN encounters, the Beyond's surprises, emergent narrative                                   | Medium   |

Minimizing black-hat techniques:

| Core Drive                     | Stance                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------ |
| **CD6: Scarcity & Impatience** | Limit to diegetic scarcity (fuel, cargo space) — no artificial energy timers or premium currency gates |
| **CD8: Loss & Avoidance**      | Ship damage and reputation loss should feel consequential but recoverable — never punitive             |

### Narrative Design

- QBN-driven: encounters, quests, and story beats emerge from player qualities, location, faction state, and randomness
- No linear main quest — progression comes from expanding your reach (better ship, wider routes, deeper faction ties)
- The Oikumene is knowable; the Beyond rewards exploration with genuine discovery

### Turn-Based Pacing

- Each turn represents a meaningful decision (where to go, what job to take, how to handle an encounter)
- No real-time pressure — players can engage at their own pace
- MMO aspects work asynchronously (trade, faction dynamics, shared world state)

## Open Questions

- How does the MMO layer work? Shared economy? Persistent faction wars? Player-to-player trade?
- What is the turn cadence? Free-form or time-gated (e.g., X turns per day)?
- How deep is the galaxy generation? Fully procedural or hand-crafted Oikumene with procedural Beyond?
- What does "winning" look like, or is it purely sandbox?
- How do new players encounter existing players' impact on the world?

## References

- `QBN_Engine_Implementation_Guide.md` — QBN/storylet engine architecture
- `galaxy-generation-spec.md` — Procedural galaxy generation
- QMD collection `perko` — 1,578 posts from Craig Perko's game design blog (2005–2019), indexed for search via `qmd search "topic" -c perko`

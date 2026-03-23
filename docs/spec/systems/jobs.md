# Jobs

> Courier contracts and QBN-generated quests — the "what do I do next?" layer.

## Overview

Jobs are the immediate action layer that feeds into economy and travel. Courier contracts provide reliable income; QBN-generated quests provide narrative depth. Together they answer the question every player asks after docking: "what now?"

## Core Design

### Courier Contracts

The bread-and-butter income loop, adapted from Traveller's routine commerce. Courier contracts are the Tier 1 foundation that covers 60–70% of monthly operating costs — enough to survive, not enough to thrive.

**Contract generation**: Available contracts at each port are determined by the gravity trade model (BTN between connected systems). High-BTN routes (Oikumene backbone) offer plentiful, low-margin contracts. Low-BTN routes (frontier, Beyond) offer scarce, higher-margin contracts with greater risk.

**Contract types**:

| Type                | Pay basis                                 | Risk     | Notes                                                                                                                                        |
| ------------------- | ----------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Standard freight    | Cr/ton/parsec                             | Low      | Fill your hold, fly the route. Volume depends on BTN.                                                                                        |
| Priority freight    | Premium rate                              | Medium   | Time-sensitive delivery; late penalty of 1d6+4 x 10% reduction.                                                                              |
| Mail contracts      | Fixed premium (e.g., Cr 25,000/container) | Low      | Require military or scout faction standing. Reliable income for connected captains.                                                          |
| Passenger transport | Per-passenger fare by class               | Variable | High Passage pays best but requires steward skill and stateroom allocation. Low Passage is cheap but carries survival risk and moral weight. |
| Hazardous cargo     | Premium rate                              | High     | Dangerous goods (radioactives, volatile chemicals, restricted tech). Higher pay, legal/safety complications.                                 |

**Destination logic**: Contracts point to systems within 1–3 jumps. Longer contracts pay more per parsec but tie up cargo space longer. The system avoids sending players to dead-end systems with no return freight — contract generation considers round-trip economics, not just one-way delivery.

**Passenger generation**: Passenger availability scales with the Eaglestone Trade Index magnitude for each route. A magnitude-3 route sees thousands of passengers per week; a magnitude-1 route might have a handful. Each passenger type is a narrative hook:

- **High Passage**: Faction dignitaries, wealthy merchants, mysterious patrons. Require steward skill checks; failure damages reputation. Potential quest-givers.
- **Middle Passage**: Ordinary travelers. Steady income, occasional color.
- **Working Passage**: Free transport in exchange for labor. These are potential crew recruits — a natural pipeline from "passenger" to "crewmember" with a relationship already established.
- **Low Passage**: Cryogenic transport for desperate or poor NPCs. Medic check required on arrival — failure means a dead passenger. Why are they fleeing? What are they escaping? Each low passenger is a story seed.

### Bargains and Prospects (Trade Jobs)

Adapted from Sunless Skies' dynamic trade system. These bridge Tier 1 routine commerce and Tier 2 speculative trade, providing structured risk/reward opportunities.

**Bargains**: Appear at minor ports — opportunities to buy specific goods below market price. Limited stock, time-limited availability. Finding a Bargain and matching it to a known Prospect is the core trade-optimization loop. Bargain quality improves with faction standing (affiliation gating from Sunless Skies).

**Prospects**: Appear at major ports — NPC-posted contracts requesting delivery of specific goods at premium prices. Players can hold 3–4 active Prospects simultaneously. Fulfilling a Prospect yields above-market payment and can trigger narrative consequences:

- Supplying munitions to a faction affects regional conflict state
- Delivering rare specimens advances a research plotline
- Completing a smuggling Prospect raises Villainy standing but risks law enforcement attention

**Prospect rotation**: Prospects cycle over time, creating urgency — a lucrative opportunity won't wait forever. In multiplayer, Prospects may be competitive (first captain to deliver wins) or instanced per player (QBN-generated based on individual qualities). See economy.md for the tradeoff discussion.

### QBN Quests

Quests emerge from the intersection of player qualities, faction alignment, reputation, location, and world state. They are not scripted quest lines — they are storylets generated from system state.

**Patron encounters** (from Traveller): NPCs at ports offer one-off or multi-step missions based on the player's reputation and skills. A captain known for discretion attracts different patrons than one known for firepower. Patron quality and mission danger scale with the port's characteristics — a frontier outpost offers rougher work than a core-world capital.

**Quality gates**: Jobs require minimum thresholds on relevant qualities. A smuggling job requires Villainy standing. A diplomatic courier mission requires Establishment standing. A salvage expedition requires navigation skill. This ensures jobs feel earned and character-appropriate.

**Multi-step quests**: Some jobs unfold over multiple jumps and ports. "Deliver this package to Station X, pick up a return item, bring it to Station Y." These create natural route-planning challenges and can interleave with other jobs the player is already running.

**Narrative integration**: Following Kennedy's resource narrative principle, quest rewards should include resources the player is already managing (fuel, supplies, faction standing, crew morale) rather than isolated "quest currencies." Every quest outcome should ripple into the systems the player cares about.

### Job Boards

The discovery layer — how players find available work at each port.

**Port job boards**: Every port has a public board showing available courier contracts, freight requests, and passenger manifests. Information quality varies by port:

- **Class A/B starports**: Full contract details — destination, cargo type, pay, deadline
- **Class C starports**: Partial information — destination and approximate pay, cargo details revealed on acceptance
- **Class D/E starports**: Minimal listings; best jobs found through NPC conversations and faction contacts

**Faction-specific channels**: Higher faction standing unlocks private job boards with better-paying, more interesting work. The Establishment offers official government contracts. Criminal factions offer smuggling runs through back-channel contacts. Academic factions post research expedition work.

**Information asymmetry as gameplay**: Not all job details are visible upfront. Some contracts reveal complications only after acceptance (the "passenger" is a fugitive; the "medical supplies" are contraband). Players learn to read between the lines — a suspiciously high-paying courier run to a frontier system probably isn't straightforward. Broker skill and local contacts reduce information asymmetry.

**Word of mouth**: Some of the best jobs aren't on any board. They come from NPCs encountered during other activities — a grateful passenger mentions an opportunity, a bartender whispers about a special cargo, a faction contact calls in a favor. This rewards social engagement and exploration over board-scanning.

## Connections

- **Economy**: Jobs are the primary income faucet; courier contracts are Tier 1 routine commerce; Prospects bridge into Tier 2 speculative trade
- **Travel**: Job destinations drive route choices; multi-stop quests create route-planning challenges
- **Factions**: Faction standing unlocks faction-specific jobs, better Bargains/Prospects, and patron encounters
- **QBN Engine**: Quests are storylets; job availability is quality-gated; Prospects and Bargains are QBN-generated opportunities
- **Crew**: Crew skills affect job outcomes (Broker for trade jobs, Steward for passengers, Medic for low passage); working passengers are crew recruitment pipeline
- **Ship**: Cargo capacity limits how many contracts you can run simultaneously; ship class determines which hazardous cargo you can carry

## Open Questions

- How much of the job system is procedural vs. hand-authored? **Leaning heavily procedural** with QBN generation, but hand-authored "anchor" quests at key narrative locations provide memorable set-pieces.
- Can players create jobs for other players? (MMO dimension) — Research supports this (EVE's contract system). Consider player-posted courier contracts and bounties as a later feature.
- ~~How do we prevent job grinding from feeling repetitive?~~ **Partially resolved**: Bargains/Prospects rotation, QBN-driven variety, information asymmetry, and narrative consequences all combat repetition. Dynamic markets mean the same route doesn't stay optimal. Prospect rotation creates urgency and variety.
- ~~What's the information model? Do you know the payout before accepting?~~ **Resolved**: Tiered by starport quality. Class A/B: full details. Class C: partial. Class D/E: minimal. Faction contacts and Broker skill fill in gaps.
- How do competitive Prospects work in multiplayer? If two captains are racing to fulfill the same Prospect, how is the winner determined? First to deliver? Quality of goods? Relationship with the NPC?
- What's the right density of Bargains and Prospects per port? Too many removes scarcity pressure; too few makes the system feel empty.

## Sources

- `docs/research/2026-03-23_traveller-economy/synthesis.md` — freight pricing, passage types, patron encounters, speculative trade, mail contracts, late delivery penalties
- `docs/research/2026-03-23_sunless-economy/synthesis.md` — Bargains+Prospects system, affiliation gating, profit spikes over steady curves, port reports as exploration incentive
- `docs/research/2026-03-23_mmorpg-economy/synthesis.md` — player-created contracts (EVE), information asymmetry as gameplay, text-game economic design
- Traveller RPG — speculative trade and patron encounters
- Sunless Skies — Bargains+Prospects system, trade redesign philosophy

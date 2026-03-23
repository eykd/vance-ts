# Travel

> Three scales of movement that pace the game and tick the yarnball.

## Overview

Travel is the pacing mechanism. Each jump ticks yarnball meters, consumes fuel, and moves the player through the trade network. Three scales of movement create nested loops of increasing granularity.

## Core Design

### Location Design Principles

From Perko: procedural worlds that feel alive require three qualities working together.

- **Uniqueness stack**: Each location needs distinctive contextual details, not just stat variations. "Ten million locations that vary only statistically won't be nearly as interesting as a hundred locations that are each unique." A planet's uniqueness should be specific (rich helium-3 deposits, a famous university, a political exile community) rather than parametric (+10% trade bonus).
- **Coherence ("smearing")**: Uniqueness propagates to neighbors. A gold-rich planet means nearby colonies are wealthier, nearby NPCs discuss the gold rush, and nearby factions compete for mining rights. Uniqueness is not isolated — it bleeds into surrounding locations.
- **Gateways**: Players need compelling reasons to investigate uniqueness, or it "blends together into a shapeless blah." Gateways are hooks that pull the player from surface awareness into deeper engagement — a rumor about a planet's secret, a crew member's connection to a place, a faction mission that takes you there.

### World Weaving

Generate worlds from overlapping paths rather than discrete points. NPC arcs, trade routes, and faction agendas are paths; where they intersect, emergent complexity arises.

- Trade routes, faction supply lines, migration patterns, and NPC personal arcs are all paths laid across the map
- Where paths intersect, the location gains density and narrative potential
- This is architecturally aligned with QBN: storylets fire at path intersections where multiple qualities converge
- A system that sits at the intersection of a major trade route, a faction border, and a crew member's home world is naturally richer than one that sits on no paths

### Density as Design Axis

Different regions should have different native densities. Density is a unified design axis that affects encounter frequency, NPC population, economic activity, and narrative complexity.

- **High density** (major trade hubs, faction capitals): many overlapping paths, frequent encounters, rich NPC populations, complex faction dynamics
- **Low density** (frontier systems, the Beyond): isolated paths, rare encounters, sparse NPCs, but each encounter carries more weight
- Density should vary within regions too — a dense station orbiting a sparse planet creates interesting contrast
- The text-only medium can express density through encounter frequency, NPC chatter volume, and option abundance rather than visual crowding

### Interstellar Travel

- Jump navigation from system to system, constrained by ship range
- Route planning across the Oikumene trade network — route planning itself should be interesting, not just selecting a destination
- Longer or riskier routes into the Beyond
- Each jump = one "turn" that ticks all meters and triggers the keyframe ship simulation
- No fast travel shortcuts that collapse the map. Perko warns that fast travel "crushes" the world by making distance meaningless. Every jump should be felt.

### Route Network Topology (from spaaace prototype)

The cluster is an undirected graph — each node is a system, each edge is a bidirectional trade route. Distances for trade calculations are shortest-path hop counts (BFS/Dijkstra), not geometric distances.

**Link generation algorithm**: Systems are generated in sequence. Each system always links to its immediate successor. Then a 4dF roll determines additional links:

- Roll >= 0: Also link to the first unlinked system at index +2 or beyond
- Roll >= 1: Additionally link to the first unlinked system at index +3 or beyond

The "first unlinked system" heuristic ensures isolated nodes get connected before well-connected ones. The algorithm guarantees full connectivity (every system has at least one route) while producing organic network topology — some systems become natural hubs with 3+ connections, others are dead-end spurs with exactly one.

**Design implications for route planning**:

- **Hub-and-spoke topology**: Naturally emerges from the link algorithm. Hub systems with 3+ connections are trade crossroads; spur systems are frontier outposts. This creates the Oikumene/Beyond feel without explicit region tagging.
- **Chokepoints**: Some routes between distant cluster regions pass through a single system. These chokepoints are strategically valuable — they concentrate traffic and create natural points of conflict, piracy, and customs enforcement.
- **Distance matters exponentially**: The BTN distance modifier rises in steps (1 hop = 0, 2 hops = 0.5, 5 hops = 1.0, etc.), so trade volume drops sharply with distance. Most profitable trade happens within 1–2 jumps. Routes of 5+ jumps are only viable between major economies (high WTN).

### Investigate-and-Expand Exploration

A two-phase pattern for making exploration meaningful:

1. **Investigate**: When players find something interesting at a location, let them zoom in — visit a settlement's districts, talk to people, explore the local situation. Surface-level awareness deepens into specific knowledge.
2. **Expand**: Once investigated, the location integrates into the player's mission network and generates contextual quests. A planet you've investigated becomes a node in your personal trade network, a source of faction missions, a place where crew members have connections.

- Multiple factions create overlapping missions at investigated locations, intertwining goals
- Each faction/settlement must be unique enough that players form opinions about them — "I like this place" or "I avoid that station" should emerge naturally
- Exploration paired with creation and implicit sharing (player-generated content embedded in others' experiences) is more sustainable than exploration paired with combat

### The Ship as Home (Travel Context)

The ship is the constant across all travel. It serves as a psychological reset between the pressures of each destination.

- Returning to the ship after a station visit or planetary excursion should feel like coming home
- The ship must feel distinct from destinations — it's the player's space, not the game's space
- Between jumps, the keyframe simulation runs aboard the ship, making travel time into narrative time rather than dead time
- Home as reset: the ship is where meters can be actively managed (using modules), crew can be interacted with, and plans can be made

### Interplanetary Travel

- Moving between planets, stations, and other features within a system
- Lower-stakes movement; fewer meter ticks
- In-system travel is where the investigate phase primarily happens — arriving at a system and choosing which locations to visit

### Surface/Station Travel

- Player-character movement on planet surfaces and stations
- Drives local encounters and commerce
- Where most storylets fire
- This is the highest-density scale of travel — the most encounters per unit of movement

## Connections

- **Yarnball**: Each jump ticks meters; route length = accumulated pressure; density affects encounter frequency
- **Economy**: Trade routes are travel routes; distance affects profitability; path intersections create economic hubs
- **Ship**: Range limits travel options; fuel capacity constrains routes; keyframe simulation runs between jumps
- **QBN**: Location qualities gate storylet availability; path intersections create storylet density
- **Factions**: Faction territory defines travel character; faction paths contribute to world weaving

## Open Questions

- ~~Is interstellar travel deterministic or does it have random encounters?~~ **Resolved**: The keyframe simulation (see [Ship — Keyframe Ship Simulation](ship.md#keyframe-ship-simulation)) generates events deterministically from ship configuration, crew state, and resource levels. "Random" encounters use the QBN opportunity deck — a random draw from _qualifying_ storylets, so they're quality-gated, not purely random. A ship with a science lab draws from exploration storylets; a ship with high crew Loneliness draws from social-crisis storylets. The randomness is in _which_ qualifying storylet surfaces, not in what qualifies.
- How does the Beyond differ mechanically from Oikumene travel? (Lower density, fewer paths, but each location more unique — the uniqueness/coherence/gateway model applies differently. The link algorithm naturally produces sparser connectivity at cluster edges, which could map to Beyond regions.)
- Should the link algorithm be tuned for different region types? (e.g., denser rolls for Oikumene core, sparser for Beyond frontier)
- ~~What's the turn cadence? Free-form or time-gated?~~ Partially resolved: each jump is one turn that ticks meters and runs keyframe simulation. Within a system, movement is lower-stakes. The exact time model (real-time vs turn-based) remains open.
- ~~How do we make route planning itself interesting (not just A-B)?~~ Resolved: world weaving creates interesting routes by laying paths across the map. Route planning involves navigating path intersections, managing meter pressure over multi-jump routes, and balancing trade opportunities against crew needs and fuel constraints.
- How does implicit sharing work for exploration? Can one player's investigation of a location enrich another player's experience there?
- How do we prevent "strip-mining" of locations in an MMO context? (Perko notes open worlds are strip-mined by design)
- ~~How does density translate to text presentation concretely?~~ **Resolved**: Density maps to multiple text-layer signals:
  - **Opportunity deck size**: Dense locations draw from more qualifying storylets per turn; sparse locations present fewer, higher-weight encounters
  - **Chatter volume**: Dense ports have more NPC voices, overlapping conversations, busy job boards; sparse locations have silence, a single bartender, one ship at dock
  - **Option abundance**: Dense locations present longer lists of available actions (list presentation pattern); sparse locations use the deck pattern with fewer draws
  - **Emily Short's Five Elements** (see [QBN Engine — Five Elements](qbn-engine.md#emily-shorts-five-elements-location-atmosphere)): High Community + low Mundanity = bustling trade hub; high Isolation + high Wonder = mysterious frontier outpost

## Sources

- Perko, "Complicated" (2010-06-15) — uniqueness, coherence, gateways for procedural worlds
- Perko, "World Weaving" (2016-08-19) — path-based world generation
- Perko, "Density" (2014-07-11) — density as unified design axis
- Perko, "Investigative-Expansive Exploration" (2015-02-18) — investigate-and-expand pattern
- Perko, "Home, Home on the Lagrange" (2008-02-26) — ship as psychological reset
- Perko, "Open World Analysis" (2016-09-16) — fast travel critique, strip-mining
- Perko, "Exploration Needs Implicit Sharing" (2014-12-10) — exploration paired with creation
- Perko, "Glowing Open Worlds" (2017-03-06) — strip-mining vs constructive worlds
- `docs/research/2026-03-23_spaaace-far-trader-economy/synthesis.md` — route network topology, link algorithm, graph-hop distance model, cluster generation
- Traveller RPG — jump navigation model
- `docs/game-design/notes/spaaace/` — galaxy generation specs
- `docs/game-design/notes/setting/interstellar_travel_and_corridors.md`
- `docs/game-design/notes/setting/navigation_hazards_and_chokepoints.md`
- `docs/research/2026-03-23_perko-scifi-game-design/synthesis.md`

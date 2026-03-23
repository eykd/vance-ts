# Ship

> The ship as character: modules define your yarnball profile, cargo constrains your economy, range limits your travel.

## Overview

The ship is the player's primary expression of identity. Module choices don't just optimize stats — they define what kind of story you'll have. A ship with a full kitchen and robot companion tells a different story than one with a gym and crew quarters. The ship is where the yarnball lives.

## Core Design

### Module System

Modules are the mechanical heart of the ship-as-identity concept. Each module passively shapes the yarnball by reducing specific meter growth rates, and active use provides temporary boosts at resource cost.

- **Passive effects**: A kitchen module passively reduces hunger meter growth. A recreation module passively reduces boredom growth. The combination of installed modules defines the ship's "yarnball profile" — which meters stay manageable and which become chronic pressure points.
- **Active use**: Actively using a module (cooking a meal, running a workout) gives a temporary boost but costs resources (supplies, power, time). This creates moment-to-moment decisions layered on top of the strategic module selection.
- **Limited slots force meaningful tradeoffs**: You cannot install every module. A ship with a full galley and medbay but no recreation space tells the story of a crew that eats well and stays healthy but is bored out of their minds. These tradeoffs create divergent narratives the designer never explicitly wrote.
- **Module choices gate which storylets fire**: Ship configuration becomes a QBN quality. A ship with a science lab unlocks research storylets; one with a brig unlocks bounty hunting storylets.

### Resource Flow Declarations

From Perko's keyframe simulation concept: ship parts should declare their resource flows (inputs, outputs, consumption rates) as data, not behavior. This enables the game to simulate life aboard between jumps without full real-time simulation.

- Each module declares: what it consumes, what it produces, what meters it affects, and at what rates
- The keyframe simulation evaluates these declarations at each jump to determine what happened between stars
- This architecture scales to fleet-level simulation while preserving individual ship detail

### Keyframe Ship Simulation

The game simulates life aboard between jumps using keyframe snapshots rather than continuous real-time simulation. Module configuration determines what happens in those simulated moments.

- Between each jump, the simulation evaluates: which modules were active, what resources were consumed, how meters shifted, what crew interactions occurred
- Keyframe results become the raw material for storylets — "During the jump, your engineer and pilot got into an argument in the galley" fires because the galley module exists and both crew members' social meters were elevated
- This is where crew social dynamics primarily play out — inter-star quiet time is the stage

### Ship Economics (from spaaace prototype)

The Far Trader prototype provides concrete operating cost parameters that inform the mortgage pressure design:

- **Freight revenue**: Base rate of Cr 650 per displacement-ton per jump. A Free Trader with ~80 dtons of cargo capacity earns ~Cr 52,000 per single-jump full-load delivery. Multi-jump routes multiply this by distance but tie up capacity longer.
- **Fuel cost**: Cr 435 per displacement-ton of fuel (marked as a placeholder in the prototype — calibrate during playtesting). For a ship consuming ~20 dtons of fuel per jump, that's ~Cr 8,700 per jump.
- **Adjacent route bonus**: Routes of 1 hop pay a Cr 50 bonus per job on top of the rate formula, making short-haul runs slightly more competitive per ton. This encourages regular short-hop trading over speculative long-distance runs.

These numbers set the economic tension: a full cargo hold on a 1-jump route grosses ~Cr 52,000 against ~Cr 8,700 in fuel alone, leaving margin for mortgage, crew, and maintenance — but not comfortably. Players must optimize load factor (filling the hold) and route selection (high-BTN routes have more available freight) to stay solvent.

### Maintenance & Repair

Ship systems degrade with use and time. Maintenance is not a binary state but a continual pressure that shapes decisions.

- Repair requires resources, time, and sometimes specialized crew
- Neglected systems create escalating yarnball pressure — a degrading kitchen means hunger meter growth accelerates
- Challenges should exert continual pressure, not be flattened by upgrades. Even a fully upgraded ship demands ongoing maintenance that shapes planning decisions.
- Ship reclamation (repairing a damaged or salvaged ship) can be more compelling than building from scratch — it creates a relationship with the ship's history

### Upgrades & Construction Chains

Progression through expanding capability, not stat inflation. Construction chains create continuity and a sense of building toward something.

- Improve range, cargo capacity, defenses, crew quarters — each upgrade expands the possibility space rather than making numbers bigger
- Construction chains: early upgrades enable mid-game capabilities that enable late-game possibilities (mining equipment enables refining, refining enables manufacturing). Each step opens new options rather than just making existing ones easier.
- Iterative construction is the core loop — returning to the same challenge (a difficult trade route, a hostile region) with a better ship configuration. The challenge persists; the approach evolves.
- Ship progression = expanding where you can go and how you live, not outgrowing earlier content

### The Ship as Home

The ship must function as a psychological reset — a refuge from the dangers and pressures outside. This is essential for pacing.

- Home must be distinct from the main game. If the ship IS the game (like the house in The Sims), it loses its restorative function. The ship must feel like a refuge from the dangers outside it.
- Customizable: players should be able to personalize the ship beyond pure mechanical optimization
- Hub for all activity: the ship is where the player returns between excursions, reviews their situation, and plans next moves
- Ship interiors should follow set design principles (like Star Trek), not realistic architecture — each space should be designed for the interactions that happen there, not for spatial realism

### The Ship as Narrative Space

The ship's physical configuration generates narrative through the keyframe simulation. What modules you have determines what stories can happen between jumps.

- A ship with a kitchen generates cooking scenes and food-related crew interactions
- A ship with a common room generates social scenes; one without forces crew into isolated quarters
- The ship's history (repairs, modifications, journeys taken) accumulates as narrative texture
- Ship configuration is the primary mechanism by which the designer creates divergent player narratives without writing them

## Connections

- **Yarnball**: Modules shape the meter landscape; module resource flows are yarnball mechanics
- **Economy**: Cargo capacity constrains trade; maintenance is a money sink; construction chains tie into the economic loop
- **Travel**: Range limits routes; fuel capacity constrains journey length; keyframe simulation happens between jumps
- **Crew**: Crew quarters and social spaces affect crew morale; keyframe simulation is the stage for crew dynamics

## Open Questions

- How many module slots? What's the right constraint level? (Must be tight enough to force real tradeoffs but wide enough to allow distinct ship identities)
- Can modules be swapped freely or is reconfiguration costly? (Perko implies iterative construction, suggesting some friction is desirable)
- How does ship progression interact with the mortgage? The Far Trader base rate (Cr 650/dton/jump) and fuel cost (Cr 435/dton) provide a starting calibration point — does upgrading to a larger hull increase revenue faster than it increases mortgage payments?
- Should different ship hulls have different slot configurations? (Would create starting-archetype differentiation for ships, paralleling character archetypes)
- How does resource flow declaration work in a text-only interface? What level of detail is visible to the player vs simulated in the background?
- How do keyframe simulation results translate into text presentation? (What does the player see between jumps?)

## Sources

- Perko, "Space Survival Gameplay" (2019-06-18) — module/meter relationship, dossier system, yarnball concept
- Perko, "ScriptableObject" (2016-07-06) — keyframe ship simulation, resource flow declarations
- Perko, "Mission-Based Iteration vs Survival Mode" (2015-05-18) — continual pressure, iterative construction
- Perko, "Good/Bad Game Design Pt. 2" (2015-08-18) — construction chains, continuity
- Perko, "Home, Home on the Lagrange" (2008-02-26) — ship as psychological reset
- Perko, "Star Trek Interiors" (2014-07-31) — set design principles for ship spaces
- Perko, "Survival and the Compromised Base" (2014-04-28) — ship reclamation over building from scratch
- `docs/research/2026-03-23_spaaace-far-trader-economy/synthesis.md` — freight rate (Cr 650/dton/jump), fuel cost (Cr 435/dton), adjacent route bonus, volume-price relationship
- Traveller RPG — ship design and economics
- `docs/research/2026-03-23_perko-scifi-game-design/synthesis.md`

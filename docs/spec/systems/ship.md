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
- **Module condition cascades through the yarnball**: Each module has a Consequence-type condition quality (0–100) that degrades with use and time. Damaged modules provide reduced passive meter effects — a kitchen at 50% condition only halves Hunger growth instead of eliminating it. This is how combat and neglect create yarnball pressure without needing separate ship-level meters.

For the full module catalog (types, meter effects, narrative color) see [Yarnball — Ship Modules](yarnball.md#ship-modules).

### Resource Flow Declarations

From Perko's keyframe simulation concept: ship parts should declare their resource flows (inputs, outputs, consumption rates) as data, not behavior. This enables the game to simulate life aboard between jumps without full real-time simulation.

Each module is a data declaration with the following shape:

```typescript
interface ModuleDeclaration {
  id: string; // "kitchen-standard", "gym-basic"
  name: string; // "Standard Kitchen"
  tier: 'basic' | 'standard' | 'premium';
  condition: number; // 0-100, degrades over time
  slots: number; // How many hull slots it occupies (usually 1)

  // Resource flows
  passive: {
    consumes: ResourceRate[]; // e.g., [{resource: "Supplies", rate: 2, per: "jump"}]
    produces: ResourceRate[]; // e.g., [{resource: "Meals", rate: 1, per: "jump"}]
  };
  active: {
    consumes: ResourceRate[]; // Higher cost for temporary boost
    produces: ResourceRate[];
    cooldown: number; // Turns before active use available again
  };

  // Meter effects (scaled by condition%)
  meterEffects: MeterEffect[]; // [{meter: "Hunger", reduction: 0.9}] = 90% slower growth

  // Storylet gating
  tags: string[]; // ["cooking", "social", "food"] — gate storylets by module presence

  // Maintenance
  degradationRate: number; // Condition loss per jump
  repairCost: ResourceRate[]; // What it takes to restore condition
}
```

The key insight from Perko: "If I want to know how much power this reactor creates, just ask it." Modules are never instantiated as runtime objects — the keyframe simulation crawls through declarations, compiling resource balances and meter adjustments. This scales to fleet-level simulation (NPC ships use the same declarations) while preserving individual ship detail.

### Keyframe Ship Simulation

The game simulates life aboard between jumps using keyframe snapshots rather than continuous real-time simulation. The simulation is a pure function: given ship configuration + crew state + resource levels, it produces a deterministic next state plus a list of events that become storylet candidates.

#### Keyframe Algorithm (per jump)

1. **Tick meters**: For each crew member (including captain), apply base meter growth rates, modified by installed module passive effects scaled by module condition. A kitchen at 50% condition provides 50% of its rated Hunger reduction.

2. **Consume resources**: Deduct fuel (per engine declaration), supplies (per crew size + active module consumption), and any other per-jump costs. If a resource hits zero, flag resource-depletion events.

3. **Degrade modules**: Reduce each module's condition by its degradation rate. Modules below critical condition thresholds (e.g., 25%) emit warning events.

4. **Evaluate crew interactions**: For each pair of crew members sharing a module-enabled social space (common room, kitchen), check social meter states. High Loneliness + shared space = conversation event. High Boredom + shared rec space = activity event. Crew personality templates (see Crew spec) determine interaction tone.

5. **Compile event list**: All meter threshold crossings, resource depletions, module warnings, and crew interaction results become **candidate events** — passed to the QBN engine as quality state changes that may trigger storylets.

6. **Present results**: The Ravel VM evaluates compels and situations against the updated quality state. The opportunity deck draws from qualifying inter-jump storylets. The player sees the results as narrative vignettes: _"During the jump to Arcturus, Mara cooked an elaborate meal that lifted everyone's spirits. Jax spent the time brooding in his quarters."_

#### What the Player Sees

The keyframe results are not a spreadsheet — they're **narrated through prestoplot and crew chatter**. The player experiences between-jump time as a short sequence of narrative moments, not a simulation report:

- Crew chatter reveals meter state changes: "The food's getting stale" (Hunger rising), "I haven't talked to anyone in days" (Loneliness high)
- Module-generated events create scene vignettes: a kitchen generates cooking scenes, a gym generates workout scenes, a common room generates social scenes
- Resource warnings come through crew dialogue: the engineer reports fuel levels, the quartermaster flags supply concerns
- Module damage surfaces as observable effects: flickering lights (power module degraded), cold quarters (heating module failing)

The text-only medium is actually ideal for this — the keyframe produces narrative beats, and the player reads them as a story about life between stars.

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

- ~~How many module slots?~~ **Partially resolved**: Starting Free Trader has 4–5 slots; larger hulls 7–8. The constraint is that the starting ship must have fewer slots than modules the player wants. Exact counts per hull class TBD during playtesting.
- ~~Can modules be swapped freely or is reconfiguration costly?~~ **Resolved**: Module installation/removal requires a port visit and costs credits/time. No trivial mid-voyage swapping. This makes module configuration a strategic decision aligned with Perko's iterative construction principle.
- How does ship progression interact with the mortgage? Does upgrading to a larger hull increase revenue faster than it increases mortgage payments? (Needs economic simulation playtesting — the spaaace prototype's numbers provide a starting calibration point.)
- ~~Should different ship hulls have different slot configurations?~~ **Leaning yes**: Different hulls with distinct slot counts and slot types (some hulls have dedicated cargo bays vs. flexible module slots) would create ship-archetype differentiation paralleling character archetypes. A combat-oriented hull might have 2 weapon hardpoints + 3 module slots; a merchant hull might have 1 weapon hardpoint + 5 module slots + extra cargo. Needs design work.
- ~~How does resource flow declaration work in a text-only interface?~~ **Resolved**: Players don't see the data schema. Module effects are surfaced through crew chatter, narrative vignettes, and observable consequences. The simulation runs in the background; the player reads the story it produces.
- ~~How do keyframe simulation results translate into text presentation?~~ **Resolved**: Keyframe events become narrative vignettes rendered through prestoplot and crew chatter. See Keyframe Ship Simulation section above.

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

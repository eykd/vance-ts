# Yarnball

> Interlocking meters that generate emergent narrative through player tradeoffs.

## Overview

The yarnball is Craig Perko's metaphor for game systems that are "big, soft, messy challenges" — interlocking meters and modular systems that generate emergent narrative through player choices. Instead of binary pass/fail survival, the yarnball creates a web of competing pressures where managing one thread tightens another, and the resulting tradeoffs _are_ the story.

> "My goal is to turn survival into a yarnball. A soft, complicated challenge that interlaces with a lot of other things. I also want to make sure that it unfolds into a narrative according to the choices the player makes."
> — Perko, "Space Survival Gameplay" (2019-06-18)

**Key insight**: The designer doesn't write the narrative — the system does. Meters are not optimization targets. They are narrative generators.

## Core Design

### Meters

Meters are Meter-type qualities in QBN that tick upward over time and generate narrative pressure. They divide into two categories with different tick triggers and mitigation strategies.

#### Category 1: Crew Comfort Meters

Tick per jump. Reduced by ship modules. Apply to **all crew including the captain** (the captain is a special crew member, not a separate entity). Each crew member experiences these individually — a social crew member's Loneliness may rise faster than a loner's.

| Meter              | Tick Trigger | What Drives It Up                                 | Primary Mitigation          |
| ------------------ | ------------ | ------------------------------------------------- | --------------------------- |
| **Hunger**         | Per jump     | Time without adequate food; supply depletion      | Kitchen modules, port meals |
| **Filth**          | Per jump     | Time without hygiene facilities; cramped quarters | Hygiene modules, port stays |
| **Loneliness**     | Per jump     | Small crew, no social spaces, isolation           | Social modules, crew size   |
| **Claustrophobia** | Per jump     | Cramped ship, long voyages without planetfall     | Gym/rec modules, port stops |
| **Boredom**        | Per jump     | Routine, lack of stimulation, repetitive routes   | Media/rec modules, variety  |

#### Category 2: Faction/Social Meters

Tick from **actions**, not time. Reduced by dossier NPC hardpoints. Apply to the captain and individual crew members — a crew member with a criminal past carries their own Criminality that affects the whole ship.

| Meter           | Tick Trigger              | What Drives It Up                                               | Primary Mitigation            |
| --------------- | ------------------------- | --------------------------------------------------------------- | ----------------------------- |
| **Criminality** | Illegal actions observed  | Smuggling, piracy, black market trade, bribery                  | Lawyers (dossier hardpoint)   |
| **Distrust**    | Faction-offending actions | Betraying faction interests, trading with rivals, espionage     | Diplomats (dossier hardpoint) |
| **Disinterest** | Inactivity with a faction | Not engaging with faction missions, long absence from territory | Reporters/contacts (dossier)  |
| **Heat**        | Law enforcement attention | Repeated crimes in lawful space, witness reports, warrants      | Fences/fixers (dossier)       |

#### Meter Behavior (QBN Implementation)

All meters are Meter-type qualities with:

- **Autonomous tick rate**: Base rate per jump (comfort) or per action (faction/social), modified by modules and crew
- **Decay**: Some meters decay slowly when conditions improve (Loneliness drops when crew is large; Disinterest decays when actively running faction missions)
- **Tiers**: Named thresholds that gate different storylet pools (see Tiered Quality Potency in QBN Engine spec)
- **Ceiling behavior**: Meters that max out trigger **crisis storylets** — not game over, but forced narrative turning points. Max Hunger triggers rationing/mutiny storylets. Max Heat triggers arrest/flight storylets.

#### Crew-Level vs. Ship-Level Meters

Comfort meters exist on each crew member individually but are presented to the player as a **ship-level aggregate** with individual outliers highlighted through chatter. The captain sees "Crew morale is low" (aggregate) plus "Mara hasn't spoken to anyone in days" (individual outlier). This keeps the interface manageable while preserving individual crew personality.

Faction/social meters live on **individual crew members** and compound at the ship level. If your engineer is wanted (high Heat), the ship attracts attention even if the captain is clean. Crew faction qualities gate storylets for the whole ship — "does anyone aboard have Smugglers Rep >= 5?"

#### Reputation Rub-Off

Crew members' faction connections **gradually transfer to the captain** through acquired advancement. Working with a well-connected supercargo slowly builds the captain's own faction reputation. When that crew member departs, the captain retains the accumulated rub-off but loses access to the crew member's higher-tier connections. This makes crew retention meaningful — losing your Merchant Guild supercargo means losing tier-8 Guild access even though you keep the tier-3 reputation you built through their introductions.

### Ship Modules

Modules are the mechanical bridge between ship configuration and the yarnball. Each module passively reduces specific meter growth rates and can be actively used for temporary boosts at resource cost. Module **condition** (a per-module Consequence-type quality) degrades with use and time — a damaged module's passive reduction weakens, cascading pressure through the meters it manages.

#### Module Effects

Each module declares its effects as data (resource flow declarations — see Ship spec):

- **Passive effect**: Continuous meter reduction while installed and functional. A kitchen reduces Hunger growth by X% based on its tier and condition.
- **Active effect**: Temporary boost when the player or crew actively uses the module. Cooking a meal (active kitchen use) gives a larger Hunger reduction but consumes Supplies.
- **Condition degradation**: Module effectiveness scales with condition. A kitchen at 50% condition provides 50% of its rated Hunger reduction. This is how ship damage cascades through the yarnball — combat damages the kitchen, Hunger rises faster, crew complains about food, new storylets fire.

#### Module Catalog

Modules exist in tiers (basic → standard → premium) with increasing effectiveness and resource cost. Different modules that affect the same meter produce **different narrative** — this is the core of module-driven narrative emergence.

| Module              | Primary Meter Reduced        | Secondary Effect                     | Narrative Color                               |
| ------------------- | ---------------------------- | ------------------------------------ | --------------------------------------------- |
| **Kitchenette**     | Hunger (90% reduction)       | —                                    | Functional meals, routine                     |
| **Full Kitchen**    | Hunger (100% until food out) | Slight Boredom reduction             | Cooking as craft, crew meals as social events |
| **Hygiene Bay**     | Filth                        | —                                    | Clinical, efficient                           |
| **Gym**             | Claustrophobia, Boredom      | —                                    | Physical outlet, competitive crew             |
| **Media Console**   | Boredom                      | Slight Loneliness reduction          | Passive entertainment, shared viewing         |
| **Common Room**     | Loneliness                   | Slight Boredom reduction             | Social space, crew bonding, arguments         |
| **Robot Companion** | Loneliness                   | —                                    | Non-human companionship, solo captains        |
| **Medbay**          | — (no meter reduction)       | Heals Consequence qualities (injury) | Recovery arcs, crew care                      |
| **Science Lab**     | Boredom                      | Gates research storylets             | Intellectual stimulation, discovery           |
| **Brig**            | — (no meter reduction)       | Gates bounty hunting storylets       | Prisoner transport, moral tension             |
| **Cargo Expansion** | — (no meter reduction)       | More cargo capacity                  | Economic optimization at comfort cost         |

#### Slot System

Ships have a fixed number of module slots determined by hull class. **Slots are the primary constraint that forces meaningful tradeoffs.** A starting Free Trader might have 4-5 slots; a larger vessel 7-8. You cannot install everything — choosing cargo expansion over a common room means more profit but lonelier crew.

Module installation and removal requires a port visit and costs credits/time. This prevents trivial swapping and makes module configuration a strategic decision, not a per-voyage optimization.

Exact slot counts per hull class TBD during playtesting; the key design constraint is that the starting ship must have **fewer slots than modules the player wants**, forcing a genuine identity-defining choice.

### Narrative Emergence

The player's module choices define their story:

- Solo explorer who swaps gym for media console + robot companion = different narrative
- Full crew who replaces gym with video games + relies on social interaction = different narrative
- "We didn't write those narratives: we allow the challenges to be faced in a way that turns them into narratives."

#### How Meter States Trigger Storylets

Meters are Meter-type qualities in QBN. Storylets gate on meter tiers using tier predicates:

```yaml
situation "Desperate Foraging":
  when:
    - Hunger is "critical" # Tier predicate: Hunger >= 8
    - Location is "derelict"
  # Unlocks a high-hunger-only storylet with unique rewards
```

**Tier-based storylet pools**: Each meter tier unlocks a different storylet pool. This is the bidirectional pressure mechanism — low-tier meters produce comfort storylets, mid-tier produces tension storylets, high-tier produces crisis/opportunity storylets:

| Tier            | Range | Storylet Character                                          |
| --------------- | ----- | ----------------------------------------------------------- |
| **Comfortable** | 0–2   | Routine, low-stakes social scenes, background flavor        |
| **Managed**     | 3–5   | Mild tension, resource-management choices, crew grumbling   |
| **Stressed**    | 6–7   | Real tradeoffs, complication compels, desperate creativity  |
| **Critical**    | 8–10  | Crisis storylets with unique rewards, forced turning points |

**Cross-meter interactions**: The richest storylets gate on **combinations** of meter states. High Loneliness + High Boredom unlocks different storylets than High Loneliness alone. A Ravel storylet with multiple meter predicates is more specific (higher predicate score) and ranks above single-meter storylets, ensuring that complex emotional states produce tailored narratives.

**Module-mediated narrative**: The storylets that fire depend on which modules are installed, because modules determine which meters stay low and which climb. Two captains with identical routes but different module loadouts experience different storylets — the narrative divergence that Perko describes.

### Bidirectional Pressure (from FATE)

Every yarnball meter must generate **both** beneficial and complicating storylets. This is the compel economy applied to meters:

- **High hunger** doesn't just threaten starvation — it unlocks desperate-measures storylets (raid a derelict, negotiate with pirates for supplies, discover an edible alien species) that create memorable stories and grant rewards unavailable to well-fed captains
- **High loneliness** doesn't just debuff — it unlocks introspective storylets, discovery of hidden ship features, or unique encounters with strange entities that only visit solitary travelers
- **High boredom** unlocks creative mischief storylets, crew pranks, and experimental tinkering that can produce unexpected breakthroughs

The yarnball collapses if meters are purely negative. Players will simply optimize them away. Meters must be **narrative generators in both directions** — comfort produces one kind of story; deprivation produces another, equally interesting kind.

This is the key lesson from FATE's compel economy: setbacks must earn future advantages. In the yarnball, the advantage isn't meta-currency — it's access to storylets that only fire under pressure.

Source: [FATE research — bidirectional pressure](../../research/2026-03-23_fate-rpg-qbn-lessons/synthesis.md)

### Diegetic Pacing Rhythm

FATE uses fate points as a metagame pacing mechanism — depletion during action, recovery through accepting complications. The yarnball should achieve the same dramatic rhythm through **diegetic resource scarcity cycles**:

1. **Departure**: Resources full, meters low. Player chooses ambitious routes and risky jobs.
2. **Accumulation**: Meters rise over jumps. Resources deplete. Pressure builds.
3. **Crisis**: High meters unlock complication storylets. Accepting them provides relief (resources, meter reduction) at narrative cost.
4. **Resolution**: Dock at port. Spend money to reset meters. Sell cargo. Cycle restarts.

The rhythm should feel like a natural voyage arc, not a mechanical loop. Each cycle produces different stories because the player's quality state is different every time.

Source: FATE's fate point economy adapted as diegetic resource cycles

### The Dossier System

Faction rank grants a dossier — a set of NPC "hardpoints" that the player fills with faction-provided specialists. The dossier is the mechanical bridge between faction reputation and faction/social meter management.

#### Dossier Structure

Each faction tier unlocks a new hardpoint slot. The player chooses which specialist to assign from the faction's available roster. Dossier NPCs can belong to the captain **or to crew members** — a well-connected first mate may have their own dossier contacts that benefit the ship.

| Hardpoint Role       | Primary Meter Reduced  | Secondary Effect                                    |
| -------------------- | ---------------------- | --------------------------------------------------- |
| **Diplomat**         | Distrust               | Smooths inter-faction relations, opens negotiations |
| **Lawyer**           | Criminality            | Handles legal complications, reduces sentences      |
| **Fence/Fixer**      | Heat                   | Launders goods, obscures trail, bribes officials    |
| **Reporter/Contact** | Disinterest            | Keeps faction engaged, delivers intelligence        |
| **Quartermaster**    | Hunger (indirect)      | Improves supply logistics, finds cheap provisions   |
| **Informant**        | — (no meter reduction) | Provides advance warning, tips on opportunities     |

**Dossier NPCs as characters**: These are not abstract buffs. Each dossier NPC has personality, mood, and chatter (see Crew spec). A faction lawyer might complain about the captain's reckless smuggling. A diplomat may have their own agenda that complicates the captain's plans. Dossier NPCs generate their own storylets.

**Limited slots force tradeoffs**: Dossier slots are scarce (2-4 per faction tier). Choosing a lawyer over a fence means managing Criminality at the cost of ongoing Heat. Different configurations create different play experiences within the same faction alignment.

#### Faction-Specific Meter Curves

Each faction imposes culturally distinct meter behaviors. Operating within a faction's territory or under their patronage means living by their cultural rules — some meters easier, others harder.

| Faction Archetype           | Meter Advantage                                  | Meter Disadvantage                               | Cultural Logic                                         |
| --------------------------- | ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------------ |
| **Stoic/Academic**          | Never gains Disinterest                          | Bonus Distrust for selling science data          | Values sustained focus; guards knowledge jealously     |
| **Warrior/Honor**           | Never gains Criminality                          | Loses interest rapidly (fast Disinterest growth) | High tolerance for violence; demands constant action   |
| **Mercantile**              | Reduced economic pressure (cheaper fuel/docking) | Higher Loneliness growth                         | Transactional culture; prosperous but cold             |
| **Criminal/Underground**    | Never gains Heat                                 | Bonus Distrust with lawful factions              | Law enforcement looks the other way; rivals suspicious |
| **Diplomatic/Bureaucratic** | Reduced Distrust across all factions             | Higher Boredom growth                            | Red tape and protocol; stable but tedious              |

Design principles:

- Each faction makes some meters easier and others harder — **never universally better or worse**
- Meter curves should create genuine strategic decisions about where to operate
- The cultural logic should be legible to the player — they understand WHY through narrative, not stat screens
- Meter curves apply to anyone operating in faction space, not just members — visiting a warrior faction's port means their rules apply

## Genealogy

The yarnball concept developed over 14 years in Perko's writing. Two threads merged:

1. **Soft challenge** (2007→2015→2017): attrition-based, weathered-not-defeated, spectrum-not-binary
2. **Modular narrative divergence** (2005→2013→2016): functional customization that changes gameplay and stories

The 2018 breakthrough: The Sims provided the missing model — meters as narrative generators in a low-stress facility. Setbacks become personal narratives, not system failures.

Full genealogy: `docs/game-design/notes/yarnball_genealogy.md`

## Connections

- **QBN Engine**: Each meter is a quality; meter states gate storylets
- **Ship**: Module choices shape the meter landscape
- **Crew**: Crew composition affects social meters; crew needs add meter pressure
- **Travel**: Each jump ticks meters; route length = accumulated pressure
- **Factions**: Faction-specific meter curves make each faction feel different
- **Economy**: Resource scarcity (food, fuel) feeds meter pressure

## Open Questions

- ~~What's the right number of meters? Too few = shallow; too many = overwhelming~~ **Resolved**: 9 meters in two categories — 5 crew comfort (tick per jump, module-mitigated) + 4 faction/social (tick per action, dossier-mitigated). Ship condition is per-module qualities, not a separate meter category.
- ~~How do meters interact with multiplayer? (shared ship meters vs. personal meters)~~ **Resolved**: Comfort meters exist per crew member, presented as ship-level aggregate with individual outliers surfaced through chatter. Faction/social meters are per-individual and compound at ship level.
- ~~What's the meter ceiling? What happens when a meter maxes out?~~ **Resolved**: Max meters trigger crisis storylets — forced narrative turning points, not game over. Max Hunger = rationing/mutiny. Max Heat = arrest/flight.
- ~~How do we prevent optimal solutions from collapsing the yarnball?~~ → Answered by bidirectional pressure: optimal isn't "meters at zero" because high-meter storylets are uniquely valuable
- ~~Should meters have positive states too, or only negative pressure?~~ → Answered: meters generate both beneficial and complicating storylets across their full range
- What's the right balance of complication vs. reward storylets at each meter level? (Content authoring question — needs playtesting)
- How do we signal to players that high meters unlock unique content, not just punishment? (Crew chatter is the primary signal — crew should express excitement/curiosity at high meters, not just complaint)
- What are the exact tick rates per jump for each comfort meter? (Playtesting — needs to produce the departure→accumulation→crisis→resolution rhythm described in Diegetic Pacing Rhythm)
- How many dossier slots per faction tier? (Suggest 1 at tier 1, 2 at tier 3, 3 at tier 5 — playtest)
- How fast does reputation rub-off accumulate? (Must be slow enough that crew retention matters but fast enough that long-term crew feel like genuine mentors)

## Sources

- Perko, "Boiling the Yarnball" (2019-06-11) — concept debut
- Perko, "Space Survival Gameplay" (2019-06-18) — full application
- Perko, "The Sims vs Rimworld" (2018-01-09) — theoretical breakthrough
- Perko, "Basebuilding With People" (2015-02-23) — proto-yarnball
- `docs/game-design/notes/yarnball_genealogy.md` — full concept genealogy
- `docs/research/2026-03-23_perko-scifi-game-design/synthesis.md`
- `docs/research/2026-03-23_fate-rpg-qbn-lessons/synthesis.md` — bidirectional pressure, diegetic pacing

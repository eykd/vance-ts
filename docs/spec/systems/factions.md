# Factions

> Reputation, dossier hardpoints, and faction-specific meter curves that make each faction feel mechanically different.

## Overview

Factions are the social dimension of the yarnball. Each faction imposes culturally distinct meter behaviors and unlocks unique narrative spaces. Faction alignment isn't just a number — it's a mechanical identity that changes how the game plays.

## Core Design

### Reputation System

- Reputation as a quality in QBN, gating faction-specific storylets
- Actions visible to factions affect standing — NPCs judge observable actions, not inferred intentions. A captain who is seen smuggling loses reputation with law-abiding factions regardless of their motives.
- Reputation tiers function as threshold advancement gates: reaching a new tier unlocks new mission types, trade access, dossier slots, and faction-specific storylets
- Reputation changes should compile into aggregate world outcomes at MMO scale — if many players support a faction, that faction's influence grows in the shared world

### Dossier System

Faction rank grants a dossier — a set of NPC "hardpoints" that the player fills with faction-provided specialists. The dossier is the mechanical bridge between faction reputation and yarnball meter management.

- **Hardpoint types**: Each hardpoint slot accepts a specific role — diplomat, lawyer, fence, fixer, informant, quartermaster
- **NPC assignment**: As faction rank increases, new hardpoint slots unlock. The player chooses which NPCs to assign from the faction's available specialists.
- **Meter reduction**: Each dossier NPC reduces specific negative meters. A diplomat reduces distrust with other factions. A lawyer reduces criminality. A fence reduces heat from illegal trade. A quartermaster reduces supply-related meter growth.
- **Tradeoffs**: Dossier slots are limited. Choosing a lawyer over a fence means managing criminality at the cost of ongoing heat from smuggling. Different dossier configurations create different play experiences within the same faction.
- **Faction flavor**: Each faction offers different specialist types and combinations. A mercantile faction's dossier leans toward quartermasters and trade contacts; a military faction offers tactical advisors and intelligence operatives.
- **Dossier NPCs as characters**: These aren't abstract buffs. Dossier NPCs have personalities, moods, and chatter. A faction lawyer who is assigned to your dossier might complain about your crew's behavior or offer unsolicited advice about legal matters in the current system.

### Faction-Specific Meter Curves

Each faction imposes culturally distinct meter behaviors, creating mechanically different narrative spaces. Operating within a faction's territory or under their patronage means living by their cultural rules.

Concrete examples from Perko:

- **Stoic/academic faction** (Vulcan-like): Never generates disinterest meter growth — their culture values sustained focus. But selling science data to outsiders generates bonus distrust — they guard knowledge jealously. Operating in their space means never getting bored but walking on eggshells around information security.
- **Warrior/honor faction** (Klingon-like): Loses interest rapidly — their culture demands constant action. But never generates criminality — their society has a high tolerance for violence and rule-bending. Operating in their space means constant pressure to act but freedom from legal consequences.
- **Mercantile faction**: Could reduce economic meter pressure but increase social meters — their culture is transactional and lonely.

Design principles for faction meter curves:

- Each faction should make some meters easier to manage and others harder — never universally better or worse
- Faction meter curves should create genuine strategic decisions about where to operate and which faction to cultivate
- The cultural logic should be legible to the player — they should understand WHY a faction's meter curve works the way it does

### Faction NPCs

Faction NPCs serve as the human face of faction mechanics. They are the conduit through which the player experiences faction culture.

- Faction NPCs use dialogue templates shaped by their faction's cultural norms — same information, different delivery
- Faction NPCs appear at investigated locations, creating the human texture of faction presence
- Key faction NPCs may become recurring characters across multiple locations, creating personal relationships that embody faction dynamics
- Faction NPCs can become crew members, bringing their faction's meter curves and cultural quirks aboard the ship

### Faction Interactions

- Faction allegiances may conflict — improving standing with one faction may damage standing with a rival
- Player must navigate competing pressures from multiple factions
- Faction state as a world-level quality in QBN, affecting what storylets are available across the game
- Inter-faction dynamics create the political landscape that the player navigates — trade wars, territorial disputes, cultural clashes

## Connections

- **Yarnball**: Faction meter curves reshape the yarnball topology; dossier NPCs reduce specific meters
- **Economy**: Faction standing affects trade access and pricing; mercantile factions define trade networks
- **Crew**: Crew members have faction ties; faction NPCs can become crew; crew faction backgrounds affect faction interactions
- **QBN**: Faction reputation gates faction-specific storylets; faction meter curves change which storylets fire under pressure
- **Multiplayer**: Faction dynamics as shared world state; aggregate player actions shift faction influence
- **Character**: Faction reputation tiers as threshold advancement; faction affiliation as cultural identity

## Open Questions

- How many factions? What's the right number for meaningful choice? (Must be few enough that each feels mechanically distinct, many enough to create interesting conflicts. The Yarnball spec defines 5 archetypes — suggest 5-7 factions.)
- Can you be allied with multiple factions simultaneously? (Dossier slots from different factions would create interesting combinations but might dilute faction identity)
- How do factions interact with the Oikumene vs. Beyond divide? (Oikumene factions may be more structured with formal reputation systems; Beyond factions more informal)
- Are factions player-influenceable at the MMO level? (Aggregate player actions shifting faction borders, trade routes, and political dynamics)
- ~~How do dossier NPCs interact with the crew system? Are they separate from crew or do they occupy crew slots?~~ **Resolved**: Dossier NPCs are separate from crew — they don't occupy crew slots (the 4-7 crew cap is for active aboard-ship crew). Dossier NPCs are off-screen contacts accessed through faction channels. However, crew members can have their own dossier connections that benefit the ship — a well-connected first mate's faction contacts function like dossier hardpoints. See [Yarnball — Dossier System](../systems/yarnball.md#the-dossier-system) and [Crew — Crew as Quality Bearers](../systems/crew.md#crew-as-quality-bearers).
- What happens to dossier NPCs if faction reputation drops below the tier that unlocked them? (Suggest: contacts become "dormant" — they stop providing meter reduction but aren't permanently lost. Regaining the tier reactivates them. This avoids punitive spirals while making reputation loss meaningful.)
- How are faction meter curves communicated to the player before they commit to a faction? (The cultural logic should be discoverable through play — crew chatter from faction-aligned crew, NPC dialogue at faction ports, and observable behavior of NPCs all signal how the faction "feels" before the player sees hard numbers)

## Sources

- Perko, "Space Survival Gameplay" (2019-06-18) — dossier system, faction meter curves, hardpoint metaphor
- Perko, "Companions" (2014-06-09) — faction-templated dialogue, NPC personality
- Perko, "Limited Choice but Big Choices" (2007-05-16) — aggregate quest results at MMO scale
- Perko, "Growing NPCs" (2014-06-18) — observable action judgment for reputation
- `docs/game-design/notes/setting/key_factions_and_power_players.md`
- `docs/game-design/notes/setting/guilds_and_merchant_houses.md`
- `docs/game-design/notes/setting/diplomacy_and_interstellar_law.md`
- `docs/research/2026-03-23_perko-scifi-game-design/synthesis.md`
